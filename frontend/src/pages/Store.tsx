import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import type { Product } from '../services/productService';
import '../styles/Store.css';
import logger from '../utils/logger';

const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState<boolean>(false);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: '11+ English', name: '11+ English' },
    { id: '11+ Maths', name: '11+ Maths' },
    { id: '11+ Verbal Reasoning', name: '11+ Verbal Reasoning' },
    { id: '11+ Non-verbal Reasoning', name: '11+ Non-verbal Reasoning' },
    { id: 'General', name: 'General' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products
        const featuredResponse = await productService.getProducts({ featured: true });
        setFeaturedProducts(featuredResponse.data);
        
        // Track if we're using mock data
        if (featuredResponse.usingMockData) {
          setUsingMockData(true);
        }
        
        // Fetch all products or filtered by category
        const params = selectedCategory !== 'all' ? { category: selectedCategory } : undefined;
        const productsResponse = await productService.getProducts(params);
        setProducts(productsResponse.data);
        
        // Track if we're using mock data
        if (productsResponse.usingMockData) {
          setUsingMockData(true);
        }
        
        setLoading(false);
      } catch (err) {
        logger.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setUsingMockData(true); // Assume mock data in case of errors
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryMenuOpen(false); // Close the menu after selection
  };

  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  if (loading) {
    return (
      <div className="store-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-container">
        <div className="error-message">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="store-container">
      <div className="store-header">
        <h1>Store</h1>
        <p>Quality resources for exam preparation</p>
      </div>

      {usingMockData && (
        <div className="mock-data-indicator">
          <p>⚠️ Using mock product data. Products shown are for demonstration purposes only.</p>
        </div>
      )}

      {featuredProducts.length > 0 && (
        <div className="featured-section">
          <h2>Featured Resources</h2>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img src={product.coverImage} alt={product.title} />
                </div>
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p className="product-price">£{product.price.toFixed(2)}</p>
                  <p className="product-description">
                    {product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </p>
                  <Link to={`/store/product/${product._id}`} className="btn-view-details">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="category-filter-container">
        <button 
          className="category-toggle-button"
          onClick={toggleCategoryMenu}
          aria-expanded={isCategoryMenuOpen}
        >
          <span>{selectedCategory === 'all' ? 'Filter by Category' : `Category: ${selectedCategory}`}</span>
          <svg 
            className={`toggle-icon ${isCategoryMenuOpen ? 'open' : ''}`} 
            viewBox="0 0 24 24" 
            width="24" 
            height="24"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
        
        <div className={`category-menu ${isCategoryMenuOpen ? 'open' : ''}`}>
          {categories.map(category => (
            <button
              key={category.id}
              className={selectedCategory === category.id ? 'active' : ''}
              onClick={() => handleCategoryChange(category.id)}
              aria-label={`Filter by ${category.name}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className={`store-content ${isCategoryMenuOpen ? 'menu-open' : ''}`}>
        <h2>{selectedCategory === 'all' ? 'All Resources' : selectedCategory}</h2>
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="no-products">
              <p>No products found in this category.</p>
            </div>
          ) : (
            products.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img src={product.coverImage} alt={product.title} />
                </div>
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p className="product-price">£{product.price.toFixed(2)}</p>
                  <p className="product-description">
                    {product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </p>
                  <Link to={`/store/product/${product._id}`} className="btn-view-details">
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Store; 