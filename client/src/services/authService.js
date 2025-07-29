import axiosInstance from '../utils/axiosConfig';

// Auth service for handling API calls
const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    if (response.data.success) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      const user = response.data.data.user;
      
      // Save tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    if (response.data.success) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      const user = response.data.data.user;
      
      // Save tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      // Call logout API
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/auth/me', profileData);
    if (response.data.success) {
      // Update stored user data
      const updatedUser = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  },

  // Remove profile image
  removeProfileImage: async () => {
    const response = await axiosInstance.delete('/auth/me/profile-image');
    if (response.data.success) {
      // Update stored user data
      const updatedUser = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosInstance.post('/auth/change-password', passwordData);
    return response.data;
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (resetData) => {
    const response = await axiosInstance.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token) => {
    const response = await axiosInstance.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async () => {
    const response = await axiosInstance.post('/auth/resend-verification');
    return response.data;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService; 