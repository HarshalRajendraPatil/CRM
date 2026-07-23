import Invoice from '../models/Invoice.model.js';
import Payment from '../models/Payment.model.js';
import Receipt from '../models/Receipt.model.js';
import Deal from '../models/Deal.model.js';
import Customer from '../models/Customer.model.js';
import Company from '../models/Company.model.js';
import Project from '../models/Project.model.js';
import { asyncHandler, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

/**
 * Get financial overview for a project
 */
export const getFinancialOverview = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate } = req.query;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view financial data in this project');
  }

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.paymentDate = {};
    if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
    if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
  }

  // Get revenue (cash basis - from completed payments)
  const revenueStats = await Payment.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        status: 'completed',
        isArchived: false,
        ...dateFilter
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    }
  ]);

  // Get outstanding receivables (from invoices)
  const receivablesStats = await Invoice.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        status: { $in: ['sent', 'overdue', 'partially_paid'] },
        isArchived: false
      }
    },
    {
      $group: {
        _id: null,
        totalOutstanding: { $sum: '$remainingAmount' },
        invoiceCount: { $sum: 1 },
        overdueAmount: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'overdue'] },
              '$remainingAmount',
              0
            ]
          }
        },
        overdueCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Get payment method breakdown
  const paymentMethodStats = await Payment.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        status: 'completed',
        isArchived: false,
        ...dateFilter
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Get monthly revenue trend
  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        status: 'completed',
        isArchived: false,
        ...dateFilter
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const revenue = revenueStats[0] || { totalRevenue: 0, paymentCount: 0 };
  const receivables = receivablesStats[0] || {
    totalOutstanding: 0,
    invoiceCount: 0,
    overdueAmount: 0,
    overdueCount: 0
  };

  res.json({
    success: true,
    data: {
      revenue: {
        total: revenue.totalRevenue || 0,
        paymentCount: revenue.paymentCount || 0
      },
      receivables: {
        total: receivables.totalOutstanding || 0,
        invoiceCount: receivables.invoiceCount || 0,
        overdue: {
          amount: receivables.overdueAmount || 0,
          count: receivables.overdueCount || 0
        }
      },
      paymentMethods: paymentMethodStats,
      monthlyTrend: monthlyRevenue
    }
  });
});

/**
 * Get revenue by payment date (cash basis accounting)
 */
export const getRevenueByDate = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate, groupBy = 'day' } = req.query;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view financial data in this project');
  }

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.paymentDate = {};
    if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
    if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
  }

  // Group by day, week, or month
  let groupFormat = {};
  if (groupBy === 'day') {
    groupFormat = {
      year: { $year: '$paymentDate' },
      month: { $month: '$paymentDate' },
      day: { $dayOfMonth: '$paymentDate' }
    };
  } else if (groupBy === 'week') {
    groupFormat = {
      year: { $year: '$paymentDate' },
      week: { $week: '$paymentDate' }
    };
  } else {
    groupFormat = {
      year: { $year: '$paymentDate' },
      month: { $month: '$paymentDate' }
    };
  }

  const revenue = await Payment.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        status: 'completed',
        isArchived: false,
        ...dateFilter
      }
    },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
  ]);

  res.json({
    success: true,
    data: revenue
  });
});

/**
 * Get outstanding receivables
 */
export const getOutstandingReceivables = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, customer, company, minAmount, maxAmount, overdueOnly } = req.query;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view financial data in this project');
  }

  const filter = {
    project: new mongoose.Types.ObjectId(projectId),
    status: { $in: ['sent', 'overdue', 'partially_paid'] },
    isArchived: false
  };

  if (overdueOnly === 'true') {
    filter.status = 'overdue';
  } else if (status) {
    filter.status = { $in: status.split(',') };
  }

  if (customer) {
    filter.customer = { $in: customer.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  if (company) {
    filter.company = { $in: company.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  if (minAmount || maxAmount) {
    filter.remainingAmount = {};
    if (minAmount) filter.remainingAmount.$gte = Number(minAmount);
    if (maxAmount) filter.remainingAmount.$lte = Number(maxAmount);
  }

  const invoices = await Invoice.find(filter)
    .populate('customer', 'firstName lastName email phone')
    .populate('company', 'name website')
    .populate('deal', 'name dealNumber')
    .sort({ dueDate: 1 });

  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

  res.json({
    success: true,
    data: {
      invoices,
      totalOutstanding,
      count: invoices.length
    }
  });
});

/**
 * Get payment method analytics
 */
export const getPaymentMethodAnalytics = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate } = req.query;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view financial data in this project');
  }

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.paymentDate = {};
    if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
    if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
  }

  const analytics = await Payment.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        status: 'completed',
        isArchived: false,
        ...dateFilter
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Calculate percentages
  const totalAmount = analytics.reduce((sum, item) => sum + item.totalAmount, 0);
  const analyticsWithPercentages = analytics.map(item => ({
    ...item,
    percentage: totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0
  }));

  res.json({
    success: true,
    data: analyticsWithPercentages
  });
});

/**
 * Get customer financial profile
 */
export const getCustomerFinancialProfile = asyncHandler(async (req, res) => {
  const { projectId, customerId } = req.params;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view financial data in this project');
  }

  // Get customer
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Get all invoices for customer
  const invoices = await Invoice.find({
    project: projectId,
    customer: customerId,
    isArchived: false
  }).sort({ createdAt: -1 });

  // Get all payments for customer
  const payments = await Payment.find({
    project: projectId,
    customer: customerId,
    isArchived: false,
    status: 'completed'
  }).sort({ paymentDate: -1 });

  // Calculate statistics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  // Calculate average payment time (days between invoice issue and payment)
  let totalPaymentDays = 0;
  let paymentCount = 0;
  for (const payment of payments) {
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice && invoice.issueDate && payment.paymentDate) {
      const days = Math.floor((payment.paymentDate - invoice.issueDate) / (1000 * 60 * 60 * 24));
      totalPaymentDays += days;
      paymentCount++;
    }
  }
  const averagePaymentTime = paymentCount > 0 ? totalPaymentDays / paymentCount : 0;

  res.json({
    success: true,
    data: {
      customer: {
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email
      },
      statistics: {
        totalInvoiced,
        totalPaid,
        totalOutstanding,
        invoiceCount: invoices.length,
        paidInvoiceCount: paidInvoices,
        overdueInvoiceCount: overdueInvoices,
        paymentCount: payments.length,
        averagePaymentTime: Math.round(averagePaymentTime)
      },
      invoices,
      payments
    }
  });
});

/**
 * Get overdue invoices
 */
export const getOverdueInvoices = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { daysOverdue } = req.query;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view financial data in this project');
  }

  const filter = {
    project: new mongoose.Types.ObjectId(projectId),
    status: { $in: ['sent', 'overdue', 'partially_paid'] },
    isArchived: false,
    dueDate: { $lt: new Date() }
  };

  const invoices = await Invoice.find(filter)
    .populate('customer', 'firstName lastName email phone')
    .populate('company', 'name website')
    .populate('deal', 'name dealNumber')
    .sort({ dueDate: 1 });

  // Calculate days overdue and filter if specified
  const today = new Date();
  let filteredInvoices = invoices.map(invoice => {
    const days = Math.floor((today - invoice.dueDate) / (1000 * 60 * 60 * 24));
    return {
      ...invoice.toObject(),
      daysOverdue: days
    };
  });

  if (daysOverdue) {
    const minDays = Number(daysOverdue);
    filteredInvoices = filteredInvoices.filter(inv => inv.daysOverdue >= minDays);
  }

  const totalOverdue = filteredInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

  res.json({
    success: true,
    data: {
      invoices: filteredInvoices,
      totalOverdue,
      count: filteredInvoices.length
    }
  });
});

