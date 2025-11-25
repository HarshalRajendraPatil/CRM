import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getSystemOverview,
  getSystemStats,
  getAllUsers,
  getAllProjects,
  getUserActivity,
  toggleUserStatus,
  deleteUser,
  getProjectDetails,
  deleteProject
} from '../services/systemAdminService.js';

// Async thunks
export const fetchSystemOverview = createAsyncThunk(
  'systemAdmin/fetchSystemOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSystemOverview();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system overview');
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'systemAdmin/fetchSystemStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSystemStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system stats');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'systemAdmin/fetchAllUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAllUsers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchAllProjects = createAsyncThunk(
  'systemAdmin/fetchAllProjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAllProjects(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'systemAdmin/fetchUserActivity',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const response = await getUserActivity(userId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user activity');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'systemAdmin/updateUserStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await toggleUserStatus(userId, isActive);
      return { userId, user: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const removeUser = createAsyncThunk(
  'systemAdmin/removeUser',
  async (userId, { rejectWithValue }) => {
    try {
      await deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const fetchProjectDetails = createAsyncThunk(
  'systemAdmin/fetchProjectDetails',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getProjectDetails(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project details');
    }
  }
);

export const removeProject = createAsyncThunk(
  'systemAdmin/removeProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

const initialState = {
  overview: null,
  stats: null,
  users: [],
  projects: [],
  userActivity: [],
  projectDetails: null,
  loading: false,
  error: null,
  pagination: {
    users: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false
    },
    projects: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false
    },
    userActivity: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false
    }
  }
};

const systemAdminSlice = createSlice({
  name: 'systemAdmin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserActivity: (state) => {
      state.userActivity = [];
    },
    clearProjectDetails: (state) => {
      state.projectDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch system overview
      .addCase(fetchSystemOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchSystemOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch system stats
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data.users;
        state.pagination.users = action.payload.data.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all projects
      .addCase(fetchAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.data.projects;
        state.pagination.projects = action.payload.data.pagination;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user activity
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.userActivity = action.payload.data.activities;
        state.pagination.userActivity = action.payload.data.pagination;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, user } = action.payload;
        const index = state.users.findIndex(u => u._id === userId);
        if (index !== -1) {
          state.users[index] = user;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove user
      .addCase(removeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch project details
      .addCase(fetchProjectDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.projectDetails = action.payload.data;
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove project
      .addCase(removeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project._id !== action.payload);
      })
      .addCase(removeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearUserActivity, clearProjectDetails } = systemAdminSlice.actions;

export default systemAdminSlice.reducer;
