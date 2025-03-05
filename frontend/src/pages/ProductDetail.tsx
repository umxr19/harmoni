import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import type { Product } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProductDetail.css';
import logger from '../utils/logger';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const response = await productService.getProduct(id);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        logger.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/store/product/${id}` } });
      return;
    }

    if (!product) return;

    try {
      setCheckoutLoading(true);
      setCheckoutError(null);
      
      const response = await productService.createCheckout(product._id);
      const { url } = response.data;
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      logger.error('Error creating checkout session:', err);
      setCheckoutError('Failed to initiate checkout. Please try again later.');
      setCheckoutLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-message">
          <h2>Oops!</h2>
          <p>{error || 'Product not found'}</p>
          <button onClick={() => navigate('/store')}>Back to Store</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <div className="product-detail-image">
          <img src={product.coverImage} alt={product.title} />
        </div>
        
        <div className="product-detail-info">
          <h1>{product.title}</h1>
          
          <div className="product-meta">
            <span className="product-category">{product.category}</span>
            <span className="product-date">Published: {formatDate(product.publishedDate)}</span>
          </div>
          
          <div className="product-price-section">
            <span className="product-price">£{product.price.toFixed(2)}</span>
            <button 
              className="btn-purchase" 
              onClick={handlePurchase}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Processing...' : 'Purchase Now'}
            </button>
            {checkoutError && <p className="checkout-error">{checkoutError}</p>}
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          {product.previewUrl && (
            <div className="product-preview">
              <h3>Preview</h3>
              <a 
                href={product.previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-preview"
              >
                View Sample
              </a>
            </div>
          )}
          
          <div className="product-features">
            <h3>Features</h3>
            <ul>
              <li>Instant digital download</li>
              <li>Comprehensive 11+ exam preparation</li>
              <li>Detailed explanations and answers</li>
              <li>Developed by education experts</li>
              <li>Compatible with all devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 