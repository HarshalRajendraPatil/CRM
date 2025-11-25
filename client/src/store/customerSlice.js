import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as customerService from '../services/customerService';

// Async thunks
export const fetchProjectCustomers = createAsyncThunk(
  'customers/fetchProjectCustomers',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await customerService.getProjectCustomers(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomer = createAsyncThunk(
  'customers/fetchCustomer',
  async ({ projectId, id }, { rejectWithValue }) => {
    try {
      const response = await customerService.fetchCustomer(projectId, id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async ({ projectId, customerData }, { rejectWithValue }) => {
    try {
      const response = await customerService.createCustomer(projectId, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ projectId, id, customerData }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateCustomer(projectId, id, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

export const archiveCustomer = createAsyncThunk(
  'customers/archiveCustomer',
  async ({ projectId, id }, { rejectWithValue }) => {
    try {
      const response = await customerService.archiveCustomer(projectId, id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to archive customer');
    }
  }
);

export const unarchiveCustomer = createAsyncThunk(
  'customers/unarchiveCustomer',
  async ({ projectId, id }, { rejectWithValue }) => {
    try {
      const response = await customerService.unarchiveCustomer(projectId, id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unarchive customer');
    }
  }
);

export const fetchArchivedCustomers = createAsyncThunk(
  'customers/fetchArchivedCustomers',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await customerService.getArchivedCustomers(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch archived customers');
    }
  }
);

export const addCustomerNote = createAsyncThunk(
  'customers/addCustomerNote',
  async ({ projectId, id, noteData }, { rejectWithValue }) => {
    try {
      const response = await customerService.addCustomerNote(projectId, id, noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  }
);

export const addCustomerInteraction = createAsyncThunk(
  'customers/addCustomerInteraction',
  async ({ projectId, id, interactionData }, { rejectWithValue }) => {
    try {
      const response = await customerService.addCustomerInteraction(projectId, id, interactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add interaction');
    }
  }
);

export const updateCustomerNote = createAsyncThunk(
  'customers/updateCustomerNote',
  async ({ projectId, customerId, noteId, noteData }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateCustomerNote(projectId, customerId, noteId, noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update note');
    }
  }
);

export const deleteCustomerNote = createAsyncThunk(
  'customers/deleteCustomerNote',
  async ({ projectId, customerId, noteId }, { rejectWithValue }) => {
    try {
      const response = await customerService.deleteCustomerNote(projectId, customerId, noteId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
    }
  }
);

export const updateCustomerInteraction = createAsyncThunk(
  'customers/updateCustomerInteraction',
  async ({ projectId, customerId, interactionId, interactionData }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateCustomerInteraction(projectId, customerId, interactionId, interactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update interaction');
    }
  }
);

export const deleteCustomerInteraction = createAsyncThunk(
  'customers/deleteCustomerInteraction',
  async ({ projectId, customerId, interactionId }, { rejectWithValue }) => {
    try {
      const response = await customerService.deleteCustomerInteraction(projectId, customerId, interactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete interaction');
    }
  }
);

export const convertLeadToCustomer = createAsyncThunk(
  'customers/convertLeadToCustomer',
  async ({ projectId, leadId, customerData }, { rejectWithValue }) => {
    try {
      const response = await customerService.convertLeadToCustomer(projectId, leadId, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to convert lead');
    }
  }
);

export const fetchCustomerStats = createAsyncThunk(
  'customers/fetchCustomerStats',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerStats(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer stats');
    }
  }
);

export const fetchCustomerInsights = createAsyncThunk(
  'customers/fetchCustomerInsights',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerInsights(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer insights');
    }
  }
);

export const fetchCustomerForecast = createAsyncThunk(
  'customers/fetchCustomerForecast',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerForecast(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer forecast');
    }
  }
);

export const bulkUpdateCustomers = createAsyncThunk(
  'customers/bulkUpdateCustomers',
  async ({ projectId, customerIds, updates }, { rejectWithValue }) => {
    try {
      const response = await customerService.bulkUpdateCustomers(projectId, customerIds, updates);
      return { customerIds, updates, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update customers');
    }
  }
);

export const bulkArchiveCustomers = createAsyncThunk(
  'customers/bulkArchiveCustomers',
  async ({ projectId, customerIds }, { rejectWithValue }) => {
    try {
      const response = await customerService.bulkArchiveCustomers(projectId, customerIds);
      return { customerIds, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk archive customers');
    }
  }
);

export const bulkUnarchiveCustomers = createAsyncThunk(
  'customers/bulkUnarchiveCustomers',
  async ({ projectId, customerIds }, { rejectWithValue }) => {
    try {
      const response = await customerService.bulkUnarchiveCustomers(projectId, customerIds);
      return { customerIds, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk unarchive customers');
    }
  }
);

export const bulkAssignCustomers = createAsyncThunk(
  'customers/bulkAssignCustomers',
  async ({ projectId, customerIds, assignedTo }, { rejectWithValue }) => {
    try {
      const response = await customerService.bulkAssignCustomers(projectId, customerIds, assignedTo);
      return { customerIds, assignedTo, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk assign customers');
    }
  }
);

export const bulkUpdateCustomerStages = createAsyncThunk(
  'customers/bulkUpdateCustomerStages',
  async ({ projectId, customerIds, stage }, { rejectWithValue }) => {
    try {
      const response = await customerService.bulkUpdateCustomerStages(projectId, customerIds, stage);
      return { customerIds, stage, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update customer stages');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async ({ projectId, id }, { rejectWithValue }) => {
    try {
      const response = await customerService.deleteCustomer(projectId, id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

export const bulkDeleteCustomers = createAsyncThunk(
  'customers/bulkDeleteCustomers',
  async ({ projectId, customerIds }, { rejectWithValue }) => {
    try {
      const response = await customerService.bulkDeleteCustomers(projectId, customerIds);
      return { customerIds, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk delete customers');
    }
  }
);

export const bulkUpdateCustomerPriorities = createAsyncThunk(
  'customers/bulkUpdateCustomerPriorities',
  async ({ projectId, customerIds, priority }, { rejectWithValue }) => {
    try {
      const response = await customerService.bulkUpdateCustomerPriorities(projectId, customerIds, priority);
      return { customerIds, priority, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update customer priorities');
    }
  }
);

export const bulkUpdateCustomerStatuses = createAsyncThunk(
  'customers/bulkUpdateCustomerStatuses',
  async ({ projectId, customerIds, status }, { rejectWithValue }) => {
    try {
      const response = await customerService.bulkUpdateCustomerStatuses(projectId, customerIds, status);
      return { customerIds, status, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update customer statuses');
    }
  }
);

export const exportCustomers = createAsyncThunk(
  'customers/exportCustomers',
  async ({ projectId, format = 'json' }, { rejectWithValue }) => {
    try {
      const response = await customerService.exportCustomers(projectId, format);
      return { format, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export customers');
    }
  }
);

export const fetchCustomerDeals = createAsyncThunk(
  'customers/fetchCustomerDeals',
  async ({ projectId, customerId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerDeals(projectId, customerId, params);
      return { customerId, deals: response.data.data, pagination: response.data.pagination };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer deals');
    }
  }
);

export const fetchCustomerDealStats = createAsyncThunk(
  'customers/fetchCustomerDealStats',
  async ({ projectId, customerId }, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerDealStats(projectId, customerId);
      return { customerId, stats: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer deal stats');
    }
  }
);

// Customer slice
const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    archivedCustomers: [],
    currentCustomer: null,
    stats: null,
    insights: null,
    forecast: null,
    customerDeals: {},
    customerDealStats: {},
    filters: {
      search: '',
      stage: '',
      status: '',
      source: '',
      tags: [],
      owner: '',
      priority: '',
      assignedTo: ''
    },
    pagination: {
      total: 0,
      limit: 20,
      skip: 0,
      hasMore: false
    },
    archivedPagination: {
      total: 0,
      limit: 20,
      skip: 0,
      hasMore: false
    },
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isArchiving: false,
    isStatsLoading: false,
    isInsightsLoading: false,
    isForecastLoading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        stage: '',
        status: '',
        source: '',
        tags: [],
        owner: '',
        priority: '',
        assignedTo: ''
      };
    },
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    updateCustomerInList: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.customers.findIndex(customer => customer._id === id);
      if (index !== -1) {
        state.customers[index] = { ...state.customers[index], ...updates };
      }
    },
    removeCustomerFromList: (state, action) => {
      const id = action.payload;
      state.customers = state.customers.filter(customer => customer._id !== id);
    },
    addCustomerToList: (state, action) => {
      state.customers.unshift(action.payload);
    },
    updateCustomerNote: (state, action) => {
      const { customerId, noteId, content } = action.payload;
      const customer = state.customers.find(c => c._id === customerId);
      if (customer) {
        const note = customer.notes.find(n => n._id === noteId);
        if (note) {
          note.content = content;
          note.updatedAt = new Date().toISOString();
        }
      }
      if (state.currentCustomer && state.currentCustomer._id === customerId) {
        const note = state.currentCustomer.notes.find(n => n._id === noteId);
        if (note) {
          note.content = content;
          note.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteCustomerNote: (state, action) => {
      const { customerId, noteId } = action.payload;
      const customer = state.customers.find(c => c._id === customerId);
      if (customer) {
        customer.notes = customer.notes.filter(n => n._id !== noteId);
      }
      if (state.currentCustomer && state.currentCustomer._id === customerId) {
        state.currentCustomer.notes = state.currentCustomer.notes.filter(n => n._id !== noteId);
      }
    },
    addInteractionToCustomer: (state, action) => {
      const { customerId, interaction } = action.payload;
      const customer = state.customers.find(c => c._id === customerId);
      if (customer) {
        customer.interactions.unshift(interaction);
      }
      if (state.currentCustomer && state.currentCustomer._id === customerId) {
        state.currentCustomer.interactions.unshift(interaction);
      }
    },
    updateCustomerStage: (state, action) => {
      const { id, stage } = action.payload;
      const customer = state.customers.find(c => c._id === id);
      if (customer) {
        customer.stage = stage;
      }
      if (state.currentCustomer && state.currentCustomer._id === id) {
        state.currentCustomer.stage = stage;
      }
    },
    updateCustomerStatus: (state, action) => {
      const { id, status } = action.payload;
      const customer = state.customers.find(c => c._id === id);
      if (customer) {
        customer.status = status;
      }
      if (state.currentCustomer && state.currentCustomer._id === id) {
        state.currentCustomer.status = status;
      }
    },
    updateCustomerPriority: (state, action) => {
      const { id, priority } = action.payload;
      const customer = state.customers.find(c => c._id === id);
      if (customer) {
        customer.priority = priority;
      }
      if (state.currentCustomer && state.currentCustomer._id === id) {
        state.currentCustomer.priority = priority;
      }
    },
    updateCustomerScore: (state, action) => {
      const { id, score } = action.payload;
      const customer = state.customers.find(c => c._id === id);
      if (customer) {
        customer.score = score;
      }
      if (state.currentCustomer && state.currentCustomer._id === id) {
        state.currentCustomer.score = score;
      }
    },

    assignCustomerToUser: (state, action) => {
      const { id, assignedTo } = action.payload;
      const customer = state.customers.find(c => c._id === id);
      if (customer) {
        customer.assignedTo = assignedTo;
      }
      if (state.currentCustomer && state.currentCustomer._id === id) {
        state.currentCustomer.assignedTo = assignedTo;
      }
    },
    addTagsToCustomer: (state, action) => {
      const { id, tags } = action.payload;
      const customer = state.customers.find(c => c._id === id);
      if (customer) {
        customer.tags = [...new Set([...customer.tags, ...tags])];
      }
      if (state.currentCustomer && state.currentCustomer._id === id) {
        state.currentCustomer.tags = [...new Set([...state.currentCustomer.tags, ...tags])];
      }
    },
    removeTagsFromCustomer: (state, action) => {
      const { id, tagsToRemove } = action.payload;
      const customer = state.customers.find(c => c._id === id);
      if (customer) {
        customer.tags = customer.tags.filter(tag => !tagsToRemove.includes(tag));
      }
      if (state.currentCustomer && state.currentCustomer._id === id) {
        state.currentCustomer.tags = state.currentCustomer.tags.filter(tag => !tagsToRemove.includes(tag));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project customers
      .addCase(fetchProjectCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjectCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch single customer
      .addCase(fetchCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload.data || action.payload;
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isCreating = false;
        const customerData = action.payload.data || action.payload;
        state.customers.unshift(customerData);
        state.successMessage = action.payload.message || 'Customer created successfully';
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isUpdating = false;
        const customerData = action.payload.data || action.payload;
        const index = state.customers.findIndex(c => c._id === customerData._id);
        if (index !== -1) {
          state.customers[index] = customerData;
        }
        if (state.currentCustomer && state.currentCustomer._id === customerData._id) {
          state.currentCustomer = customerData;
        }
        state.successMessage = action.payload.message || 'Customer updated successfully';
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Archive customer
      .addCase(archiveCustomer.pending, (state) => {
        state.isArchiving = true;
        state.error = null;
      })
      .addCase(archiveCustomer.fulfilled, (state, action) => {
        state.isArchiving = false;
        state.customers = state.customers.filter(c => c._id !== action.payload.id);
        state.successMessage = action.payload.data.message;
      })
      .addCase(archiveCustomer.rejected, (state, action) => {
        state.isArchiving = false;
        state.error = action.payload;
      })
      
      // Unarchive customer
      .addCase(unarchiveCustomer.pending, (state) => {
        state.isArchiving = true;
        state.error = null;
      })
      .addCase(unarchiveCustomer.fulfilled, (state, action) => {
        state.isArchiving = false;
        const unarchivedCustomer = action.payload.data?.data || action.payload.data;
        // Remove from archived customers
        state.archivedCustomers = state.archivedCustomers.filter(c => c._id !== action.payload.id);
        // Add to active customers if data is available
        if (unarchivedCustomer && unarchivedCustomer._id) {
          const exists = state.customers.findIndex(c => c._id === unarchivedCustomer._id);
          if (exists === -1) {
            state.customers.unshift(unarchivedCustomer);
          }
        }
        state.successMessage = action.payload.data?.message || 'Customer unarchived successfully';
      })
      .addCase(unarchiveCustomer.rejected, (state, action) => {
        state.isArchiving = false;
        state.error = action.payload;
      })
      
      // Fetch archived customers
      .addCase(fetchArchivedCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArchivedCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.archivedCustomers = action.payload.data;
        state.archivedPagination = action.payload.pagination;
      })
      .addCase(fetchArchivedCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add customer note
      .addCase(addCustomerNote.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addCustomerNote.fulfilled, (state, action) => {
        state.isUpdating = false;
        const customerData = action.payload.data || action.payload;
        const index = state.customers.findIndex(c => c._id === customerData._id);
        if (index !== -1) {
          state.customers[index] = customerData;
        }
        if (state.currentCustomer && state.currentCustomer._id === customerData._id) {
          state.currentCustomer = customerData;
        }
        state.successMessage = action.payload.message || 'Note added successfully';
      })
      .addCase(addCustomerNote.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Add customer interaction
      .addCase(addCustomerInteraction.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addCustomerInteraction.fulfilled, (state, action) => {
        state.isUpdating = false;
        const customerData = action.payload.data || action.payload;
        const index = state.customers.findIndex(c => c._id === customerData._id);
        if (index !== -1) {
          state.customers[index] = customerData;
        }
        if (state.currentCustomer && state.currentCustomer._id === customerData._id) {
          state.currentCustomer = customerData;
        }
        state.successMessage = action.payload.message || 'Interaction added successfully';
      })
      .addCase(addCustomerInteraction.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Update customer note
      .addCase(updateCustomerNote.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCustomerNote.fulfilled, (state, action) => {
        state.isUpdating = false;
        const customerData = action.payload.data || action.payload;
        const index = state.customers.findIndex(c => c._id === customerData._id);
        if (index !== -1) {
          state.customers[index] = customerData;
        }
        if (state.currentCustomer && state.currentCustomer._id === customerData._id) {
          state.currentCustomer = customerData;
        }
        state.successMessage = action.payload.message || 'Note updated successfully';
      })
      .addCase(updateCustomerNote.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete customer note
      .addCase(deleteCustomerNote.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteCustomerNote.fulfilled, (state, action) => {
        state.isUpdating = false;
        const customerData = action.payload.data || action.payload;
        const index = state.customers.findIndex(c => c._id === customerData._id);
        if (index !== -1) {
          state.customers[index] = customerData;
        }
        if (state.currentCustomer && state.currentCustomer._id === customerData._id) {
          state.currentCustomer = customerData;
        }
        state.successMessage = action.payload.message || 'Note deleted successfully';
      })
      .addCase(deleteCustomerNote.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Update customer interaction
      .addCase(updateCustomerInteraction.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCustomerInteraction.fulfilled, (state, action) => {
        state.isUpdating = false;
        const customerData = action.payload.data || action.payload;
        const index = state.customers.findIndex(c => c._id === customerData._id);
        if (index !== -1) {
          state.customers[index] = customerData;
        }
        if (state.currentCustomer && state.currentCustomer._id === customerData._id) {
          state.currentCustomer = customerData;
        }
        state.successMessage = action.payload.message || 'Interaction updated successfully';
      })
      .addCase(updateCustomerInteraction.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete customer interaction
      .addCase(deleteCustomerInteraction.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteCustomerInteraction.fulfilled, (state, action) => {
        state.isUpdating = false;
        const customerData = action.payload.data || action.payload;
        const index = state.customers.findIndex(c => c._id === customerData._id);
        if (index !== -1) {
          state.customers[index] = customerData;
        }
        if (state.currentCustomer && state.currentCustomer._id === customerData._id) {
          state.currentCustomer = customerData;
        }
        state.successMessage = action.payload.message || 'Interaction deleted successfully';
      })
      .addCase(deleteCustomerInteraction.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Convert lead to customer
      .addCase(convertLeadToCustomer.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(convertLeadToCustomer.fulfilled, (state, action) => {
        state.isCreating = false;
        const customerData = action.payload.data || action.payload;
        state.customers.unshift(customerData);
        state.successMessage = action.payload.message || 'Lead converted successfully';
      })
      .addCase(convertLeadToCustomer.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Fetch customer stats
      .addCase(fetchCustomerStats.pending, (state) => {
        state.isStatsLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch customer insights
      .addCase(fetchCustomerInsights.pending, (state) => {
        state.isInsightsLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerInsights.fulfilled, (state, action) => {
        state.isInsightsLoading = false;
        state.insights = action.payload.data;
      })
      .addCase(fetchCustomerInsights.rejected, (state, action) => {
        state.isInsightsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch customer forecast
      .addCase(fetchCustomerForecast.pending, (state) => {
        state.isForecastLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerForecast.fulfilled, (state, action) => {
        state.isForecastLoading = false;
        state.forecast = action.payload.data;
      })
      .addCase(fetchCustomerForecast.rejected, (state, action) => {
        state.isForecastLoading = false;
        state.error = action.payload;
      })
      
      // Bulk update customers
      .addCase(bulkUpdateCustomers.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateCustomers.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { customerIds, updates } = action.payload;
        customerIds.forEach(id => {
          const index = state.customers.findIndex(c => c._id === id);
          if (index !== -1) {
            state.customers[index] = { ...state.customers[index], ...updates };
          }
        });
        state.successMessage = action.payload.data.message;
      })
      .addCase(bulkUpdateCustomers.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Bulk archive customers
      .addCase(bulkArchiveCustomers.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkArchiveCustomers.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { customerIds } = action.payload;
        customerIds.forEach(id => {
          const index = state.customers.findIndex(c => c._id === id);
          if (index !== -1) {
            state.customers[index].isArchived = true;
          }
        });
        state.successMessage = action.payload.data.message;
      })
      .addCase(bulkArchiveCustomers.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Bulk unarchive customers
      .addCase(bulkUnarchiveCustomers.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkUnarchiveCustomers.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { customerIds } = action.payload;
        // Remove from archived customers
        customerIds.forEach(id => {
          state.archivedCustomers = state.archivedCustomers.filter(c => c._id !== id);
        });
        state.successMessage = action.payload.data?.message || 'Customers unarchived successfully';
        // Note: Unarchived customers will be added to active list when they're fetched
      })
      .addCase(bulkUnarchiveCustomers.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Bulk assign customers
      .addCase(bulkAssignCustomers.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkAssignCustomers.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { customerIds, assignedTo } = action.payload;
        customerIds.forEach(id => {
          const index = state.customers.findIndex(c => c._id === id);
          if (index !== -1) {
            state.customers[index].assignedTo = assignedTo;
          }
        });
        state.successMessage = action.payload.data.message;
      })
      .addCase(bulkAssignCustomers.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Bulk update customer stages
      .addCase(bulkUpdateCustomerStages.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateCustomerStages.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { customerIds, stage } = action.payload;
        customerIds.forEach(id => {
          const index = state.customers.findIndex(c => c._id === id);
          if (index !== -1) {
            state.customers[index].stage = stage;
          }
        });
        state.successMessage = action.payload.data.message;
      })
      .addCase(bulkUpdateCustomerStages.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Bulk update customer priorities
      .addCase(bulkUpdateCustomerPriorities.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateCustomerPriorities.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { customerIds, priority } = action.payload;
        customerIds.forEach(id => {
          const index = state.customers.findIndex(c => c._id === id);
          if (index !== -1) {
            state.customers[index].priority = priority;
          }
        });
        state.successMessage = action.payload.data.message;
      })
      .addCase(bulkUpdateCustomerPriorities.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Bulk update customer statuses
      .addCase(bulkUpdateCustomerStatuses.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateCustomerStatuses.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { customerIds, status } = action.payload;
        customerIds.forEach(id => {
          const index = state.customers.findIndex(c => c._id === id);
          if (index !== -1) {
            state.customers[index].status = status;
          }
        });
        state.successMessage = action.payload.data.message;
      })
      .addCase(bulkUpdateCustomerStatuses.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { id } = action.payload;
        state.customers = state.customers.filter(c => c._id !== id);
        if (state.currentCustomer && state.currentCustomer._id === id) {
          state.currentCustomer = null;
        }
        state.successMessage = action.payload.data.message;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Bulk delete customers
      .addCase(bulkDeleteCustomers.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkDeleteCustomers.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { customerIds } = action.payload;
        state.customers = state.customers.filter(c => !customerIds.includes(c._id));
        if (state.currentCustomer && customerIds.includes(state.currentCustomer._id)) {
          state.currentCustomer = null;
        }
        state.successMessage = action.payload.data.message;
      })
      .addCase(bulkDeleteCustomers.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Export customers
      .addCase(exportCustomers.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(exportCustomers.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.successMessage = 'Customers exported successfully';
      })
      .addCase(exportCustomers.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Fetch customer deals
      .addCase(fetchCustomerDeals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerDeals.fulfilled, (state, action) => {
        state.isLoading = false;
        const { customerId, deals, pagination } = action.payload;
        state.customerDeals[customerId] = { deals, pagination };
      })
      .addCase(fetchCustomerDeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch customer deal stats
      .addCase(fetchCustomerDealStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerDealStats.fulfilled, (state, action) => {
        state.isLoading = false;
        const { customerId, stats } = action.payload;
        state.customerDealStats[customerId] = stats;
      })
      .addCase(fetchCustomerDealStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearSuccessMessage,
  setFilters,
  clearFilters,
  setCurrentCustomer,
  clearCurrentCustomer,
  updateCustomerInList,
  removeCustomerFromList,
  addCustomerToList,
  addInteractionToCustomer,
  updateCustomerStage,
  updateCustomerStatus,
  updateCustomerPriority,
  updateCustomerScore,
  assignCustomerToUser,
  addTagsToCustomer,
  removeTagsFromCustomer
} = customerSlice.actions;

export default customerSlice.reducer;
