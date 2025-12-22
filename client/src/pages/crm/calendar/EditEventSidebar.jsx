import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjectTasks } from '../../../store/taskSlice';
import { fetchProjectDeals } from '../../../store/dealSlice';
import { fetchProjectCustomers } from '../../../store/customerSlice';
import { getProjectCompanies } from '../../../store/companySlice';
import { getProjectLeads } from '../../../store/leadSlice';

const EditEventSidebar = ({ isOpen, onClose, event, onUpdateEvent }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.users);
  const { tasks } = useSelector((state) => state.tasks);
  const { deals } = useSelector((state) => state.deals);
  const { customers } = useSelector((state) => state.customers);
  const { companies } = useSelector((state) => state.companies);
  const { leads } = useSelector((state) => state.leads);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'custom',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    allDay: false,
    location: '',
    attendees: [],
    relatedEntity: {
      type: 'task',
      id: null
    },
    customFields: [],
    tags: [],
    priority: 'medium',
    status: 'scheduled',
    visibility: 'project',
    reminders: [],
    metadata: {}
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectTasks({ projectId: event.project }));
    dispatch(fetchProjectDeals({ projectId: event.project }));
    dispatch(fetchProjectCustomers({ projectId: event.project }));
    dispatch(getProjectCompanies({ projectId: event.project }));
    dispatch(getProjectLeads({ projectId: event.project }));
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        type: event.type || 'custom',
        startDate: event.startDate ? event.startDate.split('T')[0] : '',
        endDate: event.endDate ? event.endDate.split('T')[0] : '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        allDay: event.allDay || false,
        location: event.location || '',
        attendees: event.attendees || [],
        relatedEntity: event.relatedEntity || { type: 'task', id: null },
        customFields: event.customFields || [],
        tags: event.tags || [],
        priority: event.priority || 'medium',
        status: event.status || 'scheduled',
        visibility: event.visibility || 'project',
        reminders: event.reminders || [],
        metadata: event.metadata || {}
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // When allDay is checked, clear times and set endDate to startDate if not set
      if (name === 'allDay' && checked) {
        newData.startTime = '';
        newData.endTime = '';
        if (!newData.endDate) {
          newData.endDate = newData.startDate;
        }
      }
      
      // When allDay is unchecked and endDate is not set, set it to startDate
      if (name === 'allDay' && !checked && !newData.endDate) {
        newData.endDate = newData.startDate;
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRelatedEntityChange = (type, id) => {
    setFormData(prev => ({
      ...prev,
      relatedEntity: { type, id }
    }));
  };

  const handleAddTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddAttendee = (userId) => {
    if (userId && !formData.attendees.includes(userId)) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, userId]
      }));
    }
  };

  const handleRemoveAttendee = (userId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(id => id !== userId)
    }));
  };

  const handleAddReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { type: 'email', time: '15', unit: 'minutes' }]
    }));
  };

  const handleRemoveReminder = (index) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  const handleReminderChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map((reminder, i) => 
        i === index ? { ...reminder, [field]: value } : reminder
      )
    }));
  };

  const handleAddCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { key: '', value: '' }]
    }));
  };

  const handleRemoveCustomField = (index) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map((customField, i) => 
        i === index ? { ...customField, [field]: value } : customField
      )
    }));
  };


  const getRelatedEntities = () => {
    switch (formData.relatedEntity.type) {
      case 'task':
        return tasks.map(task => ({ id: task._id, name: task.title }));
      case 'deal':
        return deals.map(deal => ({ id: deal._id, name: deal.name }));
      case 'customer':
        return customers.map(customer => ({ id: customer._id, name: `${customer.firstName} ${customer.lastName}` }));
      case 'company':
        return companies.map(company => ({ id: company._id, name: company.name }));
      case 'lead':
        return leads.map(lead => ({ id: lead._id, name: `${lead.firstName} ${lead.lastName}` }));
      default:
        return [];
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    // End date is required when not all day
    if (!formData.allDay && !formData.endDate) {
      newErrors.endDate = 'End date is required when event is not all day';
    }
    
    // If end date is provided, it must be after or equal to start date
    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after or equal to start date';
    }
    
    if (!formData.allDay && formData.startTime && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onUpdateEvent(formData);
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-transparent backdrop-blur-sm bg-opacity-75" onClick={onClose}></div>
      
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Edit Event</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Event title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Event description"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="custom">Custom Event</option>
                  <option value="task">Task</option>
                  <option value="deal">Deal</option>
                  <option value="customer">Customer</option>
                  <option value="company">Company</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="allDay"
                    checked={formData.allDay}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">All Day</label>
                </div>
              </div>

              {!formData.allDay && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.endTime ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Event location"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="private">Private</option>
                  <option value="project">Project</option>
                  <option value="public">Public</option>
                </select>
              </div>

              {/* Related Entity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Entity Type
                </label>
                <select
                  value={formData.relatedEntity.type}
                  onChange={(e) => handleRelatedEntityChange(e.target.value, '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  <option value="task">Task</option>
                  <option value="deal">Deal</option>
                  <option value="customer">Customer</option>
                  <option value="company">Company</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              {formData.relatedEntity.type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Entity
                  </label>
                  <select
                    value={formData.relatedEntity.id}
                    onChange={(e) => handleRelatedEntityChange(formData.relatedEntity.type, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select {formData.relatedEntity.type}</option>
                    {getRelatedEntities().map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tag and press Enter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendees
                </label>
                <div className="space-y-2">
                  {formData.attendees.map((userId) => {
                    const user = users.find(u => u._id === userId);
                    return (
                      <div key={userId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{user?.name || 'Unknown User'}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttendee(userId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddAttendee(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Add attendee...</option>
                    {users.filter(user => !formData.attendees.includes(user._id)).map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reminders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reminders
                  </label>
                  <button
                    type="button"
                    onClick={handleAddReminder}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Reminder
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.reminders.map((reminder, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={reminder.type}
                        onChange={(e) => handleReminderChange(index, 'type', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="email">Email</option>
                        <option value="popup">Popup</option>
                      </select>
                      <input
                        type="number"
                        value={reminder.time}
                        onChange={(e) => handleReminderChange(index, 'time', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                      <select
                        value={reminder.unit}
                        onChange={(e) => handleReminderChange(index, 'unit', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveReminder(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Fields
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Custom Field
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.customFields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Field value"
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventSidebar;
