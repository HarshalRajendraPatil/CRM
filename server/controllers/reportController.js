import { asyncHandler } from "../middleware/errorHandler.js";
import Project from "../models/Project.model.js";
import Company from "../models/Company.model.js";
import Customer from "../models/Customer.model.js";
import Deal from "../models/Deal.model.js";
import Lead from "../models/Lead.model.js";
import Task from "../models/Task.model.js";
import CalendarEvent from "../models/CalendarEvent.model.js";
import Activity from "../models/Activity.model.js";
import User from "../models/User.model.js";
import { NotFoundError, ValidationError } from "../middleware/errorHandler.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import puppeteer from "puppeteer";
import { getReportHTML } from "../utils/reportTemplates.js";
import {
  calculateUserPerformance,
  getTeamPerformance,
} from "../utils/performanceService.js";

// Generate comprehensive CRM overview report
export const generateOverviewReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Get all data counts and additional metrics
  const [
    companiesCount,
    customersCount,
    dealsCount,
    leadsCount,
    tasksCount,
    eventsCount,
    totalDealValue,
    completedTasks,
    activeDeals,
    wonDeals,
    lostDeals,
    wonDealValue,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    activeCustomers,
    newLeads,
    convertedLeads,
  ] = await Promise.all([
    Company.countDocuments({ project: new mongoose.Types.ObjectId(projectId) }),
    Customer.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
    }),
    Deal.countDocuments({ projectId: new mongoose.Types.ObjectId(projectId) }),
    Lead.countDocuments({ project: new mongoose.Types.ObjectId(projectId) }),
    Task.countDocuments({ project: new mongoose.Types.ObjectId(projectId) }),
    CalendarEvent.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
    }),
    Deal.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          status: { $ne: "lost" },
        },
      },
      { $group: { _id: null, total: { $sum: "$value" } } },
    ]),
    Task.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
      status: "completed",
    }),
    Deal.countDocuments({
      projectId: new mongoose.Types.ObjectId(projectId),
      status: "open",
    }),
    Deal.countDocuments({
      projectId: new mongoose.Types.ObjectId(projectId),
      status: "won",
    }),
    Deal.countDocuments({
      projectId: new mongoose.Types.ObjectId(projectId),
      status: "lost",
    }),
    Deal.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          status: "won",
        },
      },
      { $group: { _id: null, total: { $sum: "$value" } } },
    ]),
    Task.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
      status: "pending",
    }),
    Task.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
      status: "in-progress",
    }),
    Task.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    }),
    Customer.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
      status: "active",
    }),
    Lead.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
      status: "new",
    }),
    Lead.countDocuments({
      project: new mongoose.Types.ObjectId(projectId),
      status: "converted",
    }),
  ]);

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
    },
    overview: {
      companies: companiesCount,
      customers: customersCount,
      deals: dealsCount,
      leads: leadsCount,
      tasks: tasksCount,
      events: eventsCount,
      totalDealValue: totalDealValue[0]?.total || 0,
      completedTasks,
      activeDeals,
      wonDeals,
      lostDeals,
      wonDealValue: wonDealValue[0]?.total || 0,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      activeCustomers,
      newLeads,
      convertedLeads,
      taskCompletionRate:
        tasksCount > 0 ? ((completedTasks / tasksCount) * 100).toFixed(2) : 0,
      dealWinRate:
        dealsCount > 0 ? ((wonDeals / dealsCount) * 100).toFixed(2) : 0,
      leadConversionRate:
        leadsCount > 0 ? ((convertedLeads / leadsCount) * 100).toFixed(2) : 0,
    },
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "CRM Overview");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "CRM Overview");
  } else {
    await generatePDFReport(res, reportData, "CRM Overview");
  }
});

// Generate companies report
export const generateCompaniesReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  let query = { project: new mongoose.Types.ObjectId(projectId) };

  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  }

  // Apply additional filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.industry) {
    query.industry = filters.industry;
  }

  const companies = await Company.find(query).sort({ createdAt: -1 });

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
    },
    companies: companies.map((company) => ({
      name: company.name,
      industry: company.industry,
      status: company.status,
      website: company.website,
      email: company.email,
      phone: company.phone,
      address: company.address,
      createdAt: company.createdAt,
    })),
    summary: {
      total: companies.length,
      byStatus: companies.reduce((acc, company) => {
        acc[company.status] = (acc[company.status] || 0) + 1;
        return acc;
      }, {}),
      byIndustry: companies.reduce((acc, company) => {
        acc[company.industry] = (acc[company.industry] || 0) + 1;
        return acc;
      }, {}),
    },
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "Companies Report");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "Companies Report");
  } else {
    await generatePDFReport(res, reportData, "Companies Report");
  }
});

// Generate deals report
export const generateDealsReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  let query = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: { $ne: true },
  };

  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  }

  // Apply additional filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.minValue) {
    query.value = { $gte: parseFloat(filters.minValue) };
  }

  const deals = await Deal.find(query)
    .populate("customer", "firstName lastName email phone")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("company", "name industry")
    .sort({ createdAt: -1 });

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter((deal) => deal.status === "won");
  const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const lostDeals = deals.filter((deal) => deal.status === "lost");
  const openDeals = deals.filter((deal) => deal.status === "open");

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
    },
    deals: deals.map((deal) => ({
      name: deal.name,
      dealNumber: deal.dealNumber || "N/A",
      description: deal.description || "No description",
      value: deal.value || 0,
      currency: deal.currency || "USD",
      status: deal.status,
      priority: deal.priority || "medium",
      stage: deal.stage?.name || "No Stage",
      customer: deal.customer
        ? `${deal.customer.firstName || ""} ${
            deal.customer.lastName || ""
          }`.trim() ||
          deal.customer.email ||
          "No Customer"
        : "No Customer",
      customerEmail: deal.customer?.email || "N/A",
      customerPhone: deal.customer?.phone || "N/A",
      company: deal.company?.name || "No Company",
      companyIndustry: deal.company?.industry || "N/A",
      assignedTo: deal.assignedTo?.name || "Unassigned",
      assignedToEmail: deal.assignedTo?.email || "N/A",
      createdBy: deal.createdBy?.name || "Unknown",
      probability: deal.probability || 0,
      expectedCloseDate: deal.expectedCloseDate,
      actualCloseDate: deal.actualCloseDate || null,
      source: deal.source || "N/A",
      tags: deal.tags || [],
      notes: deal.notes?.length || 0,
      activities: deal.activities?.length || 0,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    })),
    summary: {
      total: deals.length,
      totalValue,
      wonValue,
      lostDeals,
      wonDeals,
      winRate:
        deals.length > 0
          ? ((wonDeals.length / deals.length) * 100).toFixed(2)
          : 0,
      byStatus: deals.reduce((acc, deal) => {
        acc[deal.status] = (acc[deal.status] || 0) + 1;
        return acc;
      }, {}),
      byStage: deals.reduce((acc, deal) => {
        const stage = deal.stage?.name || "No Stage";
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {}),
    },
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "Deals Report");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "Deals Report");
  } else {
    await generatePDFReport(res, reportData, "Deals Report");
  }
});

// Generate leads report
export const generateLeadsReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  let query = {
    project: new mongoose.Types.ObjectId(projectId),
    isArchived: { $ne: true },
  };

  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  }

  // Apply additional filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.source) {
    query.source = filters.source;
  }

  const leads = await Lead.find(query)
    .populate("assignedTo", "name email")
    .populate("owner", "name email")
    .populate("createdBy", "name email")
    .populate("company", "name industry")
    .populate("convertedBy", "name email")
    .sort({ createdAt: -1 });

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
    },
    leads: leads.map((lead) => ({
      name: lead.name,
      email: lead.email || "N/A",
      phone: lead.phone || "N/A",
      jobTitle: lead.jobTitle || "N/A",
      company: lead.company?.name || "No Company",
      companyIndustry: lead.company?.industry || "N/A",
      status: lead.status,
      source: lead.source || "other",
      score: lead.score || 0,
      tags: lead.tags || [],
      assignedTo: lead.assignedTo?.name || "Unassigned",
      assignedToEmail: lead.assignedTo?.email || "N/A",
      owner: lead.owner?.name || "Unknown",
      ownerEmail: lead.owner?.email || "N/A",
      createdBy: lead.createdBy?.name || "Unknown",
      createdByEmail: lead.createdBy?.email || "N/A",
      convertedAt: lead.convertedAt || null,
      convertedBy: lead.convertedBy?.name || null,
      notes: lead.notes?.length || 0,
      tasks: lead.tasks?.length || 0,
      customFields: lead.customFields
        ? Object.fromEntries(lead.customFields)
        : {},
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    })),
    summary: {
      total: leads.length,
      byStatus: leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {}),
      bySource: leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {}),
      averageScore:
        leads.length > 0
          ? (
              leads.reduce((sum, lead) => sum + (lead.score || 0), 0) /
              leads.length
            ).toFixed(2)
          : 0,
    },
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "Leads Report");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "Leads Report");
  } else {
    await generatePDFReport(res, reportData, "Leads Report");
  }
});

// Generate tasks report
export const generateTasksReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  let query = { project: new mongoose.Types.ObjectId(projectId) };

  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  }

  // Apply additional filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.priority) {
    query.priority = filters.priority;
  }

  const tasks = await Task.find(query)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  const completedTasks = tasks.filter((task) => task.status === "completed");
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "completed"
  );

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
    },
    tasks: tasks.map((task) => ({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      assignedTo: task.assignedTo?.name || "Unassigned",
      createdBy: task.createdBy?.name || "Unknown",
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      tags: task.tags,
    })),
    summary: {
      total: tasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      completionRate:
        tasks.length > 0
          ? ((completedTasks.length / tasks.length) * 100).toFixed(2)
          : 0,
      byStatus: tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {}),
    },
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "Tasks Report");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "Tasks Report");
  } else {
    await generatePDFReport(res, reportData, "Tasks Report");
  }
});

// Generate performance report
export const generatePerformanceReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {}, filters = {} } = req.body;
  const userId = filters.userId || req.body.userId; // Support both locations

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const requestingUser = req.user;

  // Get requesting user's role in this project
  const userRole =
    requestingUser.getProjectRole?.(projectId) ||
    (requestingUser.ownedProjects?.includes(projectId)
      ? "owner"
      : requestingUser.projectMembers?.find(
          (m) => m.project.toString() === projectId.toString()
        )?.role);

  // Build query to get project members
  let membersQuery = {
    $or: [
      { ownedProjects: projectObjectId },
      { "projectMembers.project": projectObjectId },
    ],
    isActive: { $ne: false }, // Only active users
  };

  // If specific userId is provided, only get that user's performance
  if (userId) {
    membersQuery._id = new mongoose.Types.ObjectId(userId);
  } else {
    // Filter based on requesting user's role
    if (userRole === "owner" || userRole === "admin") {
      // Owner and admin can see all members - no additional filter
    } else if (userRole === "manager") {
      // Manager can see sales_executive, support_executive, and themselves
      // We'll filter after fetching based on project role
    } else {
      // Others can only see themselves
      membersQuery._id = requestingUser._id;
    }
  }

  // Get all matching users
  let members = await User.find(membersQuery)
    .select("name email profileImage ownedProjects projectMembers")
    .lean();

  // Filter members based on their project role and requesting user's permissions
  members = members
    .map((member) => {
      const memberRole = member.ownedProjects?.some(
        (p) => p.toString() === projectId
      )
        ? "owner"
        : member.projectMembers?.find((m) => m.project.toString() === projectId)
            ?.role;

      // If requesting user is owner/admin, include all
      if (userRole === "owner" || userRole === "admin") {
        return { ...member, role: memberRole };
      }
      // If requesting user is manager, include sales_executive, support_executive, and themselves
      else if (userRole === "manager") {
        if (
          memberRole === "sales_executive" ||
          memberRole === "support_executive" ||
          memberRole === "manager" ||
          member._id.toString() === requestingUser._id.toString()
        ) {
          return { ...member, role: memberRole };
        }
      }
      // Others can only see themselves
      else if (member._id.toString() === requestingUser._id.toString()) {
        return { ...member, role: memberRole };
      }
      return null;
    })
    .filter((member) => member !== null);

  // Get comprehensive performance data for each member using performanceService
  const membersPerformance = await Promise.all(
    members.map(async (member) => {
      try {
        const memberRole = member.role || "viewer";

        // Calculate performance with role-based logic
        const performance = await calculateUserPerformance(
          member._id.toString(),
          projectId,
          dateRange,
          memberRole
        );

        // For admin/owner/viewer, performanceScore will be null
        const hasPerformance = performance.performanceScore !== null;

        return {
          userId: member._id.toString(),
          name: member.name,
          email: member.email,
          role: memberRole,
          performanceScore: hasPerformance
            ? performance.performanceScore
            : null,
          hasPerformanceTracking: hasPerformance,
          deals:
            hasPerformance && performance.deals
              ? {
                  total: performance.deals.total || 0,
                  open: performance.deals.open || 0,
                  won: performance.deals.won || 0,
                  lost: performance.deals.lost || 0,
                  winRate: performance.deals.winRate || "0",
                  totalValue: performance.deals.totalValue || 0,
                  wonValue: performance.deals.wonValue || 0,
                  lostValue: performance.deals.lostValue || 0,
                  averageValue: performance.deals.avgDealValue || 0,
                }
              : null,
          tasks:
            hasPerformance && performance.tasks
              ? {
                  total: performance.tasks.total || 0,
                  completed: performance.tasks.completed || 0,
                  pending: performance.tasks.pending || 0,
                  inProgress: performance.tasks.inProgress || 0,
                  overdue: performance.tasks.overdue || 0,
                  onTime: performance.tasks.onTime || 0,
                  completionRate: performance.tasks.completionRate || "0",
                  onTimeRate: performance.tasks.onTimeRate || "0",
                }
              : null,
          customers:
            hasPerformance && performance.customers
              ? {
                  total: performance.customers.total || 0,
                  active: performance.customers.active || 0,
                  new: performance.customers.new || 0,
                }
              : null,
          leads:
            hasPerformance && performance.leads
              ? {
                  total: performance.leads.total || 0,
                  new: performance.leads.new || 0,
                  contacted: performance.leads.contacted || 0,
                  qualified: performance.leads.qualified || 0,
                  converted: performance.leads.converted || 0,
                  conversionRate: performance.leads.conversionRate || "0",
                }
              : null,
          companies:
            hasPerformance && performance.companies
              ? {
                  total: performance.companies.total || 0,
                  active: performance.companies.active || 0,
                }
              : null,
          activities:
            hasPerformance && performance.activities
              ? {
                  total: performance.activities.total || 0,
                  byCategory: performance.activities.byCategory || {},
                }
              : null,
          events:
            hasPerformance && performance.events
              ? {
                  total: performance.events.total || 0,
                  upcoming: performance.events.upcoming || 0,
                  completed: performance.events.completed || 0,
                }
              : null,
          summary: hasPerformance ? performance.summary || {} : null,
        };
      } catch (error) {
        console.error(
          `Error calculating performance for user ${member._id}:`,
          error
        );
        // Return null performance data if calculation fails
        return {
          userId: member._id.toString(),
          name: member.name,
          email: member.email,
          role: member.role || "viewer",
          performanceScore: null,
          hasPerformanceTracking: false,
          deals: null,
          tasks: null,
          customers: null,
          leads: null,
          companies: null,
          activities: null,
          events: null,
          summary: null,
        };
      }
    })
  );

  // Calculate team averages (only for members with performance tracking)
  const membersWithPerformance = membersPerformance.filter(
    (m) => m.hasPerformanceTracking && m.performanceScore !== null
  );

  const teamAverages =
    membersWithPerformance.length > 0
      ? {
          averagePerformanceScore: (
            membersWithPerformance.reduce(
              (sum, m) => sum + (m.performanceScore || 0),
              0
            ) / membersWithPerformance.length
          ).toFixed(2),
          averageCompletionRate: (
            membersWithPerformance.reduce(
              (sum, m) => sum + parseFloat(m.tasks?.completionRate || 0),
              0
            ) / membersWithPerformance.length
          ).toFixed(2),
          averageWinRate: (
            membersWithPerformance.reduce(
              (sum, m) => sum + parseFloat(m.deals?.winRate || 0),
              0
            ) / membersWithPerformance.length
          ).toFixed(2),
          totalRevenue: membersWithPerformance.reduce(
            (sum, m) => sum + (m.deals?.wonValue || 0),
            0
          ),
          totalDeals: membersWithPerformance.reduce(
            (sum, m) => sum + (m.deals?.total || 0),
            0
          ),
          totalTasks: membersWithPerformance.reduce(
            (sum, m) => sum + (m.tasks?.total || 0),
            0
          ),
          membersWithPerformance: membersWithPerformance.length,
          totalMembers: membersPerformance.length,
        }
      : {
          membersWithPerformance: 0,
          totalMembers: membersPerformance.length,
        };

  // Log for debugging
  console.log(
    `Performance Report: Found ${members.length} members, ${membersPerformance.length} performance records`
  );

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
    },
    dateRange: dateRange,
    members: membersPerformance,
    teamAverages: teamAverages,
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "Performance Report");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "Performance Report");
  } else {
    await generatePDFReport(res, reportData, "Performance Report");
  }
});

// Generate customers report
export const generateCustomersReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  let query = {
    project: new mongoose.Types.ObjectId(projectId),
    isArchived: { $ne: true },
  };

  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  }

  // Apply additional filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.stage) {
    query.stage = filters.stage;
  }
  if (filters.priority) {
    query.priority = filters.priority;
  }

  const customers = await Customer.find(query)
    .populate("assignedTo", "name email")
    .populate("owner", "name email")
    .populate("company", "name industry")
    .populate("convertedBy", "name email")
    .populate("convertedFromLead", "name email")
    .sort({ createdAt: -1 });

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
    },
    customers: customers.map((customer) => ({
      firstName: customer.firstName,
      lastName: customer.lastName,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email || "No Email",
      phone: customer.phone || "No Phone",
      jobTitle: customer.jobTitle || "N/A",
      company: customer.company?.name || customer.companyName || "No Company",
      companyIndustry:
        customer.company?.industry || customer.industry || "Unknown",
      address: customer.address
        ? {
            street: customer.address.street || "",
            city: customer.address.city || "",
            state: customer.address.state || "",
            zipCode: customer.address.zipCode || "",
            country: customer.address.country || "",
          }
        : null,
      socialLinks: customer.socialLinks
        ? {
            linkedin: customer.socialLinks.linkedin || "",
            twitter: customer.socialLinks.twitter || "",
            facebook: customer.socialLinks.facebook || "",
            website: customer.socialLinks.website || "",
          }
        : null,
      status: customer.status,
      stage: customer.stage,
      priority: customer.priority || "medium",
      score: customer.score || 0,
      source: customer.source || "other",
      lifecycleStage: customer.lifecycleStage || "awareness",
      assignedTo: customer.assignedTo?.name || "Unassigned",
      assignedToEmail: customer.assignedTo?.email || "N/A",
      owner: customer.owner?.name || "Unknown",
      ownerEmail: customer.owner?.email || "N/A",
      convertedFromLead: customer.convertedFromLead?.name || null,
      convertedAt: customer.convertedAt || null,
      convertedBy: customer.convertedBy?.name || null,
      tags: customer.tags || [],
      notes: customer.notes?.length || 0,
      interactions: customer.interactions?.length || 0,
      deals: customer.deals?.length || 0,
      communicationPreferences: customer.communicationPreferences || {},
      customFields: customer.customFields
        ? Object.fromEntries(customer.customFields)
        : {},
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    })),
    summary: {
      total: customers.length,
      byStatus: customers.reduce((acc, customer) => {
        acc[customer.status] = (acc[customer.status] || 0) + 1;
        return acc;
      }, {}),
      byStage: customers.reduce((acc, customer) => {
        acc[customer.stage] = (acc[customer.stage] || 0) + 1;
        return acc;
      }, {}),
      averageScore:
        customers.length > 0
          ? (
              customers.reduce(
                (sum, customer) => sum + (customer.score || 0),
                0
              ) / customers.length
            ).toFixed(2)
          : 0,
    },
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "Customers Report");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "Customers Report");
  } else {
    await generatePDFReport(res, reportData, "Customers Report");
  }
});

// Generate activities report
export const generateActivitiesReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // Build query for Activity model
  const query = { project: new mongoose.Types.ObjectId(projectId) };

  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  } else if (dateRange.startDate) {
    query.createdAt = { $gte: new Date(dateRange.startDate) };
  } else if (dateRange.endDate) {
    query.createdAt = { $lte: new Date(dateRange.endDate) };
  }

  // Apply entity type filter if provided
  if (filters.entityType) {
    query.entityType = filters.entityType;
  }

  // Get activities from Activity model
  const activities = await Activity.find(query)
    .populate("performedBy", "name email")
    .populate("entityId")
    .sort({ createdAt: -1 })
    .lean();

  // Group activities by entity (entityType + entityId)
  const entityMap = new Map();
  const entityDetailsCache = new Map();

  // First, get all unique entities and fetch their details
  const uniqueEntities = new Set();
  activities.forEach((activity) => {
    if (activity.entityId) {
      const entityKey = `${
        activity.entityType
      }_${activity.entityId.toString()}`;
      uniqueEntities.add(entityKey);
    }
  });

  // Fetch entity details for all unique entities
  await Promise.all(
    Array.from(uniqueEntities).map(async (entityKey) => {
      const [entityType, entityId] = entityKey.split("_");
      let entityName = "Unknown";
      let entityDetails = null;

      try {
        switch (entityType) {
          case "Deal":
            const deal = await Deal.findById(entityId)
              .select("name dealNumber value status assignedTo")
              .lean();
            if (deal) {
              entityName = deal.name || "Unknown Deal";
              entityDetails = {
                dealNumber: deal.dealNumber,
                value: deal.value,
                status: deal.status,
              };
            }
            break;
          case "Task":
            const task = await Task.findById(entityId)
              .select("title status priority assignedTo")
              .lean();
            if (task) {
              entityName = task.title || "Unknown Task";
              entityDetails = {
                status: task.status,
                priority: task.priority,
              };
            }
            break;
          case "Customer":
            const customer = await Customer.findById(entityId)
              .select("firstName lastName email status stage")
              .lean();
            if (customer) {
              entityName =
                `${customer.firstName || ""} ${
                  customer.lastName || ""
                }`.trim() ||
                customer.email ||
                "Unknown Customer";
              entityDetails = {
                email: customer.email,
                status: customer.status,
                stage: customer.stage,
              };
            }
            break;
          case "Lead":
            const lead = await Lead.findById(entityId)
              .select("name email status source")
              .lean();
            if (lead) {
              entityName = lead.name || "Unknown Lead";
              entityDetails = {
                email: lead.email,
                status: lead.status,
                source: lead.source,
              };
            }
            break;
          case "Company":
            const company = await Company.findById(entityId)
              .select("name industry status")
              .lean();
            if (company) {
              entityName = company.name || "Unknown Company";
              entityDetails = {
                industry: company.industry,
                status: company.status,
              };
            }
            break;
        }
      } catch (error) {
        console.error(`Error fetching entity details for ${entityKey}:`, error);
      }

      entityDetailsCache.set(entityKey, { entityName, entityDetails });
    })
  );

  // Group activities by entity
  activities.forEach((activity) => {
    if (activity.entityId) {
      const entityKey = `${
        activity.entityType
      }_${activity.entityId.toString()}`;
      const cached = entityDetailsCache.get(entityKey) || {
        entityName: "Unknown",
        entityDetails: null,
      };

      if (!entityMap.has(entityKey)) {
        entityMap.set(entityKey, {
          entityType: activity.entityType,
          entityId: activity.entityId.toString(),
          entityName: cached.entityName,
          entityDetails: cached.entityDetails,
          activities: [],
        });
      }

      entityMap.get(entityKey).activities.push({
        activityType: activity.activityType,
        description: activity.description || "No description",
        performedBy: activity.performedBy?.name || "System",
        performedByEmail: activity.performedBy?.email || "",
        category: activity.category || "general",
        priority: activity.priority || "medium",
        changes: activity.changes || null,
        // metadata: activity.metadata
        //   ? Object.fromEntries(activity.metadata)
        //   : {},
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt || activity.createdAt,
      });
    }
  });

  // Convert map to array and sort by most recent activity
  const groupedActivities = Array.from(entityMap.values()).map((entity) => ({
    ...entity,
    activityCount: entity.activities.length,
    lastActivity: entity.activities.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0]?.createdAt,
  }));

  // Sort by last activity date (most recent first)
  groupedActivities.sort(
    (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
  );

  // Sort activities within each entity by date (most recent first)
  groupedActivities.forEach((entity) => {
    entity.activities.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  });

  const totalActivities = activities.length;

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
    },
    groupedActivities: groupedActivities,
    summary: {
      total: totalActivities,
      totalEntities: groupedActivities.length,
      byType: activities.reduce((acc, activity) => {
        acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
        return acc;
      }, {}),
      byEntity: activities.reduce((acc, activity) => {
        acc[activity.entityType] = (acc[activity.entityType] || 0) + 1;
        return acc;
      }, {}),
      byUser: activities.reduce((acc, activity) => {
        const userName = activity.performedBy?.name || "System";
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
      }, {}),
      byCategory: activities.reduce((acc, activity) => {
        acc[activity.category] = (acc[activity.category] || 0) + 1;
        return acc;
      }, {}),
    },
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "Activities Report");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "Activities Report");
  } else {
    await generatePDFReport(res, reportData, "Activities Report");
  }
});

// Generate financial report
export const generateFinancialReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = "pdf", dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  let query = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: { $ne: true },
  };

  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate),
    };
  }

  const deals = await Deal.find(query)
    .populate("customer", "firstName lastName email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter((deal) => deal.status === "won");
  const lostDeals = deals.filter((deal) => deal.status === "lost");
  const openDeals = deals.filter((deal) => deal.status === "open");

  const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const lostValue = lostDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const openValue = openDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  // Calculate monthly revenue
  const monthlyRevenue = {};
  wonDeals.forEach((deal) => {
    const month = new Date(deal.updatedAt).toISOString().slice(0, 7); // YYYY-MM
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (deal.value || 0);
  });

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
    },
    financial: {
      totalDeals: deals.length,
      totalValue,
      wonDeals: wonDeals.length,
      wonValue,
      lostDeals: lostDeals.length,
      lostValue,
      openDeals: openDeals.length,
      openValue,
      winRate:
        deals.length > 0
          ? ((wonDeals.length / deals.length) * 100).toFixed(2)
          : 0,
      averageDealValue:
        deals.length > 0 ? (totalValue / deals.length).toFixed(2) : 0,
      monthlyRevenue,
    },
    deals: deals.map((deal) => ({
      name: deal.name,
      dealNumber: deal.dealNumber || "N/A",
      value: deal.value || 0,
      currency: deal.currency || "USD",
      status: deal.status,
      priority: deal.priority || "medium",
      customer: deal.customer
        ? `${deal.customer.firstName || ""} ${
            deal.customer.lastName || ""
          }`.trim() ||
          deal.customer.email ||
          "No Customer"
        : "No Customer",
      customerEmail: deal.customer?.email || "N/A",
      assignedTo: deal.assignedTo?.name || "Unassigned",
      assignedToEmail: deal.assignedTo?.email || "N/A",
      probability: deal.probability || 0,
      expectedCloseDate: deal.expectedCloseDate,
      actualCloseDate: deal.actualCloseDate || null,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    })),
    generatedAt: new Date(),
    generatedBy: req.user.name,
  };

  if (format === "json") {
    res.json({
      success: true,
      data: reportData,
    });
  } else if (format === "excel") {
    await generateExcelReport(res, reportData, "Financial Report");
  } else if (format === "csv") {
    await generateCSVReport(res, reportData, "Financial Report");
  } else {
    await generatePDFReport(res, reportData, "Financial Report");
  }
});

// Helper function to generate Excel reports
const generateExcelReport = async (res, data, reportName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportName);

  // Add headers and data based on report type
  if (data.overview) {
    // Overview report
    worksheet.addRow(["CRM Overview Report"]);
    worksheet.addRow(["Generated At:", data.generatedAt]);
    worksheet.addRow(["Generated By:", data.generatedBy]);
    worksheet.addRow([]);

    worksheet.addRow(["Companies:", data.overview.companies]);
    worksheet.addRow(["Customers:", data.overview.customers]);
    worksheet.addRow(["Deals:", data.overview.deals]);
    worksheet.addRow(["Leads:", data.overview.leads]);
    worksheet.addRow(["Tasks:", data.overview.tasks]);
    worksheet.addRow(["Events:", data.overview.events]);
    worksheet.addRow(["Total Deal Value:", data.overview.totalDealValue]);
    worksheet.addRow(["Completed Tasks:", data.overview.completedTasks]);
    worksheet.addRow(["Active Deals:", data.overview.activeDeals]);
  } else if (data.companies) {
    // Companies report
    worksheet.addRow([
      "Name",
      "Industry",
      "Status",
      "Size",
      "Website",
      "Email",
      "Phone",
      "Created At",
    ]);
    data.companies.forEach((company) => {
      worksheet.addRow([
        company.name,
        company.industry,
        company.status,
        company.size,
        company.website,
        company.email,
        company.phone,
        company.createdAt,
      ]);
    });
  } else if (data.customers) {
    // Customers report - Enhanced with all fields
    worksheet.addRow([
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Job Title",
      "Company",
      "Industry",
      "Status",
      "Stage",
      "Priority",
      "Score",
      "Source",
      "Lifecycle Stage",
      "Assigned To",
      "Assigned Email",
      "Owner",
      "Owner Email",
      "Address",
      "Social Links",
      "Tags",
      "Notes Count",
      "Interactions Count",
      "Deals Count",
      "Converted From Lead",
      "Converted At",
      "Converted By",
      "Created At",
      "Updated At",
    ]);
    data.customers.forEach((customer) => {
      worksheet.addRow([
        customer.firstName || "N/A",
        customer.lastName || "N/A",
        customer.email || "No Email",
        customer.phone || "No Phone",
        customer.jobTitle || "N/A",
        customer.company || "No Company",
        customer.companyIndustry || "Unknown",
        customer.status,
        customer.stage,
        customer.priority || "medium",
        customer.score || 0,
        customer.source || "other",
        customer.lifecycleStage || "awareness",
        customer.assignedTo || "Unassigned",
        customer.assignedToEmail || "N/A",
        customer.owner || "Unknown",
        customer.ownerEmail || "N/A",
        customer.address
          ? [
              customer.address.street,
              customer.address.city,
              customer.address.state,
              customer.address.zipCode,
              customer.address.country,
            ]
              .filter(Boolean)
              .join(", ")
          : "N/A",
        customer.socialLinks
          ? [
              customer.socialLinks.linkedin,
              customer.socialLinks.twitter,
              customer.socialLinks.website,
            ]
              .filter(Boolean)
              .join("; ")
          : "N/A",
        customer.tags ? customer.tags.join(", ") : "None",
        customer.notes || 0,
        customer.interactions || 0,
        customer.deals || 0,
        customer.convertedFromLead || "N/A",
        customer.convertedAt || "N/A",
        customer.convertedBy || "N/A",
        customer.createdAt,
        customer.updatedAt,
      ]);
    });
  } else if (data.deals && !data.financial) {
    // Deals report - Enhanced with all fields
    worksheet.addRow([
      "Deal Number",
      "Name",
      "Description",
      "Value",
      "Currency",
      "Status",
      "Priority",
      "Stage",
      "Probability",
      "Customer",
      "Customer Email",
      "Customer Phone",
      "Company",
      "Industry",
      "Assigned To",
      "Assigned Email",
      "Created By",
      "Source",
      "Expected Close Date",
      "Actual Close Date",
      "Tags",
      "Notes Count",
      "Activities Count",
      "Created At",
      "Updated At",
    ]);
    data.deals.forEach((deal) => {
      worksheet.addRow([
        deal.dealNumber || "N/A",
        deal.name,
        deal.description || "No description",
        deal.value || 0,
        deal.currency || "USD",
        deal.status,
        deal.priority || "medium",
        deal.stage,
        deal.probability || 0,
        deal.customer,
        deal.customerEmail || "N/A",
        deal.customerPhone || "N/A",
        deal.company,
        deal.companyIndustry || "N/A",
        deal.assignedTo,
        deal.assignedToEmail || "N/A",
        deal.createdBy,
        deal.source || "N/A",
        deal.expectedCloseDate || "N/A",
        deal.actualCloseDate || "N/A",
        deal.tags ? deal.tags.join(", ") : "None",
        deal.notes || 0,
        deal.activities || 0,
        deal.createdAt,
        deal.updatedAt,
      ]);
    });
  } else if (data.leads) {
    // Leads report - Enhanced with all fields
    worksheet.addRow([
      "Name",
      "Email",
      "Phone",
      "Job Title",
      "Company",
      "Industry",
      "Status",
      "Source",
      "Score",
      "Tags",
      "Assigned To",
      "Assigned Email",
      "Owner",
      "Owner Email",
      "Created By",
      "Created By Email",
      "Notes Count",
      "Tasks Count",
      "Converted At",
      "Converted By",
      "Created At",
      "Updated At",
    ]);
    data.leads.forEach((lead) => {
      worksheet.addRow([
        lead.name,
        lead.email || "N/A",
        lead.phone || "N/A",
        lead.jobTitle || "N/A",
        lead.company || "No Company",
        lead.companyIndustry || "N/A",
        lead.status,
        lead.source || "other",
        lead.score || 0,
        lead.tags ? lead.tags.join(", ") : "None",
        lead.assignedTo || "Unassigned",
        lead.assignedToEmail || "N/A",
        lead.owner || "Unknown",
        lead.ownerEmail || "N/A",
        lead.createdBy || "Unknown",
        lead.createdByEmail || "N/A",
        lead.notes || 0,
        lead.tasks || 0,
        lead.convertedAt || "N/A",
        lead.convertedBy || "N/A",
        lead.createdAt,
        lead.updatedAt,
      ]);
    });
  } else if (data.tasks) {
    // Tasks report
    worksheet.addRow([
      "Title",
      "Status",
      "Priority",
      "Type",
      "Assigned To",
      "Created By",
      "Due Date",
      "Created At",
    ]);
    data.tasks.forEach((task) => {
      worksheet.addRow([
        task.title,
        task.status,
        task.priority,
        task.type,
        task.assignedTo,
        task.createdBy,
        task.dueDate,
        task.createdAt,
      ]);
    });
  } else if (data.groupedActivities) {
    // Activities report - Grouped by entity
    worksheet.addRow([
      "Entity Type",
      "Entity ID",
      "Entity Name",
      "Activity Count",
      "Last Activity",
      "Activity Type",
      "Description",
      "Category",
      "Priority",
      "Performed By",
      "Performed By Email",
      "Changes Field",
      "Changes Old Value",
      "Changes New Value",
      "Created At",
    ]);
    data.groupedActivities.forEach((entity) => {
      entity.activities.forEach((activity, index) => {
        worksheet.addRow([
          entity.entityType || "N/A",
          entity.entityId || "N/A",
          entity.entityName || "N/A",
          index === 0 ? entity.activityCount : "", // Only show count in first row
          index === 0 ? entity.lastActivity : "", // Only show last activity in first row
          activity.activityType || "N/A",
          activity.description || "No description",
          activity.category || "general",
          activity.priority || "medium",
          activity.performedBy || "System",
          activity.performedByEmail || "N/A",
          activity.changes?.field || "N/A",
          activity.changes?.oldValue?.toString() || "N/A",
          activity.changes?.newValue?.toString() || "N/A",
          activity.createdAt,
        ]);
      });
    });
  } else if (data.activities) {
    // Activities report - Enhanced with all fields (fallback for old format)
    worksheet.addRow([
      "Entity Type",
      "Entity ID",
      "Entity Name",
      "Activity Type",
      "Description",
      "Category",
      "Priority",
      "Performed By",
      "Performed By Email",
      "Changes Field",
      "Changes Old Value",
      "Changes New Value",
      "Metadata",
      "Created At",
      "Updated At",
    ]);
    data.activities.forEach((activity) => {
      worksheet.addRow([
        activity.entityType || "N/A",
        activity.entityId || "N/A",
        activity.entityName || "N/A",
        activity.activityType || activity.type || "N/A",
        activity.description || "No description",
        activity.category || "general",
        activity.priority || "medium",
        activity.performedBy || activity.user || "System",
        activity.performedByEmail || "N/A",
        activity.changes?.field || "N/A",
        activity.changes?.oldValue?.toString() || "N/A",
        activity.changes?.newValue?.toString() || "N/A",
        activity.metadata
          ? Object.entries(activity.metadata)
              .map(([k, v]) => `${k}:${v}`)
              .join("; ")
          : "N/A",
        activity.createdAt,
        activity.updatedAt || activity.createdAt,
      ]);
    });
  } else if (data.members) {
    // Performance report - Enhanced version
    worksheet.addRow(["Performance Report Summary"]);
    if (data.teamAverages) {
      if (data.teamAverages.membersWithPerformance !== undefined) {
        worksheet.addRow([
          "Note:",
          `Performance is calculated for sales_executive, support_executive, and manager roles only. ${data.teamAverages.membersWithPerformance} out of ${data.teamAverages.totalMembers} members have performance tracking.`,
        ]);
        worksheet.addRow([]);
      }
      if (data.teamAverages.averagePerformanceScore !== undefined) {
        worksheet.addRow([
          "Team Average Performance Score:",
          data.teamAverages.averagePerformanceScore,
        ]);
        worksheet.addRow([
          "Team Average Completion Rate:",
          data.teamAverages.averageCompletionRate + "%",
        ]);
        worksheet.addRow([
          "Team Average Win Rate:",
          data.teamAverages.averageWinRate + "%",
        ]);
        worksheet.addRow(["Total Revenue:", data.teamAverages.totalRevenue]);
        worksheet.addRow(["Total Deals:", data.teamAverages.totalDeals]);
        worksheet.addRow(["Total Tasks:", data.teamAverages.totalTasks]);
      }
      worksheet.addRow([]);
    }
    worksheet.addRow(["Individual Performance"]);
    worksheet.addRow([
      "Name",
      "Email",
      "Role",
      "Performance Score",
      "Has Performance Tracking",
      "Tasks Total",
      "Tasks Completed",
      "Task Completion Rate",
      "On-Time Rate",
      "Deals Total",
      "Deals Won",
      "Deal Win Rate",
      "Total Deal Value",
      "Won Value",
      "Leads Total",
      "Leads Converted",
      "Lead Conversion Rate",
      "Customers Total",
      "Companies Total",
      "Activities Total",
    ]);
    data.members.forEach((member) => {
      worksheet.addRow([
        member.name,
        member.email,
        member.role,
        member.performanceScore !== null ? member.performanceScore : "N/A",
        member.hasPerformanceTracking ? "Yes" : "No",
        member.tasks?.total || 0,
        member.tasks?.completed || 0,
        member.tasks?.completionRate
          ? member.tasks.completionRate + "%"
          : "N/A",
        member.tasks?.onTimeRate ? member.tasks.onTimeRate + "%" : "N/A",
        member.deals?.total || 0,
        member.deals?.won || 0,
        member.deals?.winRate ? member.deals.winRate + "%" : "N/A",
        member.deals?.totalValue || 0,
        member.deals?.wonValue || 0,
        member.leads?.total || 0,
        member.leads?.converted || 0,
        member.leads?.conversionRate
          ? member.leads.conversionRate + "%"
          : "N/A",
        member.customers?.total || 0,
        member.companies?.total || 0,
        member.activities?.total || 0,
      ]);
    });
  } else if (data.financial) {
    // Financial report
    worksheet.addRow(["Financial Summary"]);
    worksheet.addRow(["Total Deals:", data.financial.totalDeals]);
    worksheet.addRow(["Total Value:", data.financial.totalValue]);
    worksheet.addRow(["Won Deals:", data.financial.wonDeals]);
    worksheet.addRow(["Won Value:", data.financial.wonValue]);
    worksheet.addRow(["Lost Deals:", data.financial.lostDeals]);
    worksheet.addRow(["Lost Value:", data.financial.lostValue]);
    worksheet.addRow(["Open Deals:", data.financial.openDeals]);
    worksheet.addRow(["Open Value:", data.financial.openValue]);
    worksheet.addRow(["Win Rate:", data.financial.winRate + "%"]);
    worksheet.addRow(["Average Deal Value:", data.financial.averageDealValue]);
    worksheet.addRow([]);
    worksheet.addRow(["Deal Details"]);
    worksheet.addRow([
      "Name",
      "Value",
      "Currency",
      "Status",
      "Customer",
      "Assigned To",
      "Probability",
      "Expected Close Date",
      "Created At",
    ]);
    data.deals.forEach((deal) => {
      worksheet.addRow([
        deal.name,
        deal.value,
        deal.currency,
        deal.status,
        deal.customer,
        deal.assignedTo,
        deal.probability,
        deal.expectedCloseDate,
        deal.createdAt,
      ]);
    });
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${reportName.replace(/\s+/g, "_")}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
};

// Helper function to generate PDF reports using HTML templates
const generatePDFReport = async (res, data, reportName) => {
  try {
    // Determine report type from data structure
    let reportType = "overview";
    if (data.companies) reportType = "companies";
    else if (data.customers) reportType = "customers";
    else if (data.deals && data.financial) reportType = "financial";
    else if (data.deals) reportType = "deals";
    else if (data.leads) reportType = "leads";
    else if (data.tasks) reportType = "tasks";
    else if (data.groupedActivities) reportType = "activities";
    else if (data.activities) reportType = "activities";
    else if (data.members) reportType = "performance";

    // Generate HTML content
    const html = getReportHTML(data, reportName, reportType);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF with better page handling
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15px",
        right: "15px",
        bottom: "15px",
        left: "15px",
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    // Set headers and send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${reportName.replace(/\s+/g, "_")}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF report:", error);
    // Fallback to basic PDF if Puppeteer fails
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${reportName.replace(/\s+/g, "_")}.pdf"`
    );
    doc.pipe(res);
    doc.fontSize(20).text(reportName, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Generated At: ${data.generatedAt}`, { align: "left" });
    doc.text(`Generated By: ${data.generatedBy}`, { align: "left" });
    doc.text("Error generating styled report. Please try again.", {
      align: "left",
    });
    doc.end();
  }
};

// Helper function to generate CSV reports
const generateCSVReport = async (res, data, reportName) => {
  let csvContent = "";

  // Add headers and data based on report type
  if (data.overview) {
    // Overview report
    csvContent += "Metric,Value\n";
    csvContent += `Companies,${data.overview.companies}\n`;
    csvContent += `Customers,${data.overview.customers}\n`;
    csvContent += `Deals,${data.overview.deals}\n`;
    csvContent += `Leads,${data.overview.leads}\n`;
    csvContent += `Tasks,${data.overview.tasks}\n`;
    csvContent += `Events,${data.overview.events}\n`;
    csvContent += `Total Deal Value,${data.overview.totalDealValue}\n`;
    csvContent += `Completed Tasks,${data.overview.completedTasks}\n`;
    csvContent += `Active Deals,${data.overview.activeDeals}\n`;
  } else if (data.companies) {
    // Companies report
    csvContent += "Name,Industry,Status,Size,Website,Email,Phone,Created At\n";
    data.companies.forEach((company) => {
      csvContent += `"${company.name}","${company.industry}","${company.status}","${company.size}","${company.website}","${company.email}","${company.phone}","${company.createdAt}"\n`;
    });
  } else if (data.customers) {
    // Customers report - Enhanced with all fields
    csvContent +=
      "First Name,Last Name,Email,Phone,Job Title,Company,Industry,Status,Stage,Priority,Score,Source,Lifecycle Stage,Assigned To,Assigned Email,Owner,Owner Email,Address,Social Links,Tags,Notes Count,Interactions Count,Deals Count,Converted From Lead,Converted At,Converted By,Created At,Updated At\n";
    data.customers.forEach((customer) => {
      const address = customer.address
        ? [
            customer.address.street,
            customer.address.city,
            customer.address.state,
            customer.address.zipCode,
            customer.address.country,
          ]
            .filter(Boolean)
            .join(", ")
        : "N/A";
      const socialLinks = customer.socialLinks
        ? [
            customer.socialLinks.linkedin,
            customer.socialLinks.twitter,
            customer.socialLinks.website,
          ]
            .filter(Boolean)
            .join("; ")
        : "N/A";
      csvContent += `"${customer.firstName || "N/A"}","${
        customer.lastName || "N/A"
      }","${customer.email || "No Email"}","${customer.phone || "No Phone"}","${
        customer.jobTitle || "N/A"
      }","${customer.company || "No Company"}","${
        customer.companyIndustry || "Unknown"
      }","${customer.status}","${customer.stage}","${
        customer.priority || "medium"
      }","${customer.score || 0}","${customer.source || "other"}","${
        customer.lifecycleStage || "awareness"
      }","${customer.assignedTo || "Unassigned"}","${
        customer.assignedToEmail || "N/A"
      }","${customer.owner || "Unknown"}","${
        customer.ownerEmail || "N/A"
      }","${address.replace(/"/g, '""')}","${socialLinks.replace(
        /"/g,
        '""'
      )}","${customer.tags ? customer.tags.join("; ") : "None"}","${
        customer.notes || 0
      }","${customer.interactions || 0}","${customer.deals || 0}","${
        customer.convertedFromLead || "N/A"
      }","${customer.convertedAt || "N/A"}","${
        customer.convertedBy || "N/A"
      }","${customer.createdAt}","${customer.updatedAt}"\n`;
    });
  } else if (data.deals) {
    // Deals report - Enhanced with all fields
    csvContent +=
      "Deal Number,Name,Description,Value,Currency,Status,Priority,Stage,Probability,Customer,Customer Email,Customer Phone,Company,Industry,Assigned To,Assigned Email,Created By,Source,Expected Close Date,Actual Close Date,Tags,Notes Count,Activities Count,Created At,Updated At\n";
    data.deals.forEach((deal) => {
      csvContent += `"${deal.dealNumber || "N/A"}","${deal.name}","${(
        deal.description || "No description"
      ).replace(/"/g, '""')}","${deal.value || 0}","${
        deal.currency || "USD"
      }","${deal.status}","${deal.priority || "medium"}","${deal.stage}","${
        deal.probability || 0
      }","${deal.customer}","${deal.customerEmail || "N/A"}","${
        deal.customerPhone || "N/A"
      }","${deal.company}","${deal.companyIndustry || "N/A"}","${
        deal.assignedTo
      }","${deal.assignedToEmail || "N/A"}","${deal.createdBy}","${
        deal.source || "N/A"
      }","${deal.expectedCloseDate || "N/A"}","${
        deal.actualCloseDate || "N/A"
      }","${deal.tags ? deal.tags.join("; ") : "None"}","${deal.notes || 0}","${
        deal.activities || 0
      }","${deal.createdAt}","${deal.updatedAt}"\n`;
    });
  } else if (data.leads) {
    // Leads report - Enhanced with all fields
    csvContent +=
      "Name,Email,Phone,Job Title,Company,Industry,Status,Source,Score,Tags,Assigned To,Assigned Email,Owner,Owner Email,Created By,Created By Email,Notes Count,Tasks Count,Converted At,Converted By,Created At,Updated At\n";
    data.leads.forEach((lead) => {
      csvContent += `"${lead.name}","${lead.email || "N/A"}","${
        lead.phone || "N/A"
      }","${lead.jobTitle || "N/A"}","${lead.company || "No Company"}","${
        lead.companyIndustry || "N/A"
      }","${lead.status}","${lead.source || "other"}","${lead.score || 0}","${
        lead.tags ? lead.tags.join("; ") : "None"
      }","${lead.assignedTo || "Unassigned"}","${
        lead.assignedToEmail || "N/A"
      }","${lead.owner || "Unknown"}","${lead.ownerEmail || "N/A"}","${
        lead.createdBy || "Unknown"
      }","${lead.createdByEmail || "N/A"}","${lead.notes || 0}","${
        lead.tasks || 0
      }","${lead.convertedAt || "N/A"}","${lead.convertedBy || "N/A"}","${
        lead.createdAt
      }","${lead.updatedAt}"\n`;
    });
  } else if (data.tasks) {
    // Tasks report
    csvContent +=
      "Title,Status,Priority,Type,Assigned To,Created By,Due Date,Created At\n";
    data.tasks.forEach((task) => {
      csvContent += `"${task.title}","${task.status}","${task.priority}","${task.type}","${task.assignedTo}","${task.createdBy}","${task.dueDate}","${task.createdAt}"\n`;
    });
  } else if (data.groupedActivities) {
    // Activities report - Grouped by entity
    csvContent +=
      "Entity Type,Entity ID,Entity Name,Activity Count,Last Activity,Activity Type,Description,Category,Priority,Performed By,Performed By Email,Changes Field,Changes Old Value,Changes New Value,Created At\n";
    data.groupedActivities.forEach((entity) => {
      entity.activities.forEach((activity, index) => {
        csvContent += `"${entity.entityType || "N/A"}","${
          entity.entityId || "N/A"
        }","${entity.entityName || "N/A"}","${
          index === 0 ? entity.activityCount : ""
        }","${index === 0 ? entity.lastActivity : ""}","${
          activity.activityType || "N/A"
        }","${(activity.description || "No description").replace(
          /"/g,
          '""'
        )}","${activity.category || "general"}","${
          activity.priority || "medium"
        }","${activity.performedBy || "System"}","${
          activity.performedByEmail || "N/A"
        }","${activity.changes?.field || "N/A"}","${(
          activity.changes?.oldValue?.toString() || "N/A"
        ).replace(/"/g, '""')}","${(
          activity.changes?.newValue?.toString() || "N/A"
        ).replace(/"/g, '""')}","${activity.createdAt}"\n`;
      });
    });
  } else if (data.activities) {
    // Activities report - Enhanced with all fields (fallback for old format)
    csvContent +=
      "Entity Type,Entity ID,Entity Name,Activity Type,Description,Category,Priority,Performed By,Performed By Email,Changes Field,Changes Old Value,Changes New Value,Metadata,Created At,Updated At\n";
    data.activities.forEach((activity) => {
      const metadata = activity.metadata
        ? Object.entries(activity.metadata)
            .map(([k, v]) => `${k}:${v}`)
            .join("; ")
        : "N/A";
      csvContent += `"${activity.entityType || "N/A"}","${
        activity.entityId || "N/A"
      }","${activity.entityName || "N/A"}","${
        activity.activityType || activity.type || "N/A"
      }","${(activity.description || "No description").replace(/"/g, '""')}","${
        activity.category || "general"
      }","${activity.priority || "medium"}","${
        activity.performedBy || activity.user || "System"
      }","${activity.performedByEmail || "N/A"}","${
        activity.changes?.field || "N/A"
      }","${(activity.changes?.oldValue?.toString() || "N/A").replace(
        /"/g,
        '""'
      )}","${(activity.changes?.newValue?.toString() || "N/A").replace(
        /"/g,
        '""'
      )}","${metadata.replace(/"/g, '""')}","${activity.createdAt}","${
        activity.updatedAt || activity.createdAt
      }"\n`;
    });
  } else if (data.members) {
    // Performance report - Enhanced version
    csvContent += "Performance Report Summary\n";
    if (data.teamAverages) {
      if (data.teamAverages.membersWithPerformance !== undefined) {
        csvContent += `Note,"Performance is calculated for sales_executive, support_executive, and manager roles only. ${data.teamAverages.membersWithPerformance} out of ${data.teamAverages.totalMembers} members have performance tracking."\n`;
        csvContent += "\n";
      }
      if (data.teamAverages.averagePerformanceScore !== undefined) {
        csvContent += `Team Average Performance Score,${data.teamAverages.averagePerformanceScore}\n`;
        csvContent += `Team Average Completion Rate,${data.teamAverages.averageCompletionRate}%\n`;
        csvContent += `Team Average Win Rate,${data.teamAverages.averageWinRate}%\n`;
        csvContent += `Total Revenue,${data.teamAverages.totalRevenue}\n`;
        csvContent += `Total Deals,${data.teamAverages.totalDeals}\n`;
        csvContent += `Total Tasks,${data.teamAverages.totalTasks}\n`;
      }
      csvContent += "\n";
    }
    csvContent += "Individual Performance\n";
    csvContent +=
      "Name,Email,Role,Performance Score,Has Performance Tracking,Tasks Total,Tasks Completed,Task Completion Rate,On-Time Rate,Deals Total,Deals Won,Deal Win Rate,Total Deal Value,Won Value,Leads Total,Leads Converted,Lead Conversion Rate,Customers Total,Companies Total,Activities Total\n";
    data.members.forEach((member) => {
      csvContent += `"${member.name}","${member.email}","${member.role}","${
        member.performanceScore !== null ? member.performanceScore : "N/A"
      }","${member.hasPerformanceTracking ? "Yes" : "No"}","${
        member.tasks?.total || 0
      }","${member.tasks?.completed || 0}","${
        member.tasks?.completionRate ? member.tasks.completionRate + "%" : "N/A"
      }","${
        member.tasks?.onTimeRate ? member.tasks.onTimeRate + "%" : "N/A"
      }","${member.deals?.total || 0}","${member.deals?.won || 0}","${
        member.deals?.winRate ? member.deals.winRate + "%" : "N/A"
      }","${member.deals?.totalValue || 0}","${member.deals?.wonValue || 0}","${
        member.leads?.total || 0
      }","${member.leads?.converted || 0}","${
        member.leads?.conversionRate ? member.leads.conversionRate + "%" : "N/A"
      }","${member.customers?.total || 0}","${member.companies?.total || 0}","${
        member.activities?.total || 0
      }"\n`;
    });
  } else if (data.financial) {
    // Financial report
    csvContent += "Metric,Value\n";
    csvContent += `Total Deals,${data.financial.totalDeals}\n`;
    csvContent += `Total Value,${data.financial.totalValue}\n`;
    csvContent += `Won Deals,${data.financial.wonDeals}\n`;
    csvContent += `Won Value,${data.financial.wonValue}\n`;
    csvContent += `Lost Deals,${data.financial.lostDeals}\n`;
    csvContent += `Lost Value,${data.financial.lostValue}\n`;
    csvContent += `Open Deals,${data.financial.openDeals}\n`;
    csvContent += `Open Value,${data.financial.openValue}\n`;
    csvContent += `Win Rate,${data.financial.winRate}%\n`;
    csvContent += `Average Deal Value,${data.financial.averageDealValue}\n`;
    csvContent += "\nDeal Details\n";
    csvContent +=
      "Name,Value,Currency,Status,Customer,Assigned To,Probability,Expected Close Date,Created At\n";
    data.deals.forEach((deal) => {
      csvContent += `"${deal.name}","${deal.value}","${deal.currency}","${deal.status}","${deal.customer}","${deal.assignedTo}","${deal.probability}","${deal.expectedCloseDate}","${deal.createdAt}"\n`;
    });
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${reportName.replace(/\s+/g, "_")}.csv"`
  );
  res.send(csvContent);
};

// Main report generation endpoint
export const generateReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { reportType, format = "pdf", dateRange = {}, filters = {} } = req.body;

  if (!reportType) {
    throw new ValidationError("Report type is required");
  }

  // For performance report, merge filters into req.body so generatePerformanceReport can access them
  if (reportType === "performance") {
    req.body.userId = filters.userId || req.body.userId;
  }

  switch (reportType) {
    case "overview":
      return generateOverviewReport(req, res);
    case "companies":
      return generateCompaniesReport(req, res);
    case "customers":
      return generateCustomersReport(req, res);
    case "deals":
      return generateDealsReport(req, res);
    case "leads":
      return generateLeadsReport(req, res);
    case "tasks":
      return generateTasksReport(req, res);
    case "activities":
      return generateActivitiesReport(req, res);
    case "performance":
      return generatePerformanceReport(req, res);
    case "financial":
      return generateFinancialReport(req, res);
    default:
      throw new ValidationError("Invalid report type");
  }
});
