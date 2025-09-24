import express from 'express';
import {
  getCrmSettings,
  updateCrmSettings,
  updateSettingSection,
  resetSettings,
  getTimezones,
  getCurrencies
} from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get CRM settings
router.get('/project/:projectId', getCrmSettings);

// Update CRM settings
router.put('/project/:projectId', updateCrmSettings);

// Update specific setting section
router.put('/project/:projectId/:section', updateSettingSection);

// Reset settings to default
router.post('/project/:projectId/reset', resetSettings);

// Get available timezones
router.get('/timezones', getTimezones);

// Get available currencies
router.get('/currencies', getCurrencies);

export default router;
