import express from 'express';
import {
  getDashboardData,
  getDashboardWidgets,
  getDashboardCharts
} from '../controllers/dashboardController.js';
import { authenticateToken, requireViewerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Dashboard routes
router.get('/:projectId', requireViewerRole(), getDashboardData);
router.get('/:projectId/widgets', requireViewerRole(), getDashboardWidgets);
router.get('/:projectId/charts', requireViewerRole(), getDashboardCharts);

export default router;
