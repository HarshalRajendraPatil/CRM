import mongoose from 'mongoose';

const customerNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'call', 'email', 'meeting', 'task'],
    default: 'general'
  },
  createdBy: {
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
  }
});

const customerInteractionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'task', 'note'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  duration: Number, // in minutes
  outcome: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'follow_up_required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const customerSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    index: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ],
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Company Information
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
    index: true
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  industry: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Address Information
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'United States' }
  },
  
  // Social Links
  socialLinks: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    website: { type: String, trim: true },
    other: { type: String, trim: true }
  },
  
  // Customer Stage and Status
  stage: {
    type: String,
    enum: ['prospect', 'lead', 'qualified', 'opportunity', 'customer', 'churned', 'inactive'],
    default: 'prospect',
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'blocked'],
    default: 'active',
    index: true
  },
  deals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  }],

  
  // Classification
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['web', 'email', 'phone', 'referral', 'event', 'ads', 'social', 'cold_call', 'lead_conversion', 'other'],
    default: 'other',
    index: true
  },
  
  // Scoring and Priority
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Notes and Interactions
  notes: [customerNoteSchema],
  interactions: [customerInteractionSchema],
  
  // Activity Tracking
  
  // Conversion Information
  convertedFromLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  },
  convertedAt: {
    type: Date,
    default: null
  },
  convertedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Custom Fields
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Preferences and Communication
  communicationPreferences: {
    email: { type: Boolean, default: true },
    phone: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'sms'],
      default: 'email'
    },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' }
  },
  
  // Lifecycle Information
  lifecycleStage: {
    type: String,
    enum: ['awareness', 'consideration', 'decision', 'retention', 'advocacy'],
    default: 'awareness'
  },
  
  // Archive and Soft Delete
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date,
    default: null
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true
});

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for display name
customerSchema.virtual('displayName').get(function() {
  return this.companyName ? `${this.fullName} - ${this.companyName}` : this.fullName;
});

// Indexes for better query performance
customerSchema.index({ firstName: 1, lastName: 1, project: 1 });
customerSchema.index({ email: 1, project: 1 });
customerSchema.index({ stage: 1, project: 1 });
customerSchema.index({ status: 1, project: 1 });
customerSchema.index({ tags: 1, project: 1 });
customerSchema.index({ priority: 1, project: 1 });

customerSchema.index({ score: 1, project: 1 });

// Deal-related methods
customerSchema.methods.getDeals = function() {
  return mongoose.model('Deal').find({ customer: this._id });
};

customerSchema.methods.getActiveDeals = function() {
  return mongoose.model('Deal').find({ 
    customer: this._id, 
    status: 'open' 
  });
};

customerSchema.methods.getWonDeals = function() {
  return mongoose.model('Deal').find({ 
    customer: this._id, 
    status: 'closed-won' 
  });
};

customerSchema.methods.getTotalDealValue = async function() {
  const deals = await mongoose.model('Deal').find({ customer: this._id });
  return deals.reduce((total, deal) => total + deal.value, 0);
};

customerSchema.methods.getWonDealValue = async function() {
  const deals = await mongoose.model('Deal').find({ 
    customer: this._id, 
    status: 'closed-won' 
  });
  return deals.reduce((total, deal) => total + deal.value, 0);
};

customerSchema.methods.getDealCount = async function() {
  return mongoose.model('Deal').countDocuments({ customer: this._id });
};

customerSchema.methods.getActiveDealCount = async function() {
  return mongoose.model('Deal').countDocuments({ 
    customer: this._id, 
    status: 'open' 
  });
};

customerSchema.methods.getWonDealCount = async function() {
  return mongoose.model('Deal').countDocuments({ 
    customer: this._id, 
    status: 'closed-won' 
  });
};

customerSchema.methods.getConversionRate = async function() {
  const totalDeals = await this.getDealCount();
  const wonDeals = await this.getWonDealCount();
  return totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
};

// Static methods
customerSchema.statics.findByProject = function(projectId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sort = 'createdAt',
    order = 'desc',
    stage,
    status,
    source,
    search,
    tags,
    owner,
    priority,
    assignedTo,
    company
  } = options;

  const query = { project: projectId, isArchived: false };

  if (stage) query.stage = stage;
  if (status) query.status = status;
  if (source) query.source = source;
  if (owner) query.owner = owner;
  if (assignedTo) query.assignedTo = assignedTo;
  if (priority) query.priority = priority;
  if (tags && tags.length > 0) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  if (company) query.company = company;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { jobTitle: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOption = {};
  sortOption[sort] = order === 'asc' ? 1 : -1;

  return this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate('owner', 'name email profileImage')
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('updatedBy', 'name email profileImage')
    .populate('company', 'name industry')
    .populate('convertedFromLead', 'name email');
};

customerSchema.statics.findArchivedByProject = function(projectId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sort = 'archivedAt',
    order = 'desc',
    search
  } = options;

  const query = { project: projectId, isArchived: true };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOption = {};
  sortOption[sort] = order === 'asc' ? 1 : -1;

  return this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate('owner', 'name email profileImage')
    .populate('assignedTo', 'name email profileImage')
    .populate('archivedBy', 'name email profileImage')
    .populate('company', 'name industry');
};

// Instance methods

// customerSchema.methods.addNote = async function(content, type = 'general', userId) {
//   console.log('adding note', content, type, userId);
//   this.notes.push({
//     content,
//     type,
//     createdBy: userId,
//     createdAt: new Date(),
//     updatedAt: new Date()
//   });
//   this.updatedBy = userId;

//   return this;
// };

customerSchema.methods.addInteraction = async function(interactionData, userId) {
  this.interactions.push({
    ...interactionData,
    createdBy: userId,
    createdAt: new Date()
  });
  this.updatedBy = userId;
  return this;
};

customerSchema.methods.updateScore = async function(newScore) {
  this.score = Math.max(0, newScore);
  return this.save();
};

customerSchema.methods.convertFromLead = async function(leadId, userId) {
  this.convertedFromLead = leadId;
  this.convertedAt = new Date();
  this.convertedBy = userId;
  this.stage = 'lead';
  this.updatedBy = userId;
  return this.save();
};

// Pre-save middleware
customerSchema.pre('save', function(next) {
  if (this.tags) {
    this.tags = [...new Set(this.tags)];
  }
  next();
});

// Activity tracking methods
customerSchema.methods.trackActivity = async function(activityType, description, performedBy, metadata = {}) {
  const Activity = mongoose.model('Activity');
  return await Activity.logActivity({
    entityType: 'Customer',
    entityId: this._id,
    project: this.project,
    activityType,
    description,
    category: this.getActivityCategory(activityType),
    performedBy: performedBy._id || performedBy,
    priority: this.getActivityPriority(activityType),
    metadata: {
      customerName: this.fullName,
      ...metadata
    }
  });
};

customerSchema.methods.getActivityCategory = function(activityType) {
  const categoryMap = {
    'customer_created': 'creation',
    'customer_updated': 'update',
    'customer_deleted': 'deletion',
    'customer_archived': 'status_change',
    'customer_unarchived': 'status_change',
    'customer_note_added': 'interaction',
    'customer_note_updated': 'interaction',
    'customer_note_deleted': 'interaction',
    'customer_interaction_added': 'interaction',
    'customer_stage_changed': 'status_change',
    'customer_status_changed': 'status_change',
    'customer_assigned': 'assignment',
    'customer_unassigned': 'assignment',
    'customer_converted_from_lead': 'conversion',
    'customer_score_updated': 'update',
    'customer_priority_changed': 'update',
    'customer_tag_added': 'update',
    'customer_tag_removed': 'update',
    'customer_custom_field_added': 'update',
    'customer_custom_field_removed': 'update'
  };
  return categoryMap[activityType] || 'update';
};

customerSchema.methods.getActivityPriority = function(activityType) {
  const priorityMap = {
    'customer_created': 'high',
    'customer_deleted': 'critical',
    'customer_archived': 'medium',
    'customer_unarchived': 'medium',
    'customer_stage_changed': 'medium',
    'customer_status_changed': 'medium',
    'customer_assigned': 'medium',
    'customer_unassigned': 'medium',
    'customer_converted_from_lead': 'high',
    'customer_note_added': 'low',
    'customer_interaction_added': 'low'
  };
  return priorityMap[activityType] || 'low';
};

// Ensure virtual fields are included in JSON output
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;


