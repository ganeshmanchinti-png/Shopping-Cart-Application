import { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { PiUserCircleThin } from "react-icons/pi";
import { GrFavorite } from "react-icons/gr";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { MdOutlineShoppingCart } from "react-icons/md";
import Popup from "reactjs-popup";
import LoginRoute from "../LoginRoute";
import HelpPopup from "../HelpPopup";
import Cookies from "js-cookie";

import "./index.css";

class Header extends Component {
  state = { isLoginActive: Cookies.get("jwt_token") !== undefined };

  onLogout = () => {
    Cookies.remove("jwt_token");
    const { history } = this.props;
    history.replace("/");
    this.setState({ isLoginActive: false });
  };

  render() {
    return (
      <div className="header-container">
        <Link to="/">
          <img
            src="https://res.cloudinary.com/do4r39azg/image/upload/v1793423973/Shopora__Everything_in_One_Place.png"
            alt="website-logo"
            className="logo"
          />
        </Link>
        <div>
          <Link to="/" className="nav-link">
            <p>Home</p>
          </Link>
          <Link to="/products" className="nav-link">
            <p>Products</p>
          </Link>
          <Link to="/cart" className="nav-link">
            <p>Cart</p>
          </Link>
        </div>
        <div>
          <ul>
            <li>
              <Popup
                modal
                position="bottom left"
                trigger={
                  this.state.isLoginActive ? (
                    <div className="usericon">
                      <PiUserCircleThin />
                      Logout
                    </div>
                  ) : (
                    <div className="usericon">
                      <PiUserCircleThin />
                      Login
                    </div>
                  )
                }
              >
                {(close) => {
                  return this.state.isLoginActive ? (
                    <div className="popup-containers">
                      <h1 className="heading">
                        Are you sure you want to logout?
                      </h1>
                      <div className="button-container">
                        <button
                          type="button"
                          className="close-button"
                          onClick={close}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="close-button"
                          onClick={this.onLogout}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="popup-containers">
                      <LoginRoute
                        onLoginSuccess={() => {
                          this.setState({ isLoginActive: true });
                          close();
                        }}
                      />
                    </div>
                  );
                }}
              </Popup>
            </li>
            <li className="usericon">
              <HelpPopup />
            </li>

            <li>
              <Link to="/orders/history" className="nav-link usericon">
                <MdOutlineShoppingCart />
                Orders
              </Link>
            </li>
            <li className="usericon">
              <GrFavorite />
              Favorites
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
