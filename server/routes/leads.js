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
  cleanupArchivedLeads,
  getLeadForecast
} from '../controllers/leadController.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  requireProjectAccess, 
  requirePermission, 
  requireAnyPermission,
  PERMISSIONS,
  ENTITIES
} from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticateToken);

// Collections
router.post('/', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.CREATE),
  createLead
);

router.get('/project/:projectId', 
  requireProjectAccess,
  requirePermission(ENTITIES.LEADS, PERMISSIONS.READ),
  getProjectLeads
);

router.get('/project/:projectId/archived', 
  requireProjectAccess,
  requirePermission(ENTITIES.LEADS, PERMISSIONS.READ),
  getArchivedLeads
);

router.get('/project/:projectId/stats', 
  requireProjectAccess,
  requirePermission(ENTITIES.LEADS, PERMISSIONS.READ),
  getLeadStats
);

router.get('/project/:projectId/insights', 
  requireProjectAccess,
  requirePermission(ENTITIES.LEADS, PERMISSIONS.READ),
  getLeadInsights
);

router.get('/project/:projectId/forecast', 
  requireProjectAccess,
  requirePermission(ENTITIES.LEADS, PERMISSIONS.READ),
  getLeadForecast
);

// Single
router.get('/:id', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.READ),
  getLeadById
);

router.put('/:id', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.UPDATE),
  updateLead
);

router.delete('/:id', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.ARCHIVE),
  archiveLead
);

router.patch('/:id/unarchive', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.UNARCHIVE),
  unarchiveLead
);

router.post('/:id/notes', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.UPDATE),
  addLeadNote
);

router.put('/:id/notes/:noteId', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.UPDATE),
  updateLeadNote
);

router.delete('/:id/notes/:noteId', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.UPDATE),
  deleteLeadNote
);

router.patch('/:id/status', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.UPDATE),
  updateLeadStatus
);

router.patch('/:id/assign', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.ASSIGN),
  assignLeadToUser
);

router.post('/:id/convert', 
  requirePermission(ENTITIES.LEADS, PERMISSIONS.CONVERT),
  convertLead
);

// Cleanup - Only admins and owners
router.post('/cleanup-archived', 
  requireAnyPermission([
    { entity: ENTITIES.LEADS, action: PERMISSIONS.DELETE }
  ]),
  cleanupArchivedLeads
);

export default router;


