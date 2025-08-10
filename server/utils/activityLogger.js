import Activity from '../models/Activity.model.js';
import { emitProjectNotification } from './socketService.js';

// Centralized activity logging utility
export const logActivity = async ({
  projectId,
  companyId = null,
  contactId = null,
  entityType,
  entityId,
  type,
  actorId,
  title = '',
  description = '',
  visibility = 'team',
  priority = 'medium',
  source = 'system',
  tags = [],
  attachments = [],
  related = [],
  metadata = {},
  mentions = [],
  request = null
}) => {
  const ipAddress = request?.ip || undefined;
  const userAgent = request?.headers?.['user-agent'] || undefined;

  const activity = await Activity.log({
    project: projectId,
    company: companyId || undefined,
    contact: contactId || undefined,
    entityType,
    entityId,
    type,
    actor: actorId,
    title,
    description,
    visibility,
    priority,
    source,
    tags,
    attachments,
    related,
    metadata,
    mentions,
    ipAddress,
    userAgent
  });

  // Optionally emit to project room for realtime feeds
  try {
    emitProjectNotification(projectId, {
      _id: activity._id,
      type: 'activity',
      title: activity.title || `${entityType} ${type}`,
      message: description,
      createdAt: activity.createdAt
    });
  } catch (e) {
    // do not fail on socket errors
  }

  return activity;
};

export default { logActivity };


