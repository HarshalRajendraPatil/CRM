import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getProjectActivities,
  createActivity,
  getActivityById,
  togglePinActivity,
  addReaction,
  removeReaction
} from '../controllers/activityController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/project/:projectId', getProjectActivities);
router.post('/', createActivity);
router.get('/:id', getActivityById);
router.put('/:id/pin', togglePinActivity);
router.post('/:id/reactions', addReaction);
router.delete('/:id/reactions', removeReaction);

export default router;


