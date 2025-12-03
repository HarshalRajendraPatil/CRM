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
import { authenticateToken, requireViewerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Main report generation endpoint
router.post('/:projectId/generate', requireViewerRole(), generateReport);

// Specific report endpoints
router.post('/:projectId/overview', requireViewerRole(), generateOverviewReport);
router.post('/:projectId/companies', requireViewerRole(), generateCompaniesReport);
router.post('/:projectId/customers', requireViewerRole(), generateCustomersReport);
router.post('/:projectId/deals', requireViewerRole(), generateDealsReport);
router.post('/:projectId/leads', requireViewerRole(), generateLeadsReport);
router.post('/:projectId/tasks', requireViewerRole(), generateTasksReport);
router.post('/:projectId/activities', requireViewerRole(), generateActivitiesReport);
router.post('/:projectId/performance', requireViewerRole(), generatePerformanceReport);
router.post('/:projectId/financial', requireViewerRole(), generateFinancialReport);

export default router;
