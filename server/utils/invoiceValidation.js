import mongoose from 'mongoose';
import { isValidObjectId } from 'mongoose';

/**
 * Validates invoice status
 */
export const validateInvoiceStatus = (status) => {
  const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid'];
  
  if (!status) {
    return { isValid: true };
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
 * Validates currency
 */
export const validateCurrency = (currency) => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];
  
  if (!currency) {
    return { isValid: true };
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
 * Validates an ObjectId
 */
export const validateObjectId = (id, fieldName) => {
  if (!id) {
    return { isValid: true };
  }
  
  if (!isValidObjectId(id)) {
    return { isValid: false, message: `Invalid ${fieldName} ID format` };
  }
  
  return { isValid: true };
};

/**
 * Validates a date
 */
export const validateDate = (date, fieldName) => {
  if (!date) {
    return { isValid: true };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `Invalid ${fieldName} date` };
  }
  
  return { isValid: true };
};

/**
 * Validates invoice items
 */
export const validateInvoiceItems = (items) => {
  if (!items) {
    return { isValid: true };
  }
  
  if (!Array.isArray(items)) {
    return { isValid: false, message: 'Items must be an array' };
  }
  
  if (items.length === 0) {
    return { isValid: false, message: 'Invoice must have at least one item' };
  }
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (typeof item !== 'object') {
      return { isValid: false, message: 'Each item must be an object' };
    }
    
    if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
      return { isValid: false, message: 'Each item must have a valid name' };
    }
    
    if (item.quantity === undefined || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
      return { isValid: false, message: `Item "${item.name}" must have a valid quantity greater than 0` };
    }
    
    if (item.unitPrice === undefined || isNaN(Number(item.unitPrice)) || Number(item.unitPrice) < 0) {
      return { isValid: false, message: `Item "${item.name}" must have a valid unit price` };
    }
    
    if (item.totalPrice === undefined || isNaN(Number(item.totalPrice)) || Number(item.totalPrice) < 0) {
      return { isValid: false, message: `Item "${item.name}" must have a valid total price` };
    }
  }
  
  return { isValid: true };
};

/**
 * Validates custom fields
 */
export const validateCustomFields = (customFields) => {
  if (!customFields) {
    return { isValid: true };
  }
  
  if (Array.isArray(customFields)) {
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
  
  const keys = Object.keys(customFields);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    
    if (key.length > 50) {
      return { isValid: false, message: `Custom field key "${key}" is too long (max 50 characters)` };
    }
    
    if (customFields[key] === undefined) {
      return { isValid: false, message: `Custom field "${key}" has undefined value` };
    }
  }
  
  return { isValid: true };
};

/**
 * Validates invoice data
 */
export const validateInvoiceData = (data, isUpdate = false) => {
  const errors = {};
  const sanitizedData = { ...data };
  
  if (!isUpdate) {
    const dealValidation = validateObjectId(data.deal, 'deal');
    if (!dealValidation.isValid) {
      errors.deal = dealValidation.message;
    }
    
    const customerValidation = validateObjectId(data.customer, 'customer');
    if (!customerValidation.isValid) {
      errors.customer = customerValidation.message;
    }
    
    const projectValidation = validateObjectId(data.project, 'project');
    if (!projectValidation.isValid) {
      errors.project = projectValidation.message;
    }
    
    const dueDateValidation = validateDate(data.dueDate, 'due');
    if (!dueDateValidation.isValid) {
      errors.dueDate = dueDateValidation.message;
    }
    
    const itemsValidation = validateInvoiceItems(data.items);
    if (!itemsValidation.isValid) {
      errors.items = itemsValidation.message;
    }
  }
  
  if (data.status !== undefined) {
    const statusValidation = validateInvoiceStatus(data.status);
    if (!statusValidation.isValid) {
      errors.status = statusValidation.message;
    }
  }
  
  if (data.currency !== undefined) {
    const currencyValidation = validateCurrency(data.currency);
    if (!currencyValidation.isValid) {
      errors.currency = currencyValidation.message;
    }
  }
  
  if (data.company !== undefined && data.company !== null) {
    const companyValidation = validateObjectId(data.company, 'company');
    if (!companyValidation.isValid) {
      errors.company = companyValidation.message;
    }
  }
  
  if (data.customFields !== undefined) {
    const customFieldsValidation = validateCustomFields(data.customFields);
    if (!customFieldsValidation.isValid) {
      errors.customFields = customFieldsValidation.message;
    } else if (customFieldsValidation.convertedFields) {
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
 * Sanitizes invoice data
 */
export const sanitizeInvoiceData = (data) => {
  const sanitized = { ...data };
  
  if (sanitized.notes) sanitized.notes = sanitized.notes.trim();
  if (sanitized.terms) sanitized.terms = sanitized.terms.trim();
  if (sanitized.sentToEmail) sanitized.sentToEmail = sanitized.sentToEmail.trim().toLowerCase();
  
  if (sanitized.items && Array.isArray(sanitized.items)) {
    sanitized.items = sanitized.items.map(item => ({
      ...item,
      name: item.name?.trim(),
      description: item.description?.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discount: item.discount !== undefined ? Number(item.discount) : 0,
      tax: item.tax !== undefined ? Number(item.tax) : 0,
      totalPrice: Number(item.totalPrice)
    }));
  }
  
  if (sanitized.subtotal !== undefined) sanitized.subtotal = Number(sanitized.subtotal);
  if (sanitized.tax !== undefined) sanitized.tax = Number(sanitized.tax);
  if (sanitized.discount !== undefined) sanitized.discount = Number(sanitized.discount);
  if (sanitized.total !== undefined) sanitized.total = Number(sanitized.total);
  if (sanitized.paidAmount !== undefined) sanitized.paidAmount = Number(sanitized.paidAmount);
  
  return sanitized;
};

