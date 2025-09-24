import { asyncHandler } from '../middleware/errorHandler.js';
import Project  from '../models/Project.model.js';
import Company  from '../models/Company.model.js';
import Customer  from '../models/Customer.model.js';
import Deal  from '../models/Deal.model.js';
import Lead  from '../models/Lead.model.js';
import Task  from '../models/Task.model.js';
import CalendarEvent  from '../models/CalendarEvent.model.js';
import User  from '../models/User.model.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';

// Generate comprehensive CRM overview report
export const generateOverviewReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'pdf', dateRange = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Get all data counts
  const [
    companiesCount,
    customersCount,
    dealsCount,
    leadsCount,
    tasksCount,
    eventsCount,
    totalDealValue,
    completedTasks,
    activeDeals
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
    Deal.countDocuments({ project:  new mongoose.Types.ObjectId(projectId), status: 'open' })
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
      activeDeals
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
      size: company.size,
      website: company.website,
      email: company.email,
      phone: company.phone,
      address: company.address,
      createdAt: company.createdAt,
      tags: company.tags
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
  if (filters.minValue) {
    query.value = { $gte: parseFloat(filters.minValue) };
  }

  const deals = await Deal.find(query)
    .populate('customer', 'name email')
    .populate('assignedTo', 'name email')
    .populate('stage', 'name')
    .sort({ createdAt: -1 });

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter(deal => deal.status === 'won');
  const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    deals: deals.map(deal => ({
      name: deal.name,
      value: deal.value,
      currency: deal.currency,
      status: deal.status,
      stage: deal.stage?.name || 'No Stage',
      customer: deal.customer?.name || 'No Customer',
      assignedTo: deal.assignedTo?.name || 'Unassigned',
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      createdAt: deal.createdAt
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
      tags: lead.tags
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
  const { format = 'pdf', dateRange = {} } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Get project members
  const members = await User.find({ 
    'projects.project': projectId 
  }).select('name email role');

  // Get performance metrics
  const [
    userTasks,
    userDeals,
    userLeads,
    userCustomers
  ] = await Promise.all([
    Task.aggregate([
      { $match: { project:  new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } }}
    ]),
    Deal.aggregate([
      { $match: { project:  new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 }, won: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }, totalValue: { $sum: '$value' } }}
    ]),
    Lead.aggregate([
      { $match: { project:  new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ]),
    Customer.aggregate([
      { $match: { project:  new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ])
  ]);

  const reportData = {
    project: {
      name: project.name,
      description: project.description
    },
    members: members.map(member => {
      const tasks = userTasks.find(t => t._id?.toString() === member._id.toString()) || { count: 0, completed: 0 };
      const deals = userDeals.find(d => d._id?.toString() === member._id.toString()) || { count: 0, won: 0, totalValue: 0 };
      const leads = userLeads.find(l => l._id?.toString() === member._id.toString()) || { count: 0 };
      const customers = userCustomers.find(c => c._id?.toString() === member._id.toString()) || { count: 0 };

      return {
        name: member.name,
        email: member.email,
        role: member.role,
        tasks: {
          total: tasks.count,
          completed: tasks.completed,
          completionRate: tasks.count > 0 ? (tasks.completed / tasks.count * 100).toFixed(2) : 0
        },
        deals: {
          total: deals.count,
          won: deals.won,
          winRate: deals.count > 0 ? (deals.won / deals.count * 100).toFixed(2) : 0,
          totalValue: deals.totalValue
        },
        leads: leads.count,
        customers: customers.count
      };
    }),
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
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company?.name || 'No Company',
      industry: customer.company?.industry || 'Unknown',
      status: customer.status,
      stage: customer.stage,
      priority: customer.priority,
      score: customer.score,
      assignedTo: customer.assignedTo?.name || 'Unassigned',
      createdAt: customer.createdAt,
      tags: customer.tags
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

  let query = { project: new mongoose.Types.ObjectId(projectId) };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }

  // Get activities from all entities
  const [dealActivities, taskActivities, customerActivities, leadActivities] = await Promise.all([
    Deal.find(query).populate('assignedTo', 'name').select('name activities createdAt'),
    Task.find(query).populate('assignedTo', 'name').select('title activities createdAt'),
    Customer.find(query).populate('assignedTo', 'name').select('name activities createdAt'),
    Lead.find(query).populate('assignedTo', 'name').select('name activities createdAt')
  ]);

  const allActivities = [];

  // Process deal activities
  dealActivities.forEach(deal => {
    if (deal.activities && deal.activities.length > 0) {
      deal.activities.forEach(activity => {
        allActivities.push({
          entityType: 'Deal',
          entityName: deal.name,
          type: activity.type,
          description: activity.description,
          user: activity.user,
          createdAt: activity.createdAt,
          assignedTo: deal.assignedTo?.name || 'Unassigned'
        });
      });
    }
  });

  // Process task activities
  taskActivities.forEach(task => {
    if (task.activities && task.activities.length > 0) {
      task.activities.forEach(activity => {
        allActivities.push({
          entityType: 'Task',
          entityName: task.title,
          type: activity.type,
          description: activity.description,
          user: activity.user,
          createdAt: activity.createdAt,
          assignedTo: task.assignedTo?.name || 'Unassigned'
        });
      });
    }
  });

  // Process customer activities
  customerActivities.forEach(customer => {
    if (customer.activities && customer.activities.length > 0) {
      customer.activities.forEach(activity => {
        allActivities.push({
          entityType: 'Customer',
          entityName: customer.name,
          type: activity.type,
          description: activity.description,
          user: activity.user,
          createdAt: activity.createdAt,
          assignedTo: customer.assignedTo?.name || 'Unassigned'
        });
      });
    }
  });

  // Process lead activities
  leadActivities.forEach(lead => {
    if (lead.activities && lead.activities.length > 0) {
      lead.activities.forEach(activity => {
        allActivities.push({
          entityType: 'Lead',
          entityName: lead.name,
          type: activity.type,
          description: activity.description,
          user: activity.user,
          createdAt: activity.createdAt,
          assignedTo: lead.assignedTo?.name || 'Unassigned'
        });
      });
    }
  });

  // Sort by date
  allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

  let query = { project: new mongoose.Types.ObjectId(projectId) };
  
  // Apply date filters
  if (dateRange.startDate && dateRange.endDate) {
    query.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }

  const deals = await Deal.find(query)
    .populate('customer', 'name email')
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
      value: deal.value,
      currency: deal.currency,
      status: deal.status,
      customer: deal.customer?.name || 'No Customer',
      assignedTo: deal.assignedTo?.name || 'Unassigned',
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
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
  } else if (data.deals) {
    // Deals report
    worksheet.addRow(['Name', 'Value', 'Currency', 'Status', 'Stage', 'Customer', 'Assigned To', 'Probability', 'Expected Close Date', 'Created At']);
    data.deals.forEach(deal => {
      worksheet.addRow([
        deal.name,
        deal.value,
        deal.currency,
        deal.status,
        deal.stage,
        deal.customer,
        deal.assignedTo,
        deal.probability,
        deal.expectedCloseDate,
        deal.createdAt
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
    worksheet.addRow(['Entity Type', 'Entity Name', 'Activity Type', 'Description', 'User', 'Assigned To', 'Created At']);
    data.activities.forEach(activity => {
      worksheet.addRow([
        activity.entityType,
        activity.entityName,
        activity.type,
        activity.description,
        activity.user,
        activity.assignedTo,
        activity.createdAt
      ]);
    });
  } else if (data.members) {
    // Performance report
    worksheet.addRow(['Name', 'Email', 'Role', 'Tasks Total', 'Tasks Completed', 'Task Completion Rate', 'Deals Total', 'Deals Won', 'Deal Win Rate', 'Total Deal Value', 'Leads', 'Customers']);
    data.members.forEach(member => {
      worksheet.addRow([
        member.name,
        member.email,
        member.role,
        member.tasks.total,
        member.tasks.completed,
        member.tasks.completionRate + '%',
        member.deals.total,
        member.deals.won,
        member.deals.winRate + '%',
        member.deals.totalValue,
        member.leads,
        member.customers
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

// Helper function to generate PDF reports
const generatePDFReport = async (res, data, reportName) => {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${reportName.replace(/\s+/g, '_')}.pdf"`);
  
  doc.pipe(res);
  
  // Add title
  doc.fontSize(20).text(reportName, { align: 'center' });
  doc.moveDown();
  
  // Add generation info
  doc.fontSize(12).text(`Generated At: ${data.generatedAt}`, { align: 'left' });
  doc.text(`Generated By: ${data.generatedBy}`, { align: 'left' });
  doc.moveDown();
  
  // Add content based on report type
  if (data.overview) {
    doc.fontSize(16).text('Overview', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Companies: ${data.overview.companies}`);
    doc.text(`Customers: ${data.overview.customers}`);
    doc.text(`Deals: ${data.overview.deals}`);
    doc.text(`Leads: ${data.overview.leads}`);
    doc.text(`Tasks: ${data.overview.tasks}`);
    doc.text(`Events: ${data.overview.events}`);
    doc.text(`Total Deal Value: ${data.overview.totalDealValue}`);
    doc.text(`Completed Tasks: ${data.overview.completedTasks}`);
    doc.text(`Active Deals: ${data.overview.activeDeals}`);
  } else if (data.companies) {
    doc.fontSize(16).text('Companies', { underline: true });
    doc.moveDown();
    data.companies.forEach((company, index) => {
      doc.fontSize(12).text(`${index + 1}. ${company.name}`, { underline: true });
      doc.text(`   Industry: ${company.industry}`);
      doc.text(`   Status: ${company.status}`);
      doc.text(`   Size: ${company.size}`);
      doc.text(`   Website: ${company.website}`);
      doc.text(`   Email: ${company.email}`);
      doc.text(`   Phone: ${company.phone}`);
      doc.moveDown();
    });
  } else if (data.customers) {
    doc.fontSize(16).text('Customers', { underline: true });
    doc.moveDown();
    data.customers.forEach((customer, index) => {
      doc.fontSize(12).text(`${index + 1}. ${customer.name}`, { underline: true });
      doc.text(`   Email: ${customer.email}`);
      doc.text(`   Phone: ${customer.phone}`);
      doc.text(`   Company: ${customer.company}`);
      doc.text(`   Industry: ${customer.industry}`);
      doc.text(`   Status: ${customer.status}`);
      doc.text(`   Stage: ${customer.stage}`);
      doc.text(`   Priority: ${customer.priority}`);
      doc.text(`   Score: ${customer.score}`);
      doc.text(`   Assigned To: ${customer.assignedTo}`);
      doc.moveDown();
    });
  } else if (data.deals) {
    doc.fontSize(16).text('Deals', { underline: true });
    doc.moveDown();
    data.deals.forEach((deal, index) => {
      doc.fontSize(12).text(`${index + 1}. ${deal.name}`, { underline: true });
      doc.text(`   Value: ${deal.value} ${deal.currency}`);
      doc.text(`   Status: ${deal.status}`);
      doc.text(`   Stage: ${deal.stage}`);
      doc.text(`   Customer: ${deal.customer}`);
      doc.text(`   Assigned To: ${deal.assignedTo}`);
      doc.text(`   Probability: ${deal.probability}%`);
      doc.text(`   Expected Close: ${deal.expectedCloseDate}`);
      doc.moveDown();
    });
  } else if (data.leads) {
    doc.fontSize(16).text('Leads', { underline: true });
    doc.moveDown();
    data.leads.forEach((lead, index) => {
      doc.fontSize(12).text(`${index + 1}. ${lead.name}`, { underline: true });
      doc.text(`   Email: ${lead.email}`);
      doc.text(`   Phone: ${lead.phone}`);
      doc.text(`   Company: ${lead.company}`);
      doc.text(`   Status: ${lead.status}`);
      doc.text(`   Source: ${lead.source}`);
      doc.text(`   Score: ${lead.score}`);
      doc.text(`   Assigned To: ${lead.assignedTo}`);
      doc.moveDown();
    });
  } else if (data.tasks) {
    doc.fontSize(16).text('Tasks', { underline: true });
    doc.moveDown();
    data.tasks.forEach((task, index) => {
      doc.fontSize(12).text(`${index + 1}. ${task.title}`, { underline: true });
      doc.text(`   Status: ${task.status}`);
      doc.text(`   Priority: ${task.priority}`);
      doc.text(`   Type: ${task.type}`);
      doc.text(`   Assigned To: ${task.assignedTo}`);
      doc.text(`   Created By: ${task.createdBy}`);
      doc.text(`   Due Date: ${task.dueDate}`);
      doc.moveDown();
    });
  } else if (data.activities) {
    doc.fontSize(16).text('Activities', { underline: true });
    doc.moveDown();
    data.activities.forEach((activity, index) => {
      doc.fontSize(12).text(`${index + 1}. ${activity.entityType}: ${activity.entityName}`, { underline: true });
      doc.text(`   Type: ${activity.type}`);
      doc.text(`   Description: ${activity.description}`);
      doc.text(`   User: ${activity.user}`);
      doc.text(`   Assigned To: ${activity.assignedTo}`);
      doc.text(`   Date: ${activity.createdAt}`);
      doc.moveDown();
    });
  } else if (data.members) {
    doc.fontSize(16).text('Performance', { underline: true });
    doc.moveDown();
    data.members.forEach((member, index) => {
      doc.fontSize(12).text(`${index + 1}. ${member.name}`, { underline: true });
      doc.text(`   Email: ${member.email}`);
      doc.text(`   Role: ${member.role}`);
      doc.text(`   Tasks: ${member.tasks.total} (${member.tasks.completed} completed - ${member.tasks.completionRate}%)`);
      doc.text(`   Deals: ${member.deals.total} (${member.deals.won} won - ${member.deals.winRate}%)`);
      doc.text(`   Total Deal Value: ${member.deals.totalValue}`);
      doc.text(`   Leads: ${member.leads}`);
      doc.text(`   Customers: ${member.customers}`);
      doc.moveDown();
    });
  } else if (data.financial) {
    doc.fontSize(16).text('Financial Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Deals: ${data.financial.totalDeals}`);
    doc.text(`Total Value: ${data.financial.totalValue}`);
    doc.text(`Won Deals: ${data.financial.wonDeals} (${data.financial.wonValue})`);
    doc.text(`Lost Deals: ${data.financial.lostDeals} (${data.financial.lostValue})`);
    doc.text(`Open Deals: ${data.financial.openDeals} (${data.financial.openValue})`);
    doc.text(`Win Rate: ${data.financial.winRate}%`);
    doc.text(`Average Deal Value: ${data.financial.averageDealValue}`);
    doc.moveDown();
    
    doc.fontSize(16).text('Deal Details', { underline: true });
    doc.moveDown();
    data.deals.forEach((deal, index) => {
      doc.fontSize(12).text(`${index + 1}. ${deal.name}`, { underline: true });
      doc.text(`   Value: ${deal.value} ${deal.currency}`);
      doc.text(`   Status: ${deal.status}`);
      doc.text(`   Customer: ${deal.customer}`);
      doc.text(`   Assigned To: ${deal.assignedTo}`);
      doc.text(`   Probability: ${deal.probability}%`);
      doc.text(`   Expected Close: ${deal.expectedCloseDate}`);
      doc.moveDown();
    });
  }
  
  doc.end();
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
    // Deals report
    csvContent += 'Name,Value,Currency,Status,Stage,Customer,Assigned To,Probability,Expected Close Date,Created At\n';
    data.deals.forEach(deal => {
      csvContent += `"${deal.name}","${deal.value}","${deal.currency}","${deal.status}","${deal.stage}","${deal.customer}","${deal.assignedTo}","${deal.probability}","${deal.expectedCloseDate}","${deal.createdAt}"\n`;
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
    csvContent += 'Entity Type,Entity Name,Activity Type,Description,User,Assigned To,Created At\n';
    data.activities.forEach(activity => {
      csvContent += `"${activity.entityType}","${activity.entityName}","${activity.type}","${activity.description}","${activity.user}","${activity.assignedTo}","${activity.createdAt}"\n`;
    });
  } else if (data.members) {
    // Performance report
    csvContent += 'Name,Email,Role,Tasks Total,Tasks Completed,Task Completion Rate,Deals Total,Deals Won,Deal Win Rate,Total Deal Value,Leads,Customers\n';
    data.members.forEach(member => {
      csvContent += `"${member.name}","${member.email}","${member.role}","${member.tasks.total}","${member.tasks.completed}","${member.tasks.completionRate}%","${member.deals.total}","${member.deals.won}","${member.deals.winRate}%","${member.deals.totalValue}","${member.leads}","${member.customers}"\n`;
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

  console.log('Report generation request:', {
    projectId,
    reportType,
    format,
    dateRange,
    filters,
    userId: req.user?.id
  });

  if (!reportType) {
    throw new ValidationError('Report type is required');
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
