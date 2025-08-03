import axiosInstance from '../utils/axiosConfig';

// Get all projects for current user
const getMyProjects = async () => {
  const response = await axiosInstance.get('/projects');
  return response.data;
};

// Get project by ID
const getProjectById = async (id) => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data;
};

// Create new project
const createProject = async (projectData) => {
  const response = await axiosInstance.post('/projects', projectData);
  return response.data;
};

// Update project
const updateProject = async (id, projectData) => {
  const response = await axiosInstance.put(`/projects/${id}`, projectData);
  return response.data;
};

// Delete project
const deleteProject = async (id) => {
  const response = await axiosInstance.delete(`/projects/${id}`);
  return response.data;
};

// Get pipelines for a project
const getProjectPipelines = async (projectId) => {
  const response = await axiosInstance.get(`/projects/${projectId}/pipelines`);
  return response.data;
};

// Get pipeline by ID
const getPipelineById = async (projectId, pipelineId) => {
  const response = await axiosInstance.get(`/projects/${projectId}/pipelines/${pipelineId}`);
  return response.data;
};

// Create pipeline
const createPipeline = async (projectId, pipelineData) => {
  const response = await axiosInstance.post(`/projects/${projectId}/pipelines`, pipelineData);
  return response.data;
};

// Update pipeline
const updatePipeline = async (projectId, pipelineId, pipelineData) => {
  const response = await axiosInstance.put(`/projects/${projectId}/pipelines/${pipelineId}`, pipelineData);
  return response.data;
};

// Delete pipeline
const deletePipeline = async (projectId, pipelineId) => {
  const response = await axiosInstance.delete(`/projects/${projectId}/pipelines/${pipelineId}`);
  return response.data;
};

// Create stage
const createStage = async (projectId, pipelineId, stageData) => {
  const response = await axiosInstance.post(`/projects/${projectId}/pipelines/${pipelineId}/stages`, stageData);
  return response.data;
};

// Update stage
const updateStage = async (projectId, pipelineId, stageId, stageData) => {
  const response = await axiosInstance.put(`/projects/${projectId}/pipelines/${pipelineId}/stages/${stageId}`, stageData);
  return response.data;
};

// Delete stage
const deleteStage = async (projectId, pipelineId, stageId) => {
  const response = await axiosInstance.delete(`/projects/${projectId}/pipelines/${pipelineId}/stages/${stageId}`);
  return response.data;
};

// Reorder stages
const reorderStages = async (projectId, pipelineId, stageIdsInOrder) => {
  const response = await axiosInstance.put(`/projects/${projectId}/pipelines/${pipelineId}/reorder`, { stageIdsInOrder });
  return response.data;
};

// Transfer project ownership
const transferOwnership = async (projectId, newOwnerId) => {
  const response = await axiosInstance.put(`/projects/${projectId}/transfer-ownership`, { userId: newOwnerId });
  return response.data;
};

// Update project member
const updateProjectMember = async (projectId, memberId, memberData) => {
  const response = await axiosInstance.put(`/projects/${projectId}/members/${memberId}`, memberData);
  return response.data;
};

// Remove project member
const removeProjectMember = async (projectId, memberId) => {
  const response = await axiosInstance.delete(`/projects/${projectId}/members/${memberId}`);
  return response.data;
};

const projectService = {
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectPipelines,
  getPipelineById,
  createPipeline,
  updatePipeline,
  deletePipeline,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
  transferOwnership,
  updateProjectMember,
  removeProjectMember
};

export default projectService;