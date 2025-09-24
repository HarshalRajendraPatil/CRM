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

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Customer CRUD operations
router.get('/project/:projectId', getProjectCustomers);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', archiveCustomer);
router.delete('/:id/permanent', deleteCustomer);
router.patch('/:id/unarchive', unarchiveCustomer);

// Archived customers
router.get('/project/:projectId/archived', getArchivedCustomers);

// Customer notes and interactions
router.post('/:id/notes', addCustomerNote);
router.post('/:id/interactions', addCustomerInteraction);

// Lead conversion
router.post('/leads/:leadId/convert', convertLeadToCustomer);

// Statistics and analytics
router.get('/project/:projectId/stats', getCustomerStats);
router.get('/project/:projectId/insights', getCustomerInsights);
router.get('/project/:projectId/forecast', getCustomerForecast);

// Bulk operations
router.patch('/bulk-update', bulkUpdateCustomers);
router.patch('/bulk-archive', bulkArchiveCustomers);
router.patch('/bulk-unarchive', bulkUnarchiveCustomers);
router.patch('/bulk-assign', bulkAssignCustomers);
router.patch('/bulk-update-stages', bulkUpdateCustomerStages);
router.patch('/bulk-update-priorities', bulkUpdateCustomerPriorities);
router.patch('/bulk-update-statuses', bulkUpdateCustomerStatuses);
router.delete('/bulk-delete', bulkDeleteCustomers);

// Export functionality
router.get('/project/:projectId/export', exportCustomers);

// Deal-related endpoints
router.get('/:id/deals', getCustomerDeals);
router.get('/:id/deals/stats', getCustomerDealStats);

export default router;
