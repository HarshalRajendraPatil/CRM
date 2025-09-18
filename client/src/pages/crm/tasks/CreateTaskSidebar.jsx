import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTaskAction } from '../../../store/taskSlice';
import { getUsers } from '../../../store/userSlice';
import {getProjectLeads} from '../../../store/leadSlice'
import {fetchProjectCustomers} from '../../../store/customerSlice'
import {fetchProjectDeals} from '../../../store/dealSlice'
import {getProjectCompanies} from '../../../store/companySlice'

const CreateTaskSidebar = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);
  const { leads } = useSelector((state) => state.leads);
  const { customers } = useSelector((state) => state.customers);
  const { deals } = useSelector((state) => state.deals);
  const { companies } = useSelector((state) => state.companies);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    type: 'other',
    dueDate: '',
    startDate: '',
    assignedTo: '',
    relatedTo: '',
    relatedToId: '',
    estimatedHours: '',
    actualHours: 0,
    progress: 0,
    completionNotes: '',
    tags: [],
    subtasks: [],
    customFields: {},
    visibility: 'project',
    recurrence: {
      enabled: false,
      pattern: 'daily',
      interval: 1,
      daysOfWeek: [],
      endDate: '',
      occurrences: ''
    },
    reminders: []
  });

  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [reminderType, setReminderType] = useState('email');
  const [reminderTrigger, setReminderTrigger] = useState('before_due');
  const [reminderOffset, setReminderOffset] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      dispatch(getUsers());
      dispatch(getProjectLeads({ projectId }));
      dispatch(fetchProjectCustomers({ projectId }));
      dispatch(fetchProjectDeals({ projectId }));
      dispatch(getProjectCompanies({ projectId }));
    }
  }, [dispatch, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, {
          title: subtaskInput.trim(),
          isCompleted: false
        }]
      }));
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomField = () => {
    if (customFieldKey.trim() && customFieldValue.trim()) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldKey.trim()]: customFieldValue.trim()
        }
      }));
      setCustomFieldKey('');
      setCustomFieldValue('');
    }
  };

  const handleRemoveCustomField = (key) => {
    setFormData(prev => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[key];
      return {
        ...prev,
        customFields: newCustomFields
      };
    });
  };

  const handleAddReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, {
        type: reminderType,
        trigger: reminderTrigger,
        offset: reminderOffset
      }]
    }));
    setReminderType('email');
    setReminderTrigger('before_due');
    setReminderOffset(0);
  };

  const handleRemoveReminder = (index) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  const handleRecurrenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value
      }
    }));
  };

  const handleDaysOfWeekChange = (day) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: prev.recurrence.daysOfWeek.includes(day)
          ? prev.recurrence.daysOfWeek.filter(d => d !== day)
          : [...prev.recurrence.daysOfWeek, day]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (formData.title.trim().length < 3) {
      newErrors.title = 'Task title must be at least 3 characters long';
    }

    if (formData.title.trim().length > 200) {
      newErrors.title = 'Task title cannot exceed 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (formData.relatedTo && !formData.relatedToId) {
      newErrors.relatedToId = 'Related ID is required when type is selected';
    }

    if (formData.relatedToId && !formData.relatedTo) {
      newErrors.relatedTo = 'Type is required when related ID is provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Add default subtask if no subtasks are provided
      const subtasks = formData.subtasks.length > 0 ? formData.subtasks : [{
        title: 'Complete task',
        description: 'Default subtask to track task completion',
        status: 'pending',
        isCompleted: false
      }];

      const taskData = {
        ...formData,
        projectId,
        dueDate: formData.dueDate || undefined,
        startDate: formData.startDate || undefined,
        assignedTo: formData.assignedTo || undefined,
        relatedTo: formData.relatedTo || undefined,
        relatedToId: formData.relatedToId || undefined,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        actualHours: formData.actualHours || 0,
        progress: formData.progress || 0,
        completionNotes: formData.completionNotes || undefined,
        subtasks,
        recurrence: formData.recurrence.enabled ? formData.recurrence : undefined,
        reminders: formData.reminders.length > 0 ? formData.reminders : undefined
      };

      await dispatch(createTaskAction(taskData)).unwrap();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        type: 'other',
        dueDate: '',
        startDate: '',
        assignedTo: '',
        relatedTo: '',
        relatedToId: '',
        estimatedHours: '',
        actualHours: 0,
        progress: 0,
        completionNotes: '',
        tags: [],
        subtasks: [],
        customFields: {},
        visibility: 'project',
        recurrence: {
          enabled: false,
          pattern: 'daily',
          interval: 1,
          daysOfWeek: [],
          endDate: '',
          occurrences: ''
        },
        reminders: []
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
      
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
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
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter task title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter task description"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="follow_up">Follow Up</option>
                      <option value="meeting">Meeting</option>
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="document">Document</option>
                      <option value="research">Research</option>
                      <option value="review">Review</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        name="estimatedHours"
                        value={formData.estimatedHours}
                        onChange={handleInputChange}
                        min="0"
                        max="999"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Progress (%)
                      </label>
                      <input
                        type="number"
                        name="progress"
                        value={formData.progress}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Notes
                    </label>
                    <textarea
                      name="completionNotes"
                      value={formData.completionNotes}
                      onChange={handleInputChange}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter completion notes..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign To *
                      </label>
                      <select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select user</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visibility
                      </label>
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="private">Private</option>
                        <option value="project">Project</option>
                        <option value="public">Public</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Relationships */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Relationships</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="relatedTo"
                      value={formData.relatedTo}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select type</option>
                      <option value="deal">Deal</option>
                      <option value="customer">Customer</option>
                      <option value="company">Company</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related to
                    </label>
                    <select
                      name="relatedToId"
                      value={formData.relatedToId}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!formData.relatedTo}
                    >
                      <option value={null}>Select related to</option>
                      {formData.relatedTo === 'deal' && deals.map(deal => (
                        <option key={deal._id} value={deal._id}>
                          {deal.name}
                        </option>
                      ))}
                      {formData.relatedTo === 'customer' && customers.map(customer => (
                        <option key={customer._id} value={customer._id}>
                          {customer.fullName}
                        </option>
                      ))}
                      {formData.relatedTo === 'company' && companies.map(company => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                      {formData.relatedTo === 'lead' && leads.map(lead => (
                        <option key={lead._id} value={lead._id}>
                          {lead.name}
                        </option>
                      ))}
                    </select>
                    {errors.relatedToId && (
                      <p className="mt-1 text-sm text-red-600">{errors.relatedToId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                        >
                          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                            <path d="M8 0L4 4L0 0h8z" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Subtasks</h3>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAddSubtask)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter subtask"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                
                {formData.subtasks.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.subtasks.map((subtask, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <span className="text-sm text-gray-900">{subtask.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Fields */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Custom Fields</h3>
                
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customFieldKey}
                      onChange={(e) => setCustomFieldKey(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Field name"
                    />
                    <input
                      type="text"
                      value={customFieldValue}
                      onChange={(e) => setCustomFieldValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Field value"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  {Object.keys(formData.customFields).length > 0 && (
                    <div className="mt-2 space-y-2">
                      {Object.entries(formData.customFields).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{key}:</span>
                            <span className="text-sm text-gray-600">{value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(key)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recurrence */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Recurrence</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="recurrenceEnabled"
                      checked={formData.recurrence.enabled}
                      onChange={(e) => handleRecurrenceChange('enabled', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="recurrenceEnabled" className="ml-2 block text-sm text-gray-900">
                      Enable recurrence
                    </label>
                  </div>

                  {formData.recurrence.enabled && (
                    <div className="space-y-3 pl-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pattern
                          </label>
                          <select
                            value={formData.recurrence.pattern}
                            onChange={(e) => handleRecurrenceChange('pattern', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interval
                          </label>
                          <input
                            type="number"
                            value={formData.recurrence.interval}
                            onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                            min="1"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {formData.recurrence.pattern === 'weekly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Days of Week
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                              <label key={day} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.recurrence.daysOfWeek.includes(index)}
                                  onChange={() => handleDaysOfWeekChange(index)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-1 text-sm text-gray-700">{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={formData.recurrence.endDate}
                            onChange={(e) => handleRecurrenceChange('endDate', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Occurrences
                          </label>
                          <input
                            type="number"
                            value={formData.recurrence.occurrences}
                            onChange={(e) => handleRecurrenceChange('occurrences', e.target.value)}
                            min="1"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reminders */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Reminders</h3>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <select
                      value={reminderType}
                      onChange={(e) => setReminderType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="email">Email</option>
                      <option value="push">Push</option>
                      <option value="sms">SMS</option>
                    </select>

                    <select
                      value={reminderTrigger}
                      onChange={(e) => setReminderTrigger(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="before_due">Before Due</option>
                      <option value="on_due">On Due</option>
                      <option value="overdue">Overdue</option>
                    </select>

                    <input
                      type="number"
                      value={reminderOffset}
                      onChange={(e) => setReminderOffset(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Minutes"
                    />

                    <button
                      type="button"
                      onClick={handleAddReminder}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>

                  {formData.reminders.length > 0 && (
                    <div className="space-y-2">
                      {formData.reminders.map((reminder, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <span className="text-sm text-gray-900">
                            {reminder.type} reminder {reminder.trigger} ({reminder.offset} minutes)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReminder(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskSidebar;
