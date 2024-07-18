import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import LogoutPage from './pages/LogoutPage';
import ProfilePage from './pages/ProfilePage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/logout" element={<LogoutPage/>} />
          <Route path="/profile" element={<ProfilePage/>} />

      </Routes>
    </Router>
  );
}

export default App;