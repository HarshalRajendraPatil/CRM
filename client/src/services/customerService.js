import axios from '../utils/axiosConfig';

// Customer Service - handles all API calls for customer management

// Get all customers for a project with advanced filtering
export const getProjectCustomers = async (projectId, params = {}) => {
  return await axios.get(`/customers/project/${projectId}`, { params });
};

// Get a single customer by ID
export const fetchCustomer = async (projectId, id) => {
  return await axios.get(`/customers/${id}?projectId=${projectId}`);
};

// Create a new customer
export const createCustomer = async (projectId, customerData) => {
  return await axios.post(`/customers?projectId=${projectId}`, customerData);
};

// Update a customer
export const updateCustomer = async (projectId, id, customerData) => {
  return await axios.patch(`/customers/${id}?projectId=${projectId}`, customerData);
};

// Archive a customer (soft delete)
export const archiveCustomer = async (projectId, id) => {
  return await axios.delete(`/customers/${id}?projectId=${projectId}`);
};

// Unarchive a customer
export const unarchiveCustomer = async (projectId, id) => {
  return await axios.patch(`/customers/${id}/unarchive?projectId=${projectId}`);
};

// Get archived customers
export const getArchivedCustomers = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/archived?projectId=${projectId}`, { params });
};

// Add a note to a customer
export const addCustomerNote = async (projectId, id, noteData) => {
  return axios.post(`/customers/${id}/notes?projectId=${projectId}`, noteData);
};

// Add an interaction to a customer
export const addCustomerInteraction = async (projectId, id, interactionData) => {
  return axios.post(`/customers/${id}/interactions?projectId=${projectId}`, interactionData);
};

// Convert lead to customer
export const convertLeadToCustomer = async (projectId, leadId, customerData) => {
  return axios.post(`/customers/leads/${leadId}/convert?projectId=${projectId}`, customerData);
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
export const bulkUpdateCustomers = async (projectId, customerIds, updates) => {
  return axios.patch(`/customers/bulk-update?projectId=${projectId}`, { customerIds, updates });
};

// Bulk archive customers
export const bulkArchiveCustomers = async (projectId, customerIds) => {
  return axios.patch(`/customers/bulk-archive?projectId=${projectId}`, { customerIds });
};

// Bulk unarchive customers
export const bulkUnarchiveCustomers = async (projectId, customerIds) => {
  return axios.patch(`/customers/bulk-unarchive?projectId=${projectId}`, { customerIds });
};

// Bulk assign customers
export const bulkAssignCustomers = async (projectId, customerIds, assignedTo) => {
  return axios.patch(`/customers/bulk-assign?projectId=${projectId}`, { customerIds, assignedTo });
};

// Bulk update customer stages
export const bulkUpdateCustomerStages = async (projectId, customerIds, stage) => {
  return axios.patch(`/customers/bulk-update-stages?projectId=${projectId}`, { customerIds, stage });
};

// Bulk update customer priorities
export const bulkUpdateCustomerPriorities = async (projectId, customerIds, priority) => {
  return axios.patch(`/customers/bulk-update-priorities?projectId=${projectId}`, { customerIds, priority });
};

// Bulk update customer statuses
export const bulkUpdateCustomerStatuses = async (projectId, customerIds, status) => {
  return axios.patch(`/customers/bulk-update-statuses?projectId=${projectId}`, { customerIds, status });
};

// Delete customer permanently
export const deleteCustomer = async (projectId, id) => {
  return axios.delete(`/customers/${id}/permanent?projectId=${projectId}`);
};

// Bulk delete customers permanently
export const bulkDeleteCustomers = async (projectId, customerIds) => {
  return axios.delete(`/customers/bulk-delete?projectId=${projectId}`, { data: { customerIds } });
};

// Export customers
export const exportCustomers = async (projectId, format = 'json') => {
  return axios.get(`/customers/project/${projectId}/export`, { 
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json'
  });
};

// Update customer status
export const updateCustomerStatus = async (projectId, id, status) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { status });
};

// Update customer stage
export const updateCustomerStage = async (projectId, id, stage) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { stage });
};

// Assign customer to user
export const assignCustomerToUser = async (projectId, id, userId) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { assignedTo: userId });
};



// Update customer score
export const updateCustomerScore = async (projectId, id, score) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { score });
};

// Update customer priority
export const updateCustomerPriority = async (projectId, id, priority) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { priority });
};

// Add tags to customer
export const addCustomerTags = async (projectId, id, tags) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { tags });
};

// Remove tags from customer
export const removeCustomerTags = async (projectId, id, tagsToRemove) => {
  // First get current customer to get existing tags
  const customer = await fetchCustomer(projectId, id);
  const currentTags = customer.data.data.tags || [];
  const updatedTags = currentTags.filter(tag => !tagsToRemove.includes(tag));
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { tags: updatedTags });
};

// Update customer communication preferences
export const updateCustomerCommunicationPreferences = async (projectId, id, preferences) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { communicationPreferences: preferences });
};

// Get customer activity timeline
export const getCustomerActivity = async (projectId, id) => {
  return axios.get(`/customers/${id}/activity?projectId=${projectId}`);
};

// Search customers across all projects (for admin)
export const searchAllCustomers = async (projectId, searchTerm, params = {}) => {
  return axios.get(`/customers/search?projectId=${projectId}`, { 
    params: { search: searchTerm, ...params } 
  });
};

// Get customer duplicates (for data quality)
export const getCustomerDuplicates = async (projectId) => {
  return axios.get(`/customers/project/${projectId}/duplicates`);
};

// Merge duplicate customers
export const mergeCustomers = async (projectId, primaryCustomerId, duplicateCustomerIds) => {
  return axios.post(`/customers/merge?projectId=${projectId}`, {
    primaryCustomerId,
    duplicateCustomerIds
  });
};

// Get customer lifecycle analytics
export const getCustomerLifecycleAnalytics = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/lifecycle?projectId=${projectId}`, { params });
};

// Get customer churn analysis
export const getCustomerChurnAnalysis = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/churn?projectId=${projectId}`, { params });
};

// Get customer lifetime value analysis
export const getCustomerLifetimeValue = async (projectId, params = {}) => {
  return axios.get(`/customers/project/${projectId}/ltv?projectId=${projectId}`, { params });
};

// Get customer interaction history
export const getCustomerInteractions = async (projectId, id, params = {}) => {
  return axios.get(`/customers/${id}/interactions?projectId=${projectId}`, { params });
};

// Get customer notes history
export const getCustomerNotes = async (projectId, id, params = {}) => {
  return axios.get(`/customers/${id}/notes?projectId=${projectId}`, { params });
};

// Update customer note
export const updateCustomerNote = async (projectId, customerId, noteId, noteData) => {
  return axios.put(`/customers/${customerId}/notes/${noteId}?projectId=${projectId}`, noteData);
};

// Delete customer note
export const deleteCustomerNote = async (projectId, customerId, noteId) => {
  return axios.delete(`/customers/${customerId}/notes/${noteId}?projectId=${projectId}`);
};

// Update customer interaction
export const updateCustomerInteraction = async (projectId, customerId, interactionId, interactionData) => {
  return axios.put(`/customers/${customerId}/interactions/${interactionId}?projectId=${projectId}`, interactionData);
};

// Delete customer interaction
export const deleteCustomerInteraction = async (projectId, customerId, interactionId) => {
  return axios.delete(`/customers/${customerId}/interactions/${interactionId}?projectId=${projectId}`);
};

// Get customer social media links
export const getCustomerSocialLinks = async (projectId, id) => {
  return axios.get(`/customers/${id}/social-links?projectId=${projectId}`);
};

// Update customer social media links
export const updateCustomerSocialLinks = async (projectId, id, socialLinks) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { socialLinks });
};

// Get customer address information
export const getCustomerAddress = async (projectId, id) => {
  return axios.get(`/customers/${id}/address?projectId=${projectId}`);
};

// Update customer address
export const updateCustomerAddress = async (projectId, id, address) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { address });
};

// Get customer company information
export const getCustomerCompany = async (projectId, id) => {
  return axios.get(`/customers/${id}/company?projectId=${projectId}`);
};

// Update customer company information
export const updateCustomerCompany = async (projectId, id, companyData) => {
  return axios.patch(`/customers/${id}?projectId=${projectId}`, { 
    company: companyData.company,
    companyName: companyData.companyName,
    industry: companyData.industry
  });
};



// Get customer conversion history
export const getCustomerConversionHistory = async (projectId, id) => {
  return axios.get(`/customers/${id}/conversion-history?projectId=${projectId}`);
};

// Get customer timeline
export const getCustomerTimeline = async (projectId, id) => {
  return axios.get(`/customers/${id}/timeline?projectId=${projectId}`);
};

// Send customer email (integration with email service)
export const sendCustomerEmail = async (projectId, id, emailData) => {
  return axios.post(`/customers/${id}/send-email?projectId=${projectId}`, emailData);
};

// Schedule customer follow-up
export const scheduleCustomerFollowUp = async (projectId, id, followUpData) => {
  return axios.post(`/customers/${id}/follow-up?projectId=${projectId}`, followUpData);
};

// Get customer tasks
export const getCustomerTasks = async (projectId, id) => {
  return axios.get(`/customers/${id}/tasks?projectId=${projectId}`);
};

// Create customer task
export const createCustomerTask = async (projectId, id, taskData) => {
  return axios.post(`/customers/${id}/tasks?projectId=${projectId}`, taskData);
};

// Update customer task
export const updateCustomerTask = async (projectId, customerId, taskId, taskData) => {
  return axios.put(`/customers/${customerId}/tasks/${taskId}?projectId=${projectId}`, taskData);
};

// Delete customer task
export const deleteCustomerTask = async (projectId, customerId, taskId) => {
  return axios.delete(`/customers/${customerId}/tasks/${taskId}?projectId=${projectId}`);
};

// Get customer deals
export const getCustomerDeals = async (projectId, customerId, params = {}) => {
  return axios.get(`/customers/${customerId}/deals?projectId=${projectId}`, { params });
};

// Get customer deal statistics
export const getCustomerDealStats = async (projectId, customerId) => {
  return axios.get(`/customers/${customerId}/deals/stats?projectId=${projectId}`);
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
  updateCustomerInteraction,
  deleteCustomerInteraction,
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
  bulkDeleteCustomers,
  getCustomerDeals,
  getCustomerDealStats
};
