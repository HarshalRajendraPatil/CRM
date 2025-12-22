import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getCalendarEvents,
  getAggregatedEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUpcomingEvents,
  getOverdueEvents,
  getCalendarStats,
  getEventsByType,
  checkEventConflicts,
  getCalendarSettings,
  updateCalendarSettings,
} from "../../store/calendarSlice";
import CreateEventSidebar from "./calendar/CreateEventSidebar";
import EditEventSidebar from "./calendar/EditEventSidebar";
import EventDetailModal from "./calendar/EventDetailModal";
import CrmLayout from "../../layouts/CrmLayout";
import { useProjectAccess } from "../../hooks/useProjectAccess";
import { getProjectById } from "../../store/projectSlice";

const Calendar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    events,
    aggregatedEvents,
    isLoading,
    error,
    upcomingEvents,
    overdueEvents,
    stats,
    settings,
  } = useSelector((state) => state.calendar);
  const { user } = useSelector((state) => state.auth);
  const { hasManagerAccess } = useProjectAccess();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState("month"); // month, week, day, agenda
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all, tasks, deals, customers, companies, leads, custom
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);

  const refreshEvents = () => {
    if (!projectId) return;

    const date = new Date(currentDate);
    let startDate, endDate;

    if (view === "month") {
      // For month view, we need to include days from previous/next month that are visible
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      // Calculate the start of the calendar grid (including previous month's days)
      const calendarStart = new Date(firstDay);
      calendarStart.setDate(calendarStart.getDate() - firstDay.getDay());
      // Calculate the end of the calendar grid (including next month's days)
      const calendarEnd = new Date(lastDay);
      calendarEnd.setDate(calendarEnd.getDate() + (6 - lastDay.getDay()));
      startDate = calendarStart;
      endDate = calendarEnd;
    } else if (view === "week") {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      startDate = startOfWeek;
      endDate = new Date(startOfWeek);
      endDate.setDate(startOfWeek.getDate() + 6);
    } else {
      // day view or agenda
      // For day and agenda views, fetch a wider range to ensure all events are captured
      if (view === "agenda") {
        // For agenda, fetch next 90 days
        startDate = new Date(date);
        endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 90);
      } else {
        startDate = new Date(date);
        endDate = new Date(date);
      }
    }

    // Use local date formatting to avoid timezone issues
    const startDateStr = formatDateLocal(startDate);
    const endDateStr = formatDateLocal(endDate);

    dispatch(
      getCalendarEvents({
        projectId,
        startDate: startDateStr,
        endDate: endDateStr,
        type: filterType !== "all" ? filterType : undefined,
        search: searchTerm || undefined,
        limit: 1000, // Increase limit to get all events
      })
    );
    dispatch(
      getAggregatedEvents({
        projectId,
        startDate: startDateStr,
        endDate: endDateStr,
        types: filterType,
      })
    );
  };

  useEffect(() => {
    if (projectId) {
      refreshEvents();
      dispatch(getProjectById(projectId));
      // Load calendar stats and settings
      dispatch(getCalendarStats({ projectId }));
      dispatch(getCalendarSettings(projectId));
    }
  }, [dispatch, projectId, currentDate, view, filterType, searchTerm]);

  // Load upcoming and overdue events on mount
  useEffect(() => {
    if (projectId) {
      dispatch(getUpcomingEvents({ projectId, days: 30 }));
      dispatch(getOverdueEvents({ projectId }));
    }
  }, [dispatch, projectId]);

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
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await dispatch(deleteCalendarEvent({ projectId, eventId })).unwrap();
        setShowEventDetail(false);
        setSelectedEvent(null);
        // Refresh events
        const date = new Date(currentDate);
        let startDate, endDate;
        if (view === "month") {
          startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        } else if (view === "week") {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          startDate = startOfWeek;
          endDate = new Date(startOfWeek);
          endDate.setDate(startOfWeek.getDate() + 6);
        } else {
          startDate = new Date(date);
          endDate = new Date(date);
        }
        refreshEvents();
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await dispatch(createCalendarEvent({ projectId, eventData })).unwrap();
      setShowCreateSidebar(false);
      setSelectedDate(null);
      // Refresh events
      const date = new Date(currentDate);
      let startDate, endDate;
      if (view === "month") {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      } else if (view === "week") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 6);
      } else {
        startDate = new Date(date);
        endDate = new Date(date);
      }
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];
      dispatch(
        getCalendarEvents({
          projectId,
          startDate: startDateStr,
          endDate: endDateStr,
        })
      );
      dispatch(
        getAggregatedEvents({
          projectId,
          startDate: startDateStr,
          endDate: endDateStr,
          types: filterType,
        })
      );
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleUpdateEvent = async (eventData) => {
    try {
      await dispatch(
        updateCalendarEvent({ projectId, id: selectedEvent._id, ...eventData })
      ).unwrap();
      setShowEditSidebar(false);
      setSelectedEvent(null);
      // Refresh events
      const date = new Date(currentDate);
      let startDate, endDate;
      if (view === "month") {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      } else if (view === "week") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 6);
      } else {
        startDate = new Date(date);
        endDate = new Date(date);
      }
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];
      dispatch(
        getCalendarEvents({
          projectId,
          startDate: startDateStr,
          endDate: endDateStr,
        })
      );
      dispatch(
        getAggregatedEvents({
          projectId,
          startDate: startDateStr,
          endDate: endDateStr,
          types: filterType,
        })
      );
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDateLocal(date);
    // Filter out custom events from aggregatedEvents to avoid duplicates
    // Custom events are already in the events array
    const filteredAggregatedEvents = (aggregatedEvents || []).filter(
      (event) =>
        event.type !== "custom" && !event._id?.toString().startsWith("custom_")
    );
    const allEvents = [...events, ...filteredAggregatedEvents];
    return allEvents
      .filter((event) => {
        // Handle both Date objects and date strings
        const eventStartDate = formatDateLocal(event.startDate);
        const eventEndDate = event.endDate
          ? formatDateLocal(event.endDate)
          : eventStartDate;
        // Event is on this date if it starts, ends, or spans this date
        return dateStr >= eventStartDate && dateStr <= eventEndDate;
      })
      .sort((a, b) => {
        // Sort by time if available, otherwise by start date
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return new Date(a.startDate) - new Date(b.startDate);
      });
  };

  const getAllEventsSorted = () => {
    // Filter out custom events from aggregatedEvents to avoid duplicates
    // Custom events are already in the events array
    const filteredAggregatedEvents = (aggregatedEvents || []).filter(
      (event) =>
        event.type !== "custom" && !event._id?.toString().startsWith("custom_")
    );

    // Combine events and filtered aggregated events
    const allEvents = [...events, ...filteredAggregatedEvents];

    // Remove duplicates by event ID
    const uniqueEvents = [];
    const seenIds = new Set();

    allEvents.forEach((event) => {
      const eventId =
        event._id?.toString() ||
        `${event.type}_${event.startDate}_${event.title}`;
      if (!seenIds.has(eventId)) {
        seenIds.add(eventId);
        uniqueEvents.push(event);
      }
    });

    return uniqueEvents.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // If same date, sort by time
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  };

  const getEventColor = (event) => {
    const colors = {
      task: "bg-blue-100 border-blue-300 text-blue-800",
      deal: "bg-green-100 border-green-300 text-green-800",
      customer: "bg-purple-100 border-purple-300 text-purple-800",
      company: "bg-orange-100 border-orange-300 text-orange-800",
      lead: "bg-yellow-100 border-yellow-300 text-yellow-800",
      custom: "bg-indigo-100 border-indigo-300 text-indigo-800",
    };
    return colors[event.type] || colors.custom;
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
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
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700"
          >
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
                !isCurrentMonth ? "text-gray-400" : ""
              } ${isToday ? "bg-blue-50" : ""}`}
              onClick={() => handleDateClick(day)}
            >
              <div
                className={`text-sm font-medium ${
                  isToday ? "text-blue-600" : ""
                }`}
              >
                {day.getDate()}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-xs p-1 rounded border ${getEventColor(
                      event
                    )} truncate`}
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
                <div className={`p-2 border-b ${isToday ? "bg-blue-50" : ""}`}>
                  <div className="text-sm font-medium">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className={`text-lg ${isToday ? "text-blue-600" : ""}`}>
                    {day.getDate()}
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`text-xs p-2 rounded border ${getEventColor(
                        event
                      )} cursor-pointer hover:shadow-sm`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.startTime && (
                        <div className="text-xs opacity-75">
                          {new Date(
                            event.startDate + "T" + event.startTime
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
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
        <div className={`p-4 border-b ${isToday ? "bg-blue-50" : ""}`}>
          <div className="text-2xl font-bold">
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {dayEvents.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2">No events for this day</p>
                {hasManagerAccess && (
                  <button
                    onClick={() => handleDateClick(currentDate)}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Add an event
                  </button>
                )}
              </div>
            ) : (
              dayEvents.map((event, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${getEventColor(
                    event
                  )} cursor-pointer hover:shadow-sm`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-sm opacity-75 mt-1">
                          {event.description}
                        </div>
                      )}
                      {event.startTime && (
                        <div className="text-sm opacity-75 mt-1">
                          {new Date(
                            event.startDate + "T" + event.startTime
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {event.endTime &&
                            ` - ${new Date(
                              event.startDate + "T" + event.endTime
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
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

  const renderAgendaView = () => {
    const allEvents = getAllEventsSorted();
    const today = new Date();

    // Group events by date
    const eventsByDate = {};
    allEvents.forEach((event) => {
      const dateKey = formatDateLocal(event.startDate);

      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    const sortedDates = Object.keys(eventsByDate).sort();

    return (
      <div className="flex-1">
        <div className="divide-y divide-gray-200">
          {sortedDates.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2">No events found</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => {
              // Parse dateKey (YYYY-MM-DD) as local date
              const [year, month, day] = dateKey.split("-").map(Number);
              const date = new Date(year, month - 1, day);
              const isToday = formatDateLocal(date) === formatDateLocal(today);
              const dayEvents = eventsByDate[dateKey];

              return (
                <div key={dateKey} className="p-4">
                  <div
                    className={`flex items-center mb-3 ${
                      isToday ? "text-indigo-600 font-semibold" : ""
                    }`}
                  >
                    <div className="text-lg font-medium mr-4">
                      {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year:
                          date.getFullYear() !== today.getFullYear()
                            ? "numeric"
                            : undefined,
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dayEvents.length}{" "}
                      {dayEvents.length === 1 ? "event" : "events"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dayEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border ${getEventColor(
                          event
                        )} cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {event.startTime && (
                                <div className="text-sm font-medium text-gray-700">
                                  {new Date(
                                    event.startDate + "T" + event.startTime
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                  {event.endTime &&
                                    ` - ${new Date(
                                      event.startDate + "T" + event.endTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}`}
                                </div>
                              )}
                              <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                                {event.type.charAt(0).toUpperCase() +
                                  event.type.slice(1)}
                              </span>
                            </div>
                            <div className="font-medium mt-1">
                              {event.title}
                            </div>
                            {event.description && (
                              <div className="text-sm opacity-75 mt-1 line-clamp-2">
                                {event.description}
                              </div>
                            )}
                            {event.location && (
                              <div className="text-xs opacity-75 mt-1 flex items-center">
                                <svg
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <CrmLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-600">
                  Manage your events and important dates
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {["month", "week", "day", "agenda"].map((viewType) => (
                    <button
                      key={viewType}
                      onClick={() => setView(viewType)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        view === viewType
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
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
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
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
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-2 relative">
                <div className="text-lg font-semibold">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                    title="Pick a date"
                  >
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {showDatePicker && (
                    <div className="absolute right-0 z-10 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Select Date
                        </label>
                        <input
                          type="date"
                          value={
                            datePickerValue || formatDateLocal(currentDate)
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              const newDate = new Date(
                                e.target.value + "T00:00:00"
                              );
                              setCurrentDate(newDate);
                              setDatePickerValue(e.target.value);
                              setShowDatePicker(false);
                            }
                          }}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="text-sm text-gray-600 hover:text-gray-800 text-right"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {hasManagerAccess && (
                <button
                  onClick={() => handleDateClick(new Date())}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                >
                  Add Event
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Stats Panel */}
          {showStats && stats && hasManagerAccess && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Calendar Statistics
                </h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">
                    Total Events
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.stats?.totalEvents || 0}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">
                    Upcoming
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {stats.stats?.upcomingEvents || 0}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">
                    Overdue
                  </div>
                  <div className="text-2xl font-bold text-red-900">
                    {stats.stats?.overdueEvents || 0}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">
                    This Week
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.stats?.eventsThisWeek || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Events Sidebar */}
          {showUpcoming && upcomingEvents && upcomingEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h2>
                <button
                  onClick={() => setShowUpcoming(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {upcomingEvents.slice(0, 5).map((event, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${getEventColor(
                      event
                    )} cursor-pointer hover:shadow-sm`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {event.startTime && ` at ${event.startTime}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Events Sidebar */}
          {showOverdue && overdueEvents && overdueEvents.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-red-900">
                  Overdue Events
                </h2>
                <button
                  onClick={() => setShowOverdue(false)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {overdueEvents.slice(0, 5).map((event, index) => (
                  <div
                    key={index}
                    className="p-3 rounded border border-red-300 bg-white cursor-pointer hover:shadow-sm"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="font-medium text-sm text-red-900">
                      {event.title}
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Content */}
          <div className="bg-white rounded-lg shadow">
            {view === "month" && renderMonthView()}
            {view === "week" && renderWeekView()}
            {view === "day" && renderDayView()}
            {view === "agenda" && renderAgendaView()}
          </div>

          {/* Modals and Sidebars */}
          {showCreateSidebar && hasManagerAccess && (
            <CreateEventSidebar
              isOpen={showCreateSidebar}
              onClose={() => setShowCreateSidebar(false)}
              projectId={projectId}
              selectedDate={selectedDate}
              onCreateEvent={handleCreateEvent}
            />
          )}

          {showEditSidebar && selectedEvent && hasManagerAccess && (
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
              hasAccess={hasManagerAccess}
              projectId={projectId}
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
        </div>
      )}
    </CrmLayout>
  );
};

export default Calendar;
