const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true
    },
    paymentIntentId: {
      type: String,
      required: true
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloaded: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index to ensure a user can only purchase a product once
purchaseSchema.index({ user: 1, product: 1 }, { unique: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase; 