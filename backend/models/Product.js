const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required']
    },
    fileUrl: {
      type: String,
      required: [true, 'Product file is required']
    },
    previewUrl: {
      type: String,
      default: null
    },
    featured: {
      type: Boolean,
      default: false
    },
    features: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Create a text index for search functionality
productSchema.index({ title: 'text', description: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 
 