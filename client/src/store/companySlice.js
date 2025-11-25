import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import companyService from '../services/companyService';

// Initial state
const initialState = {
  companies: [],
  company: null,
  notes: [],
  stats: null,
  insights: null,
  forecastData: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  pagination: {
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false
  }
};

// Get companies for a project
export const getProjectCompanies = createAsyncThunk(
  'companies/getProjectCompanies',
  async ({ projectId, params }, thunkAPI) => {
    try {
      return await companyService.getProjectCompanies(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch companies';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get company by ID
export const getCompanyById = createAsyncThunk(
  'companies/getCompanyById',
  async ({id, projectId}, thunkAPI) => {
    try {
      return await companyService.getCompanyById(id, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch company';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new company
export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async ({projectId, companyData}, thunkAPI) => {
    try {
      return await companyService.createCompany(projectId, companyData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create company';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a company
export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, companyData, projectId }, thunkAPI) => {
    try {
      return await companyService.updateCompany(id, companyData, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update company';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a company
export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async ({id, projectId}, thunkAPI) => {
    try {
      return await companyService.deleteCompany(id, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete company';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a note to a company
export const addCompanyNote = createAsyncThunk(
  'companies/addCompanyNote',
  async ({ id, noteData, projectId }, thunkAPI) => {
    try {
      return await companyService.addCompanyNote(id, noteData, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add note';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get notes for a company
export const getCompanyNotes = createAsyncThunk(
  'companies/getCompanyNotes',
  async ({id, projectId}, thunkAPI) => {
    try {
      return await companyService.getCompanyNotes(id, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notes';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a tag to a company
export const addCompanyTag = createAsyncThunk(
  'companies/addCompanyTag',
  async ({ id, tagData }, thunkAPI) => {
    try {
      return await companyService.addCompanyTag(id, tagData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add tag';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a tag from a company
export const removeCompanyTag = createAsyncThunk(
  'companies/removeCompanyTag',
  async ({ id, tag }, thunkAPI) => {
    try {
      return await companyService.removeCompanyTag(id, tag);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to remove tag';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a custom field to a company
export const addCustomField = createAsyncThunk(
  'companies/addCustomField',
  async ({ id, fieldData }, thunkAPI) => {
    try {
      return await companyService.addCustomField(id, fieldData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add custom field';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a custom field from a company
export const removeCustomField = createAsyncThunk(
  'companies/removeCustomField',
  async ({ id, key }, thunkAPI) => {
    try {
      return await companyService.removeCustomField(id, key);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to remove custom field';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get company statistics for a project
export const getCompanyStats = createAsyncThunk(
  'companies/getCompanyStats',
  async (projectId, thunkAPI) => {
    try {
      return await companyService.getCompanyStats(projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch company statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get company insights for a project
export const getCompanyInsights = createAsyncThunk(
  'companies/getCompanyInsights',
  async (projectId, thunkAPI) => {
    try {
      return await companyService.getCompanyInsights(projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch company insights';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get company forecast for a project
export const getCompanyForecast = createAsyncThunk(
  'companies/getCompanyForecast',
  async ({ projectId, params = {} }, thunkAPI) => {
    try {
      return await companyService.getCompanyForecast(projectId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch company forecast';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Bulk update companies
export const bulkUpdateCompanies = createAsyncThunk(
  'companies/bulkUpdateCompanies',
  async ({ companyIds, updates }, thunkAPI) => {
    try {
      return await companyService.bulkUpdateCompanies(companyIds, updates);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to bulk update companies';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Bulk delete companies
export const bulkDeleteCompanies = createAsyncThunk(
  'companies/bulkDeleteCompanies',
  async (companyIds, thunkAPI) => {
    try {
      return await companyService.bulkDeleteCompanies(companyIds);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to bulk delete companies';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a company note
export const updateCompanyNote = createAsyncThunk(
  'companies/updateCompanyNote',
  async ({ id, noteId, noteData, projectId }, thunkAPI) => {
    try {
      return await companyService.updateCompanyNote(id, noteId, noteData, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update note';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a company note
export const deleteCompanyNote = createAsyncThunk(
  'companies/deleteCompanyNote',
  async ({ id, noteId, projectId }, thunkAPI) => {
    try {
      return await companyService.deleteCompanyNote(id, noteId, projectId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete note';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Company slice
const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCompany: (state) => {
      state.company = null;
    },
    clearCompanies: (state) => {
      state.companies = [];
      state.pagination = {
        total: 0,
        limit: 20,
        skip: 0,
        hasMore: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get project companies
      .addCase(getProjectCompanies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // If skip is 0, replace companies; otherwise append
        if (action.meta.arg.params?.skip === 0 || !action.meta.arg.params?.skip) {
          state.companies = action.payload.data.companies;
        } else {
          state.companies = [...state.companies, ...action.payload.data.companies];
        }
        
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getProjectCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get company by ID
      .addCase(getCompanyById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCompanyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.company = action.payload.data.company;
      })
      .addCase(getCompanyById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create company
      .addCase(createCompany.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.companies.unshift(action.payload.data.company);
        state.pagination.total += 1;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update company
      .addCase(updateCompany.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.company = action.payload.data.company;
        
        // Update in the companies list if present
        const index = state.companies.findIndex(company => company._id === action.payload.data.company._id);
        if (index !== -1) {
          state.companies[index] = action.payload.data.company;
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete company
      .addCase(deleteCompany.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.companies = state.companies.filter(company => company._id !== action.meta.arg);
        state.pagination.total -= 1;
        if (state.company && state.company._id === action.meta.arg) {
          state.company = null;
        }
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add company note
      .addCase(addCompanyNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addCompanyNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notes.unshift(action.payload.data.note);
      })
      .addCase(addCompanyNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get company notes
      .addCase(getCompanyNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCompanyNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notes = action.payload.data.notes;
      })
      .addCase(getCompanyNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add company tag
      .addCase(addCompanyTag.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addCompanyTag.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.company = action.payload.data.company;
        
        // Update in the companies list if present
        const index = state.companies.findIndex(company => company._id === action.payload.data.company._id);
        if (index !== -1) {
          state.companies[index] = action.payload.data.company;
        }
      })
      .addCase(addCompanyTag.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Remove company tag
      .addCase(removeCompanyTag.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCompanyTag.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.company = action.payload.data.company;
        
        // Update in the companies list if present
        const index = state.companies.findIndex(company => company._id === action.payload.data.company._id);
        if (index !== -1) {
          state.companies[index] = action.payload.data.company;
        }
      })
      .addCase(removeCompanyTag.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add custom field
      .addCase(addCustomField.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addCustomField.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.company = action.payload.data.company;
        
        // Update in the companies list if present
        const index = state.companies.findIndex(company => company._id === action.payload.data.company._id);
        if (index !== -1) {
          state.companies[index] = action.payload.data.company;
        }
      })
      .addCase(addCustomField.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Remove custom field
      .addCase(removeCustomField.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCustomField.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.company = action.payload.data.company;
        
        // Update in the companies list if present
        const index = state.companies.findIndex(company => company._id === action.payload.data.company._id);
        if (index !== -1) {
          state.companies[index] = action.payload.data.company;
        }
      })
      .addCase(removeCustomField.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get company stats
      .addCase(getCompanyStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCompanyStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload.data;
      })
      .addCase(getCompanyStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get company insights
      .addCase(getCompanyInsights.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCompanyInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.insights = action.payload.data.insights;
      })
      .addCase(getCompanyInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update company note
      .addCase(updateCompanyNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCompanyNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Update the note in the notes array
        const noteIndex = state.notes.findIndex(note => note._id === action.payload.data.note._id);
        if (noteIndex !== -1) {
          state.notes[noteIndex] = action.payload.data.note;
        }
      })
      .addCase(updateCompanyNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete company note
      .addCase(deleteCompanyNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCompanyNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Remove the note from the notes array
        const noteId = action.meta.arg.noteId;
        state.notes = state.notes.filter(note => note._id !== noteId);
      })
      .addCase(deleteCompanyNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Bulk update companies
      .addCase(bulkUpdateCompanies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkUpdateCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Refresh companies list to reflect changes
        // The companies will be refreshed when the component re-renders
      })
      .addCase(bulkUpdateCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Bulk delete companies
      .addCase(bulkDeleteCompanies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkDeleteCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Remove deleted companies from the list
        const deletedIds = action.meta.arg;
        state.companies = state.companies.filter(company => !deletedIds.includes(company._id));
      })
      .addCase(bulkDeleteCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get company forecast
      .addCase(getCompanyForecast.pending, (state) => {
        // state.isLoading = true;
      })
      .addCase(getCompanyForecast.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.forecastData = action.payload.data;
      })
      .addCase(getCompanyForecast.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearCompany, clearCompanies } = companySlice.actions;
export default companySlice.reducer;