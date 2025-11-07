import express from 'express';
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectMember,
  removeProjectMember,
  transferProjectOwnership
} from '../controllers/projectController.js';

import {
  createPipeline,
  getProjectPipelines,
  getPipelineById,
  updatePipeline,
  deletePipeline,
  createStage,
  updateStage,
  deleteStage,
  reorderStages
} from '../controllers/pipelineController.js';

  import { authenticateToken, requireEmailVerification } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Project routes
router.post('/', requireEmailVerification, createProject);
router.get('/', getUserProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project member routes
router.put('/:id/members/:userId', updateProjectMember);
router.delete('/:id/members/:userId', removeProjectMember);
router.put('/:id/transfer-ownership', transferProjectOwnership);

// Pipeline routes
router.post('/:projectId/pipelines', createPipeline);
router.get('/:projectId/pipelines', getProjectPipelines);
router.get('/:projectId/pipelines/:pipelineId', getPipelineById);
router.put('/:projectId/pipelines/:pipelineId', updatePipeline);
router.delete('/:projectId/pipelines/:pipelineId', deletePipeline);

// Stage routes
router.post('/:projectId/pipelines/:pipelineId/stages', createStage);
router.put('/:projectId/pipelines/:pipelineId/stages/:stageId', updateStage);
router.delete('/:projectId/pipelines/:pipelineId/stages/:stageId', deleteStage);
router.put('/:projectId/pipelines/:pipelineId/reorder', reorderStages);

export default router;