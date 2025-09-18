import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Task description cannot exceed 2000 characters']
  },
  
  // Project and Entity Relationships
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  
  // Related entities (optional)
  relatedEntity: {
    type: {
      type: String,
      enum: ['deal', 'customer', 'company', 'lead'],
      required: false
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    entityName: {
      type: String,
      required: false
    }
  },
  
  // Assignment and Ownership
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to someone']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task creator is required']
  },
  
  // Task Properties
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['follow_up', 'meeting', 'call', 'email', 'document', 'research', 'review', 'other'],
    default: 'other'
  },
  
  // Dates and Timing
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  startDate: {
    type: Date,
    required: false
  },
  completedAt: {
    type: Date,
    required: false
  },
  
  // Time Tracking
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [999, 'Estimated hours cannot exceed 999']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [999, 'Actual hours cannot exceed 999'],
    default: 0
  },
  
  // Progress and Completion
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  completionNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Completion notes cannot exceed 1000 characters']
  },
  
  // Dependencies and Relationships
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'related_to'],
      default: 'related_to'
    }
  }],
  
  // Subtasks
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Subtask title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Subtask description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    completedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Attachments and Resources
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: Number,
    type: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments and Communication
  comments: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    attachments: [{
      name: String,
      url: String,
      size: Number,
      type: String
    }]
  }],
  
  // Tags and Categorization
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Custom Fields
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Recurrence
  recurrence: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function() { return this.recurrence?.enabled; }
    },
    interval: {
      type: Number,
      min: 1,
      default: 1,
      required: function() { return this.recurrence?.enabled; }
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    endDate: Date,
    occurrences: Number
  },
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'email'
    },
    trigger: {
      type: String,
      enum: ['before_due', 'on_due', 'overdue'],
      default: 'before_due'
    },
    offset: {
      type: Number,
      default: 0 // minutes before/after trigger
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  
  // Visibility and Permissions
  visibility: {
    type: String,
    enum: ['private', 'project', 'public'],
    default: 'project'
  },
  
  // Archival and Soft Delete
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Audit Trail
  activityLog: [{
    action: {
      type: String,
      required: true,
      enum: ['created', 'updated', 'assigned', 'status_changed', 'priority_changed', 'due_date_changed', 'completed', 'cancelled', 'commented', 'attachment_added', 'subtask_added', 'subtask_updated', 'subtask_deleted', 'subtask_completed']
    },
    description: String,
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.entityId': 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ isArchived: 1 });

// Virtual for task age
taskSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') return false;
  return new Date() > new Date(this.dueDate);
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.subtasks.length === 0) return this.progress;
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.status === 'completed').length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Update completion date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Update progress when status changes
  if (this.isModified('status')) {
    if (this.status === 'completed') {
      this.progress = 100;
    } else if (this.status === 'pending') {
      this.progress = 0;
    }
  }
  
  // Add activity log entry
  if (this.isNew) {
    this.activityLog.push({
      action: 'created',
      description: 'Task created',
      actor: this.createdBy,
      metadata: {
        title: this.title,
        assignedTo: this.assignedTo,
        dueDate: this.dueDate
      }
    });
  }
  
  next();
});

// Pre-update middleware for activity logging
taskSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const originalDoc = this.getQuery();
  
  // This would need to be handled in the controller for more complex activity logging
  next();
});

// Static methods
taskSchema.statics.getTasksByProject = function(projectId, filters = {}) {
  const query = { project: projectId, isArchived: false };
  
  if (filters.status) query.status = filters.status;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.priority) query.priority = filters.priority;
  if (filters.type) query.type = filters.type;
  if (filters.overdue) query.dueDate = { $lt: new Date() };
  
  return this.find(query)
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('relatedEntity.entityId')
    .sort({ dueDate: 1, priority: -1 });
};

taskSchema.statics.getUserTasks = function(userId, filters = {}) {
  const query = { assignedTo: userId, isArchived: false };
  
  if (filters.status) query.status = filters.status;
  if (filters.overdue) query.dueDate = { $lt: new Date() };
  
  return this.find(query)
    .populate('project', 'name')
    .populate('createdBy', 'name email')
    .populate('relatedEntity.entityId')
    .sort({ dueDate: 1, priority: -1 });
};

taskSchema.statics.getOverdueTasks = function(projectId = null) {
  const query = {
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isArchived: false
  };
  
  if (projectId) query.project = projectId;
  
  return this.find(query)
    .populate('assignedTo', 'name email')
    .populate('project', 'name')
    .sort({ dueDate: 1 });
};

// Instance methods
taskSchema.methods.addComment = function(content, authorId, mentions = []) {
  this.comments.push({
    content,
    author: authorId,
    mentions,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  this.activityLog.push({
    action: 'commented',
    description: 'Comment added',
    actor: authorId,
    metadata: { commentLength: content.length, mentions: mentions.length }
  });
  
  return this.save();
};

taskSchema.methods.addSubtask = function(subtaskData) {
  this.subtasks.push({
    ...subtaskData,
    createdAt: new Date()
  });
  
  // Update task progress based on subtask completion
  if (this.subtasks && this.subtasks.length > 0) {
    const completedSubtasks = this.subtasks.filter(s => s.status === 'completed').length;
    this.progress = Math.round((completedSubtasks / this.subtasks.length) * 100);
  }
  
  this.activityLog.push({
    action: 'subtask_added',
    description: 'Subtask added',
    actor: subtaskData.assignedTo || this.assignedTo,
    metadata: { subtaskTitle: subtaskData.title }
  });
  
  return this.save();
};

taskSchema.methods.updateStatus = function(newStatus, actorId, notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (newStatus === 'completed') {
    this.completedAt = new Date();
    this.progress = 100;
    this.completionNotes = notes;
  }
  
  this.activityLog.push({
    action: 'status_changed',
    description: `Status changed from ${oldStatus} to ${newStatus}`,
    actor: actorId,
    metadata: { oldStatus, newStatus, notes }
  });
  
  return this.save();
};

taskSchema.methods.assignTo = function(userId, actorId) {
  const oldAssignee = this.assignedTo;
  this.assignedTo = userId;
  
  this.activityLog.push({
    action: 'assigned',
    description: 'Task reassigned',
    actor: actorId,
    metadata: { oldAssignee, newAssignee: userId }
  });
  
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);

export default Task;
