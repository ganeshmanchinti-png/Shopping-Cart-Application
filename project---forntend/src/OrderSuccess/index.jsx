import React from "react";
import { useLocation, Link, Redirect } from "react-router-dom";
import "./index.css";
import Header from "../Header";

const OrderSuccess = () => {
  const location = useLocation();

  const orderData = location.state;

  if (!orderData) {
    return <Redirect to="/" />;
  }

  const { orderId, totalAmount } = orderData;

  return (
    <div>
      <Header />
      <div className="order-success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>

          <h1>Order Placed Successfully!</h1>

          <p className="success-message">
            Thank you for shopping with us. Your order has been placed
            successfully.
          </p>

          <div className="order-details">
            <h2>Order Details</h2>

            <div className="detail-row">
              <span>Order ID</span>
              <span>#{orderId}</span>
            </div>

            <div className="detail-row">
              <span>Total Amount</span>
              <span>₹{Number(totalAmount).toFixed(2)}</span>
            </div>

            <div className="detail-row">
              <span>Order Status</span>
              <span className="pending-status">Pending</span>
            </div>
          </div>

          <div className="success-buttons">
            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>

            <Link to="/orders/history" className="view-orders">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
