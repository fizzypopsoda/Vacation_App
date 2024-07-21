// export default SearchHotelPage;
import React, { useEffect, useState } from 'react';
import './SearchHotelPage.css';
import { Link } from 'react-router-dom';
import { checkAuthentication, logoutUser } from './auth';
import { useNavigate } from 'react-router-dom';

const SearchHotelPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
        pageNumber: 1,
        currencyCode: "USD",
        geoId: "",
        checkIn: "",
        checkOut: "",
        adults: 1,
        rooms: 1,
        rating: 0
  });
  const [error, setError] = useState("");
  const [rawData, setHotels] = useState(null);
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

  const handleSaveHotel = async (flight) => {
    if (isAuthenticated) {
      try {
        const response = await fetch("http://localhost:3002/saveHotels", {
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

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Checking if all fields are filled
    for (const key in formData) {
      if (formData[key] === "" || formData[key] === null || formData[key] === undefined) {
        setError("All fields are required.");
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:3002/searchHotels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setHotels(data || []);
      } else {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        setError(errorData.error || "Error searching hotels");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Error searching hotels");
    }
  };
  const navigate = useNavigate();
  return (
    <div className="hotel-search-page">
      <header>
        <Link to="/flight">
                <button className="btn btn-secondary">Search flights</button>
        </Link>
        <div className="header-content">
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

      <h2>Please enter information to search hotels</h2>
      <form onSubmit={handleHotelSubmit} className="form-container">
        <div>
          <label> GeoID (ex. 34438):</label>
          <input
            type="text"
            name="geoId"
            value={formData.geoId}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Check in (YYYY-MM-DD):</label>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Check out (YYYY-MM-DD):</label>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Number of Adults:</label>
          <input
            type="number"
            name="adults"
            value={formData.adults}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div>
          <label>Number of Rooms:</label>
          <input
            type="number"
            name="rooms"
            value={formData.rooms}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div>
          <label>Rating:</label>
          <select
              type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            required
          >
            <option value="0">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

        </div>
        <button  className="btn btn-secondary" type="submit">Search Hotels</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="hotel-results">
        <h3>JSON Data:</h3>
        <pre>{JSON.stringify(rawData, null, 2)}</pre>
      </ul>
    </div>
  );
};

export default SearchHotelPage;