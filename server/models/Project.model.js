import mongoose from "mongoose";

// Define the Stage schema for pipelines
const stageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Stage name is required"],
    trim: true,
    minlength: [2, "Stage name must be at least 2 characters long"],
    maxlength: [50, "Stage name cannot exceed 50 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Stage description cannot exceed 500 characters"]
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  color: {
    type: String,
    default: "#3B82F6", // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please provide a valid hex color"]
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Define the Pipeline schema
const pipelineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Pipeline name is required"],
    trim: true,
    minlength: [2, "Pipeline name must be at least 2 characters long"],
    maxlength: [50, "Pipeline name cannot exceed 50 characters"]
  },
  type: {
    type: String,
    enum: ['lead', 'customer', 'deal', 'task'],
    required: true,
    default: 'deal'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Pipeline description cannot exceed 500 characters"]
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  stages: [stageSchema]
}, {
  timestamps: true
});

// Define the Project schema
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Project name is required"],
    trim: true,
    minlength: [2, "Project name must be at least 2 characters long"],
    maxlength: [100, "Project name cannot exceed 100 characters"],
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Project owner is required"]
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
        message: "Role must be one of: admin, manager, sales_executive, support_executive, viewer"
      },
      default: 'viewer'
    },
    inviteStatus: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'declined'],
        message: "Invite status must be one of: pending, accepted, declined"
      },
      default: 'pending'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    joinedAt: {
      type: Date
    }
  }],
  visibility: {
    type: String,
    enum: {
      values: ['public', 'private', 'team'],
      message: "Visibility must be one of: public, private, team"
    },
    default: 'private'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [50, "Industry cannot exceed 50 characters"]
  },
  tags: [{
    type: String,
    trim: true
  }],
  timezone: {
    type: String,
    default: "UTC",
    trim: true
  },
  logo: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: "Please provide a valid image URL"
    }
  },
  pipelines: [pipelineSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    currency: {
      type: String,
      default: "USD"
    },
    dateFormat: {
      type: String,
      default: "MM/DD/YYYY"
    },
    timeFormat: {
      type: String,
      default: "12h"
    },
    language: {
      type: String,
      default: "en"
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
projectSchema.index({ owner: 1 });
projectSchema.index({ "members.user": 1 });
projectSchema.index({ name: "text", description: "text" });

// Method to check if user is a member
projectSchema.methods.isMember = function(userId) {
  if (this.owner.toString() === userId.toString()) return true;
  return this.members.some(member => 
    member.user._id.toString() === userId.toString() && 
    member.inviteStatus === 'accepted'
  );
};

// Method to get user's role in the project
projectSchema.methods.getUserRole = function(userId) {
  if (this.owner.toString() === userId.toString()) return 'owner';
  
  const member = this.members.find(member => 
    member.user._id.toString() === userId.toString() && 
    member.inviteStatus === 'accepted'
  );
  
  return member ? member.role : null;
};

// Method to check if user has specific permission
projectSchema.methods.hasPermission = function(userId, requiredRole) {
  const role = this.getUserRole(userId);
  if (!role) return false;
  
  if (role === 'owner') return true;
  
  const roleHierarchy = {
    'admin': 4,
    'manager': 3,
    'sales_executive': 2,
    'support_executive': 2,
    'viewer': 1
  };
  
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  const userLevel = roleHierarchy[role] || 0;
  
  return userLevel >= requiredLevel;
};

// Static method to find projects by user
projectSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { "members.user": userId, "members.inviteStatus": "accepted" }
    ]
  });
};

// Static method to find projects where user is invited
projectSchema.statics.findInvitesForUser = function(userId) {
  return this.find({
    "members.user": userId,
    "members.inviteStatus": "pending"
  });
};

// Pre-save middleware to ensure default pipelines exist for all types
projectSchema.pre('save', function(next) {
  const types = ['lead', 'customer', 'deal', 'task'];
  
  if (this.isNew || this.pipelines.length === 0) {
    this.pipelines = [];
  }
  
  types.forEach(type => {
    const hasTypePipeline = this.pipelines.some(p => p.type === type);
    if (!hasTypePipeline) {
      let defaultPipeline = {
        type,
        isDefault: true,
        stages: []
      };
      
      switch (type) {
        case 'lead':
          defaultPipeline.name = 'Default Lead Pipeline';
          defaultPipeline.description = 'Standard pipeline for leads';
          defaultPipeline.stages = [
            { name: 'New', order: 1, isDefault: true, color: '#9CA3AF' },
            { name: 'Contacted', order: 2, color: '#60A5FA' },
            { name: 'Qualified', order: 3, color: '#34D399' },
            { name: 'Disqualified', order: 4, color: '#F87171' }
          ];
          break;
        case 'customer':
          defaultPipeline.name = 'Default Customer Pipeline';
          defaultPipeline.description = 'Standard pipeline for customers';
          defaultPipeline.stages = [
            { name: 'Prospect', order: 1, isDefault: true, color: '#9CA3AF' },
            { name: 'Active', order: 2, color: '#34D399' },
            { name: 'Inactive', order: 3, color: '#FCD34D' },
            { name: 'Churned', order: 4, color: '#F87171' }
          ];
          break;
        case 'deal':
          defaultPipeline.name = 'Default Deal Pipeline';
          defaultPipeline.description = 'Standard pipeline for deals';
          defaultPipeline.stages = [
            { name: 'Qualification', order: 1, isDefault: true, color: '#60A5FA' },
            { name: 'Proposal', order: 2, color: '#A78BFA' },
            { name: 'Negotiation', order: 3, color: '#FCD34D' },
            { name: 'Closed Won', order: 4, color: '#34D399' },
            { name: 'Closed Lost', order: 5, color: '#9CA3AF' }
          ];
          break;
        case 'task':
          defaultPipeline.name = 'Default Task Pipeline';
          defaultPipeline.description = 'Standard pipeline for tasks';
          defaultPipeline.stages = [
            { name: 'Pending', order: 1, isDefault: true, color: '#9CA3AF' },
            { name: 'In Progress', order: 2, color: '#60A5FA' },
            { name: 'Review', order: 3, color: '#FCD34D' },
            { name: 'Completed', order: 4, color: '#34D399' }
          ];
          break;
      }
      this.pipelines.push(defaultPipeline);
    } else {
      // Ensure there is at least one default pipeline for this type
      const hasDefaultForType = this.pipelines.some(p => p.type === type && p.isDefault);
      if (!hasDefaultForType) {
        const firstOfType = this.pipelines.find(p => p.type === type);
        if (firstOfType) firstOfType.isDefault = true;
      }
    }
  });
  
  // Ensure each pipeline has at least one stage
  this.pipelines.forEach(pipeline => {
    if (pipeline.stages.length === 0) {
      pipeline.stages.push({
        name: 'New',
        order: 1,
        isDefault: true,
        color: '#9CA3AF'
      });
    }
    
    // Ensure at least one stage is default
    const hasDefaultStage = pipeline.stages.some(stage => stage.isDefault);
    if (!hasDefaultStage && pipeline.stages.length > 0) {
      pipeline.stages[0].isDefault = true;
    }
  });
  
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;