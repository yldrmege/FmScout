

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  //const[isLoggedIn,setIsLoggedIn]=useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      
      const response = await fetch(
        `http://localhost:8080/api/v1/users/login?userName=${userName}&password=${password}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
        },
        }
      );
      const userData = await response.json(); 
      if (response.ok) {
        localStorage.setItem("userId",userData.userId.userId);
        localStorage.setItem("isAdmin", JSON.stringify(userData.userId.isAdmin));
        
        if (userData.userId.isAdmin === true) {
          navigate("/clubs"); 
        } else {
          navigate("/players"); 
        }
      } else if (response.status === 400 || response.status === 401) {
        setErrorMessage("Invalid username or password.");
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="textbox">
            <FaEnvelope className="input-icon" />
            <input
              type="text"
              placeholder="User Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="textbox">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="btn-container">
            <button type="submit" className="login-btn">
              Login
            </button>
          </div>
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
        
      </div>
    </div>
  );
};

export default Login;
