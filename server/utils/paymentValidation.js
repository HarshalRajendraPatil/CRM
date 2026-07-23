import mongoose from 'mongoose';
import { isValidObjectId } from 'mongoose';

/**
 * Validates payment status
 */
export const validatePaymentStatus = (status) => {
  const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
  
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
 * Validates payment amount
 */
export const validatePaymentAmount = (amount) => {
  if (amount === undefined || amount === null) {
    return { isValid: false, message: 'Payment amount is required' };
  }
  
  const numAmount = Number(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Payment amount must be a number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, message: 'Payment amount must be greater than 0' };
  }
  
  if (numAmount > 1000000000000) {
    return { isValid: false, message: 'Payment amount is too large' };
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
 * Validates payment data
 */
export const validatePaymentData = (data, isUpdate = false) => {
  const errors = {};
  const sanitizedData = { ...data };
  
  if (!isUpdate) {
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
    
    const amountValidation = validatePaymentAmount(data.amount);
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
  
  if (data.status !== undefined) {
    const statusValidation = validatePaymentStatus(data.status);
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
 * Sanitizes payment data
 */
export const sanitizePaymentData = (data) => {
  const sanitized = { ...data };
  
  if (sanitized.notes) sanitized.notes = sanitized.notes.trim();
  if (sanitized.transactionId) sanitized.transactionId = sanitized.transactionId.trim();
  if (sanitized.referenceNumber) sanitized.referenceNumber = sanitized.referenceNumber.trim();
  if (sanitized.bankName) sanitized.bankName = sanitized.bankName.trim();
  if (sanitized.checkNumber) sanitized.checkNumber = sanitized.checkNumber.trim();
  if (sanitized.cardLast4) sanitized.cardLast4 = sanitized.cardLast4.trim();
  if (sanitized.refundReason) sanitized.refundReason = sanitized.refundReason.trim();
  
  if (sanitized.amount !== undefined) sanitized.amount = Number(sanitized.amount);
  if (sanitized.refundAmount !== undefined) sanitized.refundAmount = Number(sanitized.refundAmount);
  
  return sanitized;
};

