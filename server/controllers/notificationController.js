import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import { validateObjectId } from '../utils/validation.js';
import { emitNotification } from '../utils/socketService.js';

// @desc    Get user notifications with pagination and filters
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res) => {
  const { 
    limit = 20, 
    skip = 0, 
    isRead, 
    type, 
    project,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  const options = {
    limit: parseInt(limit),
    skip: parseInt(skip)
  };

  // Build filter for notifications - only show notifications for projects user has access to
  const filter = { recipient: req.user._id };

  // Apply optional filters
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
    options.isRead = isRead === 'true';
  }
  
  if (type) {
    filter.type = type;
    options.type = type;
  }
  
  if (project) {
    // Validate project ID
    const projectValidation = validateObjectId(project);
    if (!projectValidation.isValid) {
      throw new ValidationError(projectValidation.message);
    }
    
    // Check if user has access to this project
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      throw new NotFoundError('Project not found');
    }
    
    if (!projectDoc.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
      throw new ForbiddenError('You do not have permission to view notifications for this project');
    }
    
    filter.project = project;
    options.project = project;
  } else {
    // If no project filter, only show notifications for projects user has access to
    const userProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.inviteStatus': 'accepted' }
      ]
    }).select('_id');
    
    const projectIds = userProjects.map(p => p._id);
    filter.project = { $in: projectIds };
  }

  // Get notifications
  const notifications = await Notification.find(filter)
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip(options.skip)
    .limit(options.limit)
    .populate('sender', 'name email profileImage')
    .populate('project', 'name')
    .populate('company', 'name industry')
    .exec();
  
  // Get total count for pagination
  const totalCount = await Notification.countDocuments(filter);

  // Get unread count (only for accessible projects)
  const unreadCount = await Notification.countDocuments({
    ...filter,
    isRead: false
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        total: totalCount,
        unreadCount,
        limit: options.limit,
        skip: options.skip,
        hasMore: options.skip + options.limit < totalCount
      }
    }
  });
});

// @desc    Get user notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate notification ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find notification
  const notification = await Notification.findById(id)
    .populate('sender', 'name email profileImage')
    .populate('project', 'name');

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You do not have permission to view this notification');
  }

  res.json({
    success: true,
    data: { notification }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate notification ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find notification
  const notification = await Notification.findById(id);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You do not have permission to update this notification');
  }

  // Mark as read
  notification.isRead = true;
  await notification.save();

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const { type, project } = req.body;
  
  const options = {};
  
  // Apply optional filters
  if (type) {
    options.type = type;
  }
  
  if (project) {
    // Validate project ID
    const projectValidation = validateObjectId(project);
    if (!projectValidation.isValid) {
      throw new ValidationError(projectValidation.message);
    }
    options.project = project;
  }

  // Mark all as read
  const result = await Notification.markAllAsRead(req.user._id, options);

  res.json({
    success: true,
    message: 'Notifications marked as read',
    data: { 
      modifiedCount: result.modifiedCount 
    }
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate notification ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find notification
  const notification = await Notification.findById(id);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You do not have permission to delete this notification');
  }

  // Delete notification
  await notification.deleteOne();

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Delete all notifications (with optional filters)
// @route   DELETE /api/notifications
// @access  Private
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const { type, project, isRead } = req.body;
  
  const filter = { recipient: req.user._id };
  
  // Apply optional filters
  if (type) {
    filter.type = type;
  }
  
  if (project) {
    // Validate project ID
    const projectValidation = validateObjectId(project);
    if (!projectValidation.isValid) {
      throw new ValidationError(projectValidation.message);
    }
    filter.project = project;
  }

  if (isRead !== undefined) {
    filter.isRead = isRead === true;
  }

  // Delete notifications
  const result = await Notification.deleteMany(filter);

  res.json({
    success: true,
    message: 'Notifications deleted successfully',
    data: { 
      deletedCount: result.deletedCount 
    }
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  // Only count notifications for projects user has access to
  const userProjects = await Project.find({
    $or: [
      { owner: req.user._id },
      { 'members.user': req.user._id, 'members.inviteStatus': 'accepted' }
    ]
  }).select('_id');
  
  const projectIds = userProjects.map(p => p._id);
  
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
    project: { $in: projectIds }
  });

  res.json({
    success: true,
    data: { count }
  });
});

// @desc    Create notification (admin/system only)
// @route   POST /api/notifications
// @access  Private (Admin only)
export const createNotification = asyncHandler(async (req, res) => {
  // Only system admins can create notifications directly
  if (req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('Only system administrators can create notifications directly');
  }

  const { 
    recipientId, 
    projectId, 
    message,
    title,
    type, 
    link, 
    priority,
    metadata,
    expiresAt
  } = req.body;

  // Validate required fields
  if (!recipientId || !message || !title || !type || !link) {
    throw new ValidationError('Recipient ID, message, title, type, and link are required');
  }

  // Validate recipient ID
  const recipientValidation = validateObjectId(recipientId);
  if (!recipientValidation.isValid) {
    throw new ValidationError('Invalid recipient ID');
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new NotFoundError('Recipient not found');
  }

  // Validate project ID if provided
  if (projectId) {
    const projectValidation = validateObjectId(projectId);
    if (!projectValidation.isValid) {
      throw new ValidationError('Invalid project ID');
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
  }

  // Create notification
  const notification = await Notification.create({
    recipient: recipientId,
    project: projectId || null,
    sender: req.user._id,
    message,
    title,
    type,
    link,
    priority: priority || 'medium',
    metadata: metadata || {},
    expiresAt: expiresAt || null
  });

  // Emit notification via socket if available
  emitNotification(recipientId, notification);

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: { notification }
  });
});

export default {
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createNotification
};