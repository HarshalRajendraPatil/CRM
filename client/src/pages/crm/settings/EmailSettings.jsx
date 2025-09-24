import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const EmailSettings = ({ settings, onUpdate, onUnsavedChange, updating }) => {
  const [formData, setFormData] = useState({
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    emailSignature: '',
    autoResponder: {
      enabled: false,
      subject: '',
      message: ''
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.email) {
      setFormData({
        fromName: settings.email.fromName || '',
        fromEmail: settings.email.fromEmail || '',
        replyToEmail: settings.email.replyToEmail || '',
        emailSignature: settings.email.emailSignature || '',
        autoResponder: {
          enabled: settings.email.autoResponder?.enabled || false,
          subject: settings.email.autoResponder?.subject || '',
          message: settings.email.autoResponder?.message || ''
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

  const handleAutoResponderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      autoResponder: {
        ...prev.autoResponder,
        [field]: value
      }
    }));
    setHasChanges(true);
    onUnsavedChange(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate('email', formData);
      setHasChanges(false);
      onUnsavedChange(false);
    } catch (error) {
      console.error('Failed to save email settings:', error);
    }
  };

  const handleCancel = () => {
    if (settings?.email) {
      setFormData({
        fromName: settings.email.fromName || '',
        fromEmail: settings.email.fromEmail || '',
        replyToEmail: settings.email.replyToEmail || '',
        emailSignature: settings.email.emailSignature || '',
        autoResponder: {
          enabled: settings.email.autoResponder?.enabled || false,
          subject: settings.email.autoResponder?.subject || '',
          message: settings.email.autoResponder?.message || ''
        }
      });
    }
    setHasChanges(false);
    onUnsavedChange(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Email Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure email preferences and automated responses
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Configuration */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="fromName" className="block text-sm font-medium text-gray-700">
                From Name
              </label>
              <input
                type="text"
                id="fromName"
                value={formData.fromName}
                onChange={(e) => handleChange('fromName', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="CRM System"
              />
              <p className="mt-1 text-xs text-gray-500">
                The name that appears in outgoing emails
              </p>
            </div>

            <div>
              <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">
                From Email Address
              </label>
              <input
                type="email"
                id="fromEmail"
                value={formData.fromEmail}
                onChange={(e) => handleChange('fromEmail', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  formData.fromEmail && !validateEmail(formData.fromEmail) ? 'border-red-300' : ''
                }`}
                placeholder="noreply@yourcompany.com"
              />
              {formData.fromEmail && !validateEmail(formData.fromEmail) && (
                <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label htmlFor="replyToEmail" className="block text-sm font-medium text-gray-700">
                Reply-To Email Address
              </label>
              <input
                type="email"
                id="replyToEmail"
                value={formData.replyToEmail}
                onChange={(e) => handleChange('replyToEmail', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  formData.replyToEmail && !validateEmail(formData.replyToEmail) ? 'border-red-300' : ''
                }`}
                placeholder="support@yourcompany.com"
              />
              {formData.replyToEmail && !validateEmail(formData.replyToEmail) && (
                <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
              )}
            </div>
          </div>
        </div>

        {/* Email Signature */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Signature</h3>
          
          <div>
            <label htmlFor="emailSignature" className="block text-sm font-medium text-gray-700">
              Default Email Signature
            </label>
            <textarea
              id="emailSignature"
              value={formData.emailSignature}
              onChange={(e) => handleChange('emailSignature', e.target.value)}
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Best regards,&#10;Your Name&#10;Your Company"
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.emailSignature.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Auto-Responder */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-Responder</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoResponderEnabled"
                checked={formData.autoResponder.enabled}
                onChange={(e) => handleAutoResponderChange('enabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="autoResponderEnabled" className="ml-2 block text-sm text-gray-900">
                Enable auto-responder for incoming emails
              </label>
            </div>

            {formData.autoResponder.enabled && (
              <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
                <div>
                  <label htmlFor="autoResponderSubject" className="block text-sm font-medium text-gray-700">
                    Auto-Responder Subject
                  </label>
                  <input
                    type="text"
                    id="autoResponderSubject"
                    value={formData.autoResponder.subject}
                    onChange={(e) => handleAutoResponderChange('subject', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Thank you for your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="autoResponderMessage" className="block text-sm font-medium text-gray-700">
                    Auto-Responder Message
                  </label>
                  <textarea
                    id="autoResponderMessage"
                    value={formData.autoResponder.message}
                    onChange={(e) => handleAutoResponderChange('message', e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="We have received your message and will get back to you soon."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Preview</h3>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">Sample Email</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>From:</strong> {formData.fromName || 'CRM System'} &lt;{formData.fromEmail || 'noreply@example.com'}&gt;</p>
              <p><strong>Reply-To:</strong> {formData.replyToEmail || 'support@example.com'}</p>
              <p><strong>Subject:</strong> Welcome to our CRM</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p>Hello,</p>
                <p className="mt-2">Thank you for using our CRM system.</p>
                {formData.emailSignature && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="whitespace-pre-line">{formData.emailSignature}</p>
                  </div>
                )}
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

export default EmailSettings;
