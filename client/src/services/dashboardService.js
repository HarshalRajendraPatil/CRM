import axios from './../utils/axiosConfig';

// Get comprehensive dashboard data
export const getDashboardData = async (projectId, period = '30d') => {
  const response = await axios.get(`/dashboard/${projectId}`, {
    params: { period }
  });
  return response.data;
};

// Get dashboard widgets data
export const getDashboardWidgets = async (projectId) => {
  const response = await axios.get(`/dashboard/${projectId}/widgets`);
  return response.data;
};

// Get dashboard charts data
export const getDashboardCharts = async (projectId, chartType, period = '30d') => {
  const response = await axios.get(`/dashboard/${projectId}/charts`, {
    params: { chartType, period }
  });
  return response.data;
};

// Get revenue trend data
export const getRevenueTrend = async (projectId, period = '30d') => {
  return getDashboardCharts(projectId, 'revenue-trend', period);
};

// Get deal funnel data
export const getDealFunnel = async (projectId) => {
  return getDashboardCharts(projectId, 'deal-funnel');
};

// Get task completion data
export const getTaskCompletion = async (projectId) => {
  return getDashboardCharts(projectId, 'task-completion');
};

// Get lead conversion data
export const getLeadConversion = async (projectId) => {
  return getDashboardCharts(projectId, 'lead-conversion');
};

// Get user performance data
export const getUserPerformance = async (projectId) => {
  return getDashboardCharts(projectId, 'user-performance');
};
