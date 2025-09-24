import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCrmSettings,
  updateSection,
  resetCrmSettings,
  fetchTimezones,
  fetchCurrencies,
  clearError,
  selectSettings,
  selectSettingsLoading,
  selectSettingsUpdating,
  selectSettingsError,
  selectTimezones,
  selectCurrencies
} from '../../store/settingsSlice';
import { 
  CogIcon, 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon,
  CalendarIcon,
  CpuChipIcon,
  CloudIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Import tab components
import GeneralSettings from './settings/GeneralSettings';
import EmailSettings from './settings/EmailSettings';
import NotificationSettings from './settings/NotificationSettings';
import LeadSettings from './settings/LeadSettings';
import DealSettings from './settings/DealSettings';
import TaskSettings from './settings/TaskSettings';
import CalendarSettings from './settings/CalendarSettings';
import SecuritySettings from './settings/SecuritySettings';
import IntegrationSettings from './settings/IntegrationSettings';
import CustomFieldsSettings from './settings/CustomFieldsSettings';
import BackupSettings from './settings/BackupSettings';
import AnalyticsSettings from './settings/AnalyticsSettings';
import CrmLayout from '../../layouts/CrmLayout';

const Settings = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  
  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);
  const updating = useSelector(selectSettingsUpdating);
  const error = useSelector(selectSettingsError);
  const timezones = useSelector(selectTimezones);
  const currencies = useSelector(selectCurrencies);

  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Tab configuration
  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'email', name: 'Email', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'leads', name: 'Leads', icon: UserIcon },
    { id: 'deals', name: 'Deals', icon: ChartBarIcon },
    { id: 'tasks', name: 'Tasks', icon: CheckCircleIcon },
    { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'integrations', name: 'Integrations', icon: CpuChipIcon },
    { id: 'custom-fields', name: 'Custom Fields', icon: CogIcon },
    { id: 'backup', name: 'Backup', icon: CloudIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
  ];

  useEffect(() => {
    if (projectId) {
      dispatch(fetchCrmSettings(projectId));
      dispatch(fetchTimezones());
      dispatch(fetchCurrencies());
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave this tab?');
      if (!confirmLeave) return;
    }
    setActiveTab(tabId);
    setHasUnsavedChanges(false);
  };

  const handleSectionUpdate = async (section, data) => {
    try {
      await dispatch(updateSection({ projectId, section, sectionData: data })).unwrap();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleResetSettings = async () => {
    try {
      await dispatch(resetCrmSettings(projectId)).unwrap();
      setShowResetConfirm(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const renderTabContent = () => {
    const commonProps = {
      settings: settings,
      onUpdate: handleSectionUpdate,
      onUnsavedChange: setHasUnsavedChanges,
      timezones,
      currencies,
      updating
    };

    switch (activeTab) {
      case 'general':
        return <GeneralSettings {...commonProps} />;
      case 'email':
        return <EmailSettings {...commonProps} />;
      case 'notifications':
        return <NotificationSettings {...commonProps} />;
      case 'leads':
        return <LeadSettings {...commonProps} />;
      case 'deals':
        return <DealSettings {...commonProps} />;
      case 'tasks':
        return <TaskSettings {...commonProps} />;
      case 'calendar':
        return <CalendarSettings {...commonProps} />;
      case 'security':
        return <SecuritySettings {...commonProps} />;
      case 'integrations':
        return <IntegrationSettings {...commonProps} />;
      case 'custom-fields':
        return <CustomFieldsSettings {...commonProps} />;
      case 'backup':
        return <BackupSettings {...commonProps} />;
      case 'analytics':
        return <AnalyticsSettings {...commonProps} />;
      default:
        return <GeneralSettings {...commonProps} />;
    }
  };

  return (
    <CrmLayout>
      {loading ? <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div> : <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CRM Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure your CRM preferences and system settings
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="flex">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-gray-50 rounded-l-lg">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>

              {/* Reset Settings Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <ExclamationTriangleIcon className="mr-2 h-4 w-4" />
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <ExclamationTriangleIcon className="mx-auto flex items-center justify-center h-12 w-12 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">Reset Settings</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to reset all settings to their default values? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleResetSettings}
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {updating ? 'Resetting...' : 'Reset Settings'}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="ml-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>}
    </CrmLayout>
  );
};

export default Settings;
