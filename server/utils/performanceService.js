import mongoose from 'mongoose';
import Deal from '../models/Deal.model.js';
import Task from '../models/Task.model.js';
import Customer from '../models/Customer.model.js';
import Lead from '../models/Lead.model.js';
import Company from '../models/Company.model.js';
import Activity from '../models/Activity.model.js';
import CalendarEvent from '../models/CalendarEvent.model.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';

/**
 * Calculate comprehensive performance metrics for a user
 */
export const calculateUserPerformance = async (userId, projectId, dateRange = {}) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  
  // Build date filter
  const dateFilter = {};
  if (dateRange.startDate) {
    dateFilter.$gte = new Date(dateRange.startDate);
  }
  if (dateRange.endDate) {
    dateFilter.$lte = new Date(dateRange.endDate);
  }
  const hasDateFilter = Object.keys(dateFilter).length > 0;

  // Parallel queries for all metrics
  const [
    // Deal metrics
    dealMetrics,
    // Task metrics
    taskMetrics,
    // Customer metrics
    customerMetrics,
    // Lead metrics
    leadMetrics,
    // Company metrics
    companyMetrics,
    // Activity metrics
    activityMetrics,
    // Calendar events
    eventMetrics
  ] = await Promise.all([
    calculateDealMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter),
    calculateTaskMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter),
    calculateCustomerMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter),
    calculateLeadMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter),
    calculateCompanyMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter),
    calculateActivityMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter),
    calculateEventMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter)
  ]);

  // Calculate overall performance score
  const performanceScore = calculatePerformanceScore({
    dealMetrics,
    taskMetrics,
    customerMetrics,
    leadMetrics,
    activityMetrics
  });

  return {
    userId,
    projectId,
    dateRange,
    performanceScore,
    deals: dealMetrics,
    tasks: taskMetrics,
    customers: customerMetrics,
    leads: leadMetrics,
    companies: companyMetrics,
    activities: activityMetrics,
    events: eventMetrics,
    summary: {
      totalRevenue: dealMetrics.wonValue,
      totalDeals: dealMetrics.total,
      totalTasks: taskMetrics.total,
      totalCustomers: customerMetrics.total,
      totalLeads: leadMetrics.total,
      totalActivities: activityMetrics.total,
      completionRate: taskMetrics.completionRate,
      winRate: dealMetrics.winRate,
      conversionRate: leadMetrics.conversionRate
    }
  };
};

/**
 * Calculate deal-related performance metrics
 */
const calculateDealMetrics = async (userId, projectId, dateFilter, hasDateFilter) => {
  const baseQuery = {
    project: projectId,
    $or: [
      { assignedTo: userId },
      { createdBy: userId }
    ]
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const [
    totalDeals,
    wonDeals,
    lostDeals,
    openDeals,
    dealValueStats,
    recentDeals
  ] = await Promise.all([
    Deal.countDocuments(baseQuery),
    Deal.countDocuments({ ...baseQuery, status: 'closed-won' }),
    Deal.countDocuments({ ...baseQuery, status: 'closed-lost' }),
    Deal.countDocuments({ ...baseQuery, status: { $in: ['open', 'qualified', 'proposal', 'negotiation'] } }),
    Deal.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' },
          wonValue: { $sum: { $cond: [{ $eq: ['$status', 'closed-won'] }, '$value', 0] } },
          lostValue: { $sum: { $cond: [{ $eq: ['$status', 'closed-lost'] }, '$value', 0] } },
          openValue: { $sum: { $cond: [{ $in: ['$status', ['open', 'qualified', 'proposal', 'negotiation']] }, '$value', 0] } },
          avgDealValue: { $avg: '$value' },
          maxDealValue: { $max: '$value' }
        }
      }
    ]),
    Deal.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name value status createdAt expectedCloseDate')
      .lean()
  ]);

  const stats = dealValueStats[0] || {};
  const winRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(2) : 0;
  const avgDaysToClose = await calculateAvgDaysToClose(userId, projectId, dateFilter, hasDateFilter);

  return {
    total: totalDeals,
    won: wonDeals,
    lost: lostDeals,
    open: openDeals,
    totalValue: stats.totalValue || 0,
    wonValue: stats.wonValue || 0,
    lostValue: stats.lostValue || 0,
    openValue: stats.openValue || 0,
    avgDealValue: stats.avgDealValue ? parseFloat(stats.avgDealValue.toFixed(2)) : 0,
    maxDealValue: stats.maxDealValue || 0,
    winRate: parseFloat(winRate),
    avgDaysToClose: avgDaysToClose,
    recentDeals: recentDeals
  };
};

/**
 * Calculate task-related performance metrics
 */
const calculateTaskMetrics = async (userId, projectId, dateFilter, hasDateFilter) => {
  const baseQuery = {
    project: projectId,
    assignedTo: userId
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    onTimeTasksResult,
    taskTimeStats
  ] = await Promise.all([
    Task.countDocuments(baseQuery),
    Task.countDocuments({ ...baseQuery, status: 'completed' }),
    Task.countDocuments({ ...baseQuery, status: 'pending' }),
    Task.countDocuments({ ...baseQuery, status: 'in_progress' }),
    Task.countDocuments({
      ...baseQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    }),
    // Use aggregation to count tasks completed on time (completedAt <= dueDate)
    Task.aggregate([
      {
        $match: {
          ...baseQuery,
          status: 'completed',
          completedAt: { $exists: true, $ne: null },
          dueDate: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          isOnTime: {
            $lte: ['$completedAt', '$dueDate']
          }
        }
      },
      {
        $match: {
          isOnTime: true
        }
      },
      {
        $count: 'count'
      }
    ]),
    Task.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          totalEstimatedHours: { $sum: { $ifNull: ['$estimatedHours', 0] } },
          totalActualHours: { $sum: { $ifNull: ['$actualHours', 0] } },
          avgProgress: { $avg: { $ifNull: ['$progress', 0] } }
        }
      }
    ])
  ]);

  const onTimeTasks = onTimeTasksResult[0]?.count || 0;

  const stats = taskTimeStats[0] || {};
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;
  const onTimeRate = completedTasks > 0 ? ((onTimeTasks / completedTasks) * 100).toFixed(2) : 0;

  return {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    inProgress: inProgressTasks,
    overdue: overdueTasks,
    onTime: onTimeTasks,
    completionRate: parseFloat(completionRate),
    onTimeRate: parseFloat(onTimeRate),
    totalEstimatedHours: stats.totalEstimatedHours || 0,
    totalActualHours: stats.totalActualHours || 0,
    avgProgress: stats.avgProgress ? parseFloat(stats.avgProgress.toFixed(2)) : 0
  };
};

/**
 * Calculate customer-related performance metrics
 */
const calculateCustomerMetrics = async (userId, projectId, dateFilter, hasDateFilter) => {
  const baseQuery = {
    project: projectId,
    $or: [
      { assignedTo: userId },
      { owner: userId },
      { createdBy: userId }
    ]
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const [
    totalCustomers,
    activeCustomers,
    customerInteractions,
    customerScoreStats
  ] = await Promise.all([
    Customer.countDocuments(baseQuery),
    Customer.countDocuments({ ...baseQuery, status: 'active' }),
    Customer.aggregate([
      { $match: baseQuery },
      { $unwind: { path: '$interactions', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'interactions.createdBy': userId
        }
      },
      {
        $group: {
          _id: null,
          totalInteractions: { $sum: 1 },
          calls: { $sum: { $cond: [{ $eq: ['$interactions.type', 'call'] }, 1, 0] } },
          emails: { $sum: { $cond: [{ $eq: ['$interactions.type', 'email'] }, 1, 0] } },
          meetings: { $sum: { $cond: [{ $eq: ['$interactions.type', 'meeting'] }, 1, 0] } }
        }
      }
    ]),
    Customer.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          avgScore: { $avg: { $ifNull: ['$score', 0] } },
          maxScore: { $max: { $ifNull: ['$score', 0] } },
          totalScore: { $sum: { $ifNull: ['$score', 0] } }
        }
      }
    ])
  ]);

  const interactionStats = customerInteractions[0] || {};
  const scoreStats = customerScoreStats[0] || {};

  return {
    total: totalCustomers,
    active: activeCustomers,
    interactions: {
      total: interactionStats.totalInteractions || 0,
      calls: interactionStats.calls || 0,
      emails: interactionStats.emails || 0,
      meetings: interactionStats.meetings || 0
    },
    score: {
      average: scoreStats.avgScore ? parseFloat(scoreStats.avgScore.toFixed(2)) : 0,
      max: scoreStats.maxScore || 0,
      total: scoreStats.totalScore || 0
    }
  };
};

/**
 * Calculate lead-related performance metrics
 */
const calculateLeadMetrics = async (userId, projectId, dateFilter, hasDateFilter) => {
  const baseQuery = {
    project: projectId,
    $or: [
      { assignedTo: userId },
      { owner: userId },
      { createdBy: userId }
    ]
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const [
    totalLeads,
    newLeads,
    contactedLeads,
    qualifiedLeads,
    convertedLeads,
    leadScoreStats
  ] = await Promise.all([
    Lead.countDocuments(baseQuery),
    Lead.countDocuments({ ...baseQuery, status: 'new' }),
    Lead.countDocuments({ ...baseQuery, status: 'contacted' }),
    Lead.countDocuments({ ...baseQuery, status: 'qualified' }),
    Lead.countDocuments({ ...baseQuery, convertedAt: { $exists: true, $ne: null } }),
    Lead.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          avgScore: { $avg: { $ifNull: ['$score', 0] } },
          maxScore: { $max: { $ifNull: ['$score', 0] } }
        }
      }
    ])
  ]);

  const scoreStats = leadScoreStats[0] || {};
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

  return {
    total: totalLeads,
    new: newLeads,
    contacted: contactedLeads,
    qualified: qualifiedLeads,
    converted: convertedLeads,
    conversionRate: parseFloat(conversionRate),
    score: {
      average: scoreStats.avgScore ? parseFloat(scoreStats.avgScore.toFixed(2)) : 0,
      max: scoreStats.maxScore || 0
    }
  };
};

/**
 * Calculate company-related performance metrics
 */
const calculateCompanyMetrics = async (userId, projectId, dateFilter, hasDateFilter) => {
  const baseQuery = {
    project: projectId,
    $or: [
      { assignedTo: userId },
      { owner: userId },
      { createdBy: userId }
    ]
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const totalCompanies = await Company.countDocuments(baseQuery);
  const activeCompanies = await Company.countDocuments({ ...baseQuery, status: 'active' });

  return {
    total: totalCompanies,
    active: activeCompanies
  };
};

/**
 * Calculate activity-related performance metrics
 */
const calculateActivityMetrics = async (userId, projectId, dateFilter, hasDateFilter) => {
  const baseQuery = {
    project: projectId,
    performedBy: userId
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const [
    totalActivities,
    activitiesByType,
    activitiesByCategory
  ] = await Promise.all([
    Activity.countDocuments(baseQuery),
    Activity.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Activity.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])
  ]);

  return {
    total: totalActivities,
    byType: activitiesByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byCategory: activitiesByCategory.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

/**
 * Calculate event-related performance metrics
 */
const calculateEventMetrics = async (userId, projectId, dateFilter, hasDateFilter) => {
  const baseQuery = {
    project: projectId,
    $or: [
      { createdBy: userId },
      { attendees: userId }
    ]
  };

  if (hasDateFilter) {
    baseQuery.startDate = dateFilter;
  }

  const totalEvents = await CalendarEvent.countDocuments(baseQuery);
  const upcomingEvents = await CalendarEvent.countDocuments({
    ...baseQuery,
    startDate: { $gte: new Date() }
  });

  return {
    total: totalEvents,
    upcoming: upcomingEvents
  };
};

/**
 * Calculate average days to close deals
 */
const calculateAvgDaysToClose = async (userId, projectId, dateFilter, hasDateFilter) => {
  const query = {
    project: projectId,
    status: 'closed-won',
    $or: [
      { assignedTo: userId },
      { createdBy: userId }
    ],
    actualCloseDate: { $exists: true }
  };

  if (hasDateFilter) {
    query.actualCloseDate = dateFilter;
  }

  const result = await Deal.aggregate([
    { $match: query },
    {
      $project: {
        daysToClose: {
          $divide: [
            { $subtract: ['$actualCloseDate', '$createdAt'] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDays: { $avg: '$daysToClose' }
      }
    }
  ]);

  return result[0]?.avgDays ? parseFloat(result[0].avgDays.toFixed(2)) : 0;
};

/**
 * Calculate overall performance score (0-100)
 */
const calculatePerformanceScore = (metrics) => {
  let score = 0;
  let weight = 0;

  // Deal performance (40% weight)
  if (metrics.dealMetrics.total > 0) {
    const dealScore = (
      (metrics.dealMetrics.winRate / 100) * 40 +
      (Math.min(metrics.dealMetrics.won / Math.max(metrics.dealMetrics.total, 1), 1)) * 30 +
      (Math.min(metrics.dealMetrics.total / 10, 1)) * 30
    );
    score += dealScore * 0.4;
    weight += 0.4;
  }

  // Task performance (25% weight)
  if (metrics.taskMetrics.total > 0) {
    const taskScore = (
      (metrics.taskMetrics.completionRate / 100) * 50 +
      (Math.min(metrics.taskMetrics.onTimeRate / 100, 1)) * 30 +
      (Math.min(metrics.taskMetrics.total / 20, 1)) * 20
    );
    score += taskScore * 0.25;
    weight += 0.25;
  }

  // Customer engagement (15% weight)
  if (metrics.customerMetrics.total > 0) {
    const customerScore = (
      (Math.min(metrics.customerMetrics.interactions.total / 50, 1)) * 50 +
      (Math.min(metrics.customerMetrics.total / 20, 1)) * 50
    );
    score += customerScore * 0.15;
    weight += 0.15;
  }

  // Lead conversion (10% weight)
  if (metrics.leadMetrics.total > 0) {
    const leadScore = (
      (metrics.leadMetrics.conversionRate / 100) * 60 +
      (Math.min(metrics.leadMetrics.total / 30, 1)) * 40
    );
    score += leadScore * 0.1;
    weight += 0.1;
  }

  // Activity level (10% weight)
  const activityScore = Math.min(metrics.activityMetrics.total / 100, 1) * 100;
  score += activityScore * 0.1;
  weight += 0.1;

  // Normalize score
  return weight > 0 ? Math.round((score / weight)) : 0;
};

/**
 * Get team performance comparison
 */
export const getTeamPerformance = async (projectId, dateRange = {}) => {
  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  
  // Get project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  // Get owner
  const owner = await User.findById(project.owner);
  
  // Get all members
  const members = await User.find({
    $or: [
      { ownedProjects: projectId },
      { 'projectMembers.project': projectId }
    ],
    isActive: true
  });

  // Calculate performance for each member
  const teamPerformance = await Promise.all(
    members.map(async (member) => {
      const performance = await calculateUserPerformance(member._id, projectId, dateRange);
      const membership = member.projectMembers?.find(m => m.project.toString() === projectId.toString());
      const role = member.ownedProjects?.includes(projectId) ? 'owner' : (membership?.role || 'viewer');
      
      return {
        userId: member._id,
        name: member.name,
        email: member.email,
        profileImage: member.profileImage,
        role: role,
        performance: performance.performanceScore,
        summary: performance.summary
      };
    })
  );

  // Sort by performance score
  teamPerformance.sort((a, b) => b.performance - a.performance);

  return {
    projectId,
    dateRange,
    teamSize: teamPerformance.length,
    averagePerformance: teamPerformance.length > 0
      ? Math.round(teamPerformance.reduce((sum, member) => sum + member.performance, 0) / teamPerformance.length)
      : 0,
    members: teamPerformance
  };
};

