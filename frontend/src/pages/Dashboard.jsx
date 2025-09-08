import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/index.css";

const Dashboard = () => {
  const navigate = useNavigate(); // Use this to redirect users

  const [username, setUsername] = useState("User");

  // TODO: Implement the checkStatus function.
  // This function should check if the user is logged in.
  // If not logged in, redirect to the login page.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here to check login status
      // If logged in, then use setUsername to display
      // the username
      try {
        const response = await fetch(apiUrl + "/isLoggedIn",{
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });
        const datafromresponse = await response.json();
        
        if(response.status === 400){
          navigate('/login', {replace: true});
        }
        
        if(response.status === 200){
          setUsername(datafromresponse.username);
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
      <h1 style={{ color: 'white', fontSize: '40px' }}>Hi {username}!</h1>
      <div style={{ fontSize: '32px', textAlign: 'center'}}>Welcome to the Ecommerce App!</div>
      </div>
    </div>
  );
};

export default Dashboard;
