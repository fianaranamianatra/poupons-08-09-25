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

  // Secretary - ADMINISTRATIVE MANAGEMENT
  [USER_ROLES.SECRETARY]: [
    'manage_students', 'manage_fees', 'generate_certificates',
    'manage_communications', 'view_schedules', 'manage_enrollments',
    'view_students', 'view_classes', 'view_teachers', 'manage_attendance'
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