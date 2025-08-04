import Notification from '../models/Notification.model.js';
import { emitNotification, emitProjectNotification } from './socketService.js';

/**
 * Create a notification and emit it via socket
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} Created notification
 */
export const createAndEmitNotification = async (options) => {
  const {
    recipientId,
    projectId = null,
    senderId = null,
    message,
    title,
    type,
    link,
    priority = 'medium',
    metadata = {},
    expiresAt = null,
    emitSocket = true
  } = options;

  // Create notification
  const notification = await Notification.create({
    recipient: recipientId,
    project: projectId,
    sender: senderId,
    message,
    title,
    type,
    link,
    priority,
    metadata,
    expiresAt
  });

  // Populate sender and project for socket emission
  await notification.populate('sender', 'name email profileImage');
  if (projectId) {
    await notification.populate('project', 'name');
  }

  // Emit via socket if requested
  if (emitSocket) {
    emitNotification(recipientId, notification);
  }

  return notification;
};

/**
 * Create notifications for multiple recipients
 * @param {Array} recipientIds - Array of recipient user IDs
 * @param {Object} notificationData - Notification data excluding recipient
 * @returns {Promise<Array>} Created notifications
 */
export const createBulkNotifications = async (recipientIds, notificationData) => {
  const notifications = [];

  for (const recipientId of recipientIds) {
    const notification = await createAndEmitNotification({
      ...notificationData,
      recipientId
    });
    
    notifications.push(notification);
  }

  return notifications;
};

/**
 * Create a project-wide notification for all members
 * @param {String} projectId - Project ID
 * @param {Object} notificationData - Notification data excluding recipient and project
 * @param {Array} excludeUserIds - Array of user IDs to exclude
 * @returns {Promise<Array>} Created notifications
 */
export const createProjectNotification = async (projectId, notificationData, excludeUserIds = []) => {
  // Import here to avoid circular dependency
  const Project = (await import('../models/Project.model.js')).default;
  
  // Get project with members
  const project = await Project.findById(projectId).populate('members.user', '_id');
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Get all member IDs except excluded ones
  const memberIds = project.members
    .filter(member => member.user && !excludeUserIds.includes(member.user._id.toString()))
    .map(member => member.user._id);
  
  // Create notifications for all members
  const notifications = await createBulkNotifications(memberIds, {
    ...notificationData,
    projectId
  });
  
  // Emit to project room
  emitProjectNotification(projectId, {
    ...notificationData,
    projectId,
    createdAt: new Date()
  });
  
  return notifications;
};

/**
 * Create a notification for a project invitation
 * @param {Object} invitation - The invitation object
 * @returns {Promise<Object>} Created notification
 */
export const createInvitationNotification = async (invitation) => {
  const { invitee, project, inviter, token } = invitation;
  
  if (!invitee.user) {
    return null; // Can't create notification if user doesn't exist
  }
  
  return createAndEmitNotification({
    recipientId: invitee.user,
    projectId: project._id,
    senderId: inviter,
    title: 'Project Invitation',
    message: `You have been invited to join the project "${project.name}"`,
    type: 'project_invitation',
    link: `/invitations/${token}`,
    priority: 'high',
    metadata: {
      projectName: project.name,
      invitationId: invitation._id
    }
  });
};

/**
 * Create a notification for a role change
 * @param {String} userId - User ID
 * @param {String} projectId - Project ID
 * @param {String} newRole - New role
 * @param {String} changedById - User ID who changed the role
 * @returns {Promise<Object>} Created notification
 */
export const createRoleChangeNotification = async (userId, projectId, newRole, changedById) => {
  // Import here to avoid circular dependency
  const Project = (await import('../models/Project.model.js')).default;
  const User = (await import('../models/User.model.js')).default;
  
  const project = await Project.findById(projectId);
  const changedBy = await User.findById(changedById);
  
  if (!project || !changedBy) {
    return null;
  }
  
  return createAndEmitNotification({
    recipientId: userId,
    projectId,
    senderId: changedById,
    title: 'Role Updated',
    message: `Your role in project "${project.name}" has been updated to ${newRole}`,
    type: 'project_role_change',
    link: `/projects/${projectId}`,
    metadata: {
      projectName: project.name,
      newRole,
      changedBy: changedBy.name
    }
  });
};

/**
 * Create a notification for a pipeline event
 * @param {String} eventType - Event type (created, updated, deleted)
 * @param {Object} pipeline - Pipeline object
 * @param {String} projectId - Project ID
 * @param {String} actorId - User ID who performed the action
 * @param {Array} excludeUserIds - User IDs to exclude
 * @returns {Promise<Array>} Created notifications
 */
export const createPipelineNotification = async (eventType, pipeline, projectId, actorId, excludeUserIds = []) => {
  let title, message, type, link;
  
  switch (eventType) {
    case 'created':
      title = 'New Pipeline Created';
      message = `A new pipeline "${pipeline.name}" has been created`;
      type = 'pipeline_created';
      break;
    case 'updated':
      title = 'Pipeline Updated';
      message = `Pipeline "${pipeline.name}" has been updated`;
      type = 'pipeline_updated';
      break;
    case 'deleted':
      title = 'Pipeline Deleted';
      message = `Pipeline "${pipeline.name}" has been deleted`;
      type = 'pipeline_deleted';
      break;
    default:
      throw new Error('Invalid pipeline event type');
  }
  
  link = eventType === 'deleted' 
    ? `/projects/${projectId}` 
    : `/projects/${projectId}/pipelines/${pipeline._id}`;
  
  return createProjectNotification(
    projectId,
    {
      senderId: actorId,
      title,
      message,
      type,
      link,
      metadata: {
        pipelineId: pipeline._id,
        pipelineName: pipeline.name,
        action: eventType
      }
    },
    [...excludeUserIds, actorId] // Exclude actor and any other specified users
  );
};

/**
 * Create a notification for a stage event
 * @param {String} eventType - Event type (created, updated, deleted)
 * @param {Object} stage - Stage object
 * @param {String} pipelineId - Pipeline ID
 * @param {String} projectId - Project ID
 * @param {String} actorId - User ID who performed the action
 * @param {Array} excludeUserIds - User IDs to exclude
 * @returns {Promise<Array>} Created notifications
 */
export const createStageNotification = async (eventType, stage, pipelineId, projectId, actorId, excludeUserIds = []) => {
  let title, message, type;
  
  switch (eventType) {
    case 'created':
      title = 'New Stage Created';
      message = `A new stage "${stage.name}" has been created`;
      type = 'stage_created';
      break;
    case 'updated':
      title = 'Stage Updated';
      message = `Stage "${stage.name}" has been updated`;
      type = 'stage_updated';
      break;
    case 'deleted':
      title = 'Stage Deleted';
      message = `Stage "${stage.name}" has been deleted`;
      type = 'stage_deleted';
      break;
    default:
      throw new Error('Invalid stage event type');
  }
  
  const link = `/projects/${projectId}/pipelines/${pipelineId}`;
  
  return createProjectNotification(
    projectId,
    {
      senderId: actorId,
      title,
      message,
      type,
      link,
      metadata: {
        stageId: stage._id,
        stageName: stage.name,
        pipelineId,
        action: eventType
      }
    },
    [...excludeUserIds, actorId] // Exclude actor and any other specified users
  );
};

/**
 * Create a notification for a deal event
 * @param {String} eventType - Event type (created, updated, moved, assigned)
 * @param {Object} deal - Deal object
 * @param {String} projectId - Project ID
 * @param {String} actorId - User ID who performed the action
 * @param {Object} additionalData - Additional data for specific event types
 * @returns {Promise<Object|Array>} Created notification(s)
 */
export const createDealNotification = async (eventType, deal, projectId, actorId, additionalData = {}) => {
  let title, message, type, recipientId, link;
  
  link = `/projects/${projectId}/deals/${deal._id}`;
  
  switch (eventType) {
    case 'created':
      title = 'New Deal Created';
      message = `A new deal "${deal.name}" has been created`;
      type = 'deal_created';
      // Notify all project members
      return createProjectNotification(
        projectId,
        { senderId: actorId, title, message, type, link, metadata: { dealId: deal._id, dealName: deal.name } },
        [actorId]
      );
      
    case 'updated':
      title = 'Deal Updated';
      message = `Deal "${deal.name}" has been updated`;
      type = 'deal_updated';
      // If deal has an assignee, notify them
      if (deal.assignee && deal.assignee.toString() !== actorId.toString()) {
        recipientId = deal.assignee;
      } else {
        // Otherwise notify all project members
        return createProjectNotification(
          projectId,
          { senderId: actorId, title, message, type, link, metadata: { dealId: deal._id, dealName: deal.name } },
          [actorId]
        );
      }
      break;
      
    case 'moved':
      title = 'Deal Moved';
      message = `Deal "${deal.name}" has been moved to ${additionalData.stageName || 'a new stage'}`;
      type = 'deal_moved';
      // If deal has an assignee, notify them
      if (deal.assignee && deal.assignee.toString() !== actorId.toString()) {
        recipientId = deal.assignee;
      } else {
        // Otherwise notify all project members
        return createProjectNotification(
          projectId,
          { 
            senderId: actorId, 
            title, 
            message, 
            type, 
            link, 
            metadata: { 
              dealId: deal._id, 
              dealName: deal.name,
              fromStage: additionalData.fromStageName,
              toStage: additionalData.stageName
            } 
          },
          [actorId]
        );
      }
      break;
      
    case 'assigned':
      // This is a specific notification for the newly assigned user
      title = 'Deal Assigned to You';
      message = `You have been assigned to deal "${deal.name}"`;
      type = 'deal_assigned';
      recipientId = additionalData.assigneeId;
      break;
      
    default:
      throw new Error('Invalid deal event type');
  }
  
  // If we have a specific recipient, create a single notification
  if (recipientId) {
    return createAndEmitNotification({
      recipientId,
      projectId,
      senderId: actorId,
      title,
      message,
      type,
      link,
      metadata: {
        dealId: deal._id,
        dealName: deal.name,
        ...additionalData
      }
    });
  }
  
  return null;
};

/**
 * Create a notification for a task event
 * @param {String} eventType - Event type (created, updated, completed, assigned)
 * @param {Object} task - Task object
 * @param {String} projectId - Project ID
 * @param {String} actorId - User ID who performed the action
 * @param {Object} additionalData - Additional data for specific event types
 * @returns {Promise<Object|Array>} Created notification(s)
 */
export const createTaskNotification = async (eventType, task, projectId, actorId, additionalData = {}) => {
  let title, message, type, recipientId, link;
  
  link = `/projects/${projectId}/tasks/${task._id}`;
  
  switch (eventType) {
    case 'created':
      title = 'New Task Created';
      message = `A new task "${task.title}" has been created`;
      type = 'task_created';
      // If task has an assignee different from creator, notify them
      if (task.assignee && task.assignee.toString() !== actorId.toString()) {
        recipientId = task.assignee;
      } else {
        // Otherwise notify all project members
        return createProjectNotification(
          projectId,
          { senderId: actorId, title, message, type, link, metadata: { taskId: task._id, taskTitle: task.title } },
          [actorId]
        );
      }
      break;
      
    case 'updated':
      title = 'Task Updated';
      message = `Task "${task.title}" has been updated`;
      type = 'task_updated';
      // If task has an assignee different from updater, notify them
      if (task.assignee && task.assignee.toString() !== actorId.toString()) {
        recipientId = task.assignee;
      }
      break;
      
    case 'completed':
      title = 'Task Completed';
      message = `Task "${task.title}" has been marked as complete`;
      type = 'task_completed';
      // If task has an assignee different from completer, notify them
      if (task.assignee && task.assignee.toString() !== actorId.toString()) {
        recipientId = task.assignee;
      } else {
        // Otherwise notify all project members
        return createProjectNotification(
          projectId,
          { senderId: actorId, title, message, type, link, metadata: { taskId: task._id, taskTitle: task.title } },
          [actorId]
        );
      }
      break;
      
    case 'assigned':
      // This is a specific notification for the newly assigned user
      title = 'Task Assigned to You';
      message = `You have been assigned to task "${task.title}"`;
      type = 'task_assigned';
      recipientId = additionalData.assigneeId;
      break;
      
    default:
      throw new Error('Invalid task event type');
  }
  
  // If we have a specific recipient, create a single notification
  if (recipientId) {
    return createAndEmitNotification({
      recipientId,
      projectId,
      senderId: actorId,
      title,
      message,
      type,
      link,
      priority: type === 'task_assigned' ? 'high' : 'medium',
      metadata: {
        taskId: task._id,
        taskTitle: task.title,
        ...additionalData
      }
    });
  }
  
  return null;
};

/**
 * Create a notification for a comment or mention
 * @param {String} eventType - Event type (comment_added, mention)
 * @param {Object} comment - Comment object
 * @param {String} entityType - Entity type (deal, task, etc.)
 * @param {String} entityId - Entity ID
 * @param {String} projectId - Project ID
 * @param {String} actorId - User ID who performed the action
 * @param {Array} mentionedUserIds - Array of mentioned user IDs (for mention type)
 * @returns {Promise<Array>} Created notifications
 */
export const createCommentNotification = async (
  eventType, 
  comment, 
  entityType, 
  entityId, 
  projectId, 
  actorId, 
  mentionedUserIds = []
) => {
  let title, message, type, link;
  
  // Determine entity name and link
  const entityInfo = await getEntityInfo(entityType, entityId);
  if (!entityInfo) {
    return null;
  }
  
  link = `/projects/${projectId}/${entityType}s/${entityId}`;
  
  switch (eventType) {
    case 'comment_added':
      title = 'New Comment';
      message = `New comment on ${entityType} "${entityInfo.name}"`;
      type = 'comment_added';
      
      // Notify entity owner/assignee if different from commenter
      if (entityInfo.ownerId && entityInfo.ownerId.toString() !== actorId.toString()) {
        return createAndEmitNotification({
          recipientId: entityInfo.ownerId,
          projectId,
          senderId: actorId,
          title,
          message,
          type,
          link,
          metadata: {
            commentId: comment._id,
            entityType,
            entityId,
            entityName: entityInfo.name,
            commentPreview: comment.content.substring(0, 100)
          }
        });
      }
      break;
      
    case 'mention':
      title = 'You were mentioned';
      message = `You were mentioned in a comment on ${entityType} "${entityInfo.name}"`;
      type = 'mention';
      
      // Create notifications for all mentioned users
      const notifications = [];
      for (const userId of mentionedUserIds) {
        if (userId.toString() !== actorId.toString()) {
          const notification = await createAndEmitNotification({
            recipientId: userId,
            projectId,
            senderId: actorId,
            title,
            message,
            type,
            link,
            priority: 'high',
            metadata: {
              commentId: comment._id,
              entityType,
              entityId,
              entityName: entityInfo.name,
              commentPreview: comment.content.substring(0, 100)
            }
          });
          notifications.push(notification);
        }
      }
      return notifications;
      
    default:
      throw new Error('Invalid comment event type');
  }
  
  return null;
};

/**
 * Create a system alert notification
 * @param {String} recipientId - Recipient user ID
 * @param {String} title - Alert title
 * @param {String} message - Alert message
 * @param {String} link - Link to relevant page
 * @param {String} priority - Priority level
 * @returns {Promise<Object>} Created notification
 */
export const createSystemAlertNotification = async (recipientId, title, message, link, priority = 'high') => {
  return createAndEmitNotification({
    recipientId,
    title,
    message,
    type: 'system_alert',
    link,
    priority,
    metadata: {
      alertType: 'system'
    }
  });
};

/**
 * Helper function to get entity info by type and ID
 * @param {String} entityType - Entity type (deal, task, etc.)
 * @param {String} entityId - Entity ID
 * @returns {Promise<Object>} Entity info with name and owner/assignee ID
 */
const getEntityInfo = async (entityType, entityId) => {
  try {
    let entity, name, ownerId;
    
    switch (entityType) {
      case 'deal':
        // Import here to avoid circular dependency
        const Deal = (await import('../models/Deal.model.js')).default;
        entity = await Deal.findById(entityId);
        if (entity) {
          name = entity.name;
          ownerId = entity.assignee;
        }
        break;
        
      case 'task':
        // Import here to avoid circular dependency
        const Task = (await import('../models/Task.model.js')).default;
        entity = await Task.findById(entityId);
        if (entity) {
          name = entity.title;
          ownerId = entity.assignee;
        }
        break;
        
      // Add other entity types as needed
      
      default:
        return null;
    }
    
    return entity ? { name, ownerId } : null;
  } catch (error) {
    console.error('Error getting entity info:', error);
    return null;
  }
};

export default {
  createAndEmitNotification,
  createBulkNotifications,
  createProjectNotification,
  createInvitationNotification,
  createRoleChangeNotification,
  createPipelineNotification,
  createStageNotification,
  createDealNotification,
  createTaskNotification,
  createCommentNotification,
  createSystemAlertNotification
};