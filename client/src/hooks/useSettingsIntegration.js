import { useSettings, useSetting } from '../contexts/SettingsContext';
import { formatCurrency, formatDate, formatTime, formatDateTime } from '../utils/settingsUtils';

// Hook to get settings with automatic integration
export const useSettingsIntegration = () => {
  const { settings, loading } = useSettings();
  
  return {
    settings,
    loading,
    
    // General settings
    crmName: useSetting('general.crmName', 'My CRM'),
    timezone: useSetting('general.timezone', 'UTC'),
    dateFormat: useSetting('general.dateFormat', 'MM/DD/YYYY'),
    timeFormat: useSetting('general.timeFormat', '12h'),
    currency: useSetting('general.currency', 'USD'),
    language: useSetting('general.language', 'en'),
    
    // Deal settings
    defaultDealCurrency: useSetting('deals.defaultCurrency', 'USD'),
    defaultDealProbability: useSetting('deals.defaultProbability', 50),
    
    // Task settings
    defaultTaskPriority: useSetting('tasks.defaultPriority', 'medium'),
    defaultTaskType: useSetting('tasks.defaultType', 'follow-up'),
    taskAutoReminders: useSetting('tasks.autoReminders', { enabled: true, beforeDue: 24 }),
    timeTrackingEnabled: useSetting('tasks.timeTracking.enabled', false),
    
    // Lead settings
    leadAutoAssignment: useSetting('leads.autoAssign', { enabled: false, assignTo: null }),
    leadScoring: useSetting('leads.leadScoring', { enabled: false, scoreWeights: { email: 10, phone: 15, company: 20, source: 5 } }),
    duplicateDetection: useSetting('leads.duplicateDetection', { enabled: true, checkFields: ['email', 'phone'] }),
    
    // Notification settings
    emailNotifications: useSetting('notifications.emailNotifications', {
      enabled: true,
      newLead: true,
      newCustomer: true,
      newDeal: true,
      dealUpdate: true,
      taskAssigned: true,
      taskDue: true,
      taskOverdue: true,
      eventReminder: true
    }),
    inAppNotifications: useSetting('notifications.inAppNotifications', {
      enabled: true,
      soundEnabled: true
    }),
    
    // Calendar settings
    workingHours: useSetting('calendar.workingHours', {
      enabled: true,
      startTime: '09:00',
      endTime: '17:00',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }),
    defaultEventDuration: useSetting('calendar.defaultDuration', 60),
    bufferTime: useSetting('calendar.bufferTime', 15),
    timeSlots: useSetting('calendar.timeSlots', 30),
    
    // Email settings
    emailConfig: useSetting('email', {
      fromName: 'CRM System',
      fromEmail: '',
      replyToEmail: '',
      emailSignature: '',
      autoResponder: {
        enabled: false,
        subject: 'Thank you for your inquiry',
        message: 'We have received your message and will get back to you soon.'
      }
    }),
    
    // Security settings
    sessionTimeout: useSetting('security.sessionTimeout', 480),
    passwordPolicy: useSetting('security.passwordPolicy', {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }),
    twoFactorEnabled: useSetting('security.twoFactorAuth.enabled', false),
    ipWhitelist: useSetting('security.ipWhitelist', []),
    
    // Integration settings
    integrations: useSetting('integrations', {
      googleCalendar: { enabled: false, calendarId: '' },
      slack: { enabled: false, webhookUrl: '', channel: '' },
      webhooks: []
    }),
    
    // Backup settings
    backupSettings: useSetting('backup', {
      autoBackup: {
        enabled: false,
        frequency: 'weekly',
        retentionDays: 30
      }
    }),
    
    // Analytics settings
    analyticsSettings: useSetting('analytics', {
      trackingEnabled: true,
      dataRetention: 365,
      reports: {
        autoGenerate: false,
        frequency: 'weekly'
      }
    }),
    
    // Custom fields
    customFields: useSetting('customFields', {
      leads: [],
      customers: [],
      deals: [],
      companies: []
    }),
    
    // Utility functions
    formatCurrency: (amount) => formatCurrency(amount, settings),
    formatDate: (date) => formatDate(date, settings),
    formatTime: (date) => formatTime(date, settings),
    formatDateTime: (date) => formatDateTime(date, settings),
    
    // Helper functions
    isEmailNotificationEnabled: (type) => {
      const emailNotifications = useSetting('notifications.emailNotifications', {});
      return emailNotifications.enabled && emailNotifications[type];
    },
    
    isInAppNotificationEnabled: () => {
      return useSetting('notifications.inAppNotifications.enabled', true);
    },
    
    isSoundNotificationEnabled: () => {
      return useSetting('notifications.inAppNotifications.soundEnabled', true);
    },
    
    getDefaultDealData: () => ({
      currency: useSetting('deals.defaultCurrency', 'USD'),
      probability: useSetting('deals.defaultProbability', 50),
      stage: null // This would come from pipeline settings
    }),
    
    getDefaultTaskData: () => ({
      priority: useSetting('tasks.defaultPriority', 'medium'),
      type: useSetting('tasks.defaultType', 'follow-up'),
      timeTracking: useSetting('tasks.timeTracking.enabled', false)
    }),
    
    getDefaultLeadData: () => ({
      autoAssign: useSetting('leads.autoAssign.enabled', false) ? useSetting('leads.autoAssign.assignTo', null) : null,
      scoring: useSetting('leads.leadScoring.enabled', false)
    }),
    
    getWorkingDays: () => {
      const workingHours = useSetting('calendar.workingHours', {});
      return workingHours.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    },
    
    isWorkingDay: (date) => {
      const workingDays = useSetting('calendar.workingHours.workingDays', []);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      return workingDays.includes(dayName);
    },
    
    getWorkingHours: () => {
      const workingHours = useSetting('calendar.workingHours', {});
      return {
        start: workingHours.startTime || '09:00',
        end: workingHours.endTime || '17:00',
        enabled: workingHours.enabled || true
      };
    }
  };
};
