import axiosInstance from '../utils/axiosConfig';

// Get user notifications with pagination and filters
const getUserNotifications = async (params = {}) => {
  const { limit, skip, isRead, type, project, sort, order } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit);
  if (skip) queryParams.append('skip', skip);
  if (isRead !== undefined) queryParams.append('isRead', isRead);
  if (type) queryParams.append('type', type);
  if (project) queryParams.append('project', project);
  if (sort) queryParams.append('sort', sort);
  if (order) queryParams.append('order', order);
  
  const queryString = queryParams.toString();
  const url = `/notifications${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Get notification by ID
const getNotificationById = async (id) => {
  const response = await axiosInstance.get(`/notifications/${id}`);
  return response.data;
};

// Mark notification as read
const markAsRead = async (id) => {
  const response = await axiosInstance.put(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read (with optional filters)
const markAllAsRead = async (filters = {}) => {
  const response = await axiosInstance.put('/notifications/read-all', filters);
  return response.data;
};

// Delete notification
const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/notifications/${id}`);
  return response.data;
};

// Delete all notifications (with optional filters)
const deleteAllNotifications = async (filters = {}) => {
  const response = await axiosInstance.delete('/notifications', { data: filters });
  return response.data;
};

// Get unread notification count
const getUnreadCount = async () => {
  const response = await axiosInstance.get('/notifications/unread-count');
  return response.data;
};

export default {
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount
};