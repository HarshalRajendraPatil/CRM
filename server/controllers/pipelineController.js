import Project from '../models/Project.model.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import {
  validatePipelineData,
  validateStageData,
  validateObjectId,
  validateColor
} from '../utils/projectValidation.js';
import notificationService from '../utils/notificationService.js';

// @desc    Create a new pipeline in a project
// @route   POST /api/projects/:projectId/pipelines
// @access  Private (project owner, admin, or manager)
export const createPipeline = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description, stages } = req.body;

  // Validate ObjectId
  const validation = validateObjectId(projectId);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Validate pipeline data
  const pipelineValidation = validatePipelineData({ name, description, stages });
  if (!pipelineValidation.isValid) {
    throw new ValidationError('Validation failed', pipelineValidation.errors);
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission
  if (
    !project.hasPermission(req.user._id, 'manager') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to create pipelines in this project');
  }

  // Create new pipeline
  const newPipeline = {
    name,
    description,
    isDefault: false, // Never set a new pipeline as default automatically
    stages: []
  };

  // Add stages if provided
  if (stages && Array.isArray(stages)) {
    stages.forEach((stage, index) => {
      newPipeline.stages.push({
        name: stage.name,
        description: stage.description || '',
        order: index,
        color: stage.color || '#3B82F6',
        isDefault: index === 0 // First stage is default
      });
    });
  } else {
    // Create default stages if none provided
    newPipeline.stages = [
      { name: 'New', order: 0, isDefault: true },
      { name: 'In Progress', order: 1 },
      { name: 'Completed', order: 2 }
    ];
  }

  // Add pipeline to project
  project.pipelines.push(newPipeline);
  await project.save();

  // Get the newly created pipeline
  const createdPipeline = project.pipelines[project.pipelines.length - 1];

  // Create notification for all project members
  try {
    await notificationService.createPipelineNotification(
      'pipeline_created',
      createdPipeline,
      projectId,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create pipeline notification:', error);
    // Continue with the response even if notification creation fails
  }

  res.status(201).json({
    success: true,
    message: 'Pipeline created successfully',
    data: { pipeline: createdPipeline }
  });
});

// @desc    Get all pipelines in a project
// @route   GET /api/projects/:projectId/pipelines
// @access  Private (project members)
export const getProjectPipelines = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate ObjectId
  const validation = validateObjectId(projectId);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has access to the project
  if (
    !project.isMember(req.user._id) &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have access to this project');
  }

  // Filter out archived pipelines if requested
  let pipelines = project.pipelines;
  if (req.query.includeArchived !== 'true') {
    pipelines = pipelines.filter(pipeline => !pipeline.isArchived);
  }

  res.json({
    success: true,
    data: { pipelines }
  });
});

// @desc    Get a specific pipeline by ID
// @route   GET /api/projects/:projectId/pipelines/:pipelineId
// @access  Private (project members)
export const getPipelineById = asyncHandler(async (req, res) => {
  const { projectId, pipelineId } = req.params;

  // Validate ObjectIds
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const pipelineValidation = validateObjectId(pipelineId);
  if (!pipelineValidation.isValid) {
    throw new ValidationError(pipelineValidation.message);
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has access to the project
  if (
    !project.isMember(req.user._id) &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have access to this project');
  }

  // Find pipeline in project
  const pipeline = project.pipelines.id(pipelineId);

  if (!pipeline) {
    throw new NotFoundError('Pipeline not found');
  }

  res.json({
    success: true,
    data: { pipeline }
  });
});

// @desc    Update a pipeline
// @route   PUT /api/projects/:projectId/pipelines/:pipelineId
// @access  Private (project owner, admin, or manager)
export const updatePipeline = asyncHandler(async (req, res) => {
  const { projectId, pipelineId } = req.params;
  const { name, description, isDefault, isArchived } = req.body;

  // Validate ObjectIds
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const pipelineValidation = validateObjectId(pipelineId);
  if (!pipelineValidation.isValid) {
    throw new ValidationError(pipelineValidation.message);
  }

  // Validate pipeline data if provided
  if (name || description !== undefined) {
    const dataValidation = validatePipelineData({
      name: name || '',
      description: description || ''
    });
    if (!dataValidation.isValid) {
      throw new ValidationError('Validation failed', dataValidation.errors);
    }
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission
  if (
    !project.hasPermission(req.user._id, 'manager') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to update pipelines in this project');
  }

  // Find pipeline in project
  const pipeline = project.pipelines.id(pipelineId);

  if (!pipeline) {
    throw new NotFoundError('Pipeline not found');
  }

  // Update pipeline fields
  if (name !== undefined) pipeline.name = name;
  if (description !== undefined) pipeline.description = description;
  if (isArchived !== undefined) pipeline.isArchived = isArchived;

  // Handle default status
  if (isDefault === true) {
    // Set all other pipelines to non-default
    project.pipelines.forEach(p => {
      if (p._id.toString() !== pipelineId) {
        p.isDefault = false;
      }
    });
    pipeline.isDefault = true;
  } else if (isDefault === false && pipeline.isDefault) {
    // If trying to unset default status on the default pipeline,
    // make sure there's another pipeline to set as default
    if (project.pipelines.length > 1) {
      // Find first non-archived pipeline to set as default
      const newDefault = project.pipelines.find(p =>
        p._id.toString() !== pipelineId && !p.isArchived
      );

      if (newDefault) {
        newDefault.isDefault = true;
        pipeline.isDefault = false;
      } else {
        throw new ValidationError('Cannot unset default status: No other active pipeline available');
      }
    } else {
      throw new ValidationError('Cannot unset default status: At least one pipeline must be default');
    }
  }

  await project.save();

  // Create notification for pipeline update
  try {
    await notificationService.createPipelineNotification(
      'pipeline_updated',
      pipeline,
      projectId,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create pipeline update notification:', error);
    // Continue with the response even if notification creation fails
  }

  res.json({
    success: true,
    message: 'Pipeline updated successfully',
    data: { pipeline }
  });
});

// @desc    Delete a pipeline
// @route   DELETE /api/projects/:projectId/pipelines/:pipelineId
// @access  Private (project owner, admin)
export const deletePipeline = asyncHandler(async (req, res) => {
  const { projectId, pipelineId } = req.params;

  // Validate ObjectIds
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const pipelineValidation = validateObjectId(pipelineId);
  if (!pipelineValidation.isValid) {
    throw new ValidationError(pipelineValidation.message);
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission
  if (
    !project.hasPermission(req.user._id, 'admin') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to delete pipelines in this project');
  }

  // Find pipeline in project
  const pipeline = project.pipelines.id(pipelineId);

  if (!pipeline) {
    throw new NotFoundError('Pipeline not found');
  }

  // Cannot delete the last pipeline
  if (project.pipelines.length <= 1) {
    throw new ValidationError('Cannot delete the last pipeline');
  }

  // If deleting the default pipeline, set another one as default
  if (pipeline.isDefault) {
    // Find first non-archived pipeline to set as default
    const newDefault = project.pipelines.find(p =>
      p._id.toString() !== pipelineId && !p.isArchived
    );

    if (newDefault) {
      newDefault.isDefault = true;
    } else {
      throw new ValidationError('Cannot delete: No other active pipeline available to set as default');
    }
  }

  // Store pipeline info before deletion for notification
  const pipelineToDelete = { ...pipeline.toObject() };

  // Remove pipeline from project
  project.pipelines.pull(pipelineId);
  await project.save();

  // Create notification for pipeline deletion
  try {
    await notificationService.createPipelineNotification(
      'pipeline_deleted',
      pipelineToDelete,
      projectId,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create pipeline deletion notification:', error);
    // Continue with the response even if notification creation fails
  }

  res.json({
    success: true,
    message: 'Pipeline deleted successfully'
  });
});

// @desc    Create a new stage in a pipeline
// @route   POST /api/projects/:projectId/pipelines/:pipelineId/stages
// @access  Private (project owner, admin, or manager)
export const createStage = asyncHandler(async (req, res) => {
  const { projectId, pipelineId } = req.params;
  const { name, description, color } = req.body;

  // Validate ObjectIds
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const pipelineValidation = validateObjectId(pipelineId);
  if (!pipelineValidation.isValid) {
    throw new ValidationError(pipelineValidation.message);
  }

  // Validate stage data
  const stageValidation = validateStageData({ name, description, color });
  if (!stageValidation.isValid) {
    throw new ValidationError('Validation failed', stageValidation.errors);
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission
  if (
    !project.hasPermission(req.user._id, 'manager') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to create stages in this project');
  }

  // Find pipeline in project
  const pipeline = project.pipelines.id(pipelineId);

  if (!pipeline) {
    throw new NotFoundError('Pipeline not found');
  }

  // Get highest order value
  const maxOrder = pipeline.stages.length > 0
    ? Math.max(...pipeline.stages.map(stage => stage.order))
    : -1;

  // Create new stage
  const newStage = {
    name,
    description: description || '',
    order: maxOrder + 1,
    color: color || '#3B82F6',
    isDefault: false,
    isArchived: false
  };

  // Add stage to pipeline
  pipeline.stages.push(newStage);
  await project.save();

  // Get the newly created stage
  const createdStage = pipeline.stages[pipeline.stages.length - 1];

  // Create notification for stage creation
  try {
    await notificationService.createStageNotification(
      'stage_created',
      createdStage,
      pipelineId,
      projectId,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create stage creation notification:', error);
    // Continue with the response even if notification creation fails
  }

  res.status(201).json({
    success: true,
    message: 'Stage created successfully',
    data: { stage: createdStage }
  });
});

// @desc    Update a stage
// @route   PUT /api/projects/:projectId/pipelines/:pipelineId/stages/:stageId
// @access  Private (project owner, admin, or manager)
export const updateStage = asyncHandler(async (req, res) => {
  const { projectId, pipelineId, stageId } = req.params;
  const { name, description, color, order, isDefault, isArchived } = req.body;

  // Validate ObjectIds
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const pipelineValidation = validateObjectId(pipelineId);
  if (!pipelineValidation.isValid) {
    throw new ValidationError(pipelineValidation.message);
  }

  const stageValidation = validateObjectId(stageId);
  if (!stageValidation.isValid) {
    throw new ValidationError(stageValidation.message);
  }

  // Validate stage data if provided
  if (name || description !== undefined || color) {
    const dataValidation = validateStageData({
      name: name || '',
      description: description || '',
      color: color || ''
    });
    if (!dataValidation.isValid) {
      throw new ValidationError('Validation failed', dataValidation.errors);
    }
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission
  if (
    !project.hasPermission(req.user._id, 'manager') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to update stages in this project');
  }

  // Find pipeline in project
  const pipeline = project.pipelines.id(pipelineId);

  if (!pipeline) {
    throw new NotFoundError('Pipeline not found');
  }

  // Find stage in pipeline
  const stage = pipeline.stages.id(stageId);

  if (!stage) {
    throw new NotFoundError('Stage not found');
  }

  // Update stage fields
  if (name !== undefined) stage.name = name;
  if (description !== undefined) stage.description = description;
  if (color !== undefined) stage.color = color;
  if (isArchived !== undefined) stage.isArchived = isArchived;

  // Handle order change if provided
  if (order !== undefined) {
    const currentOrder = stage.order;
    const newOrder = parseInt(order, 10);

    // Validate order
    if (isNaN(newOrder) || newOrder < 0) {
      throw new ValidationError('Order must be a non-negative integer');
    }

    // Reorder stages
    if (newOrder !== currentOrder) {
      pipeline.stages.forEach(s => {
        if (s._id.toString() !== stageId) {
          if (newOrder > currentOrder && s.order > currentOrder && s.order <= newOrder) {
            s.order -= 1;
          } else if (newOrder < currentOrder && s.order >= newOrder && s.order < currentOrder) {
            s.order += 1;
          }
        }
      });
      stage.order = newOrder;
    }
  }

  // Handle default status
  if (isDefault === true) {
    // Set all other stages to non-default
    pipeline.stages.forEach(s => {
      if (s._id.toString() !== stageId) {
        s.isDefault = false;
      }
    });
    stage.isDefault = true;
  } else if (isDefault === false && stage.isDefault) {
    // If trying to unset default status on the default stage,
    // make sure there's another stage to set as default
    if (pipeline.stages.length > 1) {
      // Find first non-archived stage to set as default
      const newDefault = pipeline.stages.find(s =>
        s._id.toString() !== stageId && !s.isArchived
      );

      if (newDefault) {
        newDefault.isDefault = true;
        stage.isDefault = false;
      } else {
        throw new ValidationError('Cannot unset default status: No other active stage available');
      }
    } else {
      throw new ValidationError('Cannot unset default status: At least one stage must be default');
    }
  }

  await project.save();

  // Create notification for stage update
  try {
    await notificationService.createStageNotification(
      'stage_updated',
      stage,
      pipelineId,
      projectId,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create stage update notification:', error);
    // Continue with the response even if notification creation fails
  }

  res.json({
    success: true,
    message: 'Stage updated successfully',
    data: { stage }
  });
});

// @desc    Delete a stage
// @route   DELETE /api/projects/:projectId/pipelines/:pipelineId/stages/:stageId
// @access  Private (project owner, admin)
export const deleteStage = asyncHandler(async (req, res) => {
  const { projectId, pipelineId, stageId } = req.params;

  // Validate ObjectIds
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const pipelineValidation = validateObjectId(pipelineId);
  if (!pipelineValidation.isValid) {
    throw new ValidationError(pipelineValidation.message);
  }

  const stageValidation = validateObjectId(stageId);
  if (!stageValidation.isValid) {
    throw new ValidationError(stageValidation.message);
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission
  if (
    !project.hasPermission(req.user._id, 'admin') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to delete stages in this project');
  }

  // Find pipeline in project
  const pipeline = project.pipelines.id(pipelineId);

  if (!pipeline) {
    throw new NotFoundError('Pipeline not found');
  }

  // Find stage in pipeline
  const stage = pipeline.stages.id(stageId);

  if (!stage) {
    throw new NotFoundError('Stage not found');
  }

  // Cannot delete the last stage
  if (pipeline.stages.length <= 1) {
    throw new ValidationError('Cannot delete the last stage');
  }

  // If deleting the default stage, set another one as default
  if (stage.isDefault) {
    // Find first non-archived stage to set as default
    const newDefault = pipeline.stages.find(s =>
      s._id.toString() !== stageId && !s.isArchived
    );

    if (newDefault) {
      newDefault.isDefault = true;
    } else {
      throw new ValidationError('Cannot delete: No other active stage available to set as default');
    }
  }

  // Store stage info before deletion for notification
  const stageToDelete = { ...stage.toObject() };

  // Get the order of the stage to be deleted
  const deletedOrder = stage.order;

  // Remove stage from pipeline
  pipeline.stages.pull(stageId);

  // Update order of remaining stages
  pipeline.stages.forEach(s => {
    if (s.order > deletedOrder) {
      s.order -= 1;
    }
  });

  await project.save();

  // Create notification for stage deletion
  try {
    await notificationService.createStageNotification(
      'stage_deleted',
      stageToDelete,
      pipelineId,
      projectId,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create stage deletion notification:', error);
    // Continue with the response even if notification creation fails
  }

  res.json({
    success: true,
    message: 'Stage deleted successfully'
  });
});

// @desc    Reorder stages in a pipeline
// @route   PUT /api/projects/:projectId/pipelines/:pipelineId/reorder
// @access  Private (project owner, admin, or manager)
export const reorderStages = asyncHandler(async (req, res) => {
  const { projectId, pipelineId } = req.params;
  const { stageOrder } = req.body;

  if (!stageOrder || !Array.isArray(stageOrder)) {
    throw new ValidationError('Stage order array is required');
  }

  // Validate ObjectIds
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const pipelineValidation = validateObjectId(pipelineId);
  if (!pipelineValidation.isValid) {
    throw new ValidationError(pipelineValidation.message);
  }

  // Find project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check if user has permission
  if (
    !project.hasPermission(req.user._id, 'manager') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to reorder stages in this project');
  }

  // Find pipeline in project
  const pipeline = project.pipelines.id(pipelineId);

  if (!pipeline) {
    throw new NotFoundError('Pipeline not found');
  }

  // Validate that all stage IDs exist in the pipeline
  for (const stageId of stageOrder) {
    const stageValidation = validateObjectId(stageId);
    if (!stageValidation.isValid) {
      throw new ValidationError(`Invalid stage ID: ${stageId}`);
    }

    const stageExists = pipeline.stages.some(s => s._id.toString() === stageId);
    if (!stageExists) {
      throw new ValidationError(`Stage not found: ${stageId}`);
    }
  }

  // Validate that all stages are included
  if (stageOrder.length !== pipeline.stages.length) {
    throw new ValidationError('All stages must be included in the reordering');
  }

  // Update stage orders
  stageOrder.forEach((stageId, index) => {
    const stage = pipeline.stages.id(stageId);
    if (stage) {
      stage.order = index;
    }
  });

  await project.save();

  res.json({
    success: true,
    message: 'Stages reordered successfully',
    data: { stages: pipeline.stages }
  });
});

export default {
  createPipeline,
  getProjectPipelines,
  getPipelineById,
  updatePipeline,
  deletePipeline,
  createStage,
  updateStage,
  deleteStage,
  reorderStages
};