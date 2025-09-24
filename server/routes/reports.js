import express from 'express';
import {
  generateReport,
  generateOverviewReport,
  generateCompaniesReport,
  generateCustomersReport,
  generateDealsReport,
  generateLeadsReport,
  generateTasksReport,
  generateActivitiesReport,
  generatePerformanceReport,
  generateFinancialReport
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Main report generation endpoint
router.post('/:projectId/generate', generateReport);

// Specific report endpoints
router.post('/:projectId/overview', generateOverviewReport);
router.post('/:projectId/companies', generateCompaniesReport);
router.post('/:projectId/customers', generateCustomersReport);
router.post('/:projectId/deals', generateDealsReport);
router.post('/:projectId/leads', generateLeadsReport);
router.post('/:projectId/tasks', generateTasksReport);
router.post('/:projectId/activities', generateActivitiesReport);
router.post('/:projectId/performance', generatePerformanceReport);
router.post('/:projectId/financial', generateFinancialReport);

export default router;
