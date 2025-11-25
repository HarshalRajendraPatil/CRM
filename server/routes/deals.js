import express from 'express';
import {
  // Basic CRUD operations
  getProjectDeals,
  getArchivedDeals,
  getDeal,
  createDeal,
  updateDeal,
  archiveDeal,
  deleteDeal,
  restoreDeal,
  
  // Deal activities
  addDealActivity,
  getDealActivities,
  
  // Deal notes
  addDealNote,
  updateDealNote,
  deleteDealNote,
  
  
  // Bulk operations
  bulkUpdateDeals,
  bulkArchiveDeals,
  bulkDeleteDeals,
  bulkAssignDeals,
  
  // Status management
  updateDealStatus,
  
  // Statistics and analytics
  getDealStats,
  getDealVelocity,
  getDealForecast,
  getDealInsights,
  
  // Export
  exportDeals
} from '../controllers/dealController.js';
import { authenticateToken, requireManagerRole, requireViewerRole, requireSupportExecutiveRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== BASIC CRUD ROUTES ====================

/**
 * @route   GET /api/deals/project/:projectId
 * @desc    Get all deals for a project with filtering and pagination
 * @access  Private (Project Member)
 */
router.get('/project/:projectId', 
  requireViewerRole(),
  getProjectDeals
);

/**
 * @route   GET /api/deals/project/:projectId/archived
 * @desc    Get archived deals for a project
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/archived', 
  requireManagerRole(),
  getArchivedDeals
);

/**
 * @route   GET /api/deals/:id
 * @desc    Get a single deal by ID
 * @access  Private (Project Member)
 */
router.get('/:id', 
  requireViewerRole(),
  getDeal
);

/**
 * @route   POST /api/deals/project/:projectId
 * @desc    Create a new deal
 * @access  Private (Project Member)
 */
router.post('/project/:projectId', 
  requireSupportExecutiveRole(),
  createDeal
);

/**
 * @route   PUT /api/deals/:id
 * @desc    Update a deal
 * @access  Private (Project Member)
 */
router.put('/:id', 
  requireSupportExecutiveRole(),
  updateDeal
);

/**
 * @route   PATCH /api/deals/:id/archive
 * @desc    Archive a deal
 * @access  Private (Project Member)
 */
router.patch('/:id/archive', 
  requireManagerRole(),
  archiveDeal
);

/**
 * @route   DELETE /api/deals/:id
 * @desc    Delete a deal permanently
 * @access  Private (Project Member)
 */
router.delete('/:id', 
  requireSupportExecutiveRole(),
  deleteDeal
);

/**
 * @route   PATCH /api/deals/:id/restore
 * @desc    Restore an archived deal
 * @access  Private (Project Member)
 */
router.patch('/:id/restore', 
  requireManagerRole(),
  restoreDeal
);

// ==================== DEAL ACTIVITIES ROUTES ====================

/**
 * @route   POST /api/deals/:id/activities
 * @desc    Add activity to a deal
 * @access  Private (Project Member)
 */
router.post('/:id/activities', 
  requireManagerRole(),
  addDealActivity
);

/**
 * @route   GET /api/deals/:id/activities
 * @desc    Get deal activities
 * @access  Private (Project Member)
 */
router.get('/:id/activities', 
  requireViewerRole(),
  getDealActivities
);

// ==================== DEAL NOTES ROUTES ====================

/**
 * @route   POST /api/deals/:id/notes
 * @desc    Add note to a deal
 * @access  Private (Project Member)
 */
router.post('/:id/notes', 
  requireSupportExecutiveRole(),
  addDealNote
);

/**
 * @route   PUT /api/deals/:id/notes/:noteId
 * @desc    Update a deal note
 * @access  Private (Project Member)
 */
router.put('/:id/notes/:noteId', 
  requireSupportExecutiveRole(),
  updateDealNote
);

/**
 * @route   DELETE /api/deals/:id/notes/:noteId
 * @desc    Delete a deal note
 * @access  Private (Project Member)
 */
router.delete('/:id/notes/:noteId', 
  requireSupportExecutiveRole(),
  deleteDealNote
);


// ==================== BULK OPERATIONS ROUTES ====================

/**
 * @route   PATCH /api/deals/project/:projectId/bulk-update
 * @desc    Bulk update multiple deals
 * @access  Private (Project Member)
 */
router.patch('/project/:projectId/bulk-update', 
  requireSupportExecutiveRole(),
  bulkUpdateDeals
);

/**
 * @route   PATCH /api/deals/project/:projectId/bulk-archive
 * @desc    Bulk archive multiple deals
 * @access  Private (Project Member)
 */
router.patch('/project/:projectId/bulk-archive', 
  requireManagerRole(),
  bulkArchiveDeals
);

/**
 * @route   DELETE /api/deals/project/:projectId/bulk-delete
 * @desc    Bulk delete multiple deals permanently
 * @access  Private (Project Member)
 */
router.delete('/project/:projectId/bulk-delete', 
  requireManagerRole(),
  bulkDeleteDeals
);

/**
 * @route   PATCH /api/deals/project/:projectId/bulk-assign
 * @desc    Bulk assign deals to a user
 * @access  Private (Project Member)
 */
router.patch('/project/:projectId/bulk-assign', 
  requireManagerRole(),
  bulkAssignDeals
);

// ==================== STATUS MANAGEMENT ROUTES ====================

/**
 * @route   PATCH /api/deals/:id/status
 * @desc    Update deal status
 * @access  Private (Project Member)
 */
router.patch('/:id/status', 
  requireManagerRole(),
  updateDealStatus
);

// ==================== STATISTICS AND ANALYTICS ROUTES ====================

/**
 * @route   GET /api/deals/project/:projectId/stats
 * @desc    Get comprehensive deal statistics
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/stats', 
  requireViewerRole(),
  getDealStats
);


/**
 * @route   GET /api/deals/project/:projectId/velocity
 * @desc    Get deal velocity analysis
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/velocity', 
  requireViewerRole(),
  getDealVelocity
);

/**
 * @route   GET /api/deals/project/:projectId/forecast
 * @desc    Get deal forecasting and predictions
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/forecast', 
  requireViewerRole(),
  getDealForecast
);

/**
 * @route   GET /api/deals/project/:projectId/insights
 * @desc    Get deal insights and recommendations
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/insights', 
  requireViewerRole(),
  getDealInsights
);

// ==================== EXPORT ROUTES ====================

/**
 * @route   GET /api/deals/project/:projectId/export
 * @desc    Export deals to CSV/JSON
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/export', 
  requireViewerRole(),
  exportDeals
);

export default router;
