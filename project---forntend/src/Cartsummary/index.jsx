import "./index.css";
import ReactContext from "../context";
import { Link } from "react-router-dom";

const Cartsummary = (props) => {
  return (
    <ReactContext.Consumer>
      {(value) => {
        const { cartList, placeOrder } = value;

        const totalamount = cartList.reduce(
          (total, eachItem) => (total += eachItem.quantity * eachItem.price),
          0,
        );

        return (
          <div className="total-container">
            <h1 className="totalItems">Total amounts : {totalamount} /-</h1>
            <p className="items">{cartList.length} Items in Cart</p>
            <div className="check-out-container">
              <Link to="/products">
                <button type="button">Checkout</button>
              </Link>
              <button type="button" onClick={placeOrder}>
                Order
              </button>
            </div>
          </div>
        );
      }}
    </ReactContext.Consumer>
  );
};

export default Cartsummary;
