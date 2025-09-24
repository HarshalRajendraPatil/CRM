import axios from '../utils/axiosConfig';

// Lead Service - handles all API calls for lead management

export const getProjectLeads = async (projectId, params = {}) => {
  return axios.get(`/leads/project/${projectId}`, { params });
};

export const fetchLead = async (id) => {
  return axios.get(`/leads/${id}`);
};

export const createLead = async (leadData) => {
  return axios.post('/leads', leadData);
};

export const updateLead = async (id, leadData) => {
  return axios.put(`/leads/${id}`, leadData);
};

export const archiveLead = async (id) => {
  return axios.delete(`/leads/${id}`);
};

export const addLeadNote = async (id, noteData) => {
  return axios.post(`/leads/${id}/notes`, noteData);
};

export const updateLeadStatus = async (id, status) => {
  return axios.patch(`/leads/${id}/status`, { status });
};

export const assignLeadToUser = async (id, userId) => {
  return axios.patch(`/leads/${id}/assign`, { assignedTo: userId });
};

export const convertLead = async (id) => {
  return axios.post(`/leads/${id}/convert`);
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

export const unarchiveLead = async (id) => {
  return axios.patch(`/leads/${id}/unarchive`);
};

export const cleanupArchivedLeads = async () => {
  return axios.post('/leads/cleanup-archived');
};

export const updateLeadNote = async (leadId, noteId, content) => {
  return axios.put(`/leads/${leadId}/notes/${noteId}`, { content });
};

export const deleteLeadNote = async (leadId, noteId) => {
  return axios.delete(`/leads/${leadId}/notes/${noteId}`);
};

export default {
  getProjectLeads,
  fetchLead,
  createLead,
  updateLead,
  archiveLead,
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


