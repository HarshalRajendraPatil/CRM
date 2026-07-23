import express from 'express';
import {
  getProjectPayments,
  getPayment,
  createPayment,
  updatePayment,
  markPaymentAsCompleted,
  processRefund,
  deletePayment,
  getPaymentStats
} from '../controllers/paymentController.js';
import { authenticateToken, requireViewerRole, requireSupportExecutiveRole, requireManagerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== BASIC CRUD ROUTES ====================

/**
 * @route   GET /api/payments/project/:projectId
 * @desc    Get all payments for a project
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId', 
  requireViewerRole(),
  getProjectPayments
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get a single payment by ID
 * @access  Private (Project Member - Viewer)
 */
router.get('/:id', 
  requireViewerRole(),
  getPayment
);

/**
 * @route   POST /api/payments/project/:projectId
 * @desc    Create a new payment
 * @access  Private (Project Member - Support Executive)
 */
router.post('/project/:projectId', 
  requireSupportExecutiveRole(),
  createPayment
);

/**
 * @route   PUT /api/payments/:id
 * @desc    Update a payment
 * @access  Private (Project Member - Support Executive)
 */
router.put('/:id', 
  requireSupportExecutiveRole(),
  updatePayment
);

/**
 * @route   PATCH /api/payments/:id/complete
 * @desc    Mark payment as completed
 * @access  Private (Project Member - Support Executive)
 */
router.patch('/:id/complete', 
  requireSupportExecutiveRole(),
  markPaymentAsCompleted
);

/**
 * @route   PATCH /api/payments/:id/refund
 * @desc    Process refund for a payment
 * @access  Private (Project Member - Manager)
 */
router.patch('/:id/refund', 
  requireManagerRole(),
  processRefund
);

/**
 * @route   DELETE /api/payments/:id
 * @desc    Delete a payment
 * @access  Private (Project Member - Manager)
 */
router.delete('/:id', 
  requireManagerRole(),
  deletePayment
);

/**
 * @route   GET /api/payments/project/:projectId/stats
 * @desc    Get payment statistics for a project
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/stats', 
  requireViewerRole(),
  getPaymentStats
);

export default router;

