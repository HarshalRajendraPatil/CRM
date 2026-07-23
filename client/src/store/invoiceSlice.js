import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as invoiceService from "../services/invoiceService";

// ==================== ASYNC THUNKS ====================

// Get project invoices
export const fetchProjectInvoices = createAsyncThunk(
  "invoices/fetchProjectInvoices",
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getProjectInvoices(
        projectId,
        params
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch invoices"
      );
    }
  }
);

// Get single invoice
export const fetchInvoice = createAsyncThunk(
  "invoices/fetchInvoice",
  async ({ projectId, invoiceId }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoice(projectId, invoiceId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch invoice"
      );
    }
  }
);

// Create invoice
export const createNewInvoice = createAsyncThunk(
  "invoices/createInvoice",
  async ({ projectId, invoiceData }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.createInvoice(
        projectId,
        invoiceData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create invoice"
      );
    }
  }
);

// Update invoice
export const updateExistingInvoice = createAsyncThunk(
  "invoices/updateInvoice",
  async ({ projectId, invoiceId, invoiceData }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.updateInvoice(
        projectId,
        invoiceId,
        invoiceData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update invoice"
      );
    }
  }
);

// Delete invoice
export const deleteExistingInvoice = createAsyncThunk(
  "invoices/deleteInvoice",
  async ({ projectId, invoiceId }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.deleteInvoice(projectId, invoiceId);
      return { invoiceId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete invoice"
      );
    }
  }
);

// Archive invoice
export const archiveExistingInvoice = createAsyncThunk(
  "invoices/archiveInvoice",
  async ({ projectId, invoiceId }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.archiveInvoice(
        projectId,
        invoiceId
      );
      return { invoiceId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to archive invoice"
      );
    }
  }
);

// Restore invoice
export const restoreExistingInvoice = createAsyncThunk(
  "invoices/restoreInvoice",
  async ({ projectId, invoiceId }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.restoreInvoice(
        projectId,
        invoiceId
      );
      return { invoiceId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore invoice"
      );
    }
  }
);

// Get invoice statistics
export const fetchInvoiceStats = createAsyncThunk(
  "invoices/fetchStats",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoiceStats(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch invoice statistics"
      );
    }
  }
);

// Mark invoice as sent
export const markInvoiceAsSentAction = createAsyncThunk(
  "invoices/markAsSent",
  async ({ projectId, invoiceId, sentToEmail }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.markInvoiceAsSent(
        projectId,
        invoiceId,
        sentToEmail
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark invoice as sent"
      );
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  invoices: [],
  currentInvoice: null,
  stats: null,
  loading: false,
  error: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  // Filters and sorting
  filters: {
    search: "",
    status: "",
    customer: "",
    company: "",
    deal: "",
    minAmount: "",
    maxAmount: "",
    dueDateFrom: "",
    dueDateTo: "",
    issueDateFrom: "",
    issueDateTo: "",
  },
  sortBy: "createdAt",
  sortOrder: "desc",

  // Selection
  selectedInvoices: [],
};

// ==================== SLICE ====================

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page on filter change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setSorting: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    selectInvoice: (state, action) => {
      const invoiceId = action.payload;
      if (!state.selectedInvoices.includes(invoiceId)) {
        state.selectedInvoices.push(invoiceId);
      }
    },
    deselectInvoice: (state, action) => {
      const invoiceId = action.payload;
      state.selectedInvoices = state.selectedInvoices.filter(
        (id) => id !== invoiceId
      );
    },
    selectAllInvoices: (state) => {
      state.selectedInvoices = state.invoices.map((invoice) => invoice._id);
    },
    clearSelection: (state) => {
      state.selectedInvoices = [];
    },
    setCurrentInvoice: (state, action) => {
      state.currentInvoice = action.payload;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project invoices
      .addCase(fetchProjectInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProjectInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single invoice
      .addCase(fetchInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { invoice, payments } structure
        if (action.payload.data?.invoice) {
          state.currentInvoice = action.payload.data.invoice;
        } else {
          state.currentInvoice = action.payload.data;
        }
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create invoice
      .addCase(createNewInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewInvoice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.invoices.unshift(action.payload.data);
        }
      })
      .addCase(createNewInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update invoice
      .addCase(updateExistingInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingInvoice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.invoices.findIndex(
            (inv) => inv._id === action.payload.data._id
          );
          if (index !== -1) {
            state.invoices[index] = action.payload.data;
          }
          if (state.currentInvoice?._id === action.payload.data._id) {
            state.currentInvoice = action.payload.data;
          }
        }
      })
      .addCase(updateExistingInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete invoice
      .addCase(deleteExistingInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter(
          (inv) => inv._id !== action.payload.invoiceId
        );
        if (state.currentInvoice?._id === action.payload.invoiceId) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteExistingInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Archive invoice
      .addCase(archiveExistingInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(
          (inv) => inv._id === action.payload.invoiceId
        );
        if (index !== -1) {
          state.invoices[index].isArchived = true;
        }
      })

      // Restore invoice
      .addCase(restoreExistingInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(
          (inv) => inv._id === action.payload.invoiceId
        );
        if (index !== -1) {
          state.invoices[index].isArchived = false;
        }
      })

      // Fetch stats
      .addCase(fetchInvoiceStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoiceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchInvoiceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark as sent
      .addCase(markInvoiceAsSentAction.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.invoices.findIndex(
            (inv) => inv._id === action.payload.data._id
          );
          if (index !== -1) {
            state.invoices[index] = action.payload.data;
          }
          if (state.currentInvoice?._id === action.payload.data._id) {
            state.currentInvoice = action.payload.data;
          }
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSorting,
  selectInvoice,
  deselectInvoice,
  selectAllInvoices,
  clearSelection,
  setCurrentInvoice,
  clearCurrentInvoice,
  clearError,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
