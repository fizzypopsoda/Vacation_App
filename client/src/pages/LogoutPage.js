import React from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = 'http://localhost:3002';
const Logout = () => {
    const navigate = useNavigate();

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

            // Redirect to login page
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    React.useEffect(() => {
        handleLogout();
    }, []);

    return (
        <div className="logout-page">
            <h2>Logging out...</h2>
        </div>
    );
};

export default Logout;
