import express from 'express';
import {
  getEntityActivities,
  getProjectActivities,
  getActivityStats,
  getActivityById,
  deleteActivity,
  bulkDeleteActivities
} from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Entity activity routes
router.get('/entity/:entityType/:entityId', getEntityActivities);

// Project activity routes
router.get('/project/:projectId', getProjectActivities);
router.get('/project/:projectId/stats', getActivityStats);

// Activity management routes
router.get('/:id', getActivityById);
router.delete('/:id', deleteActivity);
router.delete('/bulk-delete', bulkDeleteActivities);

export default router;
