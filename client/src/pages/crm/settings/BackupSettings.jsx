import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, CloudIcon } from '@heroicons/react/24/outline';

const BackupSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    autoBackup: {
      enabled: false,
      frequency: 'weekly',
      retentionDays: 30
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.backup) {
      setFormData({
        autoBackup: {
          enabled: settings.backup.autoBackup?.enabled ?? false,
          frequency: settings.backup.autoBackup?.frequency || 'weekly',
          retentionDays: settings.backup.autoBackup?.retentionDays || 30
        }
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      autoBackup: {
        ...prev.autoBackup,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate('backup', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save backup settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.backup) {
      setFormData({
        autoBackup: {
          enabled: settings.backup.autoBackup?.enabled ?? false,
          frequency: settings.backup.autoBackup?.frequency || 'weekly',
          retentionDays: settings.backup.autoBackup?.retentionDays || 30
        }
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Backup Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure automated backups and data retention
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Automated Backups</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoBackupEnabled"
                checked={formData.autoBackup.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="autoBackupEnabled" className="ml-2 text-sm text-gray-900">
                Enable automated backups
              </label>
            </div>

            {formData.autoBackup.enabled && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                    Backup Frequency
                  </label>
                  <select
                    id="frequency"
                    value={formData.autoBackup.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="retentionDays" className="block text-sm font-medium text-gray-700">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    id="retentionDays"
                    value={formData.autoBackup.retentionDays}
                    onChange={(e) => handleChange('retentionDays', parseInt(e.target.value))}
                    min="1"
                    max="365"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Backup</h3>
          
          <div className="text-sm text-gray-600">
            <p>Manual backup functionality coming soon...</p>
            <p>You'll be able to create on-demand backups and download them.</p>
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

export default BackupSettings;
