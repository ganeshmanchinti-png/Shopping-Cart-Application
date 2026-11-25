import "./index.css";
import { Component } from "react";

class ProductHeader extends Component {
  render() {
    const {
      categoriesList,
      onChangeCategory,
      priceRangesList,
      onChangePriceRange,
    } = this.props;

    return (
      <div className="product-header-container">
        <div className="product-header-list-container">
          <h1 className="product-header-heading">Categories</h1>

          <ul className="product-header-list">
            {categoriesList.map((category) => (
              <li
                key={category.categoryId}
                className="product-header-list-item"
                onClick={() => onChangeCategory(category.categoryId)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="price-range-container">
          <h3 className="price-range-heading">Price Range</h3>

          {priceRangesList.map((eachItem) => (
            <label className="price-range-label" key={eachItem.id}>
              <input
                className="price-range-checkbox"
                type="checkbox"
                value={eachItem.id}
                onChange={() =>
                  onChangePriceRange(eachItem, event.target.checked)
                }
              />
              <span>{eachItem.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }
}

export default ProductHeader;
