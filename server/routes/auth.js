import express from 'express';
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getMe,
  updateProfile,
  removeProfileImage,
  logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

// Protected routes
router.post('/resend-verification', authenticateToken, resendVerification);
router.post('/change-password', authenticateToken, changePassword);
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateProfile);
router.delete('/me/profile-image', authenticateToken, removeProfileImage);
router.post('/logout', authenticateToken, logout);

export default router; 