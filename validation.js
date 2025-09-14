// Validation utility functions
export const ValidationRules = {
  // Required field validation
  required: (value, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (value, fieldName = 'Email') => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  // Phone validation
  phone: (value, fieldName = 'Phone') => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return `${fieldName} must be a valid phone number`;
    }
    return null;
  },

  // Minimum length validation
  minLength: (value, min, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value, max, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`;
    }
    return null;
  },

  // Numeric validation
  numeric: (value, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') return null;
    if (isNaN(Number(value))) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  // Positive number validation
  positive: (value, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  },

  // Non-negative number validation
  nonNegative: (value, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return `${fieldName} must be a non-negative number`;
    }
    return null;
  },

  // Range validation
  range: (value, min, max, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a valid number`;
    }
    if (num < min || num > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  },

  // URL validation
  url: (value, fieldName = 'URL') => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  },

  // Date validation
  date: (value, fieldName = 'Date') => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} must be a valid date`;
    }
    return null;
  },

  // Future date validation
  futureDate: (value, fieldName = 'Date') => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} must be a valid date`;
    }
    if (date <= new Date()) {
      return `${fieldName} must be a future date`;
    }
    return null;
  },

  // Past date validation
  pastDate: (value, fieldName = 'Date') => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} must be a valid date`;
    }
    if (date >= new Date()) {
      return `${fieldName} must be a past date`;
    }
    return null;
  },

  // Array validation
  array: (value, fieldName = 'Field') => {
    if (!value) return null;
    if (!Array.isArray(value)) {
      return `${fieldName} must be an array`;
    }
    return null;
  },

  // Non-empty array validation
  nonEmptyArray: (value, fieldName = 'Field') => {
    if (!value) return null;
    if (!Array.isArray(value)) {
      return `${fieldName} must be an array`;
    }
    if (value.length === 0) {
      return `${fieldName} must not be empty`;
    }
    return null;
  },

  // Object validation
  object: (value, fieldName = 'Field') => {
    if (!value) return null;
    if (typeof value !== 'object' || Array.isArray(value)) {
      return `${fieldName} must be an object`;
    }
    return null;
  },

  // Custom validation function
  custom: (value, validator, fieldName = 'Field') => {
    if (!value) return null;
    const result = validator(value);
    if (result !== true) {
      return result || `${fieldName} is invalid`;
    }
    return null;
  },
};

// Validation schema builder
export class ValidationSchema {
  constructor() {
    this.rules = {};
  }

  // Add a field with validation rules
  field(fieldName, rules = []) {
    this.rules[fieldName] = rules;
    return this;
  }

  // Add required field
  required(fieldName, rules = []) {
    return this.field(fieldName, [ValidationRules.required, ...rules]);
  }

  // Add optional field
  optional(fieldName, rules = []) {
    return this.field(fieldName, rules);
  }

  // Validate all fields
  validate(data) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, rules] of Object.entries(this.rules)) {
      const value = data[fieldName];
      
      for (const rule of rules) {
        const error = rule(value, fieldName);
        if (error) {
          errors[fieldName] = error;
          isValid = false;
          break; // Stop at first error for this field
        }
      }
    }

    return {
      isValid,
      errors,
    };
  }

  // Validate a single field
  validateField(fieldName, value) {
    const rules = this.rules[fieldName] || [];
    
    for (const rule of rules) {
      const error = rule(value, fieldName);
      if (error) {
        return error;
      }
    }
    
    return null;
  }
}

// Predefined validation schemas
export const ValidationSchemas = {
  // Project validation
  project: new ValidationSchema()
    .required('name', [ValidationRules.minLength(1), ValidationRules.maxLength(200)])
    .optional('description', [ValidationRules.maxLength(1000)])
    .optional('sor_code', [ValidationRules.maxLength(100)])
    .optional('sor_description', [ValidationRules.maxLength(1000)])
    .optional('sor_type', [ValidationRules.maxLength(100)])
    .optional('category', [ValidationRules.maxLength(100)])
    .required('status', [ValidationRules.required])
    .required('priority', [ValidationRules.required])
    .required('budget', [ValidationRules.nonNegative])
    .required('actual_cost', [ValidationRules.nonNegative])
    .required('progress', [ValidationRules.range(0, 100)])
    .optional('region', [ValidationRules.maxLength(50)]),

  // Material validation
  material: new ValidationSchema()
    .required('sales_part_no', [ValidationRules.minLength(1), ValidationRules.maxLength(100)])
    .required('description', [ValidationRules.minLength(1)])
    .optional('site', [ValidationRules.maxLength(50)])
    .required('price', [ValidationRules.positive])
    .optional('image_url', [ValidationRules.url])
    .optional('is_custom', [ValidationRules.custom((v) => typeof v === 'boolean')]),

  // Equipment validation
  equipment: new ValidationSchema()
    .required('name', [ValidationRules.minLength(1), ValidationRules.maxLength(200)])
    .optional('category', [ValidationRules.maxLength(100)])
    .optional('site', [ValidationRules.maxLength(50)])
    .required('price', [ValidationRules.positive])
    .optional('image_url', [ValidationRules.url]),

  // Labour role validation
  labourRole: new ValidationSchema()
    .required('labour_type', [ValidationRules.minLength(1), ValidationRules.maxLength(100)])
    .required('hours', [ValidationRules.positive])
    .required('cost_per_person', [ValidationRules.positive])
    .required('state_code', [ValidationRules.required])
    .required('state_adjustment', [ValidationRules.positive]),

  // Quote validation
  quote: new ValidationSchema()
    .required('quote_number', [ValidationRules.minLength(1), ValidationRules.maxLength(50)])
    .required('client_name', [ValidationRules.minLength(1), ValidationRules.maxLength(200)])
    .optional('client_email', [ValidationRules.email])
    .optional('client_phone', [ValidationRules.phone])
    .optional('client_address', [ValidationRules.maxLength(500)])
    .required('project_name', [ValidationRules.minLength(1), ValidationRules.maxLength(200)])
    .optional('project_description', [ValidationRules.maxLength(1000)])
    .optional('sor_code', [ValidationRules.maxLength(100)])
    .optional('sor_description', [ValidationRules.maxLength(1000)])
    .optional('region', [ValidationRules.maxLength(50)])
    .required('status', [ValidationRules.required])
    .required('subtotal', [ValidationRules.nonNegative])
    .required('tax_rate', [ValidationRules.range(0, 100)])
    .required('tax_amount', [ValidationRules.nonNegative])
    .required('total_amount', [ValidationRules.nonNegative])
    .optional('notes', [ValidationRules.maxLength(1000)]),

  // Calculator validation
  calculator: new ValidationSchema()
    .required('client_name', [ValidationRules.minLength(1), ValidationRules.maxLength(200)])
    .required('region', [ValidationRules.minLength(1), ValidationRules.maxLength(50)])
    .required('product_sor', [ValidationRules.minLength(1), ValidationRules.maxLength(200)])
    .optional('sor_code', [ValidationRules.maxLength(100)])
    .optional('sor_description', [ValidationRules.maxLength(1000)])
    .required('risk_uplift', [ValidationRules.range(0, 100)])
    .optional('additional_support', [ValidationRules.array]),

  // User validation
  user: new ValidationSchema()
    .required('username', [ValidationRules.minLength(3), ValidationRules.maxLength(50)])
    .required('email', [ValidationRules.email])
    .required('password', [ValidationRules.minLength(6)])
    .optional('role', [ValidationRules.required]),

  // Search filters validation
  searchFilters: new ValidationSchema()
    .optional('search_term', [ValidationRules.maxLength(200)])
    .optional('status', [ValidationRules.required])
    .optional('priority', [ValidationRules.required])
    .optional('region', [ValidationRules.maxLength(50)])
    .optional('sor_type', [ValidationRules.maxLength(100)])
    .optional('manager_id', [ValidationRules.required])
    .optional('budget_min', [ValidationRules.nonNegative])
    .optional('budget_max', [ValidationRules.nonNegative])
    .optional('progress_min', [ValidationRules.range(0, 100)])
    .optional('progress_max', [ValidationRules.range(0, 100)]),
};

// Validation helper functions
export const validateField = (fieldName, value, schema) => {
  return schema.validateField(fieldName, value);
};

export const validateForm = (data, schema) => {
  return schema.validate(data);
};

export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

export const getFirstError = (errors) => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};

export const clearErrors = (errors, fieldName) => {
  if (fieldName) {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    return newErrors;
  }
  return {};
};

// Real-time validation hook
export const useValidation = (schema, initialData = {}) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((fieldName, value) => {
    const error = validateField(fieldName, value, schema);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }));
    return error;
  }, [schema]);

  const validateAll = useCallback(() => {
    const result = validateForm(data, schema);
    setErrors(result.errors);
    return result;
  }, [data, schema]);

  const setFieldValue = useCallback((fieldName, value) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      validate(fieldName, value);
    }
  }, [touched, validate]);

  const setFieldTouched = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validate(fieldName, data[fieldName]);
  }, [data, validate]);

  const reset = useCallback((newData = {}) => {
    setData(newData);
    setErrors({});
    setTouched({});
  }, []);

  return {
    data,
    errors,
    touched,
    validate,
    validateAll,
    setFieldValue,
    setFieldTouched,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

export default ValidationRules;
