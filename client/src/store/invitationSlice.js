import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import invitationService from '../services/invitationService';

// Initial state
const initialState = {
  invitations: [],
  invitation: null,
  userInvitations: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Create invitation
export const createInvitation = createAsyncThunk(
  'invitations/createInvitation',
  async ({projectId, invitationData}, thunkAPI) => {
    try {
      return await invitationService.createInvitation(projectId, invitationData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create invitation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all invitations for a project
export const getProjectInvitations = createAsyncThunk(
  'invitations/getProjectInvitations',
  async (projectId, thunkAPI) => {
    try {
      return await invitationService.getProjectInvitations(projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch project invitations';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all invitations for current user
export const getUserInvitations = createAsyncThunk(
  'invitations/getUserInvitations',
  async (_, thunkAPI) => {
    try {
      return await invitationService.getUserInvitations();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user invitations';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get invitation by token
export const getInvitationByToken = createAsyncThunk(
  'invitations/getInvitationByToken',
  async (token, thunkAPI) => {
    try {
      return await invitationService.getInvitationByToken(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch invitation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Accept invitation
export const acceptInvitation = createAsyncThunk(
  'invitations/acceptInvitation',
  async (token, thunkAPI) => {
    try {
      return await invitationService.acceptInvitation(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to accept invitation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Decline invitation
export const declineInvitation = createAsyncThunk(
  'invitations/declineInvitation',
  async (token, thunkAPI) => {
    try {
      return await invitationService.declineInvitation(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to decline invitation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Resend invitation
export const resendInvitation = createAsyncThunk(
  'invitations/resendInvitation',
  async ({id, projectId}, thunkAPI) => {
    try {
      return await invitationService.resendInvitation(id, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to resend invitation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Cancel invitation
export const cancelInvitation = createAsyncThunk(
  'invitations/cancelInvitation',
  async ({id, projectId}, thunkAPI) => {
    try {
      return await invitationService.cancelInvitation(id, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to cancel invitation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete invitation
export const deleteInvitation = createAsyncThunk(
  'invitations/deleteInvitation',
  async ({id, projectId}, thunkAPI) => {
    try {
      return await invitationService.deleteInvitation(id, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete invitation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Invitation slice
const invitationSlice = createSlice({
  name: 'invitations',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearInvitation: (state) => {
      state.invitation = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create invitation
      .addCase(createInvitation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invitations.push(action.payload.data.invitation);
      })
      .addCase(createInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get project invitations
      .addCase(getProjectInvitations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectInvitations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invitations = action.payload.data.invitations;
      })
      .addCase(getProjectInvitations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get user invitations
      .addCase(getUserInvitations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserInvitations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userInvitations = action.payload.data.invitations;
      })
      .addCase(getUserInvitations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get invitation by token
      .addCase(getInvitationByToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInvitationByToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invitation = action.payload.data.invitation;
      })
      .addCase(getInvitationByToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Accept invitation
      .addCase(acceptInvitation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userInvitations = state.userInvitations.filter(
          invitation => invitation._id !== state.invitation?._id
        );
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Decline invitation
      .addCase(declineInvitation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(declineInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userInvitations = state.userInvitations.filter(
          invitation => invitation._id !== state.invitation?._id
        );
      })
      .addCase(declineInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Resend invitation
      .addCase(resendInvitation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invitations = state.invitations.map(invitation => 
          invitation._id === action.payload.data.invitation._id 
            ? action.payload.data.invitation 
            : invitation
        );
      })
      .addCase(resendInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Cancel invitation
      .addCase(cancelInvitation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invitations = state.invitations.filter(invitation => invitation._id !== action.meta.arg.id);
      })
      .addCase(cancelInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete invitation
      .addCase(deleteInvitation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invitations = state.invitations.filter(invitation => invitation._id !== action.meta.arg.id);
      })
      .addCase(deleteInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearInvitation } = invitationSlice.actions;
export default invitationSlice.reducer;