import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Cart.css";

const Products = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the checkStatus function.
  // This function should check if the user is logged in.
  // If not logged in, redirect to the login page.
  // if logged in, fetch the products
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here to check login status
      try {
        const response = await fetch(apiUrl + "/isLoggedIn",{
          credentials: "include"
        });
        
        if(response.status !== 200){
          navigate('/login', {replace: true});
        }
        else{
          fetchProducts();
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);

  // Read about useState to understand how to manage component state
  const [products, setProducts] = useState([]);
  const [allProducts,setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});

  // NOTE: You are free to add more states and/or handler functions
  // to implement the features that are required for this assignment

  // TODO: Fetch products from the APIx
  // This function should send a GET request to fetch products
  const fetchProducts = async () => {
    // Implement the API call here to fetch product data
    try{
      const resfromlistproducts = await fetch(apiUrl + "/list-products",{
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      const datafromlistproducts = await resfromlistproducts.json();
      if(resfromlistproducts.status === 200){
        setProducts(datafromlistproducts.products);
        setAllProducts(datafromlistproducts.products);

        const initialQuantity = {};
        datafromlistproducts.products.forEach((product) => {
          initialQuantity[product.product_id] = 0;
        });
        setQuantities(initialQuantity);
      }
      else if(resfromlistproducts.status === 400){
        alert(datafromlistproducts.message);
      }
      else if(resfromlistproducts.status === 500){
        alert(datafromlistproducts.message);
      }
    }catch(error){
      console.error(error);
    }
  };
  
  // TODO: Implement the product quantity change function
  // If the user clicks on plus (+), then increase the quantity by 1
  // If the user clicks on minus (-), then decrease the quantity by 1
  const handleQuantityChange = (productId, change) => {
    setQuantities((previousQuantity) => ({
      ...previousQuantity,
      [productId]: Math.max(0,(previousQuantity[productId] || 0) + change),
    }));
  }

  // TODO: Add the product with the given productId to the cart
  // the quantity of this product can be accessed by using a state
  // use the API you implemented earlier
  // display appropriate error messages if any
  const addToCart = async (productId) => {
    const quantity = quantities[productId] || 0;
    if(quantity < 1){
      alert(`Select aleast one item of product ID ${productId}`);
      return;
    }

    try{
      const resfromcart = await fetch(apiUrl + "/add-to-cart",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productid: productId, quantity }),
      });

      const datafromcart = await resfromcart.json();

      if(resfromcart.status === 200){
        alert("Product added to the cart");
      }
      else if(resfromcart.status === 400){
        alert(datafromcart.message);
      }
      else if(resfromcart.status === 500){
        alert(datafromcart.message);
      }
    }catch(error){
      console.error(error);
    }
  };

  const wishListFromProducts = async (productId) => {
    try{
      const resfromwishcart = await fetch(apiUrl + "/wishlist-from-products",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productid: productId }),
      });

      const datafromwishcart = await resfromwishcart.json();
      if(resfromwishcart.status === 200){
        alert(datafromwishcart.message);
      }
      else if(resfromwishcart.status === 400){
        alert(datafromwishcart.message);
      }
      else if(resfromwishcart.status === 500){
        alert(datafromwishcart.message);
      }
    }catch(error){
      console.error(error);
    }
  };

  // TODO: Implement the search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement the search logic here
    // use Array.prototype.filter to filter the products
    // that match with the searchTerm
    const filteredProducts = allProducts.filter((product) => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setProducts(filteredProducts);
  };


  // TODO: Display products with a table
  // Display each product's details, such as ID, name, price, stock, etc.
  return (
    <>
      <Navbar />
      <div className="cart-container">
        <h1>Product List</h1>
        {/* Implement the search form */}
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <table className="cart-table" border="1" cellPadding="8" style={{ tableLayout: 'fixed',width: '100%', marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Stock Available</th>
              <th>Quantity</th>
              <th border="3">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Map over the products array to display each product */}
            {products.length === 0 ? (
              <tr>
                <td colSpan="6">No products found</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.product_id}</td>
                  <td>{product.name}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.stock_quantity}</td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                    <button onClick={() => handleQuantityChange(product.product_id, -1)}>-</button>
                    <span style={{ margin: "0 10px" }}>
                      {quantities[product.product_id] || 0}
                    </span>
                    <button onClick={() => handleQuantityChange(product.product_id, 1)}>+</button>
                    </div>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                    <button onClick={() => addToCart(product.product_id)}>Add to Cart</button>
                    <button onClick={() => wishListFromProducts(product.product_id)}>Add to Wishlist</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Products;
