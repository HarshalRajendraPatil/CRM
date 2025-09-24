import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const GeneralSettings = ({ settings, onUpdate, onUnsavedChange, timezones, currencies, updating }) => {
  const [formData, setFormData] = useState({
    crmName: '',
    crmDescription: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    language: 'en'
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.general) {
      setFormData({
        crmName: settings.general.crmName || '',
        crmDescription: settings.general.crmDescription || '',
        timezone: settings.general.timezone || 'UTC',
        dateFormat: settings.general.dateFormat || 'MM/DD/YYYY',
        timeFormat: settings.general.timeFormat || '12h',
        currency: settings.general.currency || 'USD',
        language: settings.general.language || 'en'
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

  const handleSave = async () => {
    try {
      await onUpdate('general', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save general settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.general) {
      setFormData({
        crmName: settings.general.crmName || '',
        crmDescription: settings.general.crmDescription || '',
        timezone: settings.general.timezone || 'UTC',
        dateFormat: settings.general.dateFormat || 'MM/DD/YYYY',
        timeFormat: settings.general.timeFormat || '12h',
        currency: settings.general.currency || 'USD',
        language: settings.general.language || 'en'
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure basic CRM information and display preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* CRM Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CRM Information</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="crmName" className="block text-sm font-medium text-gray-700">
                CRM Name *
              </label>
              <input
                type="text"
                id="crmName"
                value={formData.crmName}
                onChange={(e) => handleChange('crmName', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter CRM name"
                maxLength={100}
              />
              <p className="mt-1 text-xs text-gray-500">
                This name will be displayed throughout your CRM
              </p>
            </div>

            <div>
              <label htmlFor="crmDescription" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="crmDescription"
                value={formData.crmDescription}
                onChange={(e) => handleChange('crmDescription', e.target.value)}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter a description for your CRM"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.crmDescription.length}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {currencies.map((curr) => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                Date Format
              </label>
              <select
                id="dateFormat"
                value={formData.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
                Time Format
              </label>
              <select
                id="timeFormat"
                value={formData.timeFormat}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Language</h3>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Interface Language
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
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
            disabled={updating || !formData.crmName.trim()}
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

export default GeneralSettings;
