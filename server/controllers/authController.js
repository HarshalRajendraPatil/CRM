import crypto from 'crypto';
import User from '../models/User.model.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generatePasswordResetToken, 
  generateEmailVerificationToken,
  verifyPasswordResetToken,
  verifyEmailVerificationToken,
  verifyRefreshToken
} from '../config/jwt.js';
import { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendPasswordChangedEmail, 
  sendEmailVerifiedEmail 
} from '../utils/emailService.js';
import { 
  validateRegistrationData, 
  validateLoginData, 
  validatePasswordResetData, 
  validatePasswordChangeData,
  validateName,
  validatePhone,
  validateProfileImage,
  sanitizeEmail,
  sanitizeName,
  sanitizePhone,
  validatePassword
} from '../utils/validation.js';
import { asyncHandler, ValidationError, AuthenticationError, NotFoundError } from '../middleware/errorHandler.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, profileImage, roleGlobal } = req.body;

  // Validate input data
  const validation = validateRegistrationData({ name, email, password, phone, profileImage, roleGlobal });
  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ValidationError('User with this email already exists', { email: 'Email already registered' });
  }

  // Sanitize data
  const sanitizedData = {
    name: sanitizeName(name),
    email: sanitizeEmail(email),
    password,
    phone: phone ? sanitizePhone(phone) : undefined,
    profileImage,
    roleGlobal: roleGlobal || 'user' // Default to 'user' instead of 'viewer'
  };

  // Create user
  const user = await User.create(sanitizedData);

  // Generate email verification token
  const verificationToken = generateEmailVerificationToken(user._id);
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  // Send welcome email with verification link
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  await sendWelcomeEmail(user.email, user.name, verificationUrl);

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove sensitive data from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    roleGlobal: user.roleGlobal,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input data
  const validation = validateLoginData({ email, password });
  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }

  // Find user by email and include password for comparison
  const user = await User.findByEmail(email).select('+password');
  
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new AuthenticationError('Account is temporarily locked due to too many failed login attempts. Please try again later.');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw new AuthenticationError('Invalid email or password');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove sensitive data from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    roleGlobal: user.roleGlobal,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId);
    console.log('user', user);
    console.log('user.isActive', user.isActive);
    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.log('error', error);
    throw new AuthenticationError('Invalid or expired refresh token');
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  const validation = validatePasswordResetData({ email });
  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken(user._id);
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Send password reset email
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user.email, user.name, resetUrl);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ValidationError('Token and new password are required');
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new ValidationError('Password validation failed', { newPassword: passwordValidation.message });
  }

  try {
    // Verify token
    const decoded = verifyPasswordResetToken(token);
    
    // Find user with reset token
    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send password changed email
    await sendPasswordChangedEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    throw new AuthenticationError('Invalid or expired reset token');
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ValidationError('Verification token is required');
  }

  try {
    // Verify token
    const decoded = verifyEmailVerificationToken(token);
    
    // Find user with verification token
    const user = await User.findOne({
      _id: decoded.userId,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired verification token');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send verification success email
    await sendEmailVerifiedEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    throw new AuthenticationError('Invalid or expired verification token');
  }
});

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    throw new ValidationError('Email is already verified');
  }

  // Generate new verification token
  const verificationToken = generateEmailVerificationToken(user._id);
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  await sendWelcomeEmail(user.email, user.name, verificationUrl);

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  const validation = validatePasswordChangeData({ currentPassword, newPassword, confirmPassword });
  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }

  // Find user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Send password changed email
  await sendPasswordChangedEmail(user.email, user.name);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    roleGlobal: user.roleGlobal,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.json({
    success: true,
    data: {
      user: userResponse
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profileImage } = req.body;

  const user = await User.findById(req.user._id);

  // Update fields if provided
  if (name !== undefined) {
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      throw new ValidationError('Name validation failed', { name: nameValidation.message });
    }
    user.name = sanitizeName(name);
  }

  if (phone !== undefined) {
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      throw new ValidationError('Phone validation failed', { phone: phoneValidation.message });
    }
    user.phone = phone ? sanitizePhone(phone) : undefined;
  }

  if (profileImage !== undefined) {
    const imageValidation = validateProfileImage(profileImage);
    if (!imageValidation.isValid) {
      throw new ValidationError('Profile image validation failed', { profileImage: imageValidation.message });
    }
    user.profileImage = profileImage;
  }

  await user.save();

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    roleGlobal: user.roleGlobal,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: userResponse
    }
  });
});

// @desc    Remove profile image
// @route   DELETE /api/auth/me/profile-image
// @access  Private
export const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Remove profile image
  user.profileImage = null;
  await user.save();

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    roleGlobal: user.roleGlobal,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.json({
    success: true,
    message: 'Profile image removed successfully',
    data: {
      user: userResponse
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // In a more sophisticated system, you might want to blacklist the token
  // For now, we'll just return a success response
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getMe,
  updateProfile,
  removeProfileImage,
  logout
}; 