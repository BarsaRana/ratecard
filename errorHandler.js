import { ERROR_MESSAGES, STATUS_CODES } from '../config/api';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// Error handler class
export class ErrorHandler {
  static handle(error) {
    console.error('Error occurred:', error);

    // Network errors
    if (!navigator.onLine) {
      return this.createError(ERROR_TYPES.NETWORK, ERROR_MESSAGES.NETWORK_ERROR);
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return this.createError(ERROR_TYPES.TIMEOUT, ERROR_MESSAGES.TIMEOUT_ERROR);
    }

    // HTTP errors
    if (error.status) {
      return this.handleHttpError(error);
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return this.createError(ERROR_TYPES.VALIDATION, ERROR_MESSAGES.VALIDATION_ERROR);
    }

    // Default to unknown error
    return this.createError(ERROR_TYPES.UNKNOWN, ERROR_MESSAGES.UNKNOWN_ERROR);
  }

  static handleHttpError(error) {
    const { status, data } = error;

    switch (status) {
      case STATUS_CODES.BAD_REQUEST:
        return this.createError(
          ERROR_TYPES.VALIDATION,
          data?.detail || ERROR_MESSAGES.VALIDATION_ERROR
        );

      case STATUS_CODES.UNAUTHORIZED:
        return this.createError(
          ERROR_TYPES.AUTHENTICATION,
          ERROR_MESSAGES.UNAUTHORIZED
        );

      case STATUS_CODES.FORBIDDEN:
        return this.createError(
          ERROR_TYPES.AUTHORIZATION,
          ERROR_MESSAGES.FORBIDDEN
        );

      case STATUS_CODES.NOT_FOUND:
        return this.createError(
          ERROR_TYPES.NOT_FOUND,
          ERROR_MESSAGES.NOT_FOUND
        );

      case STATUS_CODES.INTERNAL_SERVER_ERROR:
        return this.createError(
          ERROR_TYPES.SERVER,
          ERROR_MESSAGES.SERVER_ERROR
        );

      default:
        return this.createError(
          ERROR_TYPES.SERVER,
          data?.detail || ERROR_MESSAGES.SERVER_ERROR
        );
    }
  }

  static createError(type, message, details = null) {
    return {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static isNetworkError(error) {
    return error.type === ERROR_TYPES.NETWORK;
  }

  static isTimeoutError(error) {
    return error.type === ERROR_TYPES.TIMEOUT;
  }

  static isValidationError(error) {
    return error.type === ERROR_TYPES.VALIDATION;
  }

  static isAuthenticationError(error) {
    return error.type === ERROR_TYPES.AUTHENTICATION;
  }

  static isAuthorizationError(error) {
    return error.type === ERROR_TYPES.AUTHORIZATION;
  }

  static isNotFoundError(error) {
    return error.type === ERROR_TYPES.NOT_FOUND;
  }

  static isServerError(error) {
    return error.type === ERROR_TYPES.SERVER;
  }
}

// Error boundary component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or contact support if the problem persists.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error notification utility
export const showErrorNotification = (error, toast) => {
  const errorObj = ErrorHandler.handle(error);
  
  if (toast) {
    toast.error(errorObj.message, {
      duration: 5000,
      position: 'top-right',
    });
  } else {
    // Fallback to alert if toast is not available
    alert(errorObj.message);
  }
};

// Retry utility
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      if (ErrorHandler.isAuthenticationError(error) || 
          ErrorHandler.isAuthorizationError(error) ||
          ErrorHandler.isValidationError(error)) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Error logging utility
export const logError = (error, context = {}) => {
  const errorObj = ErrorHandler.handle(error);
  
  const logData = {
    ...errorObj,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', logData);
  }
  
  // In production, you might want to send this to a logging service
  // Example: sendToLoggingService(logData);
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  if (typeof errors === 'string') {
    return errors;
  }
  
  if (Array.isArray(errors)) {
    return errors.join(', ');
  }
  
  if (typeof errors === 'object') {
    return Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
  }
  
  return 'Validation error occurred';
};

// Error recovery strategies
export const ErrorRecovery = {
  // Retry with exponential backoff
  retry: (fn, maxRetries = 3) => {
    return withRetry(fn, maxRetries);
  },
  
  // Fallback to cached data
  fallbackToCache: (cacheKey, fallbackFn) => {
    return async (fn) => {
      try {
        return await fn();
      } catch (error) {
        console.warn('Primary operation failed, falling back to cache:', error);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        return fallbackFn();
      }
    };
  },
  
  // Show user-friendly message
  userFriendly: (error) => {
    const errorObj = ErrorHandler.handle(error);
    return errorObj.message;
  },
};

export default ErrorHandler;
