import Notification from '../models/Notification.model.js';
import Project from '../models/Project.model.js';
import User from '../models/User.model.js';
import { emitNotification, emitProjectNotification } from './socketService.js';
import mongoose from 'mongoose';

// Generic function to create and emit a notification
export const createAndEmitNotification = async (options) => {
  const {
    recipient,
    project,
    pipeline,
    stage,
    deal,
    task,
    company,
    contact,
    sender,
    type,
    title,
    message,
    link,
    priority = 'medium',
    metadata = {}
  } = options;

  try {
    // Create notification
    const notification = await Notification.create({
      recipient,
      project,
      pipeline,
      stage,
      deal,
      task,
      company,
      contact,
      sender,
      type,
      title,
      message,
      link,
      priority,
      metadata
    });

    // Emit notification via socket
    emitNotification(recipient, notification);

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

// Create multiple notifications for a list of recipients
export const createBulkNotifications = async (recipientIds, notificationData) => {
  if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
    return [];
  }

  try {
    // Create notification documents
    const notificationDocs = recipientIds.map(recipientId => ({
      recipient: recipientId,
      ...notificationData
    }));

    // Insert many notifications
    const notifications = await Notification.insertMany(notificationDocs);

    // Emit notifications to each recipient
    notifications.forEach(notification => {
      emitNotification(notification.recipient, notification);
    });

    return notifications;
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    throw error;
  }
};

// Create notifications for all members of a project
export const createProjectNotification = async (projectId, notificationData, excludeUserIds = []) => {
  try {
    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get all member IDs except excluded ones
    const memberIds = project.members
      .filter(member => 
        member.user && 
        !excludeUserIds.includes(member.user.toString())
      )
      .map(member => member.user);

    // Add project owner if not excluded
    if (project.owner && !excludeUserIds.includes(project.owner.toString())) {
      memberIds.push(project.owner);
    }

    // Remove duplicates
    const uniqueMemberIds = [...new Set(memberIds.map(id => id.toString()))];

    // Create notifications for all members
    const notifications = await createBulkNotifications(
      uniqueMemberIds,
      {
        ...notificationData,
        project: projectId
      }
    );

    // Also emit to project room
    if (notifications.length > 0) {
      emitProjectNotification(projectId, notifications[0]);
    }

    return notifications;
  } catch (error) {
    console.error('Failed to create project notification:', error);
    throw error;
  }
};

// Create notification for invitation
export const createInvitationNotification = async (invitation) => {
  try {
    // Check if invitation has a user
    if (!invitation.invitee.user) {
      return null;
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      throw new Error('Project not found');
    }

    const inviter = await User.findById(invitation.inviter);
    if (!inviter) {
      throw new Error('Inviter not found');
    }

    // Create notification
    const notification = await createAndEmitNotification({
      recipient: invitation.invitee.user,
      project: invitation.project,
      sender: invitation.inviter,
      type: 'project_invitation',
      title: `Invitation to join ${project.name}`,
      message: `${inviter.name} has invited you to join ${project.name} as ${invitation.role}`,
      link: `/invitations/${invitation.token}`,
      priority: 'high',
      metadata: {
        invitationId: invitation._id,
        role: invitation.role
      }
    });

    return notification;
  } catch (error) {
    console.error('Failed to create invitation notification:', error);
    throw error;
  }
};

// Create notification for role change
export const createRoleChangeNotification = async (userId, projectId, newRole, changedById) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const changer = await User.findById(changedById);
    if (!changer) {
      throw new Error('User who changed role not found');
    }

    // Create notification
    const notification = await createAndEmitNotification({
      recipient: userId,
      project: projectId,
      sender: changedById,
      type: 'project_role_change',
      title: `Role updated in ${project.name}`,
      message: `${changer.name} has updated your role to ${newRole} in ${project.name}`,
      link: `/projects/${projectId}`,
      priority: 'medium',
      metadata: {
        newRole,
        projectName: project.name
      }
    });

    return notification;
  } catch (error) {
    console.error('Failed to create role change notification:', error);
    throw error;
  }
};

// Create notification for member removal
export const createMemberRemovalNotification = async (userId, projectId, removedById) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const remover = await User.findById(removedById);
    if (!remover) {
      throw new Error('User who removed member not found');
    }

    // Create notification
    const notification = await createAndEmitNotification({
      recipient: userId,
      project: projectId,
      sender: removedById,
      type: 'project_member_removed',
      title: `Removed from ${project.name}`,
      message: `${remover.name} has removed you from ${project.name}`,
      link: `/projects/${projectId}`,
      priority: 'medium',
      metadata: {
        projectName: project.name
      }
    });

    return notification;
  } catch (error) {
    console.error('Failed to create member removal notification:', error);
    throw error;
  }
};

// Create notification for pipeline events
export const createPipelineNotification = async (eventType, pipeline, projectId, actorId, excludeUserIds = []) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let title, message, priority;

    switch (eventType) {
      case 'pipeline_created':
        title = `New Pipeline in ${project.name}`;
        message = `${actor.name} created a new pipeline: ${pipeline.name}`;
        priority = 'medium';
        break;
      case 'pipeline_updated':
        title = `Pipeline Updated in ${project.name}`;
        message = `${actor.name} updated the pipeline: ${pipeline.name}`;
        priority = 'low';
        break;
      case 'pipeline_deleted':
        title = `Pipeline Deleted in ${project.name}`;
        message = `${actor.name} deleted the pipeline: ${pipeline.name}`;
        priority = 'medium';
        break;
      default:
        title = `Pipeline Activity in ${project.name}`;
        message = `${actor.name} performed an action on pipeline: ${pipeline.name}`;
        priority = 'low';
    }

    // Create notifications for all project members except excluded ones
    const notifications = await createProjectNotification(
      projectId,
      {
        sender: actorId,
        pipeline: pipeline._id,
        type: eventType,
        title,
        message,
        link: `/projects/${projectId}/pipelines/${pipeline._id}`,
        priority,
        metadata: {
          pipelineName: pipeline.name,
          projectName: project.name
        }
      },
      excludeUserIds
    );

    return notifications;
  } catch (error) {
    console.error(`Failed to create ${eventType} notification:`, error);
    throw error;
  }
};

// Create notification for stage events
export const createStageNotification = async (eventType, stage, pipelineId, projectId, actorId, excludeUserIds = []) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let title, message, priority;

    switch (eventType) {
      case 'stage_created':
        title = `New Stage in ${project.name}`;
        message = `${actor.name} created a new stage: ${stage.name}`;
        priority = 'low';
        break;
      case 'stage_updated':
        title = `Stage Updated in ${project.name}`;
        message = `${actor.name} updated the stage: ${stage.name}`;
        priority = 'low';
        break;
      case 'stage_deleted':
        title = `Stage Deleted in ${project.name}`;
        message = `${actor.name} deleted the stage: ${stage.name}`;
        priority = 'low';
        break;
      case 'stages_reordered':
        title = `Stages Reordered in ${project.name}`;
        message = `${actor.name} reordered the stages in a pipeline`;
        priority = 'low';
        break;
      default:
        title = `Stage Activity in ${project.name}`;
        message = `${actor.name} performed an action on a stage`;
        priority = 'low';
    }

    // Create notifications for all project members except excluded ones
    const notifications = await createProjectNotification(
      projectId,
      {
        sender: actorId,
        pipeline: pipelineId,
        stage: stage._id,
        type: eventType,
        title,
        message,
        link: `/projects/${projectId}/pipelines/${pipelineId}`,
        priority,
        metadata: {
          stageName: stage.name,
          projectName: project.name
        }
      },
      excludeUserIds
    );

    return notifications;
  } catch (error) {
    console.error(`Failed to create ${eventType} notification:`, error);
    throw error;
  }
};

// Create notification for deal events
export const createDealNotification = async (eventType, deal, projectId, actorId, additionalData = {}) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let title, message, priority, excludeUserIds = [actorId];

    switch (eventType) {
      case 'deal_created':
        title = `New Deal in ${project.name}`;
        message = `${actor.name} created a new deal: ${deal.name}`;
        priority = 'medium';
        break;
      case 'deal_updated':
        title = `Deal Updated in ${project.name}`;
        message = `${actor.name} updated the deal: ${deal.name}`;
        priority = 'low';
        break;
      case 'deal_deleted':
        title = `Deal Deleted in ${project.name}`;
        message = `${actor.name} deleted the deal: ${deal.name}`;
        priority = 'medium';
        break;
      case 'deal_stage_changed':
        const { fromStage, toStage } = additionalData;
        title = `Deal Moved in ${project.name}`;
        message = `${actor.name} moved deal "${deal.name}" from ${fromStage} to ${toStage}`;
        priority = 'medium';
        break;
      case 'deal_assigned':
        const { assignee } = additionalData;
        title = `Deal Assigned in ${project.name}`;
        message = `${actor.name} assigned deal "${deal.name}" to ${assignee}`;
        priority = 'high';
        // Don't exclude assignee from notification
        excludeUserIds = assignee === actorId ? [actorId] : [];
        break;
      case 'deal_won':
        title = `Deal Won in ${project.name}`;
        message = `${actor.name} marked deal "${deal.name}" as won`;
        priority = 'high';
        break;
      case 'deal_lost':
        title = `Deal Lost in ${project.name}`;
        message = `${actor.name} marked deal "${deal.name}" as lost`;
        priority = 'medium';
        break;
      default:
        title = `Deal Activity in ${project.name}`;
        message = `${actor.name} performed an action on deal: ${deal.name}`;
        priority = 'low';
    }

    // Create notifications for all project members except excluded ones
    const notifications = await createProjectNotification(
      projectId,
      {
        sender: actorId,
        deal: deal._id,
        type: eventType,
        title,
        message,
        link: `/projects/${projectId}/deals/${deal._id}`,
        priority,
        metadata: {
          dealName: deal.name,
          projectName: project.name,
          ...additionalData
        }
      },
      excludeUserIds
    );

    return notifications;
  } catch (error) {
    console.error(`Failed to create ${eventType} notification:`, error);
    throw error;
  }
};

// Create notification for task events
export const createTaskNotification = async (eventType, task, projectId, actorId, additionalData = {}) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let title, message, priority, recipientId, excludeUserIds = [actorId];

    switch (eventType) {
      case 'task_created':
        title = `New Task in ${project.name}`;
        message = `${actor.name} created a new task: ${task.title}`;
        priority = 'medium';
        
        // If task is assigned to someone, send them a specific notification
        if (task.assignedTo && task.assignedTo.toString() !== actorId.toString()) {
          recipientId = task.assignedTo;
          // Create a specific notification for the assignee
          await createAndEmitNotification({
            recipient: recipientId,
            project: projectId,
            task: task._id,
            sender: actorId,
            type: 'task_assigned',
            title: `Task Assigned to You in ${project.name}`,
            message: `${actor.name} assigned you a task: ${task.title}`,
            link: `/projects/${projectId}/tasks/${task._id}`,
            priority: 'high',
            metadata: {
              taskTitle: task.title,
              projectName: project.name,
              dueDate: task.dueDate
            }
          });
          
          // Add assignee to exclude list for the general notification
          excludeUserIds.push(recipientId);
        }
        break;
      case 'task_updated':
        title = `Task Updated in ${project.name}`;
        message = `${actor.name} updated the task: ${task.title}`;
        priority = 'low';
        break;
      case 'task_deleted':
        title = `Task Deleted in ${project.name}`;
        message = `${actor.name} deleted the task: ${task.title}`;
        priority = 'medium';
        break;
      case 'task_completed':
        title = `Task Completed in ${project.name}`;
        message = `${actor.name} completed the task: ${task.title}`;
        priority = 'medium';
        break;
      case 'task_assigned':
        const { assignee } = additionalData;
        title = `Task Assigned in ${project.name}`;
        message = `${actor.name} assigned task "${task.title}" to ${assignee}`;
        priority = 'high';
        
        // Send direct notification to assignee
        if (task.assignedTo && task.assignedTo.toString() !== actorId.toString()) {
          recipientId = task.assignedTo;
          await createAndEmitNotification({
            recipient: recipientId,
            project: projectId,
            task: task._id,
            sender: actorId,
            type: 'task_assigned',
            title: `Task Assigned to You in ${project.name}`,
            message: `${actor.name} assigned you a task: ${task.title}`,
            link: `/projects/${projectId}/tasks/${task._id}`,
            priority: 'high',
            metadata: {
              taskTitle: task.title,
              projectName: project.name,
              dueDate: task.dueDate
            }
          });
          
          // Add assignee to exclude list for the general notification
          excludeUserIds.push(recipientId);
        }
        break;
      case 'task_due_soon':
        title = `Task Due Soon in ${project.name}`;
        message = `Task "${task.title}" is due soon`;
        priority = 'medium';
        
        // Send direct notification to assignee only
        if (task.assignedTo) {
          recipientId = task.assignedTo;
          await createAndEmitNotification({
            recipient: recipientId,
            project: projectId,
            task: task._id,
            type: 'task_due_soon',
            title,
            message,
            link: `/projects/${projectId}/tasks/${task._id}`,
            priority,
            metadata: {
              taskTitle: task.title,
              projectName: project.name,
              dueDate: task.dueDate
            }
          });
          
          // Don't send general notification for due soon
          return [];
        }
        break;
      default:
        title = `Task Activity in ${project.name}`;
        message = `${actor.name} performed an action on task: ${task.title}`;
        priority = 'low';
    }

    // Create notifications for all project members except excluded ones
    const notifications = await createProjectNotification(
      projectId,
      {
        sender: actorId,
        task: task._id,
        type: eventType,
        title,
        message,
        link: `/projects/${projectId}/tasks/${task._id}`,
        priority,
        metadata: {
          taskTitle: task.title,
          projectName: project.name,
          ...additionalData
        }
      },
      excludeUserIds
    );

    return notifications;
  } catch (error) {
    console.error(`Failed to create ${eventType} notification:`, error);
    throw error;
  }
};

// Create notification for comment events
export const createCommentNotification = async (
  eventType, 
  comment, 
  entityType, 
  entityId, 
  projectId, 
  actorId, 
  mentionedUserIds = []
) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get entity details
    const entityInfo = await getEntityInfo(entityType, entityId);
    if (!entityInfo) {
      throw new Error(`${entityType} not found`);
    }

    let title, message, priority, link;
    const excludeUserIds = [actorId];

    switch (eventType) {
      case 'comment_added':
        title = `New Comment in ${project.name}`;
        message = `${actor.name} commented on ${entityType}: ${entityInfo.name}`;
        priority = 'medium';
        link = `/projects/${projectId}/${entityType}s/${entityId}`;
        break;
      case 'comment_updated':
        title = `Comment Updated in ${project.name}`;
        message = `${actor.name} updated a comment on ${entityType}: ${entityInfo.name}`;
        priority = 'low';
        link = `/projects/${projectId}/${entityType}s/${entityId}`;
        break;
      case 'comment_deleted':
        title = `Comment Deleted in ${project.name}`;
        message = `${actor.name} deleted a comment on ${entityType}: ${entityInfo.name}`;
        priority = 'low';
        link = `/projects/${projectId}/${entityType}s/${entityId}`;
        break;
      default:
        title = `Comment Activity in ${project.name}`;
        message = `${actor.name} performed an action on a comment`;
        priority = 'low';
        link = `/projects/${projectId}/${entityType}s/${entityId}`;
    }

    // Create notifications for all project members except excluded ones
    const notifications = await createProjectNotification(
      projectId,
      {
        sender: actorId,
        [entityType]: entityId,
        type: eventType,
        title,
        message,
        link,
        priority,
        metadata: {
          entityType,
          entityName: entityInfo.name,
          projectName: project.name,
          commentId: comment._id,
          commentContent: comment.content.substring(0, 100)
        }
      },
      excludeUserIds
    );

    // Create special notifications for mentioned users
    if (mentionedUserIds.length > 0) {
      for (const userId of mentionedUserIds) {
        // Skip if user is the actor
        if (userId.toString() === actorId.toString()) continue;
        
        await createAndEmitNotification({
          recipient: userId,
          project: projectId,
          [entityType]: entityId,
          sender: actorId,
          type: 'user_mentioned',
          title: `You were mentioned in ${project.name}`,
          message: `${actor.name} mentioned you in a comment on ${entityType}: ${entityInfo.name}`,
          link,
          priority: 'high',
          metadata: {
            entityType,
            entityName: entityInfo.name,
            projectName: project.name,
            commentId: comment._id,
            commentContent: comment.content.substring(0, 100)
          }
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error(`Failed to create ${eventType} notification:`, error);
    throw error;
  }
};

// Create system alert notification for a specific user
export const createSystemAlertNotification = async (recipientId, title, message, link, priority = 'high') => {
  try {
    const notification = await createAndEmitNotification({
      recipient: recipientId,
      type: 'system_alert',
      title,
      message,
      link,
      priority
    });

    return notification;
  } catch (error) {
    console.error('Failed to create system alert notification:', error);
    throw error;
  }
};

// Create notification for company events
export const createCompanyNotification = async (eventType, company, projectId, actorId, excludeUserIds = []) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let title, message, priority;

    switch (eventType) {
      case 'company_created':
        title = `New Company in ${project.name}`;
        message = `${actor.name} added a new company: ${company.name}`;
        priority = 'medium';
        break;
      case 'company_updated':
        title = `Company Updated in ${project.name}`;
        message = `${actor.name} updated the company: ${company.name}`;
        priority = 'low';
        break;
      case 'company_deleted':
        title = `Company Deleted in ${project.name}`;
        message = `${actor.name} deleted the company: ${company.name}`;
        priority = 'medium';
        break;
      case 'company_note_added':
        title = `Note Added to Company in ${project.name}`;
        message = `${actor.name} added a note to company: ${company.name}`;
        priority = 'low';
        break;
      default:
        title = `Company Activity in ${project.name}`;
        message = `${actor.name} performed an action on company: ${company.name}`;
        priority = 'low';
    }

    // Create notifications for all project members except excluded ones
    const notifications = await createProjectNotification(
      projectId,
      {
        sender: actorId,
        company: company._id,
        type: eventType,
        title,
        message,
        link: `/crm/${projectId}/companies/${company._id}`,
        priority,
        metadata: {
          companyName: company.name,
          projectName: project.name
        }
      },
      excludeUserIds
    );

    return notifications;
  } catch (error) {
    console.error(`Failed to create ${eventType} notification:`, error);
    throw error;
  }
};

// Create notification for contact events
export const createContactNotification = async (eventType, contact, projectId, actorId, excludeUserIds = []) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let title, message, priority;

    switch (eventType) {
      case 'contact_created':
        title = `New Contact in ${project.name}`;
        message = `${actor.name} added a new contact: ${contact.firstName} ${contact.lastName}`;
        priority = 'medium';
        break;
      case 'contact_updated':
        title = `Contact Updated in ${project.name}`;
        message = `${actor.name} updated the contact: ${contact.firstName} ${contact.lastName}`;
        priority = 'low';
        break;
      case 'contact_deleted':
        title = `Contact Deleted in ${project.name}`;
        message = `${actor.name} deleted the contact: ${contact.firstName} ${contact.lastName}`;
        priority = 'medium';
        break;
      case 'contact_note_added':
        title = `Note Added to Contact in ${project.name}`;
        message = `${actor.name} added a note to contact: ${contact.firstName} ${contact.lastName}`;
        priority = 'low';
        break;
      default:
        title = `Contact Activity in ${project.name}`;
        message = `${actor.name} performed an action on contact: ${contact.firstName} ${contact.lastName}`;
        priority = 'low';
    }

    // Create notifications for all project members except excluded ones
    const notifications = await createProjectNotification(
      projectId,
      {
        sender: actorId,
        contact: contact._id,
        type: eventType,
        title,
        message,
        link: `/crm/${projectId}/contacts/${contact._id}`,
        priority,
        metadata: {
          contactName: `${contact.firstName} ${contact.lastName}`,
          projectName: project.name
        }
      },
      excludeUserIds
    );

    return notifications;
  } catch (error) {
    console.error(`Failed to create ${eventType} notification:`, error);
    throw error;
  }
};

// Helper function to get entity info
const getEntityInfo = async (entityType, entityId) => {
  try {
    let entity;
    
    switch (entityType) {
      case 'deal':
        const Deal = mongoose.model('Deal');
        entity = await Deal.findById(entityId).select('name');
        break;
      case 'task':
        const Task = mongoose.model('Task');
        entity = await Task.findById(entityId).select('title');
        if (entity) entity.name = entity.title;
        break;
      case 'company':
        const Company = mongoose.model('Company');
        entity = await Company.findById(entityId).select('name');
        break;
      case 'contact':
        const Contact = mongoose.model('Contact');
        entity = await Contact.findById(entityId).select('firstName lastName');
        if (entity) entity.name = `${entity.firstName} ${entity.lastName}`;
        break;
      case 'pipeline':
        const Pipeline = mongoose.model('Pipeline');
        entity = await Pipeline.findById(entityId).select('name');
        break;
      case 'stage':
        const Stage = mongoose.model('Stage');
        entity = await Stage.findById(entityId).select('name');
        break;
      default:
        return null;
    }
    
    return entity;
  } catch (error) {
    console.error(`Failed to get ${entityType} info:`, error);
    return null;
  }
};

export default {
  createAndEmitNotification,
  createBulkNotifications,
  createProjectNotification,
  createInvitationNotification,
  createRoleChangeNotification,
  createMemberRemovalNotification,
  createPipelineNotification,
  createStageNotification,
  createDealNotification,
  createTaskNotification,
  createCommentNotification,
  createSystemAlertNotification,
  createCompanyNotification,
  createContactNotification
};