import User  from '../models/User.model.js';
import Project  from '../models/Project.model.js';
import Invitation  from '../models/Invitation.model.js';
import Notification  from '../models/Notification.model.js';
import { ForbiddenError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

// Get system overview statistics
export const getSystemOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalInvitations,
      pendingInvitations,
      totalNotifications,
      recentUsers,
      recentProjects,
      userGrowth,
      projectGrowth
    ] = await Promise.all([
      // Total users count
      User.countDocuments(),
      
      // Active users (logged in within last 30 days)
      User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Total projects count
      Project.countDocuments(),
      
      // Active projects (created within last 30 days or have recent activity)
      Project.countDocuments({
        $or: [
          { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          { updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      }),
      
      // Total invitations count
      Invitation.countDocuments(),
      
      // Pending invitations count
      Invitation.countDocuments({ status: 'pending' }),
      
      // Total notifications count
      Notification.countDocuments(),
      
      // Recent users (last 10)
      User.find()
        .select('name email roleGlobal createdAt lastLogin isActive')
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Recent projects (last 10)
      Project.find()
        .select('name description owner members createdAt updatedAt visibility')
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      
      // User growth over last 6 months
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Project growth over last 6 months
      Project.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Calculate growth rates
    const userGrowthRate = userGrowth.length > 1 
      ? ((userGrowth[userGrowth.length - 1]?.count || 0) - (userGrowth[userGrowth.length - 2]?.count || 0)) / (userGrowth[userGrowth.length - 2]?.count || 1) * 100
      : 0;
    
    const projectGrowthRate = projectGrowth.length > 1 
      ? ((projectGrowth[projectGrowth.length - 1]?.count || 0) - (projectGrowth[projectGrowth.length - 2]?.count || 0)) / (projectGrowth[projectGrowth.length - 2]?.count || 1) * 100
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalProjects,
          activeProjects,
          totalInvitations,
          pendingInvitations,
          totalNotifications,
          userGrowthRate: Math.round(userGrowthRate * 100) / 100,
          projectGrowthRate: Math.round(projectGrowthRate * 100) / 100
        },
        recentUsers,
        recentProjects,
        userGrowth,
        projectGrowth
      }
    });
  } catch (error) {
    console.error('Error fetching system overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system overview',
      error: error.message
    });
  }
};

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.roleGlobal = role;
    }
    
    if (status) {
      filter.isActive = status === 'active';
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('name email roleGlobal isActive createdAt lastLogin profileImage')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          hasNext: skip + users.length < totalUsers,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get all projects with pagination and filtering
export const getAllProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      visibility = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    if (visibility) {
      filter.visibility = visibility;
    }

    const [projects, totalProjects] = await Promise.all([
      Project.find(filter)
        .select('name description owner members createdAt updatedAt visibility')
        .populate('owner', 'name email')
        .populate('members.user', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProjects / parseInt(limit)),
          totalProjects,
          hasNext: skip + projects.length < totalProjects,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const [
      userStats,
      projectStats,
      invitationStats,
      notificationStats
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: [
                  { $gte: ['$lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            },
            verifiedUsers: {
              $sum: {
                $cond: ['$isEmailVerified', 1, 0]
              }
            }
          }
        }
      ]),
      
      // Project statistics
      Project.aggregate([
        {
          $group: {
            _id: null,
            totalProjects: { $sum: 1 },
            publicProjects: {
              $sum: {
                $cond: [{ $eq: ['$visibility', 'public'] }, 1, 0]
              }
            },
            privateProjects: {
              $sum: {
                $cond: [{ $eq: ['$visibility', 'private'] }, 1, 0]
              }
            }
          }
        }
      ]),
      
      // Invitation statistics
      Invitation.aggregate([
        {
          $group: {
            _id: null,
            totalInvitations: { $sum: 1 },
            pendingInvitations: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
              }
            },
            acceptedInvitations: {
              $sum: {
                $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
              }
            }
          }
        }
      ]),
      
      // Notification statistics
      Notification.aggregate([
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            unreadNotifications: {
              $sum: {
                $cond: [{ $eq: ['$isRead', false] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        users: userStats[0] || { totalUsers: 0, activeUsers: 0, verifiedUsers: 0 },
        projects: projectStats[0] || { totalProjects: 0, publicProjects: 0, privateProjects: 0 },
        invitations: invitationStats[0] || { totalInvitations: 0, pendingInvitations: 0, acceptedInvitations: 0 },
        notifications: notificationStats[0] || { totalNotifications: 0, unreadNotifications: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics',
      error: error.message
    });
  }
};

// Get user activity logs
export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user's recent activity from notifications
    const [activities, totalActivities] = await Promise.all([
      Notification.find({ recipient: userId })
        .select('title message type createdAt isRead')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments({ recipient: userId })
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalActivities / parseInt(limit)),
          totalActivities,
          hasNext: skip + activities.length < totalActivities,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
};

// Toggle user status (activate/deactivate)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('name email isActive roleGlobal');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
};

// Delete user (system admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of other system admins
    if (user.roleGlobal === 'system-admin' && user._id.toString() !== req.user.id) {
      throw new ForbiddenError('Cannot delete other system administrators');
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Project.deleteMany({ owner: userId }),
      Invitation.deleteMany({ email: user.email }),
      Notification.deleteMany({ recipient: userId })
    ]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete user',
      error: error.message
    });
  }
};

// Get project details for admin
export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('owner', 'name email roleGlobal')
      .populate('members.user', 'name email roleGlobal isActive')
      .select('name description owner members createdAt updatedAt visibility');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project details',
      error: error.message
    });
  }
};

// Delete project (system admin only)
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete project and related data
    await Promise.all([
      Project.findByIdAndDelete(projectId),
      // Add other related model deletions as needed
    ]);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};
