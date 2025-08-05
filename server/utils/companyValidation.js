import { validateObjectId } from './validation.js';

// Validate company name
export const validateCompanyName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Company name is required' };
  }
  
  if (typeof name !== 'string') {
    return { isValid: false, message: 'Company name must be a string' };
  }
  
  if (name.trim().length < 1) {
    return { isValid: false, message: 'Company name cannot be empty' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, message: 'Company name cannot exceed 100 characters' };
  }
  
  return { isValid: true };
};

// Validate company website
export const validateWebsite = (website) => {
  if (!website) {
    return { isValid: true }; // Website is optional
  }
  
  if (typeof website !== 'string') {
    return { isValid: false, message: 'Website must be a string' };
  }
  
  const websiteRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
  if (!websiteRegex.test(website)) {
    return { isValid: false, message: 'Please provide a valid website URL' };
  }
  
  return { isValid: true };
};

// Validate company email
export const validateCompanyEmail = (email) => {
  if (!email) {
    return { isValid: true }; // Email is optional
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, message: 'Email must be a string' };
  }
  
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please provide a valid email address' };
  }
  
  return { isValid: true };
};

// Validate company phone
export const validateCompanyPhone = (phone) => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }
  
  if (typeof phone !== 'string') {
    return { isValid: false, message: 'Phone must be a string' };
  }
  
  // Simple phone validation - can be enhanced based on requirements
  if (phone.trim().length < 5 || phone.trim().length > 20) {
    return { isValid: false, message: 'Phone number should be between 5 and 20 characters' };
  }
  
  return { isValid: true };
};

// Validate company address
export const validateAddress = (address) => {
  if (!address) {
    return { isValid: true }; // Address is optional
  }
  
  if (typeof address !== 'object') {
    return { isValid: false, message: 'Address must be an object' };
  }
  
  // Check each field of the address
  const { street, city, state, zipCode, country } = address;
  
  if (street && typeof street !== 'string') {
    return { isValid: false, message: 'Street must be a string' };
  }
  
  if (city && typeof city !== 'string') {
    return { isValid: false, message: 'City must be a string' };
  }
  
  if (state && typeof state !== 'string') {
    return { isValid: false, message: 'State must be a string' };
  }
  
  if (zipCode && typeof zipCode !== 'string') {
    return { isValid: false, message: 'Zip code must be a string' };
  }
  
  if (country && typeof country !== 'string') {
    return { isValid: false, message: 'Country must be a string' };
  }
  
  return { isValid: true };
};

// Validate company industry
export const validateIndustry = (industry) => {
  if (!industry) {
    return { isValid: true }; // Industry is optional
  }
  
  if (typeof industry !== 'string') {
    return { isValid: false, message: 'Industry must be a string' };
  }
  
  if (industry.trim().length < 1 || industry.trim().length > 100) {
    return { isValid: false, message: 'Industry should be between 1 and 100 characters' };
  }
  
  return { isValid: true };
};

// Validate company size
export const validateCompanySize = (size) => {
  if (!size) {
    return { isValid: true }; // Size is optional
  }
  
  const validSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'];
  
  if (!validSizes.includes(size)) {
    return { isValid: false, message: 'Invalid company size value' };
  }
  
  return { isValid: true };
};

// Validate company annual revenue
export const validateAnnualRevenue = (revenue) => {
  if (!revenue) {
    return { isValid: true }; // Revenue is optional
  }
  
  const validRevenues = ['<1M', '1M-10M', '10M-50M', '50M-100M', '100M-500M', '500M-1B', '>1B', 'Unknown'];
  
  if (!validRevenues.includes(revenue)) {
    return { isValid: false, message: 'Invalid annual revenue value' };
  }
  
  return { isValid: true };
};

// Validate company founded year
export const validateFoundedYear = (year) => {
  if (!year) {
    return { isValid: true }; // Founded year is optional
  }
  
  const currentYear = new Date().getFullYear();
  
  if (isNaN(year) || !Number.isInteger(Number(year))) {
    return { isValid: false, message: 'Founded year must be a valid integer' };
  }
  
  if (year < 1800 || year > currentYear) {
    return { isValid: false, message: `Founded year must be between 1800 and ${currentYear}` };
  }
  
  return { isValid: true };
};

// Validate company tags
export const validateCompanyTags = (tags) => {
  if (!tags) {
    return { isValid: true }; // Tags are optional
  }
  
  if (!Array.isArray(tags)) {
    return { isValid: false, message: 'Tags must be an array' };
  }
  
  for (const tag of tags) {
    if (typeof tag !== 'string') {
      return { isValid: false, message: 'Each tag must be a string' };
    }
    
    if (tag.trim().length < 1 || tag.trim().length > 50) {
      return { isValid: false, message: 'Each tag should be between 1 and 50 characters' };
    }
  }
  
  return { isValid: true };
};

// Validate company status
export const validateCompanyStatus = (status) => {
  if (!status) {
    return { isValid: true }; // Status is optional (default will be applied)
  }
  
  const validStatuses = ['active', 'inactive', 'lead', 'customer', 'partner', 'vendor', 'competitor', 'other'];
  
  if (!validStatuses.includes(status)) {
    return { isValid: false, message: 'Invalid company status value' };
  }
  
  return { isValid: true };
};

// Validate social media entry
export const validateSocialMedia = (socialMedia) => {
  if (!socialMedia || !Array.isArray(socialMedia) || socialMedia.length === 0) {
    return { isValid: true }; // Social media is optional
  }
  
  const validPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'other'];
  
  for (const entry of socialMedia) {
    if (typeof entry !== 'object') {
      return { isValid: false, message: 'Each social media entry must be an object' };
    }
    
    const { platform, url } = entry;
    
    if (!platform || !validPlatforms.includes(platform)) {
      return { isValid: false, message: 'Invalid social media platform' };
    }
    
    if (!url || typeof url !== 'string') {
      return { isValid: false, message: 'Social media URL is required and must be a string' };
    }
    
    // Simple URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!urlRegex.test(url)) {
      return { isValid: false, message: 'Please provide a valid social media URL' };
    }
  }
  
  return { isValid: true };
};

// Validate company logo URL
export const validateLogoUrl = (logo) => {
  if (!logo) {
    return { isValid: true }; // Logo is optional
  }
  
  if (typeof logo !== 'string') {
    return { isValid: false, message: 'Logo URL must be a string' };
  }
  
  // Simple URL validation
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
  if (!urlRegex.test(logo)) {
    return { isValid: false, message: 'Please provide a valid logo URL' };
  }
  
  return { isValid: true };
};

// Validate company description
export const validateCompanyDescription = (description) => {
  if (!description) {
    return { isValid: true }; // Description is optional
  }
  
  if (typeof description !== 'string') {
    return { isValid: false, message: 'Description must be a string' };
  }
  
  if (description.length > 5000) {
    return { isValid: false, message: 'Description cannot exceed 5000 characters' };
  }
  
  return { isValid: true };
};

// Validate custom fields
export const validateCustomFields = (customFields) => {
  if (!customFields) {
    return { isValid: true }; // Custom fields are optional
  }
  
  if (typeof customFields !== 'object' || Array.isArray(customFields)) {
    return { isValid: false, message: 'Custom fields must be an object' };
  }
  
  // Check each key and value
  for (const [key, value] of Object.entries(customFields)) {
    if (typeof key !== 'string' || key.trim().length === 0) {
      return { isValid: false, message: 'Custom field keys must be non-empty strings' };
    }
    
    if (key.length > 50) {
      return { isValid: false, message: 'Custom field keys cannot exceed 50 characters' };
    }
    
    // Allow any type of value, but check string length if it's a string
    if (typeof value === 'string' && value.length > 1000) {
      return { isValid: false, message: 'Custom field string values cannot exceed 1000 characters' };
    }
  }
  
  return { isValid: true };
};

// Comprehensive validation for company data
export const validateCompanyData = (data) => {
  const errors = {};
  let isValid = true;
  
  // Validate required fields
  const nameValidation = validateCompanyName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }
  
  // Validate project ID (required)
  if (!data.project) {
    errors.project = 'Project ID is required';
    isValid = false;
  } else {
    const projectValidation = validateObjectId(data.project);
    if (!projectValidation.isValid) {
      errors.project = projectValidation.message;
      isValid = false;
    }
  }
  
  // Validate optional fields
  const websiteValidation = validateWebsite(data.website);
  if (!websiteValidation.isValid) {
    errors.website = websiteValidation.message;
    isValid = false;
  }
  
  const emailValidation = validateCompanyEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }
  
  const phoneValidation = validateCompanyPhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
    isValid = false;
  }
  
  const addressValidation = validateAddress(data.address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.message;
    isValid = false;
  }
  
  const industryValidation = validateIndustry(data.industry);
  if (!industryValidation.isValid) {
    errors.industry = industryValidation.message;
    isValid = false;
  }
  
  const sizeValidation = validateCompanySize(data.size);
  if (!sizeValidation.isValid) {
    errors.size = sizeValidation.message;
    isValid = false;
  }
  
  const revenueValidation = validateAnnualRevenue(data.annualRevenue);
  if (!revenueValidation.isValid) {
    errors.annualRevenue = revenueValidation.message;
    isValid = false;
  }
  
  const foundedValidation = validateFoundedYear(data.founded);
  if (!foundedValidation.isValid) {
    errors.founded = foundedValidation.message;
    isValid = false;
  }
  
  const tagsValidation = validateCompanyTags(data.tags);
  if (!tagsValidation.isValid) {
    errors.tags = tagsValidation.message;
    isValid = false;
  }
  
  const statusValidation = validateCompanyStatus(data.status);
  if (!statusValidation.isValid) {
    errors.status = statusValidation.message;
    isValid = false;
  }
  
  const socialMediaValidation = validateSocialMedia(data.socialMedia);
  if (!socialMediaValidation.isValid) {
    errors.socialMedia = socialMediaValidation.message;
    isValid = false;
  }
  
  const logoValidation = validateLogoUrl(data.logo);
  if (!logoValidation.isValid) {
    errors.logo = logoValidation.message;
    isValid = false;
  }
  
  const descriptionValidation = validateCompanyDescription(data.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.message;
    isValid = false;
  }
  
  const customFieldsValidation = validateCustomFields(data.customFields);
  if (!customFieldsValidation.isValid) {
    errors.customFields = customFieldsValidation.message;
    isValid = false;
  }
  
  return { isValid, errors };
};

// Sanitize company data
export const sanitizeCompanyData = (data) => {
  const sanitized = {};
  
  // Sanitize basic fields
  if (data.name) sanitized.name = data.name.trim();
  if (data.industry) sanitized.industry = data.industry.trim();
  if (data.website) sanitized.website = data.website.trim();
  if (data.description) sanitized.description = data.description.trim();
  if (data.phone) sanitized.phone = data.phone.trim();
  if (data.email) sanitized.email = data.email.trim().toLowerCase();
  if (data.logo) sanitized.logo = data.logo.trim();
  if (data.size) sanitized.size = data.size;
  if (data.annualRevenue) sanitized.annualRevenue = data.annualRevenue;
  if (data.founded) sanitized.founded = parseInt(data.founded);
  if (data.status) sanitized.status = data.status;
  
  // Sanitize address
  if (data.address) {
    sanitized.address = {};
    if (data.address.street) sanitized.address.street = data.address.street.trim();
    if (data.address.city) sanitized.address.city = data.address.city.trim();
    if (data.address.state) sanitized.address.state = data.address.state.trim();
    if (data.address.zipCode) sanitized.address.zipCode = data.address.zipCode.trim();
    if (data.address.country) sanitized.address.country = data.address.country.trim();
  }
  
  // Sanitize tags
  if (data.tags && Array.isArray(data.tags)) {
    sanitized.tags = data.tags
      .map(tag => typeof tag === 'string' ? tag.trim() : tag)
      .filter(tag => tag && tag.length > 0);
  }
  
  // Sanitize social media
  if (data.socialMedia && Array.isArray(data.socialMedia)) {
    sanitized.socialMedia = data.socialMedia.map(item => ({
      platform: item.platform,
      url: item.url.trim(),
      handle: item.handle ? item.handle.trim() : undefined
    }));
  }
  
  // Pass through other fields
  if (data.project) sanitized.project = data.project;
  if (data.customFields) sanitized.customFields = data.customFields;
  
  return sanitized;
};

export default {
  validateCompanyName,
  validateWebsite,
  validateCompanyEmail,
  validateCompanyPhone,
  validateAddress,
  validateIndustry,
  validateCompanySize,
  validateAnnualRevenue,
  validateFoundedYear,
  validateCompanyTags,
  validateCompanyStatus,
  validateSocialMedia,
  validateLogoUrl,
  validateCompanyDescription,
  validateCustomFields,
  validateCompanyData,
  sanitizeCompanyData
};