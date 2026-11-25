// import Login from "./Login"
// import LoginRoute from "./LoginRoute"
// import Header from "./Header"
import { Component } from "react";
import { Switch, Route, Redirect, withRouter } from "react-router-dom";
import Home from "./Home";
import ProtectedRoute from "./ProtectedRoute";
import Products from "./Products";
import Cart from "./Cart";
import ProductItemDetails from "./ProductItemDetails";
import ReactContext from "./context";
import Cookies from "js-cookie";
import OrderSuccess from "./OrderSuccess";
import Orders from "./Orders";
import "./App.css";
import { MdAutoAwesomeMosaic } from "react-icons/md";
import Login from "./Login";

class App extends Component {
  state = { cartList: [] };

  ///fetch cartList

  fetchCartItems = async () => {
    const token = Cookies.get("jwt_token");

    const url = "http://localhost:3000/cart";

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, options);

    if (response.ok) {
      const data = await response.json();

      this.setState({
        cartList: data.cartItems,
      });
    }
  };

  // addCartItem = (product) => {
  //   // this.setState((prevState) => ({
  //   //   cartList: [...prevState.cartList, product],
  //   // }));
  //   const { cartList } = this.state;

  //   const isExisting = cartList.find(
  //     (eachItem) => eachItem.productId === product.productId,
  //   );

  //   if (isExisting) {
  //     this.setState((prevState) => ({
  //       cartList: prevState.cartList.map((eachItem) =>
  //         eachItem.productId === product.productId
  //           ? { ...eachItem, quantity: eachItem.quantity + product.quantity }
  //           : eachItem,
  //       ),
  //     }));
  //   } else {
  //     this.setState((prevState) => ({
  //       cartList: [...prevState.cartList, product],
  //     }));
  //   }
  // };

  addCartItem = async (product) => {
    const token = Cookies.get("jwt_token");

    const url = "http://localhost:3000/cart";
    const options = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product.productId,
        quantity: product.quantity,
      }),
    };

    const response = await fetch(url, options);

    if (response.ok) {
      await this.fetchCartItems();
    } else {
      const data = await response.json();
      console.log(data.error_msg);
    }
  };

  // incrementCartItemQuantity = (id) => {
  //   this.setState((prevState) => ({
  //     cartList: prevState.cartList.map((eachItem) =>
  //       eachItem.productId === id
  //         ? { ...eachItem, quantity: eachItem.quantity + 1 }
  //         : eachItem,
  //     ),
  //   }));
  // };

  incrementCartItemQuantity = async (id) => {
    const { cartList } = this.state;

    const item = cartList.find((eachItem) => eachItem.productId === id);

    if (!item) return;

    const token = Cookies.get("jwt_token");

    const response = await fetch(`http://localhost:3000/cart/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: item.quantity + 1 }),
    });

    if (response.ok) {
      await this.fetchCartItems();
    } else {
      const data = await response.json();
      console.log(data.error_msg);
    }
  };

  // decrementCartItemQuantity = (id) => {
  //   this.setState((prevState) => ({
  //     cartList: prevState.cartList
  //       .map((eachItem) =>
  //         eachItem.productId === id
  //           ? { ...eachItem, quantity: eachItem.quantity - 1 }
  //           : eachItem,
  //       )
  //       .filter((eachItem) => eachItem.quantity > 0),
  //   }));
  // };

  decrementCartItemQuantity = async (id) => {
    const { cartList } = this.state;

    const item = cartList.find((eachItem) => eachItem.productId === id);

    if (!item) return;

    if (item.quantity === 1) {
      return this.removeCartItem(id);
    }

    const token = Cookies.get("jwt_token");
    const url = `http://localhost:3000/cart/${id}`;
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: item.quantity - 1 }),
    };

    const response = await fetch(url, options);

    if (response.ok) {
      await this.fetchCartItems();
    }
  };

  // removeCartItem = (id) => {
  //   this.setState((prevState) => ({
  //     cartList: prevState.cartList.filter(
  //       (eachItem) => eachItem.productId !== id,
  //     ),
  //   }));
  // };

  removeCartItem = async (id) => {
    const token = Cookies.get("jwt_token");

    const response = await fetch(`http://localhost:3000/cart/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      await this.fetchCartItems();
    }
  };

  placeOrder = async () => {
    const token = Cookies.get("jwt_token");

    try {
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Order Placed Successfully! Order ID: ${data.orderId}`);
        this.props.history.push({
          pathname: "/order-success",
          state: {
            orderId: data.orderId,
            totalAmount: data.totalAmount,
          },
        });

        await this.fetchCartItems();
      } else {
        alert(data.error_msg);
      }
    } catch (error) {
      console.log("Order Error:", error);
    }
  };

  render() {
    const { cartList } = this.state;
    console.log(cartList);
    return (
      <ReactContext.Provider
        value={{
          cartList,
          addCartItem: this.addCartItem,
          incrementCartItemQuantity: this.incrementCartItemQuantity,
          fetchCartItems: this.fetchCartItems,
          placeOrder: this.placeOrder,
          decrementCartItemQuantity: this.decrementCartItemQuantity,
          removeCartItem: this.removeCartItem,
        }}
      >
        <Switch>
          <Route exact path="/" component={Home} />

          <Route exact path="/register" component={Login} />
          <ProtectedRoute exact path="/products" component={Products} />

          <ProtectedRoute exact path="/cart" component={Cart} />

          <ProtectedRoute
            exact
            path="/products/:id"
            component={ProductItemDetails}
          />

          <ProtectedRoute
            exact
            path="/order-success"
            component={OrderSuccess}
          />

          <ProtectedRoute exact path="/orders/history" component={Orders} />

          <Route render={() => <Redirect to="/" />} />

          <Redirect to="/" />
        </Switch>
      </ReactContext.Provider>
    );
  }
}

export default withRouter(App);
