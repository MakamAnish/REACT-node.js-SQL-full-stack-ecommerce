import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import '../css/Login.css';

const Login = () => {
  const navigate = useNavigate(); // Use this to redirect users


  // useEffect checks if the user is already logged in
  // if already loggedIn then it will simply navigate to the dashboard
  // TODO: Implement the checkStatus function.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement your logic here
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

  // Read about useState to manage form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // TODO: This function handles input field changes
  const handleChange = (e) => {
    // Implement your logic here
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // TODO: Implement the login operation
  // This function should send form data to the server
  // and handle login success/failure responses.
  // Use the API you made for handling this.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement the login logic here
    try{
      const resfromsubmit = await fetch(apiUrl + "/login",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          emailid: formData.email,
          password:formData.password
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

  // TODO: Use JSX to create a login form with input fields for:
  // - Email
  // - Password
  // - A submit button
  return (
    <div className="login-container">
      
      {/* Implement the form UI here */}
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Sign In!</h1>
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
        <p>Don't have an account? <a href="../signup">Sign up here</a></p>
        <button type="submit">Submit</button>
      </form>
      
    </div>
  );
};

export default Login;
