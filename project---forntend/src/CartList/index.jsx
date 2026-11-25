import ReactContext from "../context";
import CartItem from "../CartItem";
import "./index.css";
import Cartsummary from "../Cartsummary";

const CartList = () => (
  <ReactContext.Consumer>
    {(value) => {
      const { cartList } = value;

      return (
        <div>
          <ul>
            {cartList.map((eachItem) => (
              <CartItem key={eachItem.productId} eachItemDetails={eachItem} />
            ))}
          </ul>
          <Cartsummary />
        </div>
      );
    }}
  </ReactContext.Consumer>
);

export default CartList;
