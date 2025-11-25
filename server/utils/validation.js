import mongoose from 'mongoose';

// Validation patterns
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s]+$/,
  url: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
};

// Validation functions
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!patterns.email.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password cannot exceed 128 characters' };
  }
  
  if (!patterns.password.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' 
    };
  }
  
  return { isValid: true };
};

export const validateName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (name.length > 50) {
    return { isValid: false, message: 'Name cannot exceed 50 characters' };
  }
  
  if (!patterns.name.test(name)) {
    return { isValid: false, message: 'Name can only contain letters and spaces' };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!patterns.phone.test(cleanPhone)) {
    return { isValid: false, message: 'Please provide a valid phone number' };
  }
  
  return { isValid: true };
};

export const validateProfileImage = (url) => {
  if (!url) {
    return { isValid: true }; // Profile image is optional
  }
  
  if (!patterns.url.test(url)) {
    return { isValid: false, message: 'Please provide a valid image URL' };
  }
  
  return { isValid: true };
};

export const validateGlobalRole = (role) => {
  const validGlobalRoles = ['user', 'system-admin'];
  
  if (!role) {
    return { isValid: false, message: 'Global role is required' };
  }
  
  if (!validGlobalRoles.includes(role)) {
    return { isValid: false, message: 'Invalid global role specified' };
  }
  
  return { isValid: true };
};

export const validateProjectRole = (role) => {
  const validProjectRoles = ['admin', 'manager', 'sales_executive', 'support_executive', 'viewer'];
  
  if (!role) {
    return { isValid: false, message: 'Project role is required' };
  }
  
  if (!validProjectRoles.includes(role)) {
    return { isValid: false, message: 'Invalid project role specified' };
  }
  
  return { isValid: true };
};

export const validateObjectId = (id) => {
  if (!id) {
    return { isValid: false, message: 'ID is required' };
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { isValid: false, message: 'Invalid ID format' };
  }
  
  return { isValid: true };
};

// Sanitization functions
export const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

export const sanitizeName = (name) => {
  return name.trim().replace(/\s+/g, ' ');
};

export const sanitizePhone = (phone) => {
  return phone.replace(/[\s\-\(\)]/g, '');
};

// Comprehensive validation for user registration
export const validateRegistrationData = (data) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  // Validate phone (optional)
  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
    }
  }
  
  // Validate profile image (optional)
  if (data.profileImage) {
    const imageValidation = validateProfileImage(data.profileImage);
    if (!imageValidation.isValid) {
      errors.profileImage = imageValidation.message;
    }
  }
  
  // Validate global role (optional, defaults to user)
  if (data.roleGlobal) {
    const roleValidation = validateGlobalRole(data.roleGlobal);
    if (!roleValidation.isValid) {
      errors.roleGlobal = roleValidation.message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Comprehensive validation for user login
export const validateLoginData = (data) => {
  const errors = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  
  // Validate password
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Comprehensive validation for password reset
export const validatePasswordResetData = (data) => {
  const errors = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Comprehensive validation for password change
export const validatePasswordChangeData = (data) => {
  const errors = {};
  
  // Validate current password
  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  // Validate new password
  const passwordValidation = validatePassword(data.newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.message;
  }
  
  // Validate password confirmation
  if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validation for project role assignment
export const validateProjectRoleAssignment = (data) => {
  const errors = {};
  
  // Validate project ID
  const projectIdValidation = validateObjectId(data.projectId);
  if (!projectIdValidation.isValid) {
    errors.projectId = projectIdValidation.message;
  }
  
  // Validate user ID
  const userIdValidation = validateObjectId(data.userId);
  if (!userIdValidation.isValid) {
    errors.userId = userIdValidation.message;
  }
  
  // Validate project role
  const roleValidation = validateProjectRole(data.role);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateProfileImage,
  validateGlobalRole,
  validateProjectRole,
  validateObjectId,
  sanitizeEmail,
  sanitizeName,
  sanitizePhone,
  validateRegistrationData,
  validateLoginData,
  validatePasswordResetData,
  validatePasswordChangeData,
  validateProjectRoleAssignment
}; 