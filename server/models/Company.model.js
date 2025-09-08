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
  }
});

const socialMediaSchema = new Schema({
  platform: {
    type: String,
    enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'other'],
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
  }
});

const CompanySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  industry: {
    type: String,
    trim: true,
    index: true
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
      'Please enter a valid URL'
    ]
  },
  logo: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: addressSchema,
  phone: {
    type: String,
    trim: true
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
  socialMedia: [socialMediaSchema],
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'],
  },
  annualRevenue: {
    type: String,
    enum: ['<1M', '1M-10M', '10M-50M', '50M-100M', '100M-500M', '500M-1B', '>1B', 'Unknown'],
    default: 'Unknown'
  },
  founded: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Linking to project
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  // Ownership and access control
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Custom fields (dynamic fields added by users)
  customFields: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  // Status tracking
  status: {
    type: String,
    enum: ['active', 'inactive', 'lead', 'customer', 'partner', 'vendor', 'competitor', 'other'],
    default: 'active',
    index: true
  },
  // Relationships with other entities
  deals: [{
    type: Schema.Types.ObjectId,
    ref: 'Deal'
  }],
  notes: [{
    content: {
      type: String,
      required: true
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
    }
  }],
  // Activity tracking
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
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CompanySchema.index({ name: 1, project: 1 }, { unique: true });
CompanySchema.index({ 'address.city': 1, project: 1 });
CompanySchema.index({ 'address.country': 1, project: 1 });
CompanySchema.index({ industry: 1, project: 1 });
CompanySchema.index({ status: 1, project: 1 });
CompanySchema.index({ tags: 1, project: 1 });

// Static methods
CompanySchema.statics.findByProject = function(projectId, options = {}) {
  const { 
    limit = 20, 
    skip = 0, 
    sort = 'name', 
    order = 'asc',
    status,
    industry,
    search,
    tags
  } = options;

  const query = { project: projectId };

  // Apply filters if provided
  if (status) {
    query.status = status;
  }

  if (industry) {
    query.industry = industry;
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
      { 'address.country': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOption = {};
  sortOption[sort] = order === 'asc' ? 1 : -1;

  return this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate('owner', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('updatedBy', 'name email profileImage');
};

// Instance methods
CompanySchema.methods.updateActivity = async function(userId, activityType) {
  this.lastActivityDate = new Date();
  this.lastActivityType = activityType;
  this.lastActivityBy = userId;
  this.updatedBy = userId;
  return this.save();
};

CompanySchema.methods.addNote = async function(content, userId) {
  this.notes.push({
    content,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  await this.updateActivity(userId, 'note_added');
  return this;
};

CompanySchema.methods.addTag = async function(tag, userId) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    await this.updateActivity(userId, 'tag_added');
  }
  return this;
};

CompanySchema.methods.removeTag = async function(tag, userId) {
  this.tags = this.tags.filter(t => t !== tag);
  await this.updateActivity(userId, 'tag_removed');
  return this;
};

CompanySchema.methods.addCustomField = async function(key, value, userId) {
  this.customFields.set(key, value);
  await this.updateActivity(userId, 'custom_field_added');
  return this;
};

CompanySchema.methods.removeCustomField = async function(key, userId) {
  this.customFields.delete(key);
  await this.updateActivity(userId, 'custom_field_removed');
  return this;
};

// Pre-save middleware
CompanySchema.pre('save', function(next) {
  // Ensure tags are unique
  if (this.tags) {
    this.tags = [...new Set(this.tags)];
  }
  next();
});

const Company = mongoose.model('Company', CompanySchema);

export default Company;