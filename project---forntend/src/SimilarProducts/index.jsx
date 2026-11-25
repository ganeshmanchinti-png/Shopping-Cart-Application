import "./index.css";
import { Link } from "react-router-dom";

const SimilarProducts = (props) => {
  const { productDetails } = props;
  const { productName, price, imageUrl, description, productId } =
    productDetails;

  return (
    <li className="similar-product-item">
      <Link to={`/products/${productId}`} className="similar-product-link">
        <div className="similar-product-card">
          <img
            src={imageUrl}
            alt={productName}
            className="similar-product-image"
          />

          <h3 className="similar-product-name">{productName}</h3>

          <p className="similar-product-description">{description}</p>

          <p className="product-price">Price: Rs {price} /-</p>
        </div>
      </Link>
    </li>
  );
};

export default SimilarProducts;
