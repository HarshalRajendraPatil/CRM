import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const dealActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['note', 'email', 'call', 'meeting', 'status_change', 'value_change', 'attachment', 'custom'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const dealNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
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
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  }
});


const dealProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  productId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});


const dealSchema = new mongoose.Schema({
  dealNumber: {
    type: String,
    default: () => `DEAL-${nanoid(8).toUpperCase()}`,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  value: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR']
  },
  status: {
    type: String,
    enum: ['open', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost', 'on-hold'],
    default: 'open',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  expectedCloseDate: {
    type: Date,
    index: true
  },
  actualCloseDate: {
    type: Date
  },
  source: {
    type: String,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String,
    position: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [dealProductSchema],
  activities: [dealActivitySchema],
  notes: [dealNoteSchema],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lossReason: {
    type: String
  },
  winReason: {
    type: String
  },
  competitors: [{
    name: String,
    strengths: String,
    weaknesses: String,
    status: {
      type: String,
      enum: ['active', 'won', 'lost'],
      default: 'active'
    }
  }],
  nextAction: {
    type: String
  },
  nextActionDate: {
    type: Date
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for common queries
dealSchema.index({ projectId: 1, isArchived: 1 });
dealSchema.index({ projectId: 1, status: 1 });
dealSchema.index({ projectId: 1, assignedTo: 1 });
dealSchema.index({ projectId: 1, expectedCloseDate: 1 });
dealSchema.index({ projectId: 1, createdAt: 1 });
dealSchema.index({ projectId: 1, value: 1 });
dealSchema.index({ customer: 1, projectId: 1 });
dealSchema.index({ company: 1, projectId: 1 });
dealSchema.index({ 'tags': 1, projectId: 1 });

// Virtual for total deal value
dealSchema.virtual('totalValue').get(function() {
  if (!this.products || this.products.length === 0) {
    return this.value;
  }
  
  return this.products.reduce((total, product) => total + product.totalPrice, 0);
});


// Method to calculate deal age in days
dealSchema.methods.ageInDays = function() {
  const now = new Date();
  return Math.floor((now - this.createdAt) / (1000 * 60 * 60 * 24));
};

// Method to add activity
dealSchema.methods.addActivity = function(activityData) {
  this.activities.push(activityData);
  return this.save();
};


// Method to update deal status
dealSchema.methods.updateStatus = function(newStatus, userId, reason = '') {
  const oldStatus = this.status;
  this.status = newStatus;

  // Add activity for status change
  this.activities.push({
    type: 'status_change',
    description: `Status changed from ${oldStatus} to ${newStatus}${reason ? ': ' + reason : ''}`,
    createdBy: userId,
    metadata: {
      oldStatus,
      newStatus,
      reason
    }
  });
  
  // If deal is won or lost, set the actual close date
  if (newStatus === 'closed-won' || newStatus === 'closed-lost') {
    this.actualCloseDate = new Date();
    
    if (newStatus === 'closed-won') {
      this.winReason = reason;
    } else if (newStatus === 'closed-lost') {
      this.lossReason = reason;
    }
  }
  
  return this.save();
};

// Pre-save hook to update probability based on stage if not manually set
dealSchema.pre('save', function(next) {
  // Logic to auto-update probability based on stage could go here
  next();
});

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;
