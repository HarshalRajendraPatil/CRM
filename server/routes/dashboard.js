import express from 'express';
import {
  getDashboardData,
  getDashboardWidgets,
  getDashboardCharts
} from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Dashboard routes
router.get('/:projectId', getDashboardData);
router.get('/:projectId/widgets', getDashboardWidgets);
router.get('/:projectId/charts', getDashboardCharts);

export default router;
