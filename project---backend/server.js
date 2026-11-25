const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = "./shopping.db";

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec("PRAGMA foreign_keys = ON");

    await createTables();

    app.listen(3000, () => {
      console.log(
        "Server is Running https://shopping-cart-backend-71i6.onrender.com",
      );
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

const createTables = async () => {
  await db.exec(`
    CREATE TABLE  IF NOT EXISTS users(
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL);
    
    
    CREATE TABLE IF NOT EXISTS register(
    register_id integer PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id));

    CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE,
    image_url TEXT);


    CREATE TABLE IF NOT EXISTS products(
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category_id INTEGER,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    );

    CREATE TABLE IF NOT EXISTS cart (
    cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    UNIQUE (user_id, product_id));

    CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount  REAL NOT NULL,
    order_status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS order_items(
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)

    )

`);

  const columns = await db.all("PRAGMA table_info(products)");

  const ratingColumnExists = columns.some((column) => column.name === "rating");

  if (!ratingColumnExists) {
    await db.exec(`
      ALTER TABLE products
      ADD COLUMN rating REAL DEFAULT 0;
    `);
  }
  console.log("All Tables Created Successfully");
};

app.get("/", (request, response) => {
  response.send("Welcome to Shopping");
});

initializeDBAndServer();

///API REGISTER

app.post("/register", async (request, response) => {
  const { name, email, password } = request.body;

  // Check empty values
  if (!name && !email && !password) {
    response.status(400);
    return response.json({ error_msg: "form filled mandatory!" });
  }
  if (!name || name.trim() === "") {
    response.status(400);
    return response.json({ error_msg: "Username is required" });
  }

  if (!email || email.trim() === "") {
    response.status(400);
    return response.json({ error_msg: "Email is required" });
  }

  if (!password || password.trim() === "") {
    response.status(400);
    return response.json({ error_msg: "Password is required" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const userCheck = `SELECT * FROM users where name = '${name}'`;

  const userDB = await db.get(userCheck);
  // console.log(userDB);

  if (userDB === undefined) {
    const createUserQuery = `
    INSERT INTO users(name, email, password)
    VALUES('${name}', '${email}', '${hashPassword}')
  `;

    const dbResponse = await db.run(createUserQuery);
    const newuserId = dbResponse.lastID;

    return response.status(201).json({
      message: "Created new user successfully",
      userId: newuserId,
    });
  } else {
    return response.status(400).json({
      error_msg: "User already exists",
    });
  }
});

///API LOGIN

app.post("/login", async (request, response) => {
  const { name, password } = request.body;

  if (!name || !password) {
    response.status(400);
    response.send(response.json({ error_msg: "Enter user and Password" }));
  }
  if (!name || name.trim() === "") {
    return response.status(400).json({
      error_msg: "Username is required",
    });
  }

  if (!password || password.trim() === "") {
    return response.status(400).json({
      error_msg: "Password is required",
    });
  }

  const checkUser = `SELECT * FROM  users where name='${name}'`;

  const nameCheck = await db.get(checkUser);

  if (nameCheck === undefined) {
    return response.status(400).json({
      error_msg: "Invalid User",
    });
  } else {
    const isPasswordMatch = await bcrypt.compare(password, nameCheck.password);

    if (isPasswordMatch === true) {
      const payload = { name: name };
      const jwtToken = jwt.sign(payload, "asdf");

      return response.status(200).json({ jwtToken });
    } else {
      return response.status(400).json({
        error_msg: "Invalid Password",
      });
    }
  }
});

///API CATEGORY

app.post("/categories", async (request, response) => {
  const { category_name, image_url } = request.body;

  if (!category_name || category_name.trim() === "") {
    return response
      .status(400)
      .json({ error_msg: "Category name is required" });
  }

  try {
    const query = `INSERT INTO categories(category_name,image_url)
    VALUES (?,?)`;

    const dbResponse = await db.run(query, [category_name, image_url || null]);

    response.status(201).json({
      message: "Category added successfully",
      category_id: dbResponse.lastID,
    });
  } catch (error) {
    response.status(400).json({ error_msg: error.message });
  }
});

///API Product ADD

app.post("/products", async (request, response) => {
  const {
    product_name,
    description,
    price,
    image_url,
    category_id,
    stock,
    rating,
  } = request.body;

  if (!product_name || product_name.trim() === "") {
    return response.status(400).json({
      error_msg: "Product name is required",
    });
  }

  if (price === undefined || price === null || price === "") {
    return response.status(400).json({
      error_msg: "Price is required",
    });
  }

  if (!Number.isFinite(Number(price)) || Number(price) < 0) {
    return response.status(400).json({
      error_msg: "Price must be a valid non-negative number",
    });
  }

  if (
    stock !== undefined &&
    (!Number.isInteger(Number(stock)) || Number(stock) < 0)
  ) {
    return response.status(400).json({
      error_msg: "Stock must be a non-negative integer",
    });
  }

  if (
    rating !== undefined &&
    (!Number.isFinite(Number(rating)) ||
      Number(rating) < 0 ||
      Number(rating) > 5)
  ) {
    return response.status(400).json({
      error_msg: "Rating must be between 0 and 5",
    });
  }

  try {
    const query = `
    INSERT INTO products (
      product_name,
      description,
      price,
      image_url,
      category_id,
      stock,
      rating
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    const dbResponse = await db.run(query, [
      product_name.trim(),
      description || null,
      Number(price),
      image_url || null,
      category_id || null,
      stock === undefined ? 0 : Number(stock),
      rating === undefined ? 0 : Number(rating),
    ]);

    return response.status(201).json({
      message: "Product added successfully",
      product_id: dbResponse.lastID,
    });
  } catch (error) {
    return response.status(400).json({
      error_msg: error.message,
    });
  }
});

// API Products Bulk Add Multiple Products

app.post("/products/bulk", async (request, response) => {
  const { products } = request.body;

  if (!Array.isArray(products) || products.length === 0) {
    return response.status(400).json({
      error_msg: "Products array is required",
    });
  }

  try {
    await db.exec("BEGIN TRANSACTION");

    const query = `
  INSERT INTO products (
    product_name,
    description,
    price,
    image_url,
    category_id,
    stock,
    rating
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

    const addedProducts = [];

    for (const product of products) {
      const {
        product_name,
        description,
        price,
        image_url,
        category_id,
        stock,
        rating,
      } = product;

      if (
        typeof product_name !== "string" ||
        product_name.trim() === "" ||
        price === undefined ||
        price === null ||
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0 ||
        (stock !== undefined &&
          (!Number.isInteger(Number(stock)) || Number(stock) < 0))
      ) {
        throw new Error("Invalid product name, price, or stock");
      }

      const result = await db.run(query, [
        product_name.trim(),
        description || null,
        Number(price),
        image_url || null,
        category_id || null,
        stock === undefined ? 0 : Number(stock),
        rating === undefined ? 0 : Number(rating),
      ]);

      addedProducts.push({
        product_id: result.lastID,
        product_name: product_name.trim(),
      });
    }

    await db.exec("COMMIT");

    return response.status(201).json({
      message: "Products added successfully",
      count: addedProducts.length,
      products: addedProducts,
    });
  } catch (error) {
    await db.exec("ROLLBACK");

    return response.status(400).json({
      error_msg: error.message,
    });
  }
});

///Authentication

const authenticateToken = async (request, response, next) => {
  let token = null;
  const authHeader = request.headers["authorization"];

  if (authHeader !== undefined) {
    token = authHeader.split(" ")[1];
  }

  if (token === undefined) {
    return response.status(401).send("Invalid JWT Token");
  } else {
    jwt.verify(token, "asdf", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid Token");
      } else {
        request.name = payload.name;
        next();
      }
    });
  }
};

///USER PROFILE API

app.get("/profile", authenticateToken, async (request, response) => {
  const { name } = request;

  const checkName = `SELECT * FROM users where name= '${name}'`;
  const dbuser = await db.get(checkName);

  if (dbuser === undefined) {
    response.status(401);
    response.send("Invalid User");
  } else {
    response.send(dbuser);
  }
});

///API GET PRODUCTS

app.get("/products", authenticateToken, async (request, response) => {
  try {
    const { category_id, search, min_price, max_price, order } = request.query;

    let query = "SELECT * FROM products";

    const condition = [];
    const params = [];

    // Category filter
    if (category_id !== undefined && category_id !== "") {
      condition.push("category_id = ?");
      params.push(category_id);
    }

    // Search by product name
    if (search !== undefined && search.trim() !== "") {
      condition.push("product_name LIKE ?");
      params.push(`%${search.trim()}%`);
    }

    // Minimum price
    if (min_price !== undefined && min_price !== "") {
      const minPrice = Number(min_price);

      if (!Number.isFinite(minPrice) || minPrice < 0) {
        return response.status(400).json({
          error_msg: "Invalid minimum price",
        });
      }

      condition.push("price >= ?");
      params.push(minPrice);
    }

    // Maximum price
    if (max_price !== undefined && max_price !== "") {
      const maxPrice = Number(max_price);

      if (!Number.isFinite(maxPrice) || maxPrice < 0) {
        return response.status(400).json({
          error_msg: "Invalid maximum price",
        });
      }

      condition.push("price <= ?");
      params.push(maxPrice);
    }

    // Add WHERE when filters exist
    if (condition.length > 0) {
      query += " WHERE " + condition.join(" AND ");
    }

    // Sort products by price
    if (order !== undefined && order !== "") {
      const sortOrder = order.toLowerCase();

      if (sortOrder !== "asc" && sortOrder !== "desc") {
        return response.status(400).json({
          error_msg: "Order must be asc or desc",
        });
      }

      query += ` ORDER BY price ${sortOrder.toUpperCase()}`;
    }

    const products = await db.all(query, params);

    response.json(products);
  } catch (error) {
    response.status(500).json({
      error_msg: error.message,
    });
  }
});

///API Product Item Delete

app.delete(
  "/products/:productId/",
  authenticateToken,
  async (request, response) => {
    const { productId = null } = request.params;

    const query = `DELETE FROM products where product_id = ${productId}`;

    const dbResponse = await db.run(query);
    response.status(200).send("Delete Successfully");
  },
);

/// API BULK UPDATE PRODUCT RATINGS

app.put("/products/ratings/bulk", async (request, response) => {
  const { ratings } = request.body;

  if (!Array.isArray(ratings) || ratings.length === 0) {
    return response.status(400).json({
      error_msg: "Ratings array is required",
    });
  }

  try {
    await db.exec("BEGIN TRANSACTION");

    const updateQuery = `
      UPDATE products
      SET rating = ?
      WHERE product_id = ?
    `;

    const updatedProducts = [];

    for (const item of ratings) {
      const { product_id, rating } = item;

      if (
        product_id === undefined ||
        !Number.isInteger(Number(product_id)) ||
        Number(product_id) <= 0 ||
        rating === undefined ||
        !Number.isFinite(Number(rating)) ||
        Number(rating) < 0 ||
        Number(rating) > 5
      ) {
        throw new Error("Invalid product_id or rating");
      }

      const result = await db.run(updateQuery, [
        Number(rating),
        Number(product_id),
      ]);

      if (result.changes === 0) {
        throw new Error(`Product ID ${product_id} not found`);
      }

      updatedProducts.push({
        product_id: Number(product_id),
        rating: Number(rating),
      });
    }

    await db.exec("COMMIT");

    return response.status(200).json({
      message: "Product ratings updated successfully",
      count: updatedProducts.length,
      products: updatedProducts,
    });
  } catch (error) {
    await db.exec("ROLLBACK");

    return response.status(400).json({
      error_msg: error.message,
    });
  }
});

//description

/// API BULK UPDATE PRODUCT DESCRIPTION

app.put("/products/description/bulk", async (request, response) => {
  const { description } = request.body;

  if (!Array.isArray(description) || description.length === 0) {
    return response.status(400).json({
      error_msg: "Description is required array",
    });
  }

  try {
    await db.exec("BEGIN TRANSACTION");

    const queryDescription = `
      UPDATE products
      SET description = ?
      WHERE product_id = ?
    `;

    const updateDescription = [];

    for (const item of description) {
      const { product_id, description: productDescription } = item;

      console.log("Product ID:", product_id);
      console.log("Description:", productDescription);
      console.log("Description Type:", typeof productDescription);

      // Validation
      if (
        product_id === undefined ||
        !Number.isInteger(Number(product_id)) ||
        Number(product_id) <= 0 ||
        typeof productDescription !== "string" ||
        productDescription.trim() === ""
      ) {
        throw new Error("Product ID and description are required");
      }

      const result = await db.run(queryDescription, [
        productDescription.trim(),
        Number(product_id),
      ]);

      console.log("Update Result:", result);
      console.log("Changes:", result.changes);

      if (result.changes === 0) {
        throw new Error(`Product ID ${product_id} not found`);
      }

      updateDescription.push({
        product_id: Number(product_id),
        description: productDescription.trim(),
      });
    }

    await db.exec("COMMIT");
    console.log("Transaction Committed Successfully");

    return response.status(200).json({
      message: "Product descriptions updated successfully",
      count: updateDescription.length,
      products: updateDescription,
    });
  } catch (error) {
    await db.exec("ROLLBACK");

    return response.status(400).json({
      error_msg: error.message,
    });
  }
});

///API Product Itemm Details and Similar Products
app.get(
  "/products/:productId",
  authenticateToken,
  async (request, response) => {
    const { productId } = request.params;

    const productQuery = `
    SELECT * FROM products where product_id = ?`;

    const getProduct = await db.get(productQuery, [productId]);

    const similarProductsQuery = `
    SELECT * 
    FROM products 
    WHERE category_id = ?
      AND product_id != ?
    limit 4;
    `;

    const similarProducts = await db.all(similarProductsQuery, [
      getProduct.category_id,
      productId,
    ]);

    response.status(200).json({
      getProduct,
      similarProducts,
    });
  },
);

///API ADD TO CART
app.post("/cart", authenticateToken, async (request, response) => {
  try {
    const { productId, quantity } = request.body;
    const { name } = request;

    if (
      !Number.isInteger(Number(productId)) ||
      Number(productId) <= 0 ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return response.status(400).json({
        error_msg: "Invalid productId or quantity",
      });
    }

    //Get user ID
    const user = await db.get("SELECT user_id FROM users WHERE name=?", [name]);

    if (!user) {
      return response.status(404).json({
        error_msg: "User not found",
      });
    }

    //Check Product
    const product = await db.get(
      "SELECT * FROM products WHERE product_id = ?",
      [productId],
    );

    if (!product) {
      return response.status(404).json({
        error_msg: "Product not found",
      });
    }

    // Check product already exists in cart
    const existingItem = await db.get(
      `SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?`,
      [user.user_id, productId],
    );

    const oldQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = oldQuantity + Number(quantity);

    if (totalQuantity > product.stock) {
      return response.status(400).json({
        error_msg: "Insufficient stock",
      });
    }

    if (existingItem) {
      // Product already exists: Update quantity
      await db.run(
        `
        UPDATE cart
        SET quantity = ? 
        WHERE user_id = ? AND product_id = ?`,
        [totalQuantity, user.user_id, productId],
      );
    } else {
      // Product does not exist: Insert new product
      await db.run(
        `INSERT INTO cart(user_id,product_id,quantity)
        VALUES(?,?,?)`,
        [user.user_id, productId, totalQuantity],
      );
    }

    // Success response

    return response.status(200).json({
      message: "Product added to cart successfully",
    });
  } catch (error) {
    return response.status(500).json({
      error_msg: error.message,
    });
  }
});

////Cart GET
app.get("/cart", authenticateToken, async (request, response) => {
  try {
    const { name } = request;

    const user = await db.get("SELECT user_id FROM users WHERE name = ?", [
      name,
    ]);

    if (!user) {
      return response.status(404).json({
        error_msg: "User not found",
      });
    }

    const query = `
    SELECT 
    cart.cart_id as cartId,
    products.product_id as productId,
    products.product_name as productName,
    products.price as price,
    products.image_url as imageUrl,
    cart.quantity as quantity
    FROM cart 
    INNER JOIN products 
     ON cart.product_id  = products.product_id 
     WHERE cart.user_id = ?`;

    const cartItems = await db.all(query, [user.user_id]);

    response.status(200).json({ cartItems });
  } catch (error) {
    response.status(500).json({
      error_msg: error.message,
    });
  }
});

///Update Quantity in Cart
app.put("/cart/:productId", authenticateToken, async (request, response) => {
  try {
    const { productId } = request.params;
    const { quantity } = request.body;
    const { name } = request;

    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return response.status(400).json({
        error_msg: "Invalid quantity",
      });
    }

    const user = await db.get("SELECT user_id FROM users WHERE name = ?", [
      name,
    ]);

    if (!user) {
      return response.status(404).json({
        error_msg: "User not found",
      });
    }

    const product = await db.get(
      "SELECT stock FROM products WHERE product_id = ?",
      [productId],
    );

    if (!product) {
      return response.status(404).json({
        error_msg: "Product not found",
      });
    }

    if (Number(quantity) > product.stock) {
      return response.status(400).json({
        error_msg: "Insufficient stock",
      });
    }

    const result = await db.run(
      `UPDATE cart SET quantity = ?
       WHERE user_id = ? AND product_id = ?`,
      [Number(quantity), user.user_id, productId],
    );

    if (result.changes === 0) {
      return response.status(404).json({
        error_msg: "Cart item not found",
      });
    }

    response.status(200).json({
      message: "Quantity updated successfully",
    });
  } catch (error) {
    response.status(500).json({
      error_msg: error.message,
    });
  }
});

///Remove Cart Item
app.delete("/cart/:productId", authenticateToken, async (request, response) => {
  try {
    const { productId } = request.params;
    const { name } = request;

    const user = await db.get("SELECT user_id FROM users WHERE name = ?", [
      name,
    ]);

    if (!user) {
      return response.status(404).json({
        error_msg: "User not found",
      });
    }

    const result = await db.run(
      `DELETE FROM cart
       WHERE user_id = ? AND product_id = ?`,
      [user.user_id, productId],
    );

    if (result.changes === 0) {
      return response.status(404).json({
        error_msg: "Cart item not found",
      });
    }

    response.status(200).json({
      message: "Product removed successfully",
    });
  } catch (error) {
    response.status(500).json({
      error_msg: error.message,
    });
  }
});

///API PLACE ORDER

app.post("/orders", authenticateToken, async (request, response) => {
  try {
    const { name } = request;
    //get user
    const user = await db.get(`select user_id from users where name = ?`, [
      name,
    ]);

    if (!user) {
      return response.status(404).json({
        error_msg: "User not found",
      });
    }

    //Start transation
    await db.exec("BEGIN IMMEDIATE");

    //Get cart items with product details
    const cartItems = await db.all(
      `
      SELECT cart.product_id,
      cart.quantity,
      products.price,
      products.stock
      FROM cart 
      INNER JOIN products 
      ON cart.product_id = products.product_id
      WHERE cart.user_id = ?`,
      [user.user_id],
    );

    if (cartItems.length === 0) {
      await db.exec("ROLLBACK");

      return response.status(400).json({
        error_msg: "Yout cart is empty",
      });
    }

    //Check stock and calculate total
    let totalAmount = 0;

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }

      totalAmount += item.price * item.quantity;
    }

    ///Insert into orders table
    const orderResult = await db.run(
      `INSERT INTO orders(user_id ,total_amount)
      VALUES (?,?)`,
      [user.user_id, totalAmount],
    );

    const orderId = orderResult.lastID;

    //Insert products into order_items

    for (const item of cartItems) {
      await db.run(
        `INSERT INTO order_items 
        (order_id,product_id,quantity,price)
        VALUES(?,?,?,?)`,
        [orderId, item.product_id, item.quantity, item.price],
      );

      //Reduce product stock
      await db.run(
        `UPDATE products 
          SET stock = stock - ?
          WHERE product_id = ?`,
        [item.quantity, item.product_id],
      );
    }

    //Clear user's cart
    await db.run("DELETE FROM cart WHERE user_id = ?", [user.user_id]);

    //Save transaction
    await db.exec("COMMIT");

    return response.status(201).json({
      message: "Order placed successfully",
      orderId: orderId,
      totalAmount: totalAmount,
    });
  } catch (error) {
    await db.exec("ROLLBACK");

    return response.status(500).json({
      error_msg: error.message,
    });
  }
});

///API Order History
app.get("/orders/history", authenticateToken, async (request, response) => {
  try {
    const { name } = request;

    // Get logged-in user
    const user = await db.get(`SELECT user_id FROM users WHERE name = ?`, [
      name,
    ]);

    if (!user) {
      return response.status(404).send({
        error_msg: "User not found",
      });
    }

    // Get user's order history
    const orders = await db.all(
      `SELECT
          order_id AS orderId,
          total_amount AS totalAmount,
          order_status AS orderStatus,
          created_at AS createdAt
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC`,
      [user.user_id],
    );

    response.status(200).send({ orders });
  } catch (error) {
    response.status(500).send({
      error_msg: "Internal Server Error",
    });
  }
});

/// API UPDATE PRODUCT QUANTITY

/// API UPDATE PRODUCT QUANTITY

app.put("/products/:productId/quantity", async (request, response) => {
  try {
    const { productId } = request.params;
    const { quantity } = request.body;

    // Validate Product ID
    if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
      return response.status(400).json({
        error_msg: "Invalid Product ID",
      });
    }

    // Validate Quantity
    if (
      quantity === undefined ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return response.status(400).json({
        error_msg: "Quantity must be a non-negative integer",
      });
    }

    // Check Product Exists
    const product = await db.get(
      "SELECT * FROM products WHERE product_id = ?",
      [productId],
    );

    if (!product) {
      return response.status(404).json({
        error_msg: "Product not found",
      });
    }

    // Update Quantity
    const updateQuery = `
        UPDATE products
        SET stock = ?
        WHERE product_id = ?
      `;

    await db.run(updateQuery, [Number(quantity), Number(productId)]);

    return response.status(200).json({
      message: "Product quantity updated successfully",
      product_id: Number(productId),
      old_quantity: product.stock,
      new_quantity: Number(quantity),
    });
  } catch (error) {
    return response.status(500).json({
      error_msg: error.message,
    });
  }
});
