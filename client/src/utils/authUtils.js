import socketService from './socketService';

// Initialize authentication-related features
export const initializeAuth = () => {
  // Check if user is logged in
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    // Initialize socket connection if user is logged in
    socketService.initializeSocket();
  }
};

// Handle logout cleanup
export const handleLogout = () => {
  // Close socket connection
  socketService.closeSocket();
  
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export default {
  initializeAuth,
  handleLogout
};