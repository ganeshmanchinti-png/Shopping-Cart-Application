import { Component } from "react";
import { withRouter } from "react-router-dom";
import Cookies from "js-cookie";

import "./index.css";

class Login extends Component {
  state = { name: "", email: "", password: "", isError: false, isMsg: "" };

  onChangeName = (event) => {
    this.setState({ name: event.target.value });
  };

  onChangeEmail = (event) => {
    this.setState({ email: event.target.value });
  };

  onChangePassword = (event) => {
    this.setState({ password: event.target.value });
  };

  onSubmitUser = async (event) => {
    event.preventDefault();

    const { name, email, password } = this.state;
    const userDetails = { name, email, password };

    try {
      const registerResponse = await fetch(
        "https://shopping-cart-backend-71i6.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userDetails),
        },
      );

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        // Registration successful - now login
        const loginResponse = await fetch(
          "https://shopping-cart-backend-71i6.onrender.com/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              password,
            }),
          },
        );

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          // Store JWT token
          Cookies.set("jwt_token", loginData.jwtToken, { expires: 30 });

          this.setState({
            name: "",
            email: "",
            password: "",
            isError: false,
            isMsg: "",
          });

          this.props.history.push("/");
        } else {
          this.setState({
            isError: true,
            isMsg: loginData.error_msg || "Login failed",
          });
        }
      } else {
        this.setState({
          isError: true,
          isMsg: registerData.error_msg || "Registration failed",
        });
      }
    } catch (error) {
      console.log("Registration error:", error);

      this.setState({
        isError: true,
        isMsg: "Unable to connect to server",
      });
    }
  };

  render() {
    const { isError, isMsg, name, email, password } = this.state;
    return (
      <div className="login-container">
        <form className="container" onSubmit={this.onSubmitUser}>
          <h1>Login Form</h1>
          <label htmlFor="name">UserName</label>
          <input
            value={name}
            type="text"
            className="username"
            id="name"
            onChange={this.onChangeName}
          />

          <label htmlFor="email">Email</label>
          <input
            value={email}
            type="text"
            className="username"
            id="email"
            onChange={this.onChangeEmail}
          />

          <label htmlFor="password">Password</label>
          <input
            value={password}
            type="password"
            className="username"
            id="password"
            onChange={this.onChangePassword}
          />

          <button type="submit" className="button">
            Submit
          </button>
          {isError && <p className="error">* {isMsg}</p>}
        </form>
      </div>
    );
  }
}

export default withRouter(Login);
