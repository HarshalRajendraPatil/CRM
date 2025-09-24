import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const AnalyticsSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    trackingEnabled: true,
    dataRetention: 365,
    reports: {
      autoGenerate: false,
      frequency: 'weekly'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.analytics) {
      setFormData({
        trackingEnabled: settings.analytics.trackingEnabled ?? true,
        dataRetention: settings.analytics.dataRetention || 365,
        reports: {
          autoGenerate: settings.analytics.reports?.autoGenerate ?? false,
          frequency: settings.analytics.reports?.frequency || 'weekly'
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

  const handleReportsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      reports: {
        ...prev.reports,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate('analytics', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save analytics settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.analytics) {
      setFormData({
        trackingEnabled: settings.analytics.trackingEnabled ?? true,
        dataRetention: settings.analytics.dataRetention || 365,
        reports: {
          autoGenerate: settings.analytics.reports?.autoGenerate ?? false,
          frequency: settings.analytics.reports?.frequency || 'weekly'
        }
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Analytics Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure analytics tracking and reporting
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Tracking</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="trackingEnabled"
                checked={formData.trackingEnabled}
                onChange={(e) => handleChange('trackingEnabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="trackingEnabled" className="ml-2 text-sm text-gray-900">
                Enable analytics tracking
              </label>
            </div>

            <div>
              <label htmlFor="dataRetention" className="block text-sm font-medium text-gray-700">
                Data Retention (days)
              </label>
              <input
                type="number"
                id="dataRetention"
                value={formData.dataRetention}
                onChange={(e) => handleChange('dataRetention', parseInt(e.target.value))}
                min="30"
                max="3650"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                How long to keep analytics data (30-3650 days)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Automated Reports</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoGenerate"
                checked={formData.reports.autoGenerate}
                onChange={(e) => handleReportsChange('autoGenerate', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="autoGenerate" className="ml-2 text-sm text-gray-900">
                Enable automated report generation
              </label>
            </div>

            {formData.reports.autoGenerate && (
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                  Report Frequency
                </label>
                <select
                  id="frequency"
                  value={formData.reports.frequency}
                  onChange={(e) => handleReportsChange('frequency', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Overview</h3>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Current Status:</strong> {formData.trackingEnabled ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Data Retention:</strong> {formData.dataRetention} days</p>
            <p><strong>Auto Reports:</strong> {formData.reports.autoGenerate ? 'Enabled' : 'Disabled'}</p>
            {formData.reports.autoGenerate && (
              <p><strong>Report Frequency:</strong> {formData.reports.frequency}</p>
            )}
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

export default AnalyticsSettings;
