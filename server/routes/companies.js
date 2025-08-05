import express from 'express';
import { 
  createCompany, 
  getProjectCompanies, 
  getCompanyById, 
  updateCompany, 
  deleteCompany,
  addCompanyNote,
  getCompanyNotes,
  addCompanyTag,
  removeCompanyTag,
  addCustomField,
  removeCustomField,
  getCompanyStats
} from '../controllers/companyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Company routes
router.post('/', createCompany);
router.get('/project/:projectId', getProjectCompanies);
router.get('/project/:projectId/stats', getCompanyStats);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

// Company notes routes
router.post('/:id/notes', addCompanyNote);
router.get('/:id/notes', getCompanyNotes);

// Company tags routes
router.post('/:id/tags', addCompanyTag);
router.delete('/:id/tags/:tag', removeCompanyTag);

// Company custom fields routes
router.post('/:id/custom-fields', addCustomField);
router.delete('/:id/custom-fields/:key', removeCustomField);

export default router;