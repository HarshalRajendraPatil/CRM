import Deal from '../models/Deal.model.js';
import Customer from '../models/Customer.model.js';
import Company from '../models/Company.model.js';
import User from '../models/User.model.js';
import { validateDealData, sanitizeDealData } from '../utils/dealValidation.js';
import { createDealNotification } from '../utils/notificationService.js';
import { asyncHandler, AppError, ValidationError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

// Helper function to format currency
const formatCurrency = (amount, currency = 'USD') => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// ==================== BASIC CRUD OPERATIONS ====================

/**
 * Get all deals for a project with filtering, sorting, and pagination
 */
export const getProjectDeals = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
    status,
    priority,
    assignedTo,
    source,
    tags,
    minValue,
    maxValue,
    expectedCloseDateFrom,
    expectedCloseDateTo,
    createdDateFrom,
    createdDateTo,
    isArchived = false
  } = req.query;

  // Build filter object
  const filter = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: isArchived === 'true'
  };

  // Add search filter
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { dealNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Add status filter
  if (status) {
    filter.status = { $in: status.split(',') };
  }


  // Add priority filter
  if (priority) {
    filter.priority = { $in: priority.split(',') };
  }

  // Add assigned user filter
  if (assignedTo) {
    filter.assignedTo = { $in: assignedTo.split(',').map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Add source filter
  if (source) {
    filter.source = { $regex: source, $options: 'i' };
  }

  // Add tags filter
  if (tags) {
    filter.tags = { $in: tags.split(',') };
  }

  // Add value range filter
  if (minValue || maxValue) {
    filter.value = {};
    if (minValue) filter.value.$gte = Number(minValue);
    if (maxValue) filter.value.$lte = Number(maxValue);
  }

  // Add date range filters
  if (expectedCloseDateFrom || expectedCloseDateTo) {
    filter.expectedCloseDate = {};
    if (expectedCloseDateFrom) filter.expectedCloseDate.$gte = new Date(expectedCloseDateFrom);
    if (expectedCloseDateTo) filter.expectedCloseDate.$lte = new Date(expectedCloseDateTo);
  }

  if (createdDateFrom || createdDateTo) {
    filter.createdAt = {};
    if (createdDateFrom) filter.createdAt.$gte = new Date(createdDateFrom);
    if (createdDateTo) filter.createdAt.$lte = new Date(createdDateTo);
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Execute query with aggregation for better performance
  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: 'users',
        localField: 'assignedTo',
        foreignField: '_id',
        as: 'assignedUser'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'creator'
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customerInfo',
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'companyInfo'
      }
    },
    {
      $addFields: {
        assignedUser: { $arrayElemAt: ['$assignedUser', 0] },
        creator: { $arrayElemAt: ['$creator', 0] },
        customerInfo: { $arrayElemAt: ['$customerInfo', 0] },
        companyInfo: { $arrayElemAt: ['$companyInfo', 0] },
        ageInDays: {
          $divide: [
            { $subtract: [new Date(), '$createdAt'] },
            86400000
          ]
        }
      }
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: Number(limit) }
  ];

  const deals = await Deal.aggregate(pipeline);
  const total = await Deal.countDocuments(filter);

  res.json({
    success: true,
    data: deals,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Get archived deals for a project
 */
export const getArchivedDeals = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'archivedAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build filter for archived deals
  const filter = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: true
  };

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Build aggregation pipeline
  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: 'users',
        localField: 'assignedTo',
        foreignField: '_id',
        as: 'assignedUser'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'creator'
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customerInfo'
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'companyInfo'
      }
    },
    {
      $addFields: {
        assignedUser: { $arrayElemAt: ['$assignedUser', 0] },
        creator: { $arrayElemAt: ['$creator', 0] },
        customerInfo: { $arrayElemAt: ['$customerInfo', 0] },
        companyInfo: { $arrayElemAt: ['$companyInfo', 0] },
        ageInDays: {
          $divide: [
            { $subtract: [new Date(), '$createdAt'] },
            86400000
          ]
        }
      }
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: Number(limit) }
  ];

  const deals = await Deal.aggregate(pipeline);
  const total = await Deal.countDocuments(filter);

  res.json({
    success: true,
    data: deals,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * Get a single deal by ID
 */
export const getDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deal = await Deal.findById(id)
    .populate('assignedTo', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('customer', 'firstName lastName email phone company')
    .populate('company', 'name website industry')
    .populate('activities.createdBy', 'name email profileImage')
    .populate('notes.createdBy', 'name email profileImage');

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  // Add calculated fields
  const dealObj = deal.toObject();
  dealObj.ageInDays = deal.ageInDays();
  dealObj.totalValue = deal.totalValue;

  res.json({
    success: true,
    data: dealObj
  });
});

/**
 * Create a new deal
 */
export const createDeal = asyncHandler(async (req, res) => {
  const dealData = { ...req.body, projectId: req.params.projectId, createdBy: req.user.id };

  // Validate deal data
  const validation = validateDealData(dealData);
  console.log(validation);
  if (!validation.isValid) {
    throw new ValidationError('Invalid deal data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizeDealData(validation.sanitizedData);

  // Create deal
  const deal = await Deal.create(sanitizedData);

  await Company.findByIdAndUpdate(sanitizedData.company, { $addToSet: { deals: deal._id } });

  await Customer.findByIdAndUpdate(sanitizedData.customer, { $addToSet: { deals: deal._id } });

  // Populate the created deal
  await deal.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'customer', select: 'name email phone' },
    { path: 'company', select: 'name website' }
  ]);

  // Create notification
  await createDealNotification('deal_created', deal, deal.projectId, req.user.id);

  res.status(201).json({
    success: true,
    data: deal
  });
});

/**
 * Update a deal
 */
export const updateDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate update data
  const validation = validateDealData(updateData, true);
  if (!validation.isValid) {
    throw new ValidationError('Invalid deal data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizeDealData(validation.sanitizedData);

  // Get existing deal
  const existingDeal = await Deal.findById(id);
  if (!existingDeal) {
    throw new AppError('Deal not found', 404);
  }


  // Check for changes that need activity tracking
  const statusChanged = sanitizedData.status && sanitizedData.status !== existingDeal.status;
  const valueChanged = sanitizedData.value && sanitizedData.value !== existingDeal.value;
  const assignedChanged = sanitizedData.assignedTo && sanitizedData.assignedTo.toString() !== existingDeal.assignedTo?.toString();
  const unassigned = !sanitizedData.assignedTo && existingDeal.assignedTo;
  const closeDateChanged = sanitizedData.expectedCloseDate && sanitizedData.expectedCloseDate.toString() !== existingDeal.expectedCloseDate?.toString();

  // Update deal
  const deal = await Deal.findByIdAndUpdate(
    id,
    sanitizedData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'customer', select: 'name email phone' },
    { path: 'company', select: 'name website' },
  ]);

  // Track activities for various changes
  if (statusChanged) {
    await deal.updateStatus(sanitizedData.status, req.user.id, sanitizedData.statusChangeReason || 'Status updated');
  }

  if (valueChanged) {
    await deal.addActivity({
      type: 'value_change',
      description: `Deal value changed from ${formatCurrency(existingDeal.value, existingDeal.currency)} to ${formatCurrency(sanitizedData.value, sanitizedData.currency || existingDeal.currency)}`,
      createdBy: req.user.id,
      metadata: {
        oldValue: existingDeal.value,
        newValue: sanitizedData.value,
        currency: sanitizedData.currency || existingDeal.currency
      }
    });
  }

  if (assignedChanged) {
    const assignedUser = await User.findById(sanitizedData.assignedTo);
    await deal.addActivity({
      type: 'custom',
      description: `Deal assigned to ${assignedUser?.name || 'Unknown User'}`,
      createdBy: req.user.id,
      metadata: {
        assignedTo: sanitizedData.assignedTo,
        assignedToName: assignedUser?.name
      }
    });
  }

  if (unassigned) {
    await deal.addActivity({
      type: 'custom',
      description: 'Deal unassigned',
      createdBy: req.user.id,
      metadata: { action: 'unassign' }
    });
  }

  if (closeDateChanged) {
    await deal.addActivity({
      type: 'custom',
      description: `Expected close date changed to ${new Date(sanitizedData.expectedCloseDate).toLocaleDateString()}`,
      createdBy: req.user.id,
      metadata: {
        oldDate: existingDeal.expectedCloseDate,
        newDate: sanitizedData.expectedCloseDate
      }
    });
  }

  // Create notification for significant changes
  if (statusChanged || assignedChanged || unassigned || valueChanged) {
    await createDealNotification('deal_updated', deal, deal.projectId, req.user.id);
  }

  res.json({
    success: true,
    data: deal
  });
});

/**
 * Archive a deal (soft delete)
 */
export const archiveDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deal = await Deal.findByIdAndUpdate(
    id,
    {
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: req.user.id
    },
    { new: true }
  );

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  // Add activity for archiving
  await deal.addActivity({
    type: 'custom',
    description: 'Deal archived',
    createdBy: req.user.id,
    metadata: { action: 'archive' }
  });

  // Remove deal from company's deals array if company exists
  if (deal.company) {
    await mongoose.model('Company').findByIdAndUpdate(
      deal.company,
      { $pull: { deals: deal._id } }
    );
  }

  // Note: Customer deals are handled via the customer field in Deal model
  // No need to update customer records as they query deals by customer field

  // Create notification
  await createDealNotification('deal_archived', deal, deal.projectId, req.user.id);

  res.json({
    success: true,
    message: 'Deal archived successfully'
  });
});

/**
 * Delete a deal permanently (hard delete)
 */
export const deleteDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deal = await Deal.findById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  // Remove deal from company's deals array if company exists
  if (deal.company) {
    await mongoose.model('Company').findByIdAndUpdate(
      deal.company,
      { $pull: { deals: deal._id } }
    );
  }

  if (deal.customer) {
    await mongoose.model('Customer').findByIdAndUpdate(
      deal.customer,
      { $pull: { deals: deal._id } }
    );
  }

  // Add activity for deletion (before deleting the deal)
  await deal.addActivity({
    type: 'custom',
    description: 'Deal permanently deleted',
    createdBy: req.user.id,
    metadata: { action: 'delete' }
  });

  // Create notification before deletion
  await createDealNotification('deal_deleted', deal, deal.projectId, req.user.id);

  // Permanently delete the deal
  await Deal.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Deal deleted permanently'
  });
});

/**
 * Restore an archived deal
 */
export const restoreDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deal = await Deal.findByIdAndUpdate(
    id,
    {
      isArchived: false,
      $unset: { archivedAt: 1, archivedBy: 1 }
    },
    { new: true }
  ).populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'customer', select: 'name email phone' },
    { path: 'company', select: 'name website' },
  ]);

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  // Add deal back to company's deals array if company exists
  if (deal.company) {
    await mongoose.model('Company').findByIdAndUpdate(
      deal.company,
      { $addToSet: { deals: deal._id } }
    );
  }

  if (deal.customer) {
    await mongoose.model('Customer').findByIdAndUpdate(
      deal.customer,
      { $addToSet: { deals: deal._id } }
    );
  }

  // Create notification
  await createDealNotification('deal_restored', deal, deal.projectId, req.user.id);

  res.json({
    success: true,
    data: deal,
    message: 'Deal restored successfully'
  });
});

// ==================== DEAL ACTIVITIES ====================

/**
 * Add activity to a deal
 */
export const addDealActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, description, metadata = {} } = req.body;

  const deal = await Deal.findById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  const activity = {
    type,
    description,
    createdBy: req.user.id,
    metadata
  };

  await deal.addActivity(activity);

  // Populate the activity
  await deal.populate('activities.createdBy', 'name email profileImage');

  const newActivity = deal.activities[deal.activities.length - 1];

  res.status(201).json({
    success: true,
    data: newActivity
  });
});

/**
 * Get deal activities
 */
export const getDealActivities = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, type } = req.query;

  const deal = await Deal.findById(id).populate('activities.createdBy', 'name email profileImage');
  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  let activities = deal.activities;

  // Filter by type if provided
  if (type) {
    activities = activities.filter(activity => activity.type === type);
  }

  // Sort by creation date (newest first)
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Paginate
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedActivities = activities.slice(skip, skip + Number(limit));

  res.json({
    success: true,
    data: paginatedActivities,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: activities.length,
      pages: Math.ceil(activities.length / Number(limit))
    }
  });
});

// ==================== DEAL NOTES ====================

/**
 * Add note to a deal
 */
export const addDealNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw new AppError('Note content is required', 400);
  }

  const deal = await Deal.findById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  const note = {
    content: content.trim(),
    createdBy: req.user.id
  };

  deal.notes.push(note);
  await deal.save();

  // Populate the note
  await deal.populate('notes.createdBy', 'name email profileImage');

  const newNote = deal.notes[deal.notes.length - 1];

  // Add activity
  await deal.addActivity({
    type: 'note',
    description: 'Note added',
    createdBy: req.user.id,
    metadata: { noteId: newNote._id }
  });

  res.status(201).json({
    success: true,
    data: newNote
  });
});

/**
 * Update a deal note
 */
export const updateDealNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw new AppError('Note content is required', 400);
  }

  const deal = await Deal.findById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  const note = deal.notes.id(noteId);
  if (!note) {
    throw new AppError('Note not found', 404);
  }

  // Check if user can edit this note
  if (note.createdBy.toString() !== req.user.id && req.user.roleGlobal !== 'system-admin') {
    throw new AppError('Not authorized to edit this note', 403);
  }

  note.content = content.trim();
  note.updatedAt = new Date();
  note.isEdited = true;

  await deal.save();

  // Add activity
  await deal.addActivity({
    type: 'note',
    description: 'Note updated',
    createdBy: req.user.id,
    metadata: { noteId: note._id }
  });

  res.json({
    success: true,
    data: note
  });
});

/**
 * Delete a deal note
 */
export const deleteDealNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;

  const deal = await Deal.findById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  const note = deal.notes.id(noteId);
  if (!note) {
    throw new AppError('Note not found', 404);
  }

  // Check if user can delete this note
  if (note.createdBy.toString() !== req.user.id && req.user.roleGlobal !== 'system-admin') {
    throw new AppError('Not authorized to delete this note', 403);
  }

  note.remove();
  await deal.save();

  // Add activity
  await deal.addActivity({
    type: 'note',
    description: 'Note deleted',
    createdBy: req.user.id,
    metadata: { noteId }
  });

  res.json({
    success: true,
    message: 'Note deleted successfully'
  });
});


// ==================== BULK OPERATIONS ====================

/**
 * Bulk update deals
 */
export const bulkUpdateDeals = asyncHandler(async (req, res) => {
  const { dealIds, updates } = req.body;

  if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
    throw new AppError('Deal IDs are required', 400);
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new AppError('Updates are required', 400);
  }

  // Validate updates
  const validation = validateDealData(updates, true);
  if (!validation.isValid) {
    throw new ValidationError('Invalid update data', validation.errors);
  }

  const sanitizedUpdates = sanitizeDealData(validation.sanitizedData);

  // Update deals
  const result = await Deal.updateMany(
    { _id: { $in: dealIds }, projectId: req.params.projectId },
    sanitizedUpdates
  );

  // Create notifications for each updated deal
  const deals = await Deal.find({ _id: { $in: dealIds } });
  for (const deal of deals) {
    await createDealNotification('deal_updated', deal, deal.projectId, req.user.id);
  }

  res.json({
    success: true,
    message: `${result.modifiedCount} deals updated successfully`,
    modifiedCount: result.modifiedCount
  });
});

/**
 * Bulk archive deals
 */
export const bulkArchiveDeals = asyncHandler(async (req, res) => {
  const { dealIds } = req.body;

  if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
    throw new AppError('Deal IDs are required', 400);
  }

  // Archive deals
  const result = await Deal.updateMany(
    { _id: { $in: dealIds }, projectId: req.params.projectId },
    {
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: req.user.id
    }
  );

  // Remove deals from company's deals arrays
  const deals = await Deal.find({ _id: { $in: dealIds } });
  const companyIds = [...new Set(deals.filter(deal => deal.company).map(deal => deal.company))];
  
  for (const companyId of companyIds) {
    await mongoose.model('Company').findByIdAndUpdate(
      companyId,
      { $pull: { deals: { $in: dealIds } } }
    );
  }

  // Create notifications for each archived deal
  for (const deal of deals) {
    await createDealNotification('deal_archived', deal, deal.projectId, req.user.id);
  }

  res.json({
    success: true,
    message: `${result.modifiedCount} deals archived successfully`,
    modifiedCount: result.modifiedCount
  });
});

/**
 * Bulk delete deals permanently
 */
export const bulkDeleteDeals = asyncHandler(async (req, res) => {
  const { dealIds } = req.body;

  if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
    throw new AppError('Deal IDs are required', 400);
  }

  // Get deals before deletion for notifications and company updates
  const deals = await Deal.find({ _id: { $in: dealIds }, projectId: req.params.projectId });
  
  // Remove deals from company's deals arrays
  const companyIds = [...new Set(deals.filter(deal => deal.company).map(deal => deal.company))];
  
  for (const companyId of companyIds) {
    await mongoose.model('Company').findByIdAndUpdate(
      companyId,
      { $pull: { deals: { $in: dealIds } } }
    );
  }

  // Create notifications for each deleted deal
  for (const deal of deals) {
    await createDealNotification('deal_deleted', deal, deal.projectId, req.user.id);
  }

  // Permanently delete deals
  const result = await Deal.deleteMany({ _id: { $in: dealIds }, projectId: req.params.projectId });

  res.json({
    success: true,
    message: `${result.deletedCount} deals deleted permanently`,
    deletedCount: result.deletedCount
  });
});

/**
 * Bulk assign deals
 */
export const bulkAssignDeals = asyncHandler(async (req, res) => {
  const { dealIds, assignedTo } = req.body;

  if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
    throw new AppError('Deal IDs are required', 400);
  }

  if (!assignedTo) {
    throw new AppError('Assigned user is required', 400);
  }

  // Verify assigned user exists
  const user = await User.findById(assignedTo);
  if (!user) {
    throw new AppError('Assigned user not found', 404);
  }

  // Update deals
  const result = await Deal.updateMany(
    { _id: { $in: dealIds }, projectId: req.params.projectId },
    { assignedTo }
  );

  // Create notifications for each assigned deal
  const deals = await Deal.find({ _id: { $in: dealIds } });
  for (const deal of deals) {
    await deal.addActivity({
      type: 'custom',
      description: `Deal assigned to ${user.name}`,
      createdBy: req.user.id,
      metadata: { assignedTo: user._id, assignedToName: user.name }
    });
    await createDealNotification('deal_assigned', deal, deal.projectId, req.user.id);
  }

  res.json({
    success: true,
    message: `${result.modifiedCount} deals assigned successfully`,
    modifiedCount: result.modifiedCount
  });
});

// ==================== DEAL STAGE MANAGEMENT ====================


/**
 * Update deal status
 */
export const updateDealStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!status) {
    throw new AppError('Status is required', 400);
  }

  const deal = await Deal.findById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  // Update status
  await deal.updateStatus(status, req.user.id, reason);

  // Create notification
  await createDealNotification('deal_status_changed', deal, deal.projectId, req.user.id);

  res.json({
    success: true,
    data: deal,
    message: 'Deal status updated successfully'
  });
});

// ==================== DEAL STATISTICS & ANALYTICS ====================

/**
 * Get comprehensive deal statistics for a project
 */
export const getDealStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { period = '30d', startDate, endDate } = req.query;

  // Calculate date range
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  } else {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const start = new Date();
    start.setDate(start.getDate() - days);
    dateFilter = { createdAt: { $gte: start } };
  }

  const baseFilter = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: false,
    ...dateFilter
  };

  // Basic statistics
  const [
    totalDeals,
    openDeals,
    wonDeals,
    lostDeals,
    totalValue,
    wonValue,
    lostValue,
    avgDealSize,
    avgSalesCycle,
    conversionRate,
    priorityDistribution,
    sourceDistribution,
    monthlyTrend,
    userPerformance
  ] = await Promise.all([
    // Total deals
    Deal.countDocuments(baseFilter),
    
    // Open deals
    Deal.countDocuments({ ...baseFilter, status: 'open' }),
    
    // Won deals
    Deal.countDocuments({ ...baseFilter, status: 'won' }),
    
    // Lost deals
    Deal.countDocuments({ ...baseFilter, status: 'lost' }),
    
    // Total value
    Deal.aggregate([
      { $match: baseFilter },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]),
    
    // Won value
    Deal.aggregate([
      { $match: { ...baseFilter, status: 'won' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]),
    
    // Lost value
    Deal.aggregate([
      { $match: { ...baseFilter, status: 'lost' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]),
    
    // Average deal size
    Deal.aggregate([
      { $match: baseFilter },
      { $group: { _id: null, avg: { $avg: '$value' } } }
    ]),
    
    // Average sales cycle
    Deal.aggregate([
      { $match: { ...baseFilter, status: { $in: ['won', 'lost'] } } },
      {
        $addFields: {
          salesCycle: {
            $divide: [
              { $subtract: ['$actualCloseDate', '$createdAt'] },
              86400000 // Convert to days
            ]
          }
        }
      },
      { $group: { _id: null, avg: { $avg: '$salesCycle' } } }
    ]),
    
    // Conversion rate
    Deal.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    
    
    // Priority distribution
    Deal.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]),
    
    // Source distribution
    Deal.aggregate([
      { $match: { ...baseFilter, source: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      },
      { $sort: { count: -1 } }
    ]),
    
    // Monthly trend
    Deal.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
          wonCount: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
          },
          wonValue: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, '$value', 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    
    // User performance
    Deal.aggregate([
      { $match: { ...baseFilter, assignedTo: { $exists: true } } },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$assignedTo',
          userName: { $first: '$user.name' },
          userEmail: { $first: '$user.email' },
          totalDeals: { $sum: 1 },
          totalValue: { $sum: '$value' },
          wonDeals: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          wonValue: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, '$value', 0] } },
          lostDeals: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
          avgDealSize: { $avg: '$value' }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $multiply: [
              { $divide: ['$wonDeals', '$totalDeals'] },
              100
            ]
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]),
    
  ]);

  // Calculate conversion rate
  const statusCounts = conversionRate.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  const totalClosed = (statusCounts.won || 0) + (statusCounts.lost || 0);
  const conversionRateValue = totalClosed > 0 ? ((statusCounts.won || 0) / totalClosed) * 100 : 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalDeals,
        openDeals,
        wonDeals,
        lostDeals,
        totalValue: totalValue[0]?.total || 0,
        wonValue: wonValue[0]?.total || 0,
        lostValue: lostValue[0]?.total || 0,
        avgDealSize: avgDealSize[0]?.avg || 0,
        avgSalesCycle: avgSalesCycle[0]?.avg || 0,
        conversionRate: conversionRateValue
      },
      distributions: {
        priorities: priorityDistribution,
        sources: sourceDistribution
      },
      trends: {
        monthly: monthlyTrend
      },
      performance: {
        users: userPerformance
      }
    }
  });
});


/**
 * Get deal velocity analysis
 */
export const getDealVelocity = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { period = '30d' } = req.query;

  // Calculate date range
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const start = new Date();
  start.setDate(start.getDate() - days);

  const baseFilter = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: false,
    createdAt: { $gte: start }
  };

  // Get deals
  const deals = await Deal.find(baseFilter)
    .select('name value status createdAt actualCloseDate')
    .sort({ createdAt: -1 });

  // Calculate velocity metrics
  const velocityData = deals.map(deal => {
    const totalDuration = deal.actualCloseDate 
      ? (deal.actualCloseDate - deal.createdAt) / (1000 * 60 * 60 * 24)
      : (new Date() - deal.createdAt) / (1000 * 60 * 60 * 24);
    
    return {
      dealId: deal._id,
      name: deal.name,
      value: deal.value,
      status: deal.status,
      totalDuration,
      velocity: deal.value / totalDuration, // Value per day
      isActive: deal.status === 'open'
    };
  });

  // Calculate summary statistics
  const activeDeals = velocityData.filter(d => d.isActive);
  const closedDeals = velocityData.filter(d => !d.isActive);
  
  const summary = {
    totalDeals: velocityData.length,
    activeDeals: activeDeals.length,
    closedDeals: closedDeals.length,
    avgDealDuration: closedDeals.length > 0 
      ? closedDeals.reduce((sum, d) => sum + d.totalDuration, 0) / closedDeals.length 
      : 0,
    avgVelocity: closedDeals.length > 0
      ? closedDeals.reduce((sum, d) => sum + d.velocity, 0) / closedDeals.length
      : 0,
    totalPipelineValue: activeDeals.reduce((sum, d) => sum + d.value, 0),
    weightedAvgVelocity: activeDeals.length > 0
      ? activeDeals.reduce((sum, d) => sum + (d.value * d.velocity), 0) / activeDeals.reduce((sum, d) => sum + d.value, 0)
      : 0
  };


  res.json({
    success: true,
    data: {
      summary,
      deals: velocityData,
    }
  });
});

/**
 * Get deal forecasting and predictions
 */
export const getDealForecast = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { forecastPeriod = '30d' } = req.query;

  // Calculate forecast period
  const days = forecastPeriod === '7d' ? 7 : forecastPeriod === '30d' ? 30 : forecastPeriod === '90d' ? 90 : 365;
  const forecastEnd = new Date();
  forecastEnd.setDate(forecastEnd.getDate() + days);

  const baseFilter = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: false
  };

  // Get historical data for prediction
  const historicalDeals = await Deal.find({
    ...baseFilter,
    status: { $in: ['won', 'lost'] },
    actualCloseDate: { $exists: true }
  }).select('value probability expectedCloseDate actualCloseDate createdAt status');

  // Calculate historical conversion rates by probability
  const probabilityBrackets = [
    { min: 0, max: 20, label: '0-20%' },
    { min: 21, max: 40, label: '21-40%' },
    { min: 41, max: 60, label: '41-60%' },
    { min: 61, max: 80, label: '61-80%' },
    { min: 81, max: 100, label: '81-100%' }
  ];

  const conversionRates = probabilityBrackets.map(bracket => {
    const deals = historicalDeals.filter(deal => 
      deal.probability >= bracket.min && deal.probability <= bracket.max
    );
    const wonDeals = deals.filter(deal => deal.status === 'won');
    
    return {
      bracket: bracket.label,
      totalDeals: deals.length,
      wonDeals: wonDeals.length,
      conversionRate: deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0,
      avgValue: wonDeals.length > 0 ? wonDeals.reduce((sum, d) => sum + d.value, 0) / wonDeals.length : 0
    };
  });

  // Get current open deals for forecasting
  const openDeals = await Deal.find({
    ...baseFilter,
    status: 'open',
    expectedCloseDate: { $lte: forecastEnd }
  }).select('name value probability expectedCloseDate stage assignedTo');

  // Calculate forecast based on probability and historical conversion rates
  const forecast = openDeals.map(deal => {
    const bracket = probabilityBrackets.find(b => 
      deal.probability >= b.min && deal.probability <= b.max
    );
    const conversionData = conversionRates.find(c => c.bracket === bracket?.label);
    
    const adjustedProbability = conversionData ? conversionData.conversionRate : deal.probability;
    const forecastValue = deal.value * (adjustedProbability / 100);
    
    return {
      dealId: deal._id,
      name: deal.name,
      value: deal.value,
      probability: deal.probability,
      adjustedProbability,
      forecastValue,
      expectedCloseDate: deal.expectedCloseDate,
      stage: deal.stage,
      assignedTo: deal.assignedTo
    };
  });

  // Calculate forecast summary
  const forecastSummary = {
    totalOpenDeals: openDeals.length,
    totalPipelineValue: openDeals.reduce((sum, d) => sum + d.value, 0),
    forecastValue: forecast.reduce((sum, d) => sum + d.forecastValue, 0),
    confidence: forecast.length > 0 
      ? forecast.reduce((sum, d) => sum + d.adjustedProbability, 0) / forecast.length 
      : 0,
    dealsClosingThisPeriod: openDeals.filter(d => 
      d.expectedCloseDate && d.expectedCloseDate <= forecastEnd
    ).length
  };

  // Get forecast by month
  const monthlyForecast = [];
  const currentDate = new Date();
  
  for (let i = 0; i < Math.ceil(days / 30); i++) {
    const monthStart = new Date(currentDate);
    monthStart.setMonth(monthStart.getMonth() + i);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const monthDeals = forecast.filter(deal => 
      deal.expectedCloseDate && 
      deal.expectedCloseDate >= monthStart && 
      deal.expectedCloseDate < monthEnd
    );
    
    monthlyForecast.push({
      month: monthStart.toISOString().substring(0, 7),
      dealCount: monthDeals.length,
      forecastValue: monthDeals.reduce((sum, d) => sum + d.forecastValue, 0),
      avgProbability: monthDeals.length > 0 
        ? monthDeals.reduce((sum, d) => sum + d.adjustedProbability, 0) / monthDeals.length 
        : 0
    });
  }

  res.json({
    success: true,
    data: {
      summary: forecastSummary,
      deals: forecast,
      conversionRates,
      monthlyForecast
    }
  });
});

/**
 * Get deal insights and recommendations
 */
export const getDealInsights = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const baseFilter = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: false
  };

  // Get comprehensive deal data
  const [deals, userPerformance, timeAnalysis] = await Promise.all([
    Deal.find(baseFilter).populate('assignedTo', 'name email'),
    Deal.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$assignedTo',
          totalDeals: { $sum: 1 },
          wonDeals: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          totalValue: { $sum: '$value' },
          wonValue: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, '$value', 0] } },
          avgDealSize: { $avg: '$value' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          conversionRate: { $multiply: [{ $divide: ['$wonDeals', '$totalDeals'] }, 100] }
        }
      }
    ]),
    Deal.aggregate([
      { $match: { ...baseFilter, status: { $in: ['won', 'lost'] } } },
      {
        $addFields: {
          salesCycle: {
            $divide: [
              { $subtract: ['$actualCloseDate', '$createdAt'] },
              86400000
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgSalesCycle: { $avg: '$salesCycle' },
          medianSalesCycle: { $percentile: { input: '$salesCycle', p: [0.5], method: 'approximate' } },
          minSalesCycle: { $min: '$salesCycle' },
          maxSalesCycle: { $max: '$salesCycle' }
        }
      }
    ])
  ]);

  // Generate insights
  const insights = [];

  // Performance insights
  const topPerformer = userPerformance.reduce((max, user) => 
    user.conversionRate > max.conversionRate ? user : max, userPerformance[0] || { conversionRate: 0 }
  );
  
  if (topPerformer && topPerformer.conversionRate > 0) {
    insights.push({
      type: 'performance',
      title: 'Top Performer',
      message: `${topPerformer.user.name} has the highest conversion rate at ${topPerformer.conversionRate.toFixed(1)}%`,
      priority: 'high',
      recommendation: 'Consider sharing best practices from top performers with the team'
    });
  }


  // Time-based insights
  if (timeAnalysis[0]) {
    const avgCycle = timeAnalysis[0].avgSalesCycle;
    if (avgCycle > 90) {
      insights.push({
        type: 'timing',
        title: 'Long Sales Cycle',
        message: `Average sales cycle is ${avgCycle.toFixed(1)} days`,
        priority: 'medium',
        recommendation: 'Consider implementing strategies to accelerate the sales process'
      });
    }
  }

  // Value insights
  const highValueDeals = deals.filter(d => d.value > 10000);
  const highValueWinRate = highValueDeals.length > 0 
    ? (highValueDeals.filter(d => d.status === 'won').length / highValueDeals.length) * 100 
    : 0;

  if (highValueWinRate < 30 && highValueDeals.length > 5) {
    insights.push({
      type: 'value',
      title: 'High-Value Deal Performance',
      message: `Win rate for deals over $10k is only ${highValueWinRate.toFixed(1)}%`,
      priority: 'high',
      recommendation: 'Focus on improving qualification and nurturing for high-value opportunities'
    });
  }

  // Stale deals insight
  const staleDeals = deals.filter(d => 
    d.status === 'open' && 
    d.expectedCloseDate && 
    d.expectedCloseDate < new Date()
  );

  if (staleDeals.length > 0) {
    insights.push({
      type: 'stale',
      title: 'Overdue Deals',
      message: `${staleDeals.length} deals have passed their expected close date`,
      priority: 'high',
      recommendation: 'Review and update close dates or take action on overdue deals'
    });
  }

  // Recommendations
  const recommendations = [
    {
      category: 'Process',
      title: 'Implement Stage Gates',
      description: 'Add mandatory criteria for moving deals between stages',
      impact: 'high',
      effort: 'medium'
    },
    {
      category: 'Training',
      title: 'Sales Training Program',
      description: 'Develop training based on top performer practices',
      impact: 'high',
      effort: 'high'
    },
    {
      category: 'Technology',
      title: 'Deal Scoring Automation',
      description: 'Implement automated deal scoring based on historical data',
      impact: 'medium',
      effort: 'medium'
    },
    {
      category: 'Process',
      title: 'Regular Deal Reviews',
      description: 'Schedule weekly deal review meetings',
      impact: 'medium',
      effort: 'low'
    }
  ];

  res.json({
    success: true,
    data: {
      insights,
      recommendations,
      summary: {
        totalDeals: deals.length,
        activeDeals: deals.filter(d => d.status === 'open').length,
        avgDealValue: deals.length > 0 ? deals.reduce((sum, d) => sum + d.value, 0) / deals.length : 0,
        conversionRate: deals.length > 0 ? (deals.filter(d => d.status === 'won').length / deals.length) * 100 : 0
      }
    }
  });
});

// ==================== DEAL EXPORT ====================

/**
 * Export deals to CSV/JSON
 */
export const exportDeals = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { format = 'json', ...filters } = req.query;

  // Build filter (similar to getProjectDeals)
  const filter = {
    projectId: new mongoose.Types.ObjectId(projectId),
    isArchived: false
  };

  // Apply filters (simplified version)
  if (filters.status) filter.status = { $in: filters.status.split(',') };
  if (filters.assignedTo) filter.assignedTo = { $in: filters.assignedTo.split(',').map(id => new mongoose.Types.ObjectId(id)) };

  const deals = await Deal.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('customer', 'name email')
    .populate('company', 'name website')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = deals.map(deal => ({
      'Deal Number': deal.dealNumber,
      'Name': deal.name,
      'Value': deal.value,
      'Currency': deal.currency,
      'Status': deal.status,
      'Priority': deal.priority,
      'Probability': deal.probability,
      'Expected Close Date': deal.expectedCloseDate?.toISOString().split('T')[0],
      'Assigned To': deal.assignedTo?.name || '',
      'Customer': deal.customer?.name || '',
      'Company': deal.company?.name || '',
      'Created Date': deal.createdAt.toISOString().split('T')[0],
      'Created By': deal.createdBy?.name || ''
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=deals-${projectId}-${new Date().toISOString().split('T')[0]}.csv`);
    
    // Simple CSV conversion
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    res.send(csvContent);
  } else {
    res.json({
      success: true,
      data: deals,
      count: deals.length
    });
  }
});
