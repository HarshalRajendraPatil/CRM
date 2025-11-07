import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"],
    match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ],
    index: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    maxlength: [128, "Password cannot exceed 128 characters"],
    select: false // Don't include password in queries by default
  },
  profileImage: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: "Please provide a valid image URL"
    }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: "Please provide a valid phone number"
    }
  },
  roleGlobal: {
    type: String,
    enum: {
      values: ['user', 'system-admin'],
      message: "Role must be one of: user, system-admin"
    },
    default: 'user',
    required: true
  },
  // Multi-tenant fields
  ownedTenants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project' // This will be the CRM tenant model
  }],
  memberTenants: [{
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
      default: 'viewer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual to get all tenant memberships (owned + member)
userSchema.virtual('allTenants').get(function() {
  const owned = this.ownedTenants || [];
  const member = this.memberTenants ? this.memberTenants.map(m => m.tenant) : [];
  return [...owned, ...member];
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ roleGlobal: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ ownedTenants: 1 });
userSchema.index({ 'memberTenants.tenant': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to check if user owns a tenant
userSchema.methods.ownsTenant = function(tenantId) {
  return this.ownedTenants && this.ownedTenants.includes(tenantId);
};

// Instance method to check if user is member of a tenant
userSchema.methods.isMemberOf = function(tenantId) {
  return this.memberTenants && this.memberTenants.some(m => m.tenant.toString() === tenantId.toString());
};

// Instance method to get role in a specific tenant
userSchema.methods.getTenantRole = function(tenantId) {
  if (this.ownsTenant(tenantId)) {
    return 'owner';
  }
  
  const membership = this.memberTenants?.find(m => m.tenant.toString() === tenantId.toString());
  return membership ? membership.role : null;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find system admins
userSchema.statics.findSystemAdmins = function() {
  return this.find({ roleGlobal: 'system-admin', isActive: true });
};

// Static method to find users by tenant
userSchema.statics.findByTenant = function(tenantId) {
  return this.find({
    $or: [
      { ownedTenants: tenantId },
      { 'memberTenants.tenant': tenantId }
    ],
    isActive: true
  });
};

const User = mongoose.model('User', userSchema);

export default User;

