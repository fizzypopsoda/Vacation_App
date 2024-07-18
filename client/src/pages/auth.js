import axios from 'axios';


const API_URL = 'http://localhost:3002';


export const checkAuthentication = async () => {
  try {
    console.log('Checking authentication status...');
    const response = await axios.get(`${API_URL}/check_session`, { withCredentials: true });  // Use correct API URL
    console.log('Response from /check_session:', response.data);
    if (response.data.status === 'logged in') {
      console.log('User is logged in.');
      return true;
    } else {
      console.log('User is not logged in.');
      return false;
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Logout the user
export const logoutUser = async () => {
  try {
    console.log('Attempting to log out...');
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });  // Use correct API URL
    console.log('Logout successful.');
    return true;  // Logout successful
  } catch (error) {
    console.error('Error during logout:', error);
    return false;  // Logout failed
  }
};
