// controllers/orderController.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { handleResponse, handleError } from '../utils/responseHandler.js';
import crypto from 'crypto';
import transporter from '../config/email.js';
import { sendWhatsAppOrderUpdate } from '../utils/sendWhatsAppMessage.js';

export const orderController = {
    // Create new order with transaction
    createOrder: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { items, shippingAddress, paymentMethod, couponCode } = req.body;
            const user = req.user;
            const isGuest = !user;

            // Validate required fields
            const requiredFields = ['fullName', 'address', 'city', 'postalCode', 'country', 'email', 'phone'];
            const missingFields = requiredFields.filter(field => !shippingAddress[field]);
            if (missingFields.length) {
                await session.abortTransaction();
                return handleError(res, 400, `Missing shipping fields: ${missingFields.join(', ')}`);
            }

            // Get shipping settings
            const settings = await Settings.findOne().session(session);
            const shippingCost = settings?.shippingFee || 0;

            // Process order items
            const [orderItems, subtotal] = await processOrderItems(items, session);

            // Handle coupon validation
            let coupon = null;
            if (couponCode) {
                if (isGuest) {
                    await session.abortTransaction();
                    return handleError(res, 401, 'Authentication required for coupon use');
                }
                coupon = await validateCoupon(couponCode, user._id, subtotal, orderItems, session);
                if (!coupon) {
                    await session.abortTransaction();
                    return; // Error already handled
                }
            }

            // Calculate totals
            const discount = coupon ? coupon.applyCoupon(subtotal) : 0;
            const totalAmount = calculateTotal(subtotal, shippingCost, discount);

            // Create order document
            const order = new Order({
                user: user?._id,
                items: orderItems,
                subtotal,
                shippingCost,
                discount,
                totalAmount,
                shippingAddress,
                paymentMethod,
                couponUsed: coupon?._id,
                status: 'Processing'
            });

            // Payment integration
            if (paymentMethod === 'PayFast') {
                order.paymentResult = generatePayfastPayload(order);
            }

            await order.save({ session });

            // Update coupon usage
            if (coupon) {
                await updateCouponUsage(coupon, user._id, session);
            }

            await session.commitTransaction();

            // Send notifications
            await sendOrderNotifications(order, user);

            handleResponse(res, 201, 'Order created successfully', order);

        } catch (error) {
            await session.abortTransaction();
            handleError(res, 500, error.message);
        } finally {
            session.endSession();
        }
    },

    // Get order by ID
    getOrderById: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id)
                .populate({
                    path: 'user',
                    select: 'name email phone'
                })
                .populate({
                    path: 'items.product',
                    select: 'name images priceOptions'
                })
                .populate({
                    path: 'couponUsed',
                    select: 'code discountType discountValue'
                });

            if (!order) return handleError(res, 404, 'Order not found');
            if (!authorizeOrderAccess(order, req.user)) return handleError(res, 403, 'Unauthorized');

            handleResponse(res, 200, 'Order retrieved', order);
        } catch (error) {
            handleError(res, 500, error.message);
        }
    },

    // Get user orders
    getUserOrders: async (req, res) => {
        try {
            const orders = await Order.find({ user: req.user._id })
                .sort('-createdAt')
                .populate('items.product', 'name images');

            handleResponse(res, 200, 'Orders retrieved', orders);
        } catch (error) {
            handleError(res, 500, error.message);
        }
    },

    // Get all orders (Admin)
    getAllOrders: async (req, res) => {
        try {
            const { page = 1, limit = 20, status } = req.query;
            const filter = status ? { status } : {};

            const [orders, count] = await Promise.all([
                Order.find(filter)
                    .limit(limit * 1)
                    .skip((page - 1) * limit)
                    .sort('-createdAt')
                    .populate('user', 'name email'),
                Order.countDocuments(filter)
            ]);

            handleResponse(res, 200, 'Orders retrieved', {
                orders,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        } catch (error) {
            handleError(res, 500, error.message);
        }
    },

    // Update order status (Admin)
    // Update order status (Admin)
    updateOrderStatus: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { status, trackingId } = req.body;

            // Validate status exists and is a string
            if (typeof status !== 'string') {
                await session.abortTransaction();
                return handleError(res, 400, 'Status is required and must be a string');
            }

            const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'returned'];
            const normalizedStatus = status.toLowerCase();

            if (!validStatuses.includes(normalizedStatus)) {
                await session.abortTransaction();
                return handleError(res, 400, 'Invalid status value');
            }

            // Validate tracking ID for shipped orders
            if (normalizedStatus === 'shipped') {
                if (typeof trackingId !== 'string' || !trackingId.trim()) {
                    await session.abortTransaction();
                    return handleError(res, 400, 'Tracking ID is required for shipped orders');
                }
            }

            // Format status correctly
            const formattedStatus = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

            const order = await Order.findByIdAndUpdate(
                req.params.id,
                {
                    status: formattedStatus,
                    trackingId: trackingId || undefined
                },
                { new: true, session }
            ).populate('user');

            if (!order) {
                await session.abortTransaction();
                return handleError(res, 404, 'Order not found');
            }

            // Handle stock restoration
            if (['cancelled', 'returned'].includes(normalizedStatus)) {
                await restoreStock(order.items, session);
            }

            await session.commitTransaction();

            // Send status notifications
            await sendStatusNotifications(order, formattedStatus);

            handleResponse(res, 200, 'Order status updated', order);
        } catch (error) {
            await session.abortTransaction();
            handleError(res, 500, error.message);
        } finally {
            session.endSession();
        }
    },

    // Handle PayFast notification
    handlePayfastNotification: async (req, res) => {
        try {
            const data = req.body;
            const signature = data.signature;

            delete data.signature;
            const isValid = verifyPayfastSignature(data, signature);

            if (!isValid) return res.status(400).send('Invalid signature');

            const order = await Order.findById(data.m_payment_id);
            if (!order) return res.status(404).send('Order not found');

            updateOrderFromPayment(order, data);
            await order.save();

            res.status(200).end();
        } catch (error) {
            res.status(500).send('Server error');
        }
    },

    // Get sales statistics (Admin)
    getSalesStats: async (req, res) => {
        try {
            const { startDate, endDate, period } = req.query;
            let matchStage = {};

            if (startDate && endDate) {
                matchStage.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (period) {
                const dateRange = getDateRange(period);
                matchStage.createdAt = dateRange;
            }

            const stats = await Order.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalSales: { $sum: "$subtotal" },
                        totalShipping: { $sum: "$shippingCost" },
                        totalDiscount: { $sum: "$discount" },
                        totalRevenue: { $sum: "$totalAmount" },
                        couponsUsed: {
                            $sum: {
                                $cond: [{ $ifNull: ["$couponUsed", false] }, 1, 0]
                            }
                        }
                    }
                }
            ]);

            const result = stats[0] || {
                totalOrders: 0,
                totalSales: 0,
                totalShipping: 0,
                totalDiscount: 0,
                totalRevenue: 0,
                couponsUsed: 0
            };

            handleResponse(res, 200, 'Sales stats retrieved', result);
        } catch (error) {
            handleError(res, 500, error.message);
        }
    }
};

// Helper Functions
const processOrderItems = async (items, session) => {
    let subtotal = 0;
    const orderItems = [];
    const stockUpdates = [];

    for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const priceOption = product.priceOptions.id(item.priceOptionId);
        if (!priceOption) throw new Error('Invalid price option');

        // Calculate required stock (1 quantity = 1 packet)
        const requiredStock = item.quantity;

        if (product.stock < requiredStock) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        // Update product stock
        product.stock -= requiredStock;
        stockUpdates.push(product.save({ session }));

        // Build order item
        orderItems.push({
            product: product._id,
            name: product.name,
            priceOption: {
                type: priceOption.type,
                weight: priceOption.weight,
                price: priceOption.salePrice || priceOption.price,
                salePrice: priceOption.salePrice
            },
            quantity: item.quantity,
            image: product.images[0]?.url
        });

        subtotal += (priceOption.salePrice || priceOption.price) * item.quantity;
    }

    await Promise.all(stockUpdates);
    return [orderItems, subtotal];
};

const validateCoupon = async (code, userId, subtotal, items, session) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
        .session(session)
        .populate('eligibleUsers eligibleProducts');

    if (!coupon) throw new Error('Invalid coupon code');

    // Validation checks
    const validations = [
        coupon.isActive,
        coupon.startAt <= Date.now(),
        coupon.expiresAt > Date.now(),
        coupon.usedCoupons < coupon.totalCoupons,
        subtotal >= coupon.minPurchase,
        coupon.maxPurchase ? subtotal <= coupon.maxPurchase : true,
        !coupon.eligibleUsers?.length || coupon.eligibleUsers.some(u => u._id.equals(userId)),
        !coupon.eligibleProducts?.length || items.some(item =>
            coupon.eligibleProducts.some(p => p._id.equals(item.product))
        )
    ];

    // Usage limits
    const userUsage = coupon.usedBy.find(u => u.userId.equals(userId));
    validations.push((userUsage?.timesUsed || 0) < coupon.maxUsesPerUser);

    if (!validations.every(v => v)) throw new Error('Coupon validation failed');
    return coupon;
};

const updateCouponUsage = async (coupon, userId, session) => {
    coupon.usedCoupons += 1;

    const userUsage = coupon.usedBy.find(u => u.userId.equals(userId));
    if (userUsage) {
        userUsage.timesUsed += 1;
    } else {
        coupon.usedBy.push({ userId, timesUsed: 1 });
    }

    await coupon.save({ session });
};

const calculateTotal = (subtotal, shipping, discount) => {
    return Math.max(0, (subtotal - discount) + shipping);
};

const restoreStock = async (items, session) => {
    const bulkOps = items.map(item => ({
        updateOne: {
            filter: { _id: item.product },
            update: {
                $inc: {
                    stock: item.quantity
                }
            }
        }
    }));

    await Product.bulkWrite(bulkOps, { session });
};

const sendOrderNotifications = async (order, user) => {
    const contactInfo = user ? {
        email: user.email,
        phone: user.phone,
        verificationMethod: user.verificationMethod
    } : order.shippingAddress;

    // Email notification
    if (contactInfo.email) {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: contactInfo.email,
            subject: 'Order Confirmation',
            html: generateOrderEmail(order)
        });
    }

    // WhatsApp for phone-verified users
    if (user?.verificationMethod === 'phone' && contactInfo.phone) {
        await sendWhatsAppOrderUpdate(
            contactInfo.phone,
            'order_confirmation',
            {
                orderId: order._id.toString(),
                totalAmount: order.totalAmount,
                trackingLink: order.trackingId ? `${process.env.TRACKING_BASE_URL}/${order.trackingId}` : 'N/A'
            }
        );
    }
};

const sendStatusNotifications = async (order, status) => {
    try {
        const populatedOrder = await Order.findById(order._id).populate('user');
        const templates = {
            Shipped: {
                subject: 'Your Order Has Shipped!',
                template: generateStatusEmail(populatedOrder, 'Shipped')
            },
            Delivered: {
                subject: 'Order Delivered - Leave a Review',
                template: generateStatusEmail(populatedOrder, 'Delivered')
            },
            Cancelled: {
                subject: 'Order Cancellation Notice',
                template: generateStatusEmail(populatedOrder, 'Cancelled')
            },
            Returned: {
                subject: 'Order Return Processed',
                template: generateStatusEmail(populatedOrder, 'Returned')
            }
        };

        if (templates[status]) {
            const contactInfo = populatedOrder.user ? {
                email: populatedOrder.user.email,
                phone: populatedOrder.user.phone
            } : populatedOrder.shippingAddress;

            // Send email notification
            if (contactInfo.email) {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: contactInfo.email,
                    subject: templates[status].subject,
                    html: templates[status].template
                });
            }

            // Send WhatsApp notification
            if (contactInfo.phone && populatedOrder.user?.verificationMethod === 'phone') {
                await sendWhatsAppOrderUpdate(
                    contactInfo.phone,
                    'status_update',
                    {
                        orderId: populatedOrder._id.toString(),
                        status: populatedOrder.status,
                        trackingLink: populatedOrder.trackingId ?
                            `${process.env.TRACKING_BASE_URL}/${populatedOrder.trackingId}` : 'N/A'
                    }
                );
            }
        }
    } catch (error) {
        console.error('Error sending status notifications:', error);
    }
};

const authorizeOrderAccess = (order, user) => {
    return order.user?.equals(user._id) || user.role === 'admin';
};

const generatePayfastPayload = (order) => {
    const params = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY,
        return_url: process.env.PAYFAST_RETURN_URL,
        cancel_url: process.env.PAYFAST_CANCEL_URL,
        notify_url: process.env.PAYFAST_NOTIFY_URL,
        m_payment_id: order._id.toString(),
        amount: order.totalAmount.toFixed(2),
        item_name: `Order #${order._id}`
    };

    if (process.env.PAYFAST_PASSPHRASE) {
        params.passphrase = process.env.PAYFAST_PASSPHRASE;
    }

    const signatureString = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    params.signature = crypto.createHash('md5')
        .update(signatureString)
        .digest('hex');

    return {
        redirectUrl: `${process.env.PAYFAST_URL}?${new URLSearchParams(params)}`,
        status: 'pending'
    };
};

const verifyPayfastSignature = (data, receivedSignature) => {
    let signatureString = Object.keys(data)
        .sort()
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');

    if (process.env.PAYFAST_PASSPHRASE) {
        signatureString += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE)}`;
    }

    const expectedSignature = crypto
        .createHash('md5')
        .update(signatureString)
        .digest('hex');

    return expectedSignature === receivedSignature;
};

const updateOrderFromPayment = (order, data) => {
    order.paymentResult = {
        id: data.pf_payment_id,
        status: data.payment_status,
        update_time: new Date().toISOString(),
        rawData: data
    };

    if (data.payment_status === 'COMPLETE') {
        order.status = 'Processing';
    } else if (data.payment_status === 'FAILED') {
        order.status = 'Cancelled';
    }
};

const getDateRange = (period) => {
    const now = new Date();
    let start;

    switch (period.toLowerCase()) {
        case 'week':
            start = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            start = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            start = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            start = new Date(0);
    }

    return { $gte: start, $lte: new Date() };
};

const generateOrderEmail = (order) => `
    <div style="max-width: 600px; margin: 20px auto; padding: 20px;">
        <h2>Order Confirmation #${order._id}</h2>
        <p>Thank you for your order! Here are your order details:</p>
        
 <h3>Order Status: ${order.status}</h3>
    
    ${order.trackingId ? `
      <h3>Tracking Information</h3>
      <p>Tracking ID: ${order.trackingId}</p>
    ` : ''}
    
        <h3>Shipping Address</h3>
        <p>${Object.values(order.shippingAddress).filter(Boolean).join(', ')}</p>
        
        <h3>Order Items</h3>
        <ul>
            ${order.items.map(item => `
                <li>
                    ${item.name} - 
                    ${item.quantity} packets
                    @ Rs${item.priceOption.price}
                </li>
            `).join('')}
        </ul>
        
        <h3>Total: Rs${order.totalAmount}</h3>
        <p>Payment Method: ${order.paymentMethod}</p>
    </div>
`;

const generateStatusEmail = (order, status) => {
    const statusInfo = {
        Processing: {
            title: "Order Processing",
            message: "We've received your order and are preparing it for shipment.",
            color: "#3498db"
        },
        Shipped: {
            title: "Order Shipped!",
            message: "Your order is on its way to you!",
            color: "#2ecc71"
        },
        Delivered: {
            title: "Order Delivered",
            message: "Your order has been successfully delivered.",
            color: "#27ae60"
        },
        Cancelled: {
            title: "Order Cancelled",
            message: "Your order has been cancelled as requested.",
            color: "#e74c3c"
        },
        Returned: {
            title: "Return Processed",
            message: "We've received your returned items.",
            color: "#f39c12"
        }
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: ${statusInfo[status].color};
            padding: 30px 20px;
            text-align: center;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .container {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .content {
            padding: 30px;
            background-color: #ffffff;
        }
        .order-info {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .order-info p {
            margin: 8px 0;
        }
        .tracking-info {
            background-color: #f0f7ff;
            padding: 20px;
            border-radius: 6px;
            margin: 25px 0;
            border-left: 4px solid ${statusInfo[status].color};
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${statusInfo[status].color};
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            margin-top: 15px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #eee;
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .item-table th {
            text-align: left;
            padding: 10px;
            background-color: #f5f5f5;
            border-bottom: 2px solid #ddd;
        }
        .item-table td {
            padding: 15px 10px;
            border-bottom: 1px solid #eee;
        }
        .item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${statusInfo[status].title}</h1>
        </div>
        
        <div class="content">
            <p>Dear ${order.shippingAddress.fullName},</p>
            <p>${statusInfo[status].message}</p>
            
            <div class="order-info">
                <p><strong>Order Number:</strong> #${order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span style="color: ${statusInfo[status].color}; font-weight: 600">${status}</span></p>
            </div>
            
            ${status === 'Shipped' && order.trackingId ? `
            <div class="tracking-info">
                <h3 style="margin-top: 0">Tracking Information</h3>
                <p><strong>Tracking Number:</strong> ${order.trackingId}</p>
                ${process.env.TRACKING_BASE_URL ? `
                <a href="${process.env.TRACKING_BASE_URL}/${order.trackingId}" class="button">Track Your Package</a>
                ` : ''}
            </div>
            ` : ''}
            
            <h3 style="margin-bottom: 15px">Order Summary</h3>
            <table class="item-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px; padding-right:10px;">
                                ${item.image ? `<img src="${item.image}" class="item-image" alt="${item.name}">` : ''}
                                <div style="padding-left:10px;">
                                    <div style="font-weight: 600">${item.name}</div>
                                    <div style="font-size: 12px; color: #777">
                                        ${item.priceOption.type === 'weight-based' ?
            `${item.priceOption.weight}g` : 'Packet'}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>${item.quantity}</td>
                        <td>Rs${(item.priceOption.salePrice || item.priceOption.price).toFixed(2)}</td>
                        <td>Rs${(item.quantity * (item.priceOption.salePrice || item.priceOption.price)).toFixed(2)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px">
                <p><strong>Subtotal:</strong> Rs${order.subtotal.toFixed(2)}</p>
                <p><strong>Shipping:</strong> Rs${order.shippingCost.toFixed(2)}</p>
                ${order.discount > 0 ? `<p><strong>Discount:</strong> -Rs${order.discount.toFixed(2)}</p>` : ''}
                <p style="font-size: 18px; font-weight: 600; margin-top: 10px">
                    <strong>Total:</strong> Rs${order.totalAmount.toFixed(2)}
                </p>
            </div>
            
            <div style="margin-top: 30px">
                <h3>Shipping Address</h3>
                <p>${order.shippingAddress.fullName}</p>
                <p>${order.shippingAddress.address}</p>
                <p>${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
                <p>${order.shippingAddress.country}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact our support team at support@yourstore.com</p>
            <p>© ${new Date().getFullYear()} Your Store Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};