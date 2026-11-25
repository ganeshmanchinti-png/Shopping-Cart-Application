import React, { Component } from "react";
import Cookies from "js-cookie";
import Header from "../Header";
import { Link } from "react-router-dom";
import "./index.css";

class Orders extends Component {
  state = {
    ordersList: [],
    apiStatus: "INITIAL",
    errorMsg: "",
  };

  componentDidMount() {
    this.getOrders();
  }

  getOrders = async () => {
    this.setState({ apiStatus: "LOADING" });

    const token = Cookies.get("jwt_token");

    try {
      const response = await fetch("http://localhost:3000/orders/history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        this.setState({
          ordersList: data.orders,
          apiStatus: "SUCCESS",
        });
      } else {
        this.setState({
          errorMsg: data.error_msg || "Unable to get orders",
          apiStatus: "FAILURE",
        });
      }
    } catch (error) {
      this.setState({
        errorMsg: "Something went wrong. Please try again.",
        apiStatus: "FAILURE",
      });
    }
  };

  renderLoadingView = () => (
    <div className="orders-message">
      <p>Loading your orders...</p>
    </div>
  );

  renderFailureView = () => {
    const { errorMsg } = this.state;

    return (
      <div className="orders-message">
        <p>{errorMsg}</p>
        <button type="button" onClick={this.getOrders}>
          Retry
        </button>
      </div>
    );
  };

  renderEmptyView = () => (
    <div className="orders-empty">
      <h2>No Orders Yet</h2>
      <p>You haven't placed any orders.</p>

      <Link to="/products" className="continue-shopping">
        Continue Shopping
      </Link>
    </div>
  );

  renderSuccessView = () => {
    const { ordersList } = this.state;

    return (
      <div className="orders-list">
        {ordersList.map((eachOrder) => (
          <div className="order-card" key={eachOrder.orderId}>
            <div className="order-card-header">
              <h2>Order #{eachOrder.orderId}</h2>

              <span
                className={`order-status ${eachOrder.orderStatus.toLowerCase()}`}
              >
                {eachOrder.orderStatus}
              </span>
            </div>

            <div className="order-card-details">
              <div className="detail-row">
                <span>Total Amount</span>
                <strong>₹{Number(eachOrder.totalAmount).toFixed(2)}</strong>
              </div>

              <div className="detail-row">
                <span>Order Date</span>
                <strong>{eachOrder.createdAt}</strong>
              </div>
            </div>

            <Link
              to={`/orders/${eachOrder.orderId}`}
              className="view-order-details"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    );
  };

  renderOrders = () => {
    const { apiStatus, ordersList } = this.state;

    switch (apiStatus) {
      case "LOADING":
        return this.renderLoadingView();

      case "FAILURE":
        return this.renderFailureView();

      case "SUCCESS":
        return ordersList.length === 0
          ? this.renderEmptyView()
          : this.renderSuccessView();

      default:
        return null;
    }
  };

  render() {
    return (
      <>
        <Header />

        <div className="orders-container">
          <h1>My Orders</h1>

          <p className="orders-subtitle">View all your previous orders here.</p>

          {this.renderOrders()}
        </div>
      </>
    );
  }
}

export default Orders;
