import axios from './../utils/axiosConfig';

const activityService = {
  // Get activities for a specific entity (Company or Lead)
  getEntityActivities: async (projectId, entityType, entityId, params = {}) => {
    try {
      const response = await axios.get(`/activities/entity/${entityType}/${entityId}?projectId=${projectId}`, {
        params: {
          limit: params.limit || 50,
          skip: params.skip || 0,
          category: params.category,
          activityType: params.activityType,
          performedBy: params.performedBy,
          startDate: params.startDate,
          endDate: params.endDate,
          sort: params.sort || 'createdAt',
          order: params.order || 'desc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching entity activities:', error);
      throw error;
    }
  },

  // Get activities for a project
  getProjectActivities: async (projectId, params = {}) => {
    try {
      const response = await axios.get(`/activities/project/${projectId}`, {
        params: {
          limit: params.limit || 100,
          skip: params.skip || 0,
          entityType: params.entityType,
          category: params.category,
          activityType: params.activityType,
          performedBy: params.performedBy,
          startDate: params.startDate,
          endDate: params.endDate,
          sort: params.sort || 'createdAt',
          order: params.order || 'desc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project activities:', error);
      throw error;
    }
  },

  // Get activity statistics for a project
  getActivityStats: async (projectId, params = {}) => {
    try {
      const response = await axios.get(`/activities/project/${projectId}/stats`, {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          entityType: params.entityType,
          category: params.category
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  },

  // Get activity by ID
  getActivityById: async (activityId) => {
    try {
      const response = await axios.get(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  },

  // Delete activity
  deleteActivity: async (activityId) => {
    try {
      const response = await axios.delete(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  // Bulk delete activities
  bulkDeleteActivities: async (activityIds, projectId) => {
    try {
      const response = await axios.delete('/activities/bulk-delete', {
        data: {
          activityIds,
          projectId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting activities:', error);
      throw error;
    }
  }
};

export default activityService;
