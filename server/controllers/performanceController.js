import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/errorHandler.js';
import { calculateUserPerformance, getTeamPerformance } from '../utils/performanceService.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import mongoose from 'mongoose';

/**
 * Get individual user performance
 * Access: Owner, Admin, Manager (for their team members)
 */
export const getUserPerformance = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { startDate, endDate } = req.query;
  const currentUser = req.user;

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Get target user
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  // Check permissions
  const userRole = currentUser.getProjectRole?.(projectId) || 
    (currentUser.ownedProjects?.includes(projectId) ? 'owner' : 
    currentUser.projectMembers?.find(m => m.project.toString() === projectId.toString())?.role);

  // Owner and Admin can view anyone
  // Manager can view sales_executive and support_executive
  // Users can only view themselves
  const targetUserRole = targetUser.getProjectRole?.(projectId) || 
    (targetUser.ownedProjects?.includes(projectId) ? 'owner' : 
    targetUser.projectMembers?.find(m => m.project.toString() === projectId.toString())?.role);

  if (userRole === 'owner' || userRole === 'admin') {
    // Owner and Admin can view anyone
  } else if (userRole === 'manager') {
    // Manager can view sales_executive, support_executive, and themselves
    if (targetUserRole !== 'sales_executive' && 
        targetUserRole !== 'support_executive' && 
        userId !== currentUser._id.toString()) {
      throw new ForbiddenError('You do not have permission to view this user\'s performance');
    }
  } else {
    // Others can only view themselves
    if (userId !== currentUser._id.toString()) {
      throw new ForbiddenError('You can only view your own performance');
    }
  }

  // Verify user is part of the project
  const isUserInProject = targetUser.ownedProjects?.includes(projectId) ||
    targetUser.projectMembers?.some(m => m.project.toString() === projectId.toString());

  if (!isUserInProject) {
    throw new ValidationError('User is not a member of this project');
  }

  // Calculate performance
  const dateRange = {};
  if (startDate) dateRange.startDate = startDate;
  if (endDate) dateRange.endDate = endDate;

  // Check if user role allows performance tracking
  // admin, owner, viewer don't have performance calculation, but can view others' performance
  let performance = null;
  if (targetUserRole === 'admin' || targetUserRole === 'owner' || targetUserRole === 'viewer') {
    // Return null performance for these roles
    performance = {
      userId,
      projectId,
      dateRange,
      userRole: targetUserRole,
      performanceScore: null,
      deals: null,
      tasks: null,
      customers: null,
      leads: null,
      companies: null,
      activities: null,
      events: null,
      summary: {
        totalTasks: 0,
        completionRate: 0,
      },
    };
  } else {
    performance = await calculateUserPerformance(userId, projectId, dateRange, targetUserRole);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        profileImage: targetUser.profileImage,
        role: targetUserRole
      },
      performance
    }
  });
});

/**
 * Get team performance overview
 * Access: Owner, Admin, Manager
 */
export const getTeamPerformanceOverview = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate } = req.query;
  const currentUser = req.user;

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const userRole = currentUser.getProjectRole?.(projectId) || 
    (currentUser.ownedProjects?.includes(projectId) ? 'owner' : 
    currentUser.projectMembers?.find(m => m.project.toString() === projectId.toString())?.role);

  if (userRole !== 'owner' && userRole !== 'admin' && userRole !== 'manager') {
    throw new ForbiddenError('You do not have permission to view team performance');
  }

  // Calculate team performance
  const dateRange = {};
  if (startDate) dateRange.startDate = startDate;
  if (endDate) dateRange.endDate = endDate;

  const teamPerformance = await getTeamPerformance(projectId, dateRange);

  res.json({
    success: true,
    data: teamPerformance
  });
});

/**
 * Get list of users for performance tracking
 * Access: Owner, Admin, Manager
 */
export const getPerformanceUsers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const currentUser = req.user;

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const userRole = currentUser.getProjectRole?.(projectId) || 
    (currentUser.ownedProjects?.includes(projectId) ? 'owner' : 
    currentUser.projectMembers?.find(m => m.project.toString() === projectId.toString())?.role);

  if (userRole !== 'owner' && userRole !== 'admin' && userRole !== 'manager') {
    throw new ForbiddenError('You do not have permission to view performance users');
  }

  // Get all project members
  const users = await User.find({
    $or: [
      { ownedProjects: projectId },
      { 'projectMembers.project': projectId }
    ],
    isActive: true
  }).select('name email profileImage ownedProjects projectMembers');

  // Filter and format users based on role
  const performanceUsers = users
    .map(user => {
      const role = user.ownedProjects?.includes(projectId) ? 'owner' : 
        user.projectMembers?.find(m => m.project.toString() === projectId.toString())?.role;

      // Owner and Admin can see all users
      // Manager can see sales_executive, support_executive, and themselves
      if (userRole === 'owner' || userRole === 'admin') {
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          role: role
        };
      } else if (userRole === 'manager') {
        if (role === 'sales_executive' || role === 'support_executive' || user._id.toString() === currentUser._id.toString()) {
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            role: role
          };
        }
      }
      return null;
    })
    .filter(user => user !== null);

  res.json({
    success: true,
    data: {
      users: performanceUsers
    }
  });
});

/**
 * Get performance comparison between users
 * Access: Owner, Admin, Manager
 */
export const getPerformanceComparison = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userIds, startDate, endDate } = req.query;
  const currentUser = req.user;

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const userRole = currentUser.getProjectRole?.(projectId) || 
    (currentUser.ownedProjects?.includes(projectId) ? 'owner' : 
    currentUser.projectMembers?.find(m => m.project.toString() === projectId.toString())?.role);

  if (userRole !== 'owner' && userRole !== 'admin' && userRole !== 'manager') {
    throw new ForbiddenError('You do not have permission to compare performance');
  }

  // Parse user IDs
  const userIdArray = userIds ? (Array.isArray(userIds) ? userIds : userIds.split(',')) : [];

  if (userIdArray.length === 0) {
    throw new ValidationError('At least one user ID is required');
  }

  // Calculate date range
  const dateRange = {};
  if (startDate) dateRange.startDate = startDate;
  if (endDate) dateRange.endDate = endDate;

  // Get performance for each user
  const comparisons = await Promise.all(
    userIdArray.map(async (userId) => {
      const user = await User.findById(userId);
      if (!user) return null;

      const role = user.ownedProjects?.includes(projectId) ? 'owner' : 
        user.projectMembers?.find(m => m.project.toString() === projectId.toString())?.role;

      // Skip performance calculation for admin, owner, viewer
      if (role === 'admin' || role === 'owner' || role === 'viewer') {
        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            role: role
          },
          performance: null,
          metrics: null
        };
      }

      const performance = await calculateUserPerformance(userId, projectId, dateRange, role);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          role: role
        },
        performance: performance.performanceScore,
        metrics: {
          deals: performance.deals,
          tasks: performance.tasks,
          customers: performance.customers,
          leads: performance.leads,
          companies: performance.companies
        }
      };
    })
  );

  res.json({
    success: true,
    data: {
      comparisons: comparisons.filter(c => c !== null),
      dateRange
    }
  });
});

