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
import { authenticateToken, requireTenantRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Project tasks routes
router.get('/project/:projectId', getProjectTasks);
router.get('/project/:projectId/stats', getTaskStats);
router.get('/project/:projectId/insights', getTaskInsights);
router.get('/project/:projectId/overdue', getOverdueTasks);
router.get('/project/:projectId/export', exportTasks);

// User tasks routes
router.get('/user/:userId', getUserTasks);

// Entity-related tasks
router.get('/entity/:entityType/:entityId', getTasksByEntity);

// Individual task routes
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Task status and assignment
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/assign', assignTask);

// Task archival
router.patch('/:id/archive', archiveTask);
router.patch('/:id/restore', restoreTask);

// Comments
router.post('/:id/comments', addTaskComment);

// Subtasks
router.post('/:id/subtasks', addSubtask);
router.put('/:id/subtasks/:subtaskId', updateSubtask);
router.patch('/:id/subtasks/:subtaskId/complete', completeSubtask);
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

// Bulk operations
router.patch('/bulk/update', bulkUpdateTasks);
router.patch('/bulk/archive', bulkArchiveTasks);
router.delete('/bulk/delete', bulkDeleteTasks);

export default router;
