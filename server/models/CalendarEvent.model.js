import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['email', 'popup', 'sms'],
    required: true
  },
  time: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    enum: ['minutes', 'hours', 'days'],
    required: true
  }
}, { _id: false });

const customFieldSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { _id: false });

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['custom', 'task', 'deal', 'customer', 'company', 'lead'],
    default: 'custom'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return this.allDay || (!value || value >= this.startDate);
      },
      message: 'End date must be after start date'
    }
  },
  startTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  endTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['task', 'deal', 'customer', 'company', 'lead']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  visibility: {
    type: String,
    enum: ['private', 'project', 'public'],
    default: 'project'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  customFields: [customFieldSchema],
  reminders: [reminderSchema],
  recurrence: {
    frequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    endDate: Date,
    occurrences: Number
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  parentEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent'
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    response: {
      type: String,
      enum: ['accepted', 'declined', 'tentative']
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
calendarEventSchema.index({ project: 1, startDate: 1 });
calendarEventSchema.index({ project: 1, type: 1 });
calendarEventSchema.index({ attendees: 1 });
calendarEventSchema.index({ createdBy: 1 });
calendarEventSchema.index({ startDate: 1, endDate: 1 });

// Virtual for duration
calendarEventSchema.virtual('duration').get(function() {
  if (this.allDay) {
    return 24 * 60; // 24 hours in minutes
  }
  
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}`);
    const end = new Date(`2000-01-01T${this.endTime}`);
    return (end - start) / (1000 * 60); // duration in minutes
  }
  
  return null;
});

// Virtual for isPast
calendarEventSchema.virtual('isPast').get(function() {
  const now = new Date();
  const eventDate = this.allDay ? 
    new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()) :
    new Date(`${this.startDate.toISOString().split('T')[0]}T${this.startTime || '00:00'}`);
  
  return eventDate < now;
});

// Virtual for isToday
calendarEventSchema.virtual('isToday').get(function() {
  const today = new Date();
  const eventDate = new Date(this.startDate);
  
  return eventDate.toDateString() === today.toDateString();
});

// Virtual for isUpcoming
calendarEventSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const eventDate = this.allDay ? 
    new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()) :
    new Date(`${this.startDate.toISOString().split('T')[0]}T${this.startTime || '00:00'}`);
  
  return eventDate > now;
});

// Pre-save middleware
calendarEventSchema.pre('save', function(next) {
  // Set endDate to startDate if not provided
  if (!this.endDate) {
    this.endDate = this.startDate;
  }
  
  // Set endTime to startTime if not provided and not all day
  if (!this.endTime && this.startTime && !this.allDay) {
    this.endTime = this.startTime;
  }
  
  // Clear time fields if all day
  if (this.allDay) {
    this.startTime = undefined;
    this.endTime = undefined;
  }
  
  next();
});

// Static method to get events by date range
calendarEventSchema.statics.getEventsByDateRange = function(projectId, startDate, endDate, options = {}) {
  const query = {
    project: projectId,
    startDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.attendees && options.attendees.length > 0) {
    query.attendees = { $in: options.attendees };
  }
  
  return this.find(query)
    .populate('createdBy', 'name email')
    .populate('attendees', 'name email')
    .sort({ startDate: 1, startTime: 1 });
};

// Static method to get upcoming events
calendarEventSchema.statics.getUpcomingEvents = function(projectId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    project: projectId,
    startDate: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .populate('createdBy', 'name email')
    .populate('attendees', 'name email')
    .sort({ startDate: 1, startTime: 1 });
};

// Static method to get overdue events
calendarEventSchema.statics.getOverdueEvents = function(projectId) {
  const now = new Date();
  
  return this.find({
    project: projectId,
    startDate: { $lt: now },
    status: { $nin: ['completed', 'cancelled'] }
  })
    .populate('createdBy', 'name email')
    .populate('attendees', 'name email')
    .sort({ startDate: 1 });
};

// Instance method to check for conflicts
calendarEventSchema.methods.checkConflicts = function() {
  const query = {
    _id: { $ne: this._id },
    project: this.project,
    $or: [
      {
        startDate: { $lt: this.endDate },
        endDate: { $gt: this.startDate }
      }
    ]
  };
  
  if (this.attendees && this.attendees.length > 0) {
    query.attendees = { $in: this.attendees };
  }
  
  return this.constructor.find(query);
};

// Instance method to send reminders
calendarEventSchema.methods.sendReminders = function() {
  // This would integrate with email/notification services
  // For now, just return the reminders that should be sent
  return this.reminders.filter(reminder => {
    const eventTime = new Date(`${this.startDate.toISOString().split('T')[0]}T${this.startTime || '00:00'}`);
    const reminderTime = new Date(eventTime);
    
    if (reminder.unit === 'minutes') {
      reminderTime.setMinutes(reminderTime.getMinutes() - reminder.time);
    } else if (reminder.unit === 'hours') {
      reminderTime.setHours(reminderTime.getHours() - reminder.time);
    } else if (reminder.unit === 'days') {
      reminderTime.setDate(reminderTime.getDate() - reminder.time);
    }
    
    return reminderTime <= new Date();
  });
};

export default mongoose.model('CalendarEvent', calendarEventSchema);
