// Application Status Types
export type ApplicationStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"

// Main Application Interface
export interface Application {
  id: string | number;
  student: string;
  company: string;
  firstName: string;
  lastName: string;
  fieldOfStudy: string;
  year: string;
  github: string;
  linkedin: string;
  cv: File | string | null;
  resume?: File | string | null;
  status: ApplicationStatus | string;
  submittedAt: string;
  company_id: string;
  applicationId?: string;
  createdAt?: string;
  updatedAt?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  created_at?: string;
  academic_year?: string;
}

// Form Data Interface (matches your JSON payload)
export interface ApplicationFormData {
  first_name: string;
  last_name: string;
  department: string;
  academic_year: string;
  email: string;
  github_link: string;
  linkedin_link: string;
  company_id: string;
  cv: File;
  resume: File;
}

// API Response Interface (matches your backend response)
export interface ApplicationApiResponse {
  message: string;
  application_id: string;
  success?: boolean;
  data?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    academic_year: string;
    company_id: string;
    created_at: string;
  };
}

// Form Errors Interface
export interface FormErrors {
  first_name?: string;
  last_name?: string;
  department?: string;
  academic_year?: string;
  email?: string;
  github_link?: string;
  linkedin_link?: string;
  cv?: string;
  resume?: string;
  [key: string]: string | undefined;
}

// Application List Response (for fetching applications)
export interface ApplicationsListResponse {
  success: boolean;
  data: {
    applications: Application[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Single Application Response
export interface ApplicationDetailResponse {
  success: boolean;
  data: {
    application: Application;
  };
}

// Application Statistics (for dashboard)
export interface ApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  inReviewApplications: number;
}

// Company Interface (for company_id reference)
export interface Company {
  id: string;
  name: string;
  email: string;
  website?: string;
  description?: string;
  logo?: string;
  createdAt?: string;
}

// Student Interface (for user data)
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  academicYear?: string;
  github?: string;
  linkedin?: string;
}

// University Interface (for university dashboard)
export interface University {
  id: string;
  name: string;
  email: string;
  departments?: string[];
}

// Advisor Interface
export interface Advisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  students?: string[]; // Array of student IDs
}

// Evaluation Interface (for performance reviews)
export interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  companyId: string;
  companyName: string;
  advisorId: string;
  advisorName: string;
  score: string;
  status: "Completed" | "In Review" | "Pending";
  comments?: string;
  date: string;
  progress: number;
}

export interface BackendApplication {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  academic_year: string;
  email: string;
  github_link: string;
  linkedin_link: string;
  cv_url: string;
  resume_url: string;
  company_id: string;
  status: string;
  created_at: string;
  university_id: string;
}
