import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const SecuritySettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    sessionTimeout: 480,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    twoFactorAuth: {
      enabled: false
    },
    ipWhitelist: []
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');

  useEffect(() => {
    if (settings?.security) {
      setFormData({
        sessionTimeout: settings.security.sessionTimeout || 480,
        passwordPolicy: {
          minLength: settings.security.passwordPolicy?.minLength || 8,
          requireUppercase: settings.security.passwordPolicy?.requireUppercase ?? true,
          requireLowercase: settings.security.passwordPolicy?.requireLowercase ?? true,
          requireNumbers: settings.security.passwordPolicy?.requireNumbers ?? true,
          requireSpecialChars: settings.security.passwordPolicy?.requireSpecialChars ?? true
        },
        twoFactorAuth: {
          enabled: settings.security.twoFactorAuth?.enabled ?? false
        },
        ipWhitelist: settings.security.ipWhitelist || []
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

  const handlePasswordPolicyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleTwoFactorChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      twoFactorAuth: {
        ...prev.twoFactorAuth,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const addIpAddress = () => {
    if (newIpAddress.trim() && !formData.ipWhitelist.includes(newIpAddress.trim())) {
      setFormData(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIpAddress.trim()]
      }));
      setNewIpAddress('');
      setHasChanges(true);
      onUnsavedChange(true);
    }
  };

  const removeIpAddress = (ip) => {
    setFormData(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(addr => addr !== ip)
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate('security', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save security settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.security) {
      setFormData({
        sessionTimeout: settings.security.sessionTimeout || 480,
        passwordPolicy: {
          minLength: settings.security.passwordPolicy?.minLength || 8,
          requireUppercase: settings.security.passwordPolicy?.requireUppercase ?? true,
          requireLowercase: settings.security.passwordPolicy?.requireLowercase ?? true,
          requireNumbers: settings.security.passwordPolicy?.requireNumbers ?? true,
          requireSpecialChars: settings.security.passwordPolicy?.requireSpecialChars ?? true
        },
        twoFactorAuth: {
          enabled: settings.security.twoFactorAuth?.enabled ?? false
        },
        ipWhitelist: settings.security.ipWhitelist || []
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  const validateIpAddress = (ip) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure security policies and access controls
        </p>
      </div>

      <div className="space-y-6">
        {/* Session Management */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
          
          <div>
            <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              id="sessionTimeout"
              value={formData.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              min="30"
              max="1440"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Users will be automatically logged out after this period of inactivity (30-1440 minutes)
            </p>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="minLength" className="block text-sm font-medium text-gray-700">
                Minimum Length
              </label>
              <input
                type="number"
                id="minLength"
                value={formData.passwordPolicy.minLength}
                onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                min="6"
                max="50"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireUppercase"
                  checked={formData.passwordPolicy.requireUppercase}
                  onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requireUppercase" className="ml-2 text-sm text-gray-900">
                  Require uppercase letters (A-Z)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireLowercase"
                  checked={formData.passwordPolicy.requireLowercase}
                  onChange={(e) => handlePasswordPolicyChange('requireLowercase', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requireLowercase" className="ml-2 text-sm text-gray-900">
                  Require lowercase letters (a-z)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireNumbers"
                  checked={formData.passwordPolicy.requireNumbers}
                  onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requireNumbers" className="ml-2 text-sm text-gray-900">
                  Require numbers (0-9)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireSpecialChars"
                  checked={formData.passwordPolicy.requireSpecialChars}
                  onChange={(e) => handlePasswordPolicyChange('requireSpecialChars', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requireSpecialChars" className="ml-2 text-sm text-gray-900">
                  Require special characters (!@#$%^&*)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                checked={formData.twoFactorAuth.enabled}
                onChange={(e) => handleTwoFactorChange('enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="twoFactorEnabled" className="ml-2 text-sm text-gray-900">
                Enable two-factor authentication
              </label>
            </div>

            {formData.twoFactorAuth.enabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Two-Factor Authentication Active</h4>
                    <p className="mt-1 text-sm text-blue-700">
                      Users will be required to enter a verification code from their authenticator app when logging in.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* IP Whitelist */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">IP Address Whitelist</h3>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                placeholder="Enter IP address (e.g., 192.168.1.1)"
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={addIpAddress}
                disabled={!newIpAddress.trim() || !validateIpAddress(newIpAddress.trim())}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {formData.ipWhitelist.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Allowed IP Addresses</h4>
                {formData.ipWhitelist.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-2">
                    <span className="text-sm text-gray-900">{ip}</span>
                    <button
                      type="button"
                      onClick={() => removeIpAddress(ip)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Restrict access to specific IP addresses. Leave empty to allow all IPs.
            </p>
          </div>
        </div>

        {/* Security Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <LockClosedIcon className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">Session Timeout</div>
                <div className="text-sm text-gray-500">{formData.sessionTimeout} minutes</div>
              </div>
            </div>

            <div className="flex items-center">
              <ShieldCheckIcon className={`h-5 w-5 mr-3 ${formData.twoFactorAuth.enabled ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">
                  {formData.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <LockClosedIcon className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">IP Whitelist</div>
                <div className="text-sm text-gray-500">
                  {formData.ipWhitelist.length} address{formData.ipWhitelist.length !== 1 ? 'es' : ''} configured
                </div>
              </div>
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

export default SecuritySettings;
