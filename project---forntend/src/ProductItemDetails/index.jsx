import { Component } from "react";
import { Circles } from "react-loader-spinner";
import Header from "../Header";
import Cookies from "js-cookie";
import SimilarProducts from "../SimilarProducts";

import "./index.css";
import ReactContext from "../context";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

class ProductItemDetails extends Component {
  state = {
    quantity: 1,
    productData: {},
    similarProductsData: [],
    apiStatus: apiStatusConstants.initial,
  };

  componentDidMount() {
    this.getProductItemDetails();
  }

  getFormattedData = (data) => ({
    productId: data.product_id,
    productName: data.product_name,
    rating: data.rating,
    description: data.description,
    price: data.price,
    stock: data.stock,
    imageUrl: data.image_url,
  });

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.getProductItemDetails();
    }
  }

  getProductItemDetails = async () => {
    this.setState({ apiStatus: apiStatusConstants.inProgress });
    const token = Cookies.get("jwt_token");

    if (token === undefined) {
      return;
    }

    const { match } = this.props;
    const { id } = match.params;

    const url = `http://localhost:3000/products/${id}`;

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await fetch(url, options);

      if (response.ok) {
        const fetchData = await response.json();

        const updatedData = this.getFormattedData(fetchData.getProduct);

        const updatedSimilarProductsData = fetchData.similarProducts.map(
          (eachSimilarProduct) => this.getFormattedData(eachSimilarProduct),
        );

        this.setState({
          productData: updatedData,
          similarProductsData: updatedSimilarProductsData,
          apiStatus: apiStatusConstants.success,
        });

        console.log("Product:", updatedData);
        console.log("Similar Products:", updatedSimilarProductsData);
      } else {
        this.setState({
          apiStatus: apiStatusConstants.failure,
        });
      }
    } catch (error) {
      console.log(error.message);
      this.setState({
        apiStatus: apiStatusConstants.failure,
      });
    }
  };

  onClickDecrement = () => {
    const { quantity } = this.state;
    if (quantity > 1) {
      this.setState({ quantity: quantity - 1 });
    }
  };

  onClickIncrement = () => {
    const { quantity } = this.state;
    this.setState({ quantity: quantity + 1 });
  };

  renderProductDetailsView = () => {
    const { productData, similarProductsData, quantity } = this.state;

    const { productName, rating, description, price, stock, imageUrl } =
      productData;

    return (
      <ReactContext.Consumer>
        {(value) => {
          const { addCartItem } = value;

          const onAddCartItem = () => {
            addCartItem({ ...productData, quantity });
          };

          return (
            <div>
              <div className="productItem">
                <div>
                  <img
                    src={imageUrl}
                    alt={productName}
                    className="firstimage"
                  />
                </div>

                <div>
                  <p>{productName}</p>
                  <p>{description}</p>
                  <p className="price-details">Rs {price}/-</p>

                  <div className="rating-container">
                    <p className="rating">{rating}</p>
                    <img
                      src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                      alt="star"
                      className="star"
                    />
                  </div>

                  <div className="label-value-container">
                    <p className="label">Available:</p>
                    <p className="value">{stock}</p>
                  </div>

                  <div className="quantity-container">
                    <button
                      type="button"
                      className="quantity-controller-button"
                      data-testid="minus"
                      onClick={this.onClickDecrement}
                    >
                      -
                    </button>

                    <p className="quantity">{quantity}</p>

                    <button
                      type="button"
                      className="quantity-controller-button"
                      data-testid="plus"
                      onClick={this.onClickIncrement}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="button add-to-cart-btn"
                    onClick={onAddCartItem}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>

              <div className="similar-products-section">
                <h1 className="similar-products-heading">Similar Products</h1>

                <ul className="similar-products-list">
                  {similarProductsData.map((eachItem) => (
                    <SimilarProducts
                      key={eachItem.productId}
                      productDetails={eachItem}
                    />
                  ))}
                </ul>
              </div>
            </div>
          );
        }}
      </ReactContext.Consumer>
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

  renderAllviews = () => {
    const { apiStatus } = this.state;

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductDetailsView();

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
      <div>
        <Header />

        {this.renderAllviews()}
      </div>
    );
  }
}

export default ProductItemDetails;
