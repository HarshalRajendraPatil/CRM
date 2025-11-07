import { AppError } from './errorHandler.js';

// Define permissions for each role
const ROLE_PERMISSIONS = {
  owner: {
    // Full access to everything
    leads: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'convert', 'assign', 'bulk_operations'],
    companies: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'assign', 'bulk_operations'],
    customers: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'assign', 'bulk_operations'],
    deals: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'assign', 'bulk_operations'],
    tasks: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'assign', 'bulk_operations'],
    projects: ['create', 'read', 'update', 'delete', 'manage_members', 'manage_settings'],
    reports: ['create', 'read', 'export'],
    settings: ['read', 'update'],
    notifications: ['read', 'create', 'manage']
  },
  admin: {
    // Almost full access, can't delete projects or manage system settings
    leads: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'convert', 'assign', 'bulk_operations'],
    companies: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'assign', 'bulk_operations'],
    customers: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'assign', 'bulk_operations'],
    deals: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'assign', 'bulk_operations'],
    tasks: ['create', 'read', 'update', 'delete', 'archive', 'unarchive', 'assign', 'bulk_operations'],
    projects: ['read', 'update', 'manage_members'],
    reports: ['create', 'read', 'export'],
    settings: ['read', 'update'],
    notifications: ['read', 'create', 'manage']
  },
  manager: {
    // Can manage team and most operations, limited delete permissions
    leads: ['create', 'read', 'update', 'archive', 'convert', 'assign', 'bulk_operations'],
    companies: ['create', 'read', 'update', 'archive', 'assign', 'bulk_operations'],
    customers: ['create', 'read', 'update', 'archive', 'assign', 'bulk_operations'],
    deals: ['create', 'read', 'update', 'archive', 'assign', 'bulk_operations'],
    tasks: ['create', 'read', 'update', 'delete', 'archive', 'assign', 'bulk_operations'],
    projects: ['read', 'manage_members'],
    reports: ['create', 'read', 'export'],
    settings: ['read'],
    notifications: ['read', 'create']
  },
  sales_executive: {
    // Focused on sales activities
    leads: ['create', 'read', 'update', 'convert', 'assign'],
    companies: ['create', 'read', 'update', 'assign'],
    customers: ['create', 'read', 'update', 'assign'],
    deals: ['create', 'read', 'update', 'assign'],
    tasks: ['create', 'read', 'update', 'assign'],
    projects: ['read'],
    reports: ['read', 'export'],
    settings: ['read'],
    notifications: ['read']
  },
  support_executive: {
    // Focused on customer support
    leads: ['read', 'update'],
    companies: ['read', 'update'],
    customers: ['create', 'read', 'update', 'assign'],
    deals: ['read', 'update'],
    tasks: ['create', 'read', 'update', 'assign'],
    projects: ['read'],
    reports: ['read'],
    settings: ['read'],
    notifications: ['read']
  },
  viewer: {
    // Read-only access
    leads: ['read'],
    companies: ['read'],
    customers: ['read'],
    deals: ['read'],
    tasks: ['read'],
    projects: ['read'],
    reports: ['read'],
    settings: ['read'],
    notifications: ['read']
  }
};

// Define entity-specific permissions
const ENTITY_PERMISSIONS = {
  leads: {
    create: ['owner', 'admin', 'manager', 'sales_executive'],
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    update: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    delete: ['owner', 'admin'],
    archive: ['owner', 'admin', 'manager'],
    unarchive: ['owner', 'admin', 'manager'],
    convert: ['owner', 'admin', 'manager', 'sales_executive'],
    assign: ['owner', 'admin', 'manager', 'sales_executive'],
    bulk_operations: ['owner', 'admin', 'manager']
  },
  companies: {
    create: ['owner', 'admin', 'manager', 'sales_executive'],
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    update: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    delete: ['owner', 'admin'],
    archive: ['owner', 'admin', 'manager'],
    unarchive: ['owner', 'admin', 'manager'],
    assign: ['owner', 'admin', 'manager', 'sales_executive'],
    bulk_operations: ['owner', 'admin', 'manager']
  },
  customers: {
    create: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    update: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    delete: ['owner', 'admin'],
    archive: ['owner', 'admin', 'manager'],
    unarchive: ['owner', 'admin', 'manager'],
    assign: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    bulk_operations: ['owner', 'admin', 'manager']
  },
  deals: {
    create: ['owner', 'admin', 'manager', 'sales_executive'],
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    update: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    delete: ['owner', 'admin'],
    archive: ['owner', 'admin', 'manager'],
    unarchive: ['owner', 'admin', 'manager'],
    assign: ['owner', 'admin', 'manager', 'sales_executive'],
    bulk_operations: ['owner', 'admin', 'manager']
  },
  tasks: {
    create: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    update: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    delete: ['owner', 'admin', 'manager'],
    archive: ['owner', 'admin', 'manager'],
    unarchive: ['owner', 'admin', 'manager'],
    assign: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive'],
    bulk_operations: ['owner', 'admin', 'manager']
  },
  projects: {
    create: ['owner'],
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    update: ['owner', 'admin'],
    delete: ['owner'],
    manage_members: ['owner', 'admin', 'manager'],
    manage_settings: ['owner', 'admin']
  },
  reports: {
    create: ['owner', 'admin', 'manager'],
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    export: ['owner', 'admin', 'manager', 'sales_executive']
  },
  settings: {
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    update: ['owner', 'admin']
  },
  notifications: {
    read: ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'],
    create: ['owner', 'admin', 'manager'],
    manage: ['owner', 'admin']
  }
};

// Helper function to check if user has permission
export const hasPermission = (userRole, entity, action) => {
  if (!userRole || !entity || !action) {
    return false;
  }

  // System admin has all permissions
  if (userRole === 'system-admin') {
    return true;
  }

  // Check if the role has the specific permission
  const allowedRoles = ENTITY_PERMISSIONS[entity]?.[action];
  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(userRole);
};

// Helper function to get user's effective role in a project
export const getUserProjectRole = (user, projectId) => {
  if (!user || !projectId) {
    return null;
  }

  // Check if user owns the project
  if (user.ownedTenants && user.ownedTenants.includes(projectId)) {
    return 'owner';
  }

  // Check if user is a member of the project
  if (user.memberTenants) {
    const membership = user.memberTenants.find(m => 
      m.tenant.toString() === projectId.toString()
    );
    if (membership) {
      return membership.role;
    }
  }

  return null;
};

// Middleware to check project access
export const requireProjectAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  const projectId = req.params.projectId || req.params.id || req.body.projectId;
  
  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'Project ID is required',
      code: 'PROJECT_ID_REQUIRED'
    });
  }

  const userRole = getUserProjectRole(req.user, projectId);
  
  if (!userRole) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this project',
      code: 'PROJECT_ACCESS_DENIED'
    });
  }

  req.userProjectRole = userRole;
  req.projectId = projectId;
  next();
};

// Middleware to check specific permission
export const requirePermission = (entity, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const userRole = req.userProjectRole || req.user.roleGlobal;
    
    if (!hasPermission(userRole, entity, action)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions for ${action} on ${entity}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        required: { entity, action },
        userRole
      });
    }

    next();
  };
};

// Middleware to check multiple permissions (user needs at least one)
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const userRole = req.userProjectRole || req.user.roleGlobal;
    
    const hasAnyPermission = permissions.some(({ entity, action }) => 
      hasPermission(userRole, entity, action)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permissions,
        userRole
      });
    }

    next();
  };
};

// Middleware to check all permissions (user needs all)
export const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const userRole = req.userProjectRole || req.user.roleGlobal;
    
    const hasAllPermissions = permissions.every(({ entity, action }) => 
      hasPermission(userRole, entity, action)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permissions,
        userRole
      });
    }

    next();
  };
};

// Middleware to check if user can access specific resource
export const requireResourceAccess = (getResourceOwner) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        });
      }

      const userRole = req.userProjectRole || req.user.roleGlobal;
      
      // System admin and owners can access everything
      if (userRole === 'system-admin' || userRole === 'owner') {
        return next();
      }

      // Get resource owner
      const resourceOwner = await getResourceOwner(req);
      
      if (!resourceOwner) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check if user is the owner or has appropriate role
      const isOwner = resourceOwner.toString() === req.user._id.toString();
      const isManager = userRole === 'manager' || userRole === 'admin';
      
      if (!isOwner && !isManager) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking resource access',
        code: 'RESOURCE_ACCESS_ERROR'
      });
    }
  };
};

// Helper function to filter data based on user permissions
export const filterDataByPermissions = (data, userRole, entity) => {
  if (!data || !userRole || !entity) {
    return data;
  }

  // System admin and owners see everything
  if (userRole === 'system-admin' || userRole === 'owner') {
    return data;
  }

  // Apply role-based filtering
  const permissions = ROLE_PERMISSIONS[userRole]?.[entity] || [];
  
  // This is a placeholder - implement specific filtering logic based on your needs
  // For example, viewers might only see certain fields, or sales_executives might only see their assigned records
  
  return data;
};

// Export permission constants for use in other modules
export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  ARCHIVE: 'archive',
  UNARCHIVE: 'unarchive',
  ASSIGN: 'assign',
  CONVERT: 'convert',
  BULK_OPERATIONS: 'bulk_operations',
  MANAGE_MEMBERS: 'manage_members',
  MANAGE_SETTINGS: 'manage_settings',
  EXPORT: 'export'
};

export const ENTITIES = {
  LEADS: 'leads',
  COMPANIES: 'companies',
  CUSTOMERS: 'customers',
  DEALS: 'deals',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications'
};

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_EXECUTIVE: 'sales_executive',
  SUPPORT_EXECUTIVE: 'support_executive',
  VIEWER: 'viewer',
  SYSTEM_ADMIN: 'system-admin'
};

export default {
  hasPermission,
  getUserProjectRole,
  requireProjectAccess,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireResourceAccess,
  filterDataByPermissions,
  ROLE_PERMISSIONS,
  ENTITY_PERMISSIONS,
  PERMISSIONS,
  ENTITIES,
  ROLES
};
