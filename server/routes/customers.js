import express from 'express';
import {
  getProjectCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  unarchiveCustomer,
  getArchivedCustomers,
  addCustomerNote,
  addCustomerInteraction,
  convertLeadToCustomer,
  getCustomerStats,
  getCustomerInsights,
  getCustomerForecast,
  bulkUpdateCustomers,
  bulkArchiveCustomers,
  bulkUnarchiveCustomers,
  bulkAssignCustomers,
  bulkUpdateCustomerStages,
  bulkUpdateCustomerPriorities,
  bulkUpdateCustomerStatuses,
  deleteCustomer,
  bulkDeleteCustomers,
  exportCustomers,
  getCustomerDeals,
  getCustomerDealStats
} from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  requireProjectAccess, 
  requirePermission, 
  requireAnyPermission,
  PERMISSIONS,
  ENTITIES
} from '../middleware/rbac.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Customer CRUD operations
router.get('/project/:projectId', 
  requireProjectAccess,
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.READ),
  getProjectCustomers
);

router.get('/:id', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.READ),
  getCustomer
);

router.post('/', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.CREATE),
  createCustomer
);

router.patch('/:id', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.UPDATE),
  updateCustomer
);

router.delete('/:id', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.ARCHIVE),
  archiveCustomer
);

router.delete('/:id/permanent', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.DELETE),
  deleteCustomer
);

router.patch('/:id/unarchive', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.UNARCHIVE),
  unarchiveCustomer
);

// Archived customers
router.get('/project/:projectId/archived', 
  requireProjectAccess,
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.READ),
  getArchivedCustomers
);

// Customer notes and interactions
router.post('/:id/notes', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.UPDATE),
  addCustomerNote
);

router.post('/:id/interactions', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.UPDATE),
  addCustomerInteraction
);

// Lead conversion
router.post('/leads/:leadId/convert', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.CREATE),
  convertLeadToCustomer
);

// Statistics and analytics
router.get('/project/:projectId/stats', 
  requireProjectAccess,
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.READ),
  getCustomerStats
);

router.get('/project/:projectId/insights', 
  requireProjectAccess,
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.READ),
  getCustomerInsights
);

router.get('/project/:projectId/forecast', 
  requireProjectAccess,
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.READ),
  getCustomerForecast
);

// Bulk operations
router.patch('/bulk-update', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.BULK_OPERATIONS),
  bulkUpdateCustomers
);

router.patch('/bulk-archive', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.BULK_OPERATIONS),
  bulkArchiveCustomers
);

router.patch('/bulk-unarchive', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.BULK_OPERATIONS),
  bulkUnarchiveCustomers
);

router.patch('/bulk-assign', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.BULK_OPERATIONS),
  bulkAssignCustomers
);

router.patch('/bulk-update-stages', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.BULK_OPERATIONS),
  bulkUpdateCustomerStages
);

router.patch('/bulk-update-priorities', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.BULK_OPERATIONS),
  bulkUpdateCustomerPriorities
);

router.patch('/bulk-update-statuses', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.BULK_OPERATIONS),
  bulkUpdateCustomerStatuses
);

router.delete('/bulk-delete', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.BULK_OPERATIONS),
  bulkDeleteCustomers
);

// Export functionality
router.get('/project/:projectId/export', 
  requireProjectAccess,
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.EXPORT),
  exportCustomers
);

// Deal-related endpoints
router.get('/:id/deals', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.READ),
  getCustomerDeals
);

router.get('/:id/deals/stats', 
  requirePermission(ENTITIES.CUSTOMERS, PERMISSIONS.READ),
  getCustomerDealStats
);

export default router;
