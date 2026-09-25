// API Configuration
// Centralized API endpoint management for security and maintainability

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Public endpoints (no authentication required)
export const PUBLIC_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/register`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  }
};

// Protected endpoints (authentication required)
export const PROTECTED_ENDPOINTS = {
  // Company endpoints
  COMPANY: {
    APPLICATIONS: `${API_BASE_URL}/api/applications/company`,
    APPLICATIONS_STATS: `${API_BASE_URL}/api/applications/company/stats`,
    MENTORS: `${API_BASE_URL}/api/mentors`,
    INTERNSHIP_POSTS: `${API_BASE_URL}/api/internship-posts`,
  },
  
  // University endpoints
  UNIVERSITY: {
    APPLICATIONS: `${API_BASE_URL}/api/applications/university`,
    ADVISORS: `${API_BASE_URL}/api/advisors`,
    ASSIGNED_STUDENTS: `${API_BASE_URL}/api/advisors/all-students`,
  },
  
  // Shared endpoints
  APPLICATIONS: {
    SUBMIT: `${API_BASE_URL}/api/applications`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/applications/${id}`,
    REVIEW: (id: string) => `${API_BASE_URL}/api/applications/${id}/review`,
  },
  
  MESSAGES: `${API_BASE_URL}/api/messages`,
};

// Admin endpoints (admin role required)
// Note: Using obfuscated path for additional security
// Combined with proper authentication and authorization on backend
export const ADMIN_ENDPOINTS = {
  STATS: `${API_BASE_URL}/api/secure/management/stats`,
  ACTIVITIES: `${API_BASE_URL}/api/secure/management/activities`,
  USERS: `${API_BASE_URL}/api/secure/management/users`,
  USER_BY_ID: (userId: string) => `${API_BASE_URL}/api/secure/management/users/${userId}`,
  UPDATE_USER_ROLE: (userId: string) => `${API_BASE_URL}/api/secure/management/users/${userId}/role`,
  UPDATE_USER_STATUS: (userId: string) => `${API_BASE_URL}/api/secure/management/users/${userId}/status`,
  RESET_PASSWORD: (userId: string) => `${API_BASE_URL}/api/secure/management/users/${userId}/reset-password`,
  DELETE_USER: (userId: string) => `${API_BASE_URL}/api/secure/management/users/${userId}`,
  UNIVERSITIES: `${API_BASE_URL}/api/secure/management/universities`,
  COMPANIES: `${API_BASE_URL}/api/secure/management/companies`,
  MESSAGES: `${API_BASE_URL}/api/secure/management/messages`,
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  if (!params) return endpoint;
  
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return `${endpoint}?${queryString}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export default API_BASE_URL;
