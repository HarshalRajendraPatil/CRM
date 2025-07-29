import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  getUserStats,
  getUserActivity
} from '../controllers/userController.js';
import { authenticateToken, requireGlobalRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes that require system-admin role
router.get('/stats', requireGlobalRole('system-admin'), getUserStats);
router.get('/', requireGlobalRole('system-admin'), getUsers);
router.post('/', requireGlobalRole('system-admin'), createUser);
router.get('/:id', requireGlobalRole('system-admin'), getUserById);
router.put('/:id', requireGlobalRole('system-admin'), updateUser);
router.delete('/:id', requireGlobalRole('system-admin'), deleteUser);
router.put('/:id/reset-password', requireGlobalRole('system-admin'), resetUserPassword);
router.put('/:id/toggle-status', requireGlobalRole('system-admin'), toggleUserStatus);
router.get('/:id/activity', requireGlobalRole('system-admin'), getUserActivity);

export default router; 