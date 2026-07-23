import Payment from '../models/Payment.model.js';
import Invoice from '../models/Invoice.model.js';
import Receipt from '../models/Receipt.model.js';
import Deal from '../models/Deal.model.js';
import Customer from '../models/Customer.model.js';
import Company from '../models/Company.model.js';
import Project from '../models/Project.model.js';
import { validatePaymentData, sanitizePaymentData } from '../utils/paymentValidation.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';
import ActivityService from '../utils/activityService.js';

// ==================== BASIC CRUD OPERATIONS ====================

/**
 * Get all payments for a project with filtering, sorting, and pagination
 */
export const getProjectPayments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'paymentDate',
    sortOrder = 'desc',
    search,
    status,
    paymentMethod,
    customer,
    company,
    invoice,
    deal,
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
    throw new ForbiddenError('You do not have permission to view payments in this project');
  }

  // Build filter object
  const filter = {
    project: new mongoose.Types.ObjectId(projectId),
    isArchived: isArchived === 'true'
  };

  // Add search filter
  if (search) {
    filter.$or = [
      { paymentNumber: { $regex: search, $options: 'i' } },
      { transactionId: { $regex: search, $options: 'i' } },
      { referenceNumber: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  // Add status filter
  if (status) {
    filter.status = { $in: status.split(',') };
  }

  // Add payment method filter
  if (paymentMethod) {
    filter.paymentMethod = { $in: paymentMethod.split(',') };
  }

  // Add customer filter
  if (customer) {
    filter.customer = { $in: customer.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add company filter
  if (company) {
    filter.company = { $in: company.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add invoice filter
  if (invoice) {
    filter.invoice = { $in: invoice.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add deal filter
  if (deal) {
    filter.deal = { $in: deal.split(',').map(id => new mongoose.Types.ObjectId(id)) };
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
  const payments = await Payment.find(filter)
    .populate('invoice', 'invoiceNumber total status')
    .populate('deal', 'name dealNumber value')
    .populate('customer', 'firstName lastName email phone')
    .populate('company', 'name website')
    .populate('receipt', 'receiptNumber')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Payment.countDocuments(filter);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Get a single payment by ID
 */
export const getPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id)
    .populate('invoice', 'invoiceNumber total status dueDate')
    .populate('deal', 'name dealNumber value currency')
    .populate('customer', 'firstName lastName email phone address')
    .populate('company', 'name website address')
    .populate('project', 'name')
    .populate('receipt', 'receiptNumber pdfUrl')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Check project access
  const project = await Project.findById(payment.project);
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view this payment');
  }

  res.json({
    success: true,
    data: payment
  });
});

/**
 * Create a new payment
 */
export const createPayment = asyncHandler(async (req, res) => {
  const { projectId, ...paymentData } = req.body;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to create payments in this project');
  }

  // Validate payment data
  const validation = validatePaymentData({ ...paymentData, project: projectId });
  if (!validation.isValid) {
    throw new ValidationError('Invalid payment data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizePaymentData(validation.sanitizedData);

  // Verify invoice exists and belongs to project
  const invoice = await Invoice.findById(sanitizedData.invoice);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  if (invoice.project.toString() !== projectId) {
    throw new ValidationError('Invoice does not belong to this project');
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

  // Check if payment amount exceeds remaining invoice amount
  const remainingAmount = invoice.total - (invoice.paidAmount || 0);
  if (sanitizedData.amount > remainingAmount) {
    throw new ValidationError(`Payment amount (${sanitizedData.amount}) exceeds remaining invoice amount (${remainingAmount})`);
  }

  // Create payment
  const payment = new Payment({
    ...sanitizedData,
    project: projectId,
    status: sanitizedData.status || 'pending',
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  await payment.save();

  // Update invoice payment status
  invoice.paidAmount = (invoice.paidAmount || 0) + sanitizedData.amount;
  await invoice.updatePaymentStatus();

  // If payment is completed, create receipt
  if (payment.status === 'completed') {
    const receipt = new Receipt({
      payment: payment._id,
      invoice: invoice._id,
      deal: deal._id,
      customer: customer._id,
      company: sanitizedData.company || null,
      project: projectId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      createdBy: req.user._id
    });
    await receipt.save();

    payment.receipt = receipt._id;
    payment.receiptNumber = receipt.receiptNumber;
    await payment.save();
  }

  // Populate for response
  await payment.populate([
    { path: 'invoice', select: 'invoiceNumber total status' },
    { path: 'deal', select: 'name dealNumber value' },
    { path: 'customer', select: 'firstName lastName email phone' },
    { path: 'company', select: 'name website' },
    { path: 'receipt', select: 'receiptNumber' },
    { path: 'createdBy', select: 'name email' }
  ]);

  // Log activity
  try {
    await ActivityService.logPaymentCreated(payment, req.user);
  } catch (error) {
    console.error('Failed to log payment creation activity:', error);
  }

  res.status(201).json({
    success: true,
    data: payment
  });
});

/**
 * Update a payment
 */
export const updatePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Get existing payment
  const existingPayment = await Payment.findById(id);
  if (!existingPayment) {
    throw new NotFoundError('Payment not found');
  }

  // Check project access
  const project = await Project.findById(existingPayment.project);
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update this payment');
  }

  // Validate update data
  const validation = validatePaymentData(updateData, true);
  if (!validation.isValid) {
    throw new ValidationError('Invalid payment data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizePaymentData(validation.sanitizedData);

  // If amount changed and payment is completed, update invoice
  if (sanitizedData.amount && sanitizedData.amount !== existingPayment.amount && existingPayment.status === 'completed') {
    const invoice = await Invoice.findById(existingPayment.invoice);
    if (invoice) {
      // Revert old amount
      invoice.paidAmount = Math.max(0, (invoice.paidAmount || 0) - existingPayment.amount);
      // Add new amount
      invoice.paidAmount = (invoice.paidAmount || 0) + sanitizedData.amount;
      await invoice.updatePaymentStatus();
    }
  }

  // Update payment
  const payment = await Payment.findByIdAndUpdate(
    id,
    { ...sanitizedData, updatedBy: req.user._id },
    { new: true, runValidators: true }
  ).populate([
    { path: 'invoice', select: 'invoiceNumber total status' },
    { path: 'deal', select: 'name dealNumber value' },
    { path: 'customer', select: 'firstName lastName email phone' },
    { path: 'company', select: 'name website' },
    { path: 'receipt', select: 'receiptNumber' },
    { path: 'createdBy', select: 'name email' },
    { path: 'updatedBy', select: 'name email' }
  ]);

  // If status changed to completed, create receipt if doesn't exist
  if (payment.status === 'completed' && !payment.receipt) {
    const invoice = await Invoice.findById(payment.invoice);
    const deal = await Deal.findById(payment.deal);
    const customer = await Customer.findById(payment.customer);

    const receipt = new Receipt({
      payment: payment._id,
      invoice: invoice._id,
      deal: deal._id,
      customer: customer._id,
      company: payment.company || null,
      project: payment.project,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      createdBy: req.user._id
    });
    await receipt.save();

    payment.receipt = receipt._id;
    payment.receiptNumber = receipt.receiptNumber;
    await payment.save();
  }

  // If status changed to completed, update invoice
  if (payment.status === 'completed' && existingPayment.status !== 'completed') {
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      invoice.paidAmount = (invoice.paidAmount || 0) + payment.amount;
      await invoice.updatePaymentStatus();
    }
  }

  // Log activity
  try {
    await ActivityService.logPaymentUpdated(payment, req.user);
  } catch (error) {
    console.error('Failed to log payment update activity:', error);
  }

  res.json({
    success: true,
    data: payment
  });
});

/**
 * Mark payment as completed
 */
export const markPaymentAsCompleted = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Check project access
  const project = await Project.findById(payment.project);
  if (!project.hasPermission(req.user._id, 'support-executive') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update this payment');
  }

  if (payment.status === 'completed') {
    throw new ValidationError('Payment is already completed');
  }

  payment.status = 'completed';
  payment.updatedBy = req.user._id;
  await payment.save();

  // Update invoice
  const invoice = await Invoice.findById(payment.invoice);
  if (invoice) {
    invoice.paidAmount = (invoice.paidAmount || 0) + payment.amount;
    await invoice.updatePaymentStatus();
  }

  // Create receipt if doesn't exist
  if (!payment.receipt) {
    const invoice = await Invoice.findById(payment.invoice);
    const deal = await Deal.findById(payment.deal);
    const customer = await Customer.findById(payment.customer);

    const receipt = new Receipt({
      payment: payment._id,
      invoice: invoice._id,
      deal: deal._id,
      customer: customer._id,
      company: payment.company || null,
      project: payment.project,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      createdBy: req.user._id
    });
    await receipt.save();

    payment.receipt = receipt._id;
    payment.receiptNumber = receipt.receiptNumber;
    await payment.save();
  }

  // Log activity
  try {
    await ActivityService.logPaymentCompleted(payment, req.user);
  } catch (error) {
    console.error('Failed to log payment completion activity:', error);
  }

  res.json({
    success: true,
    data: payment
  });
});

/**
 * Process refund for a payment
 */
export const processRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const payment = await Payment.findById(id);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Check project access
  const project = await Project.findById(payment.project);
  if (!project.hasPermission(req.user._id, 'manager') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to process refunds');
  }

  if (payment.status !== 'completed') {
    throw new ValidationError('Only completed payments can be refunded');
  }

  const refundAmount = amount || payment.amount;
  if (refundAmount > payment.amount) {
    throw new ValidationError('Refund amount cannot exceed payment amount');
  }

  await payment.processRefund(refundAmount, reason);

  // Update invoice if payment was linked
  if (payment.invoice) {
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      invoice.paidAmount = Math.max(0, (invoice.paidAmount || 0) - refundAmount);
      await invoice.updatePaymentStatus();
    }
  }

  // Log activity
  try {
    await ActivityService.logPaymentRefunded(payment, req.user);
  } catch (error) {
    console.error('Failed to log payment refund activity:', error);
  }

  res.json({
    success: true,
    data: payment
  });
});

/**
 * Delete a payment
 */
export const deletePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Check project access
  const project = await Project.findById(payment.project);
  if (!project.hasPermission(req.user._id, 'manager') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to delete this payment');
  }

  // Update invoice if payment was completed
  if (payment.status === 'completed' && payment.invoice) {
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      invoice.paidAmount = Math.max(0, (invoice.paidAmount || 0) - payment.amount);
      await invoice.updatePaymentStatus();
    }
  }

  // Delete associated receipt if exists
  if (payment.receipt) {
    await Receipt.findByIdAndDelete(payment.receipt);
  }

  await Payment.findByIdAndDelete(id);

  // Log activity
  try {
    await ActivityService.logPaymentDeleted(payment, req.user);
  } catch (error) {
    console.error('Failed to log payment deletion activity:', error);
  }

  res.json({
    success: true,
    message: 'Payment deleted successfully'
  });
});

/**
 * Get payment statistics for a project
 */
export const getPaymentStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view payment statistics in this project');
  }

  const stats = await Payment.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        isArchived: false
      }
    },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        },
        refundedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$refundAmount', 0] }
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get payment method breakdown
  const methodStats = await Payment.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        isArchived: false,
        status: 'completed'
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
    totalPayments: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0
  };

  result.paymentMethods = methodStats;

  res.json({
    success: true,
    data: result
  });
});

