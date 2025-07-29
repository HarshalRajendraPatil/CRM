import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../services/userService';

// Initial state
const initialState = {
  users: [],
  user: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get all users with pagination and filtering
export const getUsers = createAsyncThunk(
  'users/getAll',
  async (params, thunkAPI) => {
    try {
      return await userService.getUsers(params);
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch users';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user by ID
export const getUserById = createAsyncThunk(
  'users/getById',
  async (id, thunkAPI) => {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new user
export const createUser = createAsyncThunk(
  'users/create',
  async (userData, thunkAPI) => {
    try {
      return await userService.createUser(userData);
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to create user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, userData }, thunkAPI) => {
    try {
      return await userService.updateUser(id, userData);
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to update user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, thunkAPI) => {
    try {
      return await userService.deleteUser(id);
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to delete user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reset user password
export const resetUserPassword = createAsyncThunk(
  'users/resetPassword',
  async ({ id, passwordData }, thunkAPI) => {
    try {
      return await userService.resetUserPassword(id, passwordData);
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Toggle user active status
export const toggleUserStatus = createAsyncThunk(
  'users/toggleStatus',
  async (id, thunkAPI) => {
    try {
      return await userService.toggleUserStatus(id);
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to toggle user status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user statistics
export const getUserStats = createAsyncThunk(
  'users/getStats',
  async (_, thunkAPI) => {
    try {
      return await userService.getUserStats();
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user activity logs
export const getUserActivity = createAsyncThunk(
  'users/getActivity',
  async (id, thunkAPI) => {
    try {
      return await userService.getUserActivity(id);
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user activity';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearUser: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.data.users;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users.push(action.payload.data.user);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
        state.users = state.users.map(user => 
          user._id === action.payload.data.user._id ? action.payload.data.user : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = state.users.filter(user => user._id !== action.meta.arg);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Reset user password
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Toggle user status
      .addCase(toggleUserStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Update user in state if it exists
        if (state.user && state.user._id === action.meta.arg) {
          state.user.isActive = action.payload.data.isActive;
        }
        
        // Update user in users array
        state.users = state.users.map(user => {
          if (user._id === action.meta.arg) {
            return { ...user, isActive: action.payload.data.isActive };
          }
          return user;
        });
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get user stats
      .addCase(getUserStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload.data;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearUser } = userSlice.actions;
export default userSlice.reducer; 