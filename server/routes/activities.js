import express from 'express';
import {
  getEntityActivities,
  getProjectActivities,
  getActivityStats,
  getActivityById,
  deleteActivity,
  bulkDeleteActivities
} from '../controllers/activityController.js';
import { authenticateToken, requireManagerRole, requireViewerRole } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Entity activity routes
router.get('/entity/:entityType/:entityId', requireViewerRole(), getEntityActivities);

// Project activity routes
router.get('/project/:projectId', requireViewerRole(), getProjectActivities);
router.get('/project/:projectId/stats', requireViewerRole(), getActivityStats);

// Activity management routes
router.get('/:id', requireViewerRole(), getActivityById);
router.delete('/:id', requireManagerRole(), deleteActivity);
router.delete('/bulk-delete', requireManagerRole(), bulkDeleteActivities);

export default router;
