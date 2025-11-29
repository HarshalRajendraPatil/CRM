import express from 'express';
import {
  getProjectTasks,
  getUserTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  archiveTask,
  restoreTask,
  updateTaskStatus,
  assignTask,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  addSubtask,
  updateSubtask,
  completeSubtask,
  deleteSubtask,
  addTaskCustomField,
  updateTaskCustomField,
  deleteTaskCustomField,
  bulkUpdateTasks,
  bulkDeleteTasks,
  bulkArchiveTasks,
  bulkRestoreTasks,
  getTaskStats,
  getTaskInsights,
  getOverdueTasks,
  getTasksByEntity,
  exportTasks
} from '../controllers/taskController.js';
import { authenticateToken, requireManagerRole, requireViewerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Project tasks routes
router.get('/project/:projectId', requireViewerRole(), getProjectTasks);
router.get('/project/:projectId/stats', requireViewerRole(), getTaskStats);
router.get('/project/:projectId/insights', requireViewerRole(), getTaskInsights);
router.get('/project/:projectId/overdue', requireViewerRole(), getOverdueTasks);
router.get('/project/:projectId/export', requireViewerRole(), exportTasks);

// User tasks routes
router.get('/user/:userId', requireViewerRole(), getUserTasks);

// Task status and assignment
router.patch('/:id/status', requireManagerRole(), updateTaskStatus);
router.patch('/:id/assign', requireManagerRole(), assignTask);

// Bulk operations
router.patch('/bulk/update', requireManagerRole(), bulkUpdateTasks);
router.patch('/bulk/archive', requireManagerRole(), bulkArchiveTasks);
router.patch('/bulk/restore', requireManagerRole(), bulkRestoreTasks);
router.delete('/bulk/delete', requireManagerRole(), bulkDeleteTasks);

// Entity-related tasks
router.get('/entity/:entityType/:entityId', requireViewerRole(), getTasksByEntity);

// Individual task routes
router.get('/:id', requireViewerRole(), getTask);
router.post('/', requireManagerRole(), createTask);
router.put('/:id', requireManagerRole(), updateTask);
router.delete('/:id', requireManagerRole(), deleteTask);

// Task archival
router.patch('/:id/archive', requireManagerRole(), archiveTask);
router.patch('/:id/restore', requireManagerRole(), restoreTask);

// Comments
router.post('/:id/comments', requireViewerRole(), addTaskComment);
router.put('/:id/comments/:commentId', updateTaskComment);
router.delete('/:id/comments/:commentId', deleteTaskComment);

// Subtasks
router.post('/:id/subtasks', requireManagerRole(), addSubtask);
router.put('/:id/subtasks/:subtaskId', requireManagerRole(), updateSubtask);
router.patch('/:id/subtasks/:subtaskId/complete', completeSubtask);
router.delete('/:id/subtasks/:subtaskId', requireManagerRole(), deleteSubtask);

// Custom Fields
router.post('/:id/custom-fields', requireManagerRole(), addTaskCustomField);
router.put('/:id/custom-fields/:key', requireManagerRole(), updateTaskCustomField);
router.delete('/:id/custom-fields/:key', requireManagerRole(), deleteTaskCustomField);

export default router;
