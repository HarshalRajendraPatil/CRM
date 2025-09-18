import mongoose from 'mongoose';
import { isValidObjectId } from 'mongoose';

/**
 * Validates a deal name
 * @param {string} name - Deal name to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDealName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Deal name is required' };
  }

  name = name.trim();
  
  if (name.length < 2) {
    return { isValid: false, message: 'Deal name must be at least 2 characters long' };
  }
  
  if (name.length > 200) {
    return { isValid: false, message: 'Deal name cannot exceed 200 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validates a deal value
 * @param {number} value - Deal value to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDealValue = (value) => {
  if (value === undefined || value === null) {
    return { isValid: false, message: 'Deal value is required' };
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, message: 'Deal value must be a number' };
  }
  
  if (numValue < 0) {
    return { isValid: false, message: 'Deal value cannot be negative' };
  }
  
  if (numValue > 1000000000000) { // 1 trillion limit
    return { isValid: false, message: 'Deal value is too large' };
  }
  
  return { isValid: true };
};

/**
 * Validates a deal currency
 * @param {string} currency - Currency code to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDealCurrency = (currency) => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];
  
  if (!currency) {
    return { isValid: true }; // Default currency will be used
  }
  
  if (!validCurrencies.includes(currency)) {
    return { 
      isValid: false, 
      message: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}` 
    };
  }
  
  return { isValid: true };
};


/**
 * Validates a deal status
 * @param {string} status - Status to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDealStatus = (status) => {
  const validStatuses = ['open', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost', 'on-hold'];
  
  if (!status) {
    return { isValid: true }; // Default status will be used
  }
  
  if (!validStatuses.includes(status)) {
    return { 
      isValid: false, 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates a deal priority
 * @param {string} priority - Priority to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDealPriority = (priority) => {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  
  if (!priority) {
    return { isValid: true }; // Default priority will be used
  }
  
  if (!validPriorities.includes(priority)) {
    return { 
      isValid: false, 
      message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates a deal probability
 * @param {number} probability - Probability percentage to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDealProbability = (probability) => {
  if (probability === undefined || probability === null) {
    return { isValid: true }; // Default probability will be used
  }
  
  const numProbability = Number(probability);
  
  if (isNaN(numProbability)) {
    return { isValid: false, message: 'Deal probability must be a number' };
  }
  
  if (numProbability < 0 || numProbability > 100) {
    return { isValid: false, message: 'Deal probability must be between 0 and 100' };
  }
  
  return { isValid: true };
};

/**
 * Validates a date string or Date object
 * @param {string|Date} date - Date to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDate = (date, fieldName) => {
  if (!date) {
    return { isValid: true }; // Date is optional
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `Invalid ${fieldName} date` };
  }
  
  return { isValid: true };
};

/**
 * Validates deal tags
 * @param {Array} tags - Array of tags to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDealTags = (tags) => {
  if (!tags) {
    return { isValid: true }; // Tags are optional
  }
  
  if (!Array.isArray(tags)) {
    return { isValid: false, message: 'Tags must be an array' };
  }
  
  // Check each tag
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    
    if (typeof tag !== 'string') {
      return { isValid: false, message: 'Each tag must be a string' };
    }
    
    if (tag.trim().length === 0) {
      return { isValid: false, message: 'Tags cannot be empty strings' };
    }
    
    if (tag.length > 50) {
      return { isValid: false, message: `Tag "${tag}" is too long (max 50 characters)` };
    }
  }
  
  // Check for duplicate tags
  const uniqueTags = new Set(tags);
  if (uniqueTags.size !== tags.length) {
    return { isValid: false, message: 'Duplicate tags are not allowed' };
  }
  
  return { isValid: true };
};

/**
 * Validates an ObjectId
 * @param {string} id - ID to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateObjectId = (id, fieldName) => {
  if (!id) {
    return { isValid: true }; // ID might be optional
  }
  
  if (!isValidObjectId(id)) {
    return { isValid: false, message: `Invalid ${fieldName} ID format` };
  }
  
  return { isValid: true };
};

/**
 * Validates a contact person object
 * @param {Object} contact - Contact person object to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateContactPerson = (contact) => {
  if (!contact) {
    return { isValid: true }; // Contact person is optional
  }
  
  if (typeof contact !== 'object') {
    return { isValid: false, message: 'Contact person must be an object' };
  }
  
  // Validate email if provided
  if (contact.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      return { isValid: false, message: 'Invalid contact email address' };
    }
  }
  
  // Validate name if provided
  if (contact.name && (typeof contact.name !== 'string' || contact.name.trim().length === 0)) {
    return { isValid: false, message: 'Contact name must be a non-empty string' };
  }
  
  return { isValid: true };
};

/**
 * Validates deal products array
 * @param {Array} products - Array of product objects to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDealProducts = (products) => {
  if (!products) {
    return { isValid: true }; // Products are optional
  }
  
  if (!Array.isArray(products)) {
    return { isValid: false, message: 'Products must be an array' };
  }
  
  // Check each product
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    if (typeof product !== 'object') {
      return { isValid: false, message: 'Each product must be an object' };
    }
    
    if (!product.name || typeof product.name !== 'string' || product.name.trim().length === 0) {
      return { isValid: false, message: 'Each product must have a valid name' };
    }
    
    if (product.quantity === undefined || isNaN(Number(product.quantity)) || Number(product.quantity) <= 0) {
      return { isValid: false, message: `Product "${product.name}" must have a valid quantity greater than 0` };
    }
    
    if (product.unitPrice === undefined || isNaN(Number(product.unitPrice)) || Number(product.unitPrice) < 0) {
      return { isValid: false, message: `Product "${product.name}" must have a valid unit price` };
    }
    
    if ((product.discount !== undefined && (isNaN(Number(product.discount)) || Number(product.discount) < 0))) {
      return { isValid: false, message: `Product "${product.name}" has an invalid discount` };
    }
    
    if ((product.tax !== undefined && (isNaN(Number(product.tax)) || Number(product.tax) < 0))) {
      return { isValid: false, message: `Product "${product.name}" has an invalid tax` };
    }
    
    if (product.totalPrice === undefined || isNaN(Number(product.totalPrice)) || Number(product.totalPrice) < 0) {
      return { isValid: false, message: `Product "${product.name}" must have a valid total price` };
    }
  }
  
  return { isValid: true };
};

/**
 * Validates custom fields object
 * @param {Object} customFields - Custom fields object to validate
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateCustomFields = (customFields) => {
  if (!customFields) {
    return { isValid: true }; // Custom fields are optional
  }
  
  // Handle both array format (from frontend) and object format
  if (Array.isArray(customFields)) {
    // Convert array format to object format
    const convertedFields = {};
    for (const field of customFields) {
      if (field && field.key && field.value !== undefined) {
        if (field.key.length > 50) {
          return { isValid: false, message: `Custom field key "${field.key}" is too long (max 50 characters)` };
        }
        convertedFields[field.key] = field.value;
      }
    }
    return { isValid: true, convertedFields };
  }
  
  if (typeof customFields !== 'object') {
    return { isValid: false, message: 'Custom fields must be an object or array' };
  }
  
  // Check each custom field
  const keys = Object.keys(customFields);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    
    if (key.length > 50) {
      return { isValid: false, message: `Custom field key "${key}" is too long (max 50 characters)` };
    }
    
    // Check if value is not undefined
    if (customFields[key] === undefined) {
      return { isValid: false, message: `Custom field "${key}" has undefined value` };
    }
  }
  
  return { isValid: true };
};

/**
 * Validates the entire deal data object
 * @param {Object} data - Deal data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - Validation result with isValid, errors, and sanitizedData properties
 */
export const validateDealData = (data, isUpdate = false) => {
  const errors = {};
  const sanitizedData = { ...data };
  
  // Required fields for creation
  if (!isUpdate) {
    // Validate required fields
    const nameValidation = validateDealName(data.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.message;
    }
    
    const valueValidation = validateDealValue(data.value);
    if (!valueValidation.isValid) {
      errors.value = valueValidation.message;
    }
    
    
    const projectIdValidation = validateObjectId(data.projectId, 'project');
    if (!projectIdValidation.isValid) {
      errors.projectId = projectIdValidation.message;
    }
  }
  
  // Optional fields - only validate if present
  if (data.currency !== undefined) {
    const currencyValidation = validateDealCurrency(data.currency);
    if (!currencyValidation.isValid) {
      errors.currency = currencyValidation.message;
    }
  }
  
  if (data.status !== undefined) {
    const statusValidation = validateDealStatus(data.status);
    if (!statusValidation.isValid) {
      errors.status = statusValidation.message;
    }
  }
  
  if (data.priority !== undefined) {
    const priorityValidation = validateDealPriority(data.priority);
    if (!priorityValidation.isValid) {
      errors.priority = priorityValidation.message;
    }
  }
  
  if (data.probability !== undefined) {
    const probabilityValidation = validateDealProbability(data.probability);
    if (!probabilityValidation.isValid) {
      errors.probability = probabilityValidation.message;
    }
  }
  
  if (data.expectedCloseDate !== undefined) {
    const expectedCloseDateValidation = validateDate(data.expectedCloseDate, 'expected close');
    if (!expectedCloseDateValidation.isValid) {
      errors.expectedCloseDate = expectedCloseDateValidation.message;
    }
  }
  
  if (data.tags !== undefined) {
    const tagsValidation = validateDealTags(data.tags);
    if (!tagsValidation.isValid) {
      errors.tags = tagsValidation.message;
    }
  }
  
  if (data.customer !== undefined) {
    const customerValidation = validateObjectId(data.customer, 'customer');
    if (!customerValidation.isValid) {
      errors.customer = customerValidation.message;
    }
  }
  
  if (data.company !== undefined) {
    const companyValidation = validateObjectId(data.company, 'company');
    if (!companyValidation.isValid) {
      errors.company = companyValidation.message;
    }
  }
  
  if (data.contactPerson !== undefined) {
    const contactValidation = validateContactPerson(data.contactPerson);
    if (!contactValidation.isValid) {
      errors.contactPerson = contactValidation.message;
    }
  }
  
  if (data.assignedTo !== undefined) {
    const assignedToValidation = validateObjectId(data.assignedTo, 'assigned user');
    if (!assignedToValidation.isValid) {
      errors.assignedTo = assignedToValidation.message;
    }
  }
  
  if (data.products !== undefined) {
    const productsValidation = validateDealProducts(data.products);
    if (!productsValidation.isValid) {
      errors.products = productsValidation.message;
    }
  }
  
  if (data.customFields !== undefined) {
    const customFieldsValidation = validateCustomFields(data.customFields);
    if (!customFieldsValidation.isValid) {
      errors.customFields = customFieldsValidation.message;
    } else if (customFieldsValidation.convertedFields) {
      // Convert array format to object format for MongoDB Map
      sanitizedData.customFields = customFieldsValidation.convertedFields;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

/**
 * Sanitizes deal data for security and consistency
 * @param {Object} data - Deal data to sanitize
 * @returns {Object} - Sanitized deal data
 */
export const sanitizeDealData = (data) => {
  const sanitized = { ...data };
  
  // Trim string fields
  if (sanitized.name) sanitized.name = sanitized.name.trim();
  if (sanitized.description) sanitized.description = sanitized.description.trim();
  if (sanitized.source) sanitized.source = sanitized.source.trim();
  if (sanitized.lossReason) sanitized.lossReason = sanitized.lossReason.trim();
  if (sanitized.winReason) sanitized.winReason = sanitized.winReason.trim();
  if (sanitized.nextAction) sanitized.nextAction = sanitized.nextAction.trim();
  
  // Convert numeric strings to numbers
  if (sanitized.value !== undefined) sanitized.value = Number(sanitized.value);
  if (sanitized.probability !== undefined) sanitized.probability = Number(sanitized.probability);
  
  // Ensure tags are unique and trimmed
  if (Array.isArray(sanitized.tags)) {
    sanitized.tags = [...new Set(sanitized.tags.map(tag => tag.trim()))].filter(tag => tag.length > 0);
  }
  
  // Process products
  if (Array.isArray(sanitized.products)) {
    sanitized.products = sanitized.products.map(product => ({
      ...product,
      name: product.name?.trim(),
      description: product.description?.trim(),
      quantity: Number(product.quantity),
      unitPrice: Number(product.unitPrice),
      discount: product.discount !== undefined ? Number(product.discount) : 0,
      tax: product.tax !== undefined ? Number(product.tax) : 0,
      totalPrice: Number(product.totalPrice)
    }));
  }
  
  // Clean up contact person
  if (sanitized.contactPerson) {
    if (sanitized.contactPerson.name) {
      sanitized.contactPerson.name = sanitized.contactPerson.name.trim();
    }
    if (sanitized.contactPerson.email) {
      sanitized.contactPerson.email = sanitized.contactPerson.email.trim().toLowerCase();
    }
    if (sanitized.contactPerson.phone) {
      sanitized.contactPerson.phone = sanitized.contactPerson.phone.trim();
    }
    if (sanitized.contactPerson.position) {
      sanitized.contactPerson.position = sanitized.contactPerson.position.trim();
    }
  }
  
  return sanitized;
};
