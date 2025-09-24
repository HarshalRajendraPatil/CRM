import { useSelector } from 'react-redux';
import { selectSettings } from '../store/settingsSlice';

// Utility functions to apply CRM settings throughout the application

// Format currency based on CRM settings
export const formatCurrency = (amount, settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  const currency = currentSettings?.general?.currency || 'USD';
  
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$'
  };
  
  const symbol = currencySymbols[currency] || '$';
  return `${symbol}${amount.toLocaleString()}`;
};

// Format date based on CRM settings
export const formatDate = (date, settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  const dateFormat = currentSettings?.general?.dateFormat || 'MM/DD/YYYY';
  
  const dateObj = new Date(date);
  
  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return dateObj.toLocaleDateString('en-US');
    case 'DD/MM/YYYY':
      return dateObj.toLocaleDateString('en-GB');
    case 'YYYY-MM-DD':
      return dateObj.toISOString().split('T')[0];
    default:
      return dateObj.toLocaleDateString('en-US');
  }
};

// Format time based on CRM settings
export const formatTime = (date, settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  const timeFormat = currentSettings?.general?.timeFormat || '12h';
  
  const dateObj = new Date(date);
  
  if (timeFormat === '24h') {
    return dateObj.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return dateObj.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

// Format date and time together
export const formatDateTime = (date, settings = null) => {
  return `${formatDate(date, settings)} ${formatTime(date, settings)}`;
};

// Get CRM name for display
export const getCrmName = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.general?.crmName || 'My CRM';
};

// Get default currency
export const getDefaultCurrency = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.general?.currency || 'USD';
};

// Get default deal probability
export const getDefaultDealProbability = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.deals?.defaultProbability || 50;
};

// Get default task priority
export const getDefaultTaskPriority = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.tasks?.defaultPriority || 'medium';
};

// Get default task type
export const getDefaultTaskType = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.tasks?.defaultType || 'follow-up';
};

// Check if email notifications are enabled for a specific type
export const isEmailNotificationEnabled = (notificationType, settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  const emailNotifications = currentSettings?.notifications?.emailNotifications;
  
  if (!emailNotifications?.enabled) return false;
  
  return emailNotifications[notificationType] || false;
};

// Check if in-app notifications are enabled
export const isInAppNotificationEnabled = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.notifications?.inAppNotifications?.enabled || true;
};

// Check if sound notifications are enabled
export const isSoundNotificationEnabled = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.notifications?.inAppNotifications?.soundEnabled || true;
};

// Get working hours
export const getWorkingHours = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.calendar?.workingHours || {
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  };
};

// Get default event duration
export const getDefaultEventDuration = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.calendar?.defaultDuration || 60;
};

// Get timezone
export const getTimezone = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.general?.timezone || 'UTC';
};

// Check if duplicate detection is enabled for leads
export const isDuplicateDetectionEnabled = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.leads?.duplicateDetection?.enabled || true;
};

// Get duplicate detection fields
export const getDuplicateDetectionFields = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.leads?.duplicateDetection?.checkFields || ['email', 'phone'];
};

// Get lead scoring weights
export const getLeadScoringWeights = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.leads?.leadScoring?.scoreWeights || {
    email: 10,
    phone: 15,
    company: 20,
    source: 5
  };
};

// Check if auto-assignment is enabled for leads
export const isLeadAutoAssignmentEnabled = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.leads?.autoAssign?.enabled || false;
};

// Get auto-assignment user for leads
export const getLeadAutoAssignmentUser = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.leads?.autoAssign?.assignTo || null;
};

// Get session timeout
export const getSessionTimeout = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.security?.sessionTimeout || 480; // minutes
};

// Get password policy
export const getPasswordPolicy = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.security?.passwordPolicy || {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  };
};

// Check if two-factor authentication is enabled
export const isTwoFactorEnabled = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.security?.twoFactorAuth?.enabled || false;
};

// Get IP whitelist
export const getIpWhitelist = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.security?.ipWhitelist || [];
};

// Get email configuration
export const getEmailConfig = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.email || {
    fromName: 'CRM System',
    fromEmail: '',
    replyToEmail: '',
    emailSignature: '',
    autoResponder: {
      enabled: false,
      subject: 'Thank you for your inquiry',
      message: 'We have received your message and will get back to you soon.'
    }
  };
};

// Get auto-reminder settings for tasks
export const getTaskAutoReminderSettings = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.tasks?.autoReminders || {
    enabled: true,
    beforeDue: 24
  };
};

// Check if time tracking is enabled for tasks
export const isTimeTrackingEnabled = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.tasks?.timeTracking?.enabled || false;
};

// Get integration settings
export const getIntegrationSettings = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.integrations || {
    googleCalendar: { enabled: false, calendarId: '' },
    slack: { enabled: false, webhookUrl: '', channel: '' },
    webhooks: []
  };
};

// Get backup settings
export const getBackupSettings = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.backup || {
    autoBackup: {
      enabled: false,
      frequency: 'weekly',
      retentionDays: 30
    }
  };
};

// Get analytics settings
export const getAnalyticsSettings = (settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.analytics || {
    trackingEnabled: true,
    dataRetention: 365,
    reports: {
      autoGenerate: false,
      frequency: 'weekly'
    }
  };
};

// Get custom fields for a specific entity type
export const getCustomFields = (entityType, settings = null) => {
  const currentSettings = settings || useSelector(selectSettings);
  return currentSettings?.customFields?.[entityType] || [];
};

// Validate settings and return any issues
export const validateSettings = (settings) => {
  const issues = [];
  
  if (!settings) {
    issues.push('Settings not loaded');
    return issues;
  }
  
  // Validate general settings
  if (settings.general) {
    if (!settings.general.crmName || settings.general.crmName.trim() === '') {
      issues.push('CRM name is required');
    }
    if (settings.general.crmName && settings.general.crmName.length > 100) {
      issues.push('CRM name must be 100 characters or less');
    }
  }
  
  // Validate email settings
  if (settings.email) {
    if (settings.email.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email.fromEmail)) {
      issues.push('Invalid from email address');
    }
    if (settings.email.replyToEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email.replyToEmail)) {
      issues.push('Invalid reply-to email address');
    }
  }
  
  // Validate security settings
  if (settings.security) {
    if (settings.security.sessionTimeout && (settings.security.sessionTimeout < 30 || settings.security.sessionTimeout > 1440)) {
      issues.push('Session timeout must be between 30 and 1440 minutes');
    }
  }
  
  return issues;
};

// Hook to get settings
export const useSettings = () => {
  return useSelector(selectSettings);
};

// Hook to get specific setting value
export const useSetting = (path, defaultValue = null) => {
  const settings = useSelector(selectSettings);
  
  if (!settings) return defaultValue;
  
  const keys = path.split('.');
  let value = settings;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};
