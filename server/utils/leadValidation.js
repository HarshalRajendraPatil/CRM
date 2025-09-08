import { validateObjectId, validateEmail, validatePhone } from './validation.js';

// Validation functions for lead-specific fields
export const validateLeadName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Lead name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Lead name must be at least 2 characters long' };
  }
  if (name.trim().length > 100) {
    return { isValid: false, message: 'Lead name must be less than 100 characters' };
  }
  return { isValid: true };
};

export const validateLeadEmail = (email) => {
  if (!email) return { isValid: true }; // Email is optional
  return validateEmail(email);
};

export const validateLeadPhone = (phone) => {
  if (!phone) return { isValid: true }; // Phone is optional
  return validatePhone(phone);
};

export const validateLeadStatus = (status) => {
  const validStatuses = ['new', 'contacted', 'qualified', 'disqualified'];
  if (!status) return { isValid: true }; // Status is optional, defaults to 'new'
  if (!validStatuses.includes(status)) {
    return { isValid: false, message: 'Invalid lead status' };
  }
  return { isValid: true };
};

export const validateLeadSource = (source) => {
  const validSources = ['web', 'email', 'phone', 'referral', 'event', 'ads', 'other'];
  if (!source) return { isValid: true }; // Source is optional, defaults to 'other'
  if (!validSources.includes(source)) {
    return { isValid: false, message: 'Invalid lead source' };
  }
  return { isValid: true };
};

export const validateLeadScore = (score) => {
  if (score === undefined || score === null) return { isValid: true }; // Score is optional
  const numScore = Number(score);
  if (isNaN(numScore)) {
    return { isValid: false, message: 'Score must be a number' };
  }
  if (numScore < 0 || numScore > 100) {
    return { isValid: false, message: 'Score must be between 0 and 100' };
  }
  return { isValid: true };
};

export const validateCompanyName = (companyName) => {
  if (!companyName) return { isValid: true }; // Company name is optional
  if (typeof companyName !== 'string') {
    return { isValid: false, message: 'Company name must be a string' };
  }
  if (companyName.trim().length > 100) {
    return { isValid: false, message: 'Company name must be less than 100 characters' };
  }
  return { isValid: true };
};

export const validateJobTitle = (jobTitle) => {
  if (!jobTitle) return { isValid: true }; // Job title is optional
  if (typeof jobTitle !== 'string') {
    return { isValid: false, message: 'Job title must be a string' };
  }
  if (jobTitle.trim().length > 100) {
    return { isValid: false, message: 'Job title must be less than 100 characters' };
  }
  return { isValid: true };
};

export const validateTags = (tags) => {
  if (!tags) return { isValid: true }; // Tags are optional
  if (!Array.isArray(tags)) {
    return { isValid: false, message: 'Tags must be an array' };
  }
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    if (typeof tag !== 'string') {
      return { isValid: false, message: 'Each tag must be a string' };
    }
    if (tag.trim().length === 0) {
      return { isValid: false, message: 'Tags cannot be empty strings' };
    }
    if (tag.trim().length > 50) {
      return { isValid: false, message: 'Each tag must be less than 50 characters' };
    }
  }
  return { isValid: true };
};

export const validateCustomFields = (customFields) => {
  if (!customFields) return { isValid: true }; // Custom fields are optional
  if (typeof customFields !== 'object' || Array.isArray(customFields)) {
    return { isValid: false, message: 'Custom fields must be an object' };
  }
  
  for (const [key, value] of Object.entries(customFields)) {
    if (typeof key !== 'string' || key.trim().length === 0) {
      return { isValid: false, message: 'Custom field keys must be non-empty strings' };
    }
    if (key.trim().length > 50) {
      return { isValid: false, message: 'Custom field keys must be less than 50 characters' };
    }
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      return { isValid: false, message: 'Custom field values must be strings, numbers, or booleans' };
    }
    if (typeof value === 'string' && value.length > 500) {
      return { isValid: false, message: 'Custom field string values must be less than 500 characters' };
    }
  }
  return { isValid: true };
};

export const validateLeadData = (data) => {
  const errors = {};
  
  // Required fields
  const nameVal = validateLeadName(data.name);
  if (!nameVal.isValid) errors.name = nameVal.message;

  // Optional fields with validation
  const emailVal = validateLeadEmail(data.email);
  if (!emailVal.isValid) errors.email = emailVal.message;

  const phoneVal = validateLeadPhone(data.phone);
  if (!phoneVal.isValid) errors.phone = phoneVal.message;

  const statusVal = validateLeadStatus(data.stage || data.status);
  if (!statusVal.isValid) errors.stage = statusVal.message;

  const sourceVal = validateLeadSource(data.source);
  if (!sourceVal.isValid) errors.source = sourceVal.message;

  const scoreVal = validateLeadScore(data.score);
  if (!scoreVal.isValid) errors.score = scoreVal.message;

  const companyNameVal = validateCompanyName(data.companyName);
  if (!companyNameVal.isValid) errors.companyName = companyNameVal.message;

  const jobTitleVal = validateJobTitle(data.jobTitle);
  if (!jobTitleVal.isValid) errors.jobTitle = jobTitleVal.message;

  const tagsVal = validateTags(data.tags);
  if (!tagsVal.isValid) errors.tags = tagsVal.message;

  const customFieldsVal = validateCustomFields(data.customFields);
  if (!customFieldsVal.isValid) errors.customFields = customFieldsVal.message;

  // Reference fields
  if (data.assignedTo) {
    const assignedToVal = validateObjectId(data.assignedTo);
    if (!assignedToVal.isValid) errors.assignedTo = assignedToVal.message || 'Invalid assignedTo ID';
  }

  if (data.company) {
    const companyVal = validateObjectId(data.company);
    if (!companyVal.isValid) errors.company = companyVal.message || 'Invalid company ID';
  }

  if (data.project) {
    const projectVal = validateObjectId(data.project);
    if (!projectVal.isValid) errors.project = projectVal.message || 'Invalid project ID';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const sanitizeLeadData = (data) => {
  const out = {};
  
  if (data.name !== undefined) out.name = data.name.trim();
  if (data.email !== undefined) out.email = data.email?.toLowerCase().trim();
  if (data.phone !== undefined) out.phone = data.phone?.trim();
  if (data.companyName !== undefined) out.companyName = data.companyName?.trim();
  if (data.jobTitle !== undefined) out.jobTitle = data.jobTitle?.trim();
  if (data.source !== undefined) out.source = data.source;
  if (data.stage !== undefined) out.stage = data.stage;
  if (data.status !== undefined) out.status = data.status;
  if (data.score !== undefined) out.score = Number(data.score) || 0;
  if (data.assignedTo !== undefined) out.assignedTo = data.assignedTo;
  if (data.company !== undefined) out.company = data.company;
  if (data.project !== undefined) out.project = data.project;
  
  // Handle tags
  if (data.tags !== undefined) {
    out.tags = Array.isArray(data.tags) 
      ? Array.from(new Set(data.tags.map(t => `${t}`.trim()).filter(Boolean)))
      : [];
  }
  
  // Handle custom fields
  if (data.customFields !== undefined) {
    if (typeof data.customFields === 'object' && !Array.isArray(data.customFields)) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data.customFields)) {
        if (key && key.trim() && value !== undefined && value !== null) {
          sanitized[key.trim()] = typeof value === 'string' ? value.trim() : value;
        }
      }
      out.customFields = sanitized;
    } else {
      out.customFields = {};
    }
  }

  return out;
};


