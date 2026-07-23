import axios from '../utils/axiosConfig';

// ==================== BASIC CRUD OPERATIONS ====================

/**
 * Get all payments for a project with filtering and pagination
 */
export const getProjectPayments = async (projectId, params = {}) => {
  return axios.get(`/payments/project/${projectId}`, { params });
};

/**
 * Get a single payment by ID
 */
export const getPayment = async (id) => {
  return axios.get(`/payments/${id}`);
};

/**
 * Create a new payment
 */
export const createPayment = async (projectId, paymentData) => {
  return axios.post(`/payments/project/${projectId}`, paymentData);
};

/**
 * Update a payment
 */
export const updatePayment = async (id, paymentData) => {
  return axios.put(`/payments/${id}`, paymentData);
};

/**
 * Mark payment as completed
 */
export const markPaymentAsCompleted = async (id) => {
  return axios.patch(`/payments/${id}/complete`);
};

/**
 * Process refund for a payment
 */
export const processRefund = async (id, refundData) => {
  return axios.patch(`/payments/${id}/refund`, refundData);
};

/**
 * Delete a payment
 */
export const deletePayment = async (id) => {
  return axios.delete(`/payments/${id}`);
};

/**
 * Get payment statistics for a project
 */
export const getPaymentStats = async (projectId) => {
  return axios.get(`/payments/project/${projectId}/stats`);
};

