// export default ProfilePage;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';  // Import the CSS file

const API_URL = 'http://localhost:3001';

const ProfilePage = () => {
    const [email, setEmail] = useState('');
    const [savedFlights, setSavedFlights] = useState([]);
    const [savedHotels, setSavedHotels] = useState([]);  // New state for saved hotels
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Check if the user is authenticated
                const response = await fetch(`${API_URL}/check_session`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'logged in') {
                        // Fetch profile data if authenticated
                        const profileResponse = await fetch(`${API_URL}/profile`, {
                            method: 'GET',
                            credentials: 'include',
                        });

                        if (profileResponse.ok) {
                            const profileData = await profileResponse.json();
                            setEmail(profileData.email);

                            // Fetch saved flights
                            const flightsResponse = await fetch(`${API_URL}/savedFlights`, {
                                method: 'GET',
                                credentials: 'include',
                            });

                            if (flightsResponse.ok) {
                                const flightsData = await flightsResponse.json();
                                setSavedFlights(flightsData.flights);
                            } else {
                                throw new Error('Failed to fetch saved flights');
                            }

                            // Fetch saved hotels
                            const hotelsResponse = await fetch(`${API_URL}/savedHotels`, {
                                method: 'GET',
                                credentials: 'include',
                            });

                            if (hotelsResponse.ok) {
                                const hotelsData = await hotelsResponse.json();
                                setSavedHotels(hotelsData.hotels);
                            } else {
                                throw new Error('Failed to fetch saved hotels');
                            }
                        } else {
                            throw new Error('Failed to fetch profile data');
                        }
                    } else {
                        throw new Error('You are not logged in.');
                    }
                } else {
                    throw new Error('Failed to check authentication status.');
                }
            } catch (error) {
                setError(error.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            localStorage.removeItem('session_id');

            // Redirect to the search page
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Back to search page ('/')
    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div className="profile-page">
            <button onClick={handleGoBack} className="btn btn-back">Go Back</button>
            <header>
                <div className="header-content">
                    <h1>My Profile</h1>
                </div>
            </header>
            <div className="profile-container">
                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <>
                        <div className="profile-info">
                            <p><strong>Email:</strong> {email}</p>
                        </div>
                        <div className="saved-flights">
                            <p><strong>Saved Flights:</strong></p>
                            <div className="flight-cards">
                                {savedFlights.map((flight, index) => (
                                    <div key={index} className="flight-card">
                                        <p>Provider: {flight.providerId}</p>
                                        <p className="price">Price: ${flight.totalPrice}</p>
                                        <p>
                                            {flight.totalPrice === 0 ? (
                                                <a href={flight.url} target="_blank" rel="noopener noreferrer">
                                                    Please click book now for more details on price.
                                                </a>
                                            ) : (
                                                <a href={flight.url} target="_blank" rel="noopener noreferrer">
                                                    Book now
                                                </a>
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="saved-flights">
                            <p><strong>Saved Hotels:</strong></p>
                            <div className="flight-cards">
                                {savedHotels.map((hotel, index) => (
                                    <div key={index} className="flight-card">
                                        <p>Provider: {hotel.title}</p>
                                        <p>Rating: {hotel.rating}</p>
                                        <p className = "price"> Price: {hotel.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
