import axios from '../utils/axiosConfig';

// Get calendar events for a project
export const getCalendarEvents = async (projectId, params = {}) => {
  const {...queryParams } = params;
  return axios.get(`/calendar/events/${projectId}?projectId=${projectId}`, { params: queryParams });
};

// Get events for a specific date range
export const getEventsByDateRange = async (projectId, startDate, endDate, filters = {}) => {
  return axios.get(`/calendar/events/range?projectId=${projectId}`, {
    params: {
      projectId,
      startDate,
      endDate,
      ...filters
    }
  });
};

// Create a new calendar event
export const createCalendarEvent = async (projectId, eventData) => {
  return axios.post(`/calendar/events?projectId=${projectId}`, eventData);
};

// Update an existing calendar event
export const updateCalendarEvent = async (projectId, eventId, eventData) => {
  return axios.put(`/calendar/events/${eventId}?projectId=${projectId}`, eventData);
};

// Delete a calendar event
export const deleteCalendarEvent = async (projectId, eventId) => {
  return axios.delete(`/calendar/events/${eventId}?projectId=${projectId}`);
};

// Get event by ID
export const getCalendarEvent = async (projectId, eventId) => {
  return axios.get(`/calendar/events/detail/${eventId}?projectId=${projectId}`);
};

// Get aggregated events (tasks, deals, etc.)
export const getAggregatedEvents = async (projectId, params = {}) => {
  return axios.get(`/calendar/events/aggregated/${projectId}?projectId=${projectId}`, { params });
};

// Get events by type
export const getEventsByType = async (projectId, type, params = {}) => {
  return axios.get(`/calendar/events/type/${projectId}/${type}?projectId=${projectId}`, { params });
};

// Get upcoming events
export const getUpcomingEvents = async (projectId, days = 7) => {
  return axios.get(`/calendar/events/upcoming/${projectId}?projectId=${projectId}`, {
    params: { days }
  });
};

// Get overdue events
export const getOverdueEvents = async (projectId) => {
  return axios.get(`/calendar/events/overdue/${projectId}?projectId=${projectId}`);
};

// Bulk update events
export const bulkUpdateEvents = async (projectId, eventIds, updates) => {
  return axios.patch(`/calendar/events/bulk?projectId=${projectId}`, { eventIds, updates });
};

// Bulk delete events
export const bulkDeleteEvents = async (projectId, eventIds) => {
  return axios.delete(`/calendar/events/bulk?projectId=${projectId}`, { data: { eventIds } });
};

// Export events
export const exportEvents = async (projectId, format = 'json', filters = {}) => {
  return axios.get(`/calendar/events/export/${projectId}?projectId=${projectId}`, {
    params: { format, ...filters },
    responseType: 'blob'
  });
};

// Get calendar statistics
export const getCalendarStats = async (projectId, params = {}) => {
  return axios.get(`/calendar/stats/${projectId}?projectId=${projectId}`, { params });
};

// Get user availability
export const getUserAvailability = async (projectId, userId, date, duration = 60) => {
  return axios.get(`/calendar/availability/${userId}?projectId=${projectId}`, {
    params: { date, duration }
  });
};

// Check for conflicts
export const checkEventConflicts = async (projectId, eventData) => {
  return axios.post(`/calendar/events/check-conflicts?projectId=${projectId}`, eventData);
};

// Get recurring events
export const getRecurringEvents = async (projectId, eventId) => {
  return axios.get(`/calendar/events/${eventId}/recurring?projectId=${projectId}`);
};

// Update recurring events
export const updateRecurringEvents = async (projectId, eventId, updates, scope = 'this') => {
  return axios.patch(`/calendar/events/${eventId}/recurring?projectId=${projectId}`, {
    updates,
    scope // 'this', 'following', 'all'
  });
};

// Delete recurring events
export const deleteRecurringEvents = async (projectId, eventId, scope = 'this') => {
  return axios.delete(`/calendar/events/${eventId}/recurring?projectId=${projectId}`, {
    data: { scope }
  });
};

// Get event attendees
export const getEventAttendees = async (projectId, eventId) => {
  return axios.get(`/calendar/events/${eventId}/attendees?projectId=${projectId}`);
};

// Update event attendees
export const updateEventAttendees = async (projectId, eventId, attendees) => {
  return axios.patch(`/calendar/events/${eventId}/attendees?projectId=${projectId}`, { attendees });
};

// Send event invitations
export const sendEventInvitations = async (projectId, eventId, message = '') => {
  return axios.post(`/calendar/events/${eventId}/invite?projectId=${projectId}`, { message });
};

// Respond to event invitation
export const respondToEvent = async (projectId, eventId, response) => {
  return axios.post(`/calendar/events/${eventId}/respond?projectId=${projectId}`, { response });
};

// Get event responses
export const getEventResponses = async (projectId, eventId) => {
  return axios.get(`/calendar/events/${eventId}/responses?projectId=${projectId}`);
};

// Get calendar settings
export const getCalendarSettings = async (projectId) => {
  return axios.get(`/calendar/settings/${projectId}?projectId=${projectId}`);
};

// Update calendar settings
export const updateCalendarSettings = async (projectId, settings) => {
  return axios.put(`/calendar/settings/${projectId}?projectId=${projectId}`, settings);
};

// Get time zones
export const getTimeZones = async (projectId) => {
  return axios.get(`/calendar/timezones?projectId=${projectId}`);
};

// Get working hours
export const getWorkingHours = async (projectId) => {
  return axios.get(`/calendar/working-hours/${projectId}?projectId=${projectId}`);
};

// Update working hours
export const updateWorkingHours = async (projectId, workingHours) => {
  return axios.put(`/calendar/working-hours/${projectId}?projectId=${projectId}`, workingHours);
};

// Get holidays
export const getHolidays = async (projectId, year) => {
  return axios.get(`/calendar/holidays/${projectId}?projectId=${projectId}`, {
    params: { year }
  });
};

// Add holiday
export const addHoliday = async (projectId, holidayData) => {
  return axios.post(`/calendar/holidays/${projectId}?projectId=${projectId}`, holidayData);
};

// Update holiday
export const updateHoliday = async (projectId, holidayId, holidayData) => {
  return axios.put(`/calendar/holidays/${holidayId}?projectId=${projectId}`, holidayData);
};

// Delete holiday
export const deleteHoliday = async (projectId, holidayId) => {
  return axios.delete(`/calendar/holidays/${holidayId}?projectId=${projectId}`);
};

// Get event templates
export const getEventTemplates = async (projectId) => {
  return axios.get(`/calendar/templates/${projectId}?projectId=${projectId}`);
};

// Create event template
export const createEventTemplate = async (projectId, templateData) => {
  return axios.post(`/calendar/templates/${projectId}?projectId=${projectId}`, templateData);
};

// Update event template
export const updateEventTemplate = async (projectId, templateId, templateData) => {
  return axios.put(`/calendar/templates/${templateId}?projectId=${projectId}`, templateData);
};

// Delete event template
export const deleteEventTemplate = async (projectId, templateId) => {
  return axios.delete(`/calendar/templates/${templateId}?projectId=${projectId}`);
};

// Create event from template
export const createEventFromTemplate = async (projectId, templateId, eventData) => {
  return axios.post(`/calendar/templates/${templateId}/create-event?projectId=${projectId}`, eventData);
};
