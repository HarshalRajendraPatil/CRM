import express from 'express';
import {
  getProjectReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  markReceiptAsSent,
  deleteReceipt,
  getReceiptStats
} from '../controllers/receiptController.js';
import { authenticateToken, requireViewerRole, requireSupportExecutiveRole, requireManagerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== BASIC CRUD ROUTES ====================

/**
 * @route   GET /api/receipts/project/:projectId
 * @desc    Get all receipts for a project
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId', 
  requireViewerRole(),
  getProjectReceipts
);

/**
 * @route   GET /api/receipts/:id
 * @desc    Get a single receipt by ID
 * @access  Private (Project Member - Viewer)
 */
router.get('/:id', 
  requireViewerRole(),
  getReceipt
);

/**
 * @route   POST /api/receipts/project/:projectId
 * @desc    Create a new receipt
 * @access  Private (Project Member - Support Executive)
 */
router.post('/project/:projectId', 
  requireSupportExecutiveRole(),
  createReceipt
);

/**
 * @route   PUT /api/receipts/:id
 * @desc    Update a receipt
 * @access  Private (Project Member - Support Executive)
 */
router.put('/:id', 
  requireSupportExecutiveRole(),
  updateReceipt
);

/**
 * @route   PATCH /api/receipts/:id/send
 * @desc    Mark receipt as sent
 * @access  Private (Project Member - Support Executive)
 */
router.patch('/:id/send', 
  requireSupportExecutiveRole(),
  markReceiptAsSent
);

/**
 * @route   DELETE /api/receipts/:id
 * @desc    Delete a receipt
 * @access  Private (Project Member - Manager)
 */
router.delete('/:id', 
  requireManagerRole(),
  deleteReceipt
);

/**
 * @route   GET /api/receipts/project/:projectId/stats
 * @desc    Get receipt statistics for a project
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/stats', 
  requireViewerRole(),
  getReceiptStats
);

export default router;

