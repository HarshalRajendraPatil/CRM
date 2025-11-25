import express from 'express';
import {
  createCompany,
  getProjectCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  addCompanyNote,
  getCompanyNotes,
  updateCompanyNote,
  deleteCompanyNote,
  addCompanyTag,
  removeCompanyTag,
  addCustomField,
  removeCustomField,
  getCompanyStats,
  getCompanyInsights,
  bulkUpdateCompanies,
  bulkDeleteCompanies,
  getCompanyDeals,
  getCompanyDealStats,
  getCompanyForecast
} from '../controllers/companyController.js';
import { authenticateToken, requireSalesExecutiveRole, requireViewerRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Company routes
router.post('/:projectId', 
  requireSalesExecutiveRole(),
  createCompany
);

router.get('/project/:projectId', 
  requireViewerRole(),
  getProjectCompanies
);

router.get('/project/:projectId/stats', 
  requireViewerRole(),
  getCompanyStats
);

router.get('/project/:projectId/insights', 
  requireViewerRole(),
  getCompanyInsights
);

router.get('/project/:projectId/forecast', 
  requireViewerRole(),
  getCompanyForecast
);

router.get('/:id',
  requireViewerRole(),
  getCompanyById
);

router.put('/bulk-update', 
  requireSalesExecutiveRole(),
  bulkUpdateCompanies
);

router.put('/:id',
  requireSalesExecutiveRole(),
  updateCompany
);

router.delete('/bulk-delete', 
  requireSalesExecutiveRole(),
  bulkDeleteCompanies
);

router.delete('/:id', 
  requireSalesExecutiveRole(),
  deleteCompany
);

// Company notes routes
router.post('/:id/notes',
  requireSalesExecutiveRole(),
  addCompanyNote
);

router.get('/:id/notes',
  requireViewerRole(),
  getCompanyNotes
);

router.put('/:id/notes/:noteId',
  requireSalesExecutiveRole(),
  updateCompanyNote
);

router.delete('/:id/notes/:noteId',
  requireSalesExecutiveRole(),
  deleteCompanyNote
);

// Company tags routes
router.post('/:id/tags',
  requireSalesExecutiveRole(),
  addCompanyTag
);

router.delete('/:id/tags/:tag',
  requireSalesExecutiveRole(),
  removeCompanyTag
);

// Company custom fields routes
router.post('/:id/custom-fields',
  requireSalesExecutiveRole(),
  addCustomField
);

router.delete('/:id/custom-fields/:key',
  requireSalesExecutiveRole(),
  removeCustomField
);

// Deal-related endpoints
router.get('/:id/deals',
  requireViewerRole(),
  getCompanyDeals
);

router.get('/:id/deals/stats',
  requireViewerRole(),
  getCompanyDealStats
);

export default router;