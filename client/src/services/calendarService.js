import axios from '../utils/axiosConfig';

// Get calendar events for a project
export const getCalendarEvents = async (params = {}) => {
  return axios.get('/calendar/events', { params });
};

// Get events for a specific date range
export const getEventsByDateRange = async (projectId, startDate, endDate, filters = {}) => {
  return axios.get('/calendar/events/range', {
    params: {
      projectId,
      startDate,
      endDate,
      ...filters
    }
  });
};

// Create a new calendar event
export const createCalendarEvent = async (eventData) => {
  return axios.post('/calendar/events', eventData);
};

// Update an existing calendar event
export const updateCalendarEvent = async (eventId, eventData) => {
  return axios.put(`/calendar/events/${eventId}`, eventData);
};

// Delete a calendar event
export const deleteCalendarEvent = async (eventId) => {
  return axios.delete(`/calendar/events/${eventId}`);
};

// Get event by ID
export const getCalendarEvent = async (eventId) => {
  return axios.get(`/calendar/events/${eventId}`);
};

// Get aggregated events (tasks, deals, etc.)
export const getAggregatedEvents = async (projectId, params = {}) => {
  return axios.get(`/calendar/events/aggregated/${projectId}`, { params });
};

// Get events by type
export const getEventsByType = async (projectId, type, params = {}) => {
  return axios.get(`/calendar/events/type/${projectId}/${type}`, { params });
};

// Get upcoming events
export const getUpcomingEvents = async (projectId, days = 7) => {
  return axios.get(`/calendar/events/upcoming/${projectId}`, {
    params: { days }
  });
};

// Get overdue events
export const getOverdueEvents = async (projectId) => {
  return axios.get(`/calendar/events/overdue/${projectId}`);
};

// Bulk update events
export const bulkUpdateEvents = async (eventIds, updates) => {
  return axios.patch('/calendar/events/bulk', { eventIds, updates });
};

// Bulk delete events
export const bulkDeleteEvents = async (eventIds) => {
  return axios.delete('/calendar/events/bulk', { data: { eventIds } });
};

// Export events
export const exportEvents = async (projectId, format = 'json', filters = {}) => {
  return axios.get(`/calendar/events/export/${projectId}`, {
    params: { format, ...filters },
    responseType: 'blob'
  });
};

// Get calendar statistics
export const getCalendarStats = async (projectId, params = {}) => {
  return axios.get(`/calendar/stats/${projectId}`, { params });
};

// Get user availability
export const getUserAvailability = async (userId, date, duration = 60) => {
  return axios.get(`/calendar/availability/${userId}`, {
    params: { date, duration }
  });
};

// Check for conflicts
export const checkEventConflicts = async (eventData) => {
  return axios.post('/calendar/events/check-conflicts', eventData);
};

// Get recurring events
export const getRecurringEvents = async (eventId) => {
  return axios.get(`/calendar/events/${eventId}/recurring`);
};

// Update recurring events
export const updateRecurringEvents = async (eventId, updates, scope = 'this') => {
  return axios.patch(`/calendar/events/${eventId}/recurring`, {
    updates,
    scope // 'this', 'following', 'all'
  });
};

// Delete recurring events
export const deleteRecurringEvents = async (eventId, scope = 'this') => {
  return axios.delete(`/calendar/events/${eventId}/recurring`, {
    data: { scope }
  });
};

// Get event attendees
export const getEventAttendees = async (eventId) => {
  return axios.get(`/calendar/events/${eventId}/attendees`);
};

// Update event attendees
export const updateEventAttendees = async (eventId, attendees) => {
  return axios.patch(`/calendar/events/${eventId}/attendees`, { attendees });
};

// Send event invitations
export const sendEventInvitations = async (eventId, message = '') => {
  return axios.post(`/calendar/events/${eventId}/invite`, { message });
};

// Respond to event invitation
export const respondToEvent = async (eventId, response) => {
  return axios.post(`/calendar/events/${eventId}/respond`, { response });
};

// Get event responses
export const getEventResponses = async (eventId) => {
  return axios.get(`/calendar/events/${eventId}/responses`);
};

// Get calendar settings
export const getCalendarSettings = async (projectId) => {
  return axios.get(`/calendar/settings/${projectId}`);
};

// Update calendar settings
export const updateCalendarSettings = async (projectId, settings) => {
  return axios.put(`/calendar/settings/${projectId}`, settings);
};

// Get time zones
export const getTimeZones = async () => {
  return axios.get('/calendar/timezones');
};

// Get working hours
export const getWorkingHours = async (projectId) => {
  return axios.get(`/calendar/working-hours/${projectId}`);
};

// Update working hours
export const updateWorkingHours = async (projectId, workingHours) => {
  return axios.put(`/calendar/working-hours/${projectId}`, workingHours);
};

// Get holidays
export const getHolidays = async (projectId, year) => {
  return axios.get(`/calendar/holidays/${projectId}`, {
    params: { year }
  });
};

// Add holiday
export const addHoliday = async (projectId, holidayData) => {
  return axios.post(`/calendar/holidays/${projectId}`, holidayData);
};

// Update holiday
export const updateHoliday = async (holidayId, holidayData) => {
  return axios.put(`/calendar/holidays/${holidayId}`, holidayData);
};

// Delete holiday
export const deleteHoliday = async (holidayId) => {
  return axios.delete(`/calendar/holidays/${holidayId}`);
};

// Get event templates
export const getEventTemplates = async (projectId) => {
  return axios.get(`/calendar/templates/${projectId}`);
};

// Create event template
export const createEventTemplate = async (projectId, templateData) => {
  return axios.post(`/calendar/templates/${projectId}`, templateData);
};

// Update event template
export const updateEventTemplate = async (templateId, templateData) => {
  return axios.put(`/calendar/templates/${templateId}`, templateData);
};

// Delete event template
export const deleteEventTemplate = async (templateId) => {
  return axios.delete(`/calendar/templates/${templateId}`);
};

// Create event from template
export const createEventFromTemplate = async (templateId, eventData) => {
  return axios.post(`/calendar/templates/${templateId}/create-event`, eventData);
};
