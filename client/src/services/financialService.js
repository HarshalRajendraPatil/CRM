import axios from '../utils/axiosConfig';

/**
 * Get financial overview for a project
 */
export const getFinancialOverview = async (projectId, params = {}) => {
  return axios.get(`/financial/project/${projectId}/overview`, { params });
};

/**
 * Get revenue by payment date (cash basis)
 */
export const getRevenueByDate = async (projectId, params = {}) => {
  return axios.get(`/financial/project/${projectId}/revenue`, { params });
};

/**
 * Get outstanding receivables
 */
export const getOutstandingReceivables = async (projectId, params = {}) => {
  return axios.get(`/financial/project/${projectId}/receivables`, { params });
};

/**
 * Get payment method analytics
 */
export const getPaymentMethodAnalytics = async (projectId, params = {}) => {
  return axios.get(`/financial/project/${projectId}/payment-methods`, { params });
};

/**
 * Get customer financial profile
 */
export const getCustomerFinancialProfile = async (projectId, customerId) => {
  return axios.get(`/financial/project/${projectId}/customer/${customerId}`);
};

/**
 * Get overdue invoices
 */
export const getOverdueInvoices = async (projectId, params = {}) => {
  return axios.get(`/financial/project/${projectId}/overdue`, { params });
};

