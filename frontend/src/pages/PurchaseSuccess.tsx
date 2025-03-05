import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/api';
import type { Purchase } from '../services/productService';
import '../styles/PurchaseSuccess.css';
import logger from '../utils/logger';

const PurchaseSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPurchase = async () => {
      try {
        // Get session ID from URL query params
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('session_id');
        
        if (!sessionId) {
          setError('Invalid session ID. Please check your purchase history.');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        const response = await productService.verifyCheckout(sessionId);
        setPurchase(response.data);
        setLoading(false);
      } catch (err) {
        logger.error('Error verifying purchase:', err);
        setError('Failed to verify purchase. Please check your purchase history or contact support.');
        setLoading(false);
      }
    };

    verifyPurchase();
  }, [location.search]);

  if (loading) {
    return (
      <div className="purchase-success-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verifying your purchase...</p>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="purchase-success-container">
        <div className="error-message">
          <h2>Oops!</h2>
          <p>{error || 'Purchase verification failed'}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/store')}>Back to Store</button>
            <button onClick={() => navigate('/user/purchases')}>View My Purchases</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h1>Thank You for Your Purchase!</h1>
        <p className="success-message">
          Your purchase was successful and your eBook is now available in your library.
        </p>
        
        <div className="purchase-details">
          <h3>Purchase Details</h3>
          <div className="purchase-info">
            <div className="purchase-info-item">
              <span className="label">Product:</span>
              <span className="value">{purchase.product.title}</span>
            </div>
            <div className="purchase-info-item">
              <span className="label">Amount:</span>
              <span className="value">£{purchase.amount.toFixed(2)}</span>
            </div>
            <div className="purchase-info-item">
              <span className="label">Date:</span>
              <span className="value">
                {new Date(purchase.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="purchase-info-item">
              <span className="label">Order ID:</span>
              <span className="value">{purchase._id}</span>
            </div>
          </div>
        </div>
        
        <div className="success-actions">
          <Link to="/user/purchases" className="btn-primary">
            Go to My Library
          </Link>
          <Link to="/store" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess; 