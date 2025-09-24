import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getDashboardData, 
  getDashboardWidgets, 
  getRevenueTrend,
  getDealFunnel,
  getTaskCompletion,
  getLeadConversion,
  getUserPerformance
} from '../services/dashboardService';

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async ({ projectId, period = '30d' }, { rejectWithValue }) => {
    try {
      const response = await getDashboardData(projectId, period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchDashboardWidgets = createAsyncThunk(
  'dashboard/fetchDashboardWidgets',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getDashboardWidgets(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard widgets');
    }
  }
);

export const fetchRevenueTrend = createAsyncThunk(
  'dashboard/fetchRevenueTrend',
  async ({ projectId, period = '30d' }, { rejectWithValue }) => {
    try {
      const response = await getRevenueTrend(projectId, period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue trend');
    }
  }
);

export const fetchDealFunnel = createAsyncThunk(
  'dashboard/fetchDealFunnel',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getDealFunnel(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal funnel');
    }
  }
);

export const fetchTaskCompletion = createAsyncThunk(
  'dashboard/fetchTaskCompletion',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getTaskCompletion(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task completion');
    }
  }
);

export const fetchLeadConversion = createAsyncThunk(
  'dashboard/fetchLeadConversion',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getLeadConversion(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead conversion');
    }
  }
);

export const fetchUserPerformance = createAsyncThunk(
  'dashboard/fetchUserPerformance',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getUserPerformance(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user performance');
    }
  }
);

const initialState = {
  dashboardData: null,
  widgets: null,
  charts: {
    revenueTrend: [],
    dealFunnel: [],
    taskCompletion: [],
    leadConversion: [],
    userPerformance: []
  },
  isLoading: false,
  error: null,
  lastUpdated: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.dashboardData = null;
      state.widgets = null;
      state.charts = {
        revenueTrend: [],
        dealFunnel: [],
        taskCompletion: [],
        leadConversion: [],
        userPerformance: []
      };
      state.error = null;
      state.lastUpdated = null;
    },
    setDashboardPeriod: (state, action) => {
      state.period = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch dashboard widgets
    builder
      .addCase(fetchDashboardWidgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardWidgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.widgets = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardWidgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch revenue trend
    builder
      .addCase(fetchRevenueTrend.fulfilled, (state, action) => {
        state.charts.revenueTrend = action.payload;
      })
      .addCase(fetchRevenueTrend.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Fetch deal funnel
    builder
      .addCase(fetchDealFunnel.fulfilled, (state, action) => {
        state.charts.dealFunnel = action.payload;
      })
      .addCase(fetchDealFunnel.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Fetch task completion
    builder
      .addCase(fetchTaskCompletion.fulfilled, (state, action) => {
        state.charts.taskCompletion = action.payload;
      })
      .addCase(fetchTaskCompletion.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Fetch lead conversion
    builder
      .addCase(fetchLeadConversion.fulfilled, (state, action) => {
        state.charts.leadConversion = action.payload;
      })
      .addCase(fetchLeadConversion.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Fetch user performance
    builder
      .addCase(fetchUserPerformance.fulfilled, (state, action) => {
        state.charts.userPerformance = action.payload;
      })
      .addCase(fetchUserPerformance.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearDashboardData, setDashboardPeriod } = dashboardSlice.actions;
export default dashboardSlice.reducer;
