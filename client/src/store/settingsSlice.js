import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCrmSettings,
  updateCrmSettings,
  updateSettingSection,
  resetSettings,
  getTimezones,
  getCurrencies
} from '../services/settingsService';

// Initial state
const initialState = {
  settings: null,
  timezones: [],
  currencies: [],
  loading: false,
  updating: false,
  error: null,
  lastUpdated: null
};

// Async thunks
export const fetchCrmSettings = createAsyncThunk(
  'settings/fetchCrmSettings',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getCrmSettings(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async ({ projectId, settingsData }, { rejectWithValue }) => {
    try {
      const response = await updateCrmSettings(projectId, settingsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const updateSection = createAsyncThunk(
  'settings/updateSection',
  async ({ projectId, section, sectionData }, { rejectWithValue }) => {
    try {
      const response = await updateSettingSection(projectId, section, sectionData);
      return { section, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update section');
    }
  }
);

export const resetCrmSettings = createAsyncThunk(
  'settings/resetSettings',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await resetSettings(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset settings');
    }
  }
);

export const fetchTimezones = createAsyncThunk(
  'settings/fetchTimezones',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTimezones();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch timezones');
    }
  }
);

export const fetchCurrencies = createAsyncThunk(
  'settings/fetchCurrencies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrencies();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch currencies');
    }
  }
);

// Settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSettings: (state) => {
      state.settings = null;
      state.lastUpdated = null;
    },
    updateLocalSetting: (state, action) => {
      const { section, field, value } = action.payload;
      if (state.settings && state.settings[section]) {
        state.settings[section][field] = value;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch CRM settings
      .addCase(fetchCrmSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrmSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.data;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchCrmSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.updating = false;
        state.settings = action.payload.data;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Update section
      .addCase(updateSection.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSection.fulfilled, (state, action) => {
        state.updating = false;
        const { section, data } = action.payload;
        if (state.settings) {
          state.settings[section] = data;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateSection.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Reset settings
      .addCase(resetCrmSettings.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(resetCrmSettings.fulfilled, (state, action) => {
        state.updating = false;
        state.settings = action.payload.data;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(resetCrmSettings.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Fetch timezones
      .addCase(fetchTimezones.fulfilled, (state, action) => {
        state.timezones = action.payload.data;
      })
      
      // Fetch currencies
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.currencies = action.payload.data;
      });
  }
});

export const { clearError, clearSettings, updateLocalSetting } = settingsSlice.actions;

// Selectors
export const selectSettings = (state) => state.settings.settings;
export const selectSettingsLoading = (state) => state.settings.loading;
export const selectSettingsUpdating = (state) => state.settings.updating;
export const selectSettingsError = (state) => state.settings.error;
export const selectTimezones = (state) => state.settings.timezones;
export const selectCurrencies = (state) => state.settings.currencies;
export const selectLastUpdated = (state) => state.settings.lastUpdated;

// Select specific setting sections
export const selectGeneralSettings = (state) => state.settings.settings?.general;
export const selectEmailSettings = (state) => state.settings.settings?.email;
export const selectNotificationSettings = (state) => state.settings.settings?.notifications;
export const selectLeadSettings = (state) => state.settings.settings?.leads;
export const selectDealSettings = (state) => state.settings.settings?.deals;
export const selectTaskSettings = (state) => state.settings.settings?.tasks;
export const selectCalendarSettings = (state) => state.settings.settings?.calendar;
export const selectSecuritySettings = (state) => state.settings.settings?.security;
export const selectIntegrationSettings = (state) => state.settings.settings?.integrations;
export const selectCustomFields = (state) => state.settings.settings?.customFields;
export const selectBackupSettings = (state) => state.settings.settings?.backup;
export const selectAnalyticsSettings = (state) => state.settings.settings?.analytics;

export default settingsSlice.reducer;
