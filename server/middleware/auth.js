import { verifyAccessToken } from '../config/jwt.js';
import User from '../models/User.model.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error:", error.message);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Middleware to check if user has required global role
export const requireGlobalRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!roles.includes(req.user.roleGlobal)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient global permissions',
        code: 'INSUFFICIENT_GLOBAL_PERMISSIONS'
      });
    }

    next();
  };
};

// Middleware to check if user is system admin
export const requireSystemAdmin = requireGlobalRole('system-admin');

// Middleware to check if user is system admin or regular user
export const requireUser = requireGlobalRole('user', 'system-admin');

// Middleware to check if user is verified
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_VERIFICATION_REQUIRED'
    });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Middleware to add tenant context to request
export const addTenantContext = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const tenantId = req.params?.tenantId || req.body?.tenantId || req.query?.tenantId;
  
  if (tenantId) {
    req.tenantId = tenantId;
    req.userTenantRole = req.user.getTenantRole(tenantId);
  }
  
  next();
};

export default {
  authenticateToken,
  requireGlobalRole,
  requireSystemAdmin,
  requireUser,
  requireEmailVerification,
  optionalAuth,
  addTenantContext
}; 