import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

// Permission constants
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

// Define permissions for each role
const ROLE_PERMISSIONS = {
  owner: {
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

// Hook to get user's role in current project
export const useUserRole = () => {
  const { user } = useSelector(state => state.auth);
  const { projectId } = useParams();
  
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

// Hook to check if user has specific permission
export const usePermission = (entity, action) => {
  const user = useSelector(state => state.auth.user);
  const userRole = useUserRole();
  
  if (!user || !userRole || !entity || !action) {
    return false;
  }

  // System admin has all permissions
  if (user.roleGlobal === 'system-admin') {
    return true;
  }

  // Check if the role has the specific permission
  const permissions = ROLE_PERMISSIONS[userRole]?.[entity];
  if (!permissions) {
    return false;
  }

  return permissions.includes(action);
};

// Hook to check multiple permissions (user needs at least one)
export const useAnyPermission = (permissions) => {
  const user = useSelector(state => state.auth.user);
  const userRole = useUserRole();
  
  if (!user || !userRole || !permissions || permissions.length === 0) {
    return false;
  }

  // System admin has all permissions
  if (user.roleGlobal === 'system-admin') {
    return true;
  }

  return permissions.some(({ entity, action }) => {
    const rolePermissions = ROLE_PERMISSIONS[userRole]?.[entity];
    return rolePermissions && rolePermissions.includes(action);
  });
};

// Hook to check all permissions (user needs all)
export const useAllPermissions = (permissions) => {
  const user = useSelector(state => state.auth.user);
  const userRole = useUserRole();
  
  if (!user || !userRole || !permissions || permissions.length === 0) {
    return false;
  }

  // System admin has all permissions
  if (user.roleGlobal === 'system-admin') {
    return true;
  }

  return permissions.every(({ entity, action }) => {
    const rolePermissions = ROLE_PERMISSIONS[userRole]?.[entity];
    return rolePermissions && rolePermissions.includes(action);
  });
};

// Hook to get all permissions for current user
export const useUserPermissions = () => {
  const user = useSelector(state => state.auth.user);
  const userRole = useUserRole();
  
  if (!user || !userRole) {
    return {};
  }

  // System admin has all permissions
  if (user.roleGlobal === 'system-admin') {
    return Object.keys(ROLE_PERMISSIONS).reduce((acc, role) => {
      acc[role] = ROLE_PERMISSIONS[role];
      return acc;
    }, {});
  }

  return ROLE_PERMISSIONS[userRole] || {};
};

// Hook to check if user can access project
export const useProjectAccess = () => {
  const user = useSelector(state => state.auth.user);
  const { projectId } = useParams();
  
  if (!user || !projectId) {
    return false;
  }

  // Check if user owns the project
  if (user.ownedTenants && user.ownedTenants.includes(projectId)) {
    return true;
  }

  // Check if user is a member of the project
  if (user.memberTenants) {
    return user.memberTenants.some(m => 
      m.tenant.toString() === projectId.toString()
    );
  }

  return false;
};

// Hook to check if user is project owner
export const useIsProjectOwner = () => {
  const user = useSelector(state => state.auth.user);
  const { projectId } = useParams();
  
  if (!user || !projectId) {
    return false;
  }

  return user.ownedTenants && user.ownedTenants.includes(projectId);
};

// Hook to check if user is project admin
export const useIsProjectAdmin = () => {
  const userRole = useUserRole();
  return userRole === 'admin' || userRole === 'owner';
};

// Hook to check if user can manage project members
export const useCanManageMembers = () => {
  return usePermission(ENTITIES.PROJECTS, PERMISSIONS.MANAGE_MEMBERS);
};

// Hook to check if user can manage project settings
export const useCanManageSettings = () => {
  return usePermission(ENTITIES.PROJECTS, PERMISSIONS.MANAGE_SETTINGS);
};

// Hook to check if user can perform bulk operations
export const useCanPerformBulkOperations = (entity) => {
  return usePermission(entity, PERMISSIONS.BULK_OPERATIONS);
};

// Hook to check if user can export data
export const useCanExport = (entity) => {
  return usePermission(entity, PERMISSIONS.EXPORT);
};

// Hook to check if user can create entities
export const useCanCreate = (entity) => {
  return usePermission(entity, PERMISSIONS.CREATE);
};

// Hook to check if user can update entities
export const useCanUpdate = (entity) => {
  return usePermission(entity, PERMISSIONS.UPDATE);
};

// Hook to check if user can delete entities
export const useCanDelete = (entity) => {
  return usePermission(entity, PERMISSIONS.DELETE);
};

// Hook to check if user can archive entities
export const useCanArchive = (entity) => {
  return usePermission(entity, PERMISSIONS.ARCHIVE);
};

// Hook to check if user can assign entities
export const useCanAssign = (entity) => {
  return usePermission(entity, PERMISSIONS.ASSIGN);
};

export default {
  useUserRole,
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useUserPermissions,
  useProjectAccess,
  useIsProjectOwner,
  useIsProjectAdmin,
  useCanManageMembers,
  useCanManageSettings,
  useCanPerformBulkOperations,
  useCanExport,
  useCanCreate,
  useCanUpdate,
  useCanDelete,
  useCanArchive,
  useCanAssign,
  PERMISSIONS,
  ENTITIES,
  ROLES
};
