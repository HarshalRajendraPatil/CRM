import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, "Project is required"]
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Inviter is required"]
  },
  invitee: {
    email: {
      type: String,
      required: [true, "Invitee email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address"
      ]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
      message: "Role must be one of: admin, manager, sales_executive, support_executive, viewer"
    },
    default: 'viewer'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'declined', 'expired', 'revoked'],
      message: "Status must be one of: pending, accepted, declined, expired, revoked"
    },
    default: 'pending'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  message: {
    type: String,
    maxlength: [500, "Message cannot exceed 500 characters"]
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default expiration is 7 days from now
      const now = new Date();
      return new Date(now.setDate(now.getDate() + 7));
    }
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  lastSentAt: {
    type: Date,
    default: function() {
      return new Date();
    }
  },
  resendCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
invitationSchema.index({ token: 1 });
invitationSchema.index({ "invitee.email": 1 });
invitationSchema.index({ project: 1, "invitee.email": 1 });
invitationSchema.index({ status: 1, expiresAt: 1 });

// Method to check if invitation is expired
invitationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date() || this.status === 'expired';
};

// Method to check if invitation is valid
invitationSchema.methods.isValid = function() {
  return this.status === 'pending' && !this.isExpired();
};

// Static method to find pending invitations for an email
invitationSchema.statics.findPendingByEmail = function(email) {
  return this.find({
    "invitee.email": email.toLowerCase(),
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('project', 'name description logo').populate('inviter', 'name email profileImage');
};

// Static method to find invitation by token
invitationSchema.statics.findByToken = function(token) {
  return this.findOne({ token })
    .populate('project')
    .populate('inviter', 'name email profileImage');
};

// Static method to find pending invitations for a project
invitationSchema.statics.findByProject = function(projectId) {
  return this.find({
    project: projectId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('invitee.user', 'name email profileImage').populate('inviter', 'name email profileImage');
};

// Pre-save middleware to ensure email is lowercase
invitationSchema.pre('save', function(next) {
  if (this.isModified('invitee.email')) {
    this.invitee.email = this.invitee.email.toLowerCase();
  }
  next();
});

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;