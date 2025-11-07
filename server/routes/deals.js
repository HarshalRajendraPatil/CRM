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
import { authenticateToken } from '../middleware/auth.js';
import { 
  requireProjectAccess, 
  requirePermission, 
  requireAnyPermission,
  PERMISSIONS,
  ENTITIES
} from '../middleware/rbac.js';

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
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.READ),
  getProjectDeals
);

/**
 * @route   GET /api/deals/project/:projectId/archived
 * @desc    Get archived deals for a project
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/archived', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.READ),
  getArchivedDeals
);

/**
 * @route   GET /api/deals/:id
 * @desc    Get a single deal by ID
 * @access  Private (Project Member)
 */
router.get('/:id', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.READ),
  getDeal
);

/**
 * @route   POST /api/deals/project/:projectId
 * @desc    Create a new deal
 * @access  Private (Project Member)
 */
router.post('/project/:projectId', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.CREATE),
  createDeal
);

/**
 * @route   PUT /api/deals/:id
 * @desc    Update a deal
 * @access  Private (Project Member)
 */
router.put('/:id', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.UPDATE),
  updateDeal
);

/**
 * @route   PATCH /api/deals/:id/archive
 * @desc    Archive a deal
 * @access  Private (Project Member)
 */
router.patch('/:id/archive', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.ARCHIVE),
  archiveDeal
);

/**
 * @route   DELETE /api/deals/:id
 * @desc    Delete a deal permanently
 * @access  Private (Project Member)
 */
router.delete('/:id', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.DELETE),
  deleteDeal
);

/**
 * @route   PATCH /api/deals/:id/restore
 * @desc    Restore an archived deal
 * @access  Private (Project Member)
 */
router.patch('/:id/restore', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.UNARCHIVE),
  restoreDeal
);

// ==================== DEAL ACTIVITIES ROUTES ====================

/**
 * @route   POST /api/deals/:id/activities
 * @desc    Add activity to a deal
 * @access  Private (Project Member)
 */
router.post('/:id/activities', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.UPDATE),
  addDealActivity
);

/**
 * @route   GET /api/deals/:id/activities
 * @desc    Get deal activities
 * @access  Private (Project Member)
 */
router.get('/:id/activities', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.READ),
  getDealActivities
);

// ==================== DEAL NOTES ROUTES ====================

/**
 * @route   POST /api/deals/:id/notes
 * @desc    Add note to a deal
 * @access  Private (Project Member)
 */
router.post('/:id/notes', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.UPDATE),
  addDealNote
);

/**
 * @route   PUT /api/deals/:id/notes/:noteId
 * @desc    Update a deal note
 * @access  Private (Project Member)
 */
router.put('/:id/notes/:noteId', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.UPDATE),
  updateDealNote
);

/**
 * @route   DELETE /api/deals/:id/notes/:noteId
 * @desc    Delete a deal note
 * @access  Private (Project Member)
 */
router.delete('/:id/notes/:noteId', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.UPDATE),
  deleteDealNote
);


// ==================== BULK OPERATIONS ROUTES ====================

/**
 * @route   PATCH /api/deals/project/:projectId/bulk-update
 * @desc    Bulk update multiple deals
 * @access  Private (Project Member)
 */
router.patch('/project/:projectId/bulk-update', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.BULK_OPERATIONS),
  bulkUpdateDeals
);

/**
 * @route   PATCH /api/deals/project/:projectId/bulk-archive
 * @desc    Bulk archive multiple deals
 * @access  Private (Project Member)
 */
router.patch('/project/:projectId/bulk-archive', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.BULK_OPERATIONS),
  bulkArchiveDeals
);

/**
 * @route   DELETE /api/deals/project/:projectId/bulk-delete
 * @desc    Bulk delete multiple deals permanently
 * @access  Private (Project Member)
 */
router.delete('/project/:projectId/bulk-delete', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.BULK_OPERATIONS),
  bulkDeleteDeals
);

/**
 * @route   PATCH /api/deals/project/:projectId/bulk-assign
 * @desc    Bulk assign deals to a user
 * @access  Private (Project Member)
 */
router.patch('/project/:projectId/bulk-assign', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.BULK_OPERATIONS),
  bulkAssignDeals
);

// ==================== STATUS MANAGEMENT ROUTES ====================

/**
 * @route   PATCH /api/deals/:id/status
 * @desc    Update deal status
 * @access  Private (Project Member)
 */
router.patch('/:id/status', 
  requirePermission(ENTITIES.DEALS, PERMISSIONS.UPDATE),
  updateDealStatus
);

// ==================== STATISTICS AND ANALYTICS ROUTES ====================

/**
 * @route   GET /api/deals/project/:projectId/stats
 * @desc    Get comprehensive deal statistics
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/stats', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.READ),
  getDealStats
);


/**
 * @route   GET /api/deals/project/:projectId/velocity
 * @desc    Get deal velocity analysis
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/velocity', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.READ),
  getDealVelocity
);

/**
 * @route   GET /api/deals/project/:projectId/forecast
 * @desc    Get deal forecasting and predictions
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/forecast', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.READ),
  getDealForecast
);

/**
 * @route   GET /api/deals/project/:projectId/insights
 * @desc    Get deal insights and recommendations
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/insights', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.READ),
  getDealInsights
);

// ==================== EXPORT ROUTES ====================

/**
 * @route   GET /api/deals/project/:projectId/export
 * @desc    Export deals to CSV/JSON
 * @access  Private (Project Member)
 */
router.get('/project/:projectId/export', 
  requireProjectAccess,
  requirePermission(ENTITIES.DEALS, PERMISSIONS.EXPORT),
  exportDeals
);

export default router;
