import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const addressSchema = new Schema({
  street: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'work'
  }
});

const socialLinkSchema = new Schema({
  platform: {
    type: String,
    enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'github', 'website', 'other'],
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  handle: {
    type: String,
    trim: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
});

const noteSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['general', 'meeting', 'call', 'email', 'task', 'follow_up', 'other'],
    default: 'general'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
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
});

const ContactSchema = new Schema({
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
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true,
    index: true
  },
  department: {
    type: String,
    trim: true
  },
  
  // Company Association
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  
  // Project Association
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  
  // Assignment and Ownership
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Pipeline and Stage Management
  stage: {
    type: String,
    enum: ['lead', 'prospect', 'qualified', 'opportunity', 'customer', 'inactive', 'lost', 'other'],
    default: 'lead',
    index: true
  },
  pipeline: {
    type: Schema.Types.ObjectId,
    ref: 'Pipeline'
  },
  
  // Contact Details
  addresses: [addressSchema],
  socialLinks: [socialLinkSchema],
  
  // Business Information
  source: {
    type: String,
    enum: ['website', 'referral', 'cold_outreach', 'event', 'social_media', 'advertising', 'partner', 'other'],
    default: 'other'
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'unsubscribed', 'bounced', 'other'],
    default: 'active',
    index: true
  },
  
  // Relationships
  deals: [{
    type: Schema.Types.ObjectId,
    ref: 'Deal'
  }],
  
  // Organization
  tags: [{
    type: String,
    trim: true
  }],
  notes: [noteSchema],
  
  // Custom Fields
  customFields: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  
  // Activity Tracking
  // activities: now tracked in separate Activity model
  lastActivityDate: {
    type: Date
  },
  lastActivityType: {
    type: String
  },
  lastActivityBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Communication Preferences
  communicationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    phone: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'sms', 'any'],
      default: 'email'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Import/Export tracking
  importedFrom: {
    type: String
  },
  externalId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ContactSchema.index({ firstName: 1, lastName: 1, project: 1 });
ContactSchema.index({ email: 1, project: 1 });
ContactSchema.index({ company: 1, project: 1 });
ContactSchema.index({ assignedTo: 1, project: 1 });
ContactSchema.index({ stage: 1, project: 1 });
ContactSchema.index({ status: 1, project: 1 });
ContactSchema.index({ tags: 1, project: 1 });
ContactSchema.index({ jobTitle: 1, project: 1 });
ContactSchema.index({ 'addresses.city': 1, project: 1 });
ContactSchema.index({ 'addresses.country': 1, project: 1 });
ContactSchema.index({ lastActivityDate: 1, project: 1 });
ContactSchema.index({ leadScore: 1, project: 1 });
ContactSchema.index({ source: 1, project: 1 });

// Virtual for full name
ContactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for primary email
ContactSchema.virtual('primaryEmail').get(function() {
  return this.email;
});

// Virtual for primary phone
ContactSchema.virtual('primaryPhone').get(function() {
  return this.phone;
});

// Virtual for primary address
ContactSchema.virtual('primaryAddress').get(function() {
  return this.addresses.find(addr => addr.type === 'work') || this.addresses[0];
});

// Static methods
ContactSchema.statics.findByProject = function(projectId, options = {}) {
  const { 
    limit = 20, 
    skip = 0, 
    sort = 'firstName', 
    order = 'asc',
    stage,
    status,
    assignedTo,
    company,
    search,
    tags,
    source,
    leadScoreMin,
    leadScoreMax,
    lastActivityDays
  } = options;

  const query = { project: projectId };

  // Apply filters
  if (stage) {
    query.stage = stage;
  }

  if (status) {
    query.status = status;
  }

  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  if (company) {
    query.company = company;
  }

  if (source) {
    query.source = source;
  }

  if (leadScoreMin !== undefined || leadScoreMax !== undefined) {
    query.leadScore = {};
    if (leadScoreMin !== undefined) query.leadScore.$gte = leadScoreMin;
    if (leadScoreMax !== undefined) query.leadScore.$lte = leadScoreMax;
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  if (lastActivityDays) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - lastActivityDays);
    query.lastActivityDate = { $gte: daysAgo };
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { jobTitle: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { 'addresses.city': { $regex: search, $options: 'i' } },
      { 'addresses.country': { $regex: search, $options: 'i' } }
    ];
  }

  const sortOption = {};
  sortOption[sort] = order === 'asc' ? 1 : -1;

  return this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate('company', 'name industry')
    .populate('assignedTo', 'name email profileImage')
    .populate('owner', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('updatedBy', 'name email profileImage')
    .populate('lastActivityBy', 'name email profileImage')
    // .populate('deals.deal', 'name value stage')
    .populate('pipeline', 'name')
    // .populate('pipelineStage', 'name color');
};

ContactSchema.statics.findByCompany = function(companyId, options = {}) {
  const { 
    limit = 20, 
    skip = 0, 
    sort = 'firstName', 
    order = 'asc',
    stage,
    status,
    assignedTo,
    search
  } = options;

  const query = { company: companyId };

  // Apply filters
  if (stage) {
    query.stage = stage;
  }

  if (status) {
    query.status = status;
  }

  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { jobTitle: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOption = {};
  sortOption[sort] = order === 'asc' ? 1 : -1;

  return this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate('assignedTo', 'name email profileImage')
    .populate('owner', 'name email profileImage')
    .populate('deals.deal', 'name value stage');
};

ContactSchema.statics.getContactStats = function(projectId) {
  return this.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byStage: {
          $push: {
            stage: '$stage',
            count: 1
          }
        },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        },
        bySource: {
          $push: {
            source: '$source',
            count: 1
          }
        },
        avgLeadScore: { $avg: '$leadScore' },
        maxLeadScore: { $max: '$leadScore' },
        minLeadScore: { $min: '$leadScore' }
      }
    }
  ]);
};

ContactSchema.statics.getRecentActivity = function(projectId, limit = 10) {
  return this.find({ project: projectId })
    .sort({ lastActivityDate: -1 })
    .limit(limit)
    .select('firstName lastName email lastActivityDate lastActivityType lastActivityBy stage')
    .populate('lastActivityBy', 'name email profileImage')
    .populate('company', 'name');
};

// Instance methods
ContactSchema.methods.updateActivity = async function(userId, activityType, description = '', metadata = {}) {
  this.lastActivityDate = new Date();
  this.lastActivityType = activityType;
  this.lastActivityBy = userId;
  this.updatedBy = userId;
  
  // Add activity record
  // this.activities.push({
  //   type: activityType,
  //   description,
  //   performedBy: userId,
  //   performedAt: new Date(),
  //   metadata
  // });
  
  return this.save();
};

ContactSchema.methods.addNote = async function(content, userId, type = 'general') {
  this.notes.push({
    content,
    type,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  await this.updateActivity(userId, 'note_added', `Added ${type} note`);
  return this;
};

ContactSchema.methods.addTag = async function(tag, userId) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    await this.updateActivity(userId, 'tag_added', `Added tag: ${tag}`);
  }
  return this;
};

ContactSchema.methods.removeTag = async function(tag, userId) {
  this.tags = this.tags.filter(t => t !== tag);
  await this.updateActivity(userId, 'tag_removed', `Removed tag: ${tag}`);
  return this;
};

ContactSchema.methods.addCustomField = async function(key, value, userId) {
  this.customFields.set(key, value);
  await this.updateActivity(userId, 'custom_field_added', `Added custom field: ${key}`);
  return this;
};

ContactSchema.methods.removeCustomField = async function(key, userId) {
  this.customFields.delete(key);
  await this.updateActivity(userId, 'custom_field_removed', `Removed custom field: ${key}`);
  return this;
};

ContactSchema.methods.addDeal = async function(dealId, role = 'decision_maker', userId) {
  // Check if deal already exists
  const existingDeal = this.deals.find(d => d.deal.toString() === dealId.toString());
  if (existingDeal) {
    existingDeal.role = role;
  } else {
    this.deals.push({
      deal: dealId,
      role,
      addedAt: new Date()
    });
  }
  
  await this.updateActivity(userId, 'deal_created', `Added deal with role: ${role}`);
  return this;
};

ContactSchema.methods.removeDeal = async function(dealId, userId) {
  this.deals = this.deals.filter(d => d.deal.toString() !== dealId.toString());
  await this.updateActivity(userId, 'deal_updated', 'Removed deal');
  return this;
};

ContactSchema.methods.addSocialLink = async function(platform, url, handle = '', isPrimary = false, userId) {
  // If this is primary, unset other primary links
  if (isPrimary) {
    this.socialLinks.forEach(link => link.isPrimary = false);
  }
  
  this.socialLinks.push({
    platform,
    url,
    handle,
    isPrimary
  });
  
  await this.updateActivity(userId, 'contact_updated', `Added ${platform} social link`);
  return this;
};

ContactSchema.methods.removeSocialLink = async function(linkId, userId) {
  this.socialLinks = this.socialLinks.filter(link => link._id.toString() !== linkId.toString());
  await this.updateActivity(userId, 'contact_updated', 'Removed social link');
  return this;
};

ContactSchema.methods.addAddress = async function(addressData, userId) {
  this.addresses.push(addressData);
  await this.updateActivity(userId, 'contact_updated', 'Added address');
  return this;
};

ContactSchema.methods.updateStage = async function(newStage, userId) {
  const oldStage = this.stage;
  this.stage = newStage;
  await this.updateActivity(userId, 'stage_changed', `Stage changed from ${oldStage} to ${newStage}`);
  return this;
};

ContactSchema.methods.updateLeadScore = async function(newScore, userId) {
  const oldScore = this.leadScore;
  this.leadScore = Math.max(0, Math.min(100, newScore));
  await this.updateActivity(userId, 'contact_updated', `Lead score updated from ${oldScore} to ${this.leadScore}`);
  return this;
};

// Pre-save middleware
ContactSchema.pre('save', function(next) {
  // Ensure tags are unique
  if (this.tags) {
    this.tags = [...new Set(this.tags)];
  }
  
  // Ensure only one primary social link per platform
  const platformGroups = {};
  this.socialLinks.forEach(link => {
    if (!platformGroups[link.platform]) {
      platformGroups[link.platform] = [];
    }
    platformGroups[link.platform].push(link);
  });
  
  Object.values(platformGroups).forEach(links => {
    const primaryLinks = links.filter(link => link.isPrimary);
    if (primaryLinks.length > 1) {
      // Keep only the first primary link
      primaryLinks.slice(1).forEach(link => link.isPrimary = false);
    }
  });
  
  next();
});

const Contact = mongoose.model('Contact', ContactSchema);

export default Contact;
