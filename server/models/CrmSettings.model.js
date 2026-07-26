import mongoose from 'mongoose';

const CrmSettingsSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true
  },
  
  // General Settings
  general: {
    crmName: {
      type: String,
      default: 'My CRM',
      maxlength: 100
    },
    crmDescription: {
      type: String,
      maxlength: 500
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    }
  },

  // Email Settings
  email: {
    fromName: {
      type: String,
      default: 'CRM System'
    },
    fromEmail: {
      type: String
    },
    replyToEmail: {
      type: String
    },
    emailSignature: {
      type: String,
      maxlength: 1000
    },
    autoResponder: {
      enabled: {
        type: Boolean,
        default: false
      },
      subject: {
        type: String,
        default: 'Thank you for your inquiry'
      },
      message: {
        type: String,
        default: 'We have received your message and will get back to you soon.'
      }
    }
  },

  // Notification Settings
  notifications: {
    emailNotifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      newLead: {
        type: Boolean,
        default: true
      },
      newCustomer: {
        type: Boolean,
        default: true
      },
      newDeal: {
        type: Boolean,
        default: true
      },
      dealUpdate: {
        type: Boolean,
        default: true
      },
      taskAssigned: {
        type: Boolean,
        default: true
      },
      taskDue: {
        type: Boolean,
        default: true
      },
      taskOverdue: {
        type: Boolean,
        default: true
      },
      eventReminder: {
        type: Boolean,
        default: true
      }
    },
    inAppNotifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      soundEnabled: {
        type: Boolean,
        default: true
      }
    }
  },

  // Lead Settings
  leads: {
    autoAssign: {
      enabled: {
        type: Boolean,
        default: false
      },
      assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    leadScoring: {
      enabled: {
        type: Boolean,
        default: false
      },
      scoreWeights: {
        email: { type: Number, default: 10 },
        phone: { type: Number, default: 15 },
        company: { type: Number, default: 20 },
        source: { type: Number, default: 5 }
      }
    },
    duplicateDetection: {
      enabled: {
        type: Boolean,
        default: true
      },
      checkFields: [{
        type: String,
        enum: ['email', 'phone', 'company']
      }]
    }
  },

  // Deal Settings
  deals: {
    defaultCurrency: {
      type: String,
      default: 'USD'
    },
    defaultProbability: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    autoClose: {
      enabled: {
        type: Boolean,
        default: false
      },
      daysAfterCloseDate: {
        type: Number,
        default: 30
      }
    },
    dealStages: [{
      name: String,
      probability: Number,
      color: String,
      order: Number
    }]
  },

  // Task Settings
  tasks: {
    defaultPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    defaultType: {
      type: String,
      enum: ['call', 'email', 'meeting', 'follow-up', 'other'],
      default: 'follow-up'
    },
    autoReminders: {
      enabled: {
        type: Boolean,
        default: true
      },
      beforeDue: {
        type: Number,
        default: 24 // hours
      }
    },
    timeTracking: {
      enabled: {
        type: Boolean,
        default: false
      }
    }
  },

  // Calendar Settings
  calendar: {
    workingHours: {
      enabled: {
        type: Boolean,
        default: true
      },
      startTime: {
        type: String,
        default: '09:00'
      },
      endTime: {
        type: String,
        default: '17:00'
      },
      workingDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }]
    },
    defaultDuration: {
      type: Number,
      default: 60 // minutes
    },
    bufferTime: {
      type: Number,
      default: 15 // minutes
    },
    timeSlots: {
      type: Number,
      default: 30 // minutes
    }
  },

  // Security Settings
  security: {
    sessionTimeout: {
      type: Number,
      default: 480 // minutes (8 hours)
    },
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      }
    },
    twoFactorAuth: {
      enabled: {
        type: Boolean,
        default: false
      }
    },
    ipWhitelist: [{
      type: String
    }]
  },

  // Integration Settings
  integrations: {
    googleCalendar: {
      enabled: {
        type: Boolean,
        default: false
      },
      calendarId: String
    },
    slack: {
      enabled: {
        type: Boolean,
        default: false
      },
      webhookUrl: String,
      channel: String
    },
    webhooks: [{
      name: String,
      url: String,
      events: [String],
      enabled: {
        type: Boolean,
        default: true
      }
    }]
  },

  // Custom Fields
  customFields: {
    leads: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'textarea']
      },
      required: {
        type: Boolean,
        default: false
      },
      options: [String], // for select/multiselect
      order: Number
    }],
    customers: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'textarea']
      },
      required: {
        type: Boolean,
        default: false
      },
      options: [String],
      order: Number
    }],
    deals: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'textarea']
      },
      required: {
        type: Boolean,
        default: false
      },
      options: [String],
      order: Number
    }],
    companies: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'textarea']
      },
      required: {
        type: Boolean,
        default: false
      },
      options: [String],
      order: Number
    }]
  },

  // Backup Settings
  backup: {
    autoBackup: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      retentionDays: {
        type: Number,
        default: 30
      }
    }
  },

  // Analytics Settings
  analytics: {
    trackingEnabled: {
      type: Boolean,
      default: true
    },
    dataRetention: {
      type: Number,
      default: 365 // days
    },
    reports: {
      autoGenerate: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      }
    }
  }
}, {
  timestamps: true
});

// Index for projectId
// CrmSettingsSchema.index({ projectId: 1 });

export default mongoose.model('CrmSettings', CrmSettingsSchema);
