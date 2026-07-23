import express from 'express';
import {
  getFinancialOverview,
  getRevenueByDate,
  getOutstandingReceivables,
  getPaymentMethodAnalytics,
  getCustomerFinancialProfile,
  getOverdueInvoices
} from '../controllers/financialController.js';
import { authenticateToken, requireViewerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/financial/project/:projectId/overview
 * @desc    Get financial overview for a project
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/overview', 
  requireViewerRole(),
  getFinancialOverview
);

/**
 * @route   GET /api/financial/project/:projectId/revenue
 * @desc    Get revenue by payment date (cash basis)
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/revenue', 
  requireViewerRole(),
  getRevenueByDate
);

/**
 * @route   GET /api/financial/project/:projectId/receivables
 * @desc    Get outstanding receivables
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/receivables', 
  requireViewerRole(),
  getOutstandingReceivables
);

/**
 * @route   GET /api/financial/project/:projectId/payment-methods
 * @desc    Get payment method analytics
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/payment-methods', 
  requireViewerRole(),
  getPaymentMethodAnalytics
);

/**
 * @route   GET /api/financial/project/:projectId/customer/:customerId
 * @desc    Get customer financial profile
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/customer/:customerId', 
  requireViewerRole(),
  getCustomerFinancialProfile
);

/**
 * @route   GET /api/financial/project/:projectId/overdue
 * @desc    Get overdue invoices
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/overdue', 
  requireViewerRole(),
  getOverdueInvoices
);

export default router;

