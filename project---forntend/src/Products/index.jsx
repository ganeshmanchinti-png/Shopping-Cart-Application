import { Component } from "react";
import Header from "../Header";

import Cookies from "js-cookie";
import ProductItem from "../productItem";
import ProductHeader from "../ProductHeader";
import { FcGenericSortingDesc } from "react-icons/fc";
import { Circles } from "react-loader-spinner";

import "./index.css";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const categoriesList = [
  { categoryId: 1, name: "Electronics" },
  { categoryId: 2, name: "Clothing" },
  { categoryId: 3, name: "Home & Kitchen" },
  { categoryId: 4, name: "Sports & Outdoors" },
  { categoryId: 5, name: "Books" },
  { categoryId: 6, name: "Beauty & Personal Care" },
];

const sortedList = [
  { text: "HIGH", sortedId: "DESC" },
  { text: "LOW", sortedId: "ASC" },
];

const priceRangesList = [
  { id: 1, label: "₹0 - ₹500", minPrice: 0, maxPrice: 500 },
  { id: 2, label: "₹500 - ₹1000", minPrice: 500, maxPrice: 1000 },
  { id: 3, label: "₹1000 - ₹5000", minPrice: 1000, maxPrice: 5000 },
  { id: 4, label: "₹5000 - Above", minPrice: 5000, maxPrice: 85000 },
];

class Products extends Component {
  state = {
    productsList: [],
    apiStatus: apiStatusConstants.initial,
    category: "",
    sorted: sortedList[0].sortedId,
    searchInput: "",
    minPrice: "",
    maxPrice: "",
  };

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);

    const categoryId = params.get("category_id") || "";

    this.setState(
      {
        category: categoryId,
      },
      this.getProducts,
    );
  }

  getProducts = async () => {
    try {
      this.setState({ apiStatus: apiStatusConstants.inProgress });
      const token = Cookies.get("jwt_token");

      const { category, sorted, searchInput, minPrice, maxPrice } = this.state;

      console.log("JWT Token:", token);

      const url = `https://shopping-cart-backend-71i6.onrender.com/products?category_id=${category}&order=${sorted}&search=${searchInput}&min_price=${minPrice}&max_price=${maxPrice}`;

      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(url, options);
      const data = await response.json();

      console.log("Products Data:", data);

      if (response.ok === true) {
        const updatedData = data.map((eachItem) => ({
          productId: eachItem.product_id,
          productName: eachItem.product_name,
          description: eachItem.description,
          price: eachItem.price,
          imageUrl: eachItem.image_url,
          categoryId: eachItem.category_id,
          stock: eachItem.stock,
        }));
        this.setState({
          productsList: updatedData,
          apiStatus: apiStatusConstants.success,
        });
      } else {
        console.log("API Error:", data);
        this.setState({ apiStatus: apiStatusConstants.failure });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      this.setState({ apiStatus: apiStatusConstants.failure });
    }
  };

  renderSuccessView = () => {
    const { productsList } = this.state;

    if (productsList.length === 0) {
      return (
        <div className="no-products-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/nxt-trendz/nxt-trendz-no-products-view.png"
            alt="no products"
            className="no-products-image"
          />

          <h1>No Products Found</h1>
          <p className="no-products-text">
            We couldn't find any products. Try another search.
          </p>

          <button
            type="button"
            className="retry-button"
            onClick={this.getProducts}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="products-success-view">
        <p>Total Products: {productsList.length}</p>

        <ul className="products-list">
          {productsList.map((eachProduct) => (
            <ProductItem
              key={eachProduct.productId}
              productDetails={eachProduct}
            />
          ))}
        </ul>
      </div>
    );
  };

  renderLoadingView = () => (
    <div className="products-loader-container">
      <Circles height="60" width="60" color="#2563eb" ariaLabel="loading" />
      <p className="loading-text">Loading products...</p>
    </div>
  );

  renderFailureView = () => (
    <div className="products-error-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/products-error-view.png"
        alt="products error"
        className="products-error-image"
      />
    </div>
  );

  onChangeCategory = (categoryId) => {
    this.setState({ category: categoryId }, this.getProducts);
  };

  ///Sorted

  onChangeSorted = (event) => {
    this.setState({ sorted: event.target.value }, this.getProducts);
  };

  ///Search

  onChangeSearchInput = (event) => {
    this.setState({ searchInput: event.target.value });
  };

  onSearchValue = (event) => {
    this.getProducts();
  };

  ///Pricerange

  onChangePriceRange = (selectPrice, isChecked) => {
    if (isChecked) {
      this.setState(
        {
          minPrice: selectPrice.minPrice,
          maxPrice: selectPrice.maxPrice,
        },
        this.getProducts,
      );
    } else {
      this.setState({ minPrice: "", maxPrice: "" }, this.getProducts);
    }
  };

  renderAllViews = () => {
    const { apiStatus } = this.state;
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderSuccessView();
      case apiStatusConstants.failure:
        return this.renderFailureView();
      case apiStatusConstants.inProgress:
        return this.renderLoadingView();
      default:
        return null;
    }
  };

  render() {
    return (
      <div className="products-page">
        <Header />

        <div className="products-layout">
          <div className="products-sidebar">
            <ProductHeader
              categoriesList={categoriesList}
              onChangeCategory={this.onChangeCategory}
              priceRangesList={priceRangesList}
              onChangePriceRange={this.onChangePriceRange}
            />
          </div>

          <div className="products-main">
            <div className="products-search-container">
              <input
                type="search"
                className="products-search-input"
                placeholder="Search products..."
                value={this.state.searchInput}
                onChange={this.onChangeSearchInput}
              />
              <button
                type="button"
                className="products-search-button"
                onClick={this.onSearchValue}
              >
                Search
              </button>
              <div className="sorted-container">
                <FcGenericSortingDesc />
                <p>Sorted</p>
                <select
                  className="sortedPrice"
                  value={this.state.sorted}
                  onChange={this.onChangeSorted}
                >
                  {sortedList.map((eachItem) => (
                    <option value={eachItem.sortedId}>{eachItem.text}</option>
                  ))}
                </select>
              </div>
            </div>
            <h1 className="all-products-heading">All Products</h1>
            {this.renderAllViews()}
          </div>
        </div>
      </div>
    );
  }
}

export default Products;
