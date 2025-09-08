import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

// Use the API you implemented earlier, 
// to check if the user is logged in or not
// if yes, navigate to the dashboard
// else to the login page

// use the React Hooks useNavigate and useEffect
// to implement this component
const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {

    const fetchData = async () => { 
      try {
        const response = await fetch(apiUrl + "/isLoggedIn",{
          credentials: "include"
        });
        
        if(response.status === 400){
          navigate('/login', {replace: true});
        }
        if(response.status === 200){
          navigate('/dashboard', {replace: true});
        }
      } catch (error){
        console.error(error);
      }
    }
    fetchData();
    
  });
  return <div>HomePage</div>;
};

export default Home;
