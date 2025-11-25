import axios from '../utils/axiosConfig';

// Lead Service - handles all API calls for lead management

export const getProjectLeads = async (projectId, params = {}) => {
  return axios.get(`/leads/project/${projectId}`, { params });
};

export const fetchLead = async (projectId, id) => {
  return axios.get(`/leads/${id}?projectId=${projectId}`);
};

export const createLead = async (projectId, leadData) => {
  return axios.post(`/leads?projectId=${projectId}`, leadData);
};

export const updateLead = async (projectId, id, leadData) => {
  return axios.put(`/leads/${id}?projectId=${projectId}`, leadData);
};

export const archiveLead = async (projectId, id) => {
  return axios.delete(`/leads/${id}?projectId=${projectId}`);
};

export const deleteLead = async (projectId, id) => {
  return axios.delete(`/leads/${id}/permanent?projectId=${projectId}`);
};

export const addLeadNote = async (projectId, id, noteData) => {
  return axios.post(`/leads/${id}/notes?projectId=${projectId}`, noteData);
};

export const updateLeadStatus = async (projectId, id, status) => {
  return axios.patch(`/leads/${id}/status?projectId=${projectId}`, { status });
};

export const assignLeadToUser = async (projectId, id, userId) => {
  return axios.patch(`/leads/${id}/assign?projectId=${projectId}`, { assignedTo: userId });
};

export const convertLead = async (projectId, id) => {
  return axios.post(`/leads/${id}/convert?projectId=${projectId}`);
};

export const getLeadStats = async (projectId) => {
  return axios.get(`/leads/project/${projectId}/stats`);
};

export const getLeadInsights = async (projectId) => {
  return axios.get(`/leads/project/${projectId}/insights`);
};

export const getLeadForecast = async (projectId, params = {}) => {
  return axios.get(`/leads/project/${projectId}/forecast`, { params });
};

export const getArchivedLeads = async (projectId, params = {}) => {
  return axios.get(`/leads/project/${projectId}/archived`, { params });
};

export const unarchiveLead = async (projectId, id) => {
  return axios.patch(`/leads/${id}/unarchive?projectId=${projectId}`);
};

export const cleanupArchivedLeads = async (projectId) => {
  return axios.post(`/leads/cleanup-archived?projectId=${projectId}`);
};

export const updateLeadNote = async (projectId, id, noteId, content) => {
  return axios.put(`/leads/${id}/notes/${noteId}?projectId=${projectId}`, { content });
};

export const deleteLeadNote = async (projectId, leadId, noteId) => {
  return axios.delete(`/leads/${leadId}/notes/${noteId}?projectId=${projectId}`);
};

export default {
  getProjectLeads,
  fetchLead,
  createLead,
  updateLead,
  archiveLead,
  deleteLead,
  addLeadNote,
  updateLeadStatus,
  assignLeadToUser,
  convertLead,
  getLeadStats,
  getLeadInsights,
  getLeadForecast,
  getArchivedLeads,
  unarchiveLead,
  cleanupArchivedLeads,
  updateLeadNote,
  deleteLeadNote
};


