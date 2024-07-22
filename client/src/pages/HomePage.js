import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkAuthentication, logoutUser } from "./auth";
import "./HomePage.css"; // Import the CSS file

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const userEmail = await checkAuthentication();
      if (userEmail) {
        setIsAuthenticated(true);
      }
    };
    fetchAuthStatus();
  }, []);

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      setIsAuthenticated(false);
      navigate("/");
    }
  };

  return (
    <div className="home-page">
      <h1 className="welcome-message">Welcome to your Vacation Finder!</h1>
      <div className="header-content">
        <Link to="/hotel">
          <button className="btn btn-secondary">Search Hotels</button>
        </Link>
        <Link to="/flight">
          <button className="btn btn-secondary">Search Flights</button>
        </Link>
        {isAuthenticated && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/profile")}
          >
            My Profile
          </button>
        )}
        {isAuthenticated ? (
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">
              <button className="btn btn-secondary">Login</button>
            </Link>
            <Link to="/registration">
              <button className="btn btn-secondary">Register</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
