import { Component } from "react";
import { Link } from "react-router-dom";
import Header from "../Header";
import "./index.css";

class Home extends Component {
  render() {
    return (
      <div className="home-page">
        <Header />

        {/* Hero Section */}
        <div className="home-container">
          <div className="hero-content">
            <p className="hero-label">WELCOME TO SHOPORA</p>

            <h1>
              Discover Your
              <span> Perfect Style</span>
            </h1>

            <p className="hero-description">
              Explore the latest trends and discover amazing products. Shop your
              favorite items at the best prices with an enjoyable shopping
              experience.
            </p>

            <Link to="/products" className="shop-now-button">
              Shop Now
            </Link>
          </div>

          <div className="hero-image-container">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900"
              alt="shopping store"
              className="hero-image"
            />
          </div>
        </div>

        {/* Categories Section */}
        <div className="categories-section">
          <h1 className="section-heading">Trending Categories</h1>
          <p className="section-description">
            Find everything you need in one place.
          </p>

          <div className="categories-container">
            <div className="category-card">
              <Link to="/products?category_id=2">
                <img
                  src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500"
                  alt="fashion clothing"
                />
                <h2>Fashion</h2>
                <p>Discover your perfect look.</p>
              </Link>
            </div>

            <div className="category-card">
              <Link to="/products?category_id=4">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
                  alt="shoes"
                />
                <h2>Footwear</h2>
                <p>Step into the latest trends.</p>
              </Link>
            </div>

            <div className="category-card">
              <Link to="/products?category_id=1">
                <img
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
                  alt="mobile phone"
                />
                <h2>Electronics</h2>
                <p>Upgrade your technology.</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
