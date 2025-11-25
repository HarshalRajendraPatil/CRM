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
import { authenticateToken, requireManagerRole, requireSalesExecutiveRole, requireSupportExecutiveRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Main report generation endpoint
router.post('/:projectId/generate', requireManagerRole(), generateReport);

// Specific report endpoints
router.post('/:projectId/overview', requireManagerRole(), generateOverviewReport);
router.post('/:projectId/companies', requireSalesExecutiveRole(), generateCompaniesReport);
router.post('/:projectId/customers', requireSupportExecutiveRole(), generateCustomersReport);
router.post('/:projectId/deals', requireSupportExecutiveRole(), generateDealsReport);
router.post('/:projectId/leads', requireSalesExecutiveRole(), generateLeadsReport);
router.post('/:projectId/tasks', requireManagerRole(), generateTasksReport);
router.post('/:projectId/activities', requireManagerRole(), generateActivitiesReport);
router.post('/:projectId/performance', requireManagerRole(), generatePerformanceReport);
router.post('/:projectId/financial', requireManagerRole(), generateFinancialReport);

export default router;
