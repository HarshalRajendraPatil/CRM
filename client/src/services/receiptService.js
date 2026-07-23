import axios from '../utils/axiosConfig';

// ==================== BASIC CRUD OPERATIONS ====================

/**
 * Get all receipts for a project with filtering and pagination
 */
export const getProjectReceipts = async (projectId, params = {}) => {
  return axios.get(`/receipts/project/${projectId}`, { params });
};

/**
 * Get a single receipt by ID
 */
export const getReceipt = async (id) => {
  return axios.get(`/receipts/${id}`);
};

/**
 * Create a new receipt
 */
export const createReceipt = async (projectId, receiptData) => {
  return axios.post(`/receipts/project/${projectId}`, receiptData);
};

/**
 * Update a receipt
 */
export const updateReceipt = async (id, receiptData) => {
  return axios.put(`/receipts/${id}`, receiptData);
};

/**
 * Mark receipt as sent
 */
export const markReceiptAsSent = async (id, sentToEmail) => {
  return axios.patch(`/receipts/${id}/send`, { sentToEmail });
};

/**
 * Delete a receipt
 */
export const deleteReceipt = async (id) => {
  return axios.delete(`/receipts/${id}`);
};

/**
 * Get receipt statistics for a project
 */
export const getReceiptStats = async (projectId) => {
  return axios.get(`/receipts/project/${projectId}/stats`);
};

