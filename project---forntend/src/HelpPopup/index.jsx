import Popup from "reactjs-popup";
import { IoMdHelpCircleOutline } from "react-icons/io";
import "./index.css";

const HelpPopup = () => (
  <Popup
    modal
    trigger={
      <button type="button" className="help-button">
        <IoMdHelpCircleOutline />
        Help
      </button>
    }
    closeOnDocumentClick
  >
    {(close) => (
      <div className="help-popup">
        <button type="button" className="help-close" onClick={close}>
          ✕
        </button>

        <h1>Welcome to Shopora!</h1>
        <p className="help-description">
          Your Everything in One Place Shopping Platform.
        </p>

        <h2>Shopora Instructions & Guidelines</h2>

        <div className="help-section">
          <h3>1. Account & Login</h3>
          <p>
            Create an account or login to access your shopping features. Logout
            securely when you finish shopping.
          </p>
        </div>

        <div className="help-section">
          <h3>2. Browse Products</h3>
          <p>
            Visit the Products page to explore different categories and view
            product details.
          </p>
        </div>

        <div className="help-section">
          <h3>3. Add to Cart</h3>
          <p>
            Select your required products, choose the quantity, and add them to
            your shopping cart.
          </p>
        </div>

        <div className="help-section">
          <h3>4. Manage Your Cart</h3>
          <p>
            View cart items, update quantities, remove unwanted products, and
            check your total amount.
          </p>
        </div>

        <div className="help-section">
          <h3>5. Place Orders</h3>
          <p>
            Review your cart and confirm your order using the available checkout
            options.
          </p>
        </div>

        <div className="help-section">
          <h3>6. Favorites</h3>
          <p>Save your favorite products and access them whenever you want.</p>
        </div>

        <div className="help-section">
          <h3>7. Security Guidelines</h3>
          <p>
            Keep your login credentials private. Always logout when using a
            shared device.
          </p>
        </div>

        <div className="help-footer">
          <p>Thank you for shopping with Shopora!</p>
          <button type="button" onClick={close}>
            Got it
          </button>
        </div>
      </div>
    )}
  </Popup>
);

export default HelpPopup;
