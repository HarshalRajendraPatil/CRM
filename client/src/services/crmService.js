import axiosInstance from '../utils/axiosConfig';

// Get CRM dashboard overview data
const getDashboardOverview = async (projectId) => {
  const response = await axiosInstance.get(`/crm/${projectId}/dashboard`);
  return response.data;
};

// Get contacts for a project
const getContacts = async (projectId, params = {}) => {
  const { page, limit, search, status, sortBy, sortOrder } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  
  const queryString = queryParams.toString();
  const url = `/crm/${projectId}/contacts${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Create a new contact
const createContact = async (projectId, contactData) => {
  const response = await axiosInstance.post(`/crm/${projectId}/contacts`, contactData);
  return response.data;
};

// Update a contact
const updateContact = async (projectId, contactId, contactData) => {
  const response = await axiosInstance.put(`/crm/${projectId}/contacts/${contactId}`, contactData);
  return response.data;
};

// Delete a contact
const deleteContact = async (projectId, contactId) => {
  const response = await axiosInstance.delete(`/crm/${projectId}/contacts/${contactId}`);
  return response.data;
};

// Get leads for a project
const getLeads = async (projectId, params = {}) => {
  const { page, limit, search, status, sortBy, sortOrder } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  
  const queryString = queryParams.toString();
  const url = `/crm/${projectId}/leads${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Create a new lead
const createLead = async (projectId, leadData) => {
  const response = await axiosInstance.post(`/crm/${projectId}/leads`, leadData);
  return response.data;
};

// Update a lead
const updateLead = async (projectId, leadId, leadData) => {
  const response = await axiosInstance.put(`/crm/${projectId}/leads/${leadId}`, leadData);
  return response.data;
};

// Delete a lead
const deleteLead = async (projectId, leadId) => {
  const response = await axiosInstance.delete(`/crm/${projectId}/leads/${leadId}`);
  return response.data;
};

// Convert lead to deal
const convertLeadToDeal = async (projectId, leadId, dealData) => {
  const response = await axiosInstance.post(`/crm/${projectId}/leads/${leadId}/convert`, dealData);
  return response.data;
};

// Get deals for a project
const getDeals = async (projectId, params = {}) => {
  const { page, limit, search, status, pipelineId, stageId, sortBy, sortOrder } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);
  if (pipelineId) queryParams.append('pipelineId', pipelineId);
  if (stageId) queryParams.append('stageId', stageId);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  
  const queryString = queryParams.toString();
  const url = `/crm/${projectId}/deals${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Create a new deal
const createDeal = async (projectId, dealData) => {
  const response = await axiosInstance.post(`/crm/${projectId}/deals`, dealData);
  return response.data;
};

// Update a deal
const updateDeal = async (projectId, dealId, dealData) => {
  const response = await axiosInstance.put(`/crm/${projectId}/deals/${dealId}`, dealData);
  return response.data;
};

// Delete a deal
const deleteDeal = async (projectId, dealId) => {
  const response = await axiosInstance.delete(`/crm/${projectId}/deals/${dealId}`);
  return response.data;
};

// Move deal to different stage
const moveDealToStage = async (projectId, dealId, stageId) => {
  const response = await axiosInstance.put(`/crm/${projectId}/deals/${dealId}/move`, { stageId });
  return response.data;
};

// Get tasks for a project
const getTasks = async (projectId, params = {}) => {
  const { page, limit, search, status, dueDate, assignedTo, sortBy, sortOrder } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);
  if (dueDate) queryParams.append('dueDate', dueDate);
  if (assignedTo) queryParams.append('assignedTo', assignedTo);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  
  const queryString = queryParams.toString();
  const url = `/crm/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Create a new task
const createTask = async (projectId, taskData) => {
  const response = await axiosInstance.post(`/crm/${projectId}/tasks`, taskData);
  return response.data;
};

// Update a task
const updateTask = async (projectId, taskId, taskData) => {
  const response = await axiosInstance.put(`/crm/${projectId}/tasks/${taskId}`, taskData);
  return response.data;
};

// Delete a task
const deleteTask = async (projectId, taskId) => {
  const response = await axiosInstance.delete(`/crm/${projectId}/tasks/${taskId}`);
  return response.data;
};

// Mark task as complete
const completeTask = async (projectId, taskId) => {
  const response = await axiosInstance.put(`/crm/${projectId}/tasks/${taskId}/complete`);
  return response.data;
};

// Get activity log for a project
const getActivityLog = async (projectId, params = {}) => {
  const { page, limit, type, entityId, startDate, endDate } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (type) queryParams.append('type', type);
  if (entityId) queryParams.append('entityId', entityId);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const queryString = queryParams.toString();
  const url = `/crm/${projectId}/activity${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

export default {
  getDashboardOverview,
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  convertLeadToDeal,
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  moveDealToStage,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  getActivityLog
};