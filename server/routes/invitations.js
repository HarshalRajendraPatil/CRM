import express from 'express';
import {
  createInvitation,
  getProjectInvitations,
  getUserInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  resendInvitation,
  cancelInvitation,
  deleteInvitation
} from '../controllers/invitationController.js';
import { authenticateToken, optionalAuth, requireManagerRole, requireViewerRole } from '../middleware/auth.js';

const router = express.Router();


// Protected routes
router.use(authenticateToken);
router.post('/', requireManagerRole(), createInvitation);
router.get('/project/:projectId', requireViewerRole(), getProjectInvitations);
router.get('/me', getUserInvitations);

// Public routes (with optional authentication)
router.get('/:token', optionalAuth, getInvitationByToken);

router.put('/:token/accept', acceptInvitation);
router.put('/:token/decline', declineInvitation);
router.put('/:id/resend', requireManagerRole(), resendInvitation);
router.put('/:id/cancel', requireManagerRole(), cancelInvitation);
router.delete('/:id', requireManagerRole(), deleteInvitation);

export default router;