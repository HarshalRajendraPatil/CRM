import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const CustomFieldsSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    leads: [],
    customers: [],
    deals: [],
    companies: []
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.customFields) {
      setFormData({
        leads: settings.customFields.leads || [],
        customers: settings.customFields.customers || [],
        deals: settings.customFields.deals || [],
        companies: settings.customFields.companies || []
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await onUpdate('customFields', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save custom fields settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.customFields) {
      setFormData({
        leads: settings.customFields.leads || [],
        customers: settings.customFields.customers || [],
        deals: settings.customFields.deals || [],
        companies: settings.customFields.companies || []
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Custom Fields</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure custom fields for different entities
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Fields Configuration</h3>
          
          <div className="text-sm text-gray-600">
            <p>Custom fields configuration coming soon...</p>
            <p>You'll be able to create custom fields for leads, customers, deals, and companies.</p>
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

export default CustomFieldsSettings;
