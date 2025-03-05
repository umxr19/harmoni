const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const User = require('../models/User');
const { createCheckoutSession, retrieveSession, verifyWebhookSignature } = require('../utils/stripe');
const { getSignedUrl } = require('../utils/firebase');
const mongoose = require('mongoose');

/**
 * Create a checkout session for product purchase
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createCheckout = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or unavailable'
      });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user already purchased this product
    const existingPurchase = await Purchase.findOne({
      user: userId,
      product: productId,
      status: 'completed'
    });
    
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        error: 'You have already purchased this product'
      });
    }
    
    // Create Stripe customer if not exists
    if (!user.stripeCustomerId) {
      const customerId = await createCustomer(user);
      user.stripeCustomerId = customerId;
      await user.save();
    }
    
    // Create checkout session
    const session = await createCheckoutSession({
      priceId: product.stripePriceId,
      customerId: user.stripeCustomerId,
      productId: product._id.toString(),
      successUrl: `${process.env.FRONTEND_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL}/store/product/${product._id}`,
      metadata: {
        userId: user._id.toString()
      }
    });
    
    // Create pending purchase record
    const purchase = new Purchase({
      user: userId,
      product: productId,
      stripeSessionId: session.id,
      amount: product.price,
      status: 'pending'
    });
    
    await purchase.save();
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Verify a checkout session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyCheckout = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve session from Stripe
    const session = await retrieveSession(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }
    
    // Find and update purchase
    const purchase = await Purchase.findOne({ stripeSessionId: sessionId });
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase record not found'
      });
    }
    
    if (purchase.status === 'completed') {
      // Already processed
      return res.status(200).json({
        success: true,
        data: purchase
      });
    }
    
    // Update purchase status
    purchase.status = 'completed';
    purchase.stripePaymentIntentId = session.payment_intent.id;
    await purchase.save();
    
    // Add purchase to user's purchases
    await User.findByIdAndUpdate(purchase.user, {
      $addToSet: { purchases: purchase._id }
    });
    
    res.status(200).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('Error verifying checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Handle Stripe webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const event = verifyWebhookSignature(req.rawBody, signature);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        // Additional handling if needed
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

/**
 * Handle checkout.session.completed event
 * @param {Object} session - Stripe session object
 */
const handleCheckoutCompleted = async (session) => {
  try {
    // Find the purchase
    const purchase = await Purchase.findOne({ stripeSessionId: session.id });
    
    if (!purchase) {
      console.error(`Purchase not found for session ${session.id}`);
      return;
    }
    
    if (purchase.status === 'completed') {
      // Already processed
      return;
    }
    
    // Update purchase status
    purchase.status = 'completed';
    purchase.stripePaymentIntentId = session.payment_intent;
    await purchase.save();
    
    // Add purchase to user's purchases
    await User.findByIdAndUpdate(purchase.user, {
      $addToSet: { purchases: purchase._id }
    });
    
    console.log(`Purchase ${purchase._id} completed successfully`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
};

/**
 * Get user's purchases
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const purchases = await Purchase.find({
      user: userId,
      status: 'completed'
    })
      .populate('product', '-fileUrl')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get a download link for a purchased product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDownloadLink = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const userId = req.user.id;
    
    // Find the purchase
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      user: userId,
      status: 'completed'
    }).populate('product');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found or not completed'
      });
    }
    
    // Check if access has expired
    if (purchase.accessExpires && new Date() > purchase.accessExpires) {
      return res.status(403).json({
        success: false,
        error: 'Access to this product has expired'
      });
    }
    
    // Generate signed URL
    const signedUrl = await getSignedUrl(purchase.product.fileUrl, 30); // 30 minutes expiration
    
    // Update download count and last downloaded date
    purchase.downloadCount += 1;
    purchase.lastDownloaded = new Date();
    await purchase.save();
    
    res.status(200).json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        expiresIn: '30 minutes'
      }
    });
  } catch (error) {
    console.error('Error generating download link:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 