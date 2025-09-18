import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'project_invitation',
        'project_role_change',
        'project_member_removed',
        'pipeline_created',
        'pipeline_updated',
        'pipeline_deleted',
        'stage_created',
        'stage_updated',
        'stage_deleted',
        'deal_created',
        'deal_updated',
        'deal_moved',
        'deal_assigned',
        'deal_unassigned',
        'deal_archived',
        'deal_unarchived',
        'deal_deleted',
        'deal_note_added',
        'deal_status_updated',
        'deal_stage_updated',
        'deal_priority_updated',
        'deal_probability_updated',
        'deal_expected_close_date_updated',
        'deal_actual_close_date_updated',
        'deal_source_updated',
        'deal_tags_updated',
        'deal_customer_updated',
        'deal_company_updated',
        'deal_contact_person_updated',
        'deal_assigned_to_updated',
        'deal_created_by_updated',
        'deal_products_updated',
        'task_created',
        'task_updated',
        'task_completed',
        'task_assigned',
        'task_due_soon',
        'task_reopened',
        'subtask_added',
        'subtask_completed',
        'subtask_updated',
        'subtask_deleted',
        'comment_added',
        'mention',
        'user_mentioned',
        'system_alert',
        'company_created',
        'company_updated',
        'company_deleted',
        'company_note_added',
        // Lead management
        'lead_created',
        'lead_assigned',
        'lead_unassigned',
        'lead_updated',
        'lead_archived',
        'lead_unarchived',
        'lead_deleted',
        'lead_note_added',
        'lead_status_updated',
        'lead_converted',
        // Customer management
        'customer_created',
        'customer_updated',
        'customer_archived',
        'customer_unarchived',
        'customer_deleted',
        'customer_note_added',
        'customer_assigned',
        'customer_unassigned',
        'customer_status_updated',
        'customer_stage_updated',
        'customer_priority_updated',
        'customer_score_updated',
        'customer_deal_updated',
        'customer_deal_moved',
        'customer_deal_assigned',
        'customer_deal_unassigned',
        'customer_deal_status_updated',
        'customer_deal_stage_updated',
      ],
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    expiresAt: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ project: 1, type: 1, createdAt: -1 });

// Instance methods
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = async function(userId, options = {}) {
  const filter = { recipient: userId, isRead: false };
  
  // Optional filters
  if (options.type) filter.type = options.type;
  if (options.project) filter.project = options.project;
  
  return this.updateMany(filter, { isRead: true });
};

notificationSchema.statics.getNotificationsByUser = async function(userId, options = {}) {
  const filter = { recipient: userId };
  const limit = options.limit || 20;
  const skip = options.skip || 0;
  
  // Optional filters
  if (options.isRead !== undefined) filter.isRead = options.isRead;
  if (options.type) filter.type = options.type;
  if (options.project) filter.project = options.project;
  
  return this.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email profileImage')
    .populate('project', 'name')
    .populate('company', 'name industry')
    .exec();
};

// Delete expired notifications
notificationSchema.statics.deleteExpired = async function() {
  const now = new Date();
  return this.deleteMany({ expiresAt: { $lt: now } });
};

// Pre-save middleware to set expiration date if not provided
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Default expiration: 30 days from creation
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    this.expiresAt = thirtyDaysFromNow;
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;