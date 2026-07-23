import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as paymentService from '../services/paymentService';

// ==================== ASYNC THUNKS ====================

// Get project payments
export const fetchProjectPayments = createAsyncThunk(
  'payments/fetchProjectPayments',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await paymentService.getProjectPayments(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

// Get single payment
export const fetchPayment = createAsyncThunk(
  'payments/fetchPayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPayment(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment');
    }
  }
);

// Create payment
export const createNewPayment = createAsyncThunk(
  'payments/createPayment',
  async ({ projectId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPayment(projectId, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment');
    }
  }
);

// Update payment
export const updateExistingPayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ paymentId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await paymentService.updatePayment(paymentId, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment');
    }
  }
);

// Mark payment as completed
export const markPaymentAsCompletedAction = createAsyncThunk(
  'payments/markAsCompleted',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentService.markPaymentAsCompleted(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark payment as completed');
    }
  }
);

// Process refund
export const processRefundAction = createAsyncThunk(
  'payments/processRefund',
  async ({ paymentId, refundData }, { rejectWithValue }) => {
    try {
      const response = await paymentService.processRefund(paymentId, refundData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process refund');
    }
  }
);

// Delete payment
export const deleteExistingPayment = createAsyncThunk(
  'payments/deletePayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentService.deletePayment(paymentId);
      return { paymentId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payment');
    }
  }
);

// Get payment statistics
export const fetchPaymentStats = createAsyncThunk(
  'payments/fetchStats',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentStats(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment statistics');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  payments: [],
  currentPayment: null,
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
    status: '',
    paymentMethod: '',
    customer: '',
    company: '',
    invoice: '',
    deal: '',
    minAmount: '',
    maxAmount: '',
    paymentDateFrom: '',
    paymentDateTo: ''
  },
  sortBy: 'paymentDate',
  sortOrder: 'desc',
  
  // Selection
  selectedPayments: []
};

// ==================== SLICE ====================

const paymentSlice = createSlice({
  name: 'payments',
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
    selectPayment: (state, action) => {
      const paymentId = action.payload;
      if (!state.selectedPayments.includes(paymentId)) {
        state.selectedPayments.push(paymentId);
      }
    },
    deselectPayment: (state, action) => {
      const paymentId = action.payload;
      state.selectedPayments = state.selectedPayments.filter(id => id !== paymentId);
    },
    selectAllPayments: (state) => {
      state.selectedPayments = state.payments.map(payment => payment._id);
    },
    clearSelection: (state) => {
      state.selectedPayments = [];
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project payments
      .addCase(fetchProjectPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProjectPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single payment
      .addCase(fetchPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.data;
      })
      .addCase(fetchPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create payment
      .addCase(createNewPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.payments.unshift(action.payload.data);
        }
      })
      .addCase(createNewPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update payment
      .addCase(updateExistingPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.payments.findIndex(p => p._id === action.payload.data._id);
          if (index !== -1) {
            state.payments[index] = action.payload.data;
          }
          if (state.currentPayment?._id === action.payload.data._id) {
            state.currentPayment = action.payload.data;
          }
        }
      })
      .addCase(updateExistingPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark as completed
      .addCase(markPaymentAsCompletedAction.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.payments.findIndex(p => p._id === action.payload.data._id);
          if (index !== -1) {
            state.payments[index] = action.payload.data;
          }
          if (state.currentPayment?._id === action.payload.data._id) {
            state.currentPayment = action.payload.data;
          }
        }
      })
      
      // Process refund
      .addCase(processRefundAction.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.payments.findIndex(p => p._id === action.payload.data._id);
          if (index !== -1) {
            state.payments[index] = action.payload.data;
          }
          if (state.currentPayment?._id === action.payload.data._id) {
            state.currentPayment = action.payload.data;
          }
        }
      })
      
      // Delete payment
      .addCase(deleteExistingPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = state.payments.filter(p => p._id !== action.payload.paymentId);
        if (state.currentPayment?._id === action.payload.paymentId) {
          state.currentPayment = null;
        }
      })
      .addCase(deleteExistingPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setSorting,
  selectPayment,
  deselectPayment,
  selectAllPayments,
  clearSelection,
  setCurrentPayment,
  clearCurrentPayment,
  clearError
} = paymentSlice.actions;

export default paymentSlice.reducer;

