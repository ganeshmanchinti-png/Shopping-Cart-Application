import "./index.css";
import ReactContext from "../context";

const CartItem = (props) => {
  const { eachItemDetails } = props;

  const { productName, price, imageUrl, quantity, productId } = eachItemDetails;

  return (
    <ReactContext.Consumer>
      {(value) => {
        const {
          incrementCartItemQuantity,
          decrementCartItemQuantity,
          removeCartItem,
        } = value;

        return (
          <li className="wave">
            <div>
              <img
                src={imageUrl}
                alt={productName}
                className="cartItem-image"
              />
              <p className="name">{productName}</p>
            </div>

            <div>
              <button
                type="button"
                className="quantity-controller-button"
                data-testid="minus"
                onClick={() => decrementCartItemQuantity(productId)}
              >
                -
              </button>

              <p className="quantity">{quantity}</p>

              <button
                type="button"
                className="quantity-controller-button"
                data-testid="plus"
                onClick={() => incrementCartItemQuantity(productId)}
              >
                +
              </button>
            </div>

            <p>Rs {price * quantity}</p>

            <button type="button" onClick={() => removeCartItem(productId)}>
              Remove
            </button>
          </li>
        );
      }}
    </ReactContext.Consumer>
  );
};

export default CartItem;
