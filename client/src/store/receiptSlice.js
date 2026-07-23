import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as receiptService from '../services/receiptService';

// ==================== ASYNC THUNKS ====================

// Get project receipts
export const fetchProjectReceipts = createAsyncThunk(
  'receipts/fetchProjectReceipts',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await receiptService.getProjectReceipts(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch receipts');
    }
  }
);

// Get single receipt
export const fetchReceipt = createAsyncThunk(
  'receipts/fetchReceipt',
  async (receiptId, { rejectWithValue }) => {
    try {
      const response = await receiptService.getReceipt(receiptId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch receipt');
    }
  }
);

// Create receipt
export const createNewReceipt = createAsyncThunk(
  'receipts/createReceipt',
  async ({ projectId, receiptData }, { rejectWithValue }) => {
    try {
      const response = await receiptService.createReceipt(projectId, receiptData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create receipt');
    }
  }
);

// Update receipt
export const updateExistingReceipt = createAsyncThunk(
  'receipts/updateReceipt',
  async ({ receiptId, receiptData }, { rejectWithValue }) => {
    try {
      const response = await receiptService.updateReceipt(receiptId, receiptData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update receipt');
    }
  }
);

// Mark receipt as sent
export const markReceiptAsSentAction = createAsyncThunk(
  'receipts/markAsSent',
  async ({ receiptId, sentToEmail }, { rejectWithValue }) => {
    try {
      const response = await receiptService.markReceiptAsSent(receiptId, sentToEmail);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark receipt as sent');
    }
  }
);

// Delete receipt
export const deleteExistingReceipt = createAsyncThunk(
  'receipts/deleteReceipt',
  async (receiptId, { rejectWithValue }) => {
    try {
      const response = await receiptService.deleteReceipt(receiptId);
      return { receiptId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete receipt');
    }
  }
);

// Get receipt statistics
export const fetchReceiptStats = createAsyncThunk(
  'receipts/fetchStats',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await receiptService.getReceiptStats(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch receipt statistics');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  receipts: [],
  currentReceipt: null,
  stats: null,
  loading: false,
  error: null,
  
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
    customer: '',
    company: '',
    payment: '',
    invoice: '',
    deal: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
    paymentDateFrom: '',
    paymentDateTo: ''
  },
  sortBy: 'paymentDate',
  sortOrder: 'desc',
  
  // Selection
  selectedReceipts: []
};

// ==================== SLICE ====================

const receiptSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setSorting: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    selectReceipt: (state, action) => {
      const receiptId = action.payload;
      if (!state.selectedReceipts.includes(receiptId)) {
        state.selectedReceipts.push(receiptId);
      }
    },
    deselectReceipt: (state, action) => {
      const receiptId = action.payload;
      state.selectedReceipts = state.selectedReceipts.filter(id => id !== receiptId);
    },
    selectAllReceipts: (state) => {
      state.selectedReceipts = state.receipts.map(receipt => receipt._id);
    },
    clearSelection: (state) => {
      state.selectedReceipts = [];
    },
    setCurrentReceipt: (state, action) => {
      state.currentReceipt = action.payload;
    },
    clearCurrentReceipt: (state) => {
      state.currentReceipt = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project receipts
      .addCase(fetchProjectReceipts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProjectReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single receipt
      .addCase(fetchReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReceipt = action.payload.data;
      })
      .addCase(fetchReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create receipt
      .addCase(createNewReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewReceipt.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.receipts.unshift(action.payload.data);
        }
      })
      .addCase(createNewReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update receipt
      .addCase(updateExistingReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingReceipt.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.receipts.findIndex(r => r._id === action.payload.data._id);
          if (index !== -1) {
            state.receipts[index] = action.payload.data;
          }
          if (state.currentReceipt?._id === action.payload.data._id) {
            state.currentReceipt = action.payload.data;
          }
        }
      })
      .addCase(updateExistingReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark as sent
      .addCase(markReceiptAsSentAction.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.receipts.findIndex(r => r._id === action.payload.data._id);
          if (index !== -1) {
            state.receipts[index] = action.payload.data;
          }
          if (state.currentReceipt?._id === action.payload.data._id) {
            state.currentReceipt = action.payload.data;
          }
        }
      })
      
      // Delete receipt
      .addCase(deleteExistingReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = state.receipts.filter(r => r._id !== action.payload.receiptId);
        if (state.currentReceipt?._id === action.payload.receiptId) {
          state.currentReceipt = null;
        }
      })
      .addCase(deleteExistingReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch stats
      .addCase(fetchReceiptStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReceiptStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchReceiptStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setSorting,
  selectReceipt,
  deselectReceipt,
  selectAllReceipts,
  clearSelection,
  setCurrentReceipt,
  clearCurrentReceipt,
  clearError
} = receiptSlice.actions;

export default receiptSlice.reducer;

