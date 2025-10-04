import express from 'express';
import {
  getSystemOverview,
  getAllUsers,
  getAllProjects,
  getSystemStats,
  getUserActivity,
  toggleUserStatus,
  deleteUser,
  getProjectDetails,
  deleteProject
} from '../controllers/systemAdminController.js';
import { authenticateToken, requireGlobalRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require system-admin role
router.use(authenticateToken);
router.use(requireGlobalRole('system-admin'));

// System overview and statistics
router.get('/overview', getSystemOverview);
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId/activity', getUserActivity);
router.patch('/users/:userId/status', toggleUserStatus);
router.delete('/users/:userId', deleteUser);

// Project management
router.get('/projects', getAllProjects);
router.get('/projects/:projectId', getProjectDetails);
router.delete('/projects/:projectId', deleteProject);

export default router;
