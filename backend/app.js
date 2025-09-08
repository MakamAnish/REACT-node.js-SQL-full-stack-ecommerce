const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;
const saltRounds = 10;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'project',
  password: '12345678',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
function isLoggedIn(req,res,next){
  if(req.session.userId){
    return res.status(200).json({ message: "Already Logged In" });
  }
  next();
}

function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(400).json( { message: "Unautherized" });
  }
  next();
}

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', isLoggedIn, async (req, res) => {


  const hash_password = bcrypt.hashSync(req.body.password,saltRounds);
  
  const q = "INSERT INTO Users (username,email,password_hash) VALUES ($1,$2,$3) RETURNING user_id";
  const v = [req.body.username,req.body.emailid,hash_password];

  try{
    const result = await pool.query(q,v);
    req.session.userId = result.rows[0].user_id;
    return res.status(200).json({ message: "User Registered Successfully"});
  } catch (error) {
    if (error.code === '23505'){
      return res.status(400).json({
        email_error : "This email is already taken",
        email : req.body.emailid,
        username : req.body.username,
        password : req.body.password,
        message : "Error: Email is already registered."
      })      
    }
    else{
      return res.status(500).json({message: "Error signing up"});
    }
    
  }


});

// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  const Email  = req.body.emailid;
  const Password = req.body.password;
  
  const q = "SELECT user_id,password_hash FROM Users WHERE email = $1";
  const v = [Email];
  try{
    result = await pool.query(q,v);
    if (result.rowCount === 0){
      return res.status(400).json({
        email_error : undefined,
        password_error : 'Password is incorrect',
        email : Email,
        password : Password,
        message : 'Invalid credentials'
      });
    }
    const hashed_password = result.rows[0].password_hash;
    
    if(hashed_password){
      if(bcrypt.compareSync(Password,hashed_password)){
        req.session.userId = result.rows[0].user_id;
        return res.status(200).json({message: "Login successful"});
      }
      else{
        return res.status(500).json({
          email_error : undefined,
          password_error : 'Password is incorrect',
          email : Email,
          password : Password,
          message : 'Error logging in'
        });
      }
    }
  }catch(error){
    
    return res.status(500).json({
      email_error : 'Email-Id does not exist! Please Sign up',
      password_error : undefined,
      email : Email,
      password : Password,
      message : 'Error logging in'
    });
    
  }

});


// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  if (req.session.userId) {
    const userId2 = req.session.userId;
    const q = "SELECT username FROM Users WHERE user_id = $1";
    const v = [userId2];

    try{
      result = await pool.query(q,v);

      return res.status(200).json({message: 'Logged In',username: result.rows[0].username});

    }catch(error){
      console.error(error);
      res.json("Server Error");
    }

    
  }
  else{
    return res.status(400).json({message: 'Not logged In'});  
  }

});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({message: 'Failed to log out'});
    }
    return res.status(200).json({message: 'Logged out successfully'});
  });
});

////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database
app.get("/list-products", isAuthenticated, async (req, res) => {
  try{
    // Query to get all products
    const result = await pool.query('SELECT * FROM Products ORDER BY product_id ASC');
    
    res.status(200).json({message: "Products fetched successfully", products: result.rows });
  }catch (error) {
    console.error(error);
    res.status(500).json({message: "Error listing products"});
  }
});

// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
  const Product_id = req.body.productid;
  const Quantity = req.body.quantity;

  const q = "SELECT product_id,stock_quantity,name FROM Products WHERE product_id = $1";
  const v = [Product_id];

  try{
    
    result = await pool.query(q,v);
    if(result.rows.length === 0){
      return res.status(400).json({
        productID_error : 'This Product ID does not exist',
        quantity_error : undefined,
        add_success : undefined,
        productID : Product_id,
        quantity : Quantity,
        message: 'Invalid product ID'
      });
    }
    else{
      const productName = result.rows[0].name;
      if(result.rows[0].stock_quantity < Quantity){
        return res.status(400).json({
          productID_error : undefined,
          quantity_error : 'Insufficient Stock',
          add_success : undefined,
          productID : Product_id,
          quantity : Quantity,
          message: `Insufficient stock for ${productName}.`
        });
      }
      else{
        const userID = req.session.userId;

        const q2 = 'SELECT * FROM Cart WHERE item_id = $2 AND user_id = $1';
        const v2 = [userID, Product_id];
        result2 = await pool.query(q2,v2);
        if(result2.rows.length === 0){
          
          const q3 = 'INSERT INTO Cart (user_id, item_id, quantity) VALUES ($1,$2,$3)';
          const v3 = [userID, Product_id , Quantity];

          result3 = await pool.query(q3,v3);
          return res.status(200).json({
            productID_error : undefined,
            quantity_error : undefined,
            add_success : 'Items Successfully added to Cart!',
            productID : '',
            quantity : '',
            message: `Successfully added ${Quantity} of ${productName} to your cart.`
          });
          
        }
        else{
          const new_quantity = parseInt(Quantity,10) + parseInt(result2.rows[0].quantity,10);
          if(result.rows[0].stock_quantity < new_quantity){
            return res.status(400).json({
              productID_error : undefined,
              quantity_error : 'Insufficient Stock (Along with quantity in your cart)',
              add_success : undefined,
              productID : Product_id,
              quantity : Quantity,
              message: `Insufficient stock for ${productName}.`
            });
          }
          else{
            const q4 = 'UPDATE Cart SET quantity = $3 WHERE user_id = $1 AND item_id = $2';
            const v4 = [userID, Product_id , new_quantity];
            result4 = await pool.query(q4,v4);
            return res.status(200).json({
              productID_error : undefined,
              quantity_error : undefined,
              add_success : 'Updated the Cart Successfully',
              productID : '',
              quantity : '',
              message: `Successfully added ${Quantity} of ${productName} to your cart.`
            });
          }
        }

        
      }
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error adding to cart'});
  }
});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
  try{
    const q = `SELECT 
                Products.product_id AS product_id,
                Products.name AS name,
                Cart.quantity AS quantity,
                Products.price AS price,
                (Cart.quantity*Products.price) AS total_price,
                Products.stock_quantity AS stock_quantity,
                CASE 
                  WHEN Products.stock_quantity < Cart.quantity THEN 1
                  ELSE 0
                END AS stock_status
              FROM Products JOIN Cart ON Products.product_id = Cart.item_id
              WHERE Cart.user_id = $1
              ORDER BY Products.product_id ASC`;
    const v = [req.session.userId];
    result = await pool.query(q,v);

    if(result.rows.length === 0){
      res.status(200).json({
        message: "No items in cart.", 
        cart: [], 
        totalPrice: 0
      })
    }
    else{
      const Total_price = parseFloat(result.rows.reduce((sum,row) => sum + parseFloat(row.total_price),0)).toFixed(2);
      res.status(200).json({
        yourcart: result.rows,
        yourcartlength: result.rows.length,
        Total_Price: Total_price,
        sufficient_error: undefined,
        message: "Cart fetched successfully.", 
        cart: result.rows, 
        totalPrice: Total_price
      });
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error fetching cart'});
  }
});


app.get("/display-wishlist", isAuthenticated, async (req, res) => {
  try{
    const q = `SELECT 
                Products.product_id AS product_id,
                Products.name AS name,
                Products.price AS price,
                Products.stock_quantity AS stock_quantity
              FROM Products JOIN WishList ON Products.product_id = WishList.item_id
              WHERE WishList.user_id = $1
              ORDER BY Products.product_id ASC`;
    const v = [req.session.userId];
    result = await pool.query(q,v);

    if(result.rows.length === 0){
      res.status(200).json({
        message: "No items in wishlist.", 
        wishlist: []
      })
    }
    else{
      res.status(200).json({
        yourcart: result.rows,
        yourcartlength: result.rows.length,
        sufficient_error: undefined,
        message: "Wishlist fetched successfully.", 
        wishlist: result.rows
      });
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error fetching wishlist'});
  }
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {
  const Product_id = req.body.productid;
  const userID = req.session.userId;
  const q = 'DELETE FROM Cart WHERE user_id = $1 AND item_id = $2';
  const v = [userID , Product_id];

  try{
    result = await pool.query(q,v);
    if(result.rowCount === 0){
      return res.status(400).json({
        productID_error : 'Item not found',
        productID : Product_id,
        add_success : undefined,
        message: "Item not present in your cart."
      });
    }
    else{
      return res.status(200).json({
        productID_error : undefined,
        productID : '',
        add_success : 'Item successfully removed from the Cart!',
        message: "Item removed from your cart successfully."
      });
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error removing item from cart'});
  }

});


app.post("/remove-from-wishlist", isAuthenticated, async (req, res) => {
  const Product_id = req.body.productid;
  const userID = req.session.userId;

  if(Product_id === -1){
    const q2 = 'DELETE FROM WishList WHERE user_id = $1';
    const v2 = [userID];

    try{
      result2 = await pool.query(q2,v2);
      if(result2.rowCount === 0){
        return res.status(400).json({
          productID_error : 'Item not found',
          productID : Product_id,
          add_success : undefined,
          message: "Item not present in your wishlist."
        });
      }
      else{
        return res.status(200).json({
          productID_error : undefined,
          productID : '',
          add_success : 'Items successfully removed from the WishList!',
          message: "Items removed from your wishlist successfully."
        });
      }
    }catch(error){
      console.error(error);
      res.status(500).json({message: 'Error removing items from wishlist'});
    }
  }
  else{
    const q = 'DELETE FROM WishList WHERE user_id = $1 AND item_id = $2';
    const v = [userID , Product_id];

    try{
      result = await pool.query(q,v);
      if(result.rowCount === 0){
        return res.status(400).json({
          productID_error : 'Item not found',
          productID : Product_id,
          add_success : undefined,
          message: "Item not present in your wishlist."
        });
      }
      else{
        return res.status(200).json({
          productID_error : undefined,
          productID : '',
          add_success : 'Item successfully removed from the Cart!',
          message: "Item removed from your wishlist successfully."
        });
      }
    }catch(error){
      console.error(error);
      res.status(500).json({message: 'Error removing item from wishlist'});
    }
  }
});


app.post("/wishlist-from-products", isAuthenticated, async (req,res) => {
  const Product_id = req.body.productid;
  const userID = req.session.userId;
  const q3 = 'SELECT item_id FROM WishList WHERE user_id = $1 AND item_id = $2';
  const v3 = [userID, Product_id];
  const q2 = 'INSERT INTO WishList (user_id, item_id) VALUES ($1,$2)'
  const v2 = [userID , Product_id];

  try{
    result3 = await pool.query(q3,v3);
    if(result3.rows.length > 0){
      return res.status(400).json({
        message: "Item already in Wish list!"
      });
    }
    else{
      
      result2 = await pool.query(q2,v2);
      return res.status(200).json({
        productID_error : undefined,
        productID : '',
        add_success : 'Item successfully moved from the Products to WishList!',
        message: "Item moved from your Products to Wish list successfully."
      });
      
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error moving item from Products to wishlist'});
  }
});


app.post("/wishlist-from-cart", isAuthenticated, async (req,res) => {
  const Product_id = req.body.productid;
  const userID = req.session.userId;
  const q3 = 'SELECT item_id FROM WishList WHERE user_id = $1 AND item_id = $2';
  const v3 = [userID, Product_id];
  const q = 'DELETE FROM Cart WHERE user_id = $1 AND item_id = $2';
  const v = [userID , Product_id];
  const q2 = 'INSERT INTO WishList (user_id, item_id) VALUES ($1,$2)'
  const v2 = [userID , Product_id];

  try{
    result3 = await pool.query(q3,v3);
    if(result3.rows.length > 0){
      return res.status(400).json({
        message: "Item already in Wish list!"
      });
    }
    else{
      result = await pool.query(q,v);
      if(result.rowCount === 0){
        return res.status(400).json({
          productID_error : 'Item not found',
          productID : Product_id,
          add_success : undefined,
          message: "Item not present in your cart."
        });
      }
      else{
        result2 = await pool.query(q2,v2);
        return res.status(200).json({
          productID_error : undefined,
          productID : '',
          add_success : 'Item successfully moved from the Cart to WishList!',
          message: "Item moved from your cart to Wish list successfully."
        });
      }
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error moving item from cart to wishlist'});
  }
});


app.post("/cart-from-wishlist", isAuthenticated, async (req, res) => {
  const Product_id = req.body.productid;
  const userID = req.session.userId;
  if(Product_id === -1){
    const q3 = `INSERT INTO Cart (user_id, item_id, quantity)
                SELECT user_id, item_id, 1
                FROM WishList
                WHERE user_id = $1
                AND item_id NOT IN (
                  SELECT item_id FROM Cart WHERE user_id = $1
                )`;
    const v3 = [userID];
    const q4 = 'DELETE FROM WishList WHERE user_id = $1';
    const v4 = [userID];
    try{
      result3 = await pool.query(q3,v3);
      result4 = await pool.query(q4,v4);
      return res.status(200).json({
        message: "Items moved from your Wish list to cart successfully."
      });
    }catch(error){
      console.error(error);
      res.status(500).json({message: 'Error moving items from wishlist to cart'});
    }
  }
  else{
    const q = 'DELETE FROM WishList WHERE user_id = $1 AND item_id = $2';
    const v = [userID , Product_id];
    const q2 = 'INSERT INTO Cart (user_id, item_id, quantity) VALUES ($1,$2,$3)'
    const v2 = [userID , Product_id, 1];

    try{
      result = await pool.query(q,v);
      if(result.rowCount === 0){
        return res.status(400).json({
          productID_error : 'Item not found',
          productID : Product_id,
          add_success : undefined,
          message: "Item not present in your wishlist."
        });
      }
      else{
        result2 = await pool.query(q2,v2);
        return res.status(200).json({
          productID_error : undefined,
          productID : '',
          add_success : 'Item successfully moved from the WishList to Cart!',
          message: "Item moved from your Wish list to cart successfully."
        });
      }
    }catch(error){
      console.error(error);
      res.status(500).json({message: 'Error moving item from wishlist to cart'});
    }
  }
});

// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {
  const Product_id = req.body.productid;
  const Quantity = req.body.quantity;

  const q = "SELECT product_id,stock_quantity,name FROM Products WHERE product_id = $1";
  const v = [Product_id];

  try{
    
    result = await pool.query(q,v);
    if(result.rows.length === 0){
      return res.status(500).json({
        productID_error : 'This Product ID does not exist',
        quantity_error : undefined,
        add_success : undefined,
        productID : Product_id,
        quantity : Quantity,
        message: 'Error updating cart'
      });
    }
    else{
      const productName = result.rows[0].name;
      if(result.rows[0].stock_quantity < Quantity){
        return res.status(400).json({
          productID_error : undefined,
          quantity_error : 'Insufficient Stock',
          add_success : undefined,
          productID : Product_id,
          quantity : Quantity,
          message: "Requested quantity exceeds available stock"
        });
      }
      else{
        const userID = req.session.userId;

        const q2 = 'SELECT * FROM Cart WHERE item_id = $2 AND user_id = $1';
        const v2 = [userID, Product_id];
        result2 = await pool.query(q2,v2);
        if(result2.rows.length === 0){
          if(Quantity > 0){
            const q3 = 'INSERT INTO Cart (user_id, item_id, quantity) VALUES ($1,$2,$3)';
            const v3 = [userID, Product_id , Quantity];

            result3 = await pool.query(q3,v3);
            return res.status(200).json({
              productID_error : undefined,
              quantity_error : undefined,
              add_success : 'Items Successfully added to Cart!',
              productID : '',
              quantity : '',
              message: 'Cart updated successfully'
            });
          }
          
        }
        else{
          const new_quantity = parseInt(Quantity,10) + parseInt(result2.rows[0].quantity,10);
          if(result.rows[0].stock_quantity < new_quantity){
            return res.status(400).json({
              productID_error : undefined,
              quantity_error : 'Insufficient Stock (Along with quantity in your cart)',
              add_success : undefined,
              productID : Product_id,
              quantity : Quantity,
              message: 'Requested quantity exceeds available stock'
            });
          }
          else{
            if(new_quantity > 0){
              const q4 = 'UPDATE Cart SET quantity = $3 WHERE user_id = $1 AND item_id = $2';
              const v4 = [userID, Product_id , new_quantity];
              result4 = await pool.query(q4,v4);
            }
            else{
              const q5 = 'DELETE FROM CART WHERE user_id = $1 AND item_id = $2';
              const v5 = [userID, Product_id];
              result5 = await pool.query(q5,v5);
            }
            return res.status(200).json({
              productID_error : undefined,
              quantity_error : undefined,
              add_success : 'Updated the Cart Successfully',
              productID : '',
              quantity : '',
              message: 'Cart updated successfully'
            });
          }
        }

        
      }
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error updating cart'});
  }
});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {
  try{
    const { id } = req.body;
    const q = `SELECT 
                Products.product_id AS product_id,
                Products.name AS name,
                Cart.quantity AS quantity,
                Products.price AS price,
                (Cart.quantity*Products.price) AS total_price,
                CASE 
                  WHEN Products.stock_quantity < Cart.quantity THEN 1
                  ELSE 0
                END AS stock_status
              FROM Products JOIN Cart ON Products.product_id = Cart.item_id
              WHERE Cart.user_id = $1
              ORDER BY Products.product_id ASC`;
    const v = [req.session.userId];
    const result = await pool.query(q,v);
    if(result.rows.length === 0){
      return res.status(400).json({
        message: "Cart is empty"
      });
    }
    const Total_price = result.rows.reduce((sum,row) => sum + parseFloat(row.total_price),0);
    const sufficient = result.rows.reduce((sum,row) => sum + parseInt(row.stock_status),0);
    let productName;
    for(const row of result.rows){
      if(row.stock_status){
        productName =  row.name;
        break;
      }
    }
    if(sufficient != 0){
      return res.status(400).json({
        yourcart: result.rows,
        yourcartlength: result.rows.length,
        Total_Price: Total_price,
        sufficient_error : 'One or more items are not in stock',
        message: `Insufficient stock for ${productName}`
      });
    }
    else{
      const q2 = 'INSERT INTO Orders (user_id,total_amount) VALUES ($1,$2) RETURNING order_id';
      const v2 = [req.session.userId,Total_price];

      const result2 = await pool.query(q2,v2);
      const Order_ID = result2.rows[0].order_id;
      req.session.order_id = Order_ID;

      const q3 = 'INSERT INTO OrderItems (order_id,product_id,quantity,price) VALUES ($1,$2,$3,$4)';
      for(const row of result.rows){
        await pool.query(q3,[Order_ID,row.product_id,row.quantity,row.price]);
      }

      const q7 = 'SELECT street,city,state,pincode FROM UserAddress WHERE user_id = $1 AND address_id = $2';
      const v7 = [req.session.userId, id];
      const result7 = await pool.query(q7,v7);

      const q6 = 'INSERT INTO OrderAddress (order_id,street,city,state,pincode) VALUES ($1,$2,$3,$4,$5)';
      const result6 = await pool.query(q6,[Order_ID, result7.rows[0].street, result7.rows[0].city, result7.rows[0].state, result7.rows[0].pincode]);

      const q4 = 'UPDATE Products SET stock_quantity = stock_quantity - $2 WHERE product_id = $1';
      for(const row of result.rows){
        await pool.query(q4,[row.product_id,parseInt(row.quantity)]);
      }

      const q5 = 'DELETE FROM CART WHERE user_id = $1';
      const v5 = [req.session.userId];

      const result5 = await pool.query(q5,v5);

      return res.status(200).json({message: 'Order placed successfully'});
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error placing order'});
  }
});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {
  try{
    const q = `SELECT 
              Products.product_id AS product_id,
              Products.name AS name,
              OrderItems.quantity AS quantity,
              OrderItems.price AS price,
              (OrderItems.price*OrderItems.quantity) AS mid_price,
              Orders.total_amount AS total_amount,
              Orders.order_date AS order_date,
              Orders.order_id AS order_id
              FROM OrderItems
              JOIN Orders ON OrderItems.order_id = Orders.order_id
              JOIN Products ON OrderItems.product_id = Products.product_id
              WHERE Orders.user_id = $1 AND Orders.order_id = $2
              ORDER BY Products.product_id ASC`;
    const v = [req.session.userId,req.session.order_id];
    if(req.session.order_id){
      const result = await pool.query(q,v);
      res.status(200).json({
        Order_id: result.rows[0].order_id,
        Order_date: result.rows[0].order_date,
        Total_Price: result.rows[0].total_amount,
        yourOrder: result.rows,

      });
    }
    else{
      res.status(400).json({message: 'Order not found'});
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error fetching order details'});
  }
});


app.get('/profile', isAuthenticated, async (req, res) => {
  const q = 'SELECT username, email FROM Users WHERE user_id = $1';
  const v = [req.session.userId];

  try{
    const result = await pool.query(q,v);
    if(result.rowCount > 0){
      return res.status(200).json({
        message: "Username,email succesfully retained!",
        username: result.rows[0].username,
        emailid: result.rows[0].email 
      });
    }
    else{
      return res.status(400).json({
        message: "Error retaining Username,email!"
      });
    }
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Error retaining Username,email!"
    });
  }
});

app.get('/profile-addresses', isAuthenticated, async (req, res) => {
  const q = 'SELECT address_id,street,city,state,pincode FROM UserAddress WHERE user_id = $1';
  const v = [req.session.userId];

  try{
    const result = await pool.query(q,v);
    if(result.rowCount >= 0){
      return res.status(200).json({
        message: "Saved addresses succesfully retained!",
        addresses: result.rows 
      });
    }
    else{
      return res.status(400).json({
        message: "Error retaining Saved addresses!"
      });
    }
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Error retaining Saved addresses!"
    });
  }
});

app.post('/profile-update', isAuthenticated, async (req, res) => {
  const { username, emailid } = req.body;
  const q = 'UPDATE Users SET username = $1, email = $2 WHERE user_id = $3';
  const v = [username, emailid, req.session.userId];

  try{
    const result = await pool.query(q,v);
    if(result.rowCount === 1){
      return res.status(200).json({
        message: "Profile updated successfully!",
      });
    }
    else{
      return res.status(400).json({
        message: "Error updating profiles!"
      });
    }
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Error updating profiles!"
    });
  }
});

app.post('/profile/address-change', isAuthenticated, async (req, res) => {
  const address = req.body;
  const q = `UPDATE UserAddress 
             SET street = $1,
                 city = $2,
                 state = $3,
                 pincode = $4
             WHERE user_id = $5 AND address_id = $6`;
  const v = [address.street, address.city, address.state, address.pincode, req.session.userId, address.address_id];
  try{
    const result = await pool.query(q,v);
    if(result.rowCount === 1){
      return res.status(200).json({
        message: "Address changed successfully!",
      });
    }
    else{
      return res.status(400).json({
        message: "Error changing address!"
      });
    }
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Error changing address!"
    });
  }
});

app.post('/profile/add-address', isAuthenticated, async (req, res) => {
  const { street, city, state, pincode } = req.body;
  const q = 'INSERT INTO UserAddress (user_id,street,city,state,pincode) VALUES ($1,$2,$3,$4,$5)';
  const v = [req.session.userId, street, city, state, pincode];
  try{
    const result = await pool.query(q,v);
    if(result.rowCount === 1){
      return res.status(200).json({
        message: "New address added successfully!",
      });
    }
    else{
      return res.status(400).json({
        message: "Error adding new address!"
      });
    }
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Error adding new address!"
    });
  }
});

app.post('/profile/delete-address', isAuthenticated, async (req, res) => {
  const {id} = req.body;
  const q = 'DELETE FROM UserAddress WHERE address_id = $1 AND user_id = $2';
  const v = [id, req.session.userId];
  try{
    const result = await pool.query(q,v);
    if(result.rowCount === 1){
      return res.status(200).json({
        message: "Address deleted successfully!",
      });
    }
    else{
      return res.status(400).json({
        message: "Error deleting address!"
      });
    }
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Error deleting address!"
    });
  }
});


app.get('/profile/order-history', isAuthenticated, async (req, res) => {
  const q = `SELECT
             Orders.order_id AS order_id,
             Orders.order_date AS order_date,
             Orders.total_amount AS total_amount,
             OrderAddress.street AS street,
             OrderAddress.city AS city,
             OrderAddress.state AS state,
             OrderAddress.pincode AS pincode
             FROM Orders
             JOIN OrderAddress ON Orders.order_id = OrderAddress.order_id
             WHERE Orders.user_id = $1`;
  const v = [req.session.userId];
  try{
    const result = await pool.query(q,v);
    if(result.rowCount >= 0){
      return res.status(200).json({
        message: "Saved addresses succesfully retained!",
        orderhistory: result.rows 
      });
    }
    else{
      return res.status(400).json({
        message: "Error retaining Saved addresses!"
      });
    }
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Error retaining Saved addresses!"
    });
  }
});

app.get('/profile/order-history-products', isAuthenticated, async (req, res) => {
  const OrderId = req.query.OrderId;
  const q =  `SELECT 
              Products.product_id AS product_id,
              Products.name AS name,
              OrderItems.quantity AS quantity,
              OrderItems.price AS price,
              (OrderItems.price*OrderItems.quantity) AS mid_price
              FROM OrderItems
              JOIN Orders ON OrderItems.order_id = Orders.order_id
              JOIN Products ON OrderItems.product_id = Products.product_id
              WHERE Orders.user_id = $1 AND Orders.order_id = $2
              ORDER BY Products.product_id ASC`;
  const v = [req.session.userId, OrderId];
  try{
    const result = await pool.query(q,v);
    if(result.rowCount >= 0){
      return res.status(200).json({
        message: "Saved addresses succesfully retained!",
        products: result.rows 
      });
    }
    else{
      return res.status(400).json({
        message: "Error retaining Saved addresses!"
      });
    }
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Error retaining Saved addresses!"
    });
  }
});


////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});