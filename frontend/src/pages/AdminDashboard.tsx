import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import '../styles/AdminDashboard.css';

// This is a placeholder for the admin dashboard
// In a real implementation, you would have separate components for each section
const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <div className="admin-dashboard">
      <button className="menu-toggle" onClick={toggleMenu}>
        {menuOpen ? '✕' : '☰'} Menu
      </button>
      
      <div className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <h2>Admin Dashboard</h2>
        <nav className="admin-nav">
          <ul>
            <li className={location.pathname === '/admin' ? 'active' : ''}>
              <Link to="/admin" onClick={() => setMenuOpen(false)}>Overview</Link>
            </li>
            <li className={location.pathname === '/admin/products' ? 'active' : ''}>
              <Link to="/admin/products" onClick={() => setMenuOpen(false)}>Manage Products</Link>
            </li>
            <li className={location.pathname === '/admin/orders' ? 'active' : ''}>
              <Link to="/admin/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
            </li>
            <li className={location.pathname === '/admin/users' ? 'active' : ''}>
              <Link to="/admin/users" onClick={() => setMenuOpen(false)}>Users</Link>
            </li>
            <li className={location.pathname === '/admin/settings' ? 'active' : ''}>
              <Link to="/admin/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

// Placeholder components for each admin section
export const AdminOverview: React.FC = () => (
  <div className="admin-section">
    <h1>Dashboard Overview</h1>
    <div className="admin-stats">
      <div className="stat-card">
        <h3>Total Sales</h3>
        <p className="stat-value">£4,250</p>
        <p className="stat-change positive">+15% from last month</p>
      </div>
      <div className="stat-card">
        <h3>Products</h3>
        <p className="stat-value">24</p>
        <p className="stat-change">+3 new this month</p>
      </div>
      <div className="stat-card">
        <h3>Users</h3>
        <p className="stat-value">1,245</p>
        <p className="stat-change positive">+8% from last month</p>
      </div>
      <div className="stat-card">
        <h3>Orders</h3>
        <p className="stat-value">156</p>
        <p className="stat-change positive">+12% from last month</p>
      </div>
    </div>
    <div className="admin-recent">
      <h2>Recent Activity</h2>
      <div className="activity-list">
        <div className="activity-item">
          <p className="activity-time">Today, 14:23</p>
          <p className="activity-desc">New order: <strong>11+ English Complete Guide</strong> by John Smith</p>
        </div>
        <div className="activity-item">
          <p className="activity-time">Today, 11:05</p>
          <p className="activity-desc">New user registered: <strong>sarah.jones@example.com</strong></p>
        </div>
        <div className="activity-item">
          <p className="activity-time">Yesterday, 16:42</p>
          <p className="activity-desc">Product updated: <strong>11+ Maths Practice Papers</strong></p>
        </div>
        <div className="activity-item">
          <p className="activity-time">Yesterday, 10:30</p>
          <p className="activity-desc">New order: <strong>11+ Non-verbal Reasoning Guide</strong> by Emma Wilson</p>
        </div>
      </div>
    </div>
  </div>
);

export const AdminProducts: React.FC = () => (
  <div className="admin-section">
    <h1>Manage Products</h1>
    <p>This is where you would manage your digital products.</p>
    <button className="btn-primary">Add New Product</button>
    <div className="placeholder-message">
      <p>Product management functionality will be implemented in the next phase.</p>
    </div>
  </div>
);

export const AdminOrders: React.FC = () => (
  <div className="admin-section">
    <h1>Orders</h1>
    <p>View and manage customer orders here.</p>
    <div className="placeholder-message">
      <p>Order management functionality will be implemented in the next phase.</p>
    </div>
  </div>
);

export const AdminUsers: React.FC = () => (
  <div className="admin-section">
    <h1>Users</h1>
    <p>Manage user accounts and permissions.</p>
    <div className="placeholder-message">
      <p>User management functionality will be implemented in the next phase.</p>
    </div>
  </div>
);

export const AdminSettings: React.FC = () => (
  <div className="admin-section">
    <h1>Settings</h1>
    <p>Configure store settings and preferences.</p>
    <div className="placeholder-message">
      <p>Settings functionality will be implemented in the next phase.</p>
    </div>
  </div>
);

export default AdminDashboard; 