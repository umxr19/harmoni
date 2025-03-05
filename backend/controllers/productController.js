const Product = require('../models/Product');
const { createProduct } = require('../utils/stripe');
const { uploadFile } = require('../utils/firebase');
const mongoose = require('mongoose');

/**
 * Get all products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    const products = await Product.find(filter)
      .select('-fileUrl') // Don't send the actual file URL
      .sort({ publishedDate: -1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get a single product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-fileUrl'); // Don't send the actual file URL
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create a new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const {
      title,
      description,
      price,
      category,
      featured
    } = req.body;
    
    // Validate required files
    if (!req.files || !req.files.ebook || !req.files.coverImage) {
      return res.status(400).json({
        success: false,
        error: 'Please upload both an eBook file and a cover image'
      });
    }
    
    const ebookFile = req.files.ebook;
    const coverImage = req.files.coverImage;
    const previewFile = req.files.preview || null;
    
    // Upload files to Firebase Storage
    const ebookPath = `ebooks/${Date.now()}-${ebookFile.name}`;
    const coverPath = `covers/${Date.now()}-${coverImage.name}`;
    
    await uploadFile(ebookFile.data, ebookPath, {
      contentType: ebookFile.mimetype
    });
    
    await uploadFile(coverImage.data, coverPath, {
      contentType: coverImage.mimetype
    });
    
    let previewPath = null;
    if (previewFile) {
      previewPath = `previews/${Date.now()}-${previewFile.name}`;
      await uploadFile(previewFile.data, previewPath, {
        contentType: previewFile.mimetype
      });
    }
    
    // Create product in database (without Stripe IDs initially)
    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      featured: featured === 'true',
      coverImage: `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${coverPath}`,
      fileUrl: ebookPath,
      previewUrl: previewPath ? `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${previewPath}` : null,
      stripeProductId: 'pending',
      stripePriceId: 'pending'
    });
    
    // Create product in Stripe
    const { productId, priceId } = await createProduct(product);
    
    // Update product with Stripe IDs
    product.stripeProductId = productId;
    product.stripePriceId = priceId;
    
    await product.save({ session });
    
    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating product:', error);
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  } finally {
    session.endSession();
  }
};

/**
 * Update a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      featured,
      isActive
    } = req.body;
    
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Update product fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (featured !== undefined) product.featured = featured === 'true';
    if (isActive !== undefined) product.isActive = isActive === 'true';
    
    // Handle file updates if provided
    if (req.files) {
      if (req.files.coverImage) {
        const coverImage = req.files.coverImage;
        const coverPath = `covers/${Date.now()}-${coverImage.name}`;
        
        await uploadFile(coverImage.data, coverPath, {
          contentType: coverImage.mimetype
        });
        
        product.coverImage = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${coverPath}`;
      }
      
      if (req.files.ebook) {
        const ebookFile = req.files.ebook;
        const ebookPath = `ebooks/${Date.now()}-${ebookFile.name}`;
        
        await uploadFile(ebookFile.data, ebookPath, {
          contentType: ebookFile.mimetype
        });
        
        product.fileUrl = ebookPath;
      }
      
      if (req.files.preview) {
        const previewFile = req.files.preview;
        const previewPath = `previews/${Date.now()}-${previewFile.name}`;
        
        await uploadFile(previewFile.data, previewPath, {
          contentType: previewFile.mimetype
        });
        
        product.previewUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${previewPath}`;
      }
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Instead of deleting, mark as inactive
    product.isActive = false;
    await product.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 