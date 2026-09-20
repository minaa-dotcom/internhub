// Export all types from a single file for easier imports
export * from './Application';
export * from './User';
export * from './Props';
export * from './Response';

// Re-export commonly used types
export type {
  Application,
  ApplicationStatus,
  ApplicationFormData,
  ApplicationApiResponse,
  FormErrors,
  ApplicationStats
} from './Application';

export type {
  User,
  UserRole,
  AuthContextType,
  LoginRequest,
  LoginResponse
} from './User';

export type {
  ApplyInternshipDialogProps,
  AddAdvisorDialogProps,
  PaginationProps,
  FilterProps
} from './Props';