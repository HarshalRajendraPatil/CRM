import Task from '../models/Task.model.js';
import mongoose from 'mongoose';
import { validateTaskData, sanitizeTaskData } from '../utils/taskValidation.js';
import { createTaskNotification } from '../utils/notificationService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

// Helper function to format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Get all tasks for a project
export const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    status,
    assignedTo,
    priority,
    type,
    overdue,
    search,
    sortBy = 'dueDate',
    sortOrder = 'asc',
    page = 1,
    limit = 20,
    includeArchived = false
  } = req.query;

  // Build query
  const query = { project: projectId };
  
  if (!includeArchived) {
    query.isArchived = false;
  }
  
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;
  if (priority) query.priority = priority;
  if (type) query.type = type;
  if (overdue === 'true') {
    query.dueDate = { $lt: new Date() };
    query.status = { $nin: ['completed', 'cancelled'] };
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  if (sortBy !== 'priority') {
    sort.priority = -1; // Always sort by priority as secondary sort
  }

  // Execute query
  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('project', 'name')
    .populate('relatedEntity.entityId')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Task.countDocuments(query);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    }
  });
});

// Get tasks assigned to a specific user
export const getUserTasks = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    status,
    project,
    overdue,
    search,
    sortBy = 'dueDate',
    sortOrder = 'asc',
    page = 1,
    limit = 20
  } = req.query;

  // Build query
  const query = { assignedTo: userId, isArchived: false };
  
  if (status) query.status = status;
  if (project) query.project = project;
  if (overdue === 'true') {
    query.dueDate = { $lt: new Date() };
    query.status = { $nin: ['completed', 'cancelled'] };
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  if (sortBy !== 'priority') {
    sort.priority = -1;
  }

  const tasks = await Task.find(query)
    .populate('project', 'name')
    .populate('createdBy', 'name email')
    .populate('relatedEntity.entityId')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Task.countDocuments(query);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    }
  });
});

// Get a single task by ID
export const getTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id)
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('project', 'name')
    .populate('relatedEntity.entityId')
    .populate('dependencies.task', 'title status dueDate')
    .populate('comments.author', 'name email profileImage')
    .populate('comments.mentions', 'name email')
    .populate('subtasks.assignedTo', 'name email')
    .populate('activityLog.actor', 'name email');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({
    success: true,
    data: task
  });
});

// Create a new task
export const createTask = asyncHandler(async (req, res) => {
  const sanitizedData = sanitizeTaskData(req.body);
  sanitizedData.project = req.body.projectId;
  sanitizedData.createdBy = req.user.id;
  
  // Handle related entity mapping from client format to model format
  if (req.body.relatedTo && req.body.relatedToId) {
    sanitizedData.relatedEntity = {
      type: req.body.relatedTo,
      entityId: req.body.relatedToId
    };
  }
  
  const validatedData = validateTaskData(sanitizedData, false);
  
  // Ensure createdBy is set to current user
  validatedData.createdBy = req.user.id;

  const task = await Task.create(sanitizedData);

  // Link task to related entity if specified
  if (task.relatedEntity && task.relatedEntity.type && task.relatedEntity.entityId) {
    let relatedModel;
    switch (task.relatedEntity.type) {
      case 'deal':
        relatedModel = await import('../models/Deal.model.js');
        break;
      case 'customer':
        relatedModel = await import('../models/Customer.model.js');
        break;
      case 'company':
        relatedModel = await import('../models/Company.model.js');
        break;
      case 'lead':
        relatedModel = await import('../models/Lead.model.js');
        break;
      case 'project':
        relatedModel = await import('../models/Project.model.js');
        break;
    }
    
    if (relatedModel) {
      const Model = relatedModel.default;
      await Model.findByIdAndUpdate(
        task.relatedEntity.entityId,
        { $addToSet: { tasks: task._id } }
      );
    }
  }

  // Populate the created task
  await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'project', select: 'name' },
    { path: 'relatedEntity.entityId' }
  ]);

  // Create notification for assigned user
  if (task.assignedTo.toString() !== req.user.id) {
    await createTaskNotification('task_assigned', task, task.project, req.user.id);
  }

  res.status(201).json({
    success: true,
    data: task,
    message: 'Task created successfully'
  });
});

// Update a task
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sanitizedData = sanitizeTaskData(req.body);
  // const validatedData = validateTaskData(sanitizedData, true);

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Track changes for activity log
  const changes = {};
  Object.keys(sanitizedData).forEach(key => {
    if (JSON.stringify(task[key]) !== JSON.stringify(sanitizedData[key])) {
      changes[key] = {
        from: task[key],
        to: sanitizedData[key]
      };
    }
  });

  // Update the task
  Object.assign(task, sanitizedData);
  
  // Add activity log entry
  if (Object.keys(changes).length > 0) {
    task.activityLog.push({
      action: 'updated',
      description: `Task updated: ${Object.keys(changes).join(', ')}`,
      actor: req.user.id,
      metadata: { changes }
    });
  }

  await task.save();

  // Populate the updated task
  await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'project', select: 'name' },
    { path: 'relatedEntity.entityId' }
  ]);

  // Create notifications for significant changes
  if (changes.assignedTo && changes.assignedTo.to !== req.user.id) {
    await createTaskNotification('task_reassigned', task, task.project, req.user.id);
  }
  
  if (changes.status && changes.status.to === 'completed') {
    await createTaskNotification('task_completed', task, task.project, req.user.id);
  } else if (changes.status && changes.status.from === 'completed' && changes.status.to !== 'completed') {
    await createTaskNotification('task_reopened', task, task.project, req.user.id);
  } else if (Object.keys(changes).length > 0) {
    // General task update notification
    await createTaskNotification('task_updated', task, task.project, req.user.id);
  }

  res.json({
    success: true,
    data: task,
    message: 'Task updated successfully'
  });
});

// Delete a task
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Unlink task from related entity if specified
  if (task.relatedTo && task.relatedToId) {
    let relatedModel;
    switch (task.relatedTo) {
      case 'deal':
        relatedModel = await import('../models/Deal.model.js');
        break;
      case 'customer':
        relatedModel = await import('../models/Customer.model.js');
        break;
      case 'company':
        relatedModel = await import('../models/Company.model.js');
        break;
      case 'lead':
        relatedModel = await import('../models/Lead.model.js');
        break;
      case 'project':
        relatedModel = await import('../models/Project.model.js');
        break;
    }
    
    if (relatedModel) {
      const Model = relatedModel.default;
      await Model.findByIdAndUpdate(
        task.relatedToId,
        { $pull: { tasks: task._id } }
      );
    }
  }

  // Create notification before deletion
  await createTaskNotification('task_deleted', task, task.project, req.user.id);

  await Task.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

// Archive a task
export const archiveTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  task.isArchived = true;
  task.archivedAt = new Date();
  task.archivedBy = req.user.id;
  
  task.activityLog.push({
    action: 'archived',
    description: 'Task archived',
    actor: req.user.id
  });

  await task.save();

  // Create notification for task archive
  await createTaskNotification('task_archived', task, task.project, req.user.id);

  res.json({
    success: true,
    data: task,
    message: 'Task archived successfully'
  });
});

// Restore an archived task
export const restoreTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  task.isArchived = false;
  task.archivedAt = undefined;
  task.archivedBy = undefined;
  
  task.activityLog.push({
    action: 'restored',
    description: 'Task restored from archive',
    actor: req.user.id
  });

  await task.save();

  // Create notification for task restore
  await createTaskNotification('task_restored', task, task.project, req.user.id);

  res.json({
    success: true,
    data: task,
    message: 'Task restored successfully'
  });
});

// Update task status
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const oldStatus = task.status;
  await task.updateStatus(status, req.user.id, notes);

  // Populate the updated task
  await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'project', select: 'name' }
  ]);

  // Create notification for status change
  if (status === 'completed') {
    await createTaskNotification('task_completed', task, task.project, req.user.id);
  } else if (oldStatus === 'completed' && status !== 'completed') {
    await createTaskNotification('task_reopened', task, task.project, req.user.id);
  }

  res.json({
    success: true,
    data: task,
    message: 'Task status updated successfully'
  });
});

// Assign task to user
export const assignTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const oldAssignee = task.assignedTo;
  await task.assignTo(assignedTo, req.user.id);

  // Populate the updated task
  await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'project', select: 'name' }
  ]);

  // Create notification for new assignee
  if (assignedTo !== req.user.id) {
    await createTaskNotification('task_assigned', task, task.project, req.user.id);
  }

  res.json({
    success: true,
    data: task,
    message: 'Task assigned successfully'
  });
});

// Add comment to task
export const addTaskComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, mentions = [] } = req.body;

  if (!content || content.trim().length === 0) {
    throw new AppError('Comment content is required', 400);
  }

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await task.addComment(content, req.user.id, mentions);

  // Populate the updated task
  await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'project', select: 'name' },
    { path: 'comments.author', select: 'name email profileImage' },
    { path: 'comments.mentions', select: 'name email' }
  ]);

  // Create notifications for mentions
  if (mentions.length > 0) {
    await createTaskNotification('task_mentioned', task, task.project, req.user.id, mentions);
  }

  res.json({
    success: true,
    data: task,
    message: 'Comment added successfully'
  });
});

// Add subtask to task
export const addSubtask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subtaskData = req.body;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await task.addSubtask(subtaskData);

  // Populate the updated task
  await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'project', select: 'name' },
    { path: 'subtasks.assignedTo', select: 'name email' }
  ]);

  // Create notification for subtask addition
  await createTaskNotification('subtask_added', task, task.project, req.user.id);

  res.json({
    success: true,
    data: task,
    message: 'Subtask added successfully'
  });
});

// Update subtask
export const updateSubtask = asyncHandler(async (req, res) => {
  const { id, subtaskId } = req.params;
  const subtaskData = req.body;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) {
    throw new AppError('Subtask not found', 404);
  }

  // Track if subtask was completed
  const wasCompleted = subtask.status === 'completed';
  
  // Update subtask
  Object.assign(subtask, subtaskData);
  subtask.updatedAt = new Date();

  // Add activity log
  task.activityLog.push({
    action: 'subtask_updated',
    description: `Subtask "${subtask.title}" updated`,
    actor: req.user.id,
    metadata: { subtaskId: subtask._id }
  });

  await task.save();

  // Populate the updated task
  await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'project', select: 'name' },
    { path: 'subtasks.assignedTo', select: 'name email' }
  ]);

  // Create notification for subtask completion
  if (!wasCompleted && subtask.status === 'completed') {
    await createTaskNotification('subtask_completed', task, task.project, req.user.id);
  }

  // Update task progress based on subtask completion
  if (task.subtasks && task.subtasks.length > 0) {
    const completedSubtasks = task.subtasks.filter(s => s.status === 'completed').length;
    task.progress = Math.round((completedSubtasks / task.subtasks.length) * 100);
    
    // Auto-complete task if progress reaches 100%
    if (task.progress === 100 && task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date();
      task.completedBy = req.user.id;
      
      // Add activity log
      task.activityLog.push({
        action: 'completed',
        description: 'Task automatically completed due to 100% progress',
        actor: req.user.id,
        metadata: { reason: 'progress_complete' }
      });
      
      // Create notification for auto-completion
      await createTaskNotification('task_completed', task, task.project, req.user.id);
    }
  }

  res.json({
    success: true,
    data: task,
    message: 'Subtask updated successfully'
  });
});

// Complete subtask
export const completeSubtask = asyncHandler(async (req, res) => {
  const { id, subtaskId } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) {
    throw new AppError('Subtask not found', 404);
  }

  // Update subtask status
  subtask.status = 'completed';
  subtask.completedAt = new Date();
  subtask.updatedAt = new Date();

  // Add activity log
  task.activityLog.push({
    action: 'subtask_completed',
    description: `Subtask "${subtask.title}" completed`,
    actor: req.user.id,
    metadata: { subtaskId: subtask._id }
  });

  // Update task progress based on subtask completion
  if (task.subtasks && task.subtasks.length > 0) {
    const completedSubtasks = task.subtasks.filter(s => s.status === 'completed').length;
    task.progress = Math.round((completedSubtasks / task.subtasks.length) * 100);
    
    // Auto-complete task if progress reaches 100%
    if (task.progress === 100 && task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date();
      task.completedBy = req.user.id;
      
      // Add activity log
      task.activityLog.push({
        action: 'completed',
        description: 'Task automatically completed due to 100% progress',
        actor: req.user.id,
        metadata: { reason: 'progress_complete' }
      });
      
      // Create notification for auto-completion
      await createTaskNotification('task_completed', task, task.project, req.user.id);
    }
  }

  await task.save();

  // Populate the updated task
  await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'project', select: 'name' },
    { path: 'subtasks.assignedTo', select: 'name email' }
  ]);

  // Create notification for subtask completion
  await createTaskNotification('subtask_completed', task, task.project, req.user.id);

  res.json({
    success: true,
    data: task,
    message: 'Subtask completed successfully'
  });
});

// Delete subtask
export const deleteSubtask = asyncHandler(async (req, res) => {
  const { id, subtaskId } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) {
    throw new AppError('Subtask not found', 404);
  }

  const subtaskTitle = subtask.title;
  await subtask.deleteOne();

  // Add activity log
  task.activityLog.push({
    action: 'subtask_deleted',
    description: `Subtask "${subtaskTitle}" deleted`,
    actor: req.user.id,
    metadata: { subtaskId }
  });

  // Update task progress based on remaining subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    const completedSubtasks = task.subtasks.filter(s => s.status === 'completed').length;
    task.progress = Math.round((completedSubtasks / task.subtasks.length) * 100);
  } else {
    task.progress = 0;
  }

  await task.save();

  res.json({
    success: true,
    data: task,
    message: 'Subtask deleted successfully'
  });
});

// Bulk operations
export const bulkUpdateTasks = asyncHandler(async (req, res) => {
  const { taskIds, updates } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new AppError('Task IDs are required', 400);
  }

  const validatedUpdates = validateTaskData(updates, true);
  
  const result = await Task.updateMany(
    { _id: { $in: taskIds } },
    { $set: validatedUpdates }
  );

  // Get updated tasks for notifications
  const updatedTasks = await Task.find({ _id: { $in: taskIds } });
  
  // Create notifications for each updated task
  for (const task of updatedTasks) {
    await createTaskNotification('task_updated', task, task.project, req.user.id);
  }

  res.json({
    success: true,
    message: `${result.modifiedCount} tasks updated successfully`
  });
});

export const bulkDeleteTasks = asyncHandler(async (req, res) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new AppError('Task IDs are required', 400);
  }

  // Get tasks before deletion for notifications
  const tasks = await Task.find({ _id: { $in: taskIds } });
  
  // Create notifications for each deleted task
  for (const task of tasks) {
    await createTaskNotification('task_deleted', task, task.project, req.user.id);
  }

  const result = await Task.deleteMany({ _id: { $in: taskIds } });

  res.json({
    success: true,
    message: `${result.deletedCount} tasks deleted successfully`
  });
});

export const bulkArchiveTasks = asyncHandler(async (req, res) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new AppError('Task IDs are required', 400);
  }

  const result = await Task.updateMany(
    { _id: { $in: taskIds } },
    { 
      $set: { 
        isArchived: true, 
        archivedAt: new Date(), 
        archivedBy: req.user.id 
      } 
    }
  );

  // Get archived tasks for notifications
  const archivedTasks = await Task.find({ _id: { $in: taskIds } });
  
  // Create notifications for each archived task
  for (const task of archivedTasks) {
    await createTaskNotification('task_archived', task, task.project, req.user.id);
  }

  res.json({
    success: true,
    message: `${result.modifiedCount} tasks archived successfully`
  });
});

// Get task statistics
export const getTaskStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { period = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const baseQuery = {  project: new mongoose.Types.ObjectId(projectId), isArchived: false };
  const periodQuery = { ...baseQuery, createdAt: { $gte: startDate } };

  // Get basic statistics
  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    tasksByPriority,
    tasksByType,
    tasksByAssignee,
    completionRate,
    averageCompletionTime
  ] = await Promise.all([
    // Total tasks
    Task.countDocuments(baseQuery),
    
    // Completed tasks
    Task.countDocuments({ ...baseQuery, status: 'completed' }),
    
    // Pending tasks
    Task.countDocuments({ ...baseQuery, status: 'pending' }),
    
    // In progress tasks
    Task.countDocuments({ ...baseQuery, status: 'in_progress' }),
    
    // Overdue tasks
    Task.countDocuments({ 
      ...baseQuery, 
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] }
    }),
    
    // Tasks by priority
    Task.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    
    // Tasks by type
    Task.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    
    // Tasks by assignee
    Task.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 1, count: 1, name: '$user.name', email: '$user.email' } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    
    // Completion rate
    Task.aggregate([
      { $match: periodQuery },
      { 
        $group: { 
          _id: null, 
          total: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]),
    
    // Average completion time
    Task.aggregate([
      { $match: { ...baseQuery, status: 'completed', completedAt: { $exists: true } } },
      {
        $project: {
          completionTime: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      { $group: { _id: null, avgTime: { $avg: '$completionTime' } } }
    ])
  ]);

  // Process completion rate
  const completionRateData = completionRate[0] || { total: 0, completed: 0 };
  const completionRatePercent = completionRateData.total > 0 
    ? (completionRateData.completed / completionRateData.total) * 100 
    : 0;

  // Process average completion time
  const avgCompletionTime = averageCompletionTime[0]?.avgTime || 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        completionRate: Math.round(completionRatePercent * 100) / 100,
        averageCompletionTime: Math.round(avgCompletionTime * 100) / 100
      },
      distributions: {
        byPriority: tasksByPriority,
        byType: tasksByType,
        byAssignee: tasksByAssignee
      },
      // Add the data structure expected by frontend
      tasksByStatus: [
        { _id: 'completed', count: completedTasks },
        { _id: 'pending', count: pendingTasks },
        { _id: 'in_progress', count: inProgressTasks }
      ],
      tasksByPriority: tasksByPriority,
      tasksByAssignedTo: tasksByAssignee,
      tasksByRelatedTo: tasksByType
    }
  });
});

// Get task insights
export const getTaskInsights = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { period = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const baseQuery = { project: new mongoose.Types.ObjectId(projectId), isArchived: false };
  const periodQuery = { ...baseQuery, createdAt: { $gte: startDate } };

  // Get insights data
  const [
    tasksCompletedLast30Days,
    tasksCreatedLast30Days,
    avgCompletionTime,
    topTags,
    tasksDueSoon,
    userPerformance
  ] = await Promise.all([
    // Tasks completed in last 30 days
    Task.aggregate([
      { $match: { ...baseQuery, status: 'completed', completedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    
    // Tasks created in last 30 days
    Task.aggregate([
      { $match: periodQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    
    // Average completion time
    Task.aggregate([
      { $match: { ...baseQuery, status: 'completed', completedAt: { $exists: true } } },
      {
        $project: {
          completionTime: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      { $group: { _id: null, avgTime: { $avg: '$completionTime' } } }
    ]),
    
    // Top tags
    Task.aggregate([
      { $match: baseQuery },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    
    // Tasks due soon (next 7 days)
    Task.countDocuments({
      ...baseQuery,
      dueDate: { 
        $gte: now, 
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) 
      },
      status: { $nin: ['completed', 'cancelled'] }
    }),
    
    // User performance
    Task.aggregate([
      { $match: { ...baseQuery, assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          avgCompletionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60] },
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          completionRate: { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
        }
      },
      { $sort: { completionRate: -1 } },
      { $limit: 10 }
    ])
  ]);

  console.log(tasksDueSoon);

  res.json({
    success: true,
    data: {
      tasksCompletedLast30Days,
      tasksCreatedLast30Days,
      avgCompletionTime: avgCompletionTime[0]?.avgTime || 0,
      topTags,
      tasksDueSoon,
      userPerformance,
      summary: {
        totalTasks: await Task.countDocuments(baseQuery),
        completedTasks: await Task.countDocuments({ ...baseQuery, status: 'completed' }),
        pendingTasks: await Task.countDocuments({ ...baseQuery, status: 'pending' }),
        inProgressTasks: await Task.countDocuments({ ...baseQuery, status: 'in_progress' }),
        overdueTasks: await Task.countDocuments({ 
          ...baseQuery, 
          dueDate: { $lt: now },
          status: { $nin: ['completed', 'cancelled'] }
        })
      }
    }
  });
});

// Get overdue tasks
export const getOverdueTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const overdueTasks = await Task.getOverdueTasks(projectId);

  res.json({
    success: true,
    data: overdueTasks
  });
});

// Get tasks by related entity
export const getTasksByEntity = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const { status, includeCompleted = false } = req.query;

  const query = {
    'relatedEntity.type': entityType,
    'relatedEntity.entityId': entityId,
    isArchived: false
  };

  if (status) {
    query.status = status;
  } else if (!includeCompleted) {
    query.status = { $nin: ['completed', 'cancelled'] };
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('project', 'name')
    .sort({ dueDate: 1, priority: -1 });

  res.json({
    success: true,
    data: tasks
  });
});

// Export tasks
export const exportTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'json', filters = {} } = req.query;

  const query = { project: projectId, isArchived: false };
  
  // Apply filters
  if (filters.status) query.status = filters.status;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.priority) query.priority = filters.priority;
  if (filters.type) query.type = filters.type;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = tasks.map(task => ({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      assignedTo: task.assignedTo?.name || '',
      createdBy: task.createdBy?.name || '',
      dueDate: task.dueDate?.toISOString().split('T')[0] || '',
      createdAt: task.createdAt.toISOString().split('T')[0],
      completedAt: task.completedAt?.toISOString().split('T')[0] || ''
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
    
    // Simple CSV conversion
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    res.send(csv);
  } else {
    res.json({
      success: true,
      data: tasks
    });
  }
});
