import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Cart.css";
import Navbar from "../components/Navbar";


const Cart = () => {
  const navigate = useNavigate();
  // TODO: Implement the checkStatus function
  // If the user is already logged in, fetch the cart.
  // If not, redirect to the login page.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement your logic to check if the user is logged in
      // If logged in, fetch the cart data, otherwise navigate to /login
      try {
        const response = await fetch(apiUrl + "/isLoggedIn",{
          credentials: "include"
        });
        
        if(response.status !== 200){
          navigate('/login', {replace: true});
        }
        else{
          fetchCart();
          fetchAddresses();
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);

  // TODO: Manage cart state with useState
  // cart: Stores the items in the cart
  // totalPrice: Stores the total price of all cart items
  // error: Stores any error messages (if any)
  // message: Stores success or info messages
  const [cart,setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // TODO: Implement the fetchCart function
  // This function should fetch the user's cart data and update the state variables
  const fetchCart = async () => {
    // Implement your logic to fetch the cart data
    // Use the API endpoint to get the user's cart
    try{
      const resfromcart = await fetch(apiUrl + "/display-cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
      const datafromcart = await resfromcart.json();
      if(resfromcart.status === 200){
        setCart(datafromcart.cart);
        setTotalPrice(datafromcart.totalPrice);
      }
      else if(resfromcart.status === 400){
        alert(datafromcart.message);
      }
      else if(resfromcart.status === 500){
        alert(datafromcart.message);
      }
    }catch(error){
      console.error(error);
      setError(error);
    }
  };


  const fetchAddresses = async () => {
    try{
        const resfromprofileaddresses = await fetch(apiUrl + "/profile-addresses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        });
        const datafromprofileaddresses = await resfromprofileaddresses.json();
        if(resfromprofileaddresses.status === 200){
            setAddresses(datafromprofileaddresses.addresses);
            if(datafromprofileaddresses.addresses.length > 0){
              setSelectedAddressId(datafromprofileaddresses.addresses[0].address_id);
            }
        }
        else if(resfromprofileaddresses.status === 400){
          alert(datafromprofileaddresses.message);
        }
        else if(resfromprofileaddresses.status === 500){
          alert(datafromprofileaddresses.message);
        }
      }catch(error){
        console.error(error);
        setError(error);
      }
  };

  // TODO: Implement the updateQuantity function
  // This function should handle increasing or decreasing item quantities
  // based on user input. Make sure it doesn't exceed stock limits.
  const updateQuantity = async (productId, change, currentQuantity, stockQuantity) => {
    // Implement your logic for quantity update
    // Validate quantity bounds and update the cart via API
    if(currentQuantity < stockQuantity){
      try{
        const resfromupdatecart = await fetch(apiUrl + "/update-cart",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productid: productId, quantity: change}),
        });

        const datafromupdatecart = await resfromupdatecart.json();
        if(resfromupdatecart.status === 200){
          fetchCart();
          alert(datafromupdatecart.message);
        }
        else if(resfromupdatecart.status === 400){
          alert(datafromupdatecart.message);
        }
        else if(resfromupdatecart.status === 500){
          alert(datafromupdatecart.message);
        }

      }catch(error){
        console.error(error);
        setError(error);
      }
    }
    else{
      alert("Stock Quantity is reached");
    }
  };

  // TODO: Implement the removeFromCart function
  // This function should remove an item from the cart when the "Remove" button is clicked
  const removeFromCart = async (productId) => {
    // Implement your logic to remove an item from the cart
    // Use the appropriate API call to handle this
    try{
      const resfromremcart = await fetch(apiUrl + "/remove-from-cart",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productid: productId }),
      });

      const datafromremcart = await resfromremcart.json();
      if(resfromremcart.status === 200){
        fetchCart();
        alert(datafromremcart.message);
      }
      else if(resfromremcart.status === 400){
        alert(datafromremcart.message);
      }
      else if(resfromremcart.status === 500){
        alert(datafromremcart.message);
      }
    }catch(error){
      console.error(error);
      setError(error);
    }
  };

  const wishListFromCart = async (productId) => {
    try{
      const resfromwishcart = await fetch(apiUrl + "/wishlist-from-cart",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productid: productId }),
      });

      const datafromwishcart = await resfromwishcart.json();
      if(resfromwishcart.status === 200){
        fetchCart();
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
      setError(error);
    }
  };

  // TODO: Implement the handleCheckout function
  // This function should handle the checkout process and validate the address fields
  // If the user is ready to checkout, place the order and navigate to order confirmation
  const handleCheckout = async () => {
    // Implement your logic for checkout, validate address and place order
    // Make sure to clear the cart after successful checkout
    if(!selectedAddressId){
      alert('Please select a delivery address');
      return;
    }

    try{
      const resfromplaceorder = await fetch(apiUrl + "/place-order",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          id: selectedAddressId  
        })
      });

      const datafromplaceorder = await resfromplaceorder.json();
      if(resfromplaceorder.status === 200){
        setCart([]);
        setTotalPrice(0);
        setMessage("Order placed successfully");
        navigate('/order-confirmation', { replace: true });
      }
      else if(resfromplaceorder.status === 400){
        alert(datafromplaceorder.message);
      }
      else if(resfromplaceorder.status === 500){
        alert(datafromplaceorder.message);
      }
    }catch(error){
      console.error(error);
      setError("Checkout failed. please try again");
    }
  };

  // TODO: Implement the handlePinCodeChange function
  // This function should fetch the city and state based on pincode entered by the user
  

  // TODO: Display error messages if any error occurs
  if (error) {
    return <div className="cart-error">{error}</div>;
  }

  return (
    <>
      <div className="cart-container">
        <Navbar />
        <h1>Your Cart</h1>

        {/* TODO: Display the success or info message */}
        {message && <div className="cart-message">{message}</div>}

        {/* TODO: Implement the cart table UI */}
        {/* If cart is empty, display an empty cart message */}
        {cart.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty</p>
        ) : (
          <>
            <table className="cart-table" border="1" cellPadding="8" style={{ marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* TODO: Render cart items dynamically */}
                {/* Use map() to render each cart item */}
                {cart.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.name}</td>
                    <td>${item.price}</td>
                    <td>{item.stock_quantity}</td>
                    <td>
                      <button onClick={() => updateQuantity(item.product_id, -1, item.quantity, item.stock_quantity)}
                      disabled={item.quantity<=1}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1, item.quantity, item.stock_quantity)}
                      disabled={item.quantity>=item.stock_quantity}>+</button>
                    </td>
                    <td>${Number(item.total_price).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.product_id)}>Remove</button>
                      <button onClick={() => wishListFromCart(item.product_id)}>Add to Wishlist</button>
                    </td>
                    {/* TODO: Render product details here */}
                    {/* Display item name, price, stock, quantity, and total */}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TODO: Implement the address form */}
            {/* Allow users to input pincode, street, city, and state */}
            <h3>Select Delivery Address</h3>
            {addresses.map((addr) => (
              <div key={addr.address_id}>
                <label>
                  <input
                    type="radio"
                    name="selectedAddress"
                    value={addr.address_id}
                    checked={selectedAddressId === addr.address_id}
                    onChange={() => setSelectedAddressId(addr.address_id)}
                  />
                  {addr.street}, {addr.city}, {addr.state}, {addr.pincode}
                </label>
              </div>
            ))}

            <p>Add an Address? <a href="../profile/addresses">Go here</a></p>
            
            {/* TODO: Display total price and the checkout button */}
            <div className="cart-total">
              {/* Display the total price */}
              <h3>Total: ${totalPrice}</h3>
              {/* Checkout button should be enabled only if there are items in the cart */}
              <button onClick={handleCheckout} disabled={cart.length === 0}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
