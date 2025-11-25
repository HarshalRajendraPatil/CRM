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
  addSubtask,
  updateSubtask,
  completeSubtask,
  deleteSubtask,
  bulkUpdateTasks,
  bulkDeleteTasks,
  bulkArchiveTasks,
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

// Entity-related tasks
router.get('/entity/:entityType/:entityId', requireViewerRole(), getTasksByEntity);

// Individual task routes
router.get('/:id', requireViewerRole(), getTask);
router.post('/', requireManagerRole(), createTask);
router.put('/:id', requireManagerRole(), updateTask);
router.delete('/:id', requireManagerRole(), deleteTask);

// Task status and assignment
router.patch('/:id/status', requireManagerRole(), updateTaskStatus);
router.patch('/:id/assign', requireManagerRole(), assignTask);

// Task archival
router.patch('/:id/archive', requireManagerRole(), archiveTask);
router.patch('/:id/restore', requireManagerRole(), restoreTask);

// Comments
router.post('/:id/comments', requireManagerRole(), addTaskComment);

// Subtasks
router.post('/:id/subtasks', requireManagerRole(), addSubtask);
router.put('/:id/subtasks/:subtaskId', requireManagerRole(), updateSubtask);
router.patch('/:id/subtasks/:subtaskId/complete', completeSubtask);
router.delete('/:id/subtasks/:subtaskId', requireManagerRole(), deleteSubtask);

// Bulk operations
router.patch('/bulk/update', requireManagerRole(), bulkUpdateTasks);
router.patch('/bulk/archive', requireManagerRole(), bulkArchiveTasks);
router.delete('/bulk/delete', requireManagerRole(), bulkDeleteTasks);

export default router;
