import React from "react";

const ReactContext = React.createContext({
  cartList: [],
  addCartItem: () => {},
  fetchCartItems: () => {},
  removeCartItem: () => {},
  incrementCartItemQuantity: () => {},
  decrementCartItemQuantity: () => {},
  placeOrder: () => {},
});

export default ReactContext;
