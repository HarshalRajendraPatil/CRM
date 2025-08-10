export const validateActivityType = (type) => {
  const allowed = new Set([
    'created','updated','deleted',
    'note_added','note_updated','note_deleted',
    'tag_added','tag_removed',
    'stage_changed','status_changed','assignment_changed','owner_changed',
    'lead_score_updated','custom_field_added','custom_field_removed',
    'social_link_added','social_link_removed',
    'email_sent','email_received','call_made','call_received',
    'meeting_scheduled','meeting_completed','task_created','task_completed',
    'imported','exported','merged','duplicated','restored','other'
  ]);
  if (!allowed.has(type)) {
    return { isValid: false, message: 'Invalid activity type' };
  }
  return { isValid: true };
};

export const validateEntityType = (entityType) => {
  const allowed = new Set(['contact','company','project','deal','task','pipeline','stage','invitation','notification','user','system','note','email','call','meeting','activity','other']);
  if (!allowed.has(entityType)) {
    return { isValid: false, message: 'Invalid entity type' };
  }
  return { isValid: true };
};

export const validateVisibility = (visibility) => {
  const allowed = new Set(['private','team','public']);
  if (visibility && !allowed.has(visibility)) {
    return { isValid: false, message: 'Invalid visibility value' };
  }
  return { isValid: true };
};

export const validatePriority = (priority) => {
  const allowed = new Set(['low','medium','high']);
  if (priority && !allowed.has(priority)) {
    return { isValid: false, message: 'Invalid priority value' };
  }
  return { isValid: true };
};

export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/[<>]/g, '');
};

export const validateActivityData = (data) => {
  const errors = {};
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { general: 'Invalid payload' } };
  }

  if (!data.projectId) errors.projectId = 'Project ID is required';
  if (!data.entityType) errors.entityType = 'Entity type is required';
  if (!data.entityId) errors.entityId = 'Entity ID is required';
  if (!data.type) errors.type = 'Activity type is required';
  if (!data.actorId) errors.actorId = 'Actor ID is required';

  const typeVal = validateActivityType(data.type);
  if (!typeVal.isValid) errors.type = typeVal.message;

  const entVal = validateEntityType(data.entityType);
  if (!entVal.isValid) errors.entityType = entVal.message;

  const visVal = validateVisibility(data.visibility);
  if (!visVal.isValid) errors.visibility = visVal.message;

  const prVal = validatePriority(data.priority);
  if (!prVal.isValid) errors.priority = prVal.message;

  return { isValid: Object.keys(errors).length === 0, errors };
};


