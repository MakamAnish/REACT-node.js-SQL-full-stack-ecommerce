import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Profile.css";
import Navbar from "../components/Navbar";
import StyleButton from "./StyleButton";

const Profile = () => {
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
          fetchProfile();
          fetchAddresses();
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);



  const [profile, setProfile] = useState({ username: '', email: '' });
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try{
        const resfromprofile = await fetch(apiUrl + "/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        });
        const datafromprofile = await resfromprofile.json();
        if(resfromprofile.status === 200){
            setProfile({username: datafromprofile.username , email: datafromprofile.emailid});
        }
        else if(resfromprofile.status === 400){
          alert(datafromprofile.message);
        }
        else if(resfromprofile.status === 500){
          alert(datafromprofile.message);
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


  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    try{
        const resfromprofileupdate = await fetch(apiUrl + "/profile-update",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username: profile.username, emailid: profile.email }),
        });
  
        const datafromprofileupdate = await resfromprofileupdate.json();
        if(resfromprofileupdate.status === 200){
          fetchProfile();
          alert(datafromprofileupdate.message);
        }
        else if(resfromprofileupdate.status === 400){
          alert(datafromprofileupdate.message);
        }
        else if(resfromprofileupdate.status === 500){
          alert(datafromprofileupdate.message);
        }
    }catch(error){
        console.error(error);
        setError(error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try{
        const resfromdeleteaddress = await fetch(apiUrl + "/profile/delete-address",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ id }),
        });
  
        const datafromdeleteaddress = await resfromdeleteaddress.json();
        if(resfromdeleteaddress.status === 200){
          fetchAddresses();
          alert(datafromdeleteaddress.message);
        }
        else if(resfromdeleteaddress.status === 400){
          alert(datafromdeleteaddress.message);
        }
        else if(resfromdeleteaddress.status === 500){
          alert(datafromdeleteaddress.message);
        }
    }catch(error){
        console.error(error);
        setError(error);
    }
  };



  return(
    <div className="profile-container">
        <Navbar />
        <h2 className="profile-heading">Your Profile</h2>
        <div className="profile-section">
            Username: <input name="username" value={profile.username} onChange={handleProfileChange} /><br/><br/>
            Email: <input name="email" value={profile.email} onChange={handleProfileChange} /><br/><br/>
            <StyleButton label="Update Profile" onClick={handleProfileUpdate}/><br/><br/>
            <Link to="/profile/order-history" className="profile-link">View Order History</Link><br/><br/>
            <Link to="/wish-list" className="profile-link">Wish List</Link>
        </div>

        <h3 className="profile-heading">Saved Addresses</h3>
        <StyleButton label="Edit/Add New Address" onClick={() => {navigate('/profile/addresses')}}/>
        <ul className="address-list">
            {addresses.map(addr => (
                <li key={addr.address_id} className="address-item">
                    {addr.street},{addr.city},{addr.state},{addr.pincode}
                    <br/><br/>
                    <StyleButton label="Delete" onClick={() => handleDeleteAddress(addr.address_id)}/>
                </li>
            ))}
        </ul>
    </div>
  );
};


export default Profile;