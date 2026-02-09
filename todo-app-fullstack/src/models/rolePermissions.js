/**
 * Role-Based Permission System
 *
 * Defines the 5-tier role hierarchy and permission matrix for teams and projects.
 */

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY = {
  viewer: 0,
  member: 1,
  manager: 2,
  admin: 3,
  owner: 4
};

// All available roles
export const ROLES = ['viewer', 'member', 'manager', 'admin', 'owner'];

// Role display names and colors for UI
export const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    description: 'Full control over the project/team'
  },
  admin: {
    label: 'Admin',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    description: 'Manage members and settings'
  },
  manager: {
    label: 'Manager',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    description: 'Assign tasks and track progress'
  },
  member: {
    label: 'Member',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    description: 'Work on assigned tasks'
  },
  viewer: {
    label: 'Viewer',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    description: 'Read-only access'
  }
};

// Permission matrix - defines which roles can perform which actions
export const PERMISSIONS = {
  // Task Operations
  'task.view': ['viewer', 'member', 'manager', 'admin', 'owner'],
  'task.create': ['member', 'manager', 'admin', 'owner'],
  'task.edit': ['member', 'manager', 'admin', 'owner'],
  'task.delete': ['manager', 'admin', 'owner'],
  'task.assign': ['manager', 'admin', 'owner'],
  'task.updateProgress': ['member', 'manager', 'admin', 'owner'],
  'task.requestProgress': ['manager', 'admin', 'owner'],

  // Comment Operations
  'comment.view': ['viewer', 'member', 'manager', 'admin', 'owner'],
  'comment.create': ['member', 'manager', 'admin', 'owner'],
  'comment.edit': ['member', 'manager', 'admin', 'owner'], // Own comments only
  'comment.delete': ['manager', 'admin', 'owner'], // Own or any for managers+
  'comment.mention': ['member', 'manager', 'admin', 'owner'],

  // Member Operations
  'member.view': ['viewer', 'member', 'manager', 'admin', 'owner'],
  'member.add': ['admin', 'owner'],
  'member.remove': ['admin', 'owner'],
  'member.updateRole': ['admin', 'owner'],
  'member.invite': ['admin', 'owner'],

  // Team Operations (within team context)
  'team.view': ['viewer', 'member', 'manager', 'admin', 'owner'],
  'team.edit': ['admin', 'owner'],
  'team.delete': ['owner'],
  'team.addToProject': ['admin', 'owner'],
  'team.removeFromProject': ['admin', 'owner'],

  // Project Operations
  'project.view': ['viewer', 'member', 'manager', 'admin', 'owner'],
  'project.edit': ['admin', 'owner'],
  'project.delete': ['owner'],
  'project.archive': ['admin', 'owner'],
  'project.transfer': ['owner'],
  'project.addTeam': ['admin', 'owner'],
  'project.removeTeam': ['admin', 'owner'],

  // Settings Operations
  'settings.view': ['admin', 'owner'],
  'settings.edit': ['admin', 'owner'],

  // Notification Operations
  'notification.manage': ['admin', 'owner'],
  'notification.sendToAll': ['admin', 'owner']
};

/**
 * Check if a role has a specific permission
 * @param {string} userRole - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean} - Whether the role has the permission
 */
export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false;
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) {
    console.warn(`Unknown permission: ${permission}`);
    return false;
  }
  return allowedRoles.includes(userRole);
}

/**
 * Check if a role is at least as high as another role
 * @param {string} userRole - The user's role
 * @param {string} requiredRole - The minimum required role
 * @returns {boolean} - Whether the user's role is >= required role
 */
export function isRoleAtLeast(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  if (userLevel === undefined || requiredLevel === undefined) return false;
  return userLevel >= requiredLevel;
}

/**
 * Get the higher of two roles
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {string} - The higher role
 */
export function getHigherRole(role1, role2) {
  if (!role1) return role2;
  if (!role2) return role1;
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2] ? role1 : role2;
}

/**
 * Get all permissions for a given role
 * @param {string} role - The role to get permissions for
 * @returns {string[]} - Array of permission strings
 */
export function getPermissionsForRole(role) {
  if (!role) return [];
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission);
}

/**
 * Get roles that can perform a specific action
 * @param {string} permission - The permission to check
 * @returns {string[]} - Array of roles that have this permission
 */
export function getRolesWithPermission(permission) {
  return PERMISSIONS[permission] || [];
}

/**
 * Check if a user can modify another user's role
 * (Admins can't modify other admins or owners, only owners can modify admins)
 * @param {string} actorRole - The role of the user performing the action
 * @param {string} targetRole - The role of the user being modified
 * @returns {boolean} - Whether the action is allowed
 */
export function canModifyRole(actorRole, targetRole) {
  // Must be at least admin to modify roles
  if (!isRoleAtLeast(actorRole, 'admin')) return false;

  // Owners can modify anyone except other owners
  if (actorRole === 'owner') return targetRole !== 'owner';

  // Admins can only modify roles below them
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Get roles that a user can assign (must be lower than their own role)
 * @param {string} userRole - The user's role
 * @returns {string[]} - Array of assignable roles
 */
export function getAssignableRoles(userRole) {
  if (!isRoleAtLeast(userRole, 'admin')) return [];

  const userLevel = ROLE_HIERARCHY[userRole];
  return ROLES.filter(role => {
    // Owners can assign any role except owner
    if (userRole === 'owner') return role !== 'owner';
    // Others can only assign roles below them
    return ROLE_HIERARCHY[role] < userLevel;
  });
}

/**
 * Validate a role string
 * @param {string} role - The role to validate
 * @returns {boolean} - Whether the role is valid
 */
export function isValidRole(role) {
  return ROLES.includes(role);
}

/**
 * Get role configuration for UI display
 * @param {string} role - The role
 * @returns {object|null} - Role configuration or null if invalid
 */
export function getRoleConfig(role) {
  return ROLE_CONFIG[role] || null;
}

export default {
  ROLE_HIERARCHY,
  ROLES,
  ROLE_CONFIG,
  PERMISSIONS,
  hasPermission,
  isRoleAtLeast,
  getHigherRole,
  getPermissionsForRole,
  getRolesWithPermission,
  canModifyRole,
  getAssignableRoles,
  isValidRole,
  getRoleConfig
};
