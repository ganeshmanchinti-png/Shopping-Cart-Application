import "./index.css";
import { Link } from "react-router-dom";

const ProductItem = (props) => {
  const { productDetails } = props;
  const { productName, price, imageUrl, description, productId } =
    productDetails;

  return (
    <li className="product-item">
      <Link to={`/products/${productId}`}>
        <div>
          <img src={imageUrl} alt={productName} className="product-image" />
          <h3 className="product-name">{productName}</h3>

          <p className="product-price">Price: Rs {price} /-</p>
        </div>
      </Link>
    </li>
  );
};

export default ProductItem;
