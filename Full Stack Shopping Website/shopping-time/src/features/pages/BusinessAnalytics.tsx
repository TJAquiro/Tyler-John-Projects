import { Link } from "react-router-dom";
import { FaShoppingCart, FaStore } from "react-icons/fa"; // Add FaStore icon
import './Dashboard.css';

function BusinessDashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Shopping Time<span className="dot">.</span></h1>
        <h2 className="dashboard-subtitle">Empowering Small Businesses</h2>
      </div>
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h3>Welcome to your business dashboard</h3>
          <p>Manage your inventory, track sales, and grow your business all in one place.</p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h4>Today's Sales</h4>
            <p className="stat-value">$1,245</p>
          </div>
          <div className="stat-card">
            <h4>Active Products</h4>
            <p className="stat-value">48</p>
          </div>
          <div className="stat-card">
            <h4>New Orders</h4>
            <p className="stat-value">12</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link to="/addcart" className="action-button-link">
          <button className="action-button catalog-button">
            <FaStore className="action-icon" />
            <span>Browse Catalog</span>
          </button>
        </Link>
        
        <Link to="/cart" className="action-button-link">
          <button className="action-button cart-button">
            <FaShoppingCart className="action-icon" />
            <span>View Cart</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default BusinessDashboard;