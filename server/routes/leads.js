import express from 'express';
import {
  createLead,
  getProjectLeads,
  getArchivedLeads,
  getLeadById,
  updateLead,
  archiveLead,
  unarchiveLead,
  addLeadNote,
  updateLeadNote,
  deleteLeadNote,
  convertLead,
  updateLeadStatus,
  assignLeadToUser,
  getLeadStats,
  getLeadInsights,
  cleanupArchivedLeads
} from '../controllers/leadController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Collections
router.post('/', createLead);
router.get('/project/:projectId', getProjectLeads);
router.get('/project/:projectId/archived', getArchivedLeads);
router.get('/project/:projectId/stats', getLeadStats);
router.get('/project/:projectId/insights', getLeadInsights);

// Single
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', archiveLead);
router.patch('/:id/unarchive', unarchiveLead);
router.post('/:id/notes', addLeadNote);
router.put('/:id/notes/:noteId', updateLeadNote);
router.delete('/:id/notes/:noteId', deleteLeadNote);
router.patch('/:id/status', updateLeadStatus);
router.patch('/:id/assign', assignLeadToUser);
router.post('/:id/convert', convertLead);

// Cleanup
router.post('/cleanup-archived', cleanupArchivedLeads);

export default router;


