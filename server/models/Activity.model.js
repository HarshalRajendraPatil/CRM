import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const attachmentSchema = new Schema({
  name: { type: String, trim: true },
  url: { type: String, trim: true },
  mimeType: { type: String, trim: true },
  size: { type: Number, min: 0 }
}, { _id: false });

const relatedEntitySchema = new Schema({
  entityType: { 
    type: String, 
    enum: ['contact', 'company', 'project', 'deal', 'task', 'pipeline', 'stage', 'invitation', 'notification', 'user', 'system', 'note', 'email', 'call', 'meeting', 'activity', 'other'],
    required: true
  },
  entityId: { type: Schema.Types.ObjectId, required: true }
}, { _id: false });

const reactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'thumbs_up', 'heart', 'clap', 'insightful'], default: 'like' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ActivitySchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
  contact: { type: Schema.Types.ObjectId, ref: 'Contact', index: true },

  // Generic target
  entityType: { 
    type: String, 
    enum: ['contact', 'company', 'project', 'deal', 'task', 'pipeline', 'stage', 'invitation', 'notification', 'user', 'system', 'note', 'email', 'call', 'meeting', 'activity', 'other'],
    required: true,
    index: true
  },
  entityId: { type: Schema.Types.ObjectId, required: true, index: true },

  // Event type
  type: { 
    type: String, 
    enum: [
      'created', 'updated', 'deleted', 
      'note_added', 'note_updated', 'note_deleted',
      'tag_added', 'tag_removed',
      'stage_changed', 'status_changed', 'assignment_changed', 'owner_changed',
      'lead_score_updated', 'custom_field_added', 'custom_field_removed',
      'social_link_added', 'social_link_removed',
      'email_sent', 'email_received', 'call_made', 'call_received',
      'meeting_scheduled', 'meeting_completed', 'task_created', 'task_completed',
      'imported', 'exported', 'merged', 'duplicated', 'restored',
      'other'
    ],
    required: true,
    index: true
  },

  title: { type: String, trim: true },
  description: { type: String, trim: true },

  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  visibility: { type: String, enum: ['private', 'team', 'public'], default: 'team', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  source: { type: String, enum: ['manual', 'system', 'email', 'phone', 'integration', 'import', 'api'], default: 'system' },

  tags: [{ type: String, trim: true }],
  attachments: [attachmentSchema],
  related: [relatedEntitySchema],
  metadata: { type: Map, of: Schema.Types.Mixed, default: {} },

  ipAddress: { type: String },
  userAgent: { type: String },

  isPinned: { type: Boolean, default: false },
  reactions: [reactionSchema]
}, { timestamps: true });

ActivitySchema.index({ project: 1, createdAt: -1 });
ActivitySchema.index({ entityType: 1, entityId: 1, project: 1, createdAt: -1 });
ActivitySchema.index({ actor: 1, createdAt: -1 });

// Static helpers
ActivitySchema.statics.log = async function(activityData) {
  const Activity = this;
  const doc = await Activity.create(activityData);
  return doc;
};

ActivitySchema.statics.queryActivities = async function(filters = {}, options = {}) {
  const {
    projectId,
    companyId,
    contactId,
    entityType,
    entityId,
    types,
    actorId,
    visibility,
    search,
    fromDate,
    toDate,
    tags
  } = filters;

  const {
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = {};
  if (projectId) query.project = projectId;
  if (companyId) query.company = companyId;
  if (contactId) query.contact = contactId;
  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;
  if (actorId) query.actor = actorId;
  if (visibility) query.visibility = visibility;
  if (types && Array.isArray(types) && types.length > 0) query.type = { $in: types };
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }
  if (tags && Array.isArray(tags) && tags.length > 0) {
    query.tags = { $in: tags };
  }
  if (search && typeof search === 'string' && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { tags: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('actor', 'name email profileImage')
      .populate('mentions', 'name email profileImage'),
    this.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: parseInt(skip) + items.length < total
    }
  };
};

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;


