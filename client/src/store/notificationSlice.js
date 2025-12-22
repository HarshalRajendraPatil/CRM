import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../services/notificationService';

// Initial state
const initialState = {
  notifications: [],
  notification: null,
  pagination: {
    total: 0,
    unreadCount: 0,
    limit: 20,
    skip: 0,
    hasMore: false
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get user notifications
export const getUserNotifications = createAsyncThunk(
  'notifications/getUserNotifications',
  async (params = {}, thunkAPI) => {
    try {
      return await notificationService.getUserNotifications(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get notification by ID
export const getNotificationById = createAsyncThunk(
  'notifications/getNotificationById',
  async (id, thunkAPI) => {
    try {
      return await notificationService.getNotificationById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notification';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, thunkAPI) => {
    try {
      return await notificationService.markAsRead(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to mark notification as read';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (filters = {}, thunkAPI) => {
    try {
      return await notificationService.markAllAsRead(filters);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to mark notifications as read';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, thunkAPI) => {
    try {
      return await notificationService.deleteNotification(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete notification';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete all notifications
export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAllNotifications',
  async (filters = {}, thunkAPI) => {
    try {
      return await notificationService.deleteAllNotifications(filters);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete notifications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get unread notification count
export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, thunkAPI) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get unread count';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    addNotification: (state, action) => {
      // Check if notification already exists to prevent duplicates
      const existingIndex = state.notifications.findIndex(
        n => n._id === action.payload._id
      );
      
      if (existingIndex === -1) {
      // Add a new notification from socket to the beginning of the array
      state.notifications.unshift(action.payload);
      state.pagination.total += 1;
        // Only increment unread count if notification is unread
        if (!action.payload.isRead) {
          state.pagination.unreadCount += 1;
        }
      } else {
        // Update existing notification instead of adding duplicate
        state.notifications[existingIndex] = action.payload;
        // Update unread count if status changed
        const wasRead = state.notifications[existingIndex].isRead;
        const isRead = action.payload.isRead;
        if (!wasRead && isRead) {
          state.pagination.unreadCount = Math.max(0, state.pagination.unreadCount - 1);
        } else if (wasRead && !isRead) {
      state.pagination.unreadCount += 1;
        }
      }
    },
    updateNotificationReadStatus: (state, action) => {
      // Update a notification's read status
      const { id, isRead } = action.payload;
      const notification = state.notifications.find(n => n._id === id);
      if (notification) {
        notification.isRead = isRead;
        state.pagination.unreadCount = isRead 
          ? Math.max(0, state.pagination.unreadCount - 1)
          : state.pagination.unreadCount + 1;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination = {
        total: 0,
        unreadCount: 0,
        limit: 20,
        skip: 0,
        hasMore: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user notifications
      .addCase(getUserNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // If skip is 0, replace notifications, otherwise append
        const skip = action.meta.arg?.skip || 0;
        if (skip === 0) {
          state.notifications = action.payload.data.notifications;
        } else {
          state.notifications = [...state.notifications, ...action.payload.data.notifications];
        }
        
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getUserNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get notification by ID
      .addCase(getNotificationById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNotificationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notification = action.payload.data.notification;
      })
      .addCase(getNotificationById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Mark notification as read
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Update the notification in the list
        const updatedNotification = action.payload.data.notification;
        state.notifications = state.notifications.map(notification => 
          notification._id === updatedNotification._id ? updatedNotification : notification
        );
        
        // Update unread count
        if (state.pagination.unreadCount > 0) {
          state.pagination.unreadCount -= 1;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Mark all notifications as read
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Update all notifications in the list to read
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        
        // Update unread count
        state.pagination.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Remove the notification from the list
        const id = action.meta.arg;
        const deletedNotification = state.notifications.find(n => n._id === id);
        state.notifications = state.notifications.filter(notification => notification._id !== id);
        
        // Update counts
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (deletedNotification && !deletedNotification.isRead) {
          state.pagination.unreadCount = Math.max(0, state.pagination.unreadCount - 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete all notifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notifications = [];
        state.pagination = {
          ...state.pagination,
          total: 0,
          unreadCount: 0,
          hasMore: false
        };
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get unread notification count
      .addCase(getUnreadCount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pagination.unreadCount = action.payload.data.count;
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, addNotification, updateNotificationReadStatus, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;