import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import activityService from '../services/activityService';

// Async thunks
export const fetchEntityActivities = createAsyncThunk(
  'activity/fetchEntityActivities',
  async ({ projectId, entityType, entityId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await activityService.getEntityActivities(projectId, entityType, entityId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch entity activities');
    }
  }
);

export const fetchProjectActivities = createAsyncThunk(
  'activity/fetchProjectActivities',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await activityService.getProjectActivities(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project activities');
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  'activity/fetchActivityStats',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await activityService.getActivityStats(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity stats');
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activity/deleteActivity',
  async (activityId, { rejectWithValue }) => {
    try {
      const response = await activityService.deleteActivity(activityId);
      return { activityId, message: response.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete activity');
    }
  }
);

export const bulkDeleteActivities = createAsyncThunk(
  'activity/bulkDeleteActivities',
  async ({ activityIds, projectId }, { rejectWithValue }) => {
    try {
      const response = await activityService.bulkDeleteActivities(activityIds, projectId);
      return { deletedCount: response.data.deletedCount, message: response.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete activities');
    }
  }
);

const initialState = {
  // Entity activities
  entityActivities: [],
  entityActivitiesLoading: false,
  entityActivitiesError: null,
  
  // Project activities
  projectActivities: [],
  projectActivitiesLoading: false,
  projectActivitiesError: null,
  
  // Activity stats
  activityStats: null,
  activityStatsLoading: false,
  activityStatsError: null,
  
  // Pagination
  entityPagination: {
    total: 0,
    limit: 50,
    skip: 0,
    hasMore: false
  },
  projectPagination: {
    total: 0,
    limit: 100,
    skip: 0,
    hasMore: false
  },
  
  // Filters
  entityFilters: {
    category: '',
    activityType: '',
    performedBy: '',
    startDate: '',
    endDate: '',
    sort: 'createdAt',
    order: 'desc'
  },
  projectFilters: {
    entityType: '',
    category: '',
    activityType: '',
    performedBy: '',
    startDate: '',
    endDate: '',
    sort: 'createdAt',
    order: 'desc'
  },
  
  // UI state
  selectedActivities: [],
  showFilters: false,
  showBulkActions: false
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    // Entity activities
    setEntityFilters: (state, action) => {
      state.entityFilters = { ...state.entityFilters, ...action.payload };
    },
    resetEntityFilters: (state) => {
      state.entityFilters = {
        category: '',
        activityType: '',
        performedBy: '',
        startDate: '',
        endDate: '',
        sort: 'createdAt',
        order: 'desc'
      };
    },
    setEntityPagination: (state, action) => {
      state.entityPagination = { ...state.entityPagination, ...action.payload };
    },
    resetEntityPagination: (state) => {
      state.entityPagination = {
        total: 0,
        limit: 50,
        skip: 0,
        hasMore: false
      };
    },
    
    // Project activities
    setProjectFilters: (state, action) => {
      state.projectFilters = { ...state.projectFilters, ...action.payload };
    },
    resetProjectFilters: (state) => {
      state.projectFilters = {
        entityType: '',
        category: '',
        activityType: '',
        performedBy: '',
        startDate: '',
        endDate: '',
        sort: 'createdAt',
        order: 'desc'
      };
    },
    setProjectPagination: (state, action) => {
      state.projectPagination = { ...state.projectPagination, ...action.payload };
    },
    
    // UI state
    setSelectedActivities: (state, action) => {
      state.selectedActivities = action.payload;
    },
    toggleActivitySelection: (state, action) => {
      const activityId = action.payload;
      if (state.selectedActivities.includes(activityId)) {
        state.selectedActivities = state.selectedActivities.filter(id => id !== activityId);
      } else {
        state.selectedActivities.push(activityId);
      }
    },
    clearSelectedActivities: (state) => {
      state.selectedActivities = [];
    },
    setShowFilters: (state, action) => {
      state.showFilters = action.payload;
    },
    setShowBulkActions: (state, action) => {
      state.showBulkActions = action.payload;
    },
    
    // Clear errors
    clearEntityActivitiesError: (state) => {
      state.entityActivitiesError = null;
    },
    clearProjectActivitiesError: (state) => {
      state.projectActivitiesError = null;
    },
    clearActivityStatsError: (state) => {
      state.activityStatsError = null;
    },
    
    // Reset state
    resetEntityActivities: (state) => {
      state.entityActivities = [];
      state.entityPagination = {
        total: 0,
        limit: 50,
        skip: 0,
        hasMore: false
      };
      state.entityActivitiesError = null;
    },
    resetProjectActivities: (state) => {
      state.projectActivities = [];
      state.projectPagination = {
        total: 0,
        limit: 100,
        skip: 0,
        hasMore: false
      };
      state.projectActivitiesError = null;
    },
    resetActivityStats: (state) => {
      state.activityStats = null;
      state.activityStatsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch entity activities
      .addCase(fetchEntityActivities.pending, (state) => {
        state.entityActivitiesLoading = true;
        state.entityActivitiesError = null;
      })
      .addCase(fetchEntityActivities.fulfilled, (state, action) => {
        state.entityActivitiesLoading = false;
        // Ensure we have valid data structure
        if (action.payload && action.payload.activities) {
          state.entityActivities = Array.isArray(action.payload.activities) 
            ? action.payload.activities 
            : [];
          state.entityPagination = action.payload.pagination || {
            total: 0,
            limit: 50,
            skip: 0,
            hasMore: false
          };
        } else {
          state.entityActivities = [];
          state.entityPagination = {
            total: 0,
            limit: 50,
            skip: 0,
            hasMore: false
          };
        }
      })
      .addCase(fetchEntityActivities.rejected, (state, action) => {
        state.entityActivitiesLoading = false;
        state.entityActivitiesError = action.payload;
      })
      
      // Fetch project activities
      .addCase(fetchProjectActivities.pending, (state) => {
        state.projectActivitiesLoading = true;
        state.projectActivitiesError = null;
      })
      .addCase(fetchProjectActivities.fulfilled, (state, action) => {
        state.projectActivitiesLoading = false;
        // Ensure we have valid data structure
        if (action.payload && action.payload.activities) {
          state.projectActivities = Array.isArray(action.payload.activities) 
            ? action.payload.activities 
            : [];
          state.projectPagination = action.payload.pagination || {
            total: 0,
            limit: 100,
            skip: 0,
            hasMore: false
          };
        } else {
          state.projectActivities = [];
          state.projectPagination = {
            total: 0,
            limit: 100,
            skip: 0,
            hasMore: false
          };
        }
      })
      .addCase(fetchProjectActivities.rejected, (state, action) => {
        state.projectActivitiesLoading = false;
        state.projectActivitiesError = action.payload;
      })
      
      // Fetch activity stats
      .addCase(fetchActivityStats.pending, (state) => {
        state.activityStatsLoading = true;
        state.activityStatsError = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.activityStatsLoading = false;
        state.activityStats = action.payload;
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.activityStatsLoading = false;
        state.activityStatsError = action.payload;
      })
      
      // Delete activity
      .addCase(deleteActivity.fulfilled, (state, action) => {
        const { activityId } = action.payload;
        state.entityActivities = state.entityActivities.filter(activity => activity._id !== activityId);
        state.projectActivities = state.projectActivities.filter(activity => activity._id !== activityId);
        state.selectedActivities = state.selectedActivities.filter(id => id !== activityId);
      })
      
      // Bulk delete activities
      .addCase(bulkDeleteActivities.fulfilled, (state, action) => {
        const { deletedCount } = action.payload;
        state.entityActivities = state.entityActivities.filter(activity => !state.selectedActivities.includes(activity._id));
        state.projectActivities = state.projectActivities.filter(activity => !state.selectedActivities.includes(activity._id));
        state.selectedActivities = [];
        state.showBulkActions = false;
      });
  }
});

export const {
  setEntityFilters,
  resetEntityFilters,
  setEntityPagination,
  resetEntityPagination,
  setProjectFilters,
  resetProjectFilters,
  setProjectPagination,
  setSelectedActivities,
  toggleActivitySelection,
  clearSelectedActivities,
  setShowFilters,
  setShowBulkActions,
  clearEntityActivitiesError,
  clearProjectActivitiesError,
  clearActivityStatsError,
  resetEntityActivities,
  resetProjectActivities,
  resetActivityStats
} = activitySlice.actions;

export default activitySlice.reducer;
