import mongoose from "mongoose";
import Deal from "../models/Deal.model.js";
import Task from "../models/Task.model.js";
import Customer from "../models/Customer.model.js";
import Lead from "../models/Lead.model.js";
import Company from "../models/Company.model.js";
import Activity from "../models/Activity.model.js";
import CalendarEvent from "../models/CalendarEvent.model.js";
import User from "../models/User.model.js";
import Project from "../models/Project.model.js";

/**
 * Calculate comprehensive performance metrics for a user
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {object} dateRange - Date range filter
 * @param {string} userRole - User's role in the project (optional)
 */
export const calculateUserPerformance = async (
  userId,
  projectId,
  dateRange = {},
  userRole = null
) => {
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

  // Determine which metrics to calculate based on role
  const shouldCalculateDeals = !userRole || userRole === 'manager' || userRole === 'support_executive';
  const shouldCalculateTasks = !userRole || userRole === 'manager' || userRole === 'sales_executive' || userRole === 'support_executive';
  const shouldCalculateCustomers = !userRole || userRole === 'manager' || userRole === 'support_executive';
  const shouldCalculateLeads = !userRole || userRole === 'manager' || userRole === 'sales_executive';
  const shouldCalculateCompanies = !userRole || userRole === 'manager' || userRole === 'sales_executive';
  const shouldCalculateActivities = !userRole || userRole === 'manager';
  const shouldCalculateEvents = !userRole || userRole === 'manager';

  // Build parallel queries array based on role
  const queries = [];
  const queryLabels = [];

  if (shouldCalculateDeals) {
    queries.push(calculateDealMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter));
    queryLabels.push('dealMetrics');
  } else {
    queryLabels.push(null);
  }

  if (shouldCalculateTasks) {
    queries.push(calculateTaskMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter));
    queryLabels.push('taskMetrics');
  } else {
    queryLabels.push(null);
  }

  if (shouldCalculateCustomers) {
    queries.push(calculateCustomerMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter));
    queryLabels.push('customerMetrics');
  } else {
    queryLabels.push(null);
  }

  if (shouldCalculateLeads) {
    queries.push(calculateLeadMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter));
    queryLabels.push('leadMetrics');
  } else {
    queryLabels.push(null);
  }

  if (shouldCalculateCompanies) {
    queries.push(calculateCompanyMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter));
    queryLabels.push('companyMetrics');
  } else {
    queryLabels.push(null);
  }

  if (shouldCalculateActivities) {
    queries.push(calculateActivityMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter));
    queryLabels.push('activityMetrics');
  } else {
    queryLabels.push(null);
  }

  if (shouldCalculateEvents) {
    queries.push(calculateEventMetrics(userObjectId, projectObjectId, dateFilter, hasDateFilter));
    queryLabels.push('eventMetrics');
  } else {
    queryLabels.push(null);
  }

  // Execute queries
  const results = await Promise.all(queries);

  // Map results to metrics
  let dealMetrics = { total: 0, won: 0, lost: 0, open: 0, totalValue: 0, wonValue: 0, lostValue: 0, openValue: 0, avgDealValue: 0, maxDealValue: 0, winRate: 0, avgDaysToClose: 0, recentDeals: [] };
  let taskMetrics = { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0, onTime: 0, completionRate: 0, onTimeRate: 0, totalEstimatedHours: 0, totalActualHours: 0, avgProgress: 0 };
  let customerMetrics = { total: 0, active: 0, interactions: { total: 0, calls: 0, emails: 0, meetings: 0 }, score: { average: 0, max: 0, total: 0 } };
  let leadMetrics = { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, conversionRate: 0, score: { average: 0, max: 0 } };
  let companyMetrics = { total: 0, active: 0 };
  let activityMetrics = { total: 0, byType: {}, byCategory: {} };
  let eventMetrics = { total: 0, upcoming: 0 };

  let resultIndex = 0;
  queryLabels.forEach((label) => {
    if (label) {
      const result = results[resultIndex++];
      switch (label) {
        case 'dealMetrics':
          dealMetrics = result;
          break;
        case 'taskMetrics':
          taskMetrics = result;
          break;
        case 'customerMetrics':
          customerMetrics = result;
          break;
        case 'leadMetrics':
          leadMetrics = result;
          break;
        case 'companyMetrics':
          companyMetrics = result;
          break;
        case 'activityMetrics':
          activityMetrics = result;
          break;
        case 'eventMetrics':
          eventMetrics = result;
          break;
      }
    }
  });

  // Calculate overall performance score based on role
  const performanceScore = calculatePerformanceScore({
    dealMetrics,
    taskMetrics,
    customerMetrics,
    leadMetrics,
    activityMetrics,
  }, userRole);

  // Build summary based on role
  const summary = {
    totalTasks: taskMetrics.total,
    completionRate: taskMetrics.completionRate,
  };

  if (shouldCalculateDeals) {
    summary.totalRevenue = dealMetrics.wonValue;
    summary.totalDeals = dealMetrics.total;
    summary.winRate = dealMetrics.winRate;
  }

  if (shouldCalculateCustomers) {
    summary.totalCustomers = customerMetrics.total;
  }

  if (shouldCalculateLeads) {
    summary.totalLeads = leadMetrics.total;
    summary.conversionRate = leadMetrics.conversionRate;
  }

  if (shouldCalculateActivities) {
    summary.totalActivities = activityMetrics.total;
  }

  return {
    userId,
    projectId,
    dateRange,
    userRole,
    performanceScore,
    deals: shouldCalculateDeals ? dealMetrics : null,
    tasks: shouldCalculateTasks ? taskMetrics : null,
    customers: shouldCalculateCustomers ? customerMetrics : null,
    leads: shouldCalculateLeads ? leadMetrics : null,
    companies: shouldCalculateCompanies ? companyMetrics : null,
    activities: shouldCalculateActivities ? activityMetrics : null,
    events: shouldCalculateEvents ? eventMetrics : null,
    summary,
  };
};

/**
 * Calculate deal-related performance metrics
 */
const calculateDealMetrics = async (
  userId,
  projectId,
  dateFilter,
  hasDateFilter
) => {
  const baseQuery = {
    projectId: projectId,
    $or: [{ assignedTo: userId }, { createdBy: userId }],
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
    recentDeals,
  ] = await Promise.all([
    Deal.countDocuments(baseQuery),
    Deal.countDocuments({ ...baseQuery, status: "closed-won" }),
    Deal.countDocuments({ ...baseQuery, status: "closed-lost" }),
    Deal.countDocuments({
      ...baseQuery,
      status: { $in: ["open", "qualified", "proposal", "negotiation"] },
    }),
    Deal.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$value" },
          wonValue: {
            $sum: { $cond: [{ $eq: ["$status", "closed-won"] }, "$value", 0] },
          },
          lostValue: {
            $sum: { $cond: [{ $eq: ["$status", "closed-lost"] }, "$value", 0] },
          },
          openValue: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["open", "qualified", "proposal", "negotiation"],
                  ],
                },
                "$value",
                0,
              ],
            },
          },
          avgDealValue: { $avg: "$value" },
          maxDealValue: { $max: "$value" },
        },
      },
    ]),
    Deal.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name value status createdAt expectedCloseDate")
      .lean(),
  ]);

  const stats = dealValueStats[0] || {};
  const winRate =
    totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(2) : 0;
  const avgDaysToClose = await calculateAvgDaysToClose(
    userId,
    projectId,
    dateFilter,
    hasDateFilter
  );

  return {
    total: totalDeals,
    won: wonDeals,
    lost: lostDeals,
    open: openDeals,
    totalValue: stats.totalValue || 0,
    wonValue: stats.wonValue || 0,
    lostValue: stats.lostValue || 0,
    openValue: stats.openValue || 0,
    avgDealValue: stats.avgDealValue
      ? parseFloat(stats.avgDealValue.toFixed(2))
      : 0,
    maxDealValue: stats.maxDealValue || 0,
    winRate: parseFloat(winRate),
    avgDaysToClose: avgDaysToClose,
    recentDeals: recentDeals,
  };
};

/**
 * Calculate task-related performance metrics
 */
const calculateTaskMetrics = async (
  userId,
  projectId,
  dateFilter,
  hasDateFilter
) => {
  const baseQuery = {
    project: projectId,
    assignedTo: userId,
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
    taskTimeStats,
  ] = await Promise.all([
    Task.countDocuments(baseQuery),
    Task.countDocuments({ ...baseQuery, status: "completed" }),
    Task.countDocuments({ ...baseQuery, status: "pending" }),
    Task.countDocuments({ ...baseQuery, status: "in_progress" }),
    Task.countDocuments({
      ...baseQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    }),
    // Use aggregation to count tasks completed on time (completedAt <= dueDate)
    Task.aggregate([
      {
        $match: {
          ...baseQuery,
          status: "completed",
          completedAt: { $exists: true, $ne: null },
          dueDate: { $exists: true, $ne: null },
        },
      },
      {
        $addFields: {
          isOnTime: {
            $lte: ["$completedAt", "$dueDate"],
          },
        },
      },
      {
        $match: {
          isOnTime: true,
        },
      },
      {
        $count: "count",
      },
    ]),
    Task.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          totalEstimatedHours: { $sum: { $ifNull: ["$estimatedHours", 0] } },
          totalActualHours: { $sum: { $ifNull: ["$actualHours", 0] } },
          avgProgress: { $avg: { $ifNull: ["$progress", 0] } },
        },
      },
    ]),
  ]);

  const onTimeTasks = onTimeTasksResult[0]?.count || 0;

  const stats = taskTimeStats[0] || {};
  const completionRate =
    totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;
  const onTimeRate =
    completedTasks > 0 ? ((onTimeTasks / completedTasks) * 100).toFixed(2) : 0;

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
    avgProgress: stats.avgProgress
      ? parseFloat(stats.avgProgress.toFixed(2))
      : 0,
  };
};

/**
 * Calculate customer-related performance metrics
 */
const calculateCustomerMetrics = async (
  userId,
  projectId,
  dateFilter,
  hasDateFilter
) => {
  const baseQuery = {
    project: projectId,
    $or: [{ assignedTo: userId }, { owner: userId }, { createdBy: userId }],
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const [
    totalCustomers,
    activeCustomers,
    customerInteractions,
    customerScoreStats,
  ] = await Promise.all([
    Customer.countDocuments(baseQuery),
    Customer.countDocuments({ ...baseQuery, status: "active" }),
    Customer.aggregate([
      { $match: baseQuery },
      { $unwind: { path: "$interactions", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          "interactions.createdBy": userId,
        },
      },
      {
        $group: {
          _id: null,
          totalInteractions: { $sum: 1 },
          calls: {
            $sum: { $cond: [{ $eq: ["$interactions.type", "call"] }, 1, 0] },
          },
          emails: {
            $sum: { $cond: [{ $eq: ["$interactions.type", "email"] }, 1, 0] },
          },
          meetings: {
            $sum: { $cond: [{ $eq: ["$interactions.type", "meeting"] }, 1, 0] },
          },
        },
      },
    ]),
    Customer.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          avgScore: { $avg: { $ifNull: ["$score", 0] } },
          maxScore: { $max: { $ifNull: ["$score", 0] } },
          totalScore: { $sum: { $ifNull: ["$score", 0] } },
        },
      },
    ]),
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
      meetings: interactionStats.meetings || 0,
    },
    score: {
      average: scoreStats.avgScore
        ? parseFloat(scoreStats.avgScore.toFixed(2))
        : 0,
      max: scoreStats.maxScore || 0,
      total: scoreStats.totalScore || 0,
    },
  };
};

/**
 * Calculate lead-related performance metrics
 */
const calculateLeadMetrics = async (
  userId,
  projectId,
  dateFilter,
  hasDateFilter
) => {
  const baseQuery = {
    project: projectId,
    $or: [{ assignedTo: userId }, { owner: userId }, { createdBy: userId }],
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
    leadScoreStats,
  ] = await Promise.all([
    Lead.countDocuments(baseQuery),
    Lead.countDocuments({ ...baseQuery, status: "new" }),
    Lead.countDocuments({ ...baseQuery, status: "contacted" }),
    Lead.countDocuments({ ...baseQuery, status: "qualified" }),
    Lead.countDocuments({
      ...baseQuery,
      convertedAt: { $exists: true, $ne: null },
    }),
    Lead.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          avgScore: { $avg: { $ifNull: ["$score", 0] } },
          maxScore: { $max: { $ifNull: ["$score", 0] } },
        },
      },
    ]),
  ]);

  const scoreStats = leadScoreStats[0] || {};
  const conversionRate =
    totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

  return {
    total: totalLeads,
    new: newLeads,
    contacted: contactedLeads,
    qualified: qualifiedLeads,
    converted: convertedLeads,
    conversionRate: parseFloat(conversionRate),
    score: {
      average: scoreStats.avgScore
        ? parseFloat(scoreStats.avgScore.toFixed(2))
        : 0,
      max: scoreStats.maxScore || 0,
    },
  };
};

/**
 * Calculate company-related performance metrics
 */
const calculateCompanyMetrics = async (
  userId,
  projectId,
  dateFilter,
  hasDateFilter
) => {
  const baseQuery = {
    project: projectId,
    $or: [{ assignedTo: userId }, { owner: userId }, { createdBy: userId }],
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const totalCompanies = await Company.countDocuments(baseQuery);
  const activeCompanies = await Company.countDocuments({
    ...baseQuery,
    status: "active",
  });

  return {
    total: totalCompanies,
    active: activeCompanies,
  };
};

/**
 * Calculate activity-related performance metrics
 */
const calculateActivityMetrics = async (
  userId,
  projectId,
  dateFilter,
  hasDateFilter
) => {
  const baseQuery = {
    project: projectId,
    performedBy: userId,
  };

  if (hasDateFilter) {
    baseQuery.createdAt = dateFilter;
  }

  const [totalActivities, activitiesByType, activitiesByCategory] =
    await Promise.all([
      Activity.countDocuments(baseQuery),
      Activity.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: "$activityType",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Activity.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
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
    }, {}),
  };
};

/**
 * Calculate event-related performance metrics
 */
const calculateEventMetrics = async (
  userId,
  projectId,
  dateFilter,
  hasDateFilter
) => {
  const baseQuery = {
    project: projectId,
    $or: [{ createdBy: userId }, { attendees: userId }],
  };

  if (hasDateFilter) {
    baseQuery.startDate = dateFilter;
  }

  const totalEvents = await CalendarEvent.countDocuments(baseQuery);
  const upcomingEvents = await CalendarEvent.countDocuments({
    ...baseQuery,
    startDate: { $gte: new Date() },
  });

  return {
    total: totalEvents,
    upcoming: upcomingEvents,
  };
};

/**
 * Calculate average days to close deals
 */
const calculateAvgDaysToClose = async (
  userId,
  projectId,
  dateFilter,
  hasDateFilter
) => {
  const query = {
    project: projectId,
    status: "closed-won",
    $or: [{ assignedTo: userId }, { createdBy: userId }],
    actualCloseDate: { $exists: true },
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
            { $subtract: ["$actualCloseDate", "$createdAt"] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgDays: { $avg: "$daysToClose" },
      },
    },
  ]);

  return result[0]?.avgDays ? parseFloat(result[0].avgDays.toFixed(2)) : 0;
};

/**
 * Calculate overall performance score (0-100) based on role
 */
const calculatePerformanceScore = (metrics, userRole = null) => {
  let score = 0;
  let weight = 0;

  // support_executive: customers, deals, tasks
  // sales_executive: leads, companies, tasks
  // manager: all resources
  // admin, owner, viewer: no performance (handled in controller)

  if (userRole === 'support_executive') {
    // Support Executive: Customers (40%), Deals (35%), Tasks (25%)
    if (metrics.customerMetrics.total > 0) {
      const customerScore =
        Math.min(metrics.customerMetrics.interactions.total / 50, 1) * 50 +
        Math.min(metrics.customerMetrics.total / 20, 1) * 50;
      score += customerScore * 0.4;
      weight += 0.4;
    }

    if (metrics.dealMetrics.total > 0) {
      const dealScore =
        (metrics.dealMetrics.winRate / 100) * 40 +
        Math.min(
          metrics.dealMetrics.won / Math.max(metrics.dealMetrics.total, 1),
          1
        ) *
          30 +
        Math.min(metrics.dealMetrics.total / 10, 1) * 30;
      score += dealScore * 0.35;
      weight += 0.35;
    }

    if (metrics.taskMetrics.total > 0) {
      const taskScore =
        (metrics.taskMetrics.completionRate / 100) * 50 +
        Math.min(metrics.taskMetrics.onTimeRate / 100, 1) * 30 +
        Math.min(metrics.taskMetrics.total / 20, 1) * 20;
      score += taskScore * 0.25;
      weight += 0.25;
    }
  } else if (userRole === 'sales_executive') {
    // Sales Executive: Leads (40%), Companies (35%), Tasks (25%)
    if (metrics.leadMetrics.total > 0) {
      const leadScore =
        (metrics.leadMetrics.conversionRate / 100) * 60 +
        Math.min(metrics.leadMetrics.total / 30, 1) * 40;
      score += leadScore * 0.4;
      weight += 0.4;
    }

    if (metrics.companyMetrics.total > 0) {
      const companyScore = Math.min(metrics.companyMetrics.total / 20, 1) * 100;
      score += companyScore * 0.35;
      weight += 0.35;
    }

    if (metrics.taskMetrics.total > 0) {
      const taskScore =
        (metrics.taskMetrics.completionRate / 100) * 50 +
        Math.min(metrics.taskMetrics.onTimeRate / 100, 1) * 30 +
        Math.min(metrics.taskMetrics.total / 20, 1) * 20;
      score += taskScore * 0.25;
      weight += 0.25;
    }
  } else if (userRole === 'manager') {
    // Manager: All resources (original weights)
    // Deal performance (40% weight)
    if (metrics.dealMetrics.total > 0) {
      const dealScore =
        (metrics.dealMetrics.winRate / 100) * 40 +
        Math.min(
          metrics.dealMetrics.won / Math.max(metrics.dealMetrics.total, 1),
          1
        ) *
          30 +
        Math.min(metrics.dealMetrics.total / 10, 1) * 30;
      score += dealScore * 0.4;
      weight += 0.4;
    }

    // Task performance (25% weight)
    if (metrics.taskMetrics.total > 0) {
      const taskScore =
        (metrics.taskMetrics.completionRate / 100) * 50 +
        Math.min(metrics.taskMetrics.onTimeRate / 100, 1) * 30 +
        Math.min(metrics.taskMetrics.total / 20, 1) * 20;
      score += taskScore * 0.25;
      weight += 0.25;
    }

    // Customer engagement (15% weight)
    if (metrics.customerMetrics.total > 0) {
      const customerScore =
        Math.min(metrics.customerMetrics.interactions.total / 50, 1) * 50 +
        Math.min(metrics.customerMetrics.total / 20, 1) * 50;
      score += customerScore * 0.15;
      weight += 0.15;
    }

    // Lead conversion (10% weight)
    if (metrics.leadMetrics.total > 0) {
      const leadScore =
        (metrics.leadMetrics.conversionRate / 100) * 60 +
        Math.min(metrics.leadMetrics.total / 30, 1) * 40;
      score += leadScore * 0.1;
      weight += 0.1;
    }

    // Activity level (10% weight)
    const activityScore = Math.min(metrics.activityMetrics.total / 100, 1) * 100;
    score += activityScore * 0.1;
    weight += 0.1;
  } else {
    // Default: original calculation (for backward compatibility)
    // Deal performance (40% weight)
    if (metrics.dealMetrics.total > 0) {
      const dealScore =
        (metrics.dealMetrics.winRate / 100) * 40 +
        Math.min(
          metrics.dealMetrics.won / Math.max(metrics.dealMetrics.total, 1),
          1
        ) *
          30 +
        Math.min(metrics.dealMetrics.total / 10, 1) * 30;
      score += dealScore * 0.4;
      weight += 0.4;
    }

    // Task performance (25% weight)
    if (metrics.taskMetrics.total > 0) {
      const taskScore =
        (metrics.taskMetrics.completionRate / 100) * 50 +
        Math.min(metrics.taskMetrics.onTimeRate / 100, 1) * 30 +
        Math.min(metrics.taskMetrics.total / 20, 1) * 20;
      score += taskScore * 0.25;
      weight += 0.25;
    }

    // Customer engagement (15% weight)
    if (metrics.customerMetrics.total > 0) {
      const customerScore =
        Math.min(metrics.customerMetrics.interactions.total / 50, 1) * 50 +
        Math.min(metrics.customerMetrics.total / 20, 1) * 50;
      score += customerScore * 0.15;
      weight += 0.15;
    }

    // Lead conversion (10% weight)
    if (metrics.leadMetrics.total > 0) {
      const leadScore =
        (metrics.leadMetrics.conversionRate / 100) * 60 +
        Math.min(metrics.leadMetrics.total / 30, 1) * 40;
      score += leadScore * 0.1;
      weight += 0.1;
    }

    // Activity level (10% weight)
    const activityScore = Math.min(metrics.activityMetrics.total / 100, 1) * 100;
    score += activityScore * 0.1;
    weight += 0.1;
  }

  // Normalize score
  return weight > 0 ? Math.round(score / weight) : 0;
};

/**
 * Get team performance comparison
 */
export const getTeamPerformance = async (projectId, dateRange = {}) => {
  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  // Get project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  // Get owner
  const owner = await User.findById(project.owner);

  // Get all members
  const members = await User.find({
    $or: [
      { ownedProjects: projectId },
      { "projectMembers.project": projectId },
    ],
    isActive: true,
  });

  // Calculate performance for each member
  const teamPerformance = await Promise.all(
    members.map(async (member) => {
      const membership = member.projectMembers?.find(
        (m) => m.project.toString() === projectId.toString()
      );
      const role = member.ownedProjects?.includes(projectId)
        ? "owner"
        : membership?.role || "viewer";

      // Skip performance calculation for admin, owner, viewer
      if (role === 'admin' || role === 'owner' || role === 'viewer') {
        return {
          userId: member._id,
          name: member.name,
          email: member.email,
          profileImage: member.profileImage,
          role: role,
          performance: null,
          summary: null,
        };
      }

      const performance = await calculateUserPerformance(
        member._id,
        projectId,
        dateRange,
        role
      );

      return {
        userId: member._id,
        name: member.name,
        email: member.email,
        profileImage: member.profileImage,
        role: role,
        performance: performance.performanceScore,
        summary: performance.summary,
      };
    })
  );

  // Sort by performance score
  teamPerformance.sort((a, b) => b.performance - a.performance);

  return {
    projectId,
    dateRange,
    teamSize: teamPerformance.length,
    averagePerformance:
      teamPerformance.length > 0
        ? Math.round(
            teamPerformance.reduce(
              (sum, member) => sum + member.performance,
              0
            ) / teamPerformance.length
          )
        : 0,
    members: teamPerformance,
  };
};
