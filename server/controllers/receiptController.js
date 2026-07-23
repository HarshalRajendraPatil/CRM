import Receipt from '../models/Receipt.model.js';
import Payment from '../models/Payment.model.js';
import Invoice from '../models/Invoice.model.js';
import Deal from '../models/Deal.model.js';
import Customer from '../models/Customer.model.js';
import Company from '../models/Company.model.js';
import Project from '../models/Project.model.js';
import { validateReceiptData, sanitizeReceiptData } from '../utils/receiptValidation.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';
import ActivityService from '../utils/activityService.js';

// ==================== BASIC CRUD OPERATIONS ====================

/**
 * Get all receipts for a project with filtering, sorting, and pagination
 */
export const getProjectReceipts = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'paymentDate',
    sortOrder = 'desc',
    search,
    customer,
    company,
    payment,
    invoice,
    deal,
    paymentMethod,
    minAmount,
    maxAmount,
    paymentDateFrom,
    paymentDateTo,
    isArchived = false
  } = req.query;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view receipts in this project');
  }

  // Build filter object
  const filter = {
    project: new mongoose.Types.ObjectId(projectId),
    isArchived: isArchived === 'true'
  };

  // Add search filter
  if (search) {
    filter.$or = [
      { receiptNumber: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  // Add customer filter
  if (customer) {
    filter.customer = { $in: customer.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add company filter
  if (company) {
    filter.company = { $in: company.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add payment filter
  if (payment) {
    filter.payment = { $in: payment.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add invoice filter
  if (invoice) {
    filter.invoice = { $in: invoice.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add deal filter
  if (deal) {
    filter.deal = { $in: deal.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add payment method filter
  if (paymentMethod) {
    filter.paymentMethod = { $in: paymentMethod.split(',') };
  }

  // Add amount range filter
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }

  // Add date range filters
  if (paymentDateFrom || paymentDateTo) {
    filter.paymentDate = {};
    if (paymentDateFrom) filter.paymentDate.$gte = new Date(paymentDateFrom);
    if (paymentDateTo) filter.paymentDate.$lte = new Date(paymentDateTo);
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Execute query with population
  const receipts = await Receipt.find(filter)
    .populate('payment', 'paymentNumber amount status')
    .populate('invoice', 'invoiceNumber total')
    .populate('deal', 'name dealNumber value')
    .populate('customer', 'firstName lastName email phone')
    .populate('company', 'name website')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Receipt.countDocuments(filter);

  res.json({
    success: true,
    data: receipts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Get a single receipt by ID
 */
export const getReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const receipt = await Receipt.findById(id)
    .populate('payment', 'paymentNumber amount status paymentMethod transactionId')
    .populate('invoice', 'invoiceNumber total status dueDate')
    .populate('deal', 'name dealNumber value currency')
    .populate('customer', 'firstName lastName email phone address')
    .populate('company', 'name website address')
    .populate('project', 'name')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!receipt) {
    throw new NotFoundError('Receipt not found');
  }

  // Check project access
  const project = await Project.findById(receipt.project);
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view this receipt');
  }

  res.json({
    success: true,
    data: receipt
  });
});

/**
 * Create a new receipt (usually done automatically when payment is completed)
 */
export const createReceipt = asyncHandler(async (req, res) => {
  const { projectId, ...receiptData } = req.body;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to create receipts in this project');
  }

  // Validate receipt data
  const validation = validateReceiptData({ ...receiptData, project: projectId });
  if (!validation.isValid) {
    throw new ValidationError('Invalid receipt data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizeReceiptData(validation.sanitizedData);

  // Verify payment exists
  const payment = await Payment.findById(sanitizedData.payment);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Verify invoice exists
  const invoice = await Invoice.findById(sanitizedData.invoice);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Verify deal exists
  const deal = await Deal.findById(sanitizedData.deal);
  if (!deal) {
    throw new NotFoundError('Deal not found');
  }

  // Verify customer exists
  const customer = await Customer.findById(sanitizedData.customer);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Create receipt
  const receipt = new Receipt({
    ...sanitizedData,
    project: projectId,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  await receipt.save();

  // Update payment with receipt reference
  payment.receipt = receipt._id;
  payment.receiptNumber = receipt.receiptNumber;
  await payment.save();

  // Populate for response
  await receipt.populate([
    { path: 'payment', select: 'paymentNumber amount status' },
    { path: 'invoice', select: 'invoiceNumber total' },
    { path: 'deal', select: 'name dealNumber value' },
    { path: 'customer', select: 'firstName lastName email phone' },
    { path: 'company', select: 'name website' },
    { path: 'createdBy', select: 'name email' }
  ]);

  // Log activity
  try {
    await ActivityService.logReceiptCreated(receipt, req.user);
  } catch (error) {
    console.error('Failed to log receipt creation activity:', error);
  }

  res.status(201).json({
    success: true,
    data: receipt
  });
});

/**
 * Update a receipt
 */
export const updateReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Get existing receipt
  const existingReceipt = await Receipt.findById(id);
  if (!existingReceipt) {
    throw new NotFoundError('Receipt not found');
  }

  // Check project access
  const project = await Project.findById(existingReceipt.project);
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update this receipt');
  }

  // Validate update data
  const validation = validateReceiptData(updateData, true);
  if (!validation.isValid) {
    throw new ValidationError('Invalid receipt data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizeReceiptData(validation.sanitizedData);

  // Update receipt
  const receipt = await Receipt.findByIdAndUpdate(
    id,
    { ...sanitizedData, updatedBy: req.user._id },
    { new: true, runValidators: true }
  ).populate([
    { path: 'payment', select: 'paymentNumber amount status' },
    { path: 'invoice', select: 'invoiceNumber total' },
    { path: 'deal', select: 'name dealNumber value' },
    { path: 'customer', select: 'firstName lastName email phone' },
    { path: 'company', select: 'name website' },
    { path: 'createdBy', select: 'name email' },
    { path: 'updatedBy', select: 'name email' }
  ]);

  // Log activity
  try {
    await ActivityService.logReceiptUpdated(receipt, req.user);
  } catch (error) {
    console.error('Failed to log receipt update activity:', error);
  }

  res.json({
    success: true,
    data: receipt
  });
});

/**
 * Mark receipt as sent
 */
export const markReceiptAsSent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sentToEmail } = req.body;

  const receipt = await Receipt.findById(id);
  if (!receipt) {
    throw new NotFoundError('Receipt not found');
  }

  // Check project access
  const project = await Project.findById(receipt.project);
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update this receipt');
  }

  if (sentToEmail) {
    receipt.sentToEmail = sentToEmail;
  }
  receipt.sentAt = new Date();
  receipt.updatedBy = req.user._id;
  await receipt.save();

  // Log activity
  try {
    await ActivityService.logReceiptSent(receipt, req.user);
  } catch (error) {
    console.error('Failed to log receipt sent activity:', error);
  }

  res.json({
    success: true,
    data: receipt
  });
});

/**
 * Delete a receipt
 */
export const deleteReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const receipt = await Receipt.findById(id);
  if (!receipt) {
    throw new NotFoundError('Receipt not found');
  }

  // Check project access
  const project = await Project.findById(receipt.project);
  if (!project.hasPermission(req.user._id, 'manager') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to delete this receipt');
  }

  // Remove receipt reference from payment
  if (receipt.payment) {
    const payment = await Payment.findById(receipt.payment);
    if (payment) {
      payment.receipt = null;
      payment.receiptNumber = null;
      await payment.save();
    }
  }

  await Receipt.findByIdAndDelete(id);

  // Log activity
  try {
    await ActivityService.logReceiptDeleted(receipt, req.user);
  } catch (error) {
    console.error('Failed to log receipt deletion activity:', error);
  }

  res.json({
    success: true,
    message: 'Receipt deleted successfully'
  });
});

/**
 * Get receipt statistics for a project
 */
export const getReceiptStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view receipt statistics in this project');
  }

  const stats = await Receipt.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        isArchived: false
      }
    },
    {
      $group: {
        _id: null,
        totalReceipts: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        sentCount: {
          $sum: { $cond: [{ $ne: ['$sentAt', null] }, 1, 0] }
        },
        unsentCount: {
          $sum: { $cond: [{ $eq: ['$sentAt', null] }, 1, 0] }
        }
      }
    }
  ]);

  // Get payment method breakdown
  const methodStats = await Receipt.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        isArchived: false
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const result = stats[0] || {
    totalReceipts: 0,
    totalAmount: 0,
    sentCount: 0,
    unsentCount: 0
  };

  result.paymentMethods = methodStats;

  res.json({
    success: true,
    data: result
  });
});

