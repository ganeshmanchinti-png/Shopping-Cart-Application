import { Component } from "react";
import Cookies from "js-cookie";
import { withRouter } from "react-router-dom";
import "./index.css";

class LoginRoute extends Component {
  state = { name: "", password: "", isError: false, isMsg: "" };

  renderSuccessform = (jwtToken) => {
    this.setState({ isError: false });

    Cookies.set("jwt_token", jwtToken, { expires: 30 });

    const { onLoginSuccess } = this.props;
    onLoginSuccess();
  };

  renderFailureform = (error) => {
    this.setState({ isError: true, isMsg: error });
  };

  onChangeName = (event) => {
    this.setState({ name: event.target.value });
  };

  onChangePassword = (event) => {
    this.setState({ password: event.target.value });
  };

  onSubmitForm = async (event) => {
    event.preventDefault();

    const { name, password } = this.state;
    const userDetails = { name, password };

    const url = "http://localhost:3000/login";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(url, options);

    const data = await response.json();

    if (response.ok === true) {
      this.renderSuccessform(data.jwtToken);
    } else {
      this.renderFailureform(data.error_msg);
    }
  };

  render() {
    const { name, password, isError, isMsg } = this.state;

    return (
      <form className="form-container" onSubmit={this.onSubmitForm}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={name}
          className="loginAccount"
          onChange={this.onChangeName}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          className="loginAccount"
          onChange={this.onChangePassword}
        />
        <button type="submit">Login</button>
        {isError && <p className="error">* {isMsg}</p>}
        <p className="account-text">
          Don't have an account?{" "}
          <span
            className="account-link"
            onClick={() => this.props.history.push("/register")}
          >
            Register
          </span>
        </p>
      </form>
    );
  }
}

export default withRouter(LoginRoute);
