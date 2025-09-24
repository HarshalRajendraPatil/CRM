import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const IntegrationSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    googleCalendar: {
      enabled: false,
      calendarId: ''
    },
    slack: {
      enabled: false,
      webhookUrl: '',
      channel: ''
    },
    webhooks: []
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.integrations) {
      setFormData({
        googleCalendar: {
          enabled: settings.integrations.googleCalendar?.enabled ?? false,
          calendarId: settings.integrations.googleCalendar?.calendarId || ''
        },
        slack: {
          enabled: settings.integrations.slack?.enabled ?? false,
          webhookUrl: settings.integrations.slack?.webhookUrl || '',
          channel: settings.integrations.slack?.channel || ''
        },
        webhooks: settings.integrations.webhooks || []
      });
    }
  }, [settings]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate('integrations', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save integration settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.integrations) {
      setFormData({
        googleCalendar: {
          enabled: settings.integrations.googleCalendar?.enabled ?? false,
          calendarId: settings.integrations.googleCalendar?.calendarId || ''
        },
        slack: {
          enabled: settings.integrations.slack?.enabled ?? false,
          webhookUrl: settings.integrations.slack?.webhookUrl || '',
          channel: settings.integrations.slack?.channel || ''
        },
        webhooks: settings.integrations.webhooks || []
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Integration Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure third-party integrations and webhooks
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Google Calendar</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="googleCalendarEnabled"
                checked={formData.googleCalendar.enabled}
                onChange={(e) => handleChange('googleCalendar', 'enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="googleCalendarEnabled" className="ml-2 text-sm text-gray-900">
                Enable Google Calendar integration
              </label>
            </div>

            {formData.googleCalendar.enabled && (
              <div>
                <label htmlFor="calendarId" className="block text-sm font-medium text-gray-700">
                  Calendar ID
                </label>
                <input
                  type="text"
                  id="calendarId"
                  value={formData.googleCalendar.calendarId}
                  onChange={(e) => handleChange('googleCalendar', 'calendarId', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="primary"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Slack</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="slackEnabled"
                checked={formData.slack.enabled}
                onChange={(e) => handleChange('slack', 'enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="slackEnabled" className="ml-2 text-sm text-gray-900">
                Enable Slack notifications
              </label>
            </div>

            {formData.slack.enabled && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    id="webhookUrl"
                    value={formData.slack.webhookUrl}
                    onChange={(e) => handleChange('slack', 'webhookUrl', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div>
                  <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
                    Channel
                  </label>
                  <input
                    type="text"
                    id="channel"
                    value={formData.slack.channel}
                    onChange={(e) => handleChange('slack', 'channel', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="#general"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Webhooks</h3>
          
          <div className="text-sm text-gray-600">
            <p>Webhook configuration coming soon...</p>
            <p>You'll be able to configure custom webhooks for various CRM events.</p>
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

export default IntegrationSettings;
