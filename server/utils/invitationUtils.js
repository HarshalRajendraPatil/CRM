import crypto from 'crypto';

/**
 * Generate a secure random token for invitations
 * @returns {string} A random token
 */
export const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Validate invitation token format
 * @param {string} token - The invitation token to validate
 * @returns {Object} Validation result
 */
export const validateInvitationToken = (token) => {
  if (!token) {
    return { isValid: false, message: 'Invitation token is required' };
  }
  
  if (typeof token !== 'string' || token.length !== 64) {
    return { isValid: false, message: 'Invalid invitation token format' };
  }
  
  // Check if token is a valid hex string
  const hexRegex = /^[a-f0-9]+$/i;
  if (!hexRegex.test(token)) {
    return { isValid: false, message: 'Invalid invitation token format' };
  }
  
  return { isValid: true };
};

/**
 * Calculate expiration date for an invitation
 * @param {number} days - Number of days until expiration
 * @returns {Date} Expiration date
 */
export const calculateExpirationDate = (days = 7) => {
  const now = new Date();
  return new Date(now.setDate(now.getDate() + days));
};

export default {
  generateInvitationToken,
  validateInvitationToken,
  calculateExpirationDate
};