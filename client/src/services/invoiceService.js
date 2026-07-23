import axios from "../utils/axiosConfig";

// ==================== BASIC CRUD OPERATIONS ====================

/**
 * Get all invoices for a project with filtering and pagination
 */
export const getProjectInvoices = async (projectId, params = {}) => {
  return axios.get(`/invoices/project/${projectId}?projectId=${projectId}`, {
    params,
  });
};

/**
 * Get a single invoice by ID
 */
export const getInvoice = async (projectId, id) => {
  return axios.get(`/invoices/${id}?projectId=${projectId}`);
};

/**
 * Create a new invoice
 */
export const createInvoice = async (projectId, invoiceData) => {
  return axios.post(
    `/invoices/project/${projectId}?projectId=${projectId}`,
    invoiceData
  );
};

/**
 * Update an invoice
 */
export const updateInvoice = async (projectId, id, invoiceData) => {
  return axios.put(`/invoices/${id}?projectId=${projectId}`, invoiceData);
};

/**
 * Delete an invoice
 */
export const deleteInvoice = async (projectId, id) => {
  return axios.delete(`/invoices/${id}?projectId=${projectId}`);
};

/**
 * Archive an invoice
 */
export const archiveInvoice = async (projectId, id) => {
  return axios.patch(`/invoices/${id}/archive?projectId=${projectId}`);
};

/**
 * Restore an archived invoice
 */
export const restoreInvoice = async (projectId, id) => {
  return axios.patch(`/invoices/${id}/restore?projectId=${projectId}`);
};

/**
 * Get invoice statistics for a project
 */
export const getInvoiceStats = async (projectId) => {
  return axios.get(
    `/invoices/project/${projectId}/stats?projectId=${projectId}`
  );
};

/**
 * Mark invoice as sent
 */
export const markInvoiceAsSent = async (projectId, id, sentToEmail) => {
  return axios.patch(`/invoices/${id}/send?projectId=${projectId}`, {
    sentToEmail,
  });
};
