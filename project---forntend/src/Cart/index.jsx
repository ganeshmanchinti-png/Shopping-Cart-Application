import "./index.css";
import Header from "../Header";
import CartList from "../CartList";
import ReactContext from "../context";
import { Link } from "react-router-dom";
import { useEffect, useContext } from "react";

const Cart = () => {
  const { cartList, fetchCartItems } = useContext(ReactContext);

  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <div className="cart-container">
      <Header />

      {cartList.length === 0 ? (
        <div className="empty-cart-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-empty-cart-img.png"
            alt="empty cart"
            className="empty-cart-image"
          />

          <h1 className="empty-cart-heading">Your Cart Is Empty</h1>

          <p className="empty-cart-description">
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link to="/products" className="continue-shopping-link">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <h1 className="cart-heading">My Cart</h1>
          <CartList />
        </div>
      )}
    </div>
  );
};

export default Cart;
