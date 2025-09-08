import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/OrderHistory.css";
import Navbar from "../components/Navbar";

const OrderHistory = () => {
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
          fetchOrderHistory();
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);


  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  const fetchOrderHistory = async () => {
    try{
        const resfromorderhistory = await fetch(apiUrl + "/profile/order-history", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        });
        const datafromorderhistory = await resfromorderhistory.json();
        if(resfromorderhistory.status === 200){
            setOrders(datafromorderhistory.orderhistory);
        }
        else if(resfromorderhistory.status === 400){
          alert(datafromorderhistory.message);
        }
        else if(resfromorderhistory.status === 500){
          alert(datafromorderhistory.message);
        }
      }catch(error){
        console.error(error);
        setError(error);
      }
  };

  const fetchProducts = async (orderId) => {
    try{
      const resfromorderhistoryproducts = await fetch(apiUrl + `/profile/order-history-products?OrderId=${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
      const datafromorderhistoryproducts = await resfromorderhistoryproducts.json();
      if(resfromorderhistoryproducts.status === 200){
          setProducts(datafromorderhistoryproducts.products);
      }
      else if(resfromorderhistoryproducts.status === 400){
        alert(datafromorderhistoryproducts.message);
      }
      else if(resfromorderhistoryproducts.status === 500){
        alert(datafromorderhistoryproducts.message);
      }
    }catch(error){
      console.error(error);
      setError(error);
    }
  }; 

  
  const toggleExpanded = (index) => {
    setExpanded(expanded === index ? null : index);
  };


  return(
    <>
      <Navbar />
      <div className="order-history-container">
      {orders.length === 0 ? (
        <p className="no-orders">You have no Orders!</p>
      ) : (
        <>
          <h2><strong>Your Orders:</strong></h2>
          <ul>
            {orders.map((ord,index) => (
              <li key={ord.order_id} className="order-item">
                <div>
                  Order ID: {ord.order_id},<br/>
                  Date: {new Date(ord.order_date).toLocaleString()},<br/>
                  Total Amount:  ${ord.total_amount}
                </div>
                <h4>Address:</h4>
                {ord.street}, {ord.city}, {ord.state}, {ord.pincode} <br/><br/>
                {expanded === index ? (
                  <>
                    <div>
                      <h3>Order Details:</h3>
                      <table className="order-details-table" border="1" cellPadding="8" style={{ marginTop: "20px" }}>
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
                          
                          {(products).map((item) => (
                            <tr key={item.product_id}>
                              <td>{item.product_id}</td>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>${item.price}</td>
                              <td>${Number(item.mid_price).toFixed(2)}</td>
                              
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <br/>
                    <button className="toggle-button" onClick={() => {toggleExpanded(index); setProducts([]);}}>See less</button>
                  </>
                ) : (
                  <>
                    <button className="toggle-button" onClick={() => {toggleExpanded(index); fetchProducts(ord.order_id);}}>See more</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      </div>
    </>
  );
};


export default OrderHistory;