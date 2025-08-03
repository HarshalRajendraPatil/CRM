import mongoose from 'mongoose';

// Validate project name
export const validateProjectName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Project name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, message: 'Project name must be at least 2 characters long' };
  }
  
  if (name.length > 100) {
    return { isValid: false, message: 'Project name cannot exceed 100 characters' };
  }
  
  return { isValid: true };
};

// Validate pipeline name
export const validatePipelineName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Pipeline name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, message: 'Pipeline name must be at least 2 characters long' };
  }
  
  if (name.length > 50) {
    return { isValid: false, message: 'Pipeline name cannot exceed 50 characters' };
  }
  
  return { isValid: true };
};

// Validate stage name
export const validateStageName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Stage name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, message: 'Stage name must be at least 2 characters long' };
  }
  
  if (name.length > 50) {
    return { isValid: false, message: 'Stage name cannot exceed 50 characters' };
  }
  
  return { isValid: true };
};

// Validate description
export const validateDescription = (description) => {
  if (!description) {
    return { isValid: true }; // Description is optional
  }
  
  if (description.length > 1000) {
    return { isValid: false, message: 'Description cannot exceed 1000 characters' };
  }
  
  return { isValid: true };
};

// Validate visibility
export const validateVisibility = (visibility) => {
  const validVisibilities = ['public', 'private', 'team'];
  
  if (!visibility) {
    return { isValid: true }; // Will use default
  }
  
  if (!validVisibilities.includes(visibility)) {
    return { isValid: false, message: 'Visibility must be one of: public, private, team' };
  }
  
  return { isValid: true };
};

// Validate member role
export const validateMemberRole = (role) => {
  const validRoles = ['admin', 'manager', 'sales_executive', 'support_executive', 'viewer'];
  
  if (!role) {
    return { isValid: true }; // Will use default
  }
  
  if (!validRoles.includes(role)) {
    return { isValid: false, message: 'Role must be one of: admin, manager, sales_executive, support_executive, viewer' };
  }
  
  return { isValid: true };
};

// Validate ObjectId
export const validateObjectId = (id) => {
  if (!id) {
    return { isValid: false, message: 'ID is required' };
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { isValid: false, message: 'Invalid ID format' };
  }
  
  return { isValid: true };
};

// Validate color
export const validateColor = (color) => {
  if (!color) {
    return { isValid: true }; // Color is optional
  }
  
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return { isValid: false, message: 'Please provide a valid hex color' };
  }
  
  return { isValid: true };
};

// Validate logo URL
export const validateLogoUrl = (url) => {
  if (!url) {
    return { isValid: true }; // Logo is optional
  }
  
  if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
    return { isValid: false, message: 'Please provide a valid image URL' };
  }
  
  return { isValid: true };
};

// Validate timezone
export const validateTimezone = (timezone) => {
  if (!timezone) {
    return { isValid: true }; // Will use default
  }
  
  // This is a simplified validation - in production, you might want to use a library like moment-timezone
  // to validate against actual timezone identifiers
  if (timezone.length > 50) {
    return { isValid: false, message: 'Timezone format is invalid' };
  }
  
  return { isValid: true };
};

// Validate tags
export const validateTags = (tags) => {
  if (!tags || !Array.isArray(tags)) {
    return { isValid: true }; // Tags are optional
  }
  
  for (const tag of tags) {
    if (typeof tag !== 'string') {
      return { isValid: false, message: 'Tags must be strings' };
    }
    
    if (tag.length > 50) {
      return { isValid: false, message: 'Tag length cannot exceed 50 characters' };
    }
  }
  
  return { isValid: true };
};

// Comprehensive validation for project creation
export const validateProjectData = (data) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateProjectName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  
  // Validate owner
  const ownerValidation = validateObjectId(data.owner);
  if (!ownerValidation.isValid) {
    errors.owner = ownerValidation.message;
  }
  
  // Validate description
  const descriptionValidation = validateDescription(data.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.message;
  }
  
  // Validate visibility
  const visibilityValidation = validateVisibility(data.visibility);
  if (!visibilityValidation.isValid) {
    errors.visibility = visibilityValidation.message;
  }
  
  // Validate logo
  const logoValidation = validateLogoUrl(data.logo);
  if (!logoValidation.isValid) {
    errors.logo = logoValidation.message;
  }
  
  // Validate timezone
  const timezoneValidation = validateTimezone(data.timezone);
  if (!timezoneValidation.isValid) {
    errors.timezone = timezoneValidation.message;
  }
  
  // Validate tags
  const tagsValidation = validateTags(data.tags);
  if (!tagsValidation.isValid) {
    errors.tags = tagsValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Comprehensive validation for pipeline creation
export const validatePipelineData = (data) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validatePipelineName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  
  // Validate description
  if (data.description) {
    const descriptionValidation = validateDescription(data.description);
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.message;
    }
  }
  
  // Validate stages if provided
  if (data.stages && Array.isArray(data.stages)) {
    const stageErrors = [];
    
    data.stages.forEach((stage, index) => {
      const stageError = {};
      
      // Validate stage name
      const nameValidation = validateStageName(stage.name);
      if (!nameValidation.isValid) {
        stageError.name = nameValidation.message;
      }
      
      // Validate stage description
      if (stage.description) {
        const descriptionValidation = validateDescription(stage.description);
        if (!descriptionValidation.isValid) {
          stageError.description = descriptionValidation.message;
        }
      }
      
      // Validate stage color
      if (stage.color) {
        const colorValidation = validateColor(stage.color);
        if (!colorValidation.isValid) {
          stageError.color = colorValidation.message;
        }
      }
      
      if (Object.keys(stageError).length > 0) {
        stageErrors[index] = stageError;
      }
    });
    
    if (stageErrors.length > 0) {
      errors.stages = stageErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Comprehensive validation for stage creation
export const validateStageData = (data) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateStageName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  
  // Validate description
  if (data.description) {
    const descriptionValidation = validateDescription(data.description);
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.message;
    }
  }
  
  // Validate color
  if (data.color) {
    const colorValidation = validateColor(data.color);
    if (!colorValidation.isValid) {
      errors.color = colorValidation.message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize project data
export const sanitizeProjectData = (data) => {
  return {
    ...data,
    name: data.name?.trim(),
    description: data.description?.trim(),
    industry: data.industry?.trim(),
    tags: data.tags?.map(tag => tag.trim()),
    timezone: data.timezone?.trim()
  };
};

export default {
  validateProjectName,
  validatePipelineName,
  validateStageName,
  validateDescription,
  validateVisibility,
  validateMemberRole,
  validateObjectId,
  validateColor,
  validateLogoUrl,
  validateTimezone,
  validateTags,
  validateProjectData,
  validatePipelineData,
  validateStageData,
  sanitizeProjectData
};