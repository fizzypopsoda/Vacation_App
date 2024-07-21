// export default SearchPage;
import React, { useEffect, useState } from 'react';
import './SearchPage.css';
import { Link } from 'react-router-dom';
import { checkAuthentication, logoutUser } from './auth';
import { useNavigate } from 'react-router-dom';
const SearchPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    sourceAirportCode: "",
    destinationAirportCode: "",
    date: "",
    returnDate: "",
    itineraryType: "ROUND_TRIP",
    sortOrder: "PRICE",
    numAdults: "1",
    numSeniors: "0",
    classOfService: "ECONOMY",
  });
  const [purchaseLinks, setPurchaseLinks] = useState([]);
  const [error, setError] = useState("");

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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveFlight = async (flight) => {
    if (isAuthenticated) {
      try {
        const response = await fetch("http://localhost:3002/saveFlights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ flights: [flight] }),
        });

        if (response.ok) {
          alert("Flight saved successfully!");
        } else {
          const errorData = await response.json();
          console.error("Backend Error:", errorData);
          setError(errorData.error || "Error saving flight");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Error saving flight");
      }
    } else {
      alert("You need to be logged in to save flights.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if all fields are filled
    for (const key in formData) {
      if (formData[key] === "" || formData[key] === null || formData[key] === undefined) {
        setError("All fields are required.");
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:3002/searchFlights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const uniquePrices = new Set();
        const uniquePurchaseLinks = data.filter((link) => {
          if (!uniquePrices.has(link.totalPrice)) {
            uniquePrices.add(link.totalPrice);
            return true;
          }
          return false;
        });
        setPurchaseLinks(uniquePurchaseLinks);
      } else {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        setError(errorData.error || "Error searching flights");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Error searching flights");
    }
  };
  const navigate = useNavigate();
  return (
    <div className="search-page">
      <header>
        <div className="header-content">
          <Link to="/hotel">
          <button className="btn btn-secondary">Search Hotels</button>
          </Link>
          {isAuthenticated && (

            <button className="btn btn-secondary" onClick={() => navigate('/profile')}>My Profile</button>
          )}
          {isAuthenticated ? (
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
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
      </header>

      <h2>Please enter your travel information</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <label>Source Airport Code (ex.BOS):</label>
          <input
            type="text"
            name="sourceAirportCode"
            value={formData.sourceAirportCode}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Destination Airport Code (ex.JFK):</label>
          <input
            type="text"
            name="destinationAirportCode"
            value={formData.destinationAirportCode}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Date (YYYY-MM-DD):</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Return Date (YYYY-MM-DD):</label>
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Itinerary Type:</label>
          <select
            name="itineraryType"
            value={formData.itineraryType}
            onChange={handleChange}
            required
          >
            <option value="ONE_WAY">One Way</option>
            <option value="ROUND_TRIP">Round Trip</option>
          </select>
        </div>
        <div>
          <label>Sort Order:</label>
          <select
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            required
          >
            <option value="PRICE">Price</option>
            <option value="DURATION">Duration</option>
          </select>
        </div>
        <div>
          <label>Number of Adults:</label>
          <input
            type="number"
            name="numAdults"
            value={formData.numAdults}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div>
          <label>Number of Seniors:</label>
          <input
            type="number"
            name="numSeniors"
            value={formData.numSeniors}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        <div>
          <label>Class of Service:</label>
          <select
            name="classOfService"
            value={formData.classOfService}
            onChange={handleChange}
            required
          >
            <option value="ECONOMY">Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First</option>
          </select>
        </div>
        <button  className="btn btn-secondary" type="submit">Search Flights</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="flight-results">
        {purchaseLinks.map((link, index) => (
          <div key={index} className="flight-card">
            <p>Provider: {link.providerId}</p>
            <p>Price: {link.totalPrice}</p>
            <p>
              <p>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="book-now-link">
                {link.totalPrice === 0
                  ? "Click 'Book Now' for details on price."
                  : " "}
              </a>
              </p>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                Book now
              </a>
            </p>
              {isAuthenticated && (
              <a href="#!" onClick={() => handleSaveFlight(link)} className="save-flight-button">
                Save Flight
              </a>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;
