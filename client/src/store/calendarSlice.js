import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as calendarService from '../services/calendarService';

// Async thunks
export const getCalendarEvents = createAsyncThunk(
  'calendar/getCalendarEvents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await calendarService.getCalendarEvents(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch calendar events');
    }
  }
);

export const getAggregatedEvents = createAsyncThunk(
  'calendar/getAggregatedEvents',
  async ({ projectId, ...params }, { rejectWithValue }) => {
    try {
      const response = await calendarService.getAggregatedEvents(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch aggregated events');
    }
  }
);

export const createCalendarEvent = createAsyncThunk(
  'calendar/createCalendarEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await calendarService.createCalendarEvent(eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create calendar event');
    }
  }
);

export const updateCalendarEvent = createAsyncThunk(
  'calendar/updateCalendarEvent',
  async ({ id, ...eventData }, { rejectWithValue }) => {
    try {
      const response = await calendarService.updateCalendarEvent(id, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update calendar event');
    }
  }
);

export const deleteCalendarEvent = createAsyncThunk(
  'calendar/deleteCalendarEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await calendarService.deleteCalendarEvent(eventId);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete calendar event');
    }
  }
);

export const getCalendarEvent = createAsyncThunk(
  'calendar/getCalendarEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await calendarService.getCalendarEvent(eventId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch calendar event');
    }
  }
);

export const getEventsByType = createAsyncThunk(
  'calendar/getEventsByType',
  async ({ projectId, type, ...params }, { rejectWithValue }) => {
    try {
      const response = await calendarService.getEventsByType(projectId, type, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events by type');
    }
  }
);

export const getUpcomingEvents = createAsyncThunk(
  'calendar/getUpcomingEvents',
  async ({ projectId, days = 7 }, { rejectWithValue }) => {
    try {
      const response = await calendarService.getUpcomingEvents(projectId, days);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming events');
    }
  }
);

export const getOverdueEvents = createAsyncThunk(
  'calendar/getOverdueEvents',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await calendarService.getOverdueEvents(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue events');
    }
  }
);

export const bulkUpdateEvents = createAsyncThunk(
  'calendar/bulkUpdateEvents',
  async ({ eventIds, updates }, { rejectWithValue }) => {
    try {
      const response = await calendarService.bulkUpdateEvents(eventIds, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update events');
    }
  }
);

export const bulkDeleteEvents = createAsyncThunk(
  'calendar/bulkDeleteEvents',
  async (eventIds, { rejectWithValue }) => {
    try {
      await calendarService.bulkDeleteEvents(eventIds);
      return eventIds;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk delete events');
    }
  }
);

export const getCalendarStats = createAsyncThunk(
  'calendar/getCalendarStats',
  async ({ projectId, ...params }, { rejectWithValue }) => {
    try {
      const response = await calendarService.getCalendarStats(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch calendar stats');
    }
  }
);

export const checkEventConflicts = createAsyncThunk(
  'calendar/checkEventConflicts',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await calendarService.checkEventConflicts(eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check event conflicts');
    }
  }
);

export const getCalendarSettings = createAsyncThunk(
  'calendar/getCalendarSettings',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await calendarService.getCalendarSettings(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch calendar settings');
    }
  }
);

export const respondToEvent = createAsyncThunk(
  'calendar/respondToEvent',
  async ({ eventId, response }, { rejectWithValue }) => {
    try {
      const responseData = await calendarService.respondToEvent(eventId, response);
      return responseData.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to event');
    }
  }
);

export const getEventResponses = createAsyncThunk(
  'calendar/getEventResponses',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await calendarService.getEventResponses(eventId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event responses');
    }
  }
);

export const updateCalendarSettings = createAsyncThunk(
  'calendar/updateCalendarSettings',
  async ({ projectId, settings }, { rejectWithValue }) => {
    try {
      const response = await calendarService.updateCalendarSettings(projectId, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update calendar settings');
    }
  }
);

// Initial state
const initialState = {
  events: [],
  aggregatedEvents: [],
  upcomingEvents: [],
  overdueEvents: [],
  currentEvent: null,
  stats: null,
  settings: null,
  conflicts: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    hasMore: false
  },
  filters: {
    type: 'all',
    dateRange: null,
    search: '',
    priority: 'all',
    status: 'all'
  },
  view: 'month',
  selectedDate: null,
  selectedEvents: []
};

// Calendar slice
const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setView: (state, action) => {
      state.view = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedEvents: (state, action) => {
      state.selectedEvents = action.payload;
    },
    toggleEventSelection: (state, action) => {
      const eventId = action.payload;
      const index = state.selectedEvents.indexOf(eventId);
      if (index > -1) {
        state.selectedEvents.splice(index, 1);
      } else {
        state.selectedEvents.push(eventId);
      }
    },
    clearSelectedEvents: (state) => {
      state.selectedEvents = [];
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    updateEventInList: (state, action) => {
      const updatedEvent = action.payload;
      const index = state.events.findIndex(event => event._id === updatedEvent._id);
      if (index !== -1) {
        state.events[index] = updatedEvent;
      }
    },
    removeEventFromList: (state, action) => {
      const eventId = action.payload;
      state.events = state.events.filter(event => event._id !== eventId);
    },
    addEventToList: (state, action) => {
      state.events.unshift(action.payload);
    },
    resetCalendar: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    // Get calendar events
    builder
      .addCase(getCalendarEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCalendarEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.events || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getCalendarEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get aggregated events
    builder
      .addCase(getAggregatedEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAggregatedEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.aggregatedEvents = action.payload.events || [];
      })
      .addCase(getAggregatedEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create calendar event
    builder
      .addCase(createCalendarEvent.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCalendarEvent.fulfilled, (state, action) => {
        state.isCreating = false;
        state.events.unshift(action.payload);
      })
      .addCase(createCalendarEvent.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      });

    // Update calendar event
    builder
      .addCase(updateCalendarEvent.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCalendarEvent.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.events.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateCalendarEvent.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    // Delete calendar event
    builder
      .addCase(deleteCalendarEvent.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCalendarEvent.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.events = state.events.filter(event => event._id !== action.payload);
        state.selectedEvents = state.selectedEvents.filter(id => id !== action.payload);
      })
      .addCase(deleteCalendarEvent.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });

    // Get calendar event
    builder
      .addCase(getCalendarEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCalendarEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(getCalendarEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get events by type
    builder
      .addCase(getEventsByType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEventsByType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.events || [];
      })
      .addCase(getEventsByType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get upcoming events
    builder
      .addCase(getUpcomingEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUpcomingEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingEvents = action.payload.events || [];
      })
      .addCase(getUpcomingEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get overdue events
    builder
      .addCase(getOverdueEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOverdueEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overdueEvents = action.payload.events || [];
      })
      .addCase(getOverdueEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Bulk update events
    builder
      .addCase(bulkUpdateEvents.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateEvents.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update events in the list
        action.payload.updatedEvents.forEach(updatedEvent => {
          const index = state.events.findIndex(event => event._id === updatedEvent._id);
          if (index !== -1) {
            state.events[index] = updatedEvent;
          }
        });
        state.selectedEvents = [];
      })
      .addCase(bulkUpdateEvents.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    // Bulk delete events
    builder
      .addCase(bulkDeleteEvents.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(bulkDeleteEvents.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.events = state.events.filter(event => !action.payload.includes(event._id));
        state.selectedEvents = [];
      })
      .addCase(bulkDeleteEvents.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });

    // Get calendar stats
    builder
      .addCase(getCalendarStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCalendarStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getCalendarStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Check event conflicts
    builder
      .addCase(checkEventConflicts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkEventConflicts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conflicts = action.payload.conflicts || [];
      })
      .addCase(checkEventConflicts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get calendar settings
    builder
      .addCase(getCalendarSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCalendarSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(getCalendarSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update calendar settings
    builder
      .addCase(updateCalendarSettings.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCalendarSettings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.settings = action.payload;
      })
      .addCase(updateCalendarSettings.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setFilters,
  setView,
  setSelectedDate,
  setSelectedEvents,
  toggleEventSelection,
  clearSelectedEvents,
  setCurrentEvent,
  clearCurrentEvent,
  updateEventInList,
  removeEventFromList,
  addEventToList,
  resetCalendar
} = calendarSlice.actions;

export default calendarSlice.reducer;
