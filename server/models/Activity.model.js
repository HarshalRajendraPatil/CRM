import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  // Entity reference (Company, Lead, Customer, or Deal)
  entityType: {
    type: String,
    enum: ['Company', 'Lead', 'Customer', 'Deal', 'Task'],
    required: true,
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  // Project reference
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  // Activity details
  activityType: {
    type: String,
    required: true,
    enum: [
      // Company activities
      'company_created',
      'company_updated',
      'company_deleted',
      'company_note_added',
      'company_note_updated',
      'company_note_deleted',
      'company_tag_added',
      'company_tag_removed',
      'company_custom_field_added',
      'company_custom_field_removed',
      'company_custom_field_updated',
      'company_status_changed',
      'company_assigned',
      'company_unassigned',
      
      // Lead activities
      'lead_created',
      'lead_updated',
      'lead_archived',
      'lead_unarchived',
      'lead_deleted',
      'lead_note_added',
      'lead_note_updated',
      'lead_note_deleted',
      'lead_status_changed',
      'lead_assigned',
      'lead_unassigned',
      'lead_converted',
      'lead_score_updated',
      'lead_source_updated',
      'lead_company_linked',
      'lead_company_unlinked',
      
      // Customer activities
      'customer_created',
      'customer_updated',
      'customer_archived',
      'customer_unarchived',
      'customer_deleted',
      'customer_note_added',
      'customer_interaction_added',
      'customer_stage_changed',
      'customer_status_changed',
      'customer_assigned',
      'customer_unassigned',
      'customer_converted_from_lead',
      'customer_score_updated',
      'customer_priority_changed',
      'customer_tag_added',
      'customer_tag_removed',
      'customer_custom_field_added',
      'customer_custom_field_removed',
      
      // Deal activities
      'deal_created',
      'deal_updated',
      'deal_archived',
      'deal_restored',
      'deal_deleted',
      'deal_status_changed',
      'deal_value_changed',
      'deal_assigned',
      'deal_unassigned',
      'deal_note_added',
      'deal_activity_added',
      'deal_priority_changed',
      'deal_probability_changed',
      'deal_close_date_changed',
      'deal_customer_changed',
      'deal_company_changed',
      'deal_product_added',
      'deal_product_removed',
      'deal_attachment_added',
      'deal_attachment_removed',
      
      // Task activities
      'task_created',
      'task_updated',
      'task_completed',
      'task_assigned',
      'task_unassigned',
      'task_archived',
      'task_restored',
      'task_deleted',
      'task_status_changed',
      'task_comment_added',
      'task_comment_updated',
      'task_comment_deleted',
      'task_custom_field_added',
      'task_custom_field_updated',
      'task_custom_field_deleted',
      'task_subtask_added',
      'task_subtask_updated',
      'task_subtask_deleted',
    ],
    index: true
  },
  // Activity description
  description: {
    type: String,
    required: true
  },
  // Previous and new values for changes
  changes: {
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  },
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // User who performed the activity
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Related entities
  relatedEntity: {
    type: {
      type: String,
      enum: ['User', 'Company', 'Lead', 'Customer', 'Deal', 'Task', 'Project']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  // Activity priority/importance
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Activity visibility
  isVisible: {
    type: Boolean,
    default: true
  },
  // Activity category for filtering
  category: {
    type: String,
    enum: ['creation', 'update', 'deletion', 'assignment', 'status_change', 'interaction', 'conversion', 'system'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ performedBy: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });
activitySchema.index({ category: 1, createdAt: -1 });

// Static methods
activitySchema.statics.logActivity = async function(activityData) {
  const activity = new this(activityData);
  return await activity.save();
};

activitySchema.statics.getEntityActivities = async function(entityType, entityId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    category,
    activityType,
    performedBy,
    startDate,
    endDate,
    sort = 'createdAt',
    order = 'desc'
  } = options;

  const query = {
    entityType,
    entityId
  };

  if (category) query.category = category;
  if (activityType) query.activityType = activityType;
  if (performedBy) query.performedBy = performedBy;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortOption = {};
  sortOption[sort] = order === 'asc' ? 1 : -1;

  return await this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate('performedBy', 'name email profileImage')
    .populate('relatedEntity.id', 'name email')
    .lean();
};

activitySchema.statics.getProjectActivities = async function(projectId, options = {}) {
  const {
    limit = 100,
    skip = 0,
    entityType,
    category,
    activityType,
    performedBy,
    startDate,
    endDate,
    sort = 'createdAt',
    order = 'desc'
  } = options;

  const query = { project: projectId };

  if (entityType) query.entityType = entityType;
  if (category) query.category = category;
  if (activityType) query.activityType = activityType;
  if (performedBy) query.performedBy = performedBy;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortOption = {};
  sortOption[sort] = order === 'asc' ? 1 : -1;

  return await this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate('performedBy', 'name email profileImage')
    .populate('relatedEntity.id', 'name email')
    .lean();
};

activitySchema.statics.getActivityStats = async function(projectId, options = {}) {
  const {
    startDate,
    endDate,
    entityType,
    category
  } = options;

  const matchQuery = { project: projectId };
  
  if (entityType) matchQuery.entityType = entityType;
  if (category) matchQuery.category = category;
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          activityType: '$activityType',
          category: '$category'
        },
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return stats;
};

// Instance methods
activitySchema.methods.getFormattedDescription = function() {
  const user = this.performedBy?.name || 'System';
  const timestamp = this.createdAt.toLocaleString();
  
  return {
    user,
    timestamp,
    description: this.description,
    changes: this.changes,
    metadata: this.metadata
  };
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
