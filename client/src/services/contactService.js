import axiosInstance from '../utils/axiosConfig';

// Get contacts for a project
const getProjectContacts = async (projectId, params = {}) => {
    const { page, limit, search, stage, status, assignedTo, company, sortBy, sortOrder, skip } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (skip !== undefined) queryParams.append('skip', skip);
    if (search) queryParams.append('search', search);
    if (stage && stage !== 'all') queryParams.append('stage', stage);
    if (status && status !== 'all') queryParams.append('status', status);
    if (assignedTo && assignedTo !== 'all') queryParams.append('assignedTo', assignedTo);
    if (company && company !== 'all') queryParams.append('company', company);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/contacts/project/${projectId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  };
  
  // Get contacts for a company
  const getCompanyContacts = async (companyId, params = {}) => {
    const { page, limit, search, stage, status, assignedTo, sortBy, sortOrder } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (stage) queryParams.append('stage', stage);
    if (status) queryParams.append('status', status);
    if (assignedTo) queryParams.append('assignedTo', assignedTo);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/contacts/company/${companyId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  };
  
  // Get contact by ID
  const getContactById = async (contactId) => {
    const response = await axiosInstance.get(`/contacts/${contactId}`);
    return response.data;
  };
  
  // Create a new contact
  const createContact = async (contactData) => {
    const response = await axiosInstance.post('/contacts', contactData);
    return response.data;
  };
  
  // Update a contact
  const updateContact = async (contactId, contactData) => {
    const response = await axiosInstance.put(`/contacts/${contactId}`, contactData);
    return response.data;
  };
  
  // Delete a contact
  const deleteContact = async (contactId) => {
    const response = await axiosInstance.delete(`/contacts/${contactId}`);
    return response.data;
  };
  
  // Add a note to a contact
  const addContactNote = async (contactId, noteData) => {
    const response = await axiosInstance.post(`/contacts/${contactId}/notes`, noteData);
    return response.data;
  };
  
  // Get notes for a contact
  const getContactNotes = async (contactId) => {
    const response = await axiosInstance.get(`/contacts/${contactId}/notes`);
    return response.data;
  };
  
  // Add a tag to a contact
  const addContactTag = async (contactId, tagData) => {
    const response = await axiosInstance.post(`/contacts/${contactId}/tags`, tagData);
    return response.data;
  };
  
  // Remove a tag from a contact
  const removeContactTag = async (contactId, tag) => {
    const response = await axiosInstance.delete(`/contacts/${contactId}/tags/${tag}`);
    return response.data;
  };
  
  // Add a custom field to a contact
  const addContactCustomField = async (contactId, fieldData) => {
    const response = await axiosInstance.post(`/contacts/${contactId}/custom-fields`, fieldData);
    return response.data;
  };
  
  // Remove a custom field from a contact
  const removeContactCustomField = async (contactId, key) => {
    const response = await axiosInstance.delete(`/contacts/${contactId}/custom-fields/${key}`);
    return response.data;
  };
  
  // Add a social link to a contact
  const addContactSocialLink = async (contactId, socialLinkData) => {
    const response = await axiosInstance.post(`/contacts/${contactId}/social-links`, socialLinkData);
    return response.data;
  };
  
  // Remove a social link from a contact
  const removeContactSocialLink = async (contactId, linkId) => {
    const response = await axiosInstance.delete(`/contacts/${contactId}/social-links/${linkId}`);
    return response.data;
  };
  
  // Update contact stage
  const updateContactStage = async (contactId, stageData) => {
    const response = await axiosInstance.put(`/contacts/${contactId}/stage`, stageData);
    return response.data;
  };
  
  // Update contact lead score
  const updateContactLeadScore = async (contactId, scoreData) => {
    const response = await axiosInstance.put(`/contacts/${contactId}/lead-score`, scoreData);
    return response.data;
  };
  
  // Get contact statistics for a project
  const getContactStats = async (projectId) => {
    const response = await axiosInstance.get(`/contacts/project/${projectId}/stats`);
    return response.data;
  };
  
  // Get contact insights for a project
  const getContactInsights = async (projectId, params = {}) => {
    const { timeframe, stage, status } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (timeframe) queryParams.append('timeframe', timeframe);
    if (stage) queryParams.append('stage', stage);
    if (status) queryParams.append('status', status);
    
    const queryString = queryParams.toString();
    const url = `/contacts/project/${projectId}/insights${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  };

  export default {
    getProjectContacts,
    getCompanyContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    addContactNote,
    getContactNotes,
    addContactTag,
    removeContactTag,
    addContactCustomField,
    removeContactCustomField,
    addContactSocialLink,
    removeContactSocialLink,
    updateContactStage,
    updateContactLeadScore,
    getContactStats,
    getContactInsights,
  };