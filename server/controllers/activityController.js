import mongoose from 'mongoose';
import Activity from '../models/Activity.model.js';
import Project from '../models/Project.model.js';
import Company from '../models/Company.model.js';
import Contact from '../models/Contact.model.js';
import { asyncHandler, ValidationError, AuthorizationError, NotFoundError } from '../middleware/errorHandler.js';
import { validateObjectId } from '../utils/validation.js';
import { validateActivityData } from '../utils/activityValidation.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Query activities for a project with filters
// @route   GET /api/activities/project/:projectId
// @access  Private (project members)
export const getProjectActivities = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const validation = validateObjectId(projectId);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError('Project not found');
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new AuthorizationError('You do not have permission to view activities in this project');
  }

  const {
    companyId,
    contactId,
    entityType,
    entityId,
    types,
    actorId,
    visibility,
    search,
    from,
    to,
    tags,
    limit,
    skip,
    sortBy,
    sortOrder
  } = req.query;

  const filters = {
    projectId,
    companyId: companyId && validateObjectId(companyId).isValid ? companyId : undefined,
    contactId: contactId && validateObjectId(contactId).isValid ? contactId : undefined,
    entityType,
    entityId: entityId && validateObjectId(entityId).isValid ? entityId : undefined,
    types: types ? types.split(',') : undefined,
    actorId: actorId && validateObjectId(actorId).isValid ? actorId : undefined,
    visibility,
    search,
    fromDate: from,
    toDate: to,
    tags: tags ? tags.split(',') : undefined
  };

  const result = await Activity.queryActivities(filters, { limit, skip, sortBy, sortOrder });
  res.json({ success: true, data: result });
});

// @desc    Create (log) an activity manually
// @route   POST /api/activities
// @access  Private (project members)
export const createActivity = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const data = {
    projectId: payload.projectId,
    companyId: payload.companyId,
    contactId: payload.contactId,
    entityType: payload.entityType,
    entityId: payload.entityId,
    type: payload.type,
    actorId: req.user._id,
    title: payload.title,
    description: payload.description,
    visibility: payload.visibility,
    priority: payload.priority,
    source: payload.source || 'manual',
    tags: payload.tags || [],
    attachments: payload.attachments || [],
    related: payload.related || [],
    metadata: payload.metadata || {},
    mentions: payload.mentions || []
  };

  // Validate input
  const validation = validateActivityData(data);
  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }

  // Check project and permissions
  const project = await Project.findById(data.projectId);
  if (!project) throw new NotFoundError('Project not found');
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new AuthorizationError('You do not have permission to create activities in this project');
  }

  // Optional existence checks for linked entities
  if (data.companyId) {
    const exists = await Company.exists({ _id: data.companyId });
    if (!exists) throw new NotFoundError('Company not found');
  }
  if (data.contactId) {
    const exists = await Contact.exists({ _id: data.contactId });
    if (!exists) throw new NotFoundError('Contact not found');
  }

  const activity = await logActivity({ ...data, request: req });
  res.status(201).json({ success: true, message: 'Activity logged', data: { activity } });
});

// @desc    Get a single activity by ID
// @route   GET /api/activities/:id
// @access  Private (project members)
export const getActivityById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const activity = await Activity.findById(id)
    .populate('actor', 'name email profileImage')
    .populate('mentions', 'name email profileImage');
  if (!activity) throw new NotFoundError('Activity not found');

  // Permission: user must be project member
  const project = await Project.findById(activity.project);
  if (!project) throw new NotFoundError('Project not found');
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new AuthorizationError('You do not have permission to view this activity');
  }

  res.json({ success: true, data: { activity } });
});

// @desc    Pin/unpin an activity
// @route   PUT /api/activities/:id/pin
// @access  Private (project manager+)
export const togglePinActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const activity = await Activity.findById(id);
  if (!activity) throw new NotFoundError('Activity not found');

  const project = await Project.findById(activity.project);
  if (!project) throw new NotFoundError('Project not found');
  if (!project.hasPermission(req.user._id, 'manager') && req.user.roleGlobal !== 'system-admin') {
    throw new AuthorizationError('You do not have permission to pin activities');
  }

  activity.isPinned = !activity.isPinned;
  await activity.save();

  res.json({ success: true, message: activity.isPinned ? 'Activity pinned' : 'Activity unpinned', data: { activity } });
});

// @desc    React to an activity
// @route   POST /api/activities/:id/reactions
// @access  Private (project members)
export const addReaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type = 'like' } = req.body;

  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const activity = await Activity.findById(id);
  if (!activity) throw new NotFoundError('Activity not found');

  const project = await Project.findById(activity.project);
  if (!project) throw new NotFoundError('Project not found');
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new AuthorizationError('You do not have permission to react to activities');
  }

  const exists = activity.reactions?.some(r => r.user.toString() === req.user._id.toString() && r.type === type);
  if (!exists) {
    activity.reactions.push({ user: req.user._id, type });
    await activity.save();
  }

  res.status(201).json({ success: true, message: 'Reaction added', data: { activity } });
});

// @desc    Remove reaction from an activity
// @route   DELETE /api/activities/:id/reactions
// @access  Private (project members)
export const removeReaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type = 'like' } = req.body;

  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const activity = await Activity.findById(id);
  if (!activity) throw new NotFoundError('Activity not found');

  const project = await Project.findById(activity.project);
  if (!project) throw new NotFoundError('Project not found');
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new AuthorizationError('You do not have permission to react to activities');
  }

  activity.reactions = activity.reactions.filter(r => !(r.user.toString() === req.user._id.toString() && r.type === type));
  await activity.save();

  res.json({ success: true, message: 'Reaction removed', data: { activity } });
});

export default {
  getProjectActivities,
  createActivity,
  getActivityById,
  togglePinActivity,
  addReaction,
  removeReaction
};


