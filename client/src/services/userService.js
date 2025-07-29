import api from '../utils/axiosConfig';

// Get all users with pagination and filtering
const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

// Get user by ID
const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create new user
const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Update user
const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user
const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Reset user password
const resetUserPassword = async (id, passwordData) => {
  const response = await api.put(`/users/${id}/reset-password`, passwordData);
  return response.data;
};

// Toggle user active status
const toggleUserStatus = async (id) => {
  const response = await api.put(`/users/${id}/toggle-status`, {});
  return response.data;
};

// Get user statistics
const getUserStats = async () => {
  const response = await api.get('/users/stats');
  return response.data;
};

// Get user activity logs
const getUserActivity = async (id) => {
  const response = await api.get(`/users/${id}/activity`);
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  getUserStats,
  getUserActivity
};

export default userService;

