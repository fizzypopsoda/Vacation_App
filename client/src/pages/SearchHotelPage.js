import React, { useEffect, useState } from 'react';
import './SearchHotelPage.css';
import { Link } from 'react-router-dom';
import { checkAuthentication, logoutUser } from './auth';
import { useNavigate } from 'react-router-dom';

const SearchHotelPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    rooms: 1,
    rating: 0
  });
  const [error, setError] = useState("");
  const [hotels, setHotels] = useState([]);
  const [geoId, setGeoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false); // New state to track if search has been conducted

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

  const fetchGeoId = async (city) => {
    try {
      const response = await fetch("http://localhost:3002/getGeoid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: city }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeoId(data.geoId || "");
      } else {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        setError(errorData.error || "Error fetching GeoID");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Error fetching GeoID");
    }
  };

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSearched(true); // Set searched to true when a search is performed

    // Checking if all fields are filled
    for (const key in formData) {
      if (formData[key] === "" || formData[key] === null || formData[key] === undefined) {
        setError("All fields are required.");
        return;
      }
    }

    // Fetch GeoID based on the city
    await fetchGeoId(formData.city);

    // Prepare form data for hotel search
    const hotelSearchData = {
      geoId,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      adults: formData.adults,
      rooms: formData.rooms,
      rating: formData.rating
    };

    try {
      setIsLoading(true);  // Start loading
      const response = await fetch("http://localhost:3002/searchHotels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hotelSearchData),
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
    } finally {
      setIsLoading(false);  // Stop loading
    }
  };

  const navigate = useNavigate();

  return (
    <div className="search-page">
      <header>
        <div className="header-content">
          <Link to="/flight">
            <button className="btn btn-secondary">Search flights</button>
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

      <h2>Please enter information to search hotels</h2>
      <form onSubmit={handleHotelSubmit} className="form-container">
        <div>
          <label> City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
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
        <button className="btn btn-secondary" type="submit">Search Hotels</button>
      </form>

      {error && <p className="error">{error}</p>}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        searched && (
          <ul className="hotel-results">
            {hotels.length > 0 ? (
              hotels.map((hotel, index) => (
                <li key={index}>
                  <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <h3>{hotel.title}</h3>
                  </a>
                  <p>Rating: {hotel.rating}</p>
                  <p>Price: {hotel.price}</p>
                  <p>Location: {hotel.location}</p>
                </li>
              ))
            ) : (
              <p>No hotels found</p>
            )}
          </ul>
        )
      )}
    </div>
  );
};

export default SearchHotelPage;
