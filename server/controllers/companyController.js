import Company from '../models/Company.model.js';
import Project from '../models/Project.model.js';
import mongoose from 'mongoose';
import { asyncHandler, ValidationError, NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';
import { validateCompanyData, sanitizeCompanyData } from '../utils/companyValidation.js';
import { validateObjectId } from '../utils/validation.js';
import notificationService from '../utils/notificationService.js';


// @desc    Create a new company
// @route   POST /api/companies
// @access  Private (project members)
export const createCompany = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  
  // Validate project ID
  if (!projectId) {
    throw new ValidationError('Project ID is required');
  }
  
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to create companies in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to create companies in this project');
  }
  
  // Add project ID to the company data
  const companyData = {
    ...req.body,
    project: projectId,
    owner: req.user._id,
    createdBy: req.user._id,
    updatedBy: req.user._id
  };
  
  // Validate company data
  const validation = validateCompanyData(companyData);
  console.log(validation);
  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }
  
  // Sanitize company data
  let sanitizedData = sanitizeCompanyData(companyData);
  sanitizedData = {...sanitizedData, createdBy: req.user._id, updatedBy: req.user._id, owner: req.user._id}
  
  // Create company
  const company = await Company.create(sanitizedData);
  
  // Populate owner, createdBy, and updatedBy fields
  await company.populate('owner', 'name email profileImage');
  await company.populate('createdBy', 'name email profileImage');
  await company.populate('updatedBy', 'name email profileImage');
  
  // Create notification for project members
  try {
    await notificationService.createCompanyNotification(
      'company_created',
      company,
      projectId,
      req.user._id,
      [req.user._id] // exclude the creator from notification
    );
  } catch (error) {
    console.error('Failed to create company notification:', error);
    // Continue with company creation even if notification fails
  }
  
  res.status(201).json({
    success: true,
    message: 'Company created successfully',
    data: { company }
  });


});

// @desc    Get all companies for a project
// @route   GET /api/companies/project/:projectId
// @access  Private (project members)
export const getProjectCompanies = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { 
    limit = 20, 
    skip = 0, 
    sort = 'name', 
    order = 'asc',
    status,
    industry,
    search,
    tags
  } = req.query;
  
  // Validate project ID
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to view companies in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view companies in this project');
  }
  
  // Get companies
  const companies = await Company.findByProject(projectId, {
    limit,
    skip,
    sort,
    order,
    status,
    industry,
    search,
    tags: tags ? tags.split(',') : undefined
  });
  
  // Get total count for pagination
  const totalCount = await Company.countDocuments({ project: projectId });
  
  res.json({
    success: true,
    data: {
      companies,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + companies.length < totalCount
      }
    }
  });
});

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private (project members)
export const getCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find company with populated fields
  const company = await Company.findById(id)
    .populate('owner', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('updatedBy', 'name email profileImage')
    .populate('lastActivityBy', 'name email profileImage')
    .populate('notes.createdBy', 'name email profileImage')
    .populate('project', 'name description');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Find project
  const project = await Project.findById(company.project);
  
  // Check if user has permission to view this company
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view this company');
  }
  
  res.json({
    success: true,
    data: { company }
  });
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (project members with appropriate permissions)
export const updateCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to update this company
  const project = company.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    company.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to update this company');
  }
  
  // Prepare update data
  const updateData = {
    ...req.body,
    updatedBy: req.user._id
  };
  
  // Don't allow changing the project
  delete updateData.project;
  delete updateData.createdBy;
  delete updateData.createdAt;
  
  // Validate update data
  const updateValidation = validateCompanyData({
    ...updateData,
    project: company.project._id // Add project ID for validation
  });
  
  if (!updateValidation.isValid) {
    throw new ValidationError('Validation failed', updateValidation.errors);
  }
  
  // Sanitize update data
  const sanitizedData = sanitizeCompanyData(updateData);
  
  // Update company
  const updatedCompany = await Company.findByIdAndUpdate(
    id,
    { 
      ...sanitizedData,
      lastActivityDate: new Date(),
      lastActivityType: 'company_updated',
      lastActivityBy: req.user._id
    },
    { new: true, runValidators: true }
  )
    .populate('owner', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('updatedBy', 'name email profileImage')
    .populate('lastActivityBy', 'name email profileImage');
  
  // Create notification for company update
  try {
    await notificationService.createCompanyNotification(
      'company_updated',
      updatedCompany,
      company.project._id,
      req.user._id,
      [req.user._id] // exclude the updater from notification
    );
  } catch (error) {
    console.error('Failed to create company update notification:', error);
    // Continue even if notification fails
  }
  
  res.json({
    success: true,
    message: 'Company updated successfully',
    data: { company: updatedCompany }
  });


});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (project owner, admin, or company owner)
export const deleteCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to delete this company
  const project = company.project;
  
  if (
    project.owner.toString() !== req.user._id.toString() && 
    !project.hasPermission(req.user._id, 'admin') && 
    company.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to delete this company');
  }
  
  // Store company name and project ID for notification
  const companyName = company.name;
  const projectId = company.project._id;
  
  // Delete company
  await company.deleteOne();
  
  // Create notification for company deletion
  try {
    await notificationService.createCompanyNotification(
      'company_deleted',
      { _id: id, name: companyName },
      projectId,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create company deletion notification:', error);
    // Continue even if notification fails
  }
  
  res.json({
    success: true,
    message: 'Company deleted successfully'
  });


});

// @desc    Add note to company
// @route   POST /api/companies/:id/notes
// @access  Private (project members)
export const addCompanyNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Validate note content
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError('Note content is required');
  }
  
  if (content.length > 5000) {
    throw new ValidationError('Note content cannot exceed 5000 characters');
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to add notes to this company
  const project = await Project.findById(company.project);
  
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to add notes to this company');
  }
  
  // Add note
  company.notes.push({
    content: content.trim(),
    createdBy: req.user._id,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Update activity
  company.lastActivityDate = new Date();
  company.lastActivityType = 'note_added';
  company.lastActivityBy = req.user._id;
  company.updatedBy = req.user._id;
  
  await company.save();
  
  // Populate the newly added note's createdBy field
  await company.populate('notes.createdBy', 'name email profileImage');
  
  // Get the newly added note
  const newNote = company.notes[company.notes.length - 1];
  
  // Create notification for note addition
  try {
    await notificationService.createCompanyNotification(
      'company_note_added',
      company,
      company.project._id,
      req.user._id,
      [req.user._id] // exclude the note creator from notification
    );
  } catch (error) {
    console.error('Failed to create note addition notification:', error);
    // Continue even if notification fails
  }
  
  res.status(201).json({
    success: true,
    message: 'Note added successfully',
    data: { note: newNote }
  });


});

// @desc    Get company notes
// @route   GET /api/companies/:id/notes
// @access  Private (project members)
export const getCompanyNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find company
  const company = await Company.findById(id)
    .populate('project')
    .populate('notes.createdBy', 'name email profileImage');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to view notes for this company
  const project = await Project.findById(company.project);
  
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view notes for this company');
  }
  
  // Sort notes by creation date (newest first)
  const notes = company.notes.sort((a, b) => b.createdAt - a.createdAt);
  
  res.json({
    success: true,
    data: { notes }
  });
});

// @desc    Update company note
// @route   PUT /api/companies/:id/notes/:noteId
// @access  Private (project members with appropriate permissions)
export const updateCompanyNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  const { content } = req.body;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Validate note ID
  const noteValidation = validateObjectId(noteId);
  if (!noteValidation.isValid) {
    throw new ValidationError(noteValidation.message);
  }
  
  // Validate note content
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError('Note content is required');
  }
  
  if (content.length > 5000) {
    throw new ValidationError('Note content cannot exceed 5000 characters');
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to update notes for this company
  const project = company.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    company.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to update notes for this company');
  }
  
  // Find the note
  const note = company.notes.id(noteId);
  if (!note) {
    throw new NotFoundError('Note not found');
  }
  
  // Check if user is the note creator or has admin permissions
  if (
    note.createdBy.toString() !== req.user._id.toString() && 
    !project.hasPermission(req.user._id, 'admin') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You can only edit your own notes');
  }
  
  // Update note
  note.content = content.trim();
  note.updatedAt = new Date();
  
  // Update activity
  company.lastActivityDate = new Date();
  company.lastActivityType = 'note_updated';
  company.lastActivityBy = req.user._id;
  company.updatedBy = req.user._id;
  
  await company.save();
  
  // Populate the updated note
  await company.populate('notes.createdBy', 'name email profileImage');
  const updatedNote = company.notes.id(noteId);
  
  res.json({
    success: true,
    message: 'Note updated successfully',
    data: { note: updatedNote }
  });
});

// @desc    Delete company note
// @route   DELETE /api/companies/:id/notes/:noteId
// @access  Private (project members with appropriate permissions)
export const deleteCompanyNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Validate note ID
  const noteValidation = validateObjectId(noteId);
  if (!noteValidation.isValid) {
    throw new ValidationError(noteValidation.message);
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to delete notes for this company
  const project = company.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    company.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to delete notes for this company');
  }
  
  // Find the note
  const note = company.notes.id(noteId);
  if (!note) {
    throw new NotFoundError('Note not found');
  }
  
  // Check if user is the note creator or has admin permissions
  if (
    note.createdBy.toString() !== req.user._id.toString() && 
    !project.hasPermission(req.user._id, 'admin') &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You can only delete your own notes');
  }
  
  // Remove note
  company.notes.pull(noteId);
  
  // Update activity
  company.lastActivityDate = new Date();
  company.lastActivityType = 'note_deleted';
  company.lastActivityBy = req.user._id;
  company.updatedBy = req.user._id;
  
  await company.save();
  
  res.json({
    success: true,
    message: 'Note deleted successfully'
  });
});

// @desc    Add tag to company
// @route   POST /api/companies/:id/tags
// @access  Private (project members with appropriate permissions)
export const addCompanyTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Validate tag
  if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
    throw new ValidationError('Tag is required');
  }
  
  if (tag.length > 50) {
    throw new ValidationError('Tag cannot exceed 50 characters');
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to add tags to this company
  const project = company.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    company.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to add tags to this company');
  }
  
  // Check if tag already exists
  if (company.tags.includes(tag.trim())) {
    return res.json({
      success: true,
      message: 'Tag already exists',
      data: { company }
    });
  }
  
  // Add tag
  company.tags.push(tag.trim());
  
  // Update activity
  company.lastActivityDate = new Date();
  company.lastActivityType = 'tag_added';
  company.lastActivityBy = req.user._id;
  company.updatedBy = req.user._id;
  
  await company.save();
  
  res.json({
    success: true,
    message: 'Tag added successfully',
    data: { company }
  });


});

// @desc    Remove tag from company
// @route   DELETE /api/companies/:id/tags/:tag
// @access  Private (project members with appropriate permissions)
export const removeCompanyTag = asyncHandler(async (req, res) => {
  const { id, tag } = req.params;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to remove tags from this company
  const project = company.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    company.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to remove tags from this company');
  }
  
  // Remove tag
  company.tags = company.tags.filter(t => t !== tag);
  
  // Update activity
  company.lastActivityDate = new Date();
  company.lastActivityType = 'tag_removed';
  company.lastActivityBy = req.user._id;
  company.updatedBy = req.user._id;
  
  await company.save();
  
  res.json({
    success: true,
    message: 'Tag removed successfully',
    data: { company }
  });


});

// @desc    Add custom field to company
// @route   POST /api/companies/:id/custom-fields
// @access  Private (project members with appropriate permissions)
export const addCustomField = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { key, value } = req.body;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Validate key and value
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    throw new ValidationError('Custom field key is required');
  }
  
  if (key.length > 50) {
    throw new ValidationError('Custom field key cannot exceed 50 characters');
  }
  
  if (value === undefined || value === null) {
    throw new ValidationError('Custom field value is required');
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to add custom fields to this company
  const project = company.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    company.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to add custom fields to this company');
  }
  
  // Add or update custom field
  if (!company.customFields) {
    company.customFields = new Map();
  }
  
  company.customFields.set(key.trim(), value);
  
  // Update activity
  company.lastActivityDate = new Date();
  company.lastActivityType = 'custom_field_added';
  company.lastActivityBy = req.user._id;
  company.updatedBy = req.user._id;
  
  await company.save();
  
  res.json({
    success: true,
    message: 'Custom field added successfully',
    data: { company }
  });


});

// @desc    Remove custom field from company
// @route   DELETE /api/companies/:id/custom-fields/:key
// @access  Private (project members with appropriate permissions)
export const removeCustomField = asyncHandler(async (req, res) => {
  const { id, key } = req.params;
  
  // Validate company ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find company
  const company = await Company.findById(id).populate('project');
  
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Check if user has permission to remove custom fields from this company
  const project = company.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    company.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to remove custom fields from this company');
  }
  
  // Check if custom field exists
  if (!company.customFields || !company.customFields.has(key)) {
    throw new NotFoundError('Custom field not found');
  }
  
  // Remove custom field
  company.customFields.delete(key);
  
  // Update activity
  company.lastActivityDate = new Date();
  company.lastActivityType = 'custom_field_removed';
  company.lastActivityBy = req.user._id;
  company.updatedBy = req.user._id;
  
  await company.save();
  
  res.json({
    success: true,
    message: 'Custom field removed successfully',
    data: { company }
  });


});

// @desc    Get company statistics for a project
// @route   GET /api/companies/project/:projectId/stats
// @access  Private (project members)
export const getCompanyStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  // Validate project ID
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to view company stats in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view company statistics in this project');
  }
  
  // Get total count
  const totalCount = await Company.countDocuments({ project: projectId });
  
  // Get counts by status
  const statusCounts = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Get counts by industry
  const industryCounts = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$industry', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Get counts by size
  const sizeCounts = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$size', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Get counts by annual revenue
  const revenueCounts = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$annualRevenue', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Get growth trend (companies created by month for the last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const growthTrend = await Company.aggregate([
    { 
      $match: { 
        project: new mongoose.Types.ObjectId(projectId),
        createdAt: { $gte: twelveMonthsAgo }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Get top tags
  const topTags = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Get activity trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activityTrends = await Company.aggregate([
    { 
      $match: { 
        project: new mongoose.Types.ObjectId(projectId),
        lastActivityDate: { $gte: thirtyDaysAgo }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$lastActivityDate' },
          month: { $month: '$lastActivityDate' },
          day: { $dayOfMonth: '$lastActivityDate' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Get recent activity
  const recentActivity = await Company.find({ project: projectId })
    .sort({ lastActivityDate: -1 })
    .limit(5)
    .select('name lastActivityDate lastActivityType lastActivityBy')
    .populate('lastActivityBy', 'name email profileImage');
  
  // Get companies with most notes
  const companiesWithMostNotes = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $addFields: { notesCount: { $size: '$notes' } } },
    { $sort: { notesCount: -1 } },
    { $limit: 5 },
    { $project: { name: 1, notesCount: 1 } }
  ]);
  
  // Get companies by country
  const companiesByCountry = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$address.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Format status counts
  const formattedStatusCounts = {};
  statusCounts.forEach(item => {
    formattedStatusCounts[item._id || 'unknown'] = item.count;
  });
  
  // Format industry counts
  const formattedIndustryCounts = {};
  industryCounts.forEach(item => {
    formattedIndustryCounts[item._id || 'unknown'] = item.count;
  });
  
  // Format size counts
  const formattedSizeCounts = {};
  sizeCounts.forEach(item => {
    formattedSizeCounts[item._id || 'unknown'] = item.count;
  });
  
  // Format revenue counts
  const formattedRevenueCounts = {};
  revenueCounts.forEach(item => {
    formattedRevenueCounts[item._id || 'unknown'] = item.count;
  });
  
  // Format growth trend
  const formattedGrowthTrend = growthTrend.map(item => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    count: item.count
  }));
  
  // Format activity trends
  const formattedActivityTrends = activityTrends.map(item => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
    count: item.count
  }));
  
  // Format top tags
  const formattedTopTags = topTags.map(item => ({
    tag: item._id,
    count: item.count
  }));
  
  // Format companies by country
  const formattedCompaniesByCountry = companiesByCountry.map(item => ({
    country: item._id || 'Unknown',
    count: item.count
  }));
  
  res.json({
    success: true,
    data: {
      total: totalCount,
      byStatus: formattedStatusCounts,
      byIndustry: formattedIndustryCounts,
      bySize: formattedSizeCounts,
      byRevenue: formattedRevenueCounts,
      growthTrend: formattedGrowthTrend,
      activityTrends: formattedActivityTrends,
      topTags: formattedTopTags,
      companiesByCountry: formattedCompaniesByCountry,
      companiesWithMostNotes,
      recentActivity
    }
  });
});

// @desc    Get company insights for a project
// @route   GET /api/companies/project/:projectId/insights
// @access  Private (project members)
export const getCompanyInsights = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  // Validate project ID
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to view company insights in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view company insights in this project');
  }
  
  // Get total companies
  const totalCompanies = await Company.countDocuments({ project: projectId });
  
  if (totalCompanies === 0) {
    return res.json({
      success: true,
      data: {
        message: 'No companies found for insights',
        insights: {}
      }
    });
  }
  
  // Get average notes per company
  const avgNotesPerCompany = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $addFields: { notesCount: { $size: '$notes' } } },
    { $group: { _id: null, avgNotes: { $avg: '$notesCount' } } }
  ]);
  
  // Get companies with most activity
  const mostActiveCompanies = await Company.find({ project: projectId })
    .sort({ lastActivityDate: -1 })
    .limit(5)
    .select('name lastActivityDate lastActivityType')
    .populate('lastActivityBy', 'name email profileImage');
  
  // Get companies by status distribution
  const statusDistribution = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Get companies by industry distribution
  const industryDistribution = await Company.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$industry', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  
  // Get companies created this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const companiesThisMonth = await Company.countDocuments({
    project: projectId,
    createdAt: { $gte: thisMonth }
  });
  
  // Get companies updated this week
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  
  const companiesUpdatedThisWeek = await Company.countDocuments({
    project: projectId,
    updatedAt: { $gte: thisWeek }
  });
  
  // Get companies with complete profiles (has website, email, phone, address)
  const companiesWithCompleteProfiles = await Company.countDocuments({
    project: projectId,
    website: { $exists: true, $ne: '' },
    email: { $exists: true, $ne: '' },
    phone: { $exists: true, $ne: '' },
    'address.street': { $exists: true, $ne: '' }
  });
  
  // Get companies with custom fields
  const companiesWithCustomFields = await Company.countDocuments({
    project: projectId,
    $expr: { $gt: [{ $size: { $objectToArray: '$customFields' } }, 0] }
  });
  
  // Get top performing companies (by activity)
  const topPerformingCompanies = await Company.find({ project: projectId })
    .sort({ lastActivityDate: -1 })
    .limit(3)
    .select('name industry status lastActivityDate')
    .populate('lastActivityBy', 'name');
  
  // Get insights summary
  const insights = {
    totalCompanies,
    avgNotesPerCompany: avgNotesPerCompany[0]?.avgNotes || 0,
    companiesThisMonth,
    companiesUpdatedThisWeek,
    companiesWithCompleteProfiles,
    companiesWithCustomFields,
    completionRate: totalCompanies > 0 ? Math.round((companiesWithCompleteProfiles / totalCompanies) * 100) : 0,
    activityRate: totalCompanies > 0 ? Math.round((companiesUpdatedThisWeek / totalCompanies) * 100) : 0,
    statusDistribution: statusDistribution.map(item => ({
      status: item._id || 'Unknown',
      count: item.count,
      percentage: Math.round((item.count / totalCompanies) * 100)
    })),
    industryDistribution: industryDistribution.map(item => ({
      industry: item._id || 'Unknown',
      count: item.count,
      percentage: Math.round((item.count / totalCompanies) * 100)
    })),
    mostActiveCompanies,
    topPerformingCompanies
  };
  
  res.json({
    success: true,
    data: {
      insights
    }
  });
});

// @desc    Bulk update companies
// @route   PUT /api/companies/bulk-update
// @access  Private (project members with manager access)
export const bulkUpdateCompanies = asyncHandler(async (req, res) => {
  const { companyIds, updates } = req.body;
  
  if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
    throw new ValidationError('Company IDs array is required');
  }
  
  if (!updates || typeof updates !== 'object') {
    throw new ValidationError('Updates object is required');
  }
  
  // Validate company IDs
  for (const id of companyIds) {
    const validation = validateObjectId(id);
    if (!validation.isValid) {
      throw new ValidationError(`Invalid company ID: ${id}`);
    }
  }
  
  // Get the first company to check project permissions
  const firstCompany = await Company.findById(companyIds[0]);
  if (!firstCompany) {
    throw new NotFoundError('Company not found');
  }
  
  // Find project
  const project = await Project.findById(firstCompany.project);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to update companies in this project
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to update companies in this project');
  }
  
  // Validate that all companies belong to the same project
  const companies = await Company.find({ _id: { $in: companyIds } });
  if (companies.length !== companyIds.length) {
    throw new NotFoundError('Some companies not found');
  }
  
  const projectId = companies[0].project.toString();
  for (const company of companies) {
    if (company.project.toString() !== projectId) {
      throw new ValidationError('All companies must belong to the same project');
    }
  }
  
  // Sanitize updates
  const sanitizedUpdates = sanitizeCompanyData(updates);
  console.log(sanitizedUpdates);
  sanitizedUpdates.updatedBy = req.user._id;
  sanitizedUpdates.lastActivityDate = new Date();
  sanitizedUpdates.lastActivityType = 'bulk_updated';
  sanitizedUpdates.lastActivityBy = req.user._id;
  
  // Perform bulk update
  const result = await Company.updateMany(
    { _id: { $in: companyIds } },
    { $set: sanitizedUpdates }
  );
  
  // Create notifications for project members
  try {
    await notificationService.createProjectNotification(
      projectId,
      {
        type: 'company_bulk_updated',
        title: 'Companies Updated',
        message: `${result.modifiedCount} companies have been updated`,
        priority: 'medium',
        link: `/crm/${projectId}/companies`
      },
      [req.user._id] // exclude the updater from notification
    );
  } catch (error) {
    console.error('Failed to create bulk update notification:', error);
  }
  
  res.json({
    success: true,
    message: `${result.modifiedCount} companies updated successfully`,
    data: { modifiedCount: result.modifiedCount }
  });
});

// @desc    Bulk delete companies
// @route   DELETE /api/companies/bulk-delete
// @access  Private (project members with manager access)
export const bulkDeleteCompanies = asyncHandler(async (req, res) => {
  const { companyIds } = req.body;
  
  if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
    throw new ValidationError('Company IDs array is required');
  }
  
  // Validate company IDs
  for (const id of companyIds) {
    const validation = validateObjectId(id);
    if (!validation.isValid) {
      throw new ValidationError(`Invalid company ID: ${id}`);
    }
  }
  
  // Get the first company to check project permissions
  const firstCompany = await Company.findById(companyIds[0]);
  if (!firstCompany) {
    throw new NotFoundError('Company not found');
  }
  
  // Find project
  const project = await Project.findById(firstCompany.project);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to delete companies in this project
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to delete companies in this project');
  }
  
  // Validate that all companies belong to the same project
  const companies = await Company.find({ _id: { $in: companyIds } });
  if (companies.length !== companyIds.length) {
    throw new NotFoundError('Some companies not found');
  }
  
  const projectId = companies[0].project.toString();
  for (const company of companies) {
    if (company.project.toString() !== projectId) {
      throw new ValidationError('All companies must belong to the same project');
    }
  }
  
  // Perform bulk delete
  const result = await Company.deleteMany({ _id: { $in: companyIds } });
  
  // Create notifications for project members
  try {
    await notificationService.createProjectNotification(
      projectId,
      {
        type: 'company_bulk_deleted',
        title: 'Companies Deleted',
        message: `${result.deletedCount} companies have been deleted`,
        priority: 'high',
        link: `/crm/${projectId}/companies`
      },
      [req.user._id] // exclude the deleter from notification
    );
  } catch (error) {
    console.error('Failed to create bulk delete notification:', error);
  }
  
  res.json({
    success: true,
    message: `${result.deletedCount} companies deleted successfully`,
    data: { deletedCount: result.deletedCount }
  });
});

export default {
  createCompany,
  getProjectCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  addCompanyNote,
  getCompanyNotes,
  updateCompanyNote,
  deleteCompanyNote,
  addCompanyTag,
  removeCompanyTag,
  addCustomField,
  removeCustomField,
  getCompanyStats,
  getCompanyInsights,
  bulkUpdateCompanies,
  bulkDeleteCompanies
};