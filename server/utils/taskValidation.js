import { validateObjectId } from './validation.js';

// Task title validation
export const validateTaskTitle = (title) => {
  if (!title || typeof title !== 'string') {
    throw new Error('Task title is required and must be a string');
  }
  
  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    throw new Error('Task title cannot be empty');
  }
  
  if (trimmedTitle.length > 200) {
    throw new Error('Task title cannot exceed 200 characters');
  }
  
  return trimmedTitle;
};

// Task description validation
export const validateTaskDescription = (description) => {
  if (!description) return '';
  
  if (typeof description !== 'string') {
    throw new Error('Task description must be a string');
  }
  
  const trimmedDescription = description.trim();
  if (trimmedDescription.length > 2000) {
    throw new Error('Task description cannot exceed 2000 characters');
  }
  
  return trimmedDescription;
};

// Task status validation
export const validateTaskStatus = (status) => {
  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
  
  if (!status) {
    return 'pending'; // default status
  }
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid task status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  return status;
};

// Task priority validation
export const validateTaskPriority = (priority) => {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  
  if (!priority) {
    return 'medium'; // default priority
  }
  
  if (!validPriorities.includes(priority)) {
    throw new Error(`Invalid task priority. Must be one of: ${validPriorities.join(', ')}`);
  }
  
  return priority;
};

// Task type validation
export const validateTaskType = (type) => {
  const validTypes = ['follow_up', 'meeting', 'call', 'email', 'document', 'research', 'review', 'other'];
  
  if (!type) {
    return 'other'; // default type
  }
  
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid task type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  return type;
};

// Date validation
export const validateDate = (date, fieldName) => {
  if (!date) {
    throw new Error(`${fieldName} is required`);
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  
  return dateObj;
};

// Due date validation with business logic
export const validateDueDate = (dueDate, startDate = null) => {
  const due = validateDate(dueDate, 'Due date');
  const now = new Date();
  
  // Due date cannot be in the past (unless it's an update)
  if (due < now) {
    throw new Error('Due date cannot be in the past');
  }
  
  // If start date is provided, due date must be after start date
  if (startDate) {
    const start = new Date(startDate);
    if (due <= start) {
      throw new Error('Due date must be after start date');
    }
  }
  
  return due;
};

// Start date validation
export const validateStartDate = (startDate, dueDate = null) => {
  if (!startDate) return null;
  
  const start = validateDate(startDate, 'Start date');
  const now = new Date() - 1000 * 60 * 60 * 24;
  
  // Start date cannot be in the past
  if (start < now) {
    throw new Error('Start date cannot be in the past');
  }
  
  // If due date is provided, start date must be before due date
  if (dueDate) {
    const due = new Date(dueDate);
    if (start >= due) {
      throw new Error('Start date must be before due date');
    }
  }
  
  return start;
};

// Hours validation
export const validateHours = (hours, fieldName) => {
  if (hours === undefined || hours === null) return null;
  
  const numHours = Number(hours);
  if (isNaN(numHours)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  if (numHours < 0) {
    throw new Error(`${fieldName} cannot be negative`);
  }
  
  if (numHours > 999) {
    throw new Error(`${fieldName} cannot exceed 999 hours`);
  }
  
  return numHours;
};

// Progress validation
export const validateProgress = (progress) => {
  if (progress === undefined || progress === null) return 0;
  
  const numProgress = Number(progress);
  if (isNaN(numProgress)) {
    throw new Error('Progress must be a valid number');
  }
  
  if (numProgress < 0) {
    throw new Error('Progress cannot be less than 0');
  }
  
  if (numProgress > 100) {
    throw new Error('Progress cannot exceed 100');
  }
  
  return Math.round(numProgress);
};

// Related entity validation
export const validateRelatedEntity = (relatedEntity) => {
  if (!relatedEntity) return null;
  
  const validTypes = ['deal', 'customer', 'company', 'lead', 'pipeline', 'stage'];
  
  if (!relatedEntity.type || !validTypes.includes(relatedEntity.type)) {
    throw new Error(`Invalid related entity type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  if (!relatedEntity.entityId) {
    throw new Error('Related entity ID is required when type is specified');
  }
  
  validateObjectId(relatedEntity.entityId, 'Related entity ID');
  
  return {
    type: relatedEntity.type,
    entityId: relatedEntity.entityId,
    entityName: relatedEntity.entityName || ''
  };
};

// Subtask validation
export const validateSubtask = (subtask) => {
  if (!subtask.title || typeof subtask.title !== 'string') {
    throw new Error('Subtask title is required');
  }
  
  const title = subtask.title.trim();
  if (title.length === 0) {
    throw new Error('Subtask title cannot be empty');
  }
  
  if (title.length > 200) {
    throw new Error('Subtask title cannot exceed 200 characters');
  }
  
  const validatedSubtask = {
    title,
    description: subtask.description ? subtask.description.trim().substring(0, 500) : '',
    status: validateTaskStatus(subtask.status),
    assignedTo: subtask.assignedTo ? validateObjectId(subtask.assignedTo, 'Subtask assigned to') : null,
    dueDate: subtask.dueDate ? validateDate(subtask.dueDate, 'Subtask due date') : null
  };
  
  return validatedSubtask;
};

// Subtasks validation
export const validateSubtasks = (subtasks) => {
  if (!Array.isArray(subtasks)) {
    throw new Error('Subtasks must be an array');
  }
  
  if (subtasks.length > 50) {
    throw new Error('Cannot have more than 50 subtasks');
  }
  
  return subtasks.map(validateSubtask);
};

// Dependencies validation
export const validateDependencies = (dependencies) => {
  if (!Array.isArray(dependencies)) {
    throw new Error('Dependencies must be an array');
  }
  
  if (dependencies.length > 20) {
    throw new Error('Cannot have more than 20 dependencies');
  }
  
  const validTypes = ['blocks', 'blocked_by', 'related_to'];
  
  return dependencies.map(dep => {
    if (!dep.task) {
      throw new Error('Dependency task ID is required');
    }
    
    validateObjectId(dep.task, 'Dependency task ID');
    
    if (!dep.type || !validTypes.includes(dep.type)) {
      throw new Error(`Invalid dependency type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    return {
      task: dep.task,
      type: dep.type
    };
  });
};

// Tags validation
export const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    throw new Error('Tags must be an array');
  }
  
  if (tags.length > 20) {
    throw new Error('Cannot have more than 20 tags');
  }
  
  return tags.map(tag => {
    if (typeof tag !== 'string') {
      throw new Error('Each tag must be a string');
    }
    
    const trimmedTag = tag.trim();
    if (trimmedTag.length === 0) {
      throw new Error('Tag cannot be empty');
    }
    
    if (trimmedTag.length > 50) {
      throw new Error('Tag cannot exceed 50 characters');
    }
    
    return trimmedTag;
  });
};

// Custom fields validation
export const validateCustomFields = (customFields) => {
  if (!customFields || typeof customFields !== 'object') {
    return new Map();
  }
  
  const fieldMap = new Map();
  const fieldCount = Object.keys(customFields).length;
  
  if (fieldCount > 20) {
    throw new Error('Cannot have more than 20 custom fields');
  }
  
  for (const [key, value] of Object.entries(customFields)) {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Custom field key must be a non-empty string');
    }
    
    if (key.length > 50) {
      throw new Error('Custom field key cannot exceed 50 characters');
    }
    
    // Validate value based on type
    if (value !== null && value !== undefined) {
      if (typeof value === 'string' && value.length > 500) {
        throw new Error(`Custom field "${key}" value cannot exceed 500 characters`);
      }
    }
    
    fieldMap.set(key.trim(), value);
  }
  
  return fieldMap;
};

// Recurrence validation
export const validateRecurrence = (recurrence) => {
  if (!recurrence || !recurrence.enabled) {
    return { enabled: false };
  }
  
  const validPatterns = ['daily', 'weekly', 'monthly', 'yearly'];
  
  if (!recurrence.pattern || !validPatterns.includes(recurrence.pattern)) {
    throw new Error(`Invalid recurrence pattern. Must be one of: ${validPatterns.join(', ')}`);
  }
  
  const interval = Number(recurrence.interval) || 1;
  if (interval < 1 || interval > 365) {
    throw new Error('Recurrence interval must be between 1 and 365');
  }
  
  const validatedRecurrence = {
    enabled: true,
    pattern: recurrence.pattern,
    interval
  };
  
  // Validate days of week for weekly pattern
  if (recurrence.pattern === 'weekly' && recurrence.daysOfWeek) {
    if (!Array.isArray(recurrence.daysOfWeek)) {
      throw new Error('Days of week must be an array');
    }
    
    const validDays = recurrence.daysOfWeek.every(day => 
      Number.isInteger(day) && day >= 0 && day <= 6
    );
    
    if (!validDays) {
      throw new Error('Days of week must be integers between 0 and 6');
    }
    
    validatedRecurrence.daysOfWeek = [...new Set(recurrence.daysOfWeek)].sort();
  }
  
  // Validate end date
  if (recurrence.endDate) {
    validatedRecurrence.endDate = validateDate(recurrence.endDate, 'Recurrence end date');
  }
  
  // Validate occurrences
  if (recurrence.occurrences) {
    const occurrences = Number(recurrence.occurrences);
    if (occurrences < 1 || occurrences > 1000) {
      throw new Error('Recurrence occurrences must be between 1 and 1000');
    }
    validatedRecurrence.occurrences = occurrences;
  }
  
  return validatedRecurrence;
};

// Reminders validation
export const validateReminders = (reminders) => {
  if (!Array.isArray(reminders)) {
    throw new Error('Reminders must be an array');
  }
  
  if (reminders.length > 10) {
    throw new Error('Cannot have more than 10 reminders');
  }
  
  const validTypes = ['email', 'push', 'sms'];
  const validTriggers = ['before_due', 'on_due', 'overdue'];
  
  return reminders.map(reminder => {
    if (!validTypes.includes(reminder.type)) {
      throw new Error(`Invalid reminder type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (!validTriggers.includes(reminder.trigger)) {
      throw new Error(`Invalid reminder trigger. Must be one of: ${validTriggers.join(', ')}`);
    }
    
    const offset = Number(reminder.offset) || 0;
    if (offset < -1440 || offset > 1440) { // -24 hours to +24 hours
      throw new Error('Reminder offset must be between -1440 and 1440 minutes');
    }
    
    return {
      type: reminder.type,
      trigger: reminder.trigger,
      offset,
      sent: false
    };
  });
};

// Visibility validation
export const validateVisibility = (visibility) => {
  const validVisibilities = ['private', 'project', 'public'];
  
  if (!visibility) {
    return 'project'; // default visibility
  }
  
  if (!validVisibilities.includes(visibility)) {
    throw new Error(`Invalid visibility. Must be one of: ${validVisibilities.join(', ')}`);
  }
  
  return visibility;
};

// Main task data validation
export const validateTaskData = (data, isUpdate = false) => {
  const errors = [];
  const validatedData = {};
  
  try {
    // Required fields for creation
    if (!isUpdate) {
      validatedData.title = validateTaskTitle(data.title);
      validatedData.project = validateObjectId(data.project, 'Project');
      validatedData.assignedTo = validateObjectId(data.assignedTo, 'Assigned to');
      validatedData.createdBy = validateObjectId(data.createdBy, 'Created by');
      validatedData.dueDate = validateDueDate(data.dueDate, data.startDate);
    } else {
      // For updates, only validate provided fields
      if (data.title !== undefined) {
        validatedData.title = validateTaskTitle(data.title);
      }
      if (data.project !== undefined) {
        validatedData.project = validateObjectId(data.project, 'Project');
      }
      if (data.assignedTo !== undefined) {
        validatedData.assignedTo = validateObjectId(data.assignedTo, 'Assigned to');
      }
      if (data.dueDate !== undefined) {
        validatedData.dueDate = validateDueDate(data.dueDate, data.startDate);
      }
    }
    
    // Optional fields
    if (data.description !== undefined) {
      validatedData.description = validateTaskDescription(data.description);
    }
    if (data.status !== undefined) {
      validatedData.status = validateTaskStatus(data.status);
    }
    if (data.priority !== undefined) {
      validatedData.priority = validateTaskPriority(data.priority);
    }
    if (data.type !== undefined) {
      validatedData.type = validateTaskType(data.type);
    }
    if (data.startDate !== undefined) {
      validatedData.startDate = validateStartDate(data.startDate, data.dueDate);
    }
    if (data.estimatedHours !== undefined) {
      validatedData.estimatedHours = validateHours(data.estimatedHours, 'Estimated hours');
    }
    if (data.actualHours !== undefined) {
      validatedData.actualHours = validateHours(data.actualHours, 'Actual hours');
    }
    if (data.progress !== undefined) {
      validatedData.progress = validateProgress(data.progress);
    }
    if (data.completionNotes !== undefined) {
      validatedData.completionNotes = data.completionNotes ? data.completionNotes.trim().substring(0, 1000) : '';
    }
    if (data.relatedEntity !== undefined) {
      validatedData.relatedEntity = validateRelatedEntity(data.relatedEntity);
    }
    if (data.subtasks !== undefined) {
      validatedData.subtasks = validateSubtasks(data.subtasks);
    }
    if (data.dependencies !== undefined) {
      validatedData.dependencies = validateDependencies(data.dependencies);
    }
    if (data.tags !== undefined) {
      validatedData.tags = validateTags(data.tags);
    }
    if (data.customFields !== undefined) {
      validatedData.customFields = validateCustomFields(data.customFields);
    }
    if (data.recurrence !== undefined) {
      validatedData.recurrence = validateRecurrence(data.recurrence);
    }
    if (data.reminders !== undefined) {
      validatedData.reminders = validateReminders(data.reminders);
    }
    if (data.visibility !== undefined) {
      validatedData.visibility = validateVisibility(data.visibility);
    }
    
  } catch (error) {
    errors.push(error.message);
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return validatedData;
};

// Sanitize task data
export const sanitizeTaskData = (data) => {
  const sanitized = { ...data };
  
  // Remove any fields that shouldn't be in the request
  const allowedFields = [
    'title', 'description', 'project', 'assignedTo', 'createdBy',
    'status', 'priority', 'type', 'dueDate', 'startDate',
    'estimatedHours', 'actualHours', 'progress', 'completionNotes',
    'relatedEntity', 'subtasks', 'dependencies', 'tags',
    'customFields', 'recurrence', 'reminders', 'visibility'
  ];
  
  Object.keys(sanitized).forEach(key => {
    if (!allowedFields.includes(key)) {
      delete sanitized[key];
    }
  });
  
  return sanitized;
};
