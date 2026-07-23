import express from 'express';
import {
  getProjectInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  archiveInvoice,
  restoreInvoice,
  getInvoiceStats,
  markInvoiceAsSent
} from '../controllers/invoiceController.js';
import { authenticateToken, requireViewerRole, requireSupportExecutiveRole, requireManagerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== BASIC CRUD ROUTES ====================

/**
 * @route   GET /api/invoices/project/:projectId
 * @desc    Get all invoices for a project
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId', 
  requireViewerRole(),
  getProjectInvoices
);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get a single invoice by ID
 * @access  Private (Project Member - Viewer)
 */
router.get('/:id', 
  requireViewerRole(),
  getInvoice
);

/**
 * @route   POST /api/invoices/project/:projectId
 * @desc    Create a new invoice
 * @access  Private (Project Member - Support Executive)
 */
router.post('/project/:projectId', 
  requireSupportExecutiveRole(),
  createInvoice
);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update an invoice
 * @access  Private (Project Member - Support Executive)
 */
router.put('/:id', 
  requireSupportExecutiveRole(),
  updateInvoice
);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete an invoice
 * @access  Private (Project Member - Manager)
 */
router.delete('/:id', 
  requireManagerRole(),
  deleteInvoice
);

/**
 * @route   PATCH /api/invoices/:id/archive
 * @desc    Archive an invoice
 * @access  Private (Project Member - Manager)
 */
router.patch('/:id/archive', 
  requireManagerRole(),
  archiveInvoice
);

/**
 * @route   PATCH /api/invoices/:id/restore
 * @desc    Restore an archived invoice
 * @access  Private (Project Member - Manager)
 */
router.patch('/:id/restore', 
  requireManagerRole(),
  restoreInvoice
);

/**
 * @route   GET /api/invoices/project/:projectId/stats
 * @desc    Get invoice statistics for a project
 * @access  Private (Project Member - Viewer)
 */
router.get('/project/:projectId/stats', 
  requireViewerRole(),
  getInvoiceStats
);

/**
 * @route   PATCH /api/invoices/:id/send
 * @desc    Mark invoice as sent
 * @access  Private (Project Member - Support Executive)
 */
router.patch('/:id/send', 
  requireSupportExecutiveRole(),
  markInvoiceAsSent
);

export default router;

