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
    updateOrderStatus: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { status, trackingId } = req.body;
            const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

            if (!validStatuses.includes(status)) {
                await session.abortTransaction();
                return handleError(res, 400, 'Invalid status value');
            }

            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status, trackingId },
                { new: true, session }
            ).populate('user');

            if (!order) {
                await session.abortTransaction();
                return handleError(res, 404, 'Order not found');
            }

            // Handle stock restoration
            if (['Cancelled', 'Returned'].includes(status)) {
                await restoreStock(order.items, session);
            }

            await session.commitTransaction();

            // Send status notifications
            sendStatusNotifications(order, status);

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
    const populatedOrder = await Order.findById(order._id).populate('user');
    const templates = {
        Shipped: {
            subject: 'Your Order Has Shipped!',
            template: 'orderShipped'
        },
        Delivered: {
            subject: 'Order Delivered - Leave a Review',
            template: 'orderDelivered'
        },
        Cancelled: {
            subject: 'Order Cancellation Notice',
            template: 'orderCancelled'
        },
        Returned: {
            subject: 'Order Return Processed',
            template: 'orderReturned'
        }
    };

    if (templates[status]) {
        await sendOrderNotifications(populatedOrder, populatedOrder.user);
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