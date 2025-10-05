// Enumeration of user roles
export const USER_ROLES = {
  PDG: 'pdg',
  DIRECTOR: 'director',
  SECRETARY: 'secretary'
};

// Define permissions for each role
export const PERMISSIONS = {
  // PDG - FULL ACCESS
  [USER_ROLES.PDG]: [
    'manage_users', 'system_config', 'all_reports', 'all_data_access',
    'manage_students', 'manage_teachers', 'manage_classes', 'manage_subjects',
    'manage_grades', 'manage_fees', 'manage_schedules', 'manage_finances',
    'manage_hierarchy', 'manage_communications', 'manage_staff', 'approve_actions',
    'manage_salaries', 'generate_financial_reports', 'view_accounting_data',
    'manage_enrollments', 'generate_certificates', 'manage_attendance'
  ],

  // Director - GENERAL SUPERVISION
  [USER_ROLES.DIRECTOR]: [
    'manage_users', 'view_all_reports', 'approve_actions', 'view_finances', 'manage_staff',
    'view_students', 'view_teachers', 'view_classes', 'view_schedules',
    'view_hierarchy', 'manage_communications', 'manage_students', 'manage_teachers',
    'manage_classes', 'manage_subjects', 'manage_grades', 'manage_fees',
    'manage_schedules', 'manage_finances', 'generate_financial_reports',
    'manage_enrollments', 'generate_certificates', 'manage_attendance'
  ],

  // Secretary - READ-ONLY ACCESS (Consultation uniquement)
  [USER_ROLES.SECRETARY]: [
    'view_students', 'view_teachers', 'view_classes', 'view_subjects',
    'view_fees', 'view_finances', 'view_schedules', 'generate_certificates'
  ]
};

// Function to check if a user has a specific permission
export const hasPermission = (userRole: string, permission: string): boolean => {
  if (!userRole || !permission) return false;

  // PDG has all permissions
  if (userRole === USER_ROLES.PDG) return true;

  // Check if the user's role has the specific permission
  return PERMISSIONS[userRole]?.includes(permission) || false;
};

// Function to check if a user has any of the specified roles
export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  if (!userRole || !allowedRoles || allowedRoles.length === 0) return false;
  return allowedRoles.includes(userRole);
};

// Get all permissions for a specific role
export const getRolePermissions = (role: string): string[] => {
  return PERMISSIONS[role] || [];
};

// Get all available roles
export const getAllRoles = (): string[] => {
  return Object.values(USER_ROLES);
};

// Get role display name
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case USER_ROLES.PDG:
      return 'PDG';
    case USER_ROLES.DIRECTOR:
      return 'Directeur / Directrice';
    case USER_ROLES.SECRETARY:
      return 'Secrétaire';
    default:
      return 'Utilisateur';
  }
};

// Get role badge color
export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case USER_ROLES.PDG:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case USER_ROLES.DIRECTOR:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case USER_ROLES.SECRETARY:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Check if user can modify data (create, update, delete)
export const canModifyData = (userRole: string): boolean => {
  return userRole === USER_ROLES.PDG || userRole === USER_ROLES.DIRECTOR;
};