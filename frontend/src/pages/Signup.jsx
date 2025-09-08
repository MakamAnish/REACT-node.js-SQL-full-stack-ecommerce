import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Login.css";

const Signup = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the checkStatus function.
  // If the user is already logged in, make an API call 
  // to check their authentication status.
  // If logged in, redirect to the dashboard.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here
      try {
        const response = await fetch(apiUrl + "/isLoggedIn",{
          credentials: "include"
        });
        
      
        if(response.status === 200){
          navigate('/dashboard', {replace: true});
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);

  // Read about useState to understand how to manage component state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // This function handles input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Read about the spread operator (...) to understand this syntax
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // TODO: Implement the sign-up operation
  // This function should send form data to the server
  // and handle success/failure responses.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement the sign-up logic here
    if(!formData.username||!formData.email||!formData.password){
      alert("Please fill all the fields");
      return;
    }
    try{
      const resfromsubmit = await fetch(apiUrl + "/signup",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          emailid: formData.email,
          password: formData.password
        })
      });
      const datafromsubmit = await resfromsubmit.json();
      if(resfromsubmit.status === 200){
        navigate('/dashboard', {replace: true});
      }
      else if(resfromsubmit.status === 400){
        alert(datafromsubmit.message);
      }
      else if(resfromsubmit.status === 500){
        alert(datafromsubmit.message);
      }
    }catch(error){
      console.error(error);
    }
  };

  // TODO: Use JSX to create a sign-up form with input fields for:
  // - Username
  // - Email
  // - Password
  // - A submit button
  return (
    <div className="login-container">
      {/* Implement the form UI here */}
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Sign Up!</h1>
        <label>
          Username: {" "}
          <input type="text" name="username" value={formData.username} placeholder="Username" onChange={handleChange} required />
          <br></br>
        </label>
        <label>
          Email: {' '}
          <input type="email" name="email" value={formData.email} placeholder="Email address" onChange={handleChange} required />
          <br></br>
        </label>
        <label>
          Password: {" "}
          <input type="password" name="password" value={formData.password} placeholder="Password" onChange={handleChange} required/>
          <br></br>
        </label>
        <p>Already have an account? <a href="../login">Login here</a></p>
        <button type="submit">Submit</button>
      </form>
      
    </div>
  );
};

export default Signup;
