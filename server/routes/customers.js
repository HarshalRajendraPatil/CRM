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
  updateCustomerNote,
  deleteCustomerNote,
  addCustomerInteraction,
  updateCustomerInteraction,
  deleteCustomerInteraction,
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
import { authenticateToken, requireViewerRole, requireSupportExecutiveRole, requireManagerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Customer CRUD operations
router.get('/project/:projectId', 
  requireViewerRole(),
  getProjectCustomers
);



// Bulk operations
router.patch('/bulk-update', 
  requireSupportExecutiveRole(),
  bulkUpdateCustomers
);

router.patch('/bulk-archive', 
  requireSupportExecutiveRole(),
  bulkArchiveCustomers
);

router.patch('/bulk-unarchive', 
  requireSupportExecutiveRole(),
  bulkUnarchiveCustomers
);

router.patch('/bulk-assign', 
  requireSupportExecutiveRole(),
  bulkAssignCustomers
);

router.patch('/bulk-update-stages', 
  requireSupportExecutiveRole(),
  bulkUpdateCustomerStages
);

router.patch('/bulk-update-priorities', 
  requireSupportExecutiveRole(),
  bulkUpdateCustomerPriorities
);

router.patch('/bulk-update-statuses', 
  requireSupportExecutiveRole(),
  bulkUpdateCustomerStatuses
);

router.delete('/bulk-delete', 
  requireSupportExecutiveRole(),
  bulkDeleteCustomers
);

router.get('/:id', 
  requireViewerRole(),
  getCustomer
);

router.post('/', 
  requireSupportExecutiveRole(),
  createCustomer
);

router.patch('/:id', 
  requireSupportExecutiveRole(),
  updateCustomer
);

router.delete('/:id', 
  requireSupportExecutiveRole(),
  archiveCustomer
);

router.delete('/:id/permanent', 
  requireSupportExecutiveRole(),
  deleteCustomer
);

router.patch('/:id/unarchive', 
  requireSupportExecutiveRole(),
  unarchiveCustomer
);

// Archived customers
router.get('/project/:projectId/archived', 
  requireSupportExecutiveRole(),
  getArchivedCustomers
);

// Customer notes and interactions
router.post('/:id/notes', 
  requireSupportExecutiveRole(),
  addCustomerNote
);

router.put('/:id/notes/:noteId', 
  requireSupportExecutiveRole(),
  updateCustomerNote
);

router.delete('/:id/notes/:noteId', 
  requireSupportExecutiveRole(),
  deleteCustomerNote
);

router.post('/:id/interactions', 
  requireSupportExecutiveRole(),
  addCustomerInteraction
);

router.put('/:id/interactions/:interactionId', 
  requireSupportExecutiveRole(),
  updateCustomerInteraction
);

router.delete('/:id/interactions/:interactionId', 
  requireSupportExecutiveRole(),
  deleteCustomerInteraction
);

// Lead conversion
router.post('/leads/:leadId/convert', 
  requireSupportExecutiveRole(),
  convertLeadToCustomer
);

// Statistics and analytics
router.get('/project/:projectId/stats', 
  requireViewerRole(),
  getCustomerStats
);

router.get('/project/:projectId/insights', 
  requireViewerRole(),
  getCustomerInsights
);

router.get('/project/:projectId/forecast', 
  requireViewerRole(),
  getCustomerForecast
);

// Export functionality
router.get('/project/:projectId/export', 
  requireViewerRole(),
  exportCustomers
);

// Deal-related endpoints
router.get('/:id/deals', 
  requireViewerRole(),
  getCustomerDeals
);

router.get('/:id/deals/stats', 
  requireViewerRole(),
  getCustomerDealStats
);

export default router;
