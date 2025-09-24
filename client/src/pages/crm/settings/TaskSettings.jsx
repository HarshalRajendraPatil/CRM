import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const TaskSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    defaultPriority: 'medium',
    defaultType: 'follow-up',
    autoReminders: {
      enabled: true,
      beforeDue: 24
    },
    timeTracking: {
      enabled: false
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.tasks) {
      setFormData({
        defaultPriority: settings.tasks.defaultPriority || 'medium',
        defaultType: settings.tasks.defaultType || 'follow-up',
        autoReminders: {
          enabled: settings.tasks.autoReminders?.enabled ?? true,
          beforeDue: settings.tasks.autoReminders?.beforeDue || 24
        },
        timeTracking: {
          enabled: settings.tasks.timeTracking?.enabled ?? false
        }
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleAutoRemindersChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      autoReminders: {
        ...prev.autoReminders,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleTimeTrackingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      timeTracking: {
        ...prev.timeTracking,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate('tasks', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save task settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.tasks) {
      setFormData({
        defaultPriority: settings.tasks.defaultPriority || 'medium',
        defaultType: settings.tasks.defaultType || 'follow-up',
        autoReminders: {
          enabled: settings.tasks.autoReminders?.enabled ?? true,
          beforeDue: settings.tasks.autoReminders?.beforeDue || 24
        },
        timeTracking: {
          enabled: settings.tasks.timeTracking?.enabled ?? false
        }
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Task Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure task management and automation
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Default Values</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultPriority" className="block text-sm font-medium text-gray-700">
                Default Priority
              </label>
              <select
                id="defaultPriority"
                value={formData.defaultPriority}
                onChange={(e) => handleChange('defaultPriority', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="defaultType" className="block text-sm font-medium text-gray-700">
                Default Type
              </label>
              <select
                id="defaultType"
                value={formData.defaultType}
                onChange={(e) => handleChange('defaultType', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="follow-up">Follow-up</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Auto Reminders</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRemindersEnabled"
                checked={formData.autoReminders.enabled}
                onChange={(e) => handleAutoRemindersChange('enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRemindersEnabled" className="ml-2 text-sm text-gray-900">
                Enable automatic reminders
              </label>
            </div>

            {formData.autoReminders.enabled && (
              <div>
                <label htmlFor="beforeDue" className="block text-sm font-medium text-gray-700">
                  Hours before due date
                </label>
                <input
                  type="number"
                  id="beforeDue"
                  value={formData.autoReminders.beforeDue}
                  onChange={(e) => handleAutoRemindersChange('beforeDue', parseInt(e.target.value))}
                  min="1"
                  max="168"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Tracking</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="timeTrackingEnabled"
              checked={formData.timeTracking.enabled}
              onChange={(e) => handleTimeTrackingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="timeTrackingEnabled" className="ml-2 text-sm text-gray-900">
              Enable time tracking for tasks
            </label>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updating}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskSettings;
