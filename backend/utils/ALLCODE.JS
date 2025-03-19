import session from 'express-session';
import transporter from './config/email.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middlewares/error.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import { sendContactEmail } from './controllers/contactController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ],

};

app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
}));

// Example route to set a cookie
app.get('/set-cookie', (req, res) => {
    res.cookie('exampleCookie', 'cookieValue', {
        httpOnly: true,
        secure: false, // Set to false for development
        sameSite: 'Lax', // Set to Lax for development
    });
    res.send('Cookie set');
});

app.get('/', (req, res) => {
    res.send('CORS is configured correctly.');
});

// Serve static files (images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.post('/api/send-email', sendContactEmail);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

app.get('/api/test-email', async (req, res) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: 'alyhusnaiin@gmail.com',
            subject: 'Test Email',
            text: 'This is a working test email',
        });
        res.send('✅ Test email sent successfully');
    } catch (error) {
        console.error('❌ Email error:', error);
        res.status(500).send('❌ Email sending failed');
    }
});

// Error Handling Middleware
app.use(errorHandler);

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});  import mongoose from 'mongoose';

const priceOptionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['packet', 'weight-based'], // Defines if it's a fixed packet price or per specific weight
        required: true
    },
    weight: {
        type: Number, // Weight in grams (e.g., 100, 500)
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    salePrice: {
        type: Number,
        min: 0,
        default: null
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    slug: String,
    priceOptions: [priceOptionSchema], // Array of packet or weight-based pricing
    sale: {
        type: Number,
        min: 0,
        default: null
    } // Global sale on product
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate reviews
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product'
});

// Create a text index on the 'name' and 'description' fields for search functionality
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
import express from 'express';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';
import { protect, admin } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, admin, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
import express from 'express';
import {
    getAllProducts,
    searchProducts,
    getProductById,
    getRecentProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategories
} from '../controllers/productController.js';
import { protect, admin } from '../middlewares/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/recent', getRecentProducts);
router.get('/by-categories', getProductsByCategories);

router.get('/search', searchProducts);
router.get('/:id', getProductById);

router.post(
    '/',
    protect,
    admin,
    upload, // Handle image uploads
    createProduct
);
router.put(
    '/:id',
    protect,
    admin,
    upload, // Handle image updates
    updateProduct
);
router.delete('/:id', protect, admin, deleteProduct);

export default router;import Category from '../models/category.js';

// CREATE a new category (Admin only)
export const createCategory = async (req, res) => {
    console.log(req.body);
    try {
        const { name, description, isActive } = req.body;
        const category = new Category({ name, description, isActive });
        await category.save();
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// READ all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ a single category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE a category (Admin only)
export const updateCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, isActive },
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category updated successfully', category });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE a category (Admin only)
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
import Product from '../models/Product.js';
import { handleResponse, handleError } from '../utils/responseHandler.js';
import APIFeatures from '../utils/apiFeatures.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
    try {
        const features = new APIFeatures(Product.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const products = await features.query;
        const total = await Product.countDocuments(features.filterQuery);

        handleResponse(res, 200, 'Products retrieved successfully', {
            products,
            total,
            results: products.length,
            currentPage: features.page,
            totalPages: Math.ceil(total / features.limit)
        });

    } catch (error) {
        handleError(res, 500, error.message);
    }
};

// @desc    Get recent 6 products
// @route   GET /api/products/recent
// @access  Public
export const getRecentProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).limit(6);
        handleResponse(res, 200, 'Recent products retrieved successfully', products);
    } catch (error) {
        handleError(res, 500, error.message);
    }
};

// @desc    Get products by categories
// @route   GET /api/products/by-categories
// @access  Public
export const getProductsByCategories = async (req, res) => {
    try {
        const { categories } = req.query;
        if (!categories) return handleError(res, 400, 'Categories query required');

        const categoryList = categories.split(',');
        const products = await Product.find({ categories: { $in: categoryList } });

        // Shuffle and select 5 unique products
        const shuffled = products.sort(() => 0.5 - Math.random());
        handleResponse(res, 200, 'Products by categories retrieved successfully', shuffled.slice(0, 5));

    } catch (error) {
        handleError(res, 500, error.message);
    }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return handleError(res, 400, 'Search query required');

        const products = await Product.find({
            $text: { $search: q },
            stock: { $gt: 0 }
        }, {
            score: { $meta: "textScore" }
        }).sort({ score: { $meta: "textScore" } });

        handleResponse(res, 200, 'Search results', products);

    } catch (error) {
        handleError(res, 500, error.message);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'reviews',
                select: 'rating comment user createdAt',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'user', select: 'name' }
            })
            .populate({ path: 'categories', select: 'name' });

        if (!product) return handleError(res, 404, 'Product not found');

        handleResponse(res, 200, 'Product details retrieved', product);

    } catch (error) {
        error.name === 'CastError'
            ? handleError(res, 400, 'Invalid product ID')
            : handleError(res, 500, error.message);
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {
    try {
        const { name, description, categories, stock, priceOptions, sale } = req.body;

        // Validation
        if (!name || !description || !categories || !stock || !priceOptions) {
            return handleError(res, 400, "Missing required fields");
        }

        if (!Array.isArray(priceOptions) || priceOptions.length === 0) {
            return handleError(res, 400, "Invalid price options");
        }

        for (const option of priceOptions) {
            if (!['packet', 'weight-based'].includes(option.type)) {
                return handleError(res, 400, "Invalid price option type");
            }
            if (option.weight <= 0 || option.price < 0) {
                return handleError(res, 400, "Invalid weight or price values");
            }
        }

        // Image handling
        if (!req.files?.length) {
            return handleError(res, 400, "At least one image required");
        }

        const images = req.files.map(file => ({
            public_id: file.filename,
            url: file.path
        }));

        // Check for existing product
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            await cleanupImages(images);
            return handleError(res, 400, "Product name exists");
        }

        // Create product
        const product = await Product.create({
            name,
            slug: name.toLowerCase().replace(/ /g, "-"),
            description,
            categories: Array.isArray(categories) ? categories : categories.split(','),
            stock,
            priceOptions: priceOptions.map(option => ({
                type: option.type,
                weight: option.weight,
                price: option.price,
                salePrice: option.salePrice || null
            })),
            sale: sale || null,
            images
        });

        handleResponse(res, 201, "Product created", product);

    } catch (error) {
        if (req.files?.length) {
            await cleanupImages(req.files.map(f => ({ public_id: f.filename })));
        }
        handleError(res, 500, "Server error");
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return handleError(res, 404, 'Product not found');

        // Handle images
        if (req.files?.length) {
            const newImages = req.files.map(file => ({
                public_id: file.public_id,
                url: file.secure_url
            }));
            product.images = [...product.images, ...newImages];
        }

        if (req.body.imagesToDelete) {
            await handleImageDeletions(req.body.imagesToDelete, product);
        }

        // Process updates
        const updates = processUpdates(req.body);
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        handleResponse(res, 200, 'Product updated', updatedProduct);

    } catch (error) {
        if (req.files?.length) {
            await cleanupImages(req.files.map(f => ({ public_id: f.public_id })));
        }
        handleValidationError(error, res);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return handleError(res, 404, 'Product not found');

        await Promise.all(
            product.images.map(img => deleteFromCloudinary(img.public_id))
        );

        await product.deleteOne();
        handleResponse(res, 200, 'Product deleted');

    } catch (error) {
        error.name === 'CastError'
            ? handleError(res, 400, 'Invalid product ID')
            : handleError(res, 500, error.message);
    }
};

// Helper functions
const processUpdates = (body) => {
    const updates = Object.keys(body)
        .filter(key => !['imagesToDelete'].includes(key))
        .reduce((acc, key) => {
            acc[key] = body[key];
            return acc;
        }, {});

    if (updates.name) {
        updates.slug = updates.name.toLowerCase().replace(/ /g, '-');
    }

    if (updates.categories) {
        updates.categories = Array.isArray(updates.categories)
            ? updates.categories
            : updates.categories.split(',');
    }

    if (updates.priceOptions) {
        updates.priceOptions = updates.priceOptions.map(option => ({
            type: option.type,
            weight: option.weight,
            price: option.price,
            salePrice: option.salePrice || null
        }));
    }

    return updates;
};

const handleImageDeletions = async (imagesToDelete, product) => {
    await Promise.all(
        imagesToDelete.map(async publicId => {
            await deleteFromCloudinary(publicId);
            product.images = product.images.filter(img => img.public_id !== publicId);
        })
    );
};

const cleanupImages = async (images) => {
    await Promise.all(
        images.map(img => deleteFromCloudinary(img.public_id))
    );
};

const handleValidationError = (error, res) => {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return handleError(res, 400, messages.join(', '));
    }
    handleError(res, 500, error.message);
};