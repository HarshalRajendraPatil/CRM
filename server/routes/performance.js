import express from 'express';
import {
  getUserPerformance,
  getTeamPerformanceOverview,
  getPerformanceUsers,
  getPerformanceComparison
} from '../controllers/performanceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get individual user performance
router.get('/:projectId/user/:userId', getUserPerformance);

// Get team performance overview
router.get('/:projectId/team', getTeamPerformanceOverview);

// Get list of users for performance tracking
router.get('/:projectId/users', getPerformanceUsers);

// Get performance comparison
router.get('/:projectId/compare', getPerformanceComparison);

export default router;

