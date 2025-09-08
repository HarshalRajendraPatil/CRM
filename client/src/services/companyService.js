import axiosInstance from '../utils/axiosConfig';

/**
 * Get all companies for a project
 * @param {string} projectId - Project ID
 * @param {Object} params - Query parameters (limit, skip, sort, order, status, industry, search, tags)
 * @returns {Promise} - Promise with companies data
 */
const getProjectCompanies = async (projectId, params = {}) => {
  const response = await axiosInstance.get(`/companies/project/${projectId}`, { params });
  return response.data;
};

/**
 * Get company by ID
 * @param {string} id - Company ID
 * @returns {Promise} - Promise with company data
 */
const getCompanyById = async (id) => {
  const response = await axiosInstance.get(`/companies/${id}`);
  return response.data;
};

/**
 * Create a new company
 * @param {Object} companyData - Company data including projectId
 * @returns {Promise} - Promise with created company data
 */
const createCompany = async (companyData) => {
  const response = await axiosInstance.post('/companies', companyData);
  return response.data;
};

/**
 * Update a company
 * @param {string} id - Company ID
 * @param {Object} companyData - Updated company data
 * @returns {Promise} - Promise with updated company data
 */
const updateCompany = async (id, companyData) => {
  const response = await axiosInstance.put(`/companies/${id}`, companyData);
  return response.data;
};

/**
 * Delete a company
 * @param {string} id - Company ID
 * @returns {Promise} - Promise with deletion result
 */
const deleteCompany = async (id) => {
  const response = await axiosInstance.delete(`/companies/${id}`);
  return response.data;
};

/**
 * Add a note to a company
 * @param {string} id - Company ID
 * @param {Object} noteData - Note data with content
 * @returns {Promise} - Promise with created note data
 */
const addCompanyNote = async (id, noteData) => {
  const response = await axiosInstance.post(`/companies/${id}/notes`, noteData);
  return response.data;
};

/**
 * Get notes for a company
 * @param {string} id - Company ID
 * @returns {Promise} - Promise with company notes
 */
const getCompanyNotes = async (id) => {
  const response = await axiosInstance.get(`/companies/${id}/notes`);
  return response.data;
};

/**
 * Add a tag to a company
 * @param {string} id - Company ID
 * @param {Object} tagData - Tag data with tag name
 * @returns {Promise} - Promise with updated company data
 */
const addCompanyTag = async (id, tagData) => {
  const response = await axiosInstance.post(`/companies/${id}/tags`, tagData);
  return response.data;
};

/**
 * Remove a tag from a company
 * @param {string} id - Company ID
 * @param {string} tag - Tag to remove
 * @returns {Promise} - Promise with updated company data
 */
const removeCompanyTag = async (id, tag) => {
  const response = await axiosInstance.delete(`/companies/${id}/tags/${tag}`);
  return response.data;
};

/**
 * Add a custom field to a company
 * @param {string} id - Company ID
 * @param {Object} fieldData - Custom field data with key and value
 * @returns {Promise} - Promise with updated company data
 */
const addCustomField = async (id, fieldData) => {
  const response = await axiosInstance.post(`/companies/${id}/custom-fields`, fieldData);
  return response.data;
};

/**
 * Remove a custom field from a company
 * @param {string} id - Company ID
 * @param {string} key - Custom field key to remove
 * @returns {Promise} - Promise with updated company data
 */
const removeCustomField = async (id, key) => {
  const response = await axiosInstance.delete(`/companies/${id}/custom-fields/${key}`);
  return response.data;
};

/**
 * Get company statistics for a project
 * @param {string} projectId - Project ID
 * @returns {Promise} - Promise with company statistics
 */
const getCompanyStats = async (projectId) => {
  const response = await axiosInstance.get(`/companies/project/${projectId}/stats`);
  return response.data;
};

/**
 * Get company insights for a project
 * @param {string} projectId - Project ID
 * @returns {Promise} - Promise with company insights
 */
const getCompanyInsights = async (projectId) => {
  const response = await axiosInstance.get(`/companies/project/${projectId}/insights`);
  return response.data;
};

/**
 * Update a company note
 * @param {string} id - Company ID
 * @param {string} noteId - Note ID
 * @param {Object} noteData - Updated note data with content
 * @returns {Promise} - Promise with updated note data
 */
const updateCompanyNote = async (id, noteId, noteData) => {
  const response = await axiosInstance.put(`/companies/${id}/notes/${noteId}`, noteData);
  return response.data;
};

/**
 * Delete a company note
 * @param {string} id - Company ID
 * @param {string} noteId - Note ID
 * @returns {Promise} - Promise with deletion result
 */
const deleteCompanyNote = async (id, noteId) => {
  const response = await axiosInstance.delete(`/companies/${id}/notes/${noteId}`);
  return response.data;
};

/**
 * Bulk update companies
 * @param {Array} companyIds - Array of company IDs
 * @param {Object} updates - Updates to apply
 * @returns {Promise} - Promise with bulk update result
 */
const bulkUpdateCompanies = async (companyIds, updates) => {
  const response = await axiosInstance.put('/companies/bulk-update', {
    companyIds,
    updates
  });
  return response.data;
};

/**
 * Bulk delete companies
 * @param {Array} companyIds - Array of company IDs
 * @returns {Promise} - Promise with bulk delete result
 */
const bulkDeleteCompanies = async (companyIds) => {
  const response = await axiosInstance.delete('/companies/bulk-delete', {
    data: { companyIds }
  });
  return response.data;
};

export default {
  getProjectCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  addCompanyNote,
  getCompanyNotes,
  updateCompanyNote,
  deleteCompanyNote,
  addCompanyTag,
  removeCompanyTag,
  addCustomField,
  removeCustomField,
  getCompanyStats,
  getCompanyInsights,
  bulkUpdateCompanies,
  bulkDeleteCompanies
};