import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as financialService from '../services/financialService';

// ==================== ASYNC THUNKS ====================

// Get financial overview
export const fetchFinancialOverview = createAsyncThunk(
  'financial/fetchOverview',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await financialService.getFinancialOverview(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial overview');
    }
  }
);

// Get revenue by date
export const fetchRevenueByDate = createAsyncThunk(
  'financial/fetchRevenueByDate',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await financialService.getRevenueByDate(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue by date');
    }
  }
);

// Get outstanding receivables
export const fetchOutstandingReceivables = createAsyncThunk(
  'financial/fetchReceivables',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await financialService.getOutstandingReceivables(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch outstanding receivables');
    }
  }
);

// Get payment method analytics
export const fetchPaymentMethodAnalytics = createAsyncThunk(
  'financial/fetchPaymentMethods',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await financialService.getPaymentMethodAnalytics(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment method analytics');
    }
  }
);

// Get customer financial profile
export const fetchCustomerFinancialProfile = createAsyncThunk(
  'financial/fetchCustomerProfile',
  async ({ projectId, customerId }, { rejectWithValue }) => {
    try {
      const response = await financialService.getCustomerFinancialProfile(projectId, customerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer financial profile');
    }
  }
);

// Get overdue invoices
export const fetchOverdueInvoices = createAsyncThunk(
  'financial/fetchOverdue',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await financialService.getOverdueInvoices(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue invoices');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  overview: null,
  revenueByDate: [],
  receivables: {
    invoices: [],
    totalOutstanding: 0,
    count: 0
  },
  paymentMethods: [],
  customerProfile: null,
  overdue: {
    invoices: [],
    totalOverdue: 0,
    count: 0
  },
  loading: false,
  error: null
};

// ==================== SLICE ====================

const financialSlice = createSlice({
  name: 'financial',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCustomerProfile: (state) => {
      state.customerProfile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch financial overview
      .addCase(fetchFinancialOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload.data;
      })
      .addCase(fetchFinancialOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch revenue by date
      .addCase(fetchRevenueByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueByDate = action.payload.data || [];
      })
      .addCase(fetchRevenueByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch outstanding receivables
      .addCase(fetchOutstandingReceivables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutstandingReceivables.fulfilled, (state, action) => {
        state.loading = false;
        state.receivables = action.payload.data || state.receivables;
      })
      .addCase(fetchOutstandingReceivables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch payment method analytics
      .addCase(fetchPaymentMethodAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethodAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload.data || [];
      })
      .addCase(fetchPaymentMethodAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch customer financial profile
      .addCase(fetchCustomerFinancialProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerFinancialProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.customerProfile = action.payload.data;
      })
      .addCase(fetchCustomerFinancialProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch overdue invoices
      .addCase(fetchOverdueInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverdueInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.overdue = action.payload.data || state.overdue;
      })
      .addCase(fetchOverdueInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCustomerProfile
} = financialSlice.actions;

export default financialSlice.reducer;

