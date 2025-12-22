import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  respondToEvent,
  getEventResponses,
  stopEventReminder,
} from "../../../store/calendarSlice";

const EventDetailModal = ({
  hasAccess,
  projectId,
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading: isLoadingResponses } = useSelector(
    (state) => state.calendar
  );
  const [userResponse, setUserResponse] = useState(null);
  const [isResponding, setIsResponding] = useState(false);
  const [eventResponses, setEventResponses] = useState([]);
  const [loadedEventId, setLoadedEventId] = useState(null);
  const [isStoppingReminder, setIsStoppingReminder] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setEventResponses([]);
      setUserResponse(null);
      setLoadedEventId(null);
      return;
    }

    if (event && event._id && event._id !== loadedEventId) {
      // If event already has responses, use them initially
      if (event.responses && event.responses.length > 0) {
        setEventResponses(event.responses);
        const currentUserResponse = event.responses.find(
          (r) => (r.user?._id || r.user) === user._id
        );
        if (currentUserResponse) {
          setUserResponse(currentUserResponse.response);
        }
      }

      // Load fresh responses from server
      setLoadedEventId(event._id);
    }
  }, [dispatch, event?._id, projectId, user._id, loadedEventId, isOpen]);

  const handleResponse = async (response) => {
    if (!event || !event._id) return;

    setIsResponding(true);
    try {
      const result = await dispatch(
        respondToEvent({ projectId, eventId: event._id, response })
      ).unwrap();

      setUserResponse(response);

      // Update local responses state from the result
      const updatedResponses =
        result.event?.responses ||
        result.data?.responses ||
        result.responses ||
        [];

      if (updatedResponses.length > 0) {
        setEventResponses(updatedResponses);
      } else {
        // Reload responses to ensure we have the latest data
        const responsesData = await dispatch(
          getEventResponses({ projectId, eventId: event._id })
        ).unwrap();
        setEventResponses(responsesData.responses || []);
      }
    } catch (error) {
      console.error("Error responding to event:", error);
      alert(error || "Failed to respond to event. Please try again.");
    } finally {
      setIsResponding(false);
    }
  };


  const handleStopReminder = async (reminderIndex = null) => {
    if (!event || !event._id) return;
    const message = reminderIndex === null 
      ? "Are you sure you want to stop all reminders for this event?"
      : "Are you sure you want to stop this reminder?";
    if (!window.confirm(message)) return;

    setIsStoppingReminder(true);
    try {
      await dispatch(
        stopEventReminder({ projectId, eventId: event._id, reminderIndex })
      ).unwrap();
      alert("Reminder stopped successfully");
      onClose();
    } catch (error) {
      console.error("Error stopping reminder:", error);
      alert(error || "Failed to stop reminder. Please try again.");
    } finally {
      setIsStoppingReminder(false);
    }
  };

  const isAttendee =
    event &&
    event.attendees &&
    event.attendees.some(
      (attendee) =>
        (attendee._id ? attendee._id.toString() : attendee.toString()) ===
        user._id.toString()
    );
  if (!isOpen || !event) return null;

  const getEventColor = (type) => {
    const colors = {
      task: "bg-blue-100 border-blue-300 text-blue-800",
      deal: "bg-green-100 border-green-300 text-green-800",
      customer: "bg-purple-100 border-purple-300 text-purple-800",
      company: "bg-orange-100 border-orange-300 text-orange-800",
      lead: "bg-yellow-100 border-yellow-300 text-yellow-800",
      custom: "bg-indigo-100 border-indigo-300 text-indigo-800",
    };
    return colors[type] || colors.custom;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100",
      high: "text-red-600 bg-red-100",
    };
    return colors[priority] || colors.medium;
  };

  const formatDateTime = (date, time) => {
    if (!date) return "";
    const dateObj = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(":");
      dateObj.setHours(parseInt(hours), parseInt(minutes));
    }
    return dateObj.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: time ? "numeric" : undefined,
      minute: time ? "2-digit" : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-sm overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
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

                <div className="mt-2 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventColor(
                      event.type
                    )}`}
                  >
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      event.priority
                    )}`}
                  >
                    {event.priority.charAt(0).toUpperCase() +
                      event.priority.slice(1)}{" "}
                    Priority
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pb-4 sm:p-6">
            <div className="space-y-4">
              {/* Date and Time */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Date & Time
                </h4>
                <div className="text-sm text-gray-600">
                  {event.allDay ? (
                    <>
                      {formatDateTime(event.startDate, null)}
                      {event.endDate && event.endDate !== event.startDate && (
                        <span>
                          {" - "}
                          {formatDateTime(event.endDate, null)}
                        </span>
                      )}
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                        All Day
                      </span>
                    </>
                  ) : (
                    <>
                      {formatDateTime(event.startDate, event.startTime)}
                      {event.endDate && event.endDate !== event.startDate ? (
                        <span>
                          {" - "}
                          {formatDateTime(event.endDate, event.endTime)}
                        </span>
                      ) : event.endTime ? (
                        <span>
                          {" - "}
                          {new Date(
                            `${event.startDate}T${event.endTime}`
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Location
                  </h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="h-4 w-4 mr-2 text-gray-400"
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
                </div>
              )}

              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Attendees
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                      >
                        <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-indigo-800">
                            {attendee.name
                              ? attendee.name.charAt(0).toUpperCase()
                              : "U"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">
                          {attendee.name || "Unknown User"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminders */}
              {event.reminders && event.reminders.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Reminders
                  </h4>
                  <div className="space-y-1">
                    {event.reminders.map((reminder, index) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <svg
                          className="h-4 w-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        {reminder.time} {reminder.unit} before via{" "}
                        {reminder.type}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Entity */}
              {event.relatedEntity &&
                event.relatedEntity.type &&
                (event.relatedEntity.id || event.relatedEntity._id) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Related to
                    </h4>
                    <div className="text-sm">
                      <button
                        onClick={() => {
                          const entityId =
                            event.relatedEntity.id?._id ||
                            event.relatedEntity.id ||
                            event.relatedEntity._id;
                          const entityType = event.relatedEntity.type;
                          const basePath = `/crm/${projectId}`;

                          switch (entityType) {
                            case "task":
                              navigate(`${basePath}/tasks/${entityId}`);
                              break;
                            case "deal":
                              navigate(`${basePath}/deals/${entityId}`);
                              break;
                            case "customer":
                              navigate(`${basePath}/customers/${entityId}`);
                              break;
                            case "company":
                              navigate(`${basePath}/companies/${entityId}`);
                              break;
                            case "lead":
                              navigate(`${basePath}/leads/${entityId}`);
                              break;
                            default:
                              break;
                          }
                          onClose();
                        }}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        View{" "}
                        {event.relatedEntity.type.charAt(0).toUpperCase() +
                          event.relatedEntity.type.slice(1)}
                        {event.relatedEntity.id?.name &&
                          `: ${event.relatedEntity.id.name}`}
                        {event.relatedEntity.id?.title &&
                          `: ${event.relatedEntity.id.title}`}
                        {event.relatedEntity.id?.firstName &&
                          `: ${event.relatedEntity.id.firstName} ${event.relatedEntity.id.lastName}`}
                      </button>
                    </div>
                  </div>
                )}

              {/* Attendee Responses */}
              {isAttendee && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                    Your Response
                  </h5>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResponse("accepted")}
                      disabled={isResponding || isLoadingResponses}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        userResponse === "accepted"
                          ? "bg-green-600 text-white border-2 border-green-700"
                          : "bg-white text-green-700 border-2 border-green-300 hover:bg-green-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isResponding ? "..." : "✓ Accept"}
                    </button>
                    <button
                      onClick={() => handleResponse("tentative")}
                      disabled={isResponding || isLoadingResponses}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        userResponse === "tentative"
                          ? "bg-yellow-600 text-white border-2 border-yellow-700"
                          : "bg-white text-yellow-700 border-2 border-yellow-300 hover:bg-yellow-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isResponding ? "..." : "? Tentative"}
                    </button>
                    <button
                      onClick={() => handleResponse("declined")}
                      disabled={isResponding || isLoadingResponses}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        userResponse === "declined"
                          ? "bg-red-600 text-white border-2 border-red-700"
                          : "bg-white text-red-700 border-2 border-red-300 hover:bg-red-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isResponding ? "..." : "✗ Decline"}
                    </button>
                  </div>
                </div>
              )}

              {event.attendees && event.attendees.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Attendee Responses
                  </h4>

                  {/* Response Summary */}
                  {eventResponses.length > 0 && (
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-semibold text-green-700">
                          {
                            eventResponses.filter(
                              (r) => r.response === "accepted"
                            ).length
                          }
                        </div>
                        <div className="text-xs text-green-600">Accepted</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-semibold text-yellow-700">
                          {
                            eventResponses.filter(
                              (r) => r.response === "tentative"
                            ).length
                          }
                        </div>
                        <div className="text-xs text-yellow-600">Tentative</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-semibold text-red-700">
                          {
                            eventResponses.filter(
                              (r) => r.response === "declined"
                            ).length
                          }
                        </div>
                        <div className="text-xs text-red-600">Declined</div>
                      </div>
                    </div>
                  )}

                  {/* Individual Responses */}
                  <div className="space-y-2 mb-4">
                    {event.attendees.map((attendee, index) => {
                      const attendeeId = attendee._id || attendee;
                      const response = eventResponses.find(
                        (r) => (r.user?._id || r.user) === attendeeId
                      );
                      const attendeeName =
                        attendee.name || attendee.email || "Unknown User";
                      const attendeeEmail = attendee.email || "";

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-800">
                                {attendeeName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {attendeeName}
                              </div>
                              {attendeeEmail && (
                                <div className="text-xs text-gray-500">
                                  {attendeeEmail}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {response ? (
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  response.response === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : response.response === "tentative"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {response.response === "accepted" &&
                                  "✓ Accepted"}
                                {response.response === "tentative" &&
                                  "? Tentative"}
                                {response.response === "declined" &&
                                  "✗ Declined"}
                                {response.respondedAt && (
                                  <span className="ml-2 text-xs opacity-75">
                                    {new Date(
                                      response.respondedAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No response
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reminders Control */}
              {event.reminders && event.reminders.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Reminders
                  </h4>
                  <div className="space-y-2">
                    {event.reminders.map((reminder, index) => {
                      if (reminder.stopped) return null;
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-600">
                            {reminder.type} - {reminder.time} {reminder.unit} before
                          </div>
                          {hasAccess && (
                            <button
                              onClick={() => handleStopReminder(index)}
                              disabled={isStoppingReminder}
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                            >
                              Stop
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {hasAccess && event.reminders.filter(r => !r.stopped).length > 1 && (
                      <button
                        onClick={() => handleStopReminder(null)}
                        disabled={isStoppingReminder}
                        className="w-full px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                      >
                        {isStoppingReminder ? "Stopping..." : "Stop All Reminders"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Created Info */}
              <div className="border-t pt-4">
                <div className="text-xs text-gray-500">
                  Created{" "}
                  {new Date(event.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {event.updatedAt && event.updatedAt !== event.createdAt && (
                    <span>
                      {" • Updated "}
                      {new Date(event.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {hasAccess && (
              <>
                <button
                  onClick={() => onEdit(event)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={event.type != "custom"}
                >
                  Edit Event
                </button>
                <button
                  onClick={() => onDelete(event._id)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={event.type != "custom"}
                >
                  Delete Event
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
