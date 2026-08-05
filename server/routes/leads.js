import express from 'express';
import {
  createLead,
  getProjectLeads,
  getArchivedLeads,
  getLeadById,
  updateLead,
  archiveLead,
  deleteLead,
  unarchiveLead,
  addLeadNote,
  updateLeadNote,
  deleteLeadNote,
  convertLead,
  updateLeadStatus,
  assignLeadToUser,
  getLeadStats,
  getLeadInsights,
  cleanupArchivedLeads,
  getLeadScoreHistory,
  recomputeLeadScore,
} from '../controllers/leadController.js';
import { authenticateToken, requireSalesExecutiveRole, requireManagerRole, requireAdminRole, requireViewerRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Collections
router.post('/',
  requireSalesExecutiveRole(),
  createLead
);

router.get('/project/:projectId',
  requireViewerRole(),
  getProjectLeads
);

router.get('/project/:projectId/archived',
  requireManagerRole(),
  getArchivedLeads
);

router.get('/project/:projectId/stats',
  requireViewerRole(),
  getLeadStats
);

router.get('/project/:projectId/insights',
  requireViewerRole(),
  getLeadInsights
);

// Single
router.get('/:id',
  requireViewerRole(),
  getLeadById
);

router.put('/:id',
  requireSalesExecutiveRole(),
  updateLead
);

router.delete('/:id',
  requireSalesExecutiveRole(),
  archiveLead
);

// Permanent deletion route (separate from archive)
router.delete('/:id/permanent',
  requireManagerRole(),
  deleteLead
);

router.patch('/:id/unarchive',
  requireManagerRole(),
  unarchiveLead
);

router.post('/:id/notes',
  requireSalesExecutiveRole(),
  addLeadNote
);

router.put('/:id/notes/:noteId',
  requireSalesExecutiveRole(),
  updateLeadNote
);

router.delete('/:id/notes/:noteId',
  requireSalesExecutiveRole(),
  deleteLeadNote
);

router.patch('/:id/status',
  requireSalesExecutiveRole(),
  updateLeadStatus
);

router.patch('/:id/assign',
  requireManagerRole(),
  assignLeadToUser
);

router.post('/:id/convert',
  requireSalesExecutiveRole(),
  convertLead
);

// Cleanup - Only admins and owners
router.post('/cleanup-archived',
  requireAdminRole(),
  cleanupArchivedLeads
);

// AI Scoring endpoints
router.get('/:id/score-history',
  requireViewerRole(),
  getLeadScoreHistory
);

router.post('/:id/recompute-score',
  requireManagerRole(),
  recomputeLeadScore
);

export default router;


