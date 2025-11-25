import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosConfig';
import {
  getProjectDeals,
  getArchivedDeals,
  getDeal,
  createDeal,
  updateDeal,
  archiveDeal,
  deleteDeal,
  restoreDeal,
  addDealActivity,
  getDealActivities,
  addDealNote,
  updateDealNote,
  deleteDealNote,
  bulkUpdateDeals,
  bulkArchiveDeals,
  bulkDeleteDeals,
  bulkAssignDeals,
  updateDealStatus,
  getDealStats,
  getDealVelocity,
  getDealForecast,
  getDealInsights,
  exportDeals
} from '../services/dealService';

// ==================== ASYNC THUNKS ====================

// Get project deals
export const fetchProjectDeals = createAsyncThunk(
  'deals/fetchProjectDeals',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getProjectDeals(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deals');
    }
  }
);

// Get customer deals
export const fetchCustomerDeals = createAsyncThunk(
  'deals/fetchCustomerDeals',
  async ({ projectId, customerId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/customers/${customerId}/deals?projectId=${projectId}`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer deals');
    }
  }
);

// Get company deals
export const fetchCompanyDeals = createAsyncThunk(
  'deals/fetchCompanyDeals',
  async ({ companyId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/companies/${companyId}/deals`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch company deals');
    }
  }
);

// Get archived deals
export const fetchArchivedDeals = createAsyncThunk(
  'deals/fetchArchivedDeals',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getArchivedDeals(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch archived deals');
    }
  }
);

// Get single deal
export const fetchDeal = createAsyncThunk(
  'deals/fetchDeal',
  async ({ projectId, dealId }, { rejectWithValue }) => {
    try {
      const response = await getDeal(projectId, dealId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal');
    }
  }
);

// Create deal
export const createNewDeal = createAsyncThunk(
  'deals/createDeal',
  async ({ projectId, dealData }, { rejectWithValue }) => {
    try {
      const response = await createDeal(projectId, dealData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create deal');
    }
  }
);

// Update deal
export const updateExistingDeal = createAsyncThunk(
  'deals/updateDeal',
  async ({ projectId, dealId, dealData }, { rejectWithValue }) => {
    try {
      const response = await updateDeal(projectId, dealId, dealData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update deal');
    }
  }
);

// Archive deal
export const archiveExistingDeal = createAsyncThunk(
  'deals/archiveDeal',
  async ({ projectId, dealId }, { rejectWithValue }) => {
    try {
      const response = await archiveDeal(projectId, dealId);
      return { dealId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to archive deal');
    }
  }
);

// Delete deal permanently
export const deleteExistingDeal = createAsyncThunk(
  'deals/deleteDeal',
  async ({ projectId, dealId }, { rejectWithValue }) => {
    try {
      const response = await deleteDeal(projectId, dealId);
      return { dealId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete deal');
    }
  }
);

// Restore deal
export const restoreExistingDeal = createAsyncThunk(
  'deals/restoreDeal',
  async ({ projectId, dealId }, { rejectWithValue }) => {
    try {
      const response = await restoreDeal(projectId, dealId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to restore deal');
    }
  }
);

// Add deal activity
export const addDealActivityAction = createAsyncThunk(
  'deals/addActivity',
  async ({ projectId, dealId, activityData }, { rejectWithValue }) => {
    try {
      const response = await addDealActivity(projectId, dealId, activityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add activity');
    }
  }
);

// Get deal activities
export const fetchDealActivities = createAsyncThunk(
  'deals/fetchActivities',
  async ({ projectId, dealId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getDealActivities(projectId, dealId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

// Add deal note
export const addDealNoteAction = createAsyncThunk(
  'deals/addNote',
  async ({ projectId, dealId, noteData }, { rejectWithValue }) => {
    try {
      const response = await addDealNote(projectId, dealId, noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  }
);

// Update deal note
export const updateDealNoteAction = createAsyncThunk(
  'deals/updateNote',
  async ({ projectId, dealId, noteId, noteData }, { rejectWithValue }) => {
    try {
      const response = await updateDealNote(projectId, dealId, noteId, noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update note');
    }
  }
);

// Delete deal note
export const deleteDealNoteAction = createAsyncThunk(
  'deals/deleteNote',
  async ({ projectId, dealId, noteId }, { rejectWithValue }) => {
    try {
      const response = await deleteDealNote(projectId, dealId, noteId);
      return { dealId, noteId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
    }
  }
);


// Bulk update deals
export const bulkUpdateDealsAction = createAsyncThunk(
  'deals/bulkUpdate',
  async ({ projectId, dealIds, updates }, { rejectWithValue }) => {
    try {
      const response = await bulkUpdateDeals(projectId, dealIds, updates);
      return { dealIds, updates, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update deals');
    }
  }
);

// Bulk archive deals
export const bulkArchiveDealsAction = createAsyncThunk(
  'deals/bulkArchive',
  async ({ projectId, dealIds }, { rejectWithValue }) => {
    try {
      const response = await bulkArchiveDeals(projectId, dealIds);
      return { dealIds, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk archive deals');
    }
  }
);

// Bulk delete deals permanently
export const bulkDeleteDealsAction = createAsyncThunk(
  'deals/bulkDelete',
  async ({ projectId, dealIds }, { rejectWithValue }) => {
    try {
      const response = await bulkDeleteDeals(projectId, dealIds);
      return { dealIds, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk delete deals');
    }
  }
);

// Bulk assign deals
export const bulkAssignDealsAction = createAsyncThunk(
  'deals/bulkAssign',
  async ({ projectId, dealIds, assignedTo }, { rejectWithValue }) => {
    try {
      const response = await bulkAssignDeals(projectId, dealIds, assignedTo);
      return { dealIds, assignedTo, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk assign deals');
    }
  }
);


// Update deal status
export const updateDealStatusAction = createAsyncThunk(
  'deals/updateStatus',
  async ({ projectId, dealId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await updateDealStatus(projectId, dealId, status, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update deal status');
    }
  }
);

// Get deal statistics
export const fetchDealStats = createAsyncThunk(
  'deals/fetchStats',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getDealStats(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal statistics');
    }
  }
);


// Get deal velocity
export const fetchDealVelocity = createAsyncThunk(
  'deals/fetchVelocity',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getDealVelocity(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal velocity');
    }
  }
);

// Get deal forecast
export const fetchDealForecast = createAsyncThunk(
  'deals/fetchForecast',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getDealForecast(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal forecast');
    }
  }
);

// Get deal insights
export const fetchDealInsights = createAsyncThunk(
  'deals/fetchInsights',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getDealInsights(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal insights');
    }
  }
);

// Export deals
export const exportDealsAction = createAsyncThunk(
  'deals/export',
  async ({ projectId, format = 'json', filters = {} }, { rejectWithValue }) => {
    try {
      const response = await exportDeals(projectId, format, filters);
      return { data: response.data, format };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export deals');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  // Deal list data
  deals: [],
  archivedDeals: [],
  currentDeal: null,
  selectedDeals: [],
  showArchived: false,
  
  // Customer and company specific deals
  customerDeals: [],
  companyDeals: [],
  customerDealStats: null,
  companyDealStats: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  // Filters and sorting
  filters: {
    search: '',
    status: [],
    stage: [],
    priority: [],
    assignedTo: [],
    source: '',
    tags: [],
    minValue: null,
    maxValue: null,
    expectedCloseDateFrom: null,
    expectedCloseDateTo: null,
    createdDateFrom: null,
    createdDateTo: null,
    isArchived: false
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  
  // Activities and notes
  activities: [],
  notes: [],
  
  // Statistics and analytics
  stats: null,
  funnel: null,
  velocity: null,
  forecast: null,
  insights: null,
  
  // UI state
  loading: false,
  error: null,
  success: null,
  
  // Modal states
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showBulkActions: false,
  
  // Sidebar states
  showFilters: false,
  showStats: false,
  
  // Export state
  exporting: false,
  exportError: null
};

// ==================== SLICE ====================

const dealSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    // Clear messages
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Toggle archived deals view
    toggleArchivedView: (state) => {
      state.showArchived = !state.showArchived;
    },
    
    // Set sorting
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    
    // Select deal
    selectDeal: (state, action) => {
      const dealId = action.payload;
      if (state.selectedDeals.includes(dealId)) {
        state.selectedDeals = state.selectedDeals.filter(id => id !== dealId);
      } else {
        state.selectedDeals.push(dealId);
      }
    },
    
    // Select all deals
    selectAllDeals: (state) => {
      if (state.selectedDeals.length === state.deals.length) {
        state.selectedDeals = [];
      } else {
        state.selectedDeals = state.deals.map(deal => deal._id);
      }
    },
    
    // Clear selection
    clearSelection: (state) => {
      state.selectedDeals = [];
    },
    
    // Set current deal
    setCurrentDeal: (state, action) => {
      state.currentDeal = action.payload;
    },
    
    // Clear current deal
    clearCurrentDeal: (state) => {
      state.currentDeal = null;
    },
    
    // Toggle modals
    toggleCreateModal: (state) => {
      state.showCreateModal = !state.showCreateModal;
    },
    
    toggleEditModal: (state) => {
      state.showEditModal = !state.showEditModal;
    },
    
    toggleDeleteModal: (state) => {
      state.showDeleteModal = !state.showDeleteModal;
    },
    
    toggleBulkActions: (state) => {
      state.showBulkActions = !state.showBulkActions;
    },
    
    // Toggle sidebars
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    
    toggleStats: (state) => {
      state.showStats = !state.showStats;
    },
    
    // Update deal in list (optimistic updates)
    updateDealInList: (state, action) => {
      const updatedDeal = action.payload;
      const index = state.deals.findIndex(deal => deal._id === updatedDeal._id);
      if (index !== -1) {
        state.deals[index] = { ...state.deals[index], ...updatedDeal };
      }
    },
    
    // Add deal to list
    addDealToList: (state, action) => {
      state.deals.unshift(action.payload);
    },
    
    // Remove deal from list
    removeDealFromList: (state, action) => {
      const dealId = action.payload;
      state.deals = state.deals.filter(deal => deal._id !== dealId);
      state.selectedDeals = state.selectedDeals.filter(id => id !== dealId);
    },
    
    // Update deal activities
    updateDealActivities: (state, action) => {
      const { dealId, activities } = action.payload;
      const deal = state.deals.find(d => d._id === dealId);
      if (deal) {
        deal.activities = activities;
      }
      if (state.currentDeal && state.currentDeal._id === dealId) {
        state.currentDeal.activities = activities;
      }
    },
    
    // Add activity to deal
    addActivityToDeal: (state, action) => {
      const activity = action.payload;
      const deal = state.deals.find(d => d._id === activity.dealId);
      if (deal) {
        deal.activities = deal.activities || [];
        deal.activities.push(activity);
      }
      if (state.currentDeal && state.currentDeal._id === activity.dealId) {
        state.currentDeal.activities = state.currentDeal.activities || [];
        state.currentDeal.activities.push(activity);
      }
    },
    
    // Update deal notes
    updateDealNotes: (state, action) => {
      const { dealId, notes } = action.payload;
      const deal = state.deals.find(d => d._id === dealId);
      if (deal) {
        deal.notes = notes;
      }
      if (state.currentDeal && state.currentDeal._id === dealId) {
        state.currentDeal.notes = notes;
      }
    },
    
    // Add note to deal
    addNoteToDeal: (state, action) => {
      const note = action.payload;
      const deal = state.deals.find(d => d._id === note.dealId);
      if (deal) {
        deal.notes = deal.notes || [];
        deal.notes.push(note);
      }
      if (state.currentDeal && state.currentDeal._id === note.dealId) {
        state.currentDeal.notes = state.currentDeal.notes || [];
        state.currentDeal.notes.push(note);
      }
    },
    
  },
  extraReducers: (builder) => {
    builder
      // Fetch project deals
      .addCase(fetchProjectDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjectDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single deal
      .addCase(fetchDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeal = action.payload.data;
      })
      .addCase(fetchDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create deal
      .addCase(createNewDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.deals.unshift(action.payload.data);
        state.success = 'Deal created successfully';
        state.showCreateModal = false;
      })
      .addCase(createNewDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update deal
      .addCase(updateExistingDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingDeal.fulfilled, (state, action) => {
        state.loading = false;
        const updatedDeal = action.payload.data;
        const index = state.deals.findIndex(deal => deal._id === updatedDeal._id);
        if (index !== -1) {
          state.deals[index] = updatedDeal;
        }
        if (state.currentDeal && state.currentDeal._id === updatedDeal._id) {
          state.currentDeal = updatedDeal;
        }
        state.success = 'Deal updated successfully';
        state.showEditModal = false;
      })
      .addCase(updateExistingDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete deal
      .addCase(deleteExistingDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingDeal.fulfilled, (state, action) => {
        state.loading = false;
        const dealId = action.payload.dealId;
        state.deals = state.deals.filter(deal => deal._id !== dealId);
        state.selectedDeals = state.selectedDeals.filter(id => id !== dealId);
        if (state.currentDeal && state.currentDeal._id === dealId) {
          state.currentDeal = null;
        }
        state.success = action.payload.message;
        state.showDeleteModal = false;
      })
      .addCase(deleteExistingDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Restore deal
      .addCase(restoreExistingDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreExistingDeal.fulfilled, (state, action) => {
        state.loading = false;
        const restoredDeal = action.payload.data;
        state.deals.unshift(restoredDeal);
        state.success = 'Deal restored successfully';
      })
      .addCase(restoreExistingDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add deal activity
      .addCase(addDealActivityAction.fulfilled, (state, action) => {
        const activity = action.payload.data;
        const deal = state.deals.find(d => d._id === activity.dealId);
        if (deal) {
          deal.activities = deal.activities || [];
          deal.activities.push(activity);
        }
        if (state.currentDeal && state.currentDeal._id === activity.dealId) {
          state.currentDeal.activities = state.currentDeal.activities || [];
          state.currentDeal.activities.push(activity);
        }
      })
      
      // Fetch deal activities
      .addCase(fetchDealActivities.fulfilled, (state, action) => {
        state.activities = action.payload.data;
      })
      
      // Add deal note
      .addCase(addDealNoteAction.fulfilled, (state, action) => {
        const note = action.payload.data;
        const deal = state.deals.find(d => d._id === note.dealId);
        if (deal) {
          deal.notes = deal.notes || [];
          deal.notes.push(note);
        }
        if (state.currentDeal && state.currentDeal._id === note.dealId) {
          state.currentDeal.notes = state.currentDeal.notes || [];
          state.currentDeal.notes.push(note);
        }
      })
      
      // Update deal note
      .addCase(updateDealNoteAction.fulfilled, (state, action) => {
        const updatedNote = action.payload.data;
        const deal = state.deals.find(d => d._id === updatedNote.dealId);
        if (deal && deal.notes) {
          const noteIndex = deal.notes.findIndex(note => note._id === updatedNote._id);
          if (noteIndex !== -1) {
            deal.notes[noteIndex] = updatedNote;
          }
        }
        if (state.currentDeal && state.currentDeal._id === updatedNote.dealId && state.currentDeal.notes) {
          const noteIndex = state.currentDeal.notes.findIndex(note => note._id === updatedNote._id);
          if (noteIndex !== -1) {
            state.currentDeal.notes[noteIndex] = updatedNote;
          }
        }
      })
      
      // Delete deal note
      .addCase(deleteDealNoteAction.fulfilled, (state, action) => {
        const { dealId, noteId } = action.payload;
        const deal = state.deals.find(d => d._id === dealId);
        if (deal && deal.notes) {
          deal.notes = deal.notes.filter(note => note._id !== noteId);
        }
        if (state.currentDeal && state.currentDeal._id === dealId && state.currentDeal.notes) {
          state.currentDeal.notes = state.currentDeal.notes.filter(note => note._id !== noteId);
        }
      })
      
      
      // Bulk update deals
      .addCase(bulkUpdateDealsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateDealsAction.fulfilled, (state, action) => {
        state.loading = false;
        const { dealIds, updates } = action.payload;
        state.deals = state.deals.map(deal => 
          dealIds.includes(deal._id) ? { ...deal, ...updates } : deal
        );
        state.selectedDeals = [];
        state.success = action.payload.message;
        state.showBulkActions = false;
      })
      .addCase(bulkUpdateDealsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk delete deals
      .addCase(bulkDeleteDealsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteDealsAction.fulfilled, (state, action) => {
        state.loading = false;
        const dealIds = action.payload.dealIds;
        state.deals = state.deals.filter(deal => !dealIds.includes(deal._id));
        state.selectedDeals = [];
        state.success = action.payload.message;
        state.showBulkActions = false;
      })
      .addCase(bulkDeleteDealsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk assign deals
      .addCase(bulkAssignDealsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkAssignDealsAction.fulfilled, (state, action) => {
        state.loading = false;
        const { dealIds, assignedTo } = action.payload;
        state.deals = state.deals.map(deal => 
          dealIds.includes(deal._id) ? { ...deal, assignedTo } : deal
        );
        state.selectedDeals = [];
        state.success = action.payload.message;
        state.showBulkActions = false;
      })
      .addCase(bulkAssignDealsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      
      // Update deal status
      .addCase(updateDealStatusAction.fulfilled, (state, action) => {
        const updatedDeal = action.payload.data;
        const index = state.deals.findIndex(deal => deal._id === updatedDeal._id);
        if (index !== -1) {
          state.deals[index] = updatedDeal;
        }
        if (state.currentDeal && state.currentDeal._id === updatedDeal._id) {
          state.currentDeal = updatedDeal;
        }
        state.success = 'Deal status updated successfully';
      })
      
      // Fetch deal statistics
      .addCase(fetchDealStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      
      
      // Fetch deal velocity
      .addCase(fetchDealVelocity.fulfilled, (state, action) => {
        state.velocity = action.payload.data;
      })
      
      // Fetch deal forecast
      .addCase(fetchDealForecast.fulfilled, (state, action) => {
        state.forecast = action.payload.data;
      })
      
      // Fetch deal insights
      .addCase(fetchDealInsights.fulfilled, (state, action) => {
        state.insights = action.payload.data;
      })
      
      // Fetch customer deals
      .addCase(fetchCustomerDeals.fulfilled, (state, action) => {
        state.customerDeals = action.payload.data;
      })
      
      // Fetch company deals
      .addCase(fetchCompanyDeals.fulfilled, (state, action) => {
        state.companyDeals = action.payload.data;
      })
      
      // Fetch archived deals
      .addCase(fetchArchivedDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArchivedDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.archivedDeals = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchArchivedDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Archive deal
      .addCase(archiveExistingDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveExistingDeal.fulfilled, (state, action) => {
        state.loading = false;
        const dealId = action.payload.dealId;
        state.deals = state.deals.filter(deal => deal._id !== dealId);
        state.selectedDeals = state.selectedDeals.filter(id => id !== dealId);
        if (state.currentDeal && state.currentDeal._id === dealId) {
          state.currentDeal = null;
        }
        state.success = action.payload.message;
      })
      .addCase(archiveExistingDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk archive deals
      .addCase(bulkArchiveDealsAction.fulfilled, (state, action) => {
        state.deals = state.deals.filter(deal => !action.payload.dealIds.includes(deal._id));
        state.selectedDeals = [];
        state.success = action.payload.message;
      })
      
      // Export deals
      .addCase(exportDealsAction.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportDealsAction.fulfilled, (state, action) => {
        state.exporting = false;
        // Handle file download here if needed
      })
      .addCase(exportDealsAction.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
      });
  }
});

export const {
  clearMessages,
  setFilters,
  clearFilters,
  toggleArchivedView,
  setSorting,
  selectDeal,
  selectAllDeals,
  clearSelection,
  setCurrentDeal,
  clearCurrentDeal,
  toggleCreateModal,
  toggleEditModal,
  toggleDeleteModal,
  toggleBulkActions,
  toggleFilters,
  toggleStats,
  updateDealInList,
  addDealToList,
  removeDealFromList,
  updateDealActivities,
  addActivityToDeal,
  updateDealNotes,
  addNoteToDeal
} = dealSlice.actions;


export default dealSlice.reducer;
