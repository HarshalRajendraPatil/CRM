import { asyncHandler } from "../middleware/errorHandler.js";
import Company from "../models/Company.model.js";
import Customer from "../models/Customer.model.js";
import Deal from "../models/Deal.model.js";
import Lead from "../models/Lead.model.js";
import Task from "../models/Task.model.js";
import CalendarEvent from "../models/CalendarEvent.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";

// Get comprehensive CRM dashboard data
export const getDashboardData = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { period = "30d" } = req.query;

  // Calculate date range based on period
  const now = new Date();
  let startDate;
  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "1y":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  // Get basic counts
  const [
    totalCompanies,
    totalCustomers,
    totalDeals,
    totalLeads,
    totalTasks,
    totalEvents,
    totalUsers,
  ] = await Promise.all([
    Company.countDocuments({ project: projectObjectId }),
    Customer.countDocuments({ project: projectObjectId }),
    Deal.countDocuments({ projectId: projectObjectId }),
    Lead.countDocuments({ project: projectObjectId }),
    Task.countDocuments({ project: projectObjectId }),
    CalendarEvent.countDocuments({ project: projectObjectId }),
    User.countDocuments({ "projects.project": projectObjectId }),
  ]);

  // Get recent activity counts
  const [
    recentCompanies,
    recentCustomers,
    recentDeals,
    recentLeads,
    recentTasks,
    recentEvents,
  ] = await Promise.all([
    Company.countDocuments({
      project: projectObjectId,
      createdAt: { $gte: startDate },
    }),
    Customer.countDocuments({
      project: projectObjectId,
      createdAt: { $gte: startDate },
    }),
    Deal.countDocuments({
      projectId: projectObjectId,
      createdAt: { $gte: startDate },
    }),
    Lead.countDocuments({
      project: projectObjectId,
      createdAt: { $gte: startDate },
    }),
    Task.countDocuments({
      project: projectObjectId,
      createdAt: { $gte: startDate },
    }),
    CalendarEvent.countDocuments({
      project: projectObjectId,
      createdAt: { $gte: startDate },
    }),
  ]);

  // Get deal analytics
  const dealAnalytics = await Deal.aggregate([
    { $match: { projectId: projectObjectId } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: "$value" },
        wonValue: {
          $sum: {
            $cond: [{ $eq: ["$status", "closed-won"] }, "$value", 0],
          },
        },
        lostValue: {
          $sum: {
            $cond: [{ $eq: ["$status", "closed-lost"] }, "$value", 0],
          },
        },
        openValue: {
          $sum: {
            $cond: [{ $eq: ["$status", "open"] }, "$value", 0],
          },
        },
        totalCount: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$status",
                  [
                    "closed-won",
                    "closed-lost",
                    "open",
                    "qualified",
                    "proposal",
                    "negotiation",
                    "on-hold",
                  ],
                ],
              },
              1,
              0,
            ],
          },
        },
        wonCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "closed-won"] }, 1, 0],
          },
        },
        lostCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "closed-lost"] }, 1, 0],
          },
        },
        openCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "open"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Get task analytics
  const taskAnalytics = await Task.aggregate([
    { $match: { project: projectObjectId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        inProgress: {
          $sum: {
            $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0],
          },
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
          },
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "completed"] },
                  { $lt: ["$dueDate", new Date()] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Get lead conversion analytics
  const leadAnalytics = await Lead.aggregate([
    { $match: { project: projectObjectId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: {
          $sum: {
            $cond: [{ $eq: ["$status", "new"] }, 1, 0],
          },
        },
        qualified: {
          $sum: {
            $cond: [{ $eq: ["$status", "qualified"] }, 1, 0],
          },
        },
        disqualified: {
          $sum: {
            $cond: [{ $eq: ["$status", "disqualified"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Get customer analytics
  const customerAnalytics = await Customer.aggregate([
    { $match: { project: projectObjectId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
          },
        },
        inactive: {
          $sum: {
            $cond: [{ $eq: ["$status", "inactive"] }, 1, 0],
          },
        },
        archived: {
          $sum: {
            $cond: [{ $eq: ["$status", "archived"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Get company analytics
  const companyAnalytics = await Company.aggregate([
    { $match: { project: projectObjectId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
          },
        },
        inactive: {
          $sum: {
            $cond: [{ $eq: ["$status", "inactive"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Get monthly trends
  const monthlyTrends = await Promise.all([
    // Companies trend
    Company.aggregate([
      { $match: { project: projectObjectId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    // Customers trend
    Customer.aggregate([
      { $match: { project: projectObjectId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    // Deals trend
    Deal.aggregate([
      { $match: { project: projectObjectId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          value: { $sum: "$value" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    // Leads trend
    Lead.aggregate([
      { $match: { project: projectObjectId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  // Get top performing users
  const topUsers = await Deal.aggregate([
    { $match: { projectId: projectObjectId } },
    {
      $group: {
        _id: "$assignedTo",
        dealCount: { $sum: 1 },
        totalValue: { $sum: "$value" },
        wonCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "closed-won"] }, 1, 0],
          },
        },
        wonValue: {
          $sum: {
            $cond: [{ $eq: ["$status", "closed-won"] }, "$value", 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$_id",
        name: "$user.name",
        email: "$user.email",
        dealCount: 1,
        totalValue: 1,
        wonCount: 1,
        wonValue: 1,
      },
    },
    { $sort: { totalValue: -1 } },
    { $limit: 5 },
  ]);

  // Get recent activities
  const recentActivities = await Promise.all([
    Company.find({ project: projectObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status createdAt")
      .lean(),
    Customer.find({ project: projectObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName status stage createdAt")
      .lean(),
    Deal.find({ projectId: projectObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status value createdAt")
      .lean(),
    Lead.find({ project: projectObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status source createdAt")
      .lean(),
    Task.find({ project: projectObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status priority createdAt")
      .lean(),
  ]);

  // Calculate conversion rates
  const conversionRate =
    totalLeads > 0
      ? ((leadAnalytics[0]?.qualified || 0) / totalLeads) * 100
      : 0;
  const winRate =
    totalDeals > 0 ? ((dealAnalytics[0]?.wonCount || 0) / totalDeals) * 100 : 0;
  const taskCompletionRate =
    totalTasks > 0
      ? ((taskAnalytics[0]?.completed || 0) / totalTasks) * 100
      : 0;

  // Prepare response
  const dashboardData = {
    overview: {
      totalCompanies,
      totalCustomers,
      totalDeals,
      totalLeads,
      totalTasks,
      totalEvents,
      totalUsers,
      recentCompanies,
      recentCustomers,
      recentDeals,
      recentLeads,
      recentTasks,
      recentEvents,
    },
    analytics: {
      deals: dealAnalytics[0] || {
        totalValue: 0,
        wonValue: 0,
        lostValue: 0,
        openValue: 0,
        wonCount: 0,
        lostCount: 0,
        openCount: 0,
      },
      tasks: taskAnalytics[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        overdue: 0,
      },
      leads: leadAnalytics[0] || {
        total: 0,
        new: 0,
        qualified: 0,
        unqualified: 0,
      },
      customers: customerAnalytics[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        archived: 0,
      },
      companies: companyAnalytics[0] || {
        total: 0,
        active: 0,
        inactive: 0,
      },
    },
    trends: {
      companies: monthlyTrends[0],
      customers: monthlyTrends[1],
      deals: monthlyTrends[2],
      leads: monthlyTrends[3],
    },
    topUsers,
    recentActivities: {
      companies: recentActivities[0],
      customers: recentActivities[1],
      deals: recentActivities[2],
      leads: recentActivities[3],
      tasks: recentActivities[4],
    },
    metrics: {
      conversionRate: Math.round(conversionRate * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
    },
    period,
    generatedAt: new Date(),
  };

  res.json({
    success: true,
    data: dashboardData,
  });
});

// Get dashboard widgets data
export const getDashboardWidgets = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  // Get quick stats
  const quickStats = await Promise.all([
    Company.countDocuments({ project: projectObjectId }),
    Customer.countDocuments({ project: projectObjectId }),
    Deal.countDocuments({ projectId: projectObjectId }),
    Lead.countDocuments({ project: projectObjectId }),
    Task.countDocuments({ project: projectObjectId }),
  ]);

  // Get pipeline summary
  const pipelineSummary = await Deal.aggregate([
    { $match: { projectId: projectObjectId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        value: { $sum: "$value" },
      },
    },
  ]);

  // Get task status summary
  const taskStatusSummary = await Task.aggregate([
    { $match: { project: projectObjectId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get lead source summary
  const leadSourceSummary = await Lead.aggregate([
    { $match: { project: projectObjectId } },
    {
      $group: {
        _id: "$source",
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      quickStats: {
        companies: quickStats[0],
        customers: quickStats[1],
        deals: quickStats[2],
        leads: quickStats[3],
        tasks: quickStats[4],
      },
      pipelineSummary,
      taskStatusSummary,
      leadSourceSummary,
    },
  });
});

// Get dashboard charts data
export const getDashboardCharts = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { chartType, period = "30d" } = req.query;
  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  // Calculate date range
  const now = new Date();
  let startDate;
  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "1y":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  let chartData = {};

  switch (chartType) {
    case "revenue-trend":
      chartData = await Deal.aggregate([
        {
          $match: {
            projectId: projectObjectId,
            status: "closed-won",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            revenue: { $sum: "$value" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);
      break;

    case "deal-funnel":
      chartData = await Deal.aggregate([
        { $match: { projectId: projectObjectId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            value: { $sum: "$value" },
          },
        },
      ]);
      break;

    case "task-completion":
      chartData = await Task.aggregate([
        { $match: { project: projectObjectId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      break;

    case "lead-conversion":
      chartData = await Lead.aggregate([
        { $match: { project: projectObjectId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      break;

    case "user-performance":
      chartData = await Deal.aggregate([
        { $match: { projectId: projectObjectId } },
        {
          $group: {
            _id: "$assignedTo",
            dealCount: { $sum: 1 },
            totalValue: { $sum: "$value" },
            wonCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "closed-won"] }, 1, 0],
              },
            },
            wonValue: {
              $sum: {
                $cond: [{ $eq: ["$status", "closed-won"] }, "$value", 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            name: "$user.name",
            dealCount: 1,
            totalValue: 1,
            wonValue: 1,
            wonCount: 1,
            wonRate: {
              $cond: [
                { $gt: ["$dealCount", 0] },
                { $multiply: [{ $divide: ["$wonCount", "$dealCount"] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { totalValue: -1 } },
        { $limit: 5 },
      ]);

      break;

    default:
      chartData = [];
  }

  res.json({
    success: true,
    data: chartData,
  });
});
