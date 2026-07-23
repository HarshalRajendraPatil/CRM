import Invoice from '../models/Invoice.model.js';
import Deal from '../models/Deal.model.js';
import Customer from '../models/Customer.model.js';
import Company from '../models/Company.model.js';
import Project from '../models/Project.model.js';
import Payment from '../models/Payment.model.js';
import { validateInvoiceData, sanitizeInvoiceData } from '../utils/invoiceValidation.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';
import ActivityService from '../utils/activityService.js';

// ==================== BASIC CRUD OPERATIONS ====================

/**
 * Get all invoices for a project with filtering, sorting, and pagination
 */
export const getProjectInvoices = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
    status,
    customer,
    company,
    deal,
    minAmount,
    maxAmount,
    dueDateFrom,
    dueDateTo,
    issueDateFrom,
    issueDateTo,
    isArchived = false
  } = req.query;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view invoices in this project');
  }

  // Build filter object
  const filter = {
    project: new mongoose.Types.ObjectId(projectId),
    isArchived: isArchived === 'true'
  };

  // Add search filter
  if (search) {
    filter.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  // Add status filter
  if (status) {
    filter.status = { $in: status.split(',') };
  }

  // Add customer filter
  if (customer) {
    filter.customer = { $in: customer.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add company filter
  if (company) {
    filter.company = { $in: company.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add deal filter
  if (deal) {
    filter.deal = { $in: deal.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add amount range filter
  if (minAmount || maxAmount) {
    filter.total = {};
    if (minAmount) filter.total.$gte = Number(minAmount);
    if (maxAmount) filter.total.$lte = Number(maxAmount);
  }

  // Add date range filters
  if (dueDateFrom || dueDateTo) {
    filter.dueDate = {};
    if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
    if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
  }

  if (issueDateFrom || issueDateTo) {
    filter.issueDate = {};
    if (issueDateFrom) filter.issueDate.$gte = new Date(issueDateFrom);
    if (issueDateTo) filter.issueDate.$lte = new Date(issueDateTo);
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Execute query with population
  const invoices = await Invoice.find(filter)
    .populate('deal', 'name dealNumber value status')
    .populate('customer', 'firstName lastName email phone')
    .populate('company', 'name website')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Invoice.countDocuments(filter);

  res.json({
    success: true,
    data: invoices,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Get a single invoice by ID
 */
export const getInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id)
    .populate('deal', 'name dealNumber value status currency')
    .populate('customer', 'firstName lastName email phone address')
    .populate('company', 'name website address')
    .populate('project', 'name')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Check project access
  const project = await Project.findById(invoice.project);
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view this invoice');
  }

  // Get related payments
  const payments = await Payment.find({ invoice: invoice._id })
    .populate('createdBy', 'name email')
    .sort({ paymentDate: -1 });

  res.json({
    success: true,
    data: {
      invoice,
      payments
    }
  });
});

/**
 * Create a new invoice
 */
export const createInvoice = asyncHandler(async (req, res) => {
  const { projectId, ...invoiceData } = req.body;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to create invoices in this project');
  }

  // Validate invoice data
  const validation = validateInvoiceData({ ...invoiceData, project: projectId });
  if (!validation.isValid) {
    throw new ValidationError('Invalid invoice data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizeInvoiceData(validation.sanitizedData);

  // Verify deal exists and belongs to project
  const deal = await Deal.findById(sanitizedData.deal);
  if (!deal) {
    throw new NotFoundError('Deal not found');
  }
  if (deal.projectId.toString() !== projectId) {
    throw new ValidationError('Deal does not belong to this project');
  }

  // Verify customer exists and belongs to project
  const customer = await Customer.findById(sanitizedData.customer);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }
  if (customer.project.toString() !== projectId) {
    throw new ValidationError('Customer does not belong to this project');
  }

  // Create invoice
  const invoice = new Invoice({
    ...sanitizedData,
    project: projectId,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  await invoice.save();

  // Populate for response
  await invoice.populate([
    { path: 'deal', select: 'name dealNumber value status' },
    { path: 'customer', select: 'firstName lastName email phone' },
    { path: 'company', select: 'name website' },
    { path: 'createdBy', select: 'name email' }
  ]);

  // Log activity
  try {
    await ActivityService.logInvoiceCreated(invoice, req.user);
  } catch (error) {
    console.error('Failed to log invoice creation activity:', error);
  }

  res.status(201).json({
    success: true,
    data: invoice
  });
});

/**
 * Update an invoice
 */
export const updateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Get existing invoice
  const existingInvoice = await Invoice.findById(id);
  if (!existingInvoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Check project access
  const project = await Project.findById(existingInvoice.project);
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update this invoice');
  }

  // Validate update data
  const validation = validateInvoiceData(updateData, true);
  if (!validation.isValid) {
    throw new ValidationError('Invalid invoice data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizeInvoiceData(validation.sanitizedData);

  // Update invoice
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    { ...sanitizedData, updatedBy: req.user._id },
    { new: true, runValidators: true }
  ).populate([
    { path: 'deal', select: 'name dealNumber value status' },
    { path: 'customer', select: 'firstName lastName email phone' },
    { path: 'company', select: 'name website' },
    { path: 'createdBy', select: 'name email' },
    { path: 'updatedBy', select: 'name email' }
  ]);

  // Log activity
  try {
    await ActivityService.logInvoiceUpdated(invoice, req.user);
  } catch (error) {
    console.error('Failed to log invoice update activity:', error);
  }

  res.json({
    success: true,
    data: invoice
  });
});

/**
 * Delete an invoice
 */
export const deleteInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Check project access
  const project = await Project.findById(invoice.project);
  if (!project.hasPermission(req.user._id, 'manager') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to delete this invoice');
  }

  // Check if invoice has payments
  const paymentCount = await Payment.countDocuments({ invoice: invoice._id });
  if (paymentCount > 0) {
    throw new ValidationError('Cannot delete invoice with existing payments');
  }

  await Invoice.findByIdAndDelete(id);

  // Log activity
  try {
    await ActivityService.logInvoiceDeleted(invoice, req.user);
  } catch (error) {
    console.error('Failed to log invoice deletion activity:', error);
  }

  res.json({
    success: true,
    message: 'Invoice deleted successfully'
  });
});

/**
 * Archive an invoice
 */
export const archiveInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Check project access
  const project = await Project.findById(invoice.project);
  if (!project.hasPermission(req.user._id, 'manager') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to archive this invoice');
  }

  invoice.isArchived = true;
  invoice.archivedAt = new Date();
  invoice.archivedBy = req.user._id;
  await invoice.save();

  // Log activity
  try {
    await ActivityService.logInvoiceArchived(invoice, req.user);
  } catch (error) {
    console.error('Failed to log invoice archive activity:', error);
  }

  res.json({
    success: true,
    data: invoice
  });
});

/**
 * Restore an archived invoice
 */
export const restoreInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Check project access
  const project = await Project.findById(invoice.project);
  if (!project.hasPermission(req.user._id, 'manager') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to restore this invoice');
  }

  invoice.isArchived = false;
  invoice.archivedAt = null;
  invoice.archivedBy = null;
  await invoice.save();

  // Log activity
  try {
    await ActivityService.logInvoiceRestored(invoice, req.user);
  } catch (error) {
    console.error('Failed to log invoice restore activity:', error);
  }

  res.json({
    success: true,
    data: invoice
  });
});

/**
 * Get invoice statistics for a project
 */
export const getInvoiceStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view invoice statistics in this project');
  }

  const stats = await Invoice.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        isArchived: false
      }
    },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        paidAmount: { $sum: '$paidAmount' },
        outstandingAmount: { $sum: '$remainingAmount' },
        draftCount: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        sentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        overdueCount: {
          $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
        },
        partiallyPaidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'partially_paid'] }, 1, 0] }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0,
    draftCount: 0,
    sentCount: 0,
    paidCount: 0,
    overdueCount: 0,
    partiallyPaidCount: 0
  };

  res.json({
    success: true,
    data: result
  });
});

/**
 * Mark invoice as sent
 */
export const markInvoiceAsSent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sentToEmail } = req.body;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Check project access
  const project = await Project.findById(invoice.project);
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update this invoice');
  }

  invoice.status = 'sent';
  if (sentToEmail) {
    invoice.sentToEmail = sentToEmail;
  }
  invoice.sentAt = new Date();
  invoice.updatedBy = req.user._id;
  await invoice.save();

  // Log activity
  try {
    await ActivityService.logInvoiceSent(invoice, req.user);
  } catch (error) {
    console.error('Failed to log invoice sent activity:', error);
  }

  res.json({
    success: true,
    data: invoice
  });
});

