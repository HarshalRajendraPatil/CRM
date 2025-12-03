import axios from './../utils/axiosConfig';

/**
 * Get individual user performance
 */
export const getUserPerformance = async (projectId, userId, options = {}) => {
  const params = new URLSearchParams();
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  
  const queryString = params.toString();
  const url = `/performance/${projectId}/user/${userId}${queryString ? `?${queryString}` : ''}`;
  
  const response = await axios.get(url);
  return response.data;
};

/**
 * Get team performance overview
 */
export const getTeamPerformance = async (projectId, options = {}) => {
  const params = new URLSearchParams();
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  
  const queryString = params.toString();
  const url = `/performance/${projectId}/team${queryString ? `?${queryString}` : ''}`;
  
  const response = await axios.get(url);
  return response.data;
};

/**
 * Get list of users for performance tracking
 */
export const getPerformanceUsers = async (projectId) => {
  const response = await axios.get(`/performance/${projectId}/users`);
  return response.data;
};

/**
 * Get performance comparison between users
 */
export const getPerformanceComparison = async (projectId, userIds, options = {}) => {
  const params = new URLSearchParams();
  params.append('userIds', Array.isArray(userIds) ? userIds.join(',') : userIds);
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  
  const response = await axios.get(`/performance/${projectId}/compare?${params.toString()}`);
  return response.data;
};

