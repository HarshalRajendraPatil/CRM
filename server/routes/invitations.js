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
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();


// Protected routes
router.use(authenticateToken);
router.post('/', createInvitation);
router.get('/project/:projectId', getProjectInvitations);
router.get('/me', getUserInvitations);

// Public routes (with optional authentication)
router.get('/:token', optionalAuth, getInvitationByToken);

router.put('/:token/accept', acceptInvitation);
router.put('/:token/decline', declineInvitation);
router.put('/:id/resend', resendInvitation);
router.put('/:id/cancel', cancelInvitation);
router.delete('/:id', deleteInvitation);

export default router;