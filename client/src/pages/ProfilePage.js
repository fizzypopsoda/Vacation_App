// export default ProfilePage;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';  // Import the CSS file

const API_URL = 'http://localhost:3002';

const ProfilePage = () => {
    const [email, setEmail] = useState('');
    const [savedFlights, setSavedFlights] = useState([]);
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

            // Clear session_id from localStorage
            localStorage.removeItem('session_id');

            // Redirect to the search page
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    //Back to search page ('/')
    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div className="profile-page">
            <button onClick={handleGoBack} className="btn btn-back">Go Back</button>
            <header>
                <h1>Profile Page</h1>
            </header>
            <div className="profile-container">
                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <>
                        <div className="profile-info">
                            <p><strong>Email:</strong> {email}</p>
                        </div>
                        <p><strong>Saved flights:</strong></p>
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
                    </>
                )}
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </div>
        </div>
    );
};

export default ProfilePage;
