import React from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the handleLogout function.
  // This function should do an API call to log the user out.
  // On successful logout, redirect the user to the login page.
  const handleLogout = async (e) => {
    e.preventDefault();
    // Implement logout logic here
    try{
      const resfromlogout = await fetch(apiUrl + "/logout",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      const datafromlogout = await resfromlogout.json();
      if(resfromlogout.status === 200){
        navigate('/login', {replace: true});
      }
      else if(resfromlogout.status === 400){
        alert(datafromlogout.message);
      }
      else if(resfromlogout.status === 500){
        alert(datafromlogout.message);
      }
    }catch(error){
      console.error(error);
    }
  };

  // TODO: Use JSX to create a navigation bar with buttons for:
  // - Home
  // - Products
  // - Cart
  // - Logout
  return (
    <nav>
      {/* Implement navigation buttons here */}
      
        <Link to="/dashboard">Home</Link>
     
      
        <Link to="/products">Products</Link>
      
      
        <Link to="/cart">Cart</Link>
      
      
        <Link to="/profile">Profile</Link>
      
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
