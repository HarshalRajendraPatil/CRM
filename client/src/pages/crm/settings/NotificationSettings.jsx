import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, BellIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

const NotificationSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    emailNotifications: {
      enabled: true,
      newLead: true,
      newCustomer: true,
      newDeal: true,
      dealUpdate: true,
      taskAssigned: true,
      taskDue: true,
      taskOverdue: true,
      eventReminder: true
    },
    inAppNotifications: {
      enabled: true,
      soundEnabled: true
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.notifications) {
      setFormData({
        emailNotifications: {
          enabled: settings.notifications.emailNotifications?.enabled ?? true,
          newLead: settings.notifications.emailNotifications?.newLead ?? true,
          newCustomer: settings.notifications.emailNotifications?.newCustomer ?? true,
          newDeal: settings.notifications.emailNotifications?.newDeal ?? true,
          dealUpdate: settings.notifications.emailNotifications?.dealUpdate ?? true,
          taskAssigned: settings.notifications.emailNotifications?.taskAssigned ?? true,
          taskDue: settings.notifications.emailNotifications?.taskDue ?? true,
          taskOverdue: settings.notifications.emailNotifications?.taskOverdue ?? true,
          eventReminder: settings.notifications.emailNotifications?.eventReminder ?? true
        },
        inAppNotifications: {
          enabled: settings.notifications.inAppNotifications?.enabled ?? true,
          soundEnabled: settings.notifications.inAppNotifications?.soundEnabled ?? true
        }
      });
    }
  }, [settings]);

  const handleEmailNotificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleInAppNotificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      inAppNotifications: {
        ...prev.inAppNotifications,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate('notifications', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.notifications) {
      setFormData({
        emailNotifications: {
          enabled: settings.notifications.emailNotifications?.enabled ?? true,
          newLead: settings.notifications.emailNotifications?.newLead ?? true,
          newCustomer: settings.notifications.emailNotifications?.newCustomer ?? true,
          newDeal: settings.notifications.emailNotifications?.newDeal ?? true,
          dealUpdate: settings.notifications.emailNotifications?.dealUpdate ?? true,
          taskAssigned: settings.notifications.emailNotifications?.taskAssigned ?? true,
          taskDue: settings.notifications.emailNotifications?.taskDue ?? true,
          taskOverdue: settings.notifications.emailNotifications?.taskOverdue ?? true,
          eventReminder: settings.notifications.emailNotifications?.eventReminder ?? true
        },
        inAppNotifications: {
          enabled: settings.notifications.inAppNotifications?.enabled ?? true,
          soundEnabled: settings.notifications.inAppNotifications?.soundEnabled ?? true
        }
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  const notificationTypes = [
    { key: 'newLead', label: 'New Lead', description: 'When a new lead is created' },
    { key: 'newCustomer', label: 'New Customer', description: 'When a new customer is added' },
    { key: 'newDeal', label: 'New Deal', description: 'When a new deal is created' },
    { key: 'dealUpdate', label: 'Deal Updates', description: 'When deal status or value changes' },
    { key: 'taskAssigned', label: 'Task Assignment', description: 'When a task is assigned to you' },
    { key: 'taskDue', label: 'Task Due Soon', description: 'When a task is approaching its due date' },
    { key: 'taskOverdue', label: 'Overdue Tasks', description: 'When a task becomes overdue' },
    { key: 'eventReminder', label: 'Event Reminders', description: 'Before calendar events' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure how and when you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotificationsEnabled"
                checked={formData.emailNotifications.enabled}
                onChange={(e) => handleEmailNotificationChange('enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotificationsEnabled" className="ml-2 text-sm text-gray-900">
                Enable email notifications
              </label>
            </div>
          </div>

          {formData.emailNotifications.enabled && (
            <div className="space-y-3">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                  <input
                    type="checkbox"
                    id={`email-${type.key}`}
                    checked={formData.emailNotifications[type.key]}
                    onChange={(e) => handleEmailNotificationChange(type.key, e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In-App Notifications */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">In-App Notifications</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="inAppNotificationsEnabled"
                checked={formData.inAppNotifications.enabled}
                onChange={(e) => handleInAppNotificationChange('enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="inAppNotificationsEnabled" className="ml-2 text-sm text-gray-900">
                Enable in-app notifications
              </label>
            </div>
          </div>

          {formData.inAppNotifications.enabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-gray-900">Sound Notifications</div>
                  <div className="text-sm text-gray-500">Play sound when notifications arrive</div>
                </div>
                <input
                  type="checkbox"
                  id="soundEnabled"
                  checked={formData.inAppNotifications.soundEnabled}
                  onChange={(e) => handleInAppNotificationChange('soundEnabled', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Notification Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preview</h3>
          
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-indigo-500 mr-3" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">New Lead Created</div>
                  <div className="text-sm text-gray-500">John Doe has been added as a new lead</div>
                </div>
                <div className="text-xs text-gray-400">2 min ago</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <SpeakerWaveIcon className="h-5 w-5 text-green-500 mr-3" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Task Due Soon</div>
                  <div className="text-sm text-gray-500">Follow up with client is due in 2 hours</div>
                </div>
                <div className="text-xs text-gray-400">5 min ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Frequency</h3>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p><strong>Email Notifications:</strong> Sent immediately when events occur</p>
              <p><strong>In-App Notifications:</strong> Appear in real-time and remain until read</p>
              <p><strong>Digest Emails:</strong> Coming soon - receive daily/weekly summaries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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

export default NotificationSettings;
