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

// Middleware to check if the user has the admin role in a specific crm
export const requireAdminRole = () => {
  return (req, res, next) => {
    try{
      const projectId = req.params.projectId || req.query.projectId;
      if (!req.user) {
        throw new Error('Authentication required');
      }
      const userRole = req.user.getProjectRole(projectId);
      if (!userRole || userRole !== 'admin') {
        throw new Error('Insufficient permissions to access this project');
      }
      return next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
  }
};

// Middleware to check if the user has the owner role in a specific crm
export const requireOwnerRole = () => {
  return (req, res, next) => {
    try{
      const projectId = req.params.projectId || req.query.projectId;
    if (!req.user) {
      throw new Error('Authentication required');
    }
    const userRole = req.user.getProjectRole(projectId);
    if (!userRole || ['admin', 'owner'].includes(userRole)) {
      throw new Error('Insufficient permissions to access this project');
    }
    return next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
  };
};

// Middleware to check if the user has the manager role in a specific crm
export const requireManagerRole = () => {
  return (req, res, next) => {
    try{
      const projectId = req.params.projectId || req.query.projectId;
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const userRole = req.user.getProjectRole(projectId);
    if (!userRole || !['admin', 'owner', 'manager'].includes(userRole)) {
      throw new Error('Insufficient permissions to access this project');
    }
    return next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
  };
};

// Middleware to check if the user has the sales executive role in a specific crm
export const requireSalesExecutiveRole = () => {
  return (req, res, next) => {
    try{
      const projectId = req.params.projectId || req.query.projectId;
    if (!req.user) {
      throw new Error('Authentication required');
    }
    const userRole = req.user.getProjectRole(projectId);
    if (!userRole || !['admin', 'owner', 'manager', 'sales_executive'].includes(userRole)) {
      throw new Error('Insufficient permissions to access this project');
    }
    return next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
  };
};

// Middleware to check if the user has the support executive role in a specific crm
export const requireSupportExecutiveRole = () => {
  return (req, res, next) => {
    try{
      const projectId = req.params.projectId || req.query.projectId;
    if (!req.user) {
      throw new Error('Authentication required');
    }
    const userRole = req.user.getProjectRole(projectId);
    if (!userRole || !['admin', 'owner', 'manager', 'sales_executive', 'support_executive'].includes(userRole)) {
      throw new Error('Insufficient permissions to access this project');
    }
    return next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
  };
};

// Middleware to check if the user has the viewer role in a specific crm
export const requireViewerRole = () => {
  return (req, res, next) => {
    try{
      const projectId = req.params.projectId || req.query.projectId;
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const userRole = req.user.getProjectRole(projectId);
    if (!userRole || !['admin', 'owner', 'manager', 'sales_executive', 'support_executive', 'viewer'].includes(userRole)) {
      throw new Error('Insufficient permissions');
    }

    return next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
  };
};



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

// Middleware to add project context to request
export const addProjectContext = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const projectId = req.params?.projectId || req.body?.projectId || req.query?.projectId;
  
  if (projectId) {
    req.projectId = projectId;
    req.userProjectRole = req.user.getProjectRole(projectId);
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
  addProjectContext
}; 