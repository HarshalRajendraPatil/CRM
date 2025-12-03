import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import invitationRoutes from './routes/invitations.js';
import notificationRoutes from './routes/notifications.js';
import companyRoutes from './routes/companies.js';
import leadRoutes from './routes/leads.js';
import customerRoutes from './routes/customers.js';
import dealRoutes from './routes/deals.js';
import taskRoutes from './routes/tasks.js';
import calendarRoutes from './routes/calendar.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import systemAdminRoutes from './routes/systemAdmin.js';
import activityRoutes from './routes/activities.js';
import performanceRoutes from './routes/performance.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import { initSocketServer } from './utils/socketService.js';
import { injectSettings, validateBusinessRules, applyDefaultValues, checkNotificationSettings } from './middleware/settingsMiddleware.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocketServer(server);

// Connect to database
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRM Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes with settings middleware
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/notifications', checkNotificationSettings, notificationRoutes);
app.use('/api/companies', injectSettings, applyDefaultValues, companyRoutes);
app.use('/api/leads', injectSettings, applyDefaultValues, validateBusinessRules, leadRoutes);
app.use('/api/customers', injectSettings, applyDefaultValues, customerRoutes);
app.use('/api/deals', injectSettings, applyDefaultValues, dealRoutes);
app.use('/api/tasks', injectSettings, applyDefaultValues, taskRoutes);
app.use('/api/calendar', injectSettings, applyDefaultValues, validateBusinessRules, calendarRoutes);
app.use('/api/reports', injectSettings, reportRoutes);
app.use('/api/dashboard', injectSettings, dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/system-admin', systemAdminRoutes);
app.use('/api/activities', injectSettings, activityRoutes);
app.use('/api/performance', injectSettings, performanceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CRM Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app; 