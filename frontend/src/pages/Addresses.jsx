import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/index.css";
import Navbar from "../components/Navbar";

const Addresses = () => {
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
          fetchAddresses();
        }
      } catch (error){
        console.error(error);
      }
    };
    checkStatus();
  }, []);



  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


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

  const AddressChange = (index, field, value) => {
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
  };

  const handleAddressChange = async (address) => {
    try{
      const resfromaddresschange = await fetch(apiUrl + "/profile/address-change",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ address }),
      });

      const datafromaddresschange = await resfromaddresschange.json();
      if(resfromaddresschange.status === 200){
        fetchAddresses();
        alert(datafromaddresschange.message);
      }
      else if(resfromaddresschange.status === 400){
        alert(datafromaddresschange.message);
      }
      else if(resfromaddresschange.status === 500){
        alert(datafromaddresschange.message);
      }
    }catch(error){
      console.error(error);
      setError(error);
    }
  };

  const AddAddress = (e) => {
    setNewAddress((prevNewAddress) => ({ ...prevNewAddress, [e.target.name]: e.target.value}));
  };

  const handleAddAddress = async () => {
    if(!newAddress.pincode||!newAddress.street||!newAddress.city||!newAddress.state){
      alert("Please fill out all the address fields");
      return;
    }
    try{
        const resfromaddaddress = await fetch(apiUrl + "/profile/add-address",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ street: newAddress.street, city: newAddress.city, state: newAddress.state, pincode: newAddress.pincode }),
        });
  
        const datafromaddaddress = await resfromaddaddress.json();
        if(resfromaddaddress.status === 200){
          fetchAddresses();
          setNewAddress({ street: '', city: '', state: '', pincode: '' });
          alert(datafromaddaddress.message);
        }
        else if(resfromaddaddress.status === 400){
          alert(datafromaddaddress.message);
        }
        else if(resfromaddaddress.status === 500){
          alert(datafromaddaddress.message);
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


  const handlePinCodeChange = async (e,identifier,index) => {
    // Implement the logic to fetch city and state by pincode
    // Update the city and state fields accordingly
    const pincode = e.target.value;
    if(identifier === 1){
      setNewAddress({...newAddress,pincode});
    }
    else{
      AddressChange(index,'pincode',pincode);
    }

    if(pincode.length === 6){
      try{
        const resfrompincode = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const datafrompincode = await resfrompincode.json();
        if(datafrompincode[0].Status === "Success"){
          const postalData = datafrompincode[0].PostOffice[0];
          if(identifier === 1){
            setNewAddress((previousAddress) => ({
              ...previousAddress,
              city: postalData.District,
              state: postalData.State
            }));
          }
          else{
            AddressChange(index,'city',postalData.District);
            AddressChange(index,'state',postalData.State);
          }
        }
      }catch(error){
        console.error(error);
      }
    }
  };


  return(
    <div className="addressses-container">
        <Navbar />
        
        <h2>Saved Addresses</h2>
          {addresses.map((addr,index) => (
            <div key={addr.address_id} className="address-box">
              Pincode: <input name="pincode" value={addr.pincode} onChange={(e) => handlePinCodeChange(e,0,index)} /><br/><br/>
              Street: <input name="street" value={addr.street} onChange={(e) => AddressChange(index,e.target.name,e.target.value)} /><br/><br/>
              City: <input name="city" value={addr.city} onChange={(e) => AddressChange(index,e.target.name,e.target.value)} readOnly /><br/><br/>
              State: <input name="state" value={addr.state} onChange={(e) => AddressChange(index,e.target.name,e.target.value)} readOnly /><br/><br/>
              <button onClick={() => handleAddressChange(addr)}>Save</button>
              <button onClick={() => handleDeleteAddress(addr.address_id)}>Delete</button><br/><br/>
            </div>
          ))}

        <h3>Add New Address</h3>
        <div className="new-address-form">
          Pincode: <input placeholder="Pincode" name="pincode" value={newAddress.pincode} onChange={(e) => handlePinCodeChange(e,1,undefined)} /><br/><br/>
          Street: <input placeholder="Street" name="street" value={newAddress.street} onChange={AddAddress} /><br/><br/>
          City: <input placeholder="City" name="city" value={newAddress.city} onChange={AddAddress} readOnly /><br/><br/>
          State: <input placeholder="State" name="state" value={newAddress.state} onChange={AddAddress} readOnly /><br/><br/>
          <button onClick={handleAddAddress}>Save</button><br/><br/>
        </div>
    </div>
  );
};


export default Addresses;