// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: process.env.REACT_APP_AUTH_TOKEN_KEY || 'auth_token',
  REFRESH_KEY: process.env.REACT_APP_AUTH_REFRESH_KEY || 'auth_refresh',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
};

// Feature Flags
export const FEATURE_FLAGS = {
  BULK_OPERATIONS: process.env.REACT_APP_ENABLE_BULK_OPERATIONS === 'true',
  ADVANCED_SEARCH: process.env.REACT_APP_ENABLE_ADVANCED_SEARCH === 'true',
  NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
  AUDIT_LOGS: process.env.REACT_APP_ENABLE_AUDIT_LOGS === 'true',
  DARK_MODE: process.env.REACT_APP_ENABLE_DARK_MODE === 'true',
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 20,
  MAX_PAGE_SIZE: parseInt(process.env.REACT_APP_MAX_PAGE_SIZE) || 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_TYPES: (process.env.REACT_APP_ALLOWED_FILE_TYPES || 'csv,json,xlsx').split(','),
  UPLOAD_ENDPOINT: '/upload',
};

// UI Configuration
export const UI_CONFIG = {
  DEFAULT_THEME: process.env.REACT_APP_DEFAULT_THEME || 'light',
  ANIMATION_DURATION: parseInt(process.env.REACT_APP_ANIMATION_DURATION) || 300,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
};

// Development Configuration
export const DEV_CONFIG = {
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
  MOCK_API: process.env.REACT_APP_MOCK_API === 'true',
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Projects
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id) => `/projects/${id}`,
  PROJECT_TOTALS: (id) => `/projects/${id}/totals`,
  RECENT_PROJECTS: '/projects/recent',
  
  // Materials
  MATERIALS: '/materials',
  MATERIAL_DETAIL: (id) => `/materials/${id}`,
  
  // Equipment
  EQUIPMENT: '/equipment',
  EQUIPMENT_DETAIL: (id) => `/equipment/${id}`,
  
  // Labour Roles
  LABOUR_ROLES: '/labour-roles',
  LABOUR_ROLE_DETAIL: (id) => `/labour-roles/${id}`,
  EFFECTIVE_RATE: (type, state) => `/labour-roles/rate/${type}/${state}`,
  
  // Quotes
  QUOTES: '/quotes',
  QUOTE_DETAIL: (id) => `/quotes/${id}`,
  QUOTE_ITEMS: (id) => `/quotes/${id}/items`,
  
  // Calculator
  CALCULATOR: '/calculator/rate-card',
  
  // Admin
  ADMIN_STATS: '/admin/dashboard/stats',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_ACTIVITY: '/admin/activity-feed',
  
  // Bulk Operations
  BULK_IMPORT: '/bulk/import',
  BULK_EXPORT: '/bulk/export',
  
  // Search
  SEARCH_PROJECTS: '/search/projects',
  SEARCH_MATERIALS: '/search/materials',
  SEARCH_EQUIPMENT: '/search/equipment',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  UNREAD_NOTIFICATIONS: '/notifications/unread',
  MARK_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  
  // System
  HEALTH: '/health',
  CONFIG: '/config',
  CONFIG_DETAIL: (key) => `/config/${key}`,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'Access denied. You do not have permission.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created.',
  UPDATED: 'Successfully updated.',
  DELETED: 'Successfully deleted.',
  SAVED: 'Successfully saved.',
  IMPORTED: 'Successfully imported.',
  EXPORTED: 'Successfully exported.',
  SENT: 'Successfully sent.',
};

// Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Default Values
export const DEFAULT_VALUES = {
  PROJECT: {
    name: '',
    description: '',
    sor_code: '',
    sor_description: '',
    sor_type: '',
    category: '',
    status: 'planning',
    priority: 'medium',
    budget: 0,
    actual_cost: 0,
    progress: 0,
    region: '',
  },
  MATERIAL: {
    sales_part_no: '',
    description: '',
    site: '',
    price: 0,
    image_url: '',
    is_custom: false,
  },
  EQUIPMENT: {
    name: '',
    category: '',
    site: '',
    price: 0,
    image_url: '',
  },
  LABOUR_ROLE: {
    labour_type: '',
    hours: 8,
    cost_per_person: 0,
    state_code: 'NSW',
    state_adjustment: 1.0,
  },
  QUOTE: {
    quote_number: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    project_name: '',
    project_description: '',
    sor_code: '',
    sor_description: '',
    region: '',
    status: 'draft',
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 0,
    notes: '',
  },
  CALCULATOR: {
    client_name: '',
    region: '',
    product_sor: '',
    sor_code: '',
    sor_description: '',
    risk_uplift: 0,
    additional_support: [],
  },
};
