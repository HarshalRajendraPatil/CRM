import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTaskAction, fetchTaskActivities } from '../../../store/taskSlice';
import { getUsers } from '../../../store/userSlice';
import { formatDate, formatDateTime } from '../../../utils/dealUtils';
import { getProjectById } from '../../../store/projectSlice';
import { getProjectLeads } from '../../../store/leadSlice';
import { fetchProjectCustomers } from '../../../store/customerSlice';
import { fetchProjectDeals } from '../../../store/dealSlice';
import { getProjectCompanies } from '../../../store/companySlice';

const EditTaskSidebar = ({ isOpen, onClose, task, projectId }) => {
  console.log(projectId)
  const dispatch = useDispatch();
  const { loading, error, activities } = useSelector((state) => state.tasks);
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
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  
  // Reminder state
  const [reminderType, setReminderType] = useState('email');
  const [reminderTrigger, setReminderTrigger] = useState('due_date');
  const [reminderOffset, setReminderOffset] = useState(1);

  useEffect(() => {
    if (isOpen && task) {
      dispatch(getUsers());
      dispatch(getProjectById(projectId ));
      dispatch(getProjectLeads({ projectId }));
      dispatch(fetchProjectCustomers({ projectId }));
      dispatch(fetchProjectDeals({ projectId }));
      dispatch(getProjectCompanies({ projectId }));
      // dispatch(fetchTaskActivities({ projectId, taskId: task._id }));
      
      // Convert customFields Map to object if needed
      let customFieldsObj = {};
      if (task.customFields) {
        if (task.customFields instanceof Map) {
          customFieldsObj = Object.fromEntries(task.customFields);
        } else if (typeof task.customFields === 'object') {
          customFieldsObj = task.customFields;
        }
      }

      // Convert subtasks to include isCompleted for UI
      const formattedSubtasks = (task.subtasks || []).map(subtask => ({
        ...subtask,
        isCompleted: subtask.status === 'completed'
      }));
      
      // Populate form with task data
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        type: task.type || 'other',
        dueDate: task.dueDate ? formatDate(task.dueDate) : '',
        startDate: task.startDate ? formatDate(task.startDate) : '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        relatedTo: task.relatedEntity?.type || '',
        relatedToId: task.relatedEntity?.entityId || task.relatedEntity?.entityId?._id || '',
        estimatedHours: task.estimatedHours || '',
        actualHours: task.actualHours || 0,
        progress: task.progress || 0,
        completionNotes: task.completionNotes || '',
        tags: task.tags || [],
        subtasks: formattedSubtasks,
        customFields: customFieldsObj,
        visibility: task.visibility || 'project',
        recurrence: task.recurrence ? {
          ...task.recurrence,
          endDate: task.recurrence.endDate ? formatDate(task.recurrence.endDate) : '',
          occurrences: task.recurrence.occurrences || ''
        } : {
          enabled: false,
          pattern: 'daily',
          interval: 1,
          daysOfWeek: [],
          endDate: '',
          occurrences: ''
        },
        reminders: task.reminders || []
      });
    }
  }, [dispatch, isOpen, task]);

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

  const handleSubtaskToggle = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) => 
        i === index ? { ...subtask, isCompleted: !subtask.isCompleted } : subtask
      )
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
    if (reminderType && reminderTrigger && reminderOffset) {
      setFormData(prev => ({
        ...prev,
        reminders: [...prev.reminders, {
          type: reminderType,
          trigger: reminderTrigger,
          offset: reminderOffset
        }]
      }));
      setReminderType('email');
      setReminderTrigger('due_date');
      setReminderOffset(1);
    }
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
      // Format subtasks: convert isCompleted to status
      const formattedSubtasks = formData.subtasks.map(subtask => ({
        title: subtask.title,
        description: subtask.description || '',
        status: subtask.isCompleted ? 'completed' : (subtask.status || 'pending'),
        assignedTo: subtask.assignedTo || undefined,
        dueDate: subtask.dueDate || undefined
      }));

      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        type: formData.type,
        dueDate: formData.dueDate || undefined,
        startDate: formData.startDate || undefined,
        assignedTo: formData.assignedTo || undefined,
        relatedTo: formData.relatedTo || undefined,
        relatedToId: formData.relatedToId || undefined,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        actualHours: formData.actualHours || 0,
        progress: formData.progress || 0,
        completionNotes: formData.completionNotes || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        subtasks: formattedSubtasks.length > 0 ? formattedSubtasks : undefined,
        customFields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
        visibility: formData.visibility,
        recurrence: formData.recurrence.enabled ? {
          ...formData.recurrence,
          endDate: formData.recurrence.endDate || undefined,
          occurrences: formData.recurrence.occurrences || undefined
        } : undefined,
        reminders: formData.reminders.length > 0 ? formData.reminders : undefined
      };

      await dispatch(updateTaskAction({ projectId, taskId: task._id, data: taskData })).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'status_change':
        return (
          <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'assigned':
        return (
          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'comment_added':
        return (
          <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'subtask_added':
        return (
          <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-transparent backdrop-blur-sm bg-opacity-75" onClick={onClose} />
      
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', name: 'Basic Info' },
                { id: 'details', name: 'Details' },
                { id: 'relationships', name: 'Relationships' },
                { id: 'subtasks', name: 'Subtasks' },
                { id: 'recurrence', name: 'Recurrence' },
                { id: 'reminders', name: 'Reminders' },
                { id: 'custom', name: 'Custom Fields' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
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

                  <div className="grid grid-cols-3 gap-4">
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
                        <option value="completed">Completed</option>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="bug">Bug</option>
                        <option value="feature">Feature</option>
                        <option value="improvement">Improvement</option>
                        <option value="documentation">Documentation</option>
                        <option value="research">Research</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-4">
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
                        Due Date
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
                        step="0.5"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Hours
                      </label>
                      <input
                        type="number"
                        name="actualHours"
                        value={formData.actualHours}
                        onChange={handleInputChange}
                        min="0"
                        step="0.5"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Notes
                    </label>
                    <textarea
                      name="completionNotes"
                      value={formData.completionNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter completion notes"
                    />
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
                      <option value="project">Project</option>
                      <option value="team">Team</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To
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

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
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
                </div>
              )}

              {/* Relationships Tab */}
              {activeTab === 'relationships' && (
                <div className="space-y-4">
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
              )}

              {/* Subtasks Tab */}
              {activeTab === 'subtasks' && (
                <div className="space-y-4">
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
                    <div className="space-y-2">
                      {formData.subtasks.map((subtask, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={subtask.isCompleted}
                              onChange={() => handleSubtaskToggle(index)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className={`text-sm ${subtask.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {subtask.title}
                            </span>
                          </div>
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
              )}

              {/* Recurrence Tab */}
              {activeTab === 'recurrence' && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.recurrence.enabled}
                      onChange={(e) => handleRecurrenceChange('enabled', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Enable Recurrence
                    </label>
                  </div>

                  {formData.recurrence.enabled && (
                    <div className="space-y-4 pl-6 border-l-2 border-gray-200">
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
                            min="1"
                            value={formData.recurrence.interval}
                            onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {formData.recurrence.pattern === 'weekly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days of Week
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => handleDaysOfWeekChange(index)}
                                className={`px-3 py-1 text-sm rounded-md border ${
                                  formData.recurrence.daysOfWeek.includes(index)
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {day}
                              </button>
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
                            min="1"
                            value={formData.recurrence.occurrences}
                            onChange={(e) => handleRecurrenceChange('occurrences', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reminders Tab */}
              {activeTab === 'reminders' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <select
                        value={reminderType}
                        onChange={(e) => setReminderType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="email">Email</option>
                        <option value="push">Push Notification</option>
                        <option value="sms">SMS</option>
                      </select>

                      <select
                        value={reminderTrigger}
                        onChange={(e) => setReminderTrigger(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="due_date">Due Date</option>
                        <option value="start_date">Start Date</option>
                        <option value="custom">Custom</option>
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={reminderOffset}
                        onChange={(e) => setReminderOffset(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Days"
                      />

                      <button
                        type="button"
                        onClick={handleAddReminder}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {formData.reminders.length > 0 && (
                    <div className="space-y-2">
                      {formData.reminders.map((reminder, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {reminder.type} reminder
                            </span>
                            <span className="text-sm text-gray-500">
                              {reminder.offset} day(s) before {reminder.trigger.replace('_', ' ')}
                            </span>
                          </div>
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
              )}

              {/* Activities Tab */}
              {activeTab === 'activities' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Task activities and history
                  </div>
                  
                  {activities && activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex-shrink-0 mt-0.5">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatDateTime(activity.createdAt)}
                              </span>
                              {activity.createdBy && (
                                <span className="text-xs text-gray-500">
                                  by {activity.createdBy.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No activities yet
                    </div>
                  )}
                </div>
              )}

              {/* Custom Fields Tab */}
              {activeTab === 'custom' && (
                <div className="space-y-4">
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
              )}
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
                {loading ? 'Updating...' : 'Update Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskSidebar;
