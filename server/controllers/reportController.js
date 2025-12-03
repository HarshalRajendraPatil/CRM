import { asyncHandler } from '../middleware/errorHandler.js';
import Project  from '../models/Project.model.js';
import Company  from '../models/Company.model.js';
import Customer  from '../models/Customer.model.js';
import Deal  from '../models/Deal.model.js';
import Lead  from '../models/Lead.model.js';
import Task  from '../models/Task.model.js';
import CalendarEvent  from '../models/CalendarEvent.model.js';
import Activity  from '../models/Activity.model.js';
import User  from '../models/User.model.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';
import puppeteer from 'puppeteer';
import { getReportHTML } from '../utils/reportTemplates.js';
import { calculateUserPerformance, getTeamPerformance } from '../utils/performanceService.js';

// Generate comprehensive CRM overview report
export const generateOverviewReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
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
    convertedLeads
  ] = await Promise.all([
    Company.countDocuments({ project:  new mongoose.Types.ObjectId(projectId) }),
    Customer.countDocuments({ project:  new mongoose.Types.ObjectId(projectId) }),
    Deal.countDocuments({ project:  new mongoose.Types.ObjectId(projectId) }),
    Lead.countDocuments({ project:  new mongoose.Types.ObjectId(projectId) }),
    Task.countDocuments({ project:  new mongoose.Types.ObjectId(projectId) }),
    CalendarEvent.countDocuments({ project:  new mongoose.Types.ObjectId(projectId) }),
    Deal.aggregate([
      { $match: { project:  new mongoose.Types.ObjectId(projectId), status: { $ne: 'lost' } } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]),
    Task.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'completed' }),
    Deal.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'open' }),
    Deal.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'won' }),
    Deal.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'lost' }),
    Deal.aggregate([
      { $match: { project:  new mongoose.Types.ObjectId(projectId), status: 'won' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]),
    Task.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'pending' }),
    Task.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'in-progress' }),
    Task.countDocuments({ 
      project: new mongoose.Types.ObjectId(projectId),
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    }),
    Customer.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'active' }),
    Lead.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'new' }),
    Lead.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'converted' })
  ]);

  const reportData = {
    project: {
      name: project.name,
      description: project.description,
      createdAt: project.createdAt
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
      taskCompletionRate: tasksCount > 0 ? ((completedTasks / tasksCount) * 100).toFixed(2) : 0,
      dealWinRate: dealsCount > 0 ? ((wonDeals / dealsCount) * 100).toFixed(2) : 0,
      leadConversionRate: leadsCount > 0 ? ((convertedLeads / leadsCount) * 100).toFixed(2) : 0
    },
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'CRM Overview');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'CRM Overview');
  } else {
    await generatePDFReport(res, reportData, 'CRM Overview');
  }
});

// Generate companies report
export const generateCompaniesReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  let query = { project:  new mongoose.Types.ObjectId(projectId) };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }

  // Apply additional filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.industry) {
    query.industry = filters.industry;
  }

  const companies = await Company.find(query)
    .sort({ createdAt: -1 });

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    companies: companies.map(company => ({
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
      }, {})
    },
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'Companies Report');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'Companies Report');
  } else {
    await generatePDFReport(res, reportData, 'Companies Report');
  }
});

// Generate deals report
export const generateDealsReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  let query = { projectId: new mongoose.Types.ObjectId(projectId), isArchived: { $ne: true } };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
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
    .populate('customer', 'firstName lastName email phone')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('company', 'name industry')
    .sort({ createdAt: -1 });

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter(deal => deal.status === 'won');
  const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const lostDeals = deals.filter(deal => deal.status === 'lost');
  const openDeals = deals.filter(deal => deal.status === 'open');

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    deals: deals.map(deal => ({
      name: deal.name,
      dealNumber: deal.dealNumber || 'N/A',
      description: deal.description || 'No description',
      value: deal.value || 0,
      currency: deal.currency || 'USD',
      status: deal.status,
      priority: deal.priority || 'medium',
      stage: deal.stage?.name || 'No Stage',
      customer: deal.customer ? `${deal.customer.firstName || ''} ${deal.customer.lastName || ''}`.trim() || deal.customer.email || 'No Customer' : 'No Customer',
      customerEmail: deal.customer?.email || 'N/A',
      customerPhone: deal.customer?.phone || 'N/A',
      company: deal.company?.name || 'No Company',
      companyIndustry: deal.company?.industry || 'N/A',
      assignedTo: deal.assignedTo?.name || 'Unassigned',
      assignedToEmail: deal.assignedTo?.email || 'N/A',
      createdBy: deal.createdBy?.name || 'Unknown',
      probability: deal.probability || 0,
      expectedCloseDate: deal.expectedCloseDate,
      actualCloseDate: deal.actualCloseDate || null,
      source: deal.source || 'N/A',
      tags: deal.tags || [],
      notes: deal.notes?.length || 0,
      activities: deal.activities?.length || 0,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt
    })),
    summary: {
      total: deals.length,
      totalValue,
      wonValue,
      winRate: deals.length > 0 ? (wonDeals.length / deals.length * 100).toFixed(2) : 0,
      byStatus: deals.reduce((acc, deal) => {
        acc[deal.status] = (acc[deal.status] || 0) + 1;
        return acc;
      }, {}),
      byStage: deals.reduce((acc, deal) => {
        const stage = deal.stage?.name || 'No Stage';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {})
    },
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'Deals Report');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'Deals Report');
  } else {
    await generatePDFReport(res, reportData, 'Deals Report');
  }
});

// Generate leads report
export const generateLeadsReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  let query = { project:  new mongoose.Types.ObjectId(projectId) };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
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
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    leads: leads.map(lead => ({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: lead.status,
      source: lead.source,
      score: lead.score,
      assignedTo: lead.assignedTo?.name || 'Unassigned',
      createdAt: lead.createdAt,
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
      averageScore: leads.length > 0 ? 
        (leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length).toFixed(2) : 0
    },
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'Leads Report');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'Leads Report');
  } else {
    await generatePDFReport(res, reportData, 'Leads Report');
  }
});

// Generate tasks report
export const generateTasksReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  let query = { project:  new mongoose.Types.ObjectId(projectId) };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
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
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  );

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    tasks: tasks.map(task => ({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      assignedTo: task.assignedTo?.name || 'Unassigned',
      createdBy: task.createdBy?.name || 'Unknown',
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      tags: task.tags
    })),
    summary: {
      total: tasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(2) : 0,
      byStatus: tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {})
    },
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'Tasks Report');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'Tasks Report');
  } else {
    await generatePDFReport(res, reportData, 'Tasks Report');
  }
});

// Generate performance report
export const generatePerformanceReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {}, filters = {} } = req.body;
  const userId = filters.userId || req.body.userId; // Support both locations

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const requestingUser = req.user;

  // Get requesting user's role in this project
  const userRole = requestingUser.getProjectRole?.(projectId) || 
    (requestingUser.ownedProjects?.includes(projectId) ? 'owner' : 
    requestingUser.projectMembers?.find(m => m.project.toString() === projectId.toString())?.role);

  // Build query to get project members
  let membersQuery = {
    $or: [
      { ownedProjects: projectObjectId },
      { 'projectMembers.project': projectObjectId }
    ],
    isActive: { $ne: false } // Only active users
  };
  
  // If specific userId is provided, only get that user's performance
  if (userId) {
    membersQuery._id = new mongoose.Types.ObjectId(userId);
  } else {
    // Filter based on requesting user's role
    if (userRole === 'owner' || userRole === 'admin') {
      // Owner and admin can see all members - no additional filter
    } else if (userRole === 'manager') {
      // Manager can see sales_executive, support_executive, and themselves
      // We'll filter after fetching based on project role
    } else {
      // Others can only see themselves
      membersQuery._id = requestingUser._id;
    }
  }

  // Get all matching users
  let members = await User.find(membersQuery)
    .select('name email profileImage ownedProjects projectMembers')
    .lean();

  // Filter members based on their project role and requesting user's permissions
  members = members
    .map(member => {
      const memberRole = member.ownedProjects?.some(p => p.toString() === projectId) ? 'owner' : 
        member.projectMembers?.find(m => m.project.toString() === projectId)?.role;
      
      // If requesting user is owner/admin, include all
      if (userRole === 'owner' || userRole === 'admin') {
        return { ...member, role: memberRole };
      }
      // If requesting user is manager, include sales_executive, support_executive, and themselves
      else if (userRole === 'manager') {
        if (memberRole === 'sales_executive' || 
            memberRole === 'support_executive' || 
            memberRole === 'manager' ||
            member._id.toString() === requestingUser._id.toString()) {
          return { ...member, role: memberRole };
        }
      }
      // Others can only see themselves
      else if (member._id.toString() === requestingUser._id.toString()) {
        return { ...member, role: memberRole };
      }
      return null;
    })
    .filter(member => member !== null);

  // Get comprehensive performance data for each member using performanceService
  const membersPerformance = await Promise.all(
    members.map(async (member) => {
      try {
        const performance = await calculateUserPerformance(member._id.toString(), projectId, dateRange);

      return {
          userId: member._id.toString(),
        name: member.name,
        email: member.email,
          role: member.role || 'viewer',
          performanceScore: performance.performanceScore || 0,
          deals: {
            total: performance.deals?.total || 0,
            open: performance.deals?.open || 0,
            won: performance.deals?.won || 0,
            lost: performance.deals?.lost || 0,
            winRate: performance.deals?.winRate || '0',
            totalValue: performance.deals?.totalValue || 0,
            wonValue: performance.deals?.wonValue || 0,
            lostValue: performance.deals?.lostValue || 0,
            averageValue: performance.deals?.averageValue || 0
          },
        tasks: {
            total: performance.tasks?.total || 0,
            completed: performance.tasks?.completed || 0,
            pending: performance.tasks?.pending || 0,
            inProgress: performance.tasks?.inProgress || 0,
            overdue: performance.tasks?.overdue || 0,
            onTime: performance.tasks?.onTime || 0,
            completionRate: performance.tasks?.completionRate || '0',
            onTimeRate: performance.tasks?.onTimeRate || '0'
          },
          customers: {
            total: performance.customers?.total || 0,
            active: performance.customers?.active || 0,
            new: performance.customers?.new || 0
          },
          leads: {
            total: performance.leads?.total || 0,
            new: performance.leads?.new || 0,
            contacted: performance.leads?.contacted || 0,
            qualified: performance.leads?.qualified || 0,
            converted: performance.leads?.converted || 0,
            conversionRate: performance.leads?.conversionRate || '0'
          },
          companies: {
            total: performance.companies?.total || 0,
            active: performance.companies?.active || 0
          },
          activities: {
            total: performance.activities?.total || 0,
            byCategory: performance.activities?.byCategory || {}
          },
          events: {
            total: performance.events?.total || 0,
            upcoming: performance.events?.upcoming || 0,
            completed: performance.events?.completed || 0
          },
          summary: performance.summary || {}
        };
      } catch (error) {
        console.error(`Error calculating performance for user ${member._id}:`, error);
        // Return empty performance data if calculation fails
        return {
          userId: member._id.toString(),
          name: member.name,
          email: member.email,
          role: member.role || 'viewer',
          performanceScore: 0,
          deals: { total: 0, open: 0, won: 0, lost: 0, winRate: '0', totalValue: 0, wonValue: 0, lostValue: 0, averageValue: 0 },
          tasks: { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0, onTime: 0, completionRate: '0', onTimeRate: '0' },
          customers: { total: 0, active: 0, new: 0 },
          leads: { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, conversionRate: '0' },
          companies: { total: 0, active: 0 },
          activities: { total: 0, byCategory: {} },
          events: { total: 0, upcoming: 0, completed: 0 },
          summary: {}
        };
      }
    })
  );

  // Calculate team averages
  const teamAverages = membersPerformance.length > 0 ? {
    averagePerformanceScore: (
      membersPerformance.reduce((sum, m) => sum + (m.performanceScore || 0), 0) / membersPerformance.length
    ).toFixed(2),
    averageCompletionRate: (
      membersPerformance.reduce((sum, m) => sum + parseFloat(m.tasks.completionRate || 0), 0) / membersPerformance.length
    ).toFixed(2),
    averageWinRate: (
      membersPerformance.reduce((sum, m) => sum + parseFloat(m.deals.winRate || 0), 0) / membersPerformance.length
    ).toFixed(2),
    totalRevenue: membersPerformance.reduce((sum, m) => sum + (m.deals.wonValue || 0), 0),
    totalDeals: membersPerformance.reduce((sum, m) => sum + (m.deals.total || 0), 0),
    totalTasks: membersPerformance.reduce((sum, m) => sum + (m.tasks.total || 0), 0)
  } : {};

  // Log for debugging
  console.log(`Performance Report: Found ${members.length} members, ${membersPerformance.length} performance records`);

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    dateRange: dateRange,
    members: membersPerformance,
    teamAverages: teamAverages,
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'Performance Report');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'Performance Report');
  } else {
    await generatePDFReport(res, reportData, 'Performance Report');
  }
});

// Generate customers report
export const generateCustomersReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  let query = { project:  new mongoose.Types.ObjectId(projectId) };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }

  // Apply additional filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.stage) {
    query.stage = filters.stage;
  }

  const customers = await Customer.find(query)
    .populate('assignedTo', 'name email')
    .populate('company', 'name industry')
    .sort({ createdAt: -1 });

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    customers: customers.map(customer => ({
      name: customer.firstName + ' ' + customer.lastName,
      email: customer.email || 'No Email',
      phone: customer.phone || 'No Phone',
      company: customer.company?.name || 'No Company',
      industry: customer.company?.industry || 'Unknown',
      status: customer.status,
      stage: customer.stage,
      priority: customer.priority,
      score: customer.score,
      assignedTo: customer.assignedTo?.name || 'Unassigned',
      createdAt: customer.createdAt,
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
      averageScore: customers.length > 0 ? 
        (customers.reduce((sum, customer) => sum + (customer.score || 0), 0) / customers.length).toFixed(2) : 0
    },
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'Customers Report');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'Customers Report');
  } else {
    await generatePDFReport(res, reportData, 'Customers Report');
  }
});

// Generate activities report
export const generateActivitiesReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Build query for Activity model
  const query = { project: new mongoose.Types.ObjectId(projectId) };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
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
    .populate('performedBy', 'name email')
    .populate('entityId')
    .sort({ createdAt: -1 })
    .lean();

  // Get entity names for each activity
  const allActivities = await Promise.all(activities.map(async (activity) => {
    let entityName = 'Unknown';
    
    // Get entity name based on entity type
    if (activity.entityId) {
      switch (activity.entityType) {
        case 'Deal':
          const deal = await Deal.findById(activity.entityId).select('name assignedTo').lean();
          entityName = deal?.name || 'Unknown Deal';
          break;
        case 'Task':
          const task = await Task.findById(activity.entityId).select('title assignedTo').lean();
          entityName = task?.title || 'Unknown Task';
          break;
        case 'Customer':
          const customer = await Customer.findById(activity.entityId).select('name assignedTo').lean();
          entityName = customer?.name || 'Unknown Customer';
          break;
        case 'Lead':
          const lead = await Lead.findById(activity.entityId).select('name assignedTo').lean();
          entityName = lead?.name || 'Unknown Lead';
          break;
        case 'Company':
          const company = await Company.findById(activity.entityId).select('name').lean();
          entityName = company?.name || 'Unknown Company';
          break;
      }
    }

    return {
      entityType: activity.entityType,
      entityName: entityName,
      type: activity.activityType,
          description: activity.description,
      user: activity.performedBy?.name || 'System',
      userEmail: activity.performedBy?.email || '',
      category: activity.category,
      priority: activity.priority,
      changes: activity.changes,
      createdAt: activity.createdAt
    };
  }));

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    activities: allActivities,
    summary: {
      total: allActivities.length,
      byType: allActivities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {}),
      byEntity: allActivities.reduce((acc, activity) => {
        acc[activity.entityType] = (acc[activity.entityType] || 0) + 1;
        return acc;
      }, {}),
      byUser: allActivities.reduce((acc, activity) => {
        acc[activity.user] = (acc[activity.user] || 0) + 1;
        return acc;
      }, {}),
      byCategory: allActivities.reduce((acc, activity) => {
        acc[activity.category] = (acc[activity.category] || 0) + 1;
        return acc;
      }, {})
    },
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'Activities Report');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'Activities Report');
  } else {
    await generatePDFReport(res, reportData, 'Activities Report');
  }
});

// Generate financial report
export const generateFinancialReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {}, filters = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  let query = { projectId: new mongoose.Types.ObjectId(projectId), isArchived: { $ne: true } };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }

  const deals = await Deal.find(query)
    .populate('customer', 'firstName lastName email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter(deal => deal.status === 'won');
  const lostDeals = deals.filter(deal => deal.status === 'lost');
  const openDeals = deals.filter(deal => deal.status === 'open');
  
  const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const lostValue = lostDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const openValue = openDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  // Calculate monthly revenue
  const monthlyRevenue = {};
  wonDeals.forEach(deal => {
    const month = new Date(deal.updatedAt).toISOString().slice(0, 7); // YYYY-MM
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (deal.value || 0);
  });

  const reportData = {
    project: {
      name: project.name,
      description: project.description
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
      winRate: deals.length > 0 ? (wonDeals.length / deals.length * 100).toFixed(2) : 0,
      averageDealValue: deals.length > 0 ? (totalValue / deals.length).toFixed(2) : 0,
      monthlyRevenue
    },
    deals: deals.map(deal => ({
      name: deal.name,
      dealNumber: deal.dealNumber || 'N/A',
      value: deal.value || 0,
      currency: deal.currency || 'USD',
      status: deal.status,
      priority: deal.priority || 'medium',
      customer: deal.customer ? `${deal.customer.firstName || ''} ${deal.customer.lastName || ''}`.trim() || deal.customer.email || 'No Customer' : 'No Customer',
      customerEmail: deal.customer?.email || 'N/A',
      assignedTo: deal.assignedTo?.name || 'Unassigned',
      assignedToEmail: deal.assignedTo?.email || 'N/A',
      probability: deal.probability || 0,
      expectedCloseDate: deal.expectedCloseDate,
      actualCloseDate: deal.actualCloseDate || null,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt
    })),
    generatedAt: new Date(),
    generatedBy: req.user.name
  };

  if (format === 'json') {
    res.json({
      success: true,
      data: reportData
    });
  } else if (format === 'excel') {
    await generateExcelReport(res, reportData, 'Financial Report');
  } else if (format === 'csv') {
    await generateCSVReport(res, reportData, 'Financial Report');
  } else {
    await generatePDFReport(res, reportData, 'Financial Report');
  }
});

// Helper function to generate Excel reports
const generateExcelReport = async (res, data, reportName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportName);

  // Add headers and data based on report type
  if (data.overview) {
    // Overview report
    worksheet.addRow(['CRM Overview Report']);
    worksheet.addRow(['Generated At:', data.generatedAt]);
    worksheet.addRow(['Generated By:', data.generatedBy]);
    worksheet.addRow([]);
    
    worksheet.addRow(['Companies:', data.overview.companies]);
    worksheet.addRow(['Customers:', data.overview.customers]);
    worksheet.addRow(['Deals:', data.overview.deals]);
    worksheet.addRow(['Leads:', data.overview.leads]);
    worksheet.addRow(['Tasks:', data.overview.tasks]);
    worksheet.addRow(['Events:', data.overview.events]);
    worksheet.addRow(['Total Deal Value:', data.overview.totalDealValue]);
    worksheet.addRow(['Completed Tasks:', data.overview.completedTasks]);
    worksheet.addRow(['Active Deals:', data.overview.activeDeals]);
  } else if (data.companies) {
    // Companies report
    worksheet.addRow(['Name', 'Industry', 'Status', 'Size', 'Website', 'Email', 'Phone', 'Created At']);
    data.companies.forEach(company => {
      worksheet.addRow([
        company.name,
        company.industry,
        company.status,
        company.size,
        company.website,
        company.email,
        company.phone,
        company.createdAt
      ]);
    });
  } else if (data.customers) {
    // Customers report
    worksheet.addRow(['Name', 'Email', 'Phone', 'Company', 'Industry', 'Status', 'Stage', 'Priority', 'Score', 'Assigned To', 'Created At']);
    data.customers.forEach(customer => {
      worksheet.addRow([
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
        customer.industry,
        customer.status,
        customer.stage,
        customer.priority,
        customer.score,
        customer.assignedTo,
        customer.createdAt
      ]);
    });
  } else if (data.deals && !data.financial) {
    // Deals report - Enhanced with all fields
    worksheet.addRow(['Deal Number', 'Name', 'Description', 'Value', 'Currency', 'Status', 'Priority', 'Stage', 'Probability', 'Customer', 'Customer Email', 'Customer Phone', 'Company', 'Industry', 'Assigned To', 'Assigned Email', 'Created By', 'Source', 'Expected Close Date', 'Actual Close Date', 'Tags', 'Notes Count', 'Activities Count', 'Created At', 'Updated At']);
    data.deals.forEach(deal => {
      worksheet.addRow([
        deal.dealNumber || 'N/A',
        deal.name,
        deal.description || 'No description',
        deal.value || 0,
        deal.currency || 'USD',
        deal.status,
        deal.priority || 'medium',
        deal.stage,
        deal.probability || 0,
        deal.customer,
        deal.customerEmail || 'N/A',
        deal.customerPhone || 'N/A',
        deal.company,
        deal.companyIndustry || 'N/A',
        deal.assignedTo,
        deal.assignedToEmail || 'N/A',
        deal.createdBy,
        deal.source || 'N/A',
        deal.expectedCloseDate || 'N/A',
        deal.actualCloseDate || 'N/A',
        deal.tags ? deal.tags.join(', ') : 'None',
        deal.notes || 0,
        deal.activities || 0,
        deal.createdAt,
        deal.updatedAt
      ]);
    });
  } else if (data.leads) {
    // Leads report
    worksheet.addRow(['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Score', 'Assigned To', 'Created At']);
    data.leads.forEach(lead => {
      worksheet.addRow([
        lead.name,
        lead.email,
        lead.phone,
        lead.company,
        lead.status,
        lead.source,
        lead.score,
        lead.assignedTo,
        lead.createdAt
      ]);
    });
  } else if (data.tasks) {
    // Tasks report
    worksheet.addRow(['Title', 'Status', 'Priority', 'Type', 'Assigned To', 'Created By', 'Due Date', 'Created At']);
    data.tasks.forEach(task => {
      worksheet.addRow([
        task.title,
        task.status,
        task.priority,
        task.type,
        task.assignedTo,
        task.createdBy,
        task.dueDate,
        task.createdAt
      ]);
    });
  } else if (data.activities) {
    // Activities report
    worksheet.addRow(['Entity Type', 'Entity Name', 'Activity Type', 'Description', 'User', 'User Email', 'Category', 'Priority', 'Created At']);
    data.activities.forEach(activity => {
      worksheet.addRow([
        activity.entityType,
        activity.entityName,
        activity.type,
        activity.description,
        activity.user,
        activity.userEmail || '',
        activity.category || '',
        activity.priority || '',
        activity.createdAt
      ]);
    });
  } else if (data.members) {
    // Performance report - Enhanced version
    worksheet.addRow(['Performance Report Summary']);
    if (data.teamAverages) {
      worksheet.addRow(['Team Average Performance Score:', data.teamAverages.averagePerformanceScore]);
      worksheet.addRow(['Team Average Completion Rate:', data.teamAverages.averageCompletionRate + '%']);
      worksheet.addRow(['Team Average Win Rate:', data.teamAverages.averageWinRate + '%']);
      worksheet.addRow(['Total Revenue:', data.teamAverages.totalRevenue]);
      worksheet.addRow(['Total Deals:', data.teamAverages.totalDeals]);
      worksheet.addRow(['Total Tasks:', data.teamAverages.totalTasks]);
      worksheet.addRow([]);
    }
    worksheet.addRow(['Individual Performance']);
    worksheet.addRow(['Name', 'Email', 'Role', 'Performance Score', 'Tasks Total', 'Tasks Completed', 'Task Completion Rate', 'On-Time Rate', 'Deals Total', 'Deals Won', 'Deal Win Rate', 'Total Deal Value', 'Won Value', 'Leads Total', 'Leads Converted', 'Lead Conversion Rate', 'Customers Total', 'Activities Total']);
    data.members.forEach(member => {
      worksheet.addRow([
        member.name,
        member.email,
        member.role,
        member.performanceScore || 0,
        member.tasks.total || 0,
        member.tasks.completed || 0,
        (member.tasks.completionRate || 0) + '%',
        (member.tasks.onTimeRate || 0) + '%',
        member.deals.total || 0,
        member.deals.won || 0,
        (member.deals.winRate || 0) + '%',
        member.deals.totalValue || 0,
        member.deals.wonValue || 0,
        member.leads.total || 0,
        member.leads.converted || 0,
        (member.leads.conversionRate || 0) + '%',
        member.customers.total || 0,
        member.activities.total || 0
      ]);
    });
  } else if (data.financial) {
    // Financial report
    worksheet.addRow(['Financial Summary']);
    worksheet.addRow(['Total Deals:', data.financial.totalDeals]);
    worksheet.addRow(['Total Value:', data.financial.totalValue]);
    worksheet.addRow(['Won Deals:', data.financial.wonDeals]);
    worksheet.addRow(['Won Value:', data.financial.wonValue]);
    worksheet.addRow(['Lost Deals:', data.financial.lostDeals]);
    worksheet.addRow(['Lost Value:', data.financial.lostValue]);
    worksheet.addRow(['Open Deals:', data.financial.openDeals]);
    worksheet.addRow(['Open Value:', data.financial.openValue]);
    worksheet.addRow(['Win Rate:', data.financial.winRate + '%']);
    worksheet.addRow(['Average Deal Value:', data.financial.averageDealValue]);
    worksheet.addRow([]);
    worksheet.addRow(['Deal Details']);
    worksheet.addRow(['Name', 'Value', 'Currency', 'Status', 'Customer', 'Assigned To', 'Probability', 'Expected Close Date', 'Created At']);
    data.deals.forEach(deal => {
      worksheet.addRow([
        deal.name,
        deal.value,
        deal.currency,
        deal.status,
        deal.customer,
        deal.assignedTo,
        deal.probability,
        deal.expectedCloseDate,
        deal.createdAt
      ]);
    });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${reportName.replace(/\s+/g, '_')}.xlsx"`);
  
  await workbook.xlsx.write(res);
  res.end();
};

// Helper function to generate PDF reports using HTML templates
const generatePDFReport = async (res, data, reportName) => {
  try {
    // Determine report type from data structure
    let reportType = 'overview';
    if (data.companies) reportType = 'companies';
    else if (data.customers) reportType = 'customers';
    else if (data.deals && data.financial) reportType = 'financial';
    else if (data.deals) reportType = 'deals';
    else if (data.leads) reportType = 'leads';
    else if (data.tasks) reportType = 'tasks';
    else if (data.activities) reportType = 'activities';
    else if (data.members) reportType = 'performance';
    
    // Generate HTML content
    const html = getReportHTML(data, reportName, reportType);
    
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF with better page handling
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        right: '15px',
        bottom: '15px',
        left: '15px'
      },
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    // Set headers and send PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${reportName.replace(/\s+/g, '_')}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    // Fallback to basic PDF if Puppeteer fails
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportName.replace(/\s+/g, '_')}.pdf"`);
  doc.pipe(res);
  doc.fontSize(20).text(reportName, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated At: ${data.generatedAt}`, { align: 'left' });
  doc.text(`Generated By: ${data.generatedBy}`, { align: 'left' });
    doc.text('Error generating styled report. Please try again.', { align: 'left' });
  doc.end();
  }
};

// Helper function to generate CSV reports
const generateCSVReport = async (res, data, reportName) => {
  let csvContent = '';
  
  // Add headers and data based on report type
  if (data.overview) {
    // Overview report
    csvContent += 'Metric,Value\n';
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
    csvContent += 'Name,Industry,Status,Size,Website,Email,Phone,Created At\n';
    data.companies.forEach(company => {
      csvContent += `"${company.name}","${company.industry}","${company.status}","${company.size}","${company.website}","${company.email}","${company.phone}","${company.createdAt}"\n`;
    });
  } else if (data.customers) {
    // Customers report
    csvContent += 'Name,Email,Phone,Company,Industry,Status,Stage,Priority,Score,Assigned To,Created At\n';
    data.customers.forEach(customer => {
      csvContent += `"${customer.name}","${customer.email}","${customer.phone}","${customer.company}","${customer.industry}","${customer.status}","${customer.stage}","${customer.priority}","${customer.score}","${customer.assignedTo}","${customer.createdAt}"\n`;
    });
  } else if (data.deals) {
    // Deals report - Enhanced with all fields
    csvContent += 'Deal Number,Name,Description,Value,Currency,Status,Priority,Stage,Probability,Customer,Customer Email,Customer Phone,Company,Industry,Assigned To,Assigned Email,Created By,Source,Expected Close Date,Actual Close Date,Tags,Notes Count,Activities Count,Created At,Updated At\n';
    data.deals.forEach(deal => {
      csvContent += `"${deal.dealNumber || 'N/A'}","${deal.name}","${(deal.description || 'No description').replace(/"/g, '""')}","${deal.value || 0}","${deal.currency || 'USD'}","${deal.status}","${deal.priority || 'medium'}","${deal.stage}","${deal.probability || 0}","${deal.customer}","${deal.customerEmail || 'N/A'}","${deal.customerPhone || 'N/A'}","${deal.company}","${deal.companyIndustry || 'N/A'}","${deal.assignedTo}","${deal.assignedToEmail || 'N/A'}","${deal.createdBy}","${deal.source || 'N/A'}","${deal.expectedCloseDate || 'N/A'}","${deal.actualCloseDate || 'N/A'}","${deal.tags ? deal.tags.join('; ') : 'None'}","${deal.notes || 0}","${deal.activities || 0}","${deal.createdAt}","${deal.updatedAt}"\n`;
    });
  } else if (data.leads) {
    // Leads report
    csvContent += 'Name,Email,Phone,Company,Status,Source,Score,Assigned To,Created At\n';
    data.leads.forEach(lead => {
      csvContent += `"${lead.name}","${lead.email}","${lead.phone}","${lead.company}","${lead.status}","${lead.source}","${lead.score}","${lead.assignedTo}","${lead.createdAt}"\n`;
    });
  } else if (data.tasks) {
    // Tasks report
    csvContent += 'Title,Status,Priority,Type,Assigned To,Created By,Due Date,Created At\n';
    data.tasks.forEach(task => {
      csvContent += `"${task.title}","${task.status}","${task.priority}","${task.type}","${task.assignedTo}","${task.createdBy}","${task.dueDate}","${task.createdAt}"\n`;
    });
  } else if (data.activities) {
    // Activities report
    csvContent += 'Entity Type,Entity Name,Activity Type,Description,User,User Email,Category,Priority,Created At\n';
    data.activities.forEach(activity => {
      csvContent += `"${activity.entityType}","${activity.entityName}","${activity.type}","${activity.description}","${activity.user}","${activity.userEmail || ''}","${activity.category || ''}","${activity.priority || ''}","${activity.createdAt}"\n`;
    });
  } else if (data.members) {
    // Performance report - Enhanced version
    csvContent += 'Performance Report Summary\n';
    if (data.teamAverages) {
      csvContent += `Team Average Performance Score,${data.teamAverages.averagePerformanceScore}\n`;
      csvContent += `Team Average Completion Rate,${data.teamAverages.averageCompletionRate}%\n`;
      csvContent += `Team Average Win Rate,${data.teamAverages.averageWinRate}%\n`;
      csvContent += `Total Revenue,${data.teamAverages.totalRevenue}\n`;
      csvContent += `Total Deals,${data.teamAverages.totalDeals}\n`;
      csvContent += `Total Tasks,${data.teamAverages.totalTasks}\n`;
      csvContent += '\n';
    }
    csvContent += 'Individual Performance\n';
    csvContent += 'Name,Email,Role,Performance Score,Tasks Total,Tasks Completed,Task Completion Rate,On-Time Rate,Deals Total,Deals Won,Deal Win Rate,Total Deal Value,Won Value,Leads Total,Leads Converted,Lead Conversion Rate,Customers Total,Activities Total\n';
    data.members.forEach(member => {
      csvContent += `"${member.name}","${member.email}","${member.role}","${member.performanceScore || 0}","${member.tasks.total || 0}","${member.tasks.completed || 0}","${member.tasks.completionRate || 0}%","${member.tasks.onTimeRate || 0}%","${member.deals.total || 0}","${member.deals.won || 0}","${member.deals.winRate || 0}%","${member.deals.totalValue || 0}","${member.deals.wonValue || 0}","${member.leads.total || 0}","${member.leads.converted || 0}","${member.leads.conversionRate || 0}%","${member.customers.total || 0}","${member.activities.total || 0}"\n`;
    });
  } else if (data.financial) {
    // Financial report
    csvContent += 'Metric,Value\n';
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
    csvContent += '\nDeal Details\n';
    csvContent += 'Name,Value,Currency,Status,Customer,Assigned To,Probability,Expected Close Date,Created At\n';
    data.deals.forEach(deal => {
      csvContent += `"${deal.name}","${deal.value}","${deal.currency}","${deal.status}","${deal.customer}","${deal.assignedTo}","${deal.probability}","${deal.expectedCloseDate}","${deal.createdAt}"\n`;
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${reportName.replace(/\s+/g, '_')}.csv"`);
  res.send(csvContent);
};

// Main report generation endpoint
export const generateReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { reportType, format = 'pdf', dateRange = {}, filters = {} } = req.body;

  if (!reportType) {
    throw new ValidationError('Report type is required');
  }

  // For performance report, merge filters into req.body so generatePerformanceReport can access them
  if (reportType === 'performance') {
    req.body.userId = filters.userId || req.body.userId;
  }

  switch (reportType) {
    case 'overview':
      return generateOverviewReport(req, res);
    case 'companies':
      return generateCompaniesReport(req, res);
    case 'customers':
      return generateCustomersReport(req, res);
    case 'deals':
      return generateDealsReport(req, res);
    case 'leads':
      return generateLeadsReport(req, res);
    case 'tasks':
      return generateTasksReport(req, res);
    case 'activities':
      return generateActivitiesReport(req, res);
    case 'performance':
      return generatePerformanceReport(req, res);
    case 'financial':
      return generateFinancialReport(req, res);
    default:
      throw new ValidationError('Invalid report type');
  }
});
