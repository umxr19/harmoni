import React, { useState, useEffect } from 'react';
import { productService } from '../services/api';
import type { Purchase } from '../services/productService';
import '../styles/UserPurchases.css';
import logger from '../utils/logger';

const UserPurchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await productService.getUserPurchases();
        setPurchases(response.data);
        setLoading(false);
      } catch (err) {
        logger.error('Error fetching purchases:', err);
        setError('Failed to load your purchases. Please try again later.');
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const handleDownload = async (purchaseId: string) => {
    try {
      setDownloadingId(purchaseId);
      setDownloadError(null);
      
      const response = await productService.getDownloadLink(purchaseId);
      const { downloadUrl } = response.data;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      
      // Update the download count in the UI
      setPurchases(prevPurchases => 
        prevPurchases.map(purchase => 
          purchase._id === purchaseId 
            ? { ...purchase, downloadCount: purchase.downloadCount + 1, lastDownloaded: new Date().toISOString() }
            : purchase
        )
      );
      
      setDownloadingId(null);
    } catch (err: any) {
      logger.error('Error downloading eBook:', err);
      setDownloadError(err.response?.data?.error || 'Failed to download eBook. Please try again.');
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="user-purchases-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-purchases-container">
        <div className="error-message">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-purchases-container">
      <div className="user-purchases-header">
        <h1>My eBook Library</h1>
        <p>Access and download your purchased eBooks</p>
      </div>

      {purchases.length === 0 ? (
        <div className="no-purchases">
          <div className="no-purchases-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h2>Your library is empty</h2>
          <p>You haven't purchased any eBooks yet.</p>
          <a href="/store" className="btn-browse">Browse eBooks</a>
        </div>
      ) : (
        <div className="purchases-grid">
          {purchases.map(purchase => (
            <div key={purchase._id} className="purchase-card">
              <div className="purchase-image">
                <img src={purchase.product.coverImage} alt={purchase.product.title} />
              </div>
              <div className="purchase-info">
                <h3>{purchase.product.title}</h3>
                <p className="purchase-category">{purchase.product.category}</p>
                <div className="purchase-meta">
                  <div className="meta-item">
                    <span className="meta-label">Purchased:</span>
                    <span className="meta-value">
                      {formatDate(purchase.createdAt)}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Downloads:</span>
                    <span className="meta-value">{purchase.downloadCount}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Last Downloaded:</span>
                    <span className="meta-value">
                      {formatDate(purchase.lastDownloaded)}
                    </span>
                  </div>
                </div>
                <button
                  className="btn-download"
                  onClick={() => handleDownload(purchase._id)}
                  disabled={downloadingId === purchase._id}
                >
                  {downloadingId === purchase._id ? 'Preparing...' : 'Download eBook'}
                </button>
                {downloadError && downloadingId === purchase._id && (
                  <p className="download-error">{downloadError}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPurchases; 