import axiosInstance from '../utils/axiosConfig';

// Create invitation
const createInvitation = async (projectId, invitationData) => {
  const response = await axiosInstance.post(`/invitations?projectId=${projectId}`, invitationData);
  return response.data;
};

// Get all invitations for a project
const getProjectInvitations = async (projectId) => {
  const response = await axiosInstance.get(`/invitations/project/${projectId}`);
  return response.data;
};

// Get all invitations for current user
const getUserInvitations = async () => {
  const response = await axiosInstance.get('/invitations/me');
  return response.data;
};

// Get invitation by token
const getInvitationByToken = async (token) => {
  const response = await axiosInstance.get(`/invitations/${token}`);
  return response.data;
};

// Accept invitation
const acceptInvitation = async (token) => {
  const response = await axiosInstance.put(`/invitations/${token}/accept`);
  return response.data;
};

// Decline invitation
const declineInvitation = async (token) => {
  const response = await axiosInstance.put(`/invitations/${token}/decline`);
  return response.data;
};

// Resend invitation
const resendInvitation = async (id, projectId) => {
  const response = await axiosInstance.put(`/invitations/${id}/resend?projectId=${projectId}`);
  return response.data;
};

// Cancel invitation
const cancelInvitation = async (id, projectId) => {
  const response = await axiosInstance.put(`/invitations/${id}/cancel?projectId=${projectId}`);
  return response.data;
};

// Delete invitation
const deleteInvitation = async (id, projectId) => {
  const response = await axiosInstance.delete(`/invitations/${id}?projectId=${projectId}`);
  return response.data;
};

const invitationService = {
  createInvitation,
  getProjectInvitations,
  getUserInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  resendInvitation,
  cancelInvitation,
  deleteInvitation
};

export default invitationService;