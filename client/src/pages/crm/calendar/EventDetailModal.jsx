import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { respondToEvent, getEventResponses } from '../../../store/calendarSlice';

const EventDetailModal = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [responses, setResponses] = useState([]);
  const [userResponse, setUserResponse] = useState(null);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    if (event && event._id) {
      // Load event responses
      dispatch(getEventResponses(event._id));
    }
  }, [dispatch, event]);

  const handleResponse = async (response) => {
    if (!event || !event._id) return;
    
    setIsResponding(true);
    try {
      await dispatch(respondToEvent({ eventId: event._id, response }));
      setUserResponse(response);
      // Reload responses
      dispatch(getEventResponses(event._id));
    } catch (error) {
      console.error('Error responding to event:', error);
    } finally {
      setIsResponding(false);
    }
  };

  const isAttendee = event && event.attendees && event.attendees.some(attendee => 
    attendee._id === user._id || attendee === user._id
  );
  if (!isOpen || !event) return null;

  const getEventColor = (type) => {
    const colors = {
      task: 'bg-blue-100 border-blue-300 text-blue-800',
      deal: 'bg-green-100 border-green-300 text-green-800',
      customer: 'bg-purple-100 border-purple-300 text-purple-800',
      company: 'bg-orange-100 border-orange-300 text-orange-800',
      lead: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      custom: 'bg-indigo-100 border-indigo-300 text-indigo-800'
    };
    return colors[type] || colors.custom;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.medium;
  };

  const formatDateTime = (date, time) => {
    if (!date) return '';
    const dateObj = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':');
      dateObj.setHours(parseInt(hours), parseInt(minutes));
    }
    return dateObj.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: time ? 'numeric' : undefined,
      minute: time ? '2-digit' : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-sm overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0bg-opacity-75 transition-opacity" onClick={onClose}></div>

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
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                    {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
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
                <h4 className="text-sm font-medium text-gray-900 mb-2">Date & Time</h4>
                <div className="text-sm text-gray-600">
                  {formatDateTime(event.startDate, event.startTime)}
                  {event.endTime && !event.allDay && (
                    <span>
                      {' - '}
                      {new Date(`${event.startDate}T${event.endTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                  {event.allDay && <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">All Day</span>}
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Location</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
              )}

              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Attendees</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                        <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-indigo-800">
                            {attendee.name ? attendee.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">{attendee.name || 'Unknown User'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
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
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Reminders</h4>
                  <div className="space-y-1">
                    {event.reminders.map((reminder, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {reminder.time} {reminder.unit} before via {reminder.type}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Entity */}
              {event.relatedEntity && event.relatedEntity.type && event.relatedEntity.id && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Related to</h4>
                  <div className="text-sm text-gray-600">
                    {event.relatedEntity.type.charAt(0).toUpperCase() + event.relatedEntity.type.slice(1)}: {event.relatedEntity.id}
                  </div>
                </div>
              )}

              {/* Attendee Responses */}
              {isAttendee && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Your Response</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResponse('accepted')}
                      disabled={isResponding}
                      className={`px-3 py-1 text-sm rounded-md ${
                        userResponse === 'accepted'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-green-50'
                      }`}
                    >
                      {isResponding ? '...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleResponse('tentative')}
                      disabled={isResponding}
                      className={`px-3 py-1 text-sm rounded-md ${
                        userResponse === 'tentative'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-yellow-50'
                      }`}
                    >
                      {isResponding ? '...' : 'Tentative'}
                    </button>
                    <button
                      onClick={() => handleResponse('declined')}
                      disabled={isResponding}
                      className={`px-3 py-1 text-sm rounded-md ${
                        userResponse === 'declined'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50'
                      }`}
                    >
                      {isResponding ? '...' : 'Decline'}
                    </button>
                  </div>
                </div>
              )}

              {/* Created Info */}
              <div className="border-t pt-4">
                <div className="text-xs text-gray-500">
                  Created {new Date(event.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                  {event.updatedAt && event.updatedAt !== event.createdAt && (
                    <span>
                      {' • Updated '}
                      {new Date(event.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onEdit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Edit Event
            </button>
            <button
              onClick={onDelete}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete Event
            </button>
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
