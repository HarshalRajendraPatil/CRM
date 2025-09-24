import axios from '../utils/axiosConfig';

// Customer Service - handles all API calls for customer management

// Get all customers for a project with advanced filtering
export const getProjectCustomers = async (projectId, params = {}) => {
  return await axios.get(`/customers/project/${projectId}`, { params });
};

// Get a single customer by ID
export const fetchCustomer = async (id) => {
  return await axios.get(`/customers/${id}`);
};

// Create a new customer
export const createCustomer = async (customerData) => {
  return await axios.post('/customers', customerData);
};

// Update a customer
export const updateCustomer = async (id, customerData) => {
  return await axios.patch(`/customers/${id}`, customerData);
};

// Archive a customer (soft delete)
export const archiveCustomer = async (id) => {
  return await axios.delete(`/customers/${id}`);
};

// Unarchive a customer
export const unarchiveCustomer = async (id) => {
  return await axios.patch(`/customers/${id}/unarchive`);
};

// Get archived customers
export const getArchivedCustomers = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/archived`, { params });
};

// Add a note to a customer
export const addCustomerNote = async (id, noteData) => {
  return axios.post(`/customers/${id}/notes`, noteData);
};

// Add an interaction to a customer
export const addCustomerInteraction = async (id, interactionData) => {
  return axios.post(`/customers/${id}/interactions`, interactionData);
};

// Convert lead to customer
export const convertLeadToCustomer = async (leadId, customerData) => {
  return axios.post(`/customers/leads/${leadId}/convert`, customerData);
};

// Get customer statistics
export const getCustomerStats = async (projectId) => {
  return axios.get(`/customers/project/${projectId}/stats`);
};

// Get customer insights and analytics
export const getCustomerInsights = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/insights`, { params });
};

// Get customer forecast and predictive analytics
export const getCustomerForecast = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/forecast`, { params });
};

// Bulk update customers
export const bulkUpdateCustomers = async (customerIds, updates) => {
  return axios.patch('/customers/bulk-update', { customerIds, updates });
};

// Bulk archive customers
export const bulkArchiveCustomers = async (customerIds) => {
  return axios.patch('/customers/bulk-archive', { customerIds });
};

// Bulk unarchive customers
export const bulkUnarchiveCustomers = async (customerIds) => {
  return axios.patch('/customers/bulk-unarchive', { customerIds });
};

// Bulk assign customers
export const bulkAssignCustomers = async (customerIds, assignedTo) => {
  return axios.patch('/customers/bulk-assign', { customerIds, assignedTo });
};

// Bulk update customer stages
export const bulkUpdateCustomerStages = async (customerIds, stage) => {
  return axios.patch('/customers/bulk-update-stages', { customerIds, stage });
};

// Bulk update customer priorities
export const bulkUpdateCustomerPriorities = async (customerIds, priority) => {
  return axios.patch('/customers/bulk-update-priorities', { customerIds, priority });
};

// Bulk update customer statuses
export const bulkUpdateCustomerStatuses = async (customerIds, status) => {
  return axios.patch('/customers/bulk-update-statuses', { customerIds, status });
};

// Delete customer permanently
export const deleteCustomer = async (id) => {
  return axios.delete(`/customers/${id}/permanent`);
};

// Bulk delete customers permanently
export const bulkDeleteCustomers = async (customerIds) => {
  return axios.delete('/customers/bulk-delete', { data: { customerIds } });
};

// Export customers
export const exportCustomers = async (projectId, format = 'json') => {
  return axios.get(`/customers/project/${projectId}/export`, { 
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json'
  });
};

// Update customer status
export const updateCustomerStatus = async (id, status) => {
  return axios.patch(`/customers/${id}`, { status });
};

// Update customer stage
export const updateCustomerStage = async (id, stage) => {
  return axios.patch(`/customers/${id}`, { stage });
};

// Assign customer to user
export const assignCustomerToUser = async (id, userId) => {
  return axios.patch(`/customers/${id}`, { assignedTo: userId });
};



// Update customer score
export const updateCustomerScore = async (id, score) => {
  return axios.patch(`/customers/${id}`, { score });
};

// Update customer priority
export const updateCustomerPriority = async (id, priority) => {
  return axios.patch(`/customers/${id}`, { priority });
};

// Add tags to customer
export const addCustomerTags = async (id, tags) => {
  return axios.patch(`/customers/${id}`, { tags });
};

// Remove tags from customer
export const removeCustomerTags = async (id, tagsToRemove) => {
  // First get current customer to get existing tags
  const customer = await fetchCustomer(id);
  const currentTags = customer.data.data.tags || [];
  const updatedTags = currentTags.filter(tag => !tagsToRemove.includes(tag));
  return axios.patch(`/customers/${id}`, { tags: updatedTags });
};

// Update customer communication preferences
export const updateCustomerCommunicationPreferences = async (id, preferences) => {
  return axios.patch(`/customers/${id}`, { communicationPreferences: preferences });
};

// Get customer activity timeline
export const getCustomerActivity = async (id) => {
  return axios.get(`/customers/${id}/activity`);
};

// Search customers across all projects (for admin)
export const searchAllCustomers = async (searchTerm, params = {}) => {
  return axios.get('/customers/search', { 
    params: { search: searchTerm, ...params } 
  });
};

// Get customer duplicates (for data quality)
export const getCustomerDuplicates = async (projectId) => {
  return axios.get(`/customers/project/${projectId}/duplicates`);
};

// Merge duplicate customers
export const mergeCustomers = async (primaryCustomerId, duplicateCustomerIds) => {
  return axios.post('/customers/merge', {
    primaryCustomerId,
    duplicateCustomerIds
  });
};

// Get customer lifecycle analytics
export const getCustomerLifecycleAnalytics = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/lifecycle`, { params });
};

// Get customer churn analysis
export const getCustomerChurnAnalysis = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/churn`, { params });
};

// Get customer lifetime value analysis
export const getCustomerLifetimeValue = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/ltv`, { params });
};

// Get customer interaction history
export const getCustomerInteractions = async (id, params = {}) => {
  return axios.get(`/customers/${id}/interactions`, { params });
};

// Get customer notes history
export const getCustomerNotes = async (id, params = {}) => {
  return axios.get(`/customers/${id}/notes`, { params });
};

// Update customer note
export const updateCustomerNote = async (customerId, noteId, content) => {
  return axios.put(`/customers/${customerId}/notes/${noteId}`, { content });
};

// Delete customer note
export const deleteCustomerNote = async (customerId, noteId) => {
  return axios.delete(`/customers/${customerId}/notes/${noteId}`);
};

// Get customer social media links
export const getCustomerSocialLinks = async (id) => {
  return axios.get(`/customers/${id}/social-links`);
};

// Update customer social media links
export const updateCustomerSocialLinks = async (id, socialLinks) => {
  return axios.patch(`/customers/${id}`, { socialLinks });
};

// Get customer address information
export const getCustomerAddress = async (id) => {
  return axios.get(`/customers/${id}/address`);
};

// Update customer address
export const updateCustomerAddress = async (id, address) => {
  return axios.patch(`/customers/${id}`, { address });
};

// Get customer company information
export const getCustomerCompany = async (id) => {
  return axios.get(`/customers/${id}/company`);
};

// Update customer company information
export const updateCustomerCompany = async (id, companyData) => {
  return axios.patch(`/customers/${id}`, { 
    company: companyData.company,
    companyName: companyData.companyName,
    industry: companyData.industry
  });
};



// Get customer conversion history
export const getCustomerConversionHistory = async (id) => {
  return axios.get(`/customers/${id}/conversion-history`);
};

// Get customer timeline
export const getCustomerTimeline = async (id) => {
  return axios.get(`/customers/${id}/timeline`);
};

// Send customer email (integration with email service)
export const sendCustomerEmail = async (id, emailData) => {
  return axios.post(`/customers/${id}/send-email`, emailData);
};

// Schedule customer follow-up
export const scheduleCustomerFollowUp = async (id, followUpData) => {
  return axios.post(`/customers/${id}/follow-up`, followUpData);
};

// Get customer tasks
export const getCustomerTasks = async (id) => {
  return axios.get(`/customers/${id}/tasks`);
};

// Create customer task
export const createCustomerTask = async (id, taskData) => {
  return axios.post(`/customers/${id}/tasks`, taskData);
};

// Update customer task
export const updateCustomerTask = async (customerId, taskId, taskData) => {
  return axios.put(`/customers/${customerId}/tasks/${taskId}`, taskData);
};

// Delete customer task
export const deleteCustomerTask = async (customerId, taskId) => {
  return axios.delete(`/customers/${customerId}/tasks/${taskId}`);
};

export default {
  getProjectCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  unarchiveCustomer,
  getArchivedCustomers,
  addCustomerNote,
  addCustomerInteraction,
  convertLeadToCustomer,
  getCustomerStats,
  getCustomerInsights,
  getCustomerForecast,
  bulkUpdateCustomers,
  exportCustomers,
  updateCustomerStatus,
  updateCustomerStage,
  assignCustomerToUser,

  updateCustomerScore,
  updateCustomerPriority,
  addCustomerTags,
  removeCustomerTags,
  updateCustomerCommunicationPreferences,
  getCustomerActivity,
  searchAllCustomers,
  getCustomerDuplicates,
  mergeCustomers,
  getCustomerLifecycleAnalytics,
  getCustomerChurnAnalysis,
  getCustomerLifetimeValue,
  getCustomerInteractions,
  getCustomerNotes,
  updateCustomerNote,
  deleteCustomerNote,
  getCustomerSocialLinks,
  updateCustomerSocialLinks,
  getCustomerAddress,
  updateCustomerAddress,
  getCustomerCompany,
  updateCustomerCompany,

  getCustomerConversionHistory,
  getCustomerTimeline,
  sendCustomerEmail,
  scheduleCustomerFollowUp,
  getCustomerTasks,
  createCustomerTask,
  updateCustomerTask,
  deleteCustomerTask,
  deleteCustomer,
  bulkDeleteCustomers
};
