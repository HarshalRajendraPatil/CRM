import Project from '../models/Project.model.js';
import User from '../models/User.model.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import { 
  validateProjectData, 
  validatePipelineData, 
  validateStageData,
  validateObjectId,
  validateMemberRole,
  sanitizeProjectData
} from '../utils/projectValidation.js';
import notificationService from '../utils/notificationService.js';
import ActivityService from '../utils/activityService.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, visibility, industry, tags, timezone, logo } = req.body;
  
  // Validate input data
  const validation = validateProjectData({ 
    name, 
    owner: req.user._id,
    description, 
    visibility, 
    industry, 
    tags, 
    timezone, 
    logo 
  });
  
  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }
  
  // Check if user has reached maximum allowed projects (if there's a limit)
  const userProjectCount = await Project.countDocuments({ owner: req.user._id });
  const maxProjects = process.env.MAX_PROJECTS_PER_USER || 10; // Default limit or from env
  
  if (userProjectCount >= maxProjects) {
    throw new ValidationError(`You have reached the maximum limit of ${maxProjects} projects`);
  }
  
  // Sanitize input data
  const sanitizedData = sanitizeProjectData({
    name,
    description,
    industry,
    tags,
    timezone
  });
  
  // Create new project
  const project = await Project.create({
    name: sanitizedData.name,
    owner: req.user._id,
    description: sanitizedData.description,
    visibility: visibility || 'private',
    industry: sanitizedData.industry,
    tags: sanitizedData.tags,
    timezone: sanitizedData.timezone || 'UTC',
    logo
  });
  
  // Update user's ownedProjects array
  await User.findByIdAndUpdate(req.user._id, {
    $push: { ownedProjects: project._id }
  });

  // Log activity
  try {
    await ActivityService.logProjectCreated(project, req.user);
  } catch (error) {
    console.error('Failed to log project creation activity:', error);
  }
  
  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: { project }
  });
});

// @desc    Get all projects for the current user
// @route   GET /api/projects
// @access  Private
export const getUserProjects = asyncHandler(async (req, res) => {
  // Get query parameters for filtering and pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter = {
    $or: [
      { owner: req.user._id },
      { 
        "members.user": req.user._id,
        "members.inviteStatus": "accepted"
      }
    ]
  };
  
  // Add search filter if provided
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  
  // Add active filter if provided
  if (req.query.active !== undefined) {
    filter.isActive = req.query.active === 'true';
  }
  
  // Execute query with pagination
  const projects = await Project.find(filter)
    .populate('owner', 'name email profileImage')
    .populate('members.user', 'name email profileImage')
    .populate('members.invitedBy', 'name email')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Project.countDocuments(filter);
  
  res.json({
    success: true,
    data: {
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private (only for project members)
export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find project by ID
  const project = await Project.findById(id)
    .populate('owner', 'name email profileImage')
    .populate('members.user', 'name email profileImage')
    .populate('members.invitedBy', 'name email');
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user is a member of this project
  if(project.owner._id.toString() !== req.user._id.toString()){
    if (!project.isMember(req.user._id) && req.user.roleGlobal !== 'system-admin') {
      throw new ForbiddenError('You do not have access to this project');
    }
  }
  
  res.json({
    success: true,
    data: { project }
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (only for project owner or admin)
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, visibility, industry, tags, timezone, logo, isActive } = req.body;
  
  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find project by ID
  const project = await Project.findById(id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to update the project
  if (
    project.owner.toString() !== req.user._id.toString() && 
    !project.hasPermission(req.user._id, 'admin') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to update this project');
  }
  
  // Validate input data
  const inputData = { 
    name: name || project.name, 
    owner: project.owner,
    description, 
    visibility, 
    industry, 
    tags, 
    timezone, 
    logo 
  };
  
  const dataValidation = validateProjectData(inputData);
  if (!dataValidation.isValid) {
    throw new ValidationError('Validation failed', dataValidation.errors);
  }
  
  // Sanitize input data
  const sanitizedData = sanitizeProjectData(inputData);
  
  // Store old data for activity tracking
  const oldData = project.toObject();
  const changes = {};
  
  // Update fields if provided
  if (name !== undefined && name !== project.name) {
    project.name = sanitizedData.name;
    changes.name = { oldValue: oldData.name, newValue: sanitizedData.name };
  }
  if (description !== undefined && description !== project.description) {
    project.description = sanitizedData.description;
    changes.description = { oldValue: oldData.description, newValue: sanitizedData.description };
  }
  if (visibility !== undefined && visibility !== project.visibility) {
    project.visibility = visibility;
    changes.visibility = { oldValue: oldData.visibility, newValue: visibility };
  }
  if (industry !== undefined && industry !== project.industry) {
    project.industry = sanitizedData.industry;
    changes.industry = { oldValue: oldData.industry, newValue: sanitizedData.industry };
  }
  if (tags !== undefined) {
    project.tags = sanitizedData.tags;
    changes.tags = { oldValue: oldData.tags, newValue: sanitizedData.tags };
  }
  if (timezone !== undefined && timezone !== project.timezone) {
    project.timezone = sanitizedData.timezone;
    changes.timezone = { oldValue: oldData.timezone, newValue: sanitizedData.timezone };
  }
  if (logo !== undefined && logo !== project.logo) {
    project.logo = logo;
    changes.logo = { oldValue: oldData.logo, newValue: logo };
  }
  
  // Only owner or system-admin can change active status
  if (
    isActive !== undefined && 
    (project.owner.toString() === req.user._id.toString() || req.user.roleGlobal === 'system-admin')
  ) {
    if (isActive !== project.isActive) {
    project.isActive = isActive;
      changes.isActive = { oldValue: oldData.isActive, newValue: isActive };
    }
  }
  
  // Save updated project
  await project.save();

  // Log activity if there were changes
  if (Object.keys(changes).length > 0) {
    try {
      await ActivityService.logProjectUpdated(project, changes, req.user);
    } catch (error) {
      console.error('Failed to log project update activity:', error);
    }
  }
  
  res.json({
    success: true,
    message: 'Project updated successfully',
    data: { project }
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (only for project owner or system-admin)
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find project by ID
  const project = await Project.findById(id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to delete the project
  if (
    project.owner.toString() !== req.user._id.toString() && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to delete this project');
  }
  
  // Remove project from owner's ownedProjects array
  await User.findByIdAndUpdate(project.owner, {
    $pull: { ownedProjects: project._id }
  });
  
  // Remove project from all members' projectMembers array
  for (const member of project.members) {
    await User.findByIdAndUpdate(member.user, {
      $pull: { 'projectMembers': { project: project._id } }
    });
  }
  
  // Delete the project
  await Project.findByIdAndDelete(id);
  
  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// @desc    Update project member role
// @route   PUT /api/projects/:id/members/:userId
// @access  Private (only for project owner or admin)
export const updateProjectMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  const { role } = req.body;
  
  // Validate ObjectIds
  const projectValidation = validateObjectId(id);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  const userValidation = validateObjectId(userId);
  if (!userValidation.isValid) {
    throw new ValidationError(userValidation.message);
  }
  
  // Validate role
  if (!role) {
    throw new ValidationError('Role is required');
  }
  
  const roleValidation = validateMemberRole(role);
  if (!roleValidation.isValid) {
    throw new ValidationError(roleValidation.message);
  }
  
  // Find project by ID
  const project = await Project.findById(id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to update members
  if (
    project.owner.toString() !== req.user._id.toString() && 
    !project.hasPermission(req.user._id, 'admin') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to update members in this project');
  }
  
  // Find member in project
  const memberIndex = project.members.findIndex(
    member => member.user.toString() == userId && member.inviteStatus === 'accepted'
  );
  
  if (memberIndex === -1) {
    throw new NotFoundError('Member not found in this project');
  }
  
  // Store old role for activity tracking
  const oldRole = project.members[memberIndex].role;
  const member = project.members[memberIndex];
  
  // Update member role
  project.members[memberIndex].role = role;
  await project.save();
  
  // Update user's projectMembers array
  await User.findByIdAndUpdate(
    userId,
    {
      $set: { 'projectMembers.$[elem].role': role }
    },
    {
      arrayFilters: [{ 'elem.project': project._id }]
    }
  );

  // Log activity
  try {
    await ActivityService.logProjectMemberRoleChanged(project, member, oldRole, role, req.user);
  } catch (error) {
    console.error('Failed to log project member role change activity:', error);
  }
  
  // Create notification for role change
  try {
    await notificationService.createRoleChangeNotification(
      userId,
      project._id,
      role,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create role change notification:', error);
    // Continue with the response even if notification creation fails
  }
  
  res.json({
    success: true,
    message: 'Member role updated successfully',
    data: {
      project: await Project.findById(id)
        .populate('owner', 'name email profileImage')
        .populate('members.user', 'name email profileImage')
        .populate('members.invitedBy', 'name email')
    }
  });
});

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (only for project owner or admin, or self-removal)
export const removeProjectMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  
  // Validate ObjectIds
  const projectValidation = validateObjectId(id);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  const userValidation = validateObjectId(userId);
  if (!userValidation.isValid) {
    throw new ValidationError(userValidation.message);
  }
  
  // Find project by ID
  const project = await Project.findById(id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Allow self-removal or if user has admin permissions
  const isSelfRemoval = userId === req.user._id.toString();
  const hasPermission = 
    project.owner.toString() === req.user._id.toString() || 
    project.hasPermission(req.user._id, 'admin') ||
    req.user.roleGlobal === 'system-admin';
  
  if (!isSelfRemoval && !hasPermission) {
    throw new ForbiddenError('You do not have permission to remove members from this project');
  }

  // Find member in project
  const memberIndex = project.members.findIndex(
    member => member.user.toString() === userId
  );
  
  if (memberIndex === -1) {
    throw new NotFoundError('Member not found in this project');
  }
  
  // Store member data for activity tracking
  const member = project.members[memberIndex];
  
  // Remove member from project
  project.members.splice(memberIndex, 1);
  await project.save();

  // Log activity
  try {
    await ActivityService.logProjectMemberRemoved(project, member, req.user);
  } catch (error) {
    console.error('Failed to log project member removal activity:', error);
  }
  
  // Remove project from user's projectMembers array
  await User.findByIdAndUpdate(userId, {
    $pull: { projectMembers: { project: project._id } }
  });

  // Create notification for member removal// Create notification for role change
  try {
    await notificationService.createMemberRemovalNotification(
      userId,
      project._id,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create member removal notification:', error);
    // Continue with the response even if notification creation fails
  }
  
  res.json({
    success: true,
    message: 'Member removed successfully',
    data: {
      project: await Project.findById(id)
        .populate('owner', 'name email profileImage')
        .populate('members.user', 'name email profileImage')
        .populate('members.invitedBy', 'name email')
    }
  });
});

// @desc    Transfer project ownership
// @route   PUT /api/projects/:id/transfer-ownership
// @access  Private (only for project owner)
export const transferProjectOwnership = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    throw new ValidationError('User ID is required');
  }
  
  // Validate ObjectIds
  const projectValidation = validateObjectId(id);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  const userValidation = validateObjectId(userId);
  if (!userValidation.isValid) {
    throw new ValidationError(userValidation.message);
  }
  
  // Find project by ID
  const project = await Project.findById(id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user is the owner
  if (
    project.owner.toString() !== req.user._id.toString() && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('Only the project owner can transfer ownership');
  }
  
  // Check if target user exists
  const newOwner = await User.findById(userId);
  if (!newOwner) {
    throw new NotFoundError('User not found');
  }
  
  // Check if target user is a member with accepted status
  const isMember = project.members.some(
    member => 
      member.user._id.toString() === userId && 
      member.inviteStatus === 'accepted'
  );
  
  if (!isMember && userId !== req.user._id.toString()) {
    throw new ValidationError('User must be an active member of the project');
  }
  
  // Get current owner
  const currentOwner = project.owner;
  const oldOwnerId = project.owner.toString();
  
  // Update project owner
  project.owner = userId;
  
  // Log activity for ownership transfer
  try {
    const changes = {
      owner: {
        oldValue: oldOwnerId,
        newValue: userId.toString()
      }
    };
    await ActivityService.logProjectUpdated(project, changes, req.user);
  } catch (error) {
    console.error('Failed to log project ownership transfer activity:', error);
  }
  
  // If new owner was a member, remove from members array
  const memberIndex = project.members.findIndex(
    member => member.user._id.toString() === userId
  );
  
  if (memberIndex !== -1) {
    project.members.splice(memberIndex, 1);
  }
  
  // Add previous owner as admin member if not self-transfer
  if (currentOwner.toString() !== userId) {
    project.members.push({
      user: currentOwner,
      role: 'admin',
      inviteStatus: 'accepted',
      invitedBy: userId,
      invitedAt: new Date(),
      joinedAt: new Date()
    });
  }
  
  await project.save();
  
  // Update user records
  // Remove from new owner's projectMembers and add to ownedProjects
  await User.findByIdAndUpdate(userId, {
    $pull: { projectMembers: { project: project._id } },
    $addToSet: { ownedProjects: project._id }
  });
  
  // Remove from previous owner's ownedProjects and add to projectMembers if not self-transfer
  if (currentOwner.toString() !== userId) {
    await User.findByIdAndUpdate(currentOwner, {
      $pull: { ownedProjects: project._id },
      $addToSet: { 
        projectMembers: {
          project: project._id,
          role: 'admin',
          joinedAt: new Date()
        }
      }
    });
  }
  
  res.json({
    success: true,
    message: 'Project ownership transferred successfully',
    data: {
      project: await Project.findById(id)
        .populate('owner', 'name email profileImage')
        .populate('members.user', 'name email profileImage')
    }
  });
});

export default {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectMember,
  removeProjectMember,
  transferProjectOwnership
};