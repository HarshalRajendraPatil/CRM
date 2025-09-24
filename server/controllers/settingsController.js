import CrmSettings from '../models/CrmSettings.model.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';

// Get CRM settings
export const getCrmSettings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user } = req;

    // Check if user has access to this project
    const project = user.allTenants.find(p => p.toString() === projectId);
    if (!project) {
      throw new AppError('Access denied to this project', 403);
    }

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
        security: {
          sessionTimeout: 480,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        }
      });
      
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting CRM settings:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get CRM settings'
    });
  }
};

// Update CRM settings
export const updateCrmSettings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user } = req;
    const updateData = req.body;

    // Check if user has access to this project
    const project = user.allTenants.find(p => p.toString() === projectId);
    if (!project) {
      throw new AppError('Access denied to this project', 403);
    }

    // Check if user has manager or admin role
    if (!['manager', 'admin', 'owner'].includes(project.role)) {
      throw new AppError('Insufficient permissions to update settings', 403);
    }

    // Validate settings data
    validateSettingsData(updateData);

    let settings = await CrmSettings.findOne({ projectId });
    
    if (!settings) {
      settings = new CrmSettings({ projectId });
    }

    // Update settings
    Object.keys(updateData).forEach(section => {
      if (settings.schema.paths[section]) {
        settings[section] = { ...settings[section], ...updateData[section] };
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating CRM settings:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update CRM settings'
    });
  }
};

// Update specific setting section
export const updateSettingSection = async (req, res) => {
  try {
    const { projectId, section } = req.params;
    const { user } = req;
    const updateData = req.body;

    // Check if user has access to this project
    const project = user.allTenants.find(p => p.toString() === projectId);
    if (!project) {
      throw new AppError('Access denied to this project', 403);
    }

    // Check if user has manager or admin role
    if (!['manager', 'admin', 'owner'].includes(project.role)) {
      throw new AppError('Insufficient permissions to update settings', 403);
    }

    // Validate section exists
    const validSections = ['general', 'email', 'notifications', 'leads', 'deals', 'tasks', 'calendar', 'security', 'integrations', 'customFields', 'backup', 'analytics'];
    if (!validSections.includes(section)) {
      throw new ValidationError('Invalid settings section');
    }

    let settings = await CrmSettings.findOne({ projectId });
    
    if (!settings) {
      settings = new CrmSettings({ projectId });
    }

    // Update specific section
    settings[section] = { ...settings[section], ...updateData };
    await settings.save();

    res.json({
      success: true,
      message: `${section} settings updated successfully`,
      data: settings[section]
    });
  } catch (error) {
    console.error('Error updating setting section:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update settings section'
    });
  }
};

// Reset settings to default
export const resetSettings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user } = req;

    // Check if user has access to this project
    const project = user.allTenants.find(p => p.toString() === projectId);
    if (!project) {
      throw new AppError('Access denied to this project', 403);
    }

    // Check if user has admin or owner role
    if (!['admin', 'owner'].includes(project.role)) {
      throw new AppError('Insufficient permissions to reset settings', 403);
    }

    // Delete existing settings
    await CrmSettings.findOneAndDelete({ projectId });

    // Create new default settings
    const defaultSettings = new CrmSettings({
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
      security: {
        sessionTimeout: 480,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        }
      }
    });

    await defaultSettings.save();

    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to reset settings'
    });
  }
};

// Get available timezones
export const getTimezones = async (req, res) => {
  try {
    const timezones = [
      { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'Europe/London', label: 'London (GMT/BST)' },
      { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
      { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
      { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
      { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
      { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
    ];

    res.json({
      success: true,
      data: timezones
    });
  } catch (error) {
    console.error('Error getting timezones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timezones'
    });
  }
};

// Get available currencies
export const getCurrencies = async (req, res) => {
  try {
    const currencies = [
      { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
      { value: 'EUR', label: 'Euro (€)', symbol: '€' },
      { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
      { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
      { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
      { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
      { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF' },
      { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
      { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
      { value: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$' }
    ];

    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Error getting currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get currencies'
    });
  }
};

// Validate settings data
const validateSettingsData = (data) => {
  const errors = [];

  // Validate general settings
  if (data.general) {
    if (data.general.crmName && data.general.crmName.length > 100) {
      errors.push('CRM name must be 100 characters or less');
    }
    if (data.general.crmDescription && data.general.crmDescription.length > 500) {
      errors.push('CRM description must be 500 characters or less');
    }
    if (data.general.dateFormat && !['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(data.general.dateFormat)) {
      errors.push('Invalid date format');
    }
    if (data.general.timeFormat && !['12h', '24h'].includes(data.general.timeFormat)) {
      errors.push('Invalid time format');
    }
  }

  // Validate email settings
  if (data.email) {
    if (data.email.fromEmail && !isValidEmail(data.email.fromEmail)) {
      errors.push('Invalid from email address');
    }
    if (data.email.replyToEmail && !isValidEmail(data.email.replyToEmail)) {
      errors.push('Invalid reply-to email address');
    }
  }

  // Validate security settings
  if (data.security) {
    if (data.security.sessionTimeout && (data.security.sessionTimeout < 30 || data.security.sessionTimeout > 1440)) {
      errors.push('Session timeout must be between 30 and 1440 minutes');
    }
    if (data.security.passwordPolicy) {
      if (data.security.passwordPolicy.minLength && (data.security.passwordPolicy.minLength < 6 || data.security.passwordPolicy.minLength > 50)) {
        errors.push('Password minimum length must be between 6 and 50 characters');
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
