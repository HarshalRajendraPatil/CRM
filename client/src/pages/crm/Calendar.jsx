import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  getCalendarEvents, 
  getAggregatedEvents,
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from '../../store/calendarSlice';
import CreateEventSidebar from './calendar/CreateEventSidebar';
import EditEventSidebar from './calendar/EditEventSidebar';
import EventDetailModal from './calendar/EventDetailModal';
import CrmLayout from '../../layouts/CrmLayout';

const Calendar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { events, aggregatedEvents, isLoading, error } = useSelector((state) => state.calendar);
  const { user } = useSelector((state) => state.auth);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month, week, day
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, tasks, deals, customers, companies, leads, custom

  useEffect(() => {
    if (projectId) {
      // Calculate date range based on view
      let startDate, endDate;
      const date = new Date(currentDate);
      
      if (view === 'month') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      } else if (view === 'week') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 6);
      } else { // day view
        startDate = new Date(date);
        endDate = new Date(date);
      }
      
      // Convert to ISO strings for API
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Get both custom events and aggregated events
      dispatch(getCalendarEvents({ projectId, startDate: startDateStr, endDate: endDateStr }));
      dispatch(getAggregatedEvents({ projectId, startDate: startDateStr, endDate: endDateStr, types: filterType }));
    }
  }, [dispatch, projectId, currentDate, view, filterType]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowCreateSidebar(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEditSidebar(true);
    setShowEventDetail(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await dispatch(deleteCalendarEvent(eventId));
      setShowEventDetail(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    await dispatch(createCalendarEvent({ ...eventData, projectId }));
    setShowCreateSidebar(false);
  };

  const handleUpdateEvent = async (eventData) => {
    await dispatch(updateCalendarEvent({ id: selectedEvent._id, ...eventData }));
    setShowEditSidebar(false);
    setSelectedEvent(null);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const allEvents = [...events, ...(aggregatedEvents || [])];
    return allEvents.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getEventColor = (event) => {
    const colors = {
      task: 'bg-blue-100 border-blue-300 text-blue-800',
      deal: 'bg-green-100 border-green-300 text-green-800',
      customer: 'bg-purple-100 border-purple-300 text-purple-800',
      company: 'bg-orange-100 border-orange-300 text-orange-800',
      lead: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      custom: 'bg-indigo-100 border-indigo-300 text-indigo-800'
    };
    return colors[event.type] || colors.custom;
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 35; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDate(day);
          
          return (
            <div
              key={index}
              className={`bg-white p-1 min-h-[120px] cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'text-gray-400' : ''
              } ${isToday ? 'bg-blue-50' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-xs p-1 rounded border ${getEventColor(event)} truncate`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return (
      <div className="flex-1">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDate(day);
            
            return (
              <div key={index} className="bg-white min-h-[600px]">
                <div className={`p-2 border-b ${isToday ? 'bg-blue-50' : ''}`}>
                  <div className="text-sm font-medium">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`text-xs p-2 rounded border ${getEventColor(event)} cursor-pointer hover:shadow-sm`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.startTime && (
                        <div className="text-xs opacity-75">
                          {new Date(event.startDate + 'T' + event.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    return (
      <div className="flex-1">
        <div className={`p-4 border-b ${isToday ? 'bg-blue-50' : ''}`}>
          <div className="text-2xl font-bold">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {dayEvents.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2">No events for this day</p>
                <button
                  onClick={() => handleDateClick(currentDate)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Add an event
                </button>
              </div>
            ) : (
              dayEvents.map((event, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${getEventColor(event)} cursor-pointer hover:shadow-sm`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-sm opacity-75 mt-1">{event.description}</div>
                      )}
                      {event.startTime && (
                        <div className="text-sm opacity-75 mt-1">
                          {new Date(event.startDate + 'T' + event.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                          {event.endTime && ` - ${new Date(event.startDate + 'T' + event.endTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}`}
                        </div>
                      )}
                    </div>
                    <div className="text-xs opacity-75">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <CrmLayout>
       {isLoading ? <div className="flex items-center justify-center h-64">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
       </div> :  <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Manage your events and important dates</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['month', 'week', 'day'].map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    view === viewType
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Events</option>
              <option value="task">Tasks</option>
              <option value="deal">Deals</option>
              <option value="customer">Customers</option>
              <option value="company">Companies</option>
              <option value="lead">Leads</option>
              <option value="custom">Custom Events</option>
            </select>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
          
          <button
            onClick={() => handleDateClick(new Date())}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="bg-white rounded-lg shadow">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Modals and Sidebars */}
      {showCreateSidebar && (
        <CreateEventSidebar
          isOpen={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
          projectId={projectId}
          selectedDate={selectedDate}
          onCreateEvent={handleCreateEvent}
        />
      )}

      {showEditSidebar && selectedEvent && (
        <EditEventSidebar
          isOpen={showEditSidebar}
          onClose={() => {
            setShowEditSidebar(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onUpdateEvent={handleUpdateEvent}
        />
      )}

      {showEventDetail && selectedEvent && (
        <EventDetailModal
          isOpen={showEventDetail}
          onClose={() => {
            setShowEventDetail(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>}
    </CrmLayout>
  );
};

export default Calendar;
