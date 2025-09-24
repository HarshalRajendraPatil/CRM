import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';

const CalendarSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    workingHours: {
      enabled: true,
      startTime: '09:00',
      endTime: '17:00',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    defaultDuration: 60,
    bufferTime: 15,
    timeSlots: 30
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.calendar) {
      setFormData({
        workingHours: {
          enabled: settings.calendar.workingHours?.enabled ?? true,
          startTime: settings.calendar.workingHours?.startTime || '09:00',
          endTime: settings.calendar.workingHours?.endTime || '17:00',
          workingDays: settings.calendar.workingHours?.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        defaultDuration: settings.calendar.defaultDuration || 60,
        bufferTime: settings.calendar.bufferTime || 15,
        timeSlots: settings.calendar.timeSlots || 30
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

  const handleWorkingHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleWorkingDayToggle = (day) => {
    const newWorkingDays = formData.workingHours.workingDays.includes(day)
      ? formData.workingHours.workingDays.filter(d => d !== day)
      : [...formData.workingHours.workingDays, day];
    
    handleWorkingHoursChange('workingDays', newWorkingDays);
  };

  const handleSave = async () => {
    try {
      await onUpdate('calendar', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save calendar settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.calendar) {
      setFormData({
        workingHours: {
          enabled: settings.calendar.workingHours?.enabled ?? true,
          startTime: settings.calendar.workingHours?.startTime || '09:00',
          endTime: settings.calendar.workingHours?.endTime || '17:00',
          workingDays: settings.calendar.workingHours?.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        defaultDuration: settings.calendar.defaultDuration || 60,
        bufferTime: settings.calendar.bufferTime || 15,
        timeSlots: settings.calendar.timeSlots || 30
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Calendar Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure calendar preferences and working hours
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Working Hours</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="workingHoursEnabled"
                checked={formData.workingHours.enabled}
                onChange={(e) => handleWorkingHoursChange('enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="workingHoursEnabled" className="ml-2 text-sm text-gray-900">
                Enable working hours
              </label>
            </div>

            {formData.workingHours.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={formData.workingHours.startTime}
                      onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={formData.workingHours.endTime}
                      onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Days
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {days.map((day) => (
                      <div key={day.key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`day-${day.key}`}
                          checked={formData.workingHours.workingDays.includes(day.key)}
                          onChange={() => handleWorkingDayToggle(day.key)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`day-${day.key}`} className="ml-2 text-sm text-gray-900">
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Event Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="defaultDuration" className="block text-sm font-medium text-gray-700">
                Default Duration (minutes)
              </label>
              <input
                type="number"
                id="defaultDuration"
                value={formData.defaultDuration}
                onChange={(e) => handleChange('defaultDuration', parseInt(e.target.value))}
                min="15"
                max="480"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="bufferTime" className="block text-sm font-medium text-gray-700">
                Buffer Time (minutes)
              </label>
              <input
                type="number"
                id="bufferTime"
                value={formData.bufferTime}
                onChange={(e) => handleChange('bufferTime', parseInt(e.target.value))}
                min="0"
                max="60"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="timeSlots" className="block text-sm font-medium text-gray-700">
                Time Slots (minutes)
              </label>
              <input
                type="number"
                id="timeSlots"
                value={formData.timeSlots}
                onChange={(e) => handleChange('timeSlots', parseInt(e.target.value))}
                min="15"
                max="120"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
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

export default CalendarSettings;
