const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const { isAuth } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// @route   POST /api/purchases/create-checkout
// @desc    Create a Stripe checkout session
// @access  Private
router.post('/create-checkout', isAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: product.title,
              description: product.description.substring(0, 255), // Stripe limits description length
              images: [product.coverImage ? `${req.protocol}://${req.get('host')}${product.coverImage}` : null],
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents/pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: product._id.toString(),
        userId: req.user._id.toString(),
      },
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/product/${product._id}`,
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// @route   GET /api/purchases/verify/:sessionId
// @desc    Verify a purchase after successful checkout
// @access  Private
router.get('/verify/:sessionId', isAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    const { productId, userId } = session.metadata;
    
    // Verify that the user making the request is the same who made the purchase
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if purchase already exists to avoid duplicates
    const existingPurchase = await Purchase.findOne({
      user: userId,
      product: productId,
      stripeSessionId: sessionId
    });
    
    if (existingPurchase) {
      return res.json(existingPurchase);
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Create a new purchase record
    const purchase = new Purchase({
      user: userId,
      product: productId,
      amount: session.amount_total / 100, // Convert from cents/pence back to pounds
      stripeSessionId: sessionId,
      paymentIntentId: session.payment_intent,
      downloadCount: 0
    });
    
    await purchase.save();
    
    // Populate product details for the response
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate({
        path: 'product',
        select: '-fileUrl' // Don't include the file URL
      });
    
    res.json(populatedPurchase);
  } catch (error) {
    console.error('Error verifying purchase:', error);
    res.status(500).json({ error: 'Failed to verify purchase' });
  }
});

// @route   GET /api/purchases
// @desc    Get all purchases for the logged-in user
// @access  Private
router.get('/', isAuth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id })
      .populate({
        path: 'product',
        select: '-fileUrl' // Don't include the file URL
      })
      .sort({ createdAt: -1 });
    
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// @route   GET /api/purchases/:id/download
// @desc    Get a download link for a purchased product
// @access  Private
router.get('/:id/download', isAuth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    // Verify that the user making the request is the same who made the purchase
    if (purchase.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const product = await Product.findById(purchase.product);
    
    if (!product || !product.fileUrl) {
      return res.status(404).json({ error: 'Product file not found' });
    }
    
    // Generate a signed URL that expires after a short time
    // For simplicity, we're just returning the file path here
    // In a production environment, you would use a more secure method
    // such as signed URLs from a cloud storage provider
    const downloadUrl = `${req.protocol}://${req.get('host')}${product.fileUrl}`;
    
    // Update download count
    purchase.downloadCount += 1;
    purchase.lastDownloaded = new Date();
    await purchase.save();
    
    res.json({ downloadUrl });
  } catch (error) {
    console.error('Error generating download link:', error);
    res.status(500).json({ error: 'Failed to generate download link' });
  }
});

// @route   POST /api/purchases/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const { productId, userId } = session.metadata;
      
      // Check if purchase already exists
      const existingPurchase = await Purchase.findOne({
        user: userId,
        product: productId,
        stripeSessionId: session.id
      });
      
      if (existingPurchase) {
        return res.json({ received: true });
      }
      
      // Create a new purchase record
      const purchase = new Purchase({
        user: userId,
        product: productId,
        amount: session.amount_total / 100,
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent,
        downloadCount: 0
      });
      
      await purchase.save();
      
      console.log(`Purchase recorded for user ${userId}, product ${productId}`);
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }
  
  res.json({ received: true });
});

module.exports = router; 