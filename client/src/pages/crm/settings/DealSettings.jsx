import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const DealSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    defaultCurrency: 'USD',
    defaultProbability: 50,
    autoClose: {
      enabled: false,
      daysAfterCloseDate: 30
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.deals) {
      setFormData({
        defaultCurrency: settings.deals.defaultCurrency || 'USD',
        defaultProbability: settings.deals.defaultProbability || 50,
        autoClose: {
          enabled: settings.deals.autoClose?.enabled ?? false,
          daysAfterCloseDate: settings.deals.autoClose?.daysAfterCloseDate || 30
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

  const handleAutoCloseChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      autoClose: {
        ...prev.autoClose,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate('deals', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save deal settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.deals) {
      setFormData({
        defaultCurrency: settings.deals.defaultCurrency || 'USD',
        defaultProbability: settings.deals.defaultProbability || 50,
        autoClose: {
          enabled: settings.deals.autoClose?.enabled ?? false,
          daysAfterCloseDate: settings.deals.autoClose?.daysAfterCloseDate || 30
        }
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Deal Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure deal management and automation
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Default Values</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700">
                Default Currency
              </label>
              <select
                id="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label htmlFor="defaultProbability" className="block text-sm font-medium text-gray-700">
                Default Probability (%)
              </label>
              <input
                type="number"
                id="defaultProbability"
                value={formData.defaultProbability}
                onChange={(e) => handleChange('defaultProbability', parseInt(e.target.value))}
                min="0"
                max="100"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Auto Close</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoCloseEnabled"
                checked={formData.autoClose.enabled}
                onChange={(e) => handleAutoCloseChange('enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="autoCloseEnabled" className="ml-2 text-sm text-gray-900">
                Automatically close deals after close date
              </label>
            </div>

            {formData.autoClose.enabled && (
              <div>
                <label htmlFor="daysAfterCloseDate" className="block text-sm font-medium text-gray-700">
                  Days after close date
                </label>
                <input
                  type="number"
                  id="daysAfterCloseDate"
                  value={formData.autoClose.daysAfterCloseDate}
                  onChange={(e) => handleAutoCloseChange('daysAfterCloseDate', parseInt(e.target.value))}
                  min="1"
                  max="365"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
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

export default DealSettings;
