const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { isAuth, isAdmin } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/webp' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    const filter = {};
    if (category && category !== 'All Categories') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    const products = await Product.find(filter)
      .select('-fileUrl') // Don't send the actual file URL in the response
      .sort({ createdAt: -1 });
      
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-fileUrl'); // Don't send the actual file URL
      
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', isAuth, isAdmin, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'productFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      featured,
      previewUrl,
      features
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (!req.files.coverImage || !req.files.productFile) {
      return res.status(400).json({ error: 'Cover image and product file are required' });
    }

    const coverImagePath = req.files.coverImage[0].path;
    const productFilePath = req.files.productFile[0].path;

    // Create new product
    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      featured: featured === 'true',
      coverImage: `/${coverImagePath.replace(/\\/g, '/')}`,
      fileUrl: `/${productFilePath.replace(/\\/g, '/')}`,
      previewUrl: previewUrl || null,
      features: features ? JSON.parse(features) : []
    });

    const savedProduct = await product.save();
    
    // Don't return the file URL in the response
    const productResponse = savedProduct.toObject();
    delete productResponse.fileUrl;
    
    res.status(201).json(productResponse);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', isAuth, isAdmin, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'productFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      featured,
      previewUrl,
      features
    } = req.body;

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (featured !== undefined) product.featured = featured === 'true';
    if (previewUrl !== undefined) product.previewUrl = previewUrl || null;
    if (features) product.features = JSON.parse(features);

    // Update files if provided
    if (req.files.coverImage) {
      // Delete old cover image if it exists
      if (product.coverImage) {
        const oldPath = path.join(__dirname, '..', product.coverImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      product.coverImage = `/${req.files.coverImage[0].path.replace(/\\/g, '/')}`;
    }

    if (req.files.productFile) {
      // Delete old product file if it exists
      if (product.fileUrl) {
        const oldPath = path.join(__dirname, '..', product.fileUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      product.fileUrl = `/${req.files.productFile[0].path.replace(/\\/g, '/')}`;
    }

    const updatedProduct = await product.save();
    
    // Don't return the file URL in the response
    const productResponse = updatedProduct.toObject();
    delete productResponse.fileUrl;
    
    res.json(productResponse);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated files
    if (product.coverImage) {
      const coverPath = path.join(__dirname, '..', product.coverImage);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    if (product.fileUrl) {
      const filePath = path.join(__dirname, '..', product.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await product.remove();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 