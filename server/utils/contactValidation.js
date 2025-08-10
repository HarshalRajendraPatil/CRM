import mongoose from 'mongoose';

// Validation patterns
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+/,
  name: /^[a-zA-Z\s\-'\.]+$/,
  jobTitle: /^[a-zA-Z0-9\s\-'\.&]+$/,
  department: /^[a-zA-Z0-9\s\-'\.&]+$/,
  zipCode: /^[a-zA-Z0-9\s\-]+$/,
  timezone: /^[A-Za-z_]+\/[A-Za-z_]+$/
};

// Contact validation functions
export const validateFirstName = (firstName) => {
  if (!firstName) {
    return { isValid: false, message: 'First name is required' };
  }
  
  if (firstName.length < 2) {
    return { isValid: false, message: 'First name must be at least 2 characters long' };
  }
  
  if (firstName.length > 50) {
    return { isValid: false, message: 'First name cannot exceed 50 characters' };
  }
  
  if (!patterns.name.test(firstName)) {
    return { isValid: false, message: 'First name can only contain letters, spaces, hyphens, apostrophes, and periods' };
  }
  
  return { isValid: true };
};

export const validateLastName = (lastName) => {
  if (!lastName) {
    return { isValid: false, message: 'Last name is required' };
  }
  
  if (lastName.length < 2) {
    return { isValid: false, message: 'Last name must be at least 2 characters long' };
  }
  
  if (lastName.length > 50) {
    return { isValid: false, message: 'Last name cannot exceed 50 characters' };
  }
  
  if (!patterns.name.test(lastName)) {
    return { isValid: false, message: 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods' };
  }
  
  return { isValid: true };
};

export const validateContactEmail = (email) => {
  if (!email) {
    return { isValid: true }; // Email is optional for contacts
  }
  
  if (!patterns.email.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  if (email.length > 255) {
    return { isValid: false, message: 'Email cannot exceed 255 characters' };
  }
  
  return { isValid: true };
};

export const validateContactPhone = (phone) => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!patterns.phone.test(cleanPhone)) {
    return { isValid: false, message: 'Please provide a valid phone number' };
  }
  
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, message: 'Phone number must be between 10 and 15 digits' };
  }
  
  return { isValid: true };
};

export const validateJobTitle = (jobTitle) => {
  if (!jobTitle) {
    return { isValid: true }; // Job title is optional
  }
  
  if (jobTitle.length < 2) {
    return { isValid: false, message: 'Job title must be at least 2 characters long' };
  }
  
  if (jobTitle.length > 100) {
    return { isValid: false, message: 'Job title cannot exceed 100 characters' };
  }
  
  if (!patterns.jobTitle.test(jobTitle)) {
    return { isValid: false, message: 'Job title can only contain letters, numbers, spaces, hyphens, apostrophes, periods, and ampersands' };
  }
  
  return { isValid: true };
};

export const validateDepartment = (department) => {
  if (!department) {
    return { isValid: true }; // Department is optional
  }
  
  if (department.length < 2) {
    return { isValid: false, message: 'Department must be at least 2 characters long' };
  }
  
  if (department.length > 100) {
    return { isValid: false, message: 'Department cannot exceed 100 characters' };
  }
  
  if (!patterns.department.test(department)) {
    return { isValid: false, message: 'Department can only contain letters, numbers, spaces, hyphens, apostrophes, periods, and ampersands' };
  }
  
  return { isValid: true };
};

export const validateContactStage = (stage) => {
  const validStages = ['lead', 'prospect', 'qualified', 'opportunity', 'customer', 'inactive', 'lost', 'other'];
  
  if (!stage) {
    return { isValid: false, message: 'Stage is required' };
  }
  
  if (!validStages.includes(stage)) {
    return { isValid: false, message: 'Invalid stage value' };
  }
  
  return { isValid: true };
};

export const validateContactStatus = (status) => {
  const validStatuses = ['active', 'inactive', 'unsubscribed', 'bounced', 'other'];
  
  if (!status) {
    return { isValid: false, message: 'Status is required' };
  }
  
  if (!validStatuses.includes(status)) {
    return { isValid: false, message: 'Invalid status value' };
  }
  
  return { isValid: true };
};

export const validateContactSource = (source) => {
  const validSources = ['website', 'referral', 'cold_outreach', 'event', 'social_media', 'advertising', 'partner', 'other'];
  
  if (!source) {
    return { isValid: false, message: 'Source is required' };
  }
  
  if (!validSources.includes(source)) {
    return { isValid: false, message: 'Invalid source value' };
  }
  
  return { isValid: true };
};

export const validateLeadScore = (leadScore) => {
  if (leadScore === undefined || leadScore === null) {
    return { isValid: true }; // Lead score is optional
  }
  
  const score = parseInt(leadScore);
  
  if (isNaN(score)) {
    return { isValid: false, message: 'Lead score must be a number' };
  }
  
  if (score < 0 || score > 100) {
    return { isValid: false, message: 'Lead score must be between 0 and 100' };
  }
  
  return { isValid: true };
};

export const validateAddress = (address) => {
  if (!address) {
    return { isValid: true }; // Address is optional
  }
  
  const errors = {};
  
  if (address.street && address.street.length > 255) {
    errors.street = 'Street address cannot exceed 255 characters';
  }
  
  if (address.city && address.city.length > 100) {
    errors.city = 'City cannot exceed 100 characters';
  }
  
  if (address.state && address.state.length > 100) {
    errors.state = 'State cannot exceed 100 characters';
  }
  
  if (address.zipCode && address.zipCode.length > 20) {
    errors.zipCode = 'ZIP code cannot exceed 20 characters';
  }
  
  if (address.country && address.country.length > 100) {
    errors.country = 'Country cannot exceed 100 characters';
  }
  
  if (address.type && !['home', 'work', 'other'].includes(address.type)) {
    errors.type = 'Invalid address type';
  }
  
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }
  
  return { isValid: true };
};

export const validateSocialLink = (socialLink) => {
  if (!socialLink) {
    return { isValid: false, message: 'Social link is required' };
  }
  
  const validPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'github', 'website', 'other'];
  
  if (!socialLink.platform) {
    return { isValid: false, message: 'Platform is required' };
  }
  
  if (!validPlatforms.includes(socialLink.platform)) {
    return { isValid: false, message: 'Invalid platform' };
  }
  
  if (!socialLink.url) {
    return { isValid: false, message: 'URL is required' };
  }
  
  if (!patterns.url.test(socialLink.url)) {
    return { isValid: false, message: 'Please provide a valid URL' };
  }
  
  if (socialLink.url.length > 500) {
    return { isValid: false, message: 'URL cannot exceed 500 characters' };
  }
  
  if (socialLink.handle && socialLink.handle.length > 100) {
    return { isValid: false, message: 'Handle cannot exceed 100 characters' };
  }
  
  return { isValid: true };
};

export const validateContactTags = (tags) => {
  if (!tags) {
    return { isValid: true }; // Tags are optional
  }
  
  if (!Array.isArray(tags)) {
    return { isValid: false, message: 'Tags must be an array' };
  }
  
  if (tags.length > 50) {
    return { isValid: false, message: 'Cannot have more than 50 tags' };
  }
  
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    
    if (typeof tag !== 'string') {
      return { isValid: false, message: 'All tags must be strings' };
    }
    
    if (tag.trim().length === 0) {
      return { isValid: false, message: 'Tags cannot be empty' };
    }
    
    if (tag.length > 50) {
      return { isValid: false, message: 'Individual tags cannot exceed 50 characters' };
    }
  }
  
  return { isValid: true };
};

export const validateCustomFields = (customFields) => {
  if (!customFields) {
    return { isValid: true }; // Custom fields are optional
  }
  
  if (typeof customFields !== 'object') {
    return { isValid: false, message: 'Custom fields must be an object' };
  }
  
  const keys = Object.keys(customFields);
  
  if (keys.length > 20) {
    return { isValid: false, message: 'Cannot have more than 20 custom fields' };
  }
  
  for (const key of keys) {
    if (key.length > 50) {
      return { isValid: false, message: 'Custom field keys cannot exceed 50 characters' };
    }
    
    if (key.trim().length === 0) {
      return { isValid: false, message: 'Custom field keys cannot be empty' };
    }
    
    const value = customFields[key];
    if (typeof value === 'string' && value.length > 1000) {
      return { isValid: false, message: 'Custom field values cannot exceed 1000 characters' };
    }
  }
  
  return { isValid: true };
};

export const validateCommunicationPreferences = (preferences) => {
  if (!preferences) {
    return { isValid: true }; // Preferences are optional
  }
  
  const errors = {};
  
  if (preferences.preferredContactMethod && !['email', 'phone', 'sms', 'any'].includes(preferences.preferredContactMethod)) {
    errors.preferredContactMethod = 'Invalid preferred contact method';
  }
  
  if (preferences.timezone && !patterns.timezone.test(preferences.timezone)) {
    errors.timezone = 'Invalid timezone format';
  }
  
  if (preferences.language && preferences.language.length !== 2) {
    errors.language = 'Language must be a 2-character code';
  }
  
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }
  
  return { isValid: true };
};

export const validateContactData = (data) => {
  const errors = {};
  
  // Required fields
  const firstNameValidation = validateFirstName(data.firstName);
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.message;
  }
  
  const lastNameValidation = validateLastName(data.lastName);
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.message;
  }
  
  // Optional fields
  if (data.email !== undefined) {
    const emailValidation = validateContactEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
  }
  
  if (data.phone !== undefined) {
    const phoneValidation = validateContactPhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
    }
  }
  
  if (data.jobTitle !== undefined) {
    const jobTitleValidation = validateJobTitle(data.jobTitle);
    if (!jobTitleValidation.isValid) {
      errors.jobTitle = jobTitleValidation.message;
    }
  }
  
  if (data.department !== undefined) {
    const departmentValidation = validateDepartment(data.department);
    if (!departmentValidation.isValid) {
      errors.department = departmentValidation.message;
    }
  }
  
  if (data.stage !== undefined) {
    const stageValidation = validateContactStage(data.stage);
    if (!stageValidation.isValid) {
      errors.stage = stageValidation.message;
    }
  }
  
  if (data.status !== undefined) {
    const statusValidation = validateContactStatus(data.status);
    if (!statusValidation.isValid) {
      errors.status = statusValidation.message;
    }
  }
  
  if (data.source !== undefined) {
    const sourceValidation = validateContactSource(data.source);
    if (!sourceValidation.isValid) {
      errors.source = sourceValidation.message;
    }
  }
  
  if (data.leadScore !== undefined) {
    const leadScoreValidation = validateLeadScore(data.leadScore);
    if (!leadScoreValidation.isValid) {
      errors.leadScore = leadScoreValidation.message;
    }
  }
  
  if (data.addresses !== undefined) {
    if (Array.isArray(data.addresses)) {
      for (let i = 0; i < data.addresses.length; i++) {
        const addressValidation = validateAddress(data.addresses[i]);
        if (!addressValidation.isValid) {
          errors[`addresses.${i}`] = addressValidation.errors || addressValidation.message;
        }
      }
    } else {
      errors.addresses = 'Addresses must be an array';
    }
  }
  
  if (data.socialLinks !== undefined) {
    if (Array.isArray(data.socialLinks)) {
      for (let i = 0; i < data.socialLinks.length; i++) {
        const socialLinkValidation = validateSocialLink(data.socialLinks[i]);
        if (!socialLinkValidation.isValid) {
          errors[`socialLinks.${i}`] = socialLinkValidation.message;
        }
      }
    } else {
      errors.socialLinks = 'Social links must be an array';
    }
  }
  
  if (data.tags !== undefined) {
    const tagsValidation = validateContactTags(data.tags);
    if (!tagsValidation.isValid) {
      errors.tags = tagsValidation.message;
    }
  }
  
  if (data.customFields !== undefined) {
    const customFieldsValidation = validateCustomFields(data.customFields);
    if (!customFieldsValidation.isValid) {
      errors.customFields = customFieldsValidation.message;
    }
  }
  
  if (data.communicationPreferences !== undefined) {
    const preferencesValidation = validateCommunicationPreferences(data.communicationPreferences);
    if (!preferencesValidation.isValid) {
      errors.communicationPreferences = preferencesValidation.errors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitization functions
export const sanitizeContactData = (data) => {
  const sanitized = {};
  
  if (data.firstName) {
    sanitized.firstName = data.firstName.trim();
  }
  
  if (data.lastName) {
    sanitized.lastName = data.lastName.trim();
  }
  
  if (data.email) {
    sanitized.email = data.email.trim().toLowerCase();
  }
  
  if (data.phone) {
    sanitized.phone = data.phone.trim();
  }
  
  if (data.jobTitle) {
    sanitized.jobTitle = data.jobTitle.trim();
  }
  
  if (data.department) {
    sanitized.department = data.department.trim();
  }
  
  if (data.addresses && Array.isArray(data.addresses)) {
    sanitized.addresses = data.addresses.map(addr => ({
      street: addr.street ? addr.street.trim() : undefined,
      city: addr.city ? addr.city.trim() : undefined,
      state: addr.state ? addr.state.trim() : undefined,
      zipCode: addr.zipCode ? addr.zipCode.trim() : undefined,
      country: addr.country ? addr.country.trim() : undefined,
      type: addr.type || 'work'
    }));
  }
  
  if (data.socialLinks && Array.isArray(data.socialLinks)) {
    sanitized.socialLinks = data.socialLinks.map(link => ({
      platform: link.platform,
      url: link.url.trim(),
      handle: link.handle ? link.handle.trim() : '',
      isPrimary: !!link.isPrimary
    }));
  }
  
  if (data.tags && Array.isArray(data.tags)) {
    sanitized.tags = data.tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
  
  if (data.customFields && typeof data.customFields === 'object') {
    sanitized.customFields = {};
    Object.keys(data.customFields).forEach(key => {
      const value = data.customFields[key];
      if (value !== null && value !== undefined) {
        sanitized.customFields[key.trim()] = typeof value === 'string' ? value.trim() : value;
      }
    });
  }
  
  return sanitized;
};

export default {
  validateFirstName,
  validateLastName,
  validateContactEmail,
  validateContactPhone,
  validateJobTitle,
  validateDepartment,
  validateContactStage,
  validateContactStatus,
  validateContactSource,
  validateLeadScore,
  validateAddress,
  validateSocialLink,
  validateContactTags,
  validateCustomFields,
  validateCommunicationPreferences,
  validateContactData,
  sanitizeContactData
};
