import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leadService from '../services/leadService';

// Async thunks
export const getProjectLeads = createAsyncThunk(
  'leads/getProjectLeads',
  async ({ projectId, params = {} }) => {
    const response = await leadService.getProjectLeads(projectId, params);
    return response.data.data;
  }
);

export const fetchLead = createAsyncThunk(
  'leads/fetchLead',
  async (id) => {
    const response = await leadService.fetchLead(id);
    return response.data.data;
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData) => {
    const response = await leadService.createLead(leadData);
    return response.data.data;
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, leadData }) => {
    const response = await leadService.updateLead(id, leadData);
    return response.data.data;
  }
);

export const archiveLead = createAsyncThunk(
  'leads/archiveLead',
  async (id) => {
    const response = await leadService.archiveLead(id);
    return response.data.data;
  }
);

export const addLeadNote = createAsyncThunk(
  'leads/addLeadNote',
  async ({ id, content }) => {
    const response = await leadService.addLeadNote(id, { content });
    return response.data.data;
  }
);

export const convertLead = createAsyncThunk(
  'leads/convertLead',
  async (id) => {
    const response = await leadService.convertLead(id);
    return response.data.data;
  }
);

export const updateLeadStatus = createAsyncThunk(
  'leads/updateLeadStatus',
  async ({ id, status }) => {
    const response = await leadService.updateLeadStatus(id, status);
    return response.data.data;
  }
);

export const assignLeadToUser = createAsyncThunk(
  'leads/assignLeadToUser',
  async ({ id, userId }) => {
    const response = await leadService.assignLeadToUser(id, userId);
    return response.data.data;
  }
);

export const getLeadStats = createAsyncThunk(
  'leads/getLeadStats',
  async ({ projectId }) => {
    const response = await leadService.getLeadStats(projectId);
    return response.data.data;
  }
);

export const getLeadInsights = createAsyncThunk(
  'leads/getLeadInsights',
  async ({ projectId }) => {
    const response = await leadService.getLeadInsights(projectId);
    return response.data;
  }
);

export const getArchivedLeads = createAsyncThunk(
  'leads/getArchivedLeads',
  async ({ projectId, params = {} }) => {
    const response = await leadService.getArchivedLeads(projectId, params);
    return response.data.data;
  }
);

export const unarchiveLead = createAsyncThunk(
  'leads/unarchiveLead',
  async (id) => {
    const response = await leadService.unarchiveLead(id);
    return response.data;
  }
);

export const cleanupArchivedLeads = createAsyncThunk(
  'leads/cleanupArchivedLeads',
  async () => {
    const response = await leadService.cleanupArchivedLeads();
    return response.data.data;
  }
);

export const updateLeadNote = createAsyncThunk(
  'leads/updateLeadNote',
  async ({ leadId, noteId, content }) => {
    const response = await leadService.updateLeadNote(leadId, noteId, content);
    return response.data.data;
  }
);

export const deleteLeadNote = createAsyncThunk(
  'leads/deleteLeadNote',
  async ({ leadId, noteId }) => {
    const response = await leadService.deleteLeadNote(leadId, noteId);
    return response.data.data;
  }
);

const initialState = {
  leads: [],
  archivedLeads: [],
  lead: null,
  selected: null,
  stats: null,
  insights: null,
  pagination: {
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false
  },
  isLoading: false,
  error: null
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearLead: (state) => {
      state.lead = null;
    },
    clearLeadState: (state) => {
      state.leads = [];
      state.lead = null;
      state.selected = null;
      state.stats = null;
      state.insights = null;
      state.pagination = {
        total: 0,
        limit: 20,
        skip: 0,
        hasMore: false
      };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Project Leads
      .addCase(getProjectLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = action.payload.leads;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProjectLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Fetch Lead
      .addCase(fetchLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lead = action.payload.lead;
        state.selected = action.payload.lead;
      })
      .addCase(fetchLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Create Lead
      .addCase(createLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the new lead to the beginning of the array
        state.leads.unshift(action.payload.lead);
        state.pagination.total += 1;
        // Also update the selected lead if we're on the detail page
        if (state.selected && state.selected._id === action.payload.lead._id) {
          state.selected = action.payload.lead;
        }
      })
      .addCase(createLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Update Lead
      .addCase(updateLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedLead = action.payload.lead;
        const index = state.leads.findIndex(lead => lead._id === updatedLead._id);
        if (index !== -1) {
          state.leads[index] = updatedLead;
        }
        if (state.selected && state.selected._id === updatedLead._id) {
          state.selected = updatedLead;
        }
        if (state.lead && state.lead._id === updatedLead._id) {
          state.lead = updatedLead;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Archive Lead
      .addCase(archiveLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(archiveLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = state.leads.filter(lead => lead._id !== action.meta.arg);
        state.pagination.total -= 1;
        if (state.selected && state.selected._id === action.meta.arg) {
          state.selected = null;
        }
        if (state.lead && state.lead._id === action.meta.arg) {
          state.lead = null;
        }
      })
      .addCase(archiveLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Add Lead Note
      .addCase(addLeadNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addLeadNote.fulfilled, (state, action) => {
        state.isLoading = false;
        const { note } = action.payload;
        const leadId = action.meta.arg.id;
        
        // Update in leads array
        const leadIndex = state.leads.findIndex(lead => lead._id === leadId);
        if (leadIndex !== -1) {
          if (!state.leads[leadIndex].notes) {
            state.leads[leadIndex].notes = [];
          }
          state.leads[leadIndex].notes.push(note);
        }
        
        // Update in selected lead
        if (state.selected && state.selected._id === leadId) {
          if (!state.selected.notes) {
            state.selected.notes = [];
          }
          state.selected.notes.push(note);
        }
        
        // Update in lead detail
        if (state.lead && state.lead._id === leadId) {
          if (!state.lead.notes) {
            state.lead.notes = [];
          }
          state.lead.notes.push(note);
        }
      })
      .addCase(addLeadNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Convert Lead
      .addCase(convertLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(convertLead.fulfilled, (state, action) => {
        state.isLoading = false;
        const leadId = action.meta.arg;
        
        // Remove from leads array
        state.leads = state.leads.filter(lead => lead._id !== leadId);
        state.pagination.total -= 1;
        
        // Clear selected if it's the converted lead
        if (state.selected && state.selected._id === leadId) {
          state.selected = null;
        }
        if (state.lead && state.lead._id === leadId) {
          state.lead = null;
        }
      })
      .addCase(convertLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Update Lead Status
      .addCase(updateLeadStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedLead = action.payload.lead;
        const leadId = action.meta.arg.id;
        
        // Update in leads array
        const leadIndex = state.leads.findIndex(lead => lead._id === leadId);
        if (leadIndex !== -1) {
          state.leads[leadIndex] = updatedLead;
        }
        
        // Update in selected lead
        if (state.selected && state.selected._id === leadId) {
          state.selected = updatedLead;
        }
        
        // Update in lead detail
        if (state.lead && state.lead._id === leadId) {
          state.lead = updatedLead;
        }
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Assign Lead to User
      .addCase(assignLeadToUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignLeadToUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedLead = action.payload.lead;
        const leadId = action.meta.arg.id;
        
        // Update in leads array
        const leadIndex = state.leads.findIndex(lead => lead._id === leadId);
        if (leadIndex !== -1) {
          state.leads[leadIndex] = updatedLead;
        }
        
        // Update in selected lead
        if (state.selected && state.selected._id === leadId) {
          state.selected = updatedLead;
        }
        
        // Update in lead detail
        if (state.lead && state.lead._id === leadId) {
          state.lead = updatedLead;
        }
      })
      .addCase(assignLeadToUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Get Lead Stats
      .addCase(getLeadStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLeadStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(getLeadStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Get Lead Insights
      .addCase(getLeadInsights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLeadInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.insights = action.payload;
      })
      .addCase(getLeadInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Get Archived Leads
      .addCase(getArchivedLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getArchivedLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.archivedLeads = action.payload.leads;
        state.pagination = action.payload.pagination;
      })
      .addCase(getArchivedLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Unarchive Lead
      .addCase(unarchiveLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unarchiveLead.fulfilled, (state, action) => {
        state.isLoading = false;
        const unarchivedLead = action.payload.lead;
        const leadId = action.meta.arg;
        
        // Remove from archived leads
        state.archivedLeads = state.archivedLeads.filter(lead => lead._id !== leadId);
        state.pagination.total -= 1;
        
        // Add to active leads only if the lead data is valid
        if (unarchivedLead && unarchivedLead._id) {
          state.leads.unshift(unarchivedLead);
        }
        
        // If the unarchived lead was selected, clear selection
        if (state.selected && state.selected._id === leadId) {
          state.selected = null;
        }
        if (state.lead && state.lead._id === leadId) {
          state.lead = null;
        }
      })
      .addCase(unarchiveLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Cleanup Archived Leads
      .addCase(cleanupArchivedLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cleanupArchivedLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.archivedLeads = [];
        state.pagination.total = 0;
      })
      .addCase(cleanupArchivedLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Update Lead Note
      .addCase(updateLeadNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLeadNote.fulfilled, (state, action) => {
        state.isLoading = false;
        const leadId = action.meta.arg.leadId;
        const noteId = action.meta.arg.noteId;
        const content = action.payload.content;

        // Update in leads array
        const leadIndex = state.leads.findIndex(lead => lead._id === leadId);
        if (leadIndex !== -1) {
          const notes = state.leads[leadIndex].notes || [];
          const noteIndex = notes.findIndex(note => note._id === noteId);
          if (noteIndex !== -1) {
            notes[noteIndex].content = content;
          }
        }

        // Update in selected lead
        if (state.selected && state.selected._id === leadId) {
          const notes = state.selected.notes || [];
          const noteIndex = notes.findIndex(note => note._id === noteId);
          if (noteIndex !== -1) {
            notes[noteIndex].content = content;
          }
        }

        // Update in lead detail
        if (state.lead && state.lead._id === leadId) {
          const notes = state.lead.notes || [];
          const noteIndex = notes.findIndex(note => note._id === noteId);
          if (noteIndex !== -1) {
            notes[noteIndex].content = content;
          }
        }
      })
      .addCase(updateLeadNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Delete Lead Note
      .addCase(deleteLeadNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLeadNote.fulfilled, (state, action) => {
        state.isLoading = false;
        const leadId = action.meta.arg.leadId;
        const noteId = action.meta.arg.noteId;

        // Update in leads array
        const leadIndex = state.leads.findIndex(lead => lead._id === leadId);
        if (leadIndex !== -1) {
          const notes = state.leads[leadIndex].notes || [];
          state.leads[leadIndex].notes = notes.filter(note => note._id !== noteId);
        }

        // Update in selected lead
        if (state.selected && state.selected._id === leadId) {
          const notes = state.selected.notes || [];
          state.selected.notes = notes.filter(note => note._id !== noteId);
        }

        // Update in lead detail
        if (state.lead && state.lead._id === leadId) {
          const notes = state.lead.notes || [];
          state.lead.notes = notes.filter(note => note._id !== noteId);
        }
      })
      .addCase(deleteLeadNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearLead, clearLeadState, clearError } = leadSlice.actions;
export default leadSlice.reducer;


