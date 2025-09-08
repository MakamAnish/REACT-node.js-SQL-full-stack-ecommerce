import React from "react";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { data, useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Cart.css";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  // TODO: Implement the checkStatus function
  // If the user is logged in, fetch order details.
  // If not logged in, redirect the user to the login page.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement logic here to check if the user is logged in
      // If not, navigate to /login
      // Otherwise, call the fetchOrderConfirmation function
      try {
        const response = await fetch(apiUrl + "/isLoggedIn",{
          credentials: "include"
        });
        
        if(response.status !== 200){
          navigate('/login', {replace: true});
        }
        else{
          fetchOrderConfirmation();
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);

  // TODO: Use useState to manage the orderDetails and error state
  const [orderDetails, setOrderDetails] = useState({
    orderID: "",
    orderDate: new Date(),
    totalPrice: 0,
    yourOrder: []
  });
  const [error,setError] = useState("");

  // TODO: Implement the fetchOrderConfirmation function
  // This function should fetch order details from the API and set the state
  const fetchOrderConfirmation = async () => {
    // Implement your API call to fetch order details
    // Update the orderDetails state with the response data
    // Show appropriate error messages if any.
    try{
      const resfromorderconfirmation = await fetch(apiUrl + "/order-confirmation",{
        method: "GET",
        headers: {
          "Content-Type": "application-json"
        },
        credentials: "include",
      });

      const datafromorderconfirmation = await resfromorderconfirmation.json();
      if(resfromorderconfirmation.status === 200){
        setOrderDetails({
          orderID: datafromorderconfirmation.Order_id,
          orderDate: datafromorderconfirmation.Order_date,
          totalPrice: datafromorderconfirmation.Total_Price,
          yourOrder: datafromorderconfirmation.yourOrder
        });
      }
      else if(resfromorderconfirmation.status === 400){
        setError(datafromorderconfirmation.message);
      }
      else if(resfromorderconfirmation.status === 500){
        setError(datafromorderconfirmation.message);
      }
    }catch(error){
      console.error(error);
      setError(error);
    }
  };

  return (
    <>
    {/* Implement the JSX for the order-confirmation
     page as described in the assignment. */}
      <div className="cart-container">
        <h1>Order Confirmation</h1>
        {error ? (
          <p>{error}</p>
        ) : (
          <>
            <h2>Order Details</h2>
            <h3>Order ID: {orderDetails.orderID}</h3>
            <h3>Order Date: {new Date(orderDetails.orderDate).toLocaleString()}</h3>
            <h3>Total Amount: ${orderDetails.totalPrice}</h3>
            <br/>
            <h2>Items in your Order:</h2>
            <table className="cart-table" border="1" cellPadding="8" style={{ marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price per Item</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                
                {(orderDetails.yourOrder).map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_id}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${Number(item.total_amount).toFixed(2)}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-total">
            <button onClick={() => navigate("../products")}>Continue Shopping</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OrderConfirmation;
