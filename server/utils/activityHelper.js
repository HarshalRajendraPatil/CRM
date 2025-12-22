import ActivityService from './activityService.js';

/**
 * Helper utility to automatically track all field changes for any entity
 * This should be called in controllers after updating an entity
 * 
 * @param {String} entityType - Type of entity (Company, Lead, Customer, Deal, Task, CalendarEvent)
 * @param {Object} entity - The updated entity document
 * @param {Object} oldData - The entity data before update (from database)
 * @param {Object} newData - The new entity data (from request body)
 * @param {Object} performedBy - User who performed the action
 * @returns {Promise<Array>} Array of created activity documents
 */
export const trackEntityChanges = async (entityType, entity, oldData, newData, performedBy) => {
  try {
    const changes = {};
    const activities = [];

    // Track each changed field
    for (const field in newData) {
      // Skip internal fields
      if (['updatedAt', 'updatedBy', '__v', '_id', 'createdAt', 'createdBy'].includes(field)) {
        continue;
      }

      const oldValue = oldData[field];
      const newValue = newData[field];

      // Skip if values are the same
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        continue;
      }

      // Handle special cases
      if (field === 'assignedTo') {
        if (newValue && !oldValue) {
          // Assignment
          const activityMethod = {
            'Company': ActivityService.logCompanyAssigned,
            'Lead': ActivityService.logLeadAssigned,
            'Customer': ActivityService.logCustomerAssigned,
            'Deal': ActivityService.logDealAssigned,
            'Task': ActivityService.logTaskAssigned
          }[entityType];

          if (activityMethod) {
            const activity = await activityMethod(entity, newValue, performedBy);
            if (activity) activities.push(activity);
          }
          continue;
        } else if (!newValue && oldValue) {
          // Unassignment
          const activityMethod = {
            'Company': ActivityService.logCompanyUnassigned,
            'Lead': ActivityService.logLeadUnassigned,
            'Customer': ActivityService.logCustomerUnassigned,
            'Deal': ActivityService.logDealUnassigned,
            'Task': ActivityService.logTaskUnassigned
          }[entityType];

          if (activityMethod) {
            const activity = await activityMethod(entity, performedBy);
            if (activity) activities.push(activity);
          }
          continue;
        } else if (newValue && oldValue && newValue.toString() !== oldValue.toString()) {
          // Reassignment
          if (entityType === 'Task') {
            const activity = await ActivityService.logTaskReassigned(entity, oldValue, newValue, performedBy);
            if (activity) activities.push(activity);
          } else {
            // Log unassign then assign
            const unassignMethod = {
              'Company': ActivityService.logCompanyUnassigned,
              'Lead': ActivityService.logLeadUnassigned,
              'Customer': ActivityService.logCustomerUnassigned,
              'Deal': ActivityService.logDealUnassigned
            }[entityType];

            const assignMethod = {
              'Company': ActivityService.logCompanyAssigned,
              'Lead': ActivityService.logLeadAssigned,
              'Customer': ActivityService.logCustomerAssigned,
              'Deal': ActivityService.logDealAssigned
            }[entityType];

            if (unassignMethod) {
              const unassignActivity = await unassignMethod(entity, performedBy);
              if (unassignActivity) activities.push(unassignActivity);
            }
            if (assignMethod) {
              const assignActivity = await assignMethod(entity, newValue, performedBy);
              if (assignActivity) activities.push(assignActivity);
            }
          }
          continue;
        }
      }

      // Track field change
      changes[field] = {
        oldValue: oldValue instanceof Date ? oldValue.toISOString() : oldValue,
        newValue: newValue instanceof Date ? newValue.toISOString() : newValue
      };
    }

    // Log generic update if there are changes
    if (Object.keys(changes).length > 0) {
      const updateMethod = {
        'Company': ActivityService.logCompanyUpdated,
        'Lead': ActivityService.logLeadUpdated,
        'Customer': ActivityService.logCustomerUpdated,
        'Deal': ActivityService.logDealUpdated,
        'Task': ActivityService.logTaskUpdated,
        'CalendarEvent': ActivityService.logEventUpdated
      }[entityType];

      if (updateMethod) {
        const activity = await updateMethod(entity, changes, performedBy);
        if (activity) activities.push(activity);
      }
    }

    return activities;
  } catch (error) {
    console.error(`Failed to track changes for ${entityType}:`, error);
    return [];
  }
};

/**
 * Helper to track tag changes
 */
export const trackTagChanges = async (entityType, entity, oldTags, newTags, performedBy) => {
  try {
    const activities = [];
    const addedTags = newTags.filter(tag => !oldTags.includes(tag));
    const removedTags = oldTags.filter(tag => !newTags.includes(tag));

    // Log tag additions
    for (const tag of addedTags) {
      const addMethod = {
        'Company': ActivityService.logCompanyTagAdded,
        'Customer': ActivityService.logCustomerTagAdded,
        'Deal': ActivityService.logDealTagsChanged
      }[entityType];

      if (addMethod && entityType !== 'Deal') {
        const activity = await addMethod(entity, tag, performedBy);
        if (activity) activities.push(activity);
      }
    }

    // Log tag removals
    for (const tag of removedTags) {
      const removeMethod = {
        'Company': ActivityService.logCompanyTagRemoved,
        'Customer': ActivityService.logCustomerTagRemoved
      }[entityType];

      if (removeMethod) {
        const activity = await removeMethod(entity, tag, performedBy);
        if (activity) activities.push(activity);
      }
    }

    // For Deal, log all tag changes together
    if (entityType === 'Deal' && (addedTags.length > 0 || removedTags.length > 0)) {
      const activity = await ActivityService.logDealTagsChanged(entity, oldTags, newTags, performedBy);
      if (activity) activities.push(activity);
    }

    return activities;
  } catch (error) {
    console.error(`Failed to track tag changes for ${entityType}:`, error);
    return [];
  }
};

/**
 * Helper to track custom field changes
 */
export const trackCustomFieldChanges = async (entityType, entity, oldCustomFields, newCustomFields, performedBy) => {
  try {
    const activities = [];
    const oldFields = oldCustomFields || {};
    const newFields = newCustomFields || {};

    // Find added fields
    for (const key in newFields) {
      if (!(key in oldFields)) {
        const addMethod = {
          'Company': ActivityService.logCompanyCustomFieldAdded,
          'Customer': ActivityService.logCustomerCustomFieldAdded,
          'Deal': ActivityService.logDealCustomFieldAdded,
          'Task': ActivityService.logTaskCustomFieldAdded
        }[entityType];

        if (addMethod) {
          const activity = await addMethod(entity, key, newFields[key], performedBy);
          if (activity) activities.push(activity);
        }
      } else if (JSON.stringify(oldFields[key]) !== JSON.stringify(newFields[key])) {
        // Field updated
        const updateMethod = {
          'Company': ActivityService.logCompanyCustomFieldUpdated,
          'Customer': ActivityService.logCustomerCustomFieldUpdated,
          'Deal': ActivityService.logDealCustomFieldUpdated,
          'Task': ActivityService.logTaskCustomFieldUpdated
        }[entityType];

        if (updateMethod) {
          const activity = await updateMethod(entity, key, oldFields[key], newFields[key], performedBy);
          if (activity) activities.push(activity);
        }
      }
    }

    // Find removed fields
    for (const key in oldFields) {
      if (!(key in newFields)) {
        const removeMethod = {
          'Company': ActivityService.logCompanyCustomFieldRemoved,
          'Customer': ActivityService.logCustomerCustomFieldRemoved,
          'Deal': ActivityService.logDealCustomFieldRemoved,
          'Task': ActivityService.logTaskCustomFieldDeleted
        }[entityType];

        if (removeMethod) {
          const activity = await removeMethod(entity, key, performedBy);
          if (activity) activities.push(activity);
        }
      }
    }

    return activities;
  } catch (error) {
    console.error(`Failed to track custom field changes for ${entityType}:`, error);
    return [];
  }
};

export default {
  trackEntityChanges,
  trackTagChanges,
  trackCustomFieldChanges
};

