import React, { useState } from 'react';

export default function RegistrationPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3001/registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`Registration successful! Welcome ${data.email} Please go back to the main page to log in.`);
            } else if (response.status === 409) {
                setMessage('Email already exists.');
            } else {
                setMessage('An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className='container h-100'>
            <div className='container-fluid h-custom'>
                <h2>Registration Page</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='email'>Email:</label>
                        <input
                            type='email'
                            className='form-control'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password:</label>
                        <input
                            type='password'
                            className='form-control'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type='submit' className='btn btn-primary'>Register</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}
