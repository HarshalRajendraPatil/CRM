import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Generate access token
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { 
      userId, 
      type: 'access'
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'crm-platform',
      audience: 'crm-users'
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { 
      userId,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { 
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'crm-platform',
      audience: 'crm-users'
    }
  );
};

// Generate password reset token
export const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { 
      userId,
      type: 'password-reset'
    },
    JWT_SECRET,
    { 
      expiresIn: '1h',
      issuer: 'crm-platform',
      audience: 'crm-users'
    }
  );
};

// Generate email verification token
export const generateEmailVerificationToken = (userId) => {
  return jwt.sign(
    { 
      userId,
      type: 'email-verification'
    },
    JWT_SECRET,
    { 
      expiresIn: '24h',
      issuer: 'crm-platform',
      audience: 'crm-users'
    }
  );
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'crm-platform',
      audience: 'crm-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'crm-platform',
      audience: 'crm-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Verify password reset token
export const verifyPasswordResetToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'crm-platform',
      audience: 'crm-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired password reset token');
  }
};

// Verify email verification token
export const verifyEmailVerificationToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'crm-platform',
      audience: 'crm-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired email verification token');
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyPasswordResetToken,
  verifyEmailVerificationToken
}; 