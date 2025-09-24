import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

const LeadSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    autoAssign: {
      enabled: false,
      assignTo: ''
    },
    leadScoring: {
      enabled: false,
      scoreWeights: {
        email: 10,
        phone: 15,
        company: 20,
        source: 5
      }
    },
    duplicateDetection: {
      enabled: true,
      checkFields: ['email', 'phone']
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.leads) {
      setFormData({
        autoAssign: {
          enabled: settings.leads.autoAssign?.enabled ?? false,
          assignTo: settings.leads.autoAssign?.assignTo || ''
        },
        leadScoring: {
          enabled: settings.leads.leadScoring?.enabled ?? false,
          scoreWeights: {
            email: settings.leads.leadScoring?.scoreWeights?.email || 10,
            phone: settings.leads.leadScoring?.scoreWeights?.phone || 15,
            company: settings.leads.leadScoring?.scoreWeights?.company || 20,
            source: settings.leads.leadScoring?.scoreWeights?.source || 5
          }
        },
        duplicateDetection: {
          enabled: settings.leads.duplicateDetection?.enabled ?? true,
          checkFields: settings.leads.duplicateDetection?.checkFields || ['email', 'phone']
        }
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
      await onUpdate('leads', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save lead settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.leads) {
      setFormData({
        autoAssign: {
          enabled: settings.leads.autoAssign?.enabled ?? false,
          assignTo: settings.leads.autoAssign?.assignTo || ''
        },
        leadScoring: {
          enabled: settings.leads.leadScoring?.enabled ?? false,
          scoreWeights: {
            email: settings.leads.leadScoring?.scoreWeights?.email || 10,
            phone: settings.leads.leadScoring?.scoreWeights?.phone || 15,
            company: settings.leads.leadScoring?.scoreWeights?.company || 20,
            source: settings.leads.leadScoring?.scoreWeights?.source || 5
          }
        },
        duplicateDetection: {
          enabled: settings.leads.duplicateDetection?.enabled ?? true,
          checkFields: settings.leads.duplicateDetection?.checkFields || ['email', 'phone']
        }
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Lead Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure lead management and automation
        </p>
      </div>

      <div className="space-y-6">
        {/* Auto Assignment */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Auto Assignment</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoAssignEnabled"
                checked={formData.autoAssign.enabled}
                onChange={(e) => handleChange('autoAssign', 'enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="autoAssignEnabled" className="ml-2 text-sm text-gray-900">
                Automatically assign new leads
              </label>
            </div>

            {formData.autoAssign.enabled && (
              <div>
                <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700">
                  Assign to User
                </label>
                <select
                  id="assignTo"
                  value={formData.autoAssign.assignTo}
                  onChange={(e) => handleChange('autoAssign', 'assignTo', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a user...</option>
                  {/* This would be populated with actual users */}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Lead Scoring */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Scoring</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="leadScoringEnabled"
                checked={formData.leadScoring.enabled}
                onChange={(e) => handleChange('leadScoring', 'enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="leadScoringEnabled" className="ml-2 text-sm text-gray-900">
                Enable automatic lead scoring
              </label>
            </div>

            {formData.leadScoring.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Score Weights</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Email</span>
                      <input
                        type="number"
                        value={formData.leadScoring.scoreWeights.email}
                        onChange={(e) => handleChange('leadScoring', 'scoreWeights', {
                          ...formData.leadScoring.scoreWeights,
                          email: parseInt(e.target.value)
                        })}
                        className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Phone</span>
                      <input
                        type="number"
                        value={formData.leadScoring.scoreWeights.phone}
                        onChange={(e) => handleChange('leadScoring', 'scoreWeights', {
                          ...formData.leadScoring.scoreWeights,
                          phone: parseInt(e.target.value)
                        })}
                        className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Company</span>
                      <input
                        type="number"
                        value={formData.leadScoring.scoreWeights.company}
                        onChange={(e) => handleChange('leadScoring', 'scoreWeights', {
                          ...formData.leadScoring.scoreWeights,
                          company: parseInt(e.target.value)
                        })}
                        className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Source</span>
                      <input
                        type="number"
                        value={formData.leadScoring.scoreWeights.source}
                        onChange={(e) => handleChange('leadScoring', 'scoreWeights', {
                          ...formData.leadScoring.scoreWeights,
                          source: parseInt(e.target.value)
                        })}
                        className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Duplicate Detection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Duplicate Detection</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="duplicateDetectionEnabled"
                checked={formData.duplicateDetection.enabled}
                onChange={(e) => handleChange('duplicateDetection', 'enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="duplicateDetectionEnabled" className="ml-2 text-sm text-gray-900">
                Enable duplicate lead detection
              </label>
            </div>

            {formData.duplicateDetection.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check for duplicates based on:
                </label>
                <div className="space-y-2">
                  {['email', 'phone', 'company'].map((field) => (
                    <div key={field} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`check-${field}`}
                        checked={formData.duplicateDetection.checkFields.includes(field)}
                        onChange={(e) => {
                          const newFields = e.target.checked
                            ? [...formData.duplicateDetection.checkFields, field]
                            : formData.duplicateDetection.checkFields.filter(f => f !== field);
                          handleChange('duplicateDetection', 'checkFields', newFields);
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`check-${field}`} className="ml-2 text-sm text-gray-900 capitalize">
                        {field}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

export default LeadSettings;
