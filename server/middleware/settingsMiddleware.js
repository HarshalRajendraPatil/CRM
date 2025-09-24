import CrmSettings from '../models/CrmSettings.model.js';

// Middleware to inject CRM settings into request object
export const injectSettings = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return next();
    }
    
    // Get CRM settings for this project
    let settings = await CrmSettings.findOne({ projectId });
    
    if (!settings) {
      // Create default settings if they don't exist
      settings = new CrmSettings({
        projectId,
        general: {
          crmName: 'My CRM',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          currency: 'USD',
          language: 'en'
        },
        notifications: {
          emailNotifications: {
            enabled: true,
            newLead: true,
            newCustomer: true,
            newDeal: true,
            dealUpdate: true,
            taskAssigned: true,
            taskDue: true,
            taskOverdue: true,
            eventReminder: true
          },
          inAppNotifications: {
            enabled: true,
            soundEnabled: true
          }
        },
        leads: {
          duplicateDetection: {
            enabled: true,
            checkFields: ['email', 'phone']
          }
        },
        deals: {
          defaultCurrency: 'USD',
          defaultProbability: 50
        },
        tasks: {
          defaultPriority: 'medium',
          defaultType: 'follow-up',
          autoReminders: {
            enabled: true,
            beforeDue: 24
          }
        },
        calendar: {
          workingHours: {
            enabled: true,
            startTime: '09:00',
            endTime: '17:00',
            workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          },
          defaultDuration: 60,
          bufferTime: 15,
          timeSlots: 30
        },
        email: {
          fromName: 'CRM System',
          fromEmail: '',
          replyToEmail: '',
          emailSignature: '',
          autoResponder: {
            enabled: false,
            subject: 'Thank you for your inquiry',
            message: 'We have received your message and will get back to you soon.'
          }
        },
        security: {
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
        },
        integrations: {
          googleCalendar: {
            enabled: false,
            calendarId: ''
          },
          slack: {
            enabled: false,
            webhookUrl: '',
            channel: ''
          },
          webhooks: []
        },
        backup: {
          autoBackup: {
            enabled: false,
            frequency: 'weekly',
            retentionDays: 30
          }
        },
        analytics: {
          trackingEnabled: true,
          dataRetention: 365,
          reports: {
            autoGenerate: false,
            frequency: 'weekly'
          }
        },
        customFields: {
          leads: [],
          customers: [],
          deals: [],
          companies: []
        }
      });
      
      await settings.save();
    }
    
    // Attach settings to request object
    req.settings = settings;
    next();
  } catch (error) {
    console.error('Error injecting settings:', error);
    next();
  }
};

// Middleware to apply settings to responses
export const applySettingsToResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Apply settings transformations to response data
    if (data && req.settings) {
      // Format currency values
      if (data.deals) {
        data.deals = data.deals.map(deal => ({
          ...deal,
          formattedValue: formatCurrency(deal.value, req.settings.general.currency)
        }));
      }
      
      // Format date values
      if (data.tasks) {
        data.tasks = data.tasks.map(task => ({
          ...task,
          formattedDueDate: formatDate(task.dueDate, req.settings.general.dateFormat)
        }));
      }
      
      // Apply notification settings
      if (data.notifications) {
        data.notifications = data.notifications.filter(notification => {
          const emailNotifications = req.settings.notifications.emailNotifications;
          return emailNotifications.enabled && emailNotifications[notification.type];
        });
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Helper function to format currency
const formatCurrency = (amount, currency) => {
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

// Helper function to format date
const formatDate = (date, format) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  switch (format) {
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

// Middleware to validate settings-based business rules
export const validateBusinessRules = (req, res, next) => {
  if (!req.settings) {
    return next();
  }
  
  const settings = req.settings;
  
  // Validate lead duplicate detection
  if (req.body && req.body.email && settings.leads.duplicateDetection.enabled) {
    // This would be handled in the lead controller
    req.duplicateCheckFields = settings.leads.duplicateDetection.checkFields;
  }
  
  // Validate working hours for calendar events
  if (req.body && req.body.startTime && settings.calendar.workingHours.enabled) {
    const startTime = req.body.startTime;
    const workingStart = settings.calendar.workingHours.startTime;
    const workingEnd = settings.calendar.workingHours.endTime;
    
    if (startTime < workingStart || startTime > workingEnd) {
      return res.status(400).json({
        success: false,
        message: 'Event time is outside working hours',
        workingHours: {
          start: workingStart,
          end: workingEnd
        }
      });
    }
  }
  
  // Validate password policy
  if (req.body && req.body.password && settings.security.passwordPolicy) {
    const password = req.body.password;
    const policy = settings.security.passwordPolicy;
    
    if (password.length < policy.minLength) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${policy.minLength} characters long`
      });
    }
    
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter'
      });
    }
    
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter'
      });
    }
    
    if (policy.requireNumbers && !/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number'
      });
    }
    
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one special character'
      });
    }
  }
  
  next();
};

// Middleware to apply default values based on settings
export const applyDefaultValues = (req, res, next) => {
  if (!req.settings) {
    return next();
  }
  
  const settings = req.settings;
  
  // Apply default values for deals
  if (req.body && req.route.path.includes('/deals')) {
    if (!req.body.currency) {
      req.body.currency = settings.deals.defaultCurrency;
    }
    if (!req.body.probability) {
      req.body.probability = settings.deals.defaultProbability;
    }
  }
  
  // Apply default values for tasks
  if (req.body && req.route.path.includes('/tasks')) {
    if (!req.body.priority) {
      req.body.priority = settings.tasks.defaultPriority;
    }
    if (!req.body.type) {
      req.body.type = settings.tasks.defaultType;
    }
  }
  
  // Apply default values for leads
  if (req.body && req.route.path.includes('/leads')) {
    if (settings.leads.autoAssign.enabled && !req.body.assignedTo) {
      req.body.assignedTo = settings.leads.autoAssign.assignTo;
    }
    if (settings.leads.leadScoring.enabled && req.body.score === undefined) {
      req.body.score = 0;
    }
  }
  
  // Apply default values for calendar events
  if (req.body && req.route.path.includes('/calendar')) {
    if (!req.body.duration) {
      req.body.duration = settings.calendar.defaultDuration;
    }
  }
  
  next();
};

// Middleware to check notification settings
export const checkNotificationSettings = (req, res, next) => {
  if (!req.settings) {
    return next();
  }
  
  const settings = req.settings;
  
  // Attach notification settings to request
  req.notificationSettings = {
    email: settings.notifications.emailNotifications,
    inApp: settings.notifications.inAppNotifications
  };
  
  next();
};
