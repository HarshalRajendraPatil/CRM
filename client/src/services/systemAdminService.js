import axios from '../utils/axiosConfig.js';

// Get system overview data
export const getSystemOverview = async () => {
  return axios.get('/system-admin/overview');
};

// Get system statistics
export const getSystemStats = async () => {
  return axios.get('/system-admin/stats');
};

// Get all users with pagination and filtering
export const getAllUsers = async (params = {}) => {
  return axios.get('/system-admin/users', { params });
};

// Get all projects with pagination and filtering
export const getAllProjects = async (params = {}) => {
  return axios.get('/system-admin/projects', { params });
};

// Get user activity logs
export const getUserActivity = async (userId, params = {}) => {
  return axios.get(`/system-admin/users/${userId}/activity`, { params });
};

// Toggle user status (activate/deactivate)
export const toggleUserStatus = async (userId, isActive) => {
  return axios.patch(`/system-admin/users/${userId}/status`, { isActive });
};

// Delete user
export const deleteUser = async (userId) => {
  return axios.delete(`/system-admin/users/${userId}`);
};

// Get project details
export const getProjectDetails = async (projectId) => {
  return axios.get(`/system-admin/projects/${projectId}`);
};

// Delete project
export const deleteProject = async (projectId) => {
  return axios.delete(`/system-admin/projects/${projectId}`);
};
