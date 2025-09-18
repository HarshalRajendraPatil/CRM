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
    company,
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
      company,
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
// deals module removed
/* export const createDealNotification = async (eventType, deal, projectId, actorId, additionalData = {}) => {
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
}; */


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

// Create notification for customer events
export const createCustomerNotification = async (eventType, customer, projectId, actorId, excludeUserIds = []) => {
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
      case 'customer_created':
        title = `New Customer in ${project.name}`;
        message = `${actor.name} added a new customer: ${customer.fullName}`;
        priority = 'medium';
        break;
      case 'customer_updated':
        title = `Customer Updated in ${project.name}`;
        message = `${actor.name} updated the customer: ${customer.fullName}`;
        priority = 'low';
        break;
      case 'customer_archived':
        title = `Customer Archived in ${project.name}`;
        message = `${actor.name} archived the customer: ${customer.fullName}`;
        priority = 'medium';
        break;
      case 'customer_assigned':
        title = `Customer Assigned in ${project.name}`;
        message = `${actor.name} assigned customer: ${customer.fullName}`;
        priority = 'high';
        break;
      case 'customer_note_added':
        title = `Note Added to Customer in ${project.name}`;
        message = `${actor.name} added a note to customer: ${customer.fullName}`;
        priority = 'low';
        break;
      case 'customer_interaction_added':
        title = `Interaction Added to Customer in ${project.name}`;
        message = `${actor.name} added an interaction with customer: ${customer.fullName}`;
        priority = 'low';
        break;
      case 'lead_converted':
        title = `Lead Converted to Customer in ${project.name}`;
        message = `${actor.name} converted lead to customer: ${customer.fullName}`;
        priority = 'high';
        break;
      default:
        title = `Customer Activity in ${project.name}`;
        message = `${actor.name} performed an action on customer: ${customer.fullName}`;
        priority = 'low';
    }

    // Create notifications for all project members except excluded ones
    const notifications = await createProjectNotification(
      projectId,
      {
        sender: actorId,
        customer: customer._id,
        type: eventType,
        title,
        message,
        link: `/projects/${projectId}/customers/${customer._id}`,
        priority,
        metadata: {
          customerName: customer.fullName,
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



// Helper function to get entity info
/**
 * Create deal-related notifications
 */
export const createDealNotification = async (eventType, deal, projectId, actorId, excludeUserIds = []) => {
  try {
    // Get project members
    const project = await Project.findById(projectId).populate('members.user', 'name email');
    if (!project) {
      throw new Error('Project not found');
    }

    // Get actor info
    const actor = await User.findById(actorId).select('name email');
    if (!actor) {
      throw new Error('Actor not found');
    }

    // Get deal info
    const Deal = mongoose.model('Deal');
    const dealInfo = await Deal.findById(deal._id || deal).populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'customer', select: 'name email' },
      { path: 'company', select: 'name' }
    ]);

    if (!dealInfo) {
      throw new Error('Deal not found');
    }

    // Prepare notification data based on event type
    let notificationData = {
      project: projectId,
      sender: actorId,
      priority: 'medium',
      metadata: {
        dealId: dealInfo._id,
        dealName: dealInfo.name,
        dealValue: dealInfo.value,
        dealStage: dealInfo.stage,
        dealStatus: dealInfo.status
      }
    };

    // Set notification content based on event type
    switch (eventType) {
      case 'deal_created':
        notificationData = {
          ...notificationData,
          type: 'deal_created',
          title: 'New Deal Created',
          message: `${actor.name} created a new deal: "${dealInfo.name}" ($${dealInfo.value.toLocaleString()})`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'medium'
        };
        break;

      case 'deal_updated':
        notificationData = {
          ...notificationData,
          type: 'deal_updated',
          title: 'Deal Updated',
          message: `${actor.name} updated deal: "${dealInfo.name}"`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'low'
        };
        break;

      case 'deal_moved':
        notificationData = {
          ...notificationData,
          type: 'deal_moved',
          title: 'Deal Moved to New Stage',
          message: `${actor.name} moved deal "${dealInfo.name}" to stage: ${dealInfo.stage}`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'medium'
        };
        break;

      case 'deal_status_changed':
        notificationData = {
          ...notificationData,
          type: 'deal_status_changed',
          title: 'Deal Status Changed',
          message: `${actor.name} changed deal "${dealInfo.name}" status to: ${dealInfo.status}`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'high'
        };
        break;

      case 'deal_assigned':
        notificationData = {
          ...notificationData,
          type: 'deal_assigned',
          title: 'Deal Assigned',
          message: `${actor.name} assigned deal "${dealInfo.name}" to ${dealInfo.assignedTo?.name || 'you'}`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'medium'
        };
        break;

      case 'deal_deleted':
        notificationData = {
          ...notificationData,
          type: 'deal_deleted',
          title: 'Deal Archived',
          message: `${actor.name} archived deal: "${dealInfo.name}"`,
          link: `/crm/${projectId}/deals`,
          priority: 'medium'
        };
        break;

      case 'deal_restored':
        notificationData = {
          ...notificationData,
          type: 'deal_restored',
          title: 'Deal Restored',
          message: `${actor.name} restored deal: "${dealInfo.name}"`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'medium'
        };
        break;

      case 'deal_won':
        notificationData = {
          ...notificationData,
          type: 'deal_won',
          title: 'Deal Won! 🎉',
          message: `Congratulations! Deal "${dealInfo.name}" has been won ($${dealInfo.value.toLocaleString()})`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'high'
        };
        break;

      case 'deal_lost':
        notificationData = {
          ...notificationData,
          type: 'deal_lost',
          title: 'Deal Lost',
          message: `Deal "${dealInfo.name}" has been marked as lost`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'medium'
        };
        break;

      case 'deal_overdue':
        notificationData = {
          ...notificationData,
          type: 'deal_overdue',
          title: 'Deal Overdue',
          message: `Deal "${dealInfo.name}" has passed its expected close date`,
          link: `/crm/${projectId}/deals/${dealInfo._id}`,
          priority: 'high'
        };
        break;

      default:
        throw new Error(`Unknown deal event type: ${eventType}`);
    }

    // Create notifications for all project members except excluded users and the actor
    const recipients = project.members
      .map(member => member.user._id.toString())
      .filter(userId => 
        userId !== actorId.toString() && 
        !excludeUserIds.includes(userId)
      );

    // Create notifications
    const notifications = [];
    for (const recipientId of recipients) {
      const notification = await createAndEmitNotification({
        ...notificationData,
        recipient: recipientId
      });
      notifications.push(notification);
    }

    // If deal is assigned to someone specific, ensure they get notified
    if (dealInfo.assignedTo && 
        dealInfo.assignedTo._id.toString() !== actorId.toString() &&
        !excludeUserIds.includes(dealInfo.assignedTo._id.toString())) {
      
      const assignedUserNotification = await createAndEmitNotification({
        ...notificationData,
        recipient: dealInfo.assignedTo._id,
        priority: 'high' // Higher priority for assigned user
      });
      notifications.push(assignedUserNotification);
    }

    return notifications;
  } catch (error) {
    console.error('Failed to create deal notification:', error);
    throw error;
  }
};

/**
 * Create deal activity notifications
 */
export const createDealActivityNotification = async (dealId, activityType, actorId, metadata = {}) => {
  try {
    const Deal = mongoose.model('Deal');
    const deal = await Deal.findById(dealId).populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'projectId', select: 'name' }
    ]);

    if (!deal) {
      throw new Error('Deal not found');
    }

    const actor = await User.findById(actorId).select('name email');
    if (!actor) {
      throw new Error('Actor not found');
    }

    let notificationData = {
      recipient: deal.assignedTo?._id,
      project: deal.projectId,
      sender: actorId,
      type: 'deal_activity',
      priority: 'low',
      metadata: {
        dealId: deal._id,
        dealName: deal.name,
        activityType,
        ...metadata
      }
    };

    switch (activityType) {
      case 'note_added':
        notificationData = {
          ...notificationData,
          title: 'New Note Added',
          message: `${actor.name} added a note to deal "${deal.name}"`,
          link: `/crm/${deal.projectId}/deals/${deal._id}`
        };
        break;


      case 'value_updated':
        notificationData = {
          ...notificationData,
          title: 'Deal Value Updated',
          message: `${actor.name} updated the value of deal "${deal.name}" to $${metadata.newValue?.toLocaleString()}`,
          link: `/crm/${deal.projectId}/deals/${deal._id}`,
          priority: 'medium'
        };
        break;

      default:
        notificationData = {
          ...notificationData,
          title: 'Deal Activity',
          message: `${actor.name} performed an action on deal "${deal.name}"`,
          link: `/crm/${deal.projectId}/deals/${deal._id}`
        };
    }

    // Only notify if there's an assigned user and it's not the actor
    if (deal.assignedTo && deal.assignedTo._id.toString() !== actorId.toString()) {
      return await createAndEmitNotification(notificationData);
    }

    return null;
  } catch (error) {
    console.error('Failed to create deal activity notification:', error);
    throw error;
  }
};

// Create notification for task events
export const createTaskNotification = async (eventType, task, projectId, actorId, excludeUserIds = []) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let title, message, priority, recipientId;

    switch (eventType) {
      case 'task_created':
        title = `New Task in ${project.name}`;
        message = `${actor.name} created a new task: ${task.title}`;
        priority = 'medium';
        recipientId = task.assignedTo;
        break;
      case 'task_assigned':
        title = `Task Assigned in ${project.name}`;
        message = `${actor.name} assigned you a task: ${task.title}`;
        priority = 'high';
        recipientId = task.assignedTo;
        break;
      case 'task_reassigned':
        title = `Task Reassigned in ${project.name}`;
        message = `${actor.name} reassigned task "${task.title}" to you`;
        priority = 'high';
        recipientId = task.assignedTo;
        break;
      case 'task_completed':
        title = `Task Completed in ${project.name}`;
        message = `${actor.name} completed the task: ${task.title}`;
        priority = 'medium';
        // Notify task creator and project members
        recipientId = task.createdBy;
        break;
      case 'task_reopened':
        title = `Task Reopened in ${project.name}`;
        message = `${actor.name} reopened the task: ${task.title}`;
        priority = 'medium';
        recipientId = task.assignedTo;
        break;
      case 'task_updated':
        title = `Task Updated in ${project.name}`;
        message = `${actor.name} updated the task: ${task.title}`;
        priority = 'low';
        recipientId = task.assignedTo;
        break;
      case 'task_due_soon':
        title = `Task Due Soon in ${project.name}`;
        message = `Task "${task.title}" is due soon`;
        priority = 'high';
        recipientId = task.assignedTo;
        break;
      case 'task_overdue':
        title = `Task Overdue in ${project.name}`;
        message = `Task "${task.title}" is overdue`;
        priority = 'urgent';
        recipientId = task.assignedTo;
        break;
      case 'task_mentioned':
        title = `Mentioned in Task in ${project.name}`;
        message = `${actor.name} mentioned you in a task comment`;
        priority = 'medium';
        // This will be handled separately for multiple mentions
        break;
      case 'task_deleted':
        title = `Task Deleted in ${project.name}`;
        message = `${actor.name} deleted the task: ${task.title}`;
        priority = 'medium';
        // Notify project members
        break;
      case 'task_archived':
        title = `Task Archived in ${project.name}`;
        message = `${actor.name} archived the task: ${task.title}`;
        priority = 'medium';
        recipientId = task.assignedTo;
        break;
      case 'task_restored':
        title = `Task Restored in ${project.name}`;
        message = `${actor.name} restored the task: ${task.title}`;
        priority = 'medium';
        recipientId = task.assignedTo;
        break;
      case 'subtask_added':
        title = `Subtask Added in ${project.name}`;
        message = `${actor.name} added a subtask to: ${task.title}`;
        priority = 'low';
        recipientId = task.assignedTo;
        break;
      case 'subtask_completed':
        title = `Subtask Completed in ${project.name}`;
        message = `${actor.name} completed a subtask in: ${task.title}`;
        priority = 'low';
        recipientId = task.assignedTo;
        break;
      default:
        throw new Error(`Unknown task event type: ${eventType}`);
    }

    // Create notification for specific recipient
    if (recipientId && !excludeUserIds.includes(recipientId.toString())) {
      await createAndEmitNotification({
        recipient: recipientId,
        project: projectId,
        sender: actorId,
        type: eventType,
        title,
        message,
        link: `/crm/${projectId}/tasks/${task._id}`,
        priority,
        metadata: {
          taskId: task._id,
          taskTitle: task.title,
          eventType
        }
      });
    }

    // For certain events, notify project members
    if (['task_completed', 'task_deleted'].includes(eventType)) {
      const projectMembers = await User.find({
        'projects.project': projectId,
        _id: { $nin: [actorId, ...excludeUserIds] }
      });

      for (const member of projectMembers) {
        await createAndEmitNotification({
          recipient: member._id,
          project: projectId,
          sender: actorId,
          type: eventType,
          title,
          message,
          link: `/crm/${projectId}/tasks/${task._id}`,
          priority,
          metadata: {
            taskId: task._id,
            taskTitle: task.title,
            eventType
          }
        });
      }
    }

  } catch (error) {
    console.error('Failed to create task notification:', error);
    throw error;
  }
};

// Create notification for task mentions
export const createTaskMentionNotification = async (task, projectId, actorId, mentionedUserIds) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) {
      throw new Error('Actor not found');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    for (const userId of mentionedUserIds) {
      await createAndEmitNotification({
        recipient: userId,
        project: projectId,
        sender: actorId,
        type: 'task_mentioned',
        title: `Mentioned in Task in ${project.name}`,
        message: `${actor.name} mentioned you in a comment on task: ${task.title}`,
        link: `/crm/${projectId}/tasks/${task._id}`,
        priority: 'medium',
        metadata: {
          taskId: task._id,
          taskTitle: task.title,
          eventType: 'task_mentioned'
        }
      });
    }

  } catch (error) {
    console.error('Failed to create task mention notification:', error);
    throw error;
  }
};

// Create notification for overdue tasks
export const createOverdueTaskNotification = async (task, projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    await createAndEmitNotification({
      recipient: task.assignedTo,
      project: projectId,
      type: 'task_overdue',
      title: `Task Overdue in ${project.name}`,
      message: `Task "${task.title}" is overdue`,
      link: `/crm/${projectId}/tasks/${task._id}`,
      priority: 'urgent',
      metadata: {
        taskId: task._id,
        taskTitle: task.title,
        eventType: 'task_overdue',
        dueDate: task.dueDate
      }
    });

  } catch (error) {
    console.error('Failed to create overdue task notification:', error);
    throw error;
  }
};

// Create notification for tasks due soon
export const createTaskDueSoonNotification = async (task, projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    await createAndEmitNotification({
      recipient: task.assignedTo,
      project: projectId,
      type: 'task_due_soon',
      title: `Task Due Soon in ${project.name}`,
      message: `Task "${task.title}" is due soon`,
      link: `/crm/${projectId}/tasks/${task._id}`,
      priority: 'high',
      metadata: {
        taskId: task._id,
        taskTitle: task.title,
        eventType: 'task_due_soon',
        dueDate: task.dueDate
      }
    });

  } catch (error) {
    console.error('Failed to create task due soon notification:', error);
    throw error;
  }
};

const getEntityInfo = async (entityType, entityId) => {
  try {
    let entity;
    
    switch (entityType) {
          case 'deal':
        const Deal = mongoose.model('Deal');
        entity = await Deal.findById(entityId).select('name value');
        break;
      case 'company':
        const Company = mongoose.model('Company');
        entity = await Company.findById(entityId).select('name');
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
  createDealActivityNotification,
  createCommentNotification,
  createSystemAlertNotification,
  createCompanyNotification,
  createCustomerNotification,
  createTaskDueSoonNotification,
  createTaskNotification,
  createTaskMentionNotification,
  createOverdueTaskNotification
};