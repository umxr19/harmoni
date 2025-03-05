const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe customer
 * @param {Object} user - User object
 * @returns {Promise<string>} - Stripe customer ID
 */
const createCustomer = async (user) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      metadata: {
        userId: user._id.toString()
      }
    });
    
    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

/**
 * Create a Stripe product
 * @param {Object} product - Product object
 * @returns {Promise<Object>} - Stripe product and price IDs
 */
const createProduct = async (product) => {
  try {
    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: product.title,
      description: product.description,
      images: [product.coverImage],
      metadata: {
        productId: product._id.toString()
      }
    });
    
    // Create Stripe price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(product.price * 100), // Convert to cents
      currency: 'gbp',
    });
    
    return {
      productId: stripeProduct.id,
      priceId: stripePrice.id
    };
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    throw error;
  }
};

/**
 * Create a checkout session
 * @param {Object} params - Session parameters
 * @returns {Promise<Object>} - Checkout session
 */
const createCheckoutSession = async ({ priceId, customerId, productId, successUrl, cancelUrl, metadata = {} }) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId,
        ...metadata
      }
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Retrieve a checkout session
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} - Checkout session
 */
const retrieveSession = async (sessionId) => {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer']
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

/**
 * Verify Stripe webhook signature
 * @param {string} payload - Request body
 * @param {string} signature - Stripe signature
 * @returns {Object} - Event object
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw error;
  }
};

module.exports = {
  stripe,
  createCustomer,
  createProduct,
  createCheckoutSession,
  retrieveSession,
  verifyWebhookSignature
}; 