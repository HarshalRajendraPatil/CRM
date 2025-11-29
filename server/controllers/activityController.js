import Activity from '../models/Activity.model.js';
import Project from '../models/Project.model.js';
import Company from '../models/Company.model.js';
import Lead from '../models/Lead.model.js';
import Customer from '../models/Customer.model.js';
import Deal from '../models/Deal.model.js';
import { asyncHandler, ValidationError, NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';
import { validateObjectId } from '../utils/validation.js';
import Task from '../models/Task.model.js';

// @desc    Get activities for a specific entity (Company, Lead, Customer, or Deal)
// @route   GET /api/activities/entity/:entityType/:entityId
// @access  Private (project members)
export const getEntityActivities = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  console.log(entityType, entityId);
  const {
    limit = 50,
    skip = 0,
    category,
    activityType,
    performedBy,
    startDate,
    endDate,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Validate entity type
  if (!['Company', 'Lead', 'Customer', 'Deal', 'Task'].includes(entityType)) {
    throw new ValidationError('Invalid entity type. Must be Company, Lead, Customer, Deal, or Task');
  }

  // Validate entity ID
  const entityValidation = validateObjectId(entityId);
  if (!entityValidation.isValid) {
    throw new ValidationError(entityValidation.message);
  }

  // Get the entity to check project permissions
  let entity;
  if (entityType === 'Company') {
    entity = await Company.findById(entityId).populate('project');
  } else if (entityType === 'Lead') {
    entity = await Lead.findById(entityId).populate('project');
  } else if (entityType === 'Customer') {
    entity = await Customer.findById(entityId).populate('project');
  } else if (entityType === 'Deal') {
    entity = await Deal.findById(entityId).populate('projectId');
    if (entity) {
      entity.project = entity.projectId;
    }
  } else if (entityType === 'Task') {
    entity = await Task.findById(entityId).populate('project');
  }

  if (!entity) {
    throw new NotFoundError(`${entityType} not found`);
  }

  // Check if user has permission to view activities for this entity
  const project = entity.project;
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view activities for this entity');
  }

  // Get activities
  const activities = await Activity.getEntityActivities(entityType, entityId, {
    limit,
    skip,
    category,
    activityType,
    performedBy,
    startDate,
    endDate,
    sort,
    order
  });

  // Get total count for pagination
  const totalCount = await Activity.countDocuments({
    entityType,
    entityId
  });

  res.json({
    success: true,
    data: {
      activities,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + activities.length < totalCount
      }
    }
  });
});

// @desc    Get activities for a project
// @route   GET /api/activities/project/:projectId
// @access  Private (project members)
export const getProjectActivities = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    limit = 100,
    skip = 0,
    entityType,
    category,
    activityType,
    performedBy,
    startDate,
    endDate,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Validate project ID
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission to view project activities
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view project activities');
  }

  // Get activities
  const activities = await Activity.getProjectActivities(projectId, {
    limit,
    skip,
    entityType,
    category,
    activityType,
    performedBy,
    startDate,
    endDate,
    sort,
    order
  });

  // Get total count for pagination
  const totalCount = await Activity.countDocuments({ project: projectId });

  res.json({
    success: true,
    data: {
      activities,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + activities.length < totalCount
      }
    }
  });
});

// @desc    Get activity statistics for a project
// @route   GET /api/activities/project/:projectId/stats
// @access  Private (project members)
export const getActivityStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    startDate,
    endDate,
    entityType,
    category
  } = req.query;

  // Validate project ID
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission to view activity stats
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view activity statistics');
  }

  // Get activity statistics
  const stats = await Activity.getActivityStats(projectId, {
    startDate,
    endDate,
    entityType,
    category
  });

  // Get recent activities
  const recentActivities = await Activity.find({ project: projectId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('performedBy', 'name email profileImage')
    .populate('relatedEntity.id', 'name email')
    .lean();

  // Get activity trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activityTrends = await Activity.aggregate([
    { 
      $match: { 
        project: projectId,
        createdAt: { $gte: thirtyDaysAgo }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Get most active users
  const mostActiveUsers = await Activity.aggregate([
    { $match: { project: projectId } },
    { $group: { _id: '$performedBy', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $project: { _id: 1, count: 1, 'user.name': 1, 'user.email': 1, 'user.profileImage': 1 } }
  ]);

  // Get activity by category
  const activityByCategory = await Activity.aggregate([
    { $match: { project: projectId } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get activity by entity type
  const activityByEntityType = await Activity.aggregate([
    { $match: { project: projectId } },
    { $group: { _id: '$entityType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      stats,
      recentActivities,
      activityTrends,
      mostActiveUsers,
      activityByCategory,
      activityByEntityType
    }
  });
});

// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Private (project members)
export const getActivityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate activity ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find activity
  const activity = await Activity.findById(id)
    .populate('performedBy', 'name email profileImage')
    .populate('relatedEntity.id', 'name email')
    .populate('project', 'name description');

  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  // Check if user has permission to view this activity
  const project = await Project.findById(activity.project);
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view this activity');
  }

  res.json({
    success: true,
    data: { activity }
  });
});

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private (project admin or system admin)
export const deleteActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate activity ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find activity
  const activity = await Activity.findById(id).populate('project');
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  // Check if user has permission to delete this activity
  const project = activity.project;
  if (
    !project.hasPermission(req.user._id, 'admin') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to delete this activity');
  }

  // Delete activity
  await activity.deleteOne();

  res.json({
    success: true,
    message: 'Activity deleted successfully'
  });
});

// @desc    Bulk delete activities
// @route   DELETE /api/activities/bulk-delete
// @access  Private (project admin or system admin)
export const bulkDeleteActivities = asyncHandler(async (req, res) => {
  const { activityIds, projectId } = req.body;

  if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
    throw new ValidationError('Activity IDs array is required');
  }

  if (!projectId) {
    throw new ValidationError('Project ID is required');
  }

  // Validate project ID
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission to delete activities
  if (
    !project.hasPermission(req.user._id, 'admin') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to delete activities');
  }

  // Validate activity IDs
  for (const id of activityIds) {
    const validation = validateObjectId(id);
    if (!validation.isValid) {
      throw new ValidationError(`Invalid activity ID: ${id}`);
    }
  }

  // Delete activities
  const result = await Activity.deleteMany({
    _id: { $in: activityIds },
    project: projectId
  });

  res.json({
    success: true,
    message: `${result.deletedCount} activities deleted successfully`,
    data: { deletedCount: result.deletedCount }
  });
});

export default {
  getEntityActivities,
  getProjectActivities,
  getActivityStats,
  getActivityById,
  deleteActivity,
  bulkDeleteActivities
};
