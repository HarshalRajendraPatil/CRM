import express from 'express';
import { 
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createNotification
} from '../controllers/notificationController.js';
import { authenticateToken, requireGlobalRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get notifications for current user with pagination and filters
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Get notification by ID
router.get('/:id', getNotificationById);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read (with optional filters)
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Delete all notifications (with optional filters)
router.delete('/', deleteAllNotifications);

// Create notification (admin only)
router.post('/', requireGlobalRole('system-admin'), createNotification);

export default router;