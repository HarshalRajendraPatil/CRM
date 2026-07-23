import mongoose from 'mongoose';
import { isValidObjectId } from 'mongoose';

/**
 * Validates payment method
 */
export const validatePaymentMethod = (method) => {
  const validMethods = ['credit_card', 'bank_transfer', 'check', 'cash', 'paypal', 'stripe', 'other'];
  
  if (!method) {
    return { isValid: false, message: 'Payment method is required' };
  }
  
  if (!validMethods.includes(method)) {
    return { 
      isValid: false, 
      message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` 
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
 * Validates receipt amount
 */
export const validateReceiptAmount = (amount) => {
  if (amount === undefined || amount === null) {
    return { isValid: false, message: 'Receipt amount is required' };
  }
  
  const numAmount = Number(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Receipt amount must be a number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, message: 'Receipt amount must be greater than 0' };
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
 * Validates receipt data
 */
export const validateReceiptData = (data, isUpdate = false) => {
  const errors = {};
  const sanitizedData = { ...data };
  
  if (!isUpdate) {
    const paymentValidation = validateObjectId(data.payment, 'payment');
    if (!paymentValidation.isValid) {
      errors.payment = paymentValidation.message;
    }
    
    const invoiceValidation = validateObjectId(data.invoice, 'invoice');
    if (!invoiceValidation.isValid) {
      errors.invoice = invoiceValidation.message;
    }
    
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
    
    const amountValidation = validateReceiptAmount(data.amount);
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.message;
    }
    
    const methodValidation = validatePaymentMethod(data.paymentMethod);
    if (!methodValidation.isValid) {
      errors.paymentMethod = methodValidation.message;
    }
    
    const dateValidation = validateDate(data.paymentDate, 'payment');
    if (!dateValidation.isValid) {
      errors.paymentDate = dateValidation.message;
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
 * Sanitizes receipt data
 */
export const sanitizeReceiptData = (data) => {
  const sanitized = { ...data };
  
  if (sanitized.notes) sanitized.notes = sanitized.notes.trim();
  if (sanitized.sentToEmail) sanitized.sentToEmail = sanitized.sentToEmail.trim().toLowerCase();
  
  if (sanitized.amount !== undefined) sanitized.amount = Number(sanitized.amount);
  
  return sanitized;
};

