import api from './api';
import { mockProductService, Purchase } from './mockApi';
import logger from '../utils/logger';

// Use mock data in development mode
const USE_MOCK_DATA = import.meta.env.DEV || true; // Set to true to always use mock data during development

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  coverImage: string;
  previewUrl: string | null;
  featured: boolean;
  publishedDate: string;
  isActive: boolean;
  stripeProductId: string;
  stripePriceId: string;
  createdAt: string;
  updatedAt: string;
}

// Re-export the Purchase interface
export type { Purchase };

export interface DownloadLink {
  downloadUrl: string;
  expiresIn: string;
}

/**
 * Get all products
 * @param {Object} params - Query parameters
 * @returns {Promise<Product[]>} - List of products
 */
export const getProducts = async (params?: { category?: string; featured?: boolean }) => {
  try {
    if (USE_MOCK_DATA) {
      const response = await mockProductService.getProducts(params);
      return response.data.data;
    }
    
    const response = await api.get('/products', { params });
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get a single product
 * @param {string} id - Product ID
 * @returns {Promise<Product>} - Product details
 */
export const getProduct = async (id: string) => {
  try {
    if (USE_MOCK_DATA) {
      const response = await mockProductService.getProduct(id);
      return response.data.data;
    }
    
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    logger.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Create a checkout session
 * @param {string} productId - Product ID
 * @returns {Promise<{ sessionId: string; url: string }>} - Checkout session details
 */
export const createCheckout = async (productId: string) => {
  try {
    if (USE_MOCK_DATA) {
      const response = await mockProductService.createCheckout(productId);
      return response.data.data;
    }
    
    const response = await api.post('/purchases/checkout', { productId });
    return response.data.data;
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Verify a checkout session
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Purchase>} - Purchase details
 */
export const verifyCheckout = async (sessionId: string) => {
  try {
    if (USE_MOCK_DATA) {
      const response = await mockProductService.verifyCheckout(sessionId);
      return response.data.data;
    }
    
    const response = await api.get(`/purchases/verify/${sessionId}`);
    return response.data.data;
  } catch (error) {
    logger.error('Error verifying checkout:', error);
    throw error;
  }
};

/**
 * Get user's purchases
 * @returns {Promise<Purchase[]>} - List of purchases
 */
export const getUserPurchases = async () => {
  try {
    if (USE_MOCK_DATA) {
      const response = await mockProductService.getUserPurchases();
      return response.data.data;
    }
    
    const response = await api.get('/purchases/user');
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching user purchases:', error);
    throw error;
  }
};

/**
 * Get download link for a purchased product
 * @param {string} purchaseId - Purchase ID
 * @returns {Promise<DownloadLink>} - Download link details
 */
export const getDownloadLink = async (purchaseId: string) => {
  try {
    if (USE_MOCK_DATA) {
      const response = await mockProductService.getDownloadLink(purchaseId);
      return response.data.data;
    }
    
    const response = await api.get(`/purchases/download/${purchaseId}`);
    return response.data.data;
  } catch (error) {
    logger.error('Error getting download link:', error);
    throw error;
  }
}; 