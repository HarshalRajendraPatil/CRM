import express from 'express';
import {
  createContact,
  getProjectContacts,
  getCompanyContacts,
  getContactById,
  updateContact,
  deleteContact,
  addContactNote,
  getContactNotes,
  addContactTag,
  removeContactTag,
  addCustomField,
  removeCustomField,
  addSocialLink,
  removeSocialLink,
  updateContactStage,
  updateLeadScore,
  getContactStats,
  getContactInsights
} from '../controllers/contactController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Contact CRUD operations
router.post('/', createContact);
router.get('/project/:projectId', getProjectContacts);
router.get('/company/:companyId', getCompanyContacts);
router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

// Contact notes
router.post('/:id/notes', addContactNote);
router.get('/:id/notes', getContactNotes);

// Contact tags
router.post('/:id/tags', addContactTag);
router.delete('/:id/tags/:tag', removeContactTag);

// Contact custom fields
router.post('/:id/custom-fields', addCustomField);
router.delete('/:id/custom-fields/:key', removeCustomField);

// Contact social links
router.post('/:id/social-links', addSocialLink);
router.delete('/:id/social-links/:linkId', removeSocialLink);

// Contact stage and lead score management
router.put('/:id/stage', updateContactStage);
router.put('/:id/lead-score', updateLeadScore);

// Contact analytics and insights
router.get('/project/:projectId/stats', getContactStats);
router.get('/project/:projectId/insights', getContactInsights);

export default router;
