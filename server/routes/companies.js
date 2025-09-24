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
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Company routes
router.post('/', createCompany);
router.get('/project/:projectId', getProjectCompanies);
router.get('/project/:projectId/stats', getCompanyStats);
router.get('/project/:projectId/insights', getCompanyInsights);
router.get('/project/:projectId/forecast', getCompanyForecast);
router.get('/:id', getCompanyById);
router.put('/bulk-update', bulkUpdateCompanies);
router.put('/:id', updateCompany);
router.delete('/bulk-delete', bulkDeleteCompanies);
router.delete('/:id', deleteCompany);

// Company notes routes
router.post('/:id/notes', addCompanyNote);
router.get('/:id/notes', getCompanyNotes);
router.put('/:id/notes/:noteId', updateCompanyNote);
router.delete('/:id/notes/:noteId', deleteCompanyNote);

// Company tags routes
router.post('/:id/tags', addCompanyTag);
router.delete('/:id/tags/:tag', removeCompanyTag);

// Company custom fields routes
router.post('/:id/custom-fields', addCustomField);
router.delete('/:id/custom-fields/:key', removeCustomField);

// Deal-related endpoints
router.get('/:id/deals', getCompanyDeals);
router.get('/:id/deals/stats', getCompanyDealStats);

export default router;