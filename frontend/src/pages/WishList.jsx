import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Cart.css";
import Navbar from "../components/Navbar";


const WishList = () => {
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
          fetchWishList();
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);



  const [wishList,setWishList] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  const fetchWishList = async () => {
    try{
        const resfromwishlist = await fetch(apiUrl + "/display-wishlist", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        });
        const datafromwishlist = await resfromwishlist.json();
        if(resfromwishlist.status === 200){
          setWishList(datafromwishlist.wishlist);
        }
        else if(resfromwishlist.status === 400){
          alert(datafromwishlist.message);
        }
        else if(resfromwishlist.status === 500){
          alert(datafromwishlist.message);
        }
      }catch(error){
        console.error(error);
        setError(error);
      }
  };

  const removeFromWishList = async (productId) => {
    try{
        const resfromremwishlist = await fetch(apiUrl + "/remove-from-wishlist",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productid: productId }),
        });
  
        const datafromremwishlist = await resfromremwishlist.json();
        if(resfromremwishlist.status === 200){
          fetchWishList();
          alert(datafromremwishlist.message);
        }
        else if(resfromremwishlist.status === 400){
          alert(datafromremwishlist.message);
        }
        else if(resfromremwishlist.status === 500){
          alert(datafromremwishlist.message);
        }
    }catch(error){
        console.error(error);
        setError(error);
    }
  };

  const cartFromWishList = async (productId, stockQuantity) => {
    if(stockQuantity > 0){
        try{
            const resfromcartwishlist = await fetch(apiUrl + "/cart-from-wishlist",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ productid: productId }),
            });
    
            const datafromcartwishlist = await resfromcartwishlist.json();
            if(resfromcartwishlist.status === 200){
            fetchWishList();
            alert(datafromcartwishlist.message);
            }
            else if(resfromcartwishlist.status === 400){
            alert(datafromcartwishlist.message);
            }
            else if(resfromcartwishlist.status === 500){
            alert(datafromcartwishlist.message);
            }
        }catch(error){
            console.error(error);
            setError(error);
        }
    }
    else{
        alert("Product out of stock!");
    }
  };


  const handleAddEverythingToCart = async () => {
    if(wishList){
        try{
            const resfromcartwishlist = await fetch(apiUrl + "/cart-from-wishlist",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ productid: -1 }),
            });
    
            const datafromcartwishlist = await resfromcartwishlist.json();
            if(resfromcartwishlist.status === 200){
            fetchWishList();
            alert(datafromcartwishlist.message);
            }
            else if(resfromcartwishlist.status === 400){
            alert(datafromcartwishlist.message);
            }
            else if(resfromcartwishlist.status === 500){
            alert(datafromcartwishlist.message);
            }
        }catch(error){
            console.error(error);
            setError(error);
        }
    }
  };

  const handleRemoveEverythingFromWishList = async () => {
    try{
        const resfromremwishlist = await fetch(apiUrl + "/remove-from-wishlist",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productid: -1 }),
        });
  
        const datafromremwishlist = await resfromremwishlist.json();
        if(resfromremwishlist.status === 200){
          fetchWishList();
          alert(datafromremwishlist.message);
        }
        else if(resfromremwishlist.status === 400){
          alert(datafromremwishlist.message);
        }
        else if(resfromremwishlist.status === 500){
          alert(datafromremwishlist.message);
        }
    }catch(error){
        console.error(error);
        setError(error);
    }
  };


  if(error){
    return <div className="cart-error">{error}</div>;
  }



  return (
    <>
      <div className="cart-container">
        <Navbar />
        <h1>Your Wish List</h1>

        {/* TODO: Display the success or info message */}
        {message && <div className="cart-message">{message}</div>}

        {/* TODO: Implement the cart table UI */}
        {/* If cart is empty, display an empty cart message */}
        {wishList.length === 0 ? (
          <p className="empty-cart-message">Your Wish List is empty</p>
        ) : (
          <>
            <table className="cart-table" border="1" cellPadding="8" style={{ marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                
                {wishList.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.name}</td>
                    <td>${item.price}</td>
                    <td>{item.stock_quantity}</td>
                    <td>
                      <button onClick={() => removeFromWishList(item.product_id)}>Remove</button>
                      <button onClick={() => cartFromWishList(item.product_id, item.stock_quantity)}>Add to Cart</button>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>

            

            <div className="cart-total">
              <button onClick={handleAddEverythingToCart} disabled={wishList.length === 0}>
                Add everything to Cart
              </button><br/>
              <button onClick={handleRemoveEverythingFromWishList} disabled={wishList.length === 0}>
                Remove all
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );

};

export default WishList;