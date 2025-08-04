import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import crmService from '../services/crmService';

// Initial state
const initialState = {
  dashboardData: null,
  contacts: [],
  leads: [],
  deals: [],
  tasks: [],
  activities: [],
  pagination: {
    total: 0,
    limit: 10,
    page: 1,
    pages: 1
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get dashboard overview
export const getDashboardOverview = createAsyncThunk(
  'crm/getDashboardOverview',
  async (projectId, thunkAPI) => {
    try {
      return await crmService.getDashboardOverview(projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get contacts
export const getContacts = createAsyncThunk(
  'crm/getContacts',
  async ({ projectId, params = {} }, thunkAPI) => {
    try {
      return await crmService.getContacts(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch contacts';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create contact
export const createContact = createAsyncThunk(
  'crm/createContact',
  async ({ projectId, contactData }, thunkAPI) => {
    try {
      return await crmService.createContact(projectId, contactData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create contact';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update contact
export const updateContact = createAsyncThunk(
  'crm/updateContact',
  async ({ projectId, contactId, contactData }, thunkAPI) => {
    try {
      return await crmService.updateContact(projectId, contactId, contactData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update contact';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete contact
export const deleteContact = createAsyncThunk(
  'crm/deleteContact',
  async ({ projectId, contactId }, thunkAPI) => {
    try {
      return await crmService.deleteContact(projectId, contactId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete contact';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get leads
export const getLeads = createAsyncThunk(
  'crm/getLeads',
  async ({ projectId, params = {} }, thunkAPI) => {
    try {
      return await crmService.getLeads(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch leads';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create lead
export const createLead = createAsyncThunk(
  'crm/createLead',
  async ({ projectId, leadData }, thunkAPI) => {
    try {
      return await crmService.createLead(projectId, leadData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create lead';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get deals
export const getDeals = createAsyncThunk(
  'crm/getDeals',
  async ({ projectId, params = {} }, thunkAPI) => {
    try {
      return await crmService.getDeals(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch deals';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create deal
export const createDeal = createAsyncThunk(
  'crm/createDeal',
  async ({ projectId, dealData }, thunkAPI) => {
    try {
      return await crmService.createDeal(projectId, dealData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create deal';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get tasks
export const getTasks = createAsyncThunk(
  'crm/getTasks',
  async ({ projectId, params = {} }, thunkAPI) => {
    try {
      return await crmService.getTasks(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch tasks';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create task
export const createTask = createAsyncThunk(
  'crm/createTask',
  async ({ projectId, taskData }, thunkAPI) => {
    try {
      return await crmService.createTask(projectId, taskData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create task';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Complete task
export const completeTask = createAsyncThunk(
  'crm/completeTask',
  async ({ projectId, taskId }, thunkAPI) => {
    try {
      return await crmService.completeTask(projectId, taskId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to complete task';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get activity log
export const getActivityLog = createAsyncThunk(
  'crm/getActivityLog',
  async ({ projectId, params = {} }, thunkAPI) => {
    try {
      return await crmService.getActivityLog(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch activity log';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// CRM slice
const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCrmData: (state) => {
      state.dashboardData = null;
      state.contacts = [];
      state.leads = [];
      state.deals = [];
      state.tasks = [];
      state.activities = [];
      state.pagination = {
        total: 0,
        limit: 10,
        page: 1,
        pages: 1
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get dashboard overview
      .addCase(getDashboardOverview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dashboardData = action.payload.data;
      })
      .addCase(getDashboardOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get contacts
      .addCase(getContacts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contacts = action.payload.data.contacts;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create contact
      .addCase(createContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contacts.unshift(action.payload.data.contact);
      })
      .addCase(createContact.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update contact
      .addCase(updateContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedContact = action.payload.data.contact;
        state.contacts = state.contacts.map(contact => 
          contact._id === updatedContact._id ? updatedContact : contact
        );
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete contact
      .addCase(deleteContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const deletedContactId = action.payload.data.contactId;
        state.contacts = state.contacts.filter(contact => contact._id !== deletedContactId);
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get leads
      .addCase(getLeads.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leads = action.payload.data.leads;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create lead
      .addCase(createLead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leads.unshift(action.payload.data.lead);
      })
      .addCase(createLead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get deals
      .addCase(getDeals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.deals = action.payload.data.deals;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getDeals.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create deal
      .addCase(createDeal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.deals.unshift(action.payload.data.deal);
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get tasks
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tasks = action.payload.data.tasks;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tasks.unshift(action.payload.data.task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Complete task
      .addCase(completeTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedTask = action.payload.data.task;
        state.tasks = state.tasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get activity log
      .addCase(getActivityLog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActivityLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activities = action.payload.data.activities;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getActivityLog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearCrmData } = crmSlice.actions;
export default crmSlice.reducer;