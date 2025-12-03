import User from '../models/User.model.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import { 
  validateName, 
  validateEmail, 
  validatePhone, 
  validateProfileImage, 
  validateGlobalRole,
  validateObjectId,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone
} from '../utils/validation.js';

// @desc    Get all users (with pagination and filtering)
// @route   GET /api/users
// @access  Private/SystemAdmin
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  // Filter by role
  if (req.query.role) {
    filter.roleGlobal = req.query.role;
  }
  
  // Filter by active status
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  
  // Filter by email verification status
  if (req.query.isEmailVerified !== undefined) {
    filter.isEmailVerified = req.query.isEmailVerified === 'true';
  }
  
  // Search by name or email
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const users = await User.find(filter)
    .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/SystemAdmin
export const getUserById = asyncHandler(async (req, res) => {
  // Check if user is system-admin
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { id } = req.params;
  
  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find user by ID
  const user = await User.findById(id)
    .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: { user }
  });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private/SystemAdmin
export const createUser = asyncHandler(async (req, res) => {
  // Check if user is system-admin
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { name, email, password, phone, profileImage, roleGlobal, isActive, isEmailVerified } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ValidationError('Name, email and password are required');
  }

  // Validate name
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    throw new ValidationError(nameValidation.message);
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    throw new ValidationError(emailValidation.message);
  }

  // Check if email already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }

  // Validate phone if provided
  if (phone) {
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      throw new ValidationError(phoneValidation.message);
    }
  }

  // Validate profile image if provided
  if (profileImage) {
    const imageValidation = validateProfileImage(profileImage);
    if (!imageValidation.isValid) {
      throw new ValidationError(imageValidation.message);
    }
  }

  // Validate role if provided
  if (roleGlobal) {
    const roleValidation = validateGlobalRole(roleGlobal);
    if (!roleValidation.isValid) {
      throw new ValidationError(roleValidation.message);
    }
  }

  // Create new user
  const user = await User.create({
    name: sanitizeName(name),
    email: sanitizeEmail(email),
    password,
    phone: phone ? sanitizePhone(phone) : undefined,
    profileImage,
    roleGlobal: roleGlobal || 'user',
    isActive: isActive !== undefined ? isActive : true,
    isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : false
  });

  // Remove sensitive data from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    roleGlobal: user.roleGlobal,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt
  };

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: userResponse }
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/SystemAdmin
export const updateUser = asyncHandler(async (req, res) => {
  // Check if user is system-admin
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { id } = req.params;
  const { name, email, phone, profileImage, roleGlobal, isActive, isEmailVerified } = req.body;

  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find user by ID
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Validate and update fields if provided
  if (name !== undefined) {
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      throw new ValidationError(nameValidation.message);
    }
    user.name = sanitizeName(name);
  }

  if (email !== undefined) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      throw new ValidationError(emailValidation.message);
    }
    
    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new ValidationError('Email is already in use');
      }
      user.email = sanitizeEmail(email);
    }
  }

  if (phone !== undefined) {
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      throw new ValidationError(phoneValidation.message);
    }
    user.phone = phone ? sanitizePhone(phone) : undefined;
  }

  if (profileImage !== undefined) {
    const imageValidation = validateProfileImage(profileImage);
    if (!imageValidation.isValid) {
      throw new ValidationError(imageValidation.message);
    }
    user.profileImage = profileImage;
  }

  if (roleGlobal !== undefined) {
    const roleValidation = validateGlobalRole(roleGlobal);
    if (!roleValidation.isValid) {
      throw new ValidationError(roleValidation.message);
    }
    
    // Prevent removing the last system-admin
    if (user.roleGlobal === 'system-admin' && roleGlobal !== 'system-admin') {
      const adminCount = await User.countDocuments({ roleGlobal: 'system-admin' });
      if (adminCount <= 1) {
        throw new ValidationError('Cannot change role: At least one system admin must exist');
      }
    }
    
    user.roleGlobal = roleGlobal;
  }

  if (isActive !== undefined) {
    // Prevent deactivating the last system-admin
    if (user.roleGlobal === 'system-admin' && !isActive) {
      const activeAdminCount = await User.countDocuments({ 
        roleGlobal: 'system-admin',
        isActive: true
      });
      
      if (activeAdminCount <= 1) {
        throw new ValidationError('Cannot deactivate: At least one active system admin must exist');
      }
    }
    
    user.isActive = isActive;
  }

  if (isEmailVerified !== undefined) {
    user.isEmailVerified = isEmailVerified;
    
    // Clear verification token if email is verified
    if (isEmailVerified) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
    }
  }

  // Save updated user
  await user.save();

  // Remove sensitive data from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    roleGlobal: user.roleGlobal,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: userResponse }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SystemAdmin
export const deleteUser = asyncHandler(async (req, res) => {
  // Check if user is system-admin
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { id } = req.params;

  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find user by ID
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Prevent deleting the last system-admin
  if (user.roleGlobal === 'system-admin') {
    const adminCount = await User.countDocuments({ roleGlobal: 'system-admin' });
    if (adminCount <= 1) {
      throw new ValidationError('Cannot delete: At least one system admin must exist');
    }
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    throw new ValidationError('Cannot delete your own account');
  }

  // Delete user
  await User.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/SystemAdmin
export const resetUserPassword = asyncHandler(async (req, res) => {
  // Check if user is system-admin
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { id } = req.params;
  const { newPassword } = req.body;

  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  if (!newPassword) {
    throw new ValidationError('New password is required');
  }

  // Find user by ID
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'User password reset successfully'
  });
});

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-status
// @access  Private/SystemAdmin
export const toggleUserStatus = asyncHandler(async (req, res) => {
  // Check if user is system-admin
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { id } = req.params;

  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find user by ID
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Prevent deactivating the last system-admin
  if (user.roleGlobal === 'system-admin' && user.isActive) {
    const activeAdminCount = await User.countDocuments({ 
      roleGlobal: 'system-admin',
      isActive: true
    });
    
    if (activeAdminCount <= 1) {
      throw new ValidationError('Cannot deactivate: At least one active system admin must exist');
    }
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user._id.toString()) {
    throw new ValidationError('Cannot deactivate your own account');
  }

  // Toggle status
  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { isActive: user.isActive }
  });
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private/SystemAdmin
export const getUserStats = asyncHandler(async (req, res) => {
  // Check if user is system-admin
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  // Get total users count
  const totalUsers = await User.countDocuments();
  
  // Get active users count
  const activeUsers = await User.countDocuments({ isActive: true });
  
  // Get system admin count
  const systemAdmins = await User.countDocuments({ roleGlobal: 'system-admin' });
  
  // Get verified users count
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  
  // Get users registered in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // Get users who logged in in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyActiveUsers = await User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      systemAdmins,
      verifiedUsers,
      newUsers,
      recentlyActiveUsers
    }
  });
});

// @desc    Get user activity logs (placeholder - would need a separate ActivityLog model)
// @route   GET /api/users/:id/activity
// @access  Private/SystemAdmin
export const getUserActivity = asyncHandler(async (req, res) => {
  // Check if user is system-admin
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { id } = req.params;

  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find user by ID
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // In a real implementation, you would fetch activity logs from a separate collection
  // For now, we'll just return a placeholder response
  res.json({
    success: true,
    message: 'Activity log functionality requires additional implementation',
    data: {
      userId: id,
      activities: [
        {
          type: 'login',
          timestamp: user.lastLogin || new Date(),
          details: 'User logged in'
        }
      ]
    }
  });
});

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  getUserStats,
  getUserActivity
}; 