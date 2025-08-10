import Contact from '../models/Contact.model.js';
import Company from '../models/Company.model.js';
import Project from '../models/Project.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';
import { asyncHandler, ValidationError, NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';
import { validateContactData, sanitizeContactData, validateSocialLink, validateContactStage, validateLeadScore } from '../utils/contactValidation.js';
import { validateObjectId } from '../utils/validation.js';
import notificationService from '../utils/notificationService.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Create a new contact
// @route   POST /api/contacts
// @access  Private (project members)
export const createContact = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    projectId: req.body.project,
    companyId: req.body.company
  }
  
  const { companyId, projectId } = data;
  // Validate required fields
  if (!companyId || !projectId) {
    throw new ValidationError('Company ID and Project ID are required');
  }
  
  // Validate ObjectIds
  const companyValidation = validateObjectId(companyId);
  if (!companyValidation.isValid) {
    throw new ValidationError(companyValidation.message);
  }
  
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  // Find company and project
  const company = await Company.findById(companyId);
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to create contacts in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to create contacts in this project');
  }
  
  // Validate contact data
  const validation = validateContactData(req.body);
  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }
  
  // Sanitize contact data
  let sanitizedData = sanitizeContactData(req.body);
  sanitizedData = {
    ...sanitizedData,
    company: companyId,
    project: projectId,
    owner: req.user._id,
    assignedTo: req.body.assignedTo || req.user._id,
    createdBy: req.user._id,
    updatedBy: req.user._id
  };
  
  // Create contact
  const contact = await Contact.create(sanitizedData);
  
  // Populate contact with related data
  await contact.populate('company', 'name industry');
  await contact.populate('assignedTo', 'name email profileImage');
  await contact.populate('owner', 'name email profileImage');
  await contact.populate('createdBy', 'name email profileImage');
  await contact.populate('updatedBy', 'name email profileImage');
  
  // Update company's contacts array
  await Company.findByIdAndUpdate(companyId, {
    $push: { contacts: contact._id }
  });
  
  // Create notification for project members
  try {
    await notificationService.createContactNotification(
      'contact_created',
      contact,
      projectId,
      req.user._id,
      [req.user._id] // exclude the creator from notification
    );
  } catch (error) {
    console.error('Failed to create contact notification:', error);
    // Continue with contact creation even if notification fails
  }
  
  // Log activity
  try {
    await logActivity({
      projectId,
      companyId,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'created',
      actorId: req.user._id,
      title: `Contact created: ${contact.firstName} ${contact.lastName}`,
      description: `New contact created in project`,
      source: 'api',
      metadata: { contactId: contact._id }
    });
  } catch (_) {}
  
  res.status(201).json({
    success: true,
    message: 'Contact created successfully',
    data: { contact }
  });
});

// @desc    Get all contacts for a project
// @route   GET /api/contacts/project/:projectId
// @access  Private (project members)
export const getProjectContacts = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { 
    limit = 20, 
    skip = 0, 
    sort = 'firstName', 
    order = 'asc',
    stage,
    status,
    assignedTo,
    company,
    search,
    tags,
    source,
    leadScoreMin,
    leadScoreMax,
    lastActivityDays
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
  
  // Check if user has permission to view contacts in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view contacts in this project');
  }
  
  // Get contacts
  const contacts = await Contact.findByProject(projectId, {
    limit,
    skip,
    sort,
    order,
    stage,
    status,
    assignedTo,
    company,
    search,
    tags: tags ? tags.split(',') : undefined,
    source,
    leadScoreMin,
    leadScoreMax,
    lastActivityDays
  });
  
  // Get total count for pagination
  const totalCount = await Contact.countDocuments({ project: projectId });
  
  res.json({
    success: true,
    data: {
      contacts,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + contacts.length < totalCount
      }
    }
  });
});

// @desc    Get all contacts for a company
// @route   GET /api/contacts/company/:companyId
// @access  Private (project members)
export const getCompanyContacts = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { 
    limit = 20, 
    skip = 0, 
    sort = 'firstName', 
    order = 'asc',
    stage,
    status,
    assignedTo,
    search
  } = req.query;
  
  // Validate company ID
  const companyValidation = validateObjectId(companyId);
  if (!companyValidation.isValid) {
    throw new ValidationError(companyValidation.message);
  }
  
  // Find company
  const company = await Company.findById(companyId);
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  
  // Find project
  const project = await Project.findById(company.project);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to view contacts in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view contacts in this project');
  }
  
  // Get contacts
  const contacts = await Contact.findByCompany(companyId, {
    limit,
    skip,
    sort,
    order,
    stage,
    status,
    assignedTo,
    search
  });
  
  // Get total count for pagination
  const totalCount = await Contact.countDocuments({ company: companyId });
  
  res.json({
    success: true,
    data: {
      contacts,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + contacts.length < totalCount
      }
    }
  });
});

// @desc    Get contact by ID
// @route   GET /api/contacts/:id
// @access  Private (project members)
export const getContactById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find contact with populated fields
  const contact = await Contact.findById(id)
    .populate('company', 'name industry website')
    .populate('assignedTo', 'name email profileImage')
    .populate('owner', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('updatedBy', 'name email profileImage')
    .populate('lastActivityBy', 'name email profileImage')
    // .populate('deals.deal', 'name value stage')
    .populate('pipeline', 'name')
    // .populate('pipelineStage', 'name color')
    .populate('notes.createdBy', 'name email profileImage')
    // .populate('activities.performedBy', 'name email profileImage')
    .populate('project', 'name description');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Find project
  const project = await Project.findById(contact.project);
  
  // Check if user has permission to view this contact
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view this contact');
  }
  
  res.json({
    success: true,
    data: { contact }
  });
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private (project members with appropriate permissions)
export const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to update this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    contact.assignedTo?.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to update this contact');
  }
  
  // Prepare update data
  const updateData = {
    ...req.body,
    updatedBy: req.user._id
  };
  
  // Don't allow changing the project or company
  delete updateData.project;
  delete updateData.company;
  delete updateData.createdBy;
  delete updateData.createdAt;
  
  // Validate update data
  const updateValidation = validateContactData({
    ...updateData,
    project: contact.project._id // Add project ID for validation
  });
  
  if (!updateValidation.isValid) {
    throw new ValidationError('Validation failed', updateValidation.errors);
  }
  
  // Sanitize update data
  const sanitizedData = sanitizeContactData(updateData);
  
  // Update contact
  const updatedContact = await Contact.findByIdAndUpdate(
    id,
    { 
      ...sanitizedData,
      lastActivityDate: new Date(),
      lastActivityType: 'contact_updated',
      lastActivityBy: req.user._id
    },
    { new: true, runValidators: true }
  )
    .populate('company', 'name industry website')
    .populate('assignedTo', 'name email profileImage')
    .populate('owner', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('updatedBy', 'name email profileImage')
    .populate('lastActivityBy', 'name email profileImage')
    // .populate('deals.deal', 'name value stage')
    .populate('pipeline', 'name')
    // .populate('pipelineStage', 'name color');
  
  // Create notification for contact update
  try {
    await notificationService.createContactNotification(
      'contact_updated',
      updatedContact,
      contact.project._id,
      req.user._id,
      [req.user._id] // exclude the updater from notification
    );
  } catch (error) {
    console.error('Failed to create contact update notification:', error);
    // Continue even if notification fails
  }
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: updatedContact._id,
      entityType: 'contact',
      entityId: updatedContact._id,
      type: 'updated',
      actorId: req.user._id,
      title: `Contact updated: ${updatedContact.firstName} ${updatedContact.lastName}`,
      description: 'Contact fields updated',
      source: 'api',
      metadata: { contactId: updatedContact._id }
    });
  } catch (_) {}
  
  res.json({
    success: true,
    message: 'Contact updated successfully',
    data: { contact: updatedContact }
  });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private (project owner, admin, or contact owner)
export const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to delete this contact
  const project = contact.project;
  
  if (
    project.owner.toString() !== req.user._id.toString() && 
    !project.hasPermission(req.user._id, 'admin') && 
    contact.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to delete this contact');
  }
  
  // Store contact name and project ID for notification
  const contactName = `${contact.firstName} ${contact.lastName}`;
  const projectId = contact.project._id;
  const companyId = contact.company;
  
  // Delete contact
  await contact.deleteOne();
  
  // Remove contact from company's contacts array
  await Company.findByIdAndUpdate(companyId, {
    $pull: { contacts: id }
  });
  
  // Create notification for contact deletion
  try {
    await notificationService.createContactNotification(
      'contact_deleted',
      { _id: id, name: contactName },
      projectId,
      req.user._id
    );
  } catch (error) {
    console.error('Failed to create contact deletion notification:', error);
    // Continue even if notification fails
  }
  
  // Log activity
  try {
    await logActivity({
      projectId,
      companyId,
      contactId: id,
      entityType: 'contact',
      entityId: id,
      type: 'deleted',
      actorId: req.user._id,
      title: `Contact deleted: ${contactName}`,
      description: 'Contact removed from project',
      source: 'api',
      metadata: { contactId: id }
    });
  } catch (_) {}
  
  res.json({
    success: true,
    message: 'Contact deleted successfully'
  });
});

// @desc    Add note to contact
// @route   POST /api/contacts/:id/notes
// @access  Private (project members)
export const addContactNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, type = 'general'} = req.body;
  
  // Validate contact ID
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
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to add notes to this contact
  const project = await Project.findById(contact.project);
  
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to add notes to this contact');
  }
  
  // Add note
  await contact.addNote(content, req.user._id, type);
  
  // Populate the newly added note's createdBy field
  await contact.populate('notes.createdBy', 'name email profileImage');
  
  // Get the newly added note
  const newNote = contact.notes[contact.notes.length - 1];
  
  // Create notification for note addition
  try {
    await notificationService.createContactNotification(
      'contact_note_added',
      contact,
      contact.project._id,
      req.user._id,
      [req.user._id] // exclude the note creator from notification
    );
  } catch (error) {
    console.error('Failed to create note addition notification:', error);
    // Continue even if notification fails
  }
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'note_added',
      actorId: req.user._id,
      title: 'Note added to contact',
      description: newNote?.content?.slice(0, 140) || 'Note added',
      source: 'api',
      metadata: { noteId: newNote?._id }
    });
  } catch (_) {}
  
  res.status(201).json({
    success: true,
    message: 'Note added successfully',
    data: { note: newNote }
  });
});

// @desc    Get contact notes
// @route   GET /api/contacts/:id/notes
// @access  Private (project members)
export const getContactNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id)
    .populate('project')
    .populate('notes.createdBy', 'name email profileImage');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to view notes for this contact
  const project = await Project.findById(contact.project);
  
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view notes for this contact');
  }
  
  // Sort notes by creation date (newest first)
  const notes = contact.notes.sort((a, b) => b.createdAt - a.createdAt);
  
  res.json({
    success: true,
    data: { notes }
  });
});

// @desc    Add tag to contact
// @route   POST /api/contacts/:id/tags
// @access  Private (project members with appropriate permissions)
export const addContactTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;
  
  // Validate contact ID
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
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to add tags to this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to add tags to this contact');
  }
  
  // Check if tag already exists
  if (contact.tags.includes(tag.trim())) {
    return res.json({
      success: true,
      message: 'Tag already exists',
      data: { contact }
    });
  }
  
  // Add tag
  await contact.addTag(tag.trim(), req.user._id);
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'tag_added',
      actorId: req.user._id,
      title: 'Tag added',
      description: `Tag added: ${tag.trim()}`,
      source: 'api',
      metadata: { tag: tag.trim() }
    });
  } catch (_) {}
  
  res.json({
    success: true,
    message: 'Tag added successfully',
    data: { contact }
  });
});

// @desc    Remove tag from contact
// @route   DELETE /api/contacts/:id/tags/:tag
// @access  Private (project members with appropriate permissions)
export const removeContactTag = asyncHandler(async (req, res) => {
  const { id, tag } = req.params;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to remove tags from this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to remove tags from this contact');
  }
  
  // Remove tag
  await contact.removeTag(tag, req.user._id);
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'tag_removed',
      actorId: req.user._id,
      title: 'Tag removed',
      description: `Tag removed: ${tag}`,
      source: 'api',
      metadata: { tag }
    });
  } catch (_) {}
  
  res.json({
    success: true,
    message: 'Tag removed successfully',
    data: { contact }
  });
});

// @desc    Add custom field to contact
// @route   POST /api/contacts/:id/custom-fields
// @access  Private (project members with appropriate permissions)
export const addCustomField = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { key, value } = req.body;
  
  // Validate contact ID
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
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to add custom fields to this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to add custom fields to this contact');
  }
  
  // Add custom field
  await contact.addCustomField(key.trim(), value, req.user._id);
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'custom_field_added',
      actorId: req.user._id,
      title: 'Custom field added',
      description: `Key: ${key.trim()}`,
      source: 'api',
      metadata: { key: key.trim() }
    });
  } catch (_) {}
  
  res.json({
    success: true,
    message: 'Custom field added successfully',
    data: { contact }
  });
});

// @desc    Remove custom field from contact
// @route   DELETE /api/contacts/:id/custom-fields/:key
// @access  Private (project members with appropriate permissions)
export const removeCustomField = asyncHandler(async (req, res) => {
  const { id, key } = req.params;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to remove custom fields from this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to remove custom fields from this contact');
  }
  
  // Check if custom field exists
  if (!contact.customFields || !contact.customFields.has(key)) {
    throw new NotFoundError('Custom field not found');
  }
  
  // Remove custom field
  await contact.removeCustomField(key, req.user._id);
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'custom_field_removed',
      actorId: req.user._id,
      title: 'Custom field removed',
      description: `Key: ${key}`,
      source: 'api',
      metadata: { key }
    });
  } catch (_) {}
  
  res.json({
    success: true,
    message: 'Custom field removed successfully',
    data: { contact }
  });
});

// @desc    Add social link to contact
// @route   POST /api/contacts/:id/social-links
// @access  Private (project members with appropriate permissions)
export const addSocialLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { platform, url, handle, isPrimary = false } = req.body;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Validate social link data
  const socialLinkValidation = validateSocialLink({ platform, url, handle });
  if (!socialLinkValidation.isValid) {
    throw new ValidationError(socialLinkValidation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to add social links to this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to add social links to this contact');
  }
  
  // Add social link
  await contact.addSocialLink(platform, url, handle, isPrimary, req.user._id);
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'social_link_added',
      actorId: req.user._id,
      title: 'Social link added',
      description: `${platform}: ${url}`,
      source: 'api',
      metadata: { platform, url, handle, isPrimary }
    });
  } catch (_) {}
  
  res.json({
    success: true,
    message: 'Social link added successfully',
    data: { contact }
  });
});

// @desc    Remove social link from contact
// @route   DELETE /api/contacts/:id/social-links/:linkId
// @access  Private (project members with appropriate permissions)
export const removeSocialLink = asyncHandler(async (req, res) => {
  const { id, linkId } = req.params;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to remove social links from this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to remove social links from this contact');
  }
  
  // Remove social link
  await contact.removeSocialLink(linkId, req.user._id);
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'social_link_removed',
      actorId: req.user._id,
      title: 'Social link removed',
      description: `Link ID: ${linkId}`,
      source: 'api',
      metadata: { linkId }
    });
  } catch (_) {}
  
  res.json({
    success: true,
    message: 'Social link removed successfully',
    data: { contact }
  });
});

// @desc    Update contact stage
// @route   PUT /api/contacts/:id/stage
// @access  Private (project members with appropriate permissions)
export const updateContactStage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Validate stage
  const stageValidation = validateContactStage(stage);
  if (!stageValidation.isValid) {
    throw new ValidationError(stageValidation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to update this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    contact.assignedTo?.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to update this contact');
  }
  
  // Update stage
  await contact.updateStage(stage, req.user._id);
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'stage_changed',
      actorId: req.user._id,
      title: 'Stage updated',
      description: `New stage: ${stage}`,
      source: 'api',
      metadata: { stage }
    });
  } catch (_) {}
  
  // Populate contact for response
  await contact.populate('company', 'name industry');
  await contact.populate('assignedTo', 'name email profileImage');
  await contact.populate('owner', 'name email profileImage');
  
  res.json({
    success: true,
    message: 'Contact stage updated successfully',
    data: { contact }
  });
});

// @desc    Update contact lead score
// @route   PUT /api/contacts/:id/lead-score
// @access  Private (project members with appropriate permissions)
export const updateLeadScore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { leadScore } = req.body;
  
  // Validate contact ID
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Validate lead score
  const leadScoreValidation = validateLeadScore(leadScore);
  if (!leadScoreValidation.isValid) {
    throw new ValidationError(leadScoreValidation.message);
  }
  
  // Find contact
  const contact = await Contact.findById(id).populate('project');
  
  if (!contact) {
    throw new NotFoundError('Contact not found');
  }
  
  // Check if user has permission to update this contact
  const project = contact.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    contact.owner.toString() !== req.user._id.toString() &&
    contact.assignedTo?.toString() !== req.user._id.toString() &&
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to update this contact');
  }
  
  // Update lead score
  await contact.updateLeadScore(parseInt(leadScore), req.user._id);
  
  // Log activity
  try {
    await logActivity({
      projectId: contact.project._id,
      companyId: contact.company,
      contactId: contact._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'lead_score_updated',
      actorId: req.user._id,
      title: 'Lead score updated',
      description: `New lead score: ${leadScore}`,
      source: 'api',
      metadata: { leadScore: parseInt(leadScore) }
    });
  } catch (_) {}
  
  // Populate contact for response
  await contact.populate('company', 'name industry');
  await contact.populate('assignedTo', 'name email profileImage');
  await contact.populate('owner', 'name email profileImage');
  
  res.json({
    success: true,
    message: 'Lead score updated successfully',
    data: { contact }
  });
});

// @desc    Get contact statistics for a project
// @route   GET /api/contacts/project/:projectId/stats
// @access  Private (project members)
export const getContactStats = asyncHandler(async (req, res) => {
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
  
  // Check if user has permission to view contact stats in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view contact statistics in this project');
  }
  
  // Get contact statistics
  const stats = await Contact.getContactStats(projectId);
  
  // Get total count
  const totalCount = await Contact.countDocuments({ project: projectId });
  
  // Get counts by stage
  const stageCounts = await Contact.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$stage', count: { $sum: 1 } } }
  ]);
  
  // Get counts by status
  const statusCounts = await Contact.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Get counts by source
  const sourceCounts = await Contact.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$source', count: { $sum: 1 } } }
  ]);
  
  // Get counts by assigned user
  const assignedCounts = await Contact.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Get recent activity
  const recentActivity = await Contact.getRecentActivity(projectId, 10);
  
  // Format stage counts
  const formattedStageCounts = {};
  stageCounts.forEach(item => {
    formattedStageCounts[item._id || 'unknown'] = item.count;
  });
  
  // Format status counts
  const formattedStatusCounts = {};
  statusCounts.forEach(item => {
    formattedStatusCounts[item._id || 'unknown'] = item.count;
  });
  
  // Format source counts
  const formattedSourceCounts = {};
  sourceCounts.forEach(item => {
    formattedSourceCounts[item._id || 'unknown'] = item.count;
  });
  
  // Populate assigned user counts
  const populatedAssignedCounts = await Promise.all(
    assignedCounts.map(async (item) => {
      const user = await User.findById(item._id).select('name email profileImage');
      return {
        user,
        count: item.count
      };
    })
  );
  
  res.json({
    success: true,
    data: {
      total: totalCount,
      byStage: formattedStageCounts,
      byStatus: formattedStatusCounts,
      bySource: formattedSourceCounts,
      byAssignedUser: populatedAssignedCounts,
      recentActivity,
      leadScoreStats: stats[0] ? {
        average: Math.round(stats[0].avgLeadScore || 0),
        max: stats[0].maxLeadScore || 0,
        min: stats[0].minLeadScore || 0
      } : { average: 0, max: 0, min: 0 }
    }
  });
});

// @desc    Get detailed contact insights
// @route   GET /api/contacts/project/:projectId/insights
// @access  Private (project members)
export const getContactInsights = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { timeframe = '30' } = req.query; // days
  
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
  
  // Check if user has permission to view contact insights in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new AuthorizationError('You do not have permission to view contact insights in this project');
  }
  
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));
  
  // Get insights data
  const [
    totalContacts,
    newContacts,
    activeContacts,
    contactsByStage,
    contactsBySource,
    topCompanies,
    topJobTitles,
    leadScoreDistribution,
    activityTrends,
    conversionRates
  ] = await Promise.all([
    // Total contacts
    Contact.countDocuments({ project: projectId }),
    
    // New contacts in timeframe
    Contact.countDocuments({ 
      project: projectId, 
      createdAt: { $gte: daysAgo } 
    }),
    
    // Active contacts (with recent activity)
    Contact.countDocuments({ 
      project: projectId, 
      lastActivityDate: { $gte: daysAgo } 
    }),
    
    // Contacts by stage
    Contact.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Contacts by source
    Contact.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Top companies by contact count
    Contact.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      { $project: { company: 1, count: 1 } }
    ]),
    
    // Top job titles
    Contact.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$jobTitle', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    
    // Lead score distribution
    Contact.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      {
        $bucket: {
          groupBy: '$leadScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]),
    
    // Activity trends (last 7 days)
    Contact.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$lastActivityDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]),
    
    // Conversion rates (stage progression)
    Contact.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: '$stage',
          total: { $sum: 1 },
          converted: {
            $sum: {
              $cond: [
                { $in: ['$stage', ['customer', 'opportunity']] },
                1,
                0
              ]
            }
          }
        }
      }
    ])
  ]);
  
  // Calculate conversion rates
  const conversionRatesFormatted = conversionRates.map(item => ({
    stage: item._id,
    total: item.total,
    converted: item.converted,
    rate: item.total > 0 ? Math.round((item.converted / item.total) * 100) : 0
  }));
  
  res.json({
    success: true,
    data: {
      overview: {
        total: totalContacts,
        new: newContacts,
        active: activeContacts,
        growthRate: totalContacts > 0 ? Math.round((newContacts / totalContacts) * 100) : 0
      },
      byStage: contactsByStage,
      bySource: contactsBySource,
      topCompanies,
      topJobTitles,
      leadScoreDistribution,
      activityTrends,
      conversionRates: conversionRatesFormatted
    }
  });
});

export default {
  createContact,
  getProjectContacts,
  getCompanyContacts,
  getContactById,
  updateContact,
  deleteContact,
  addContactNote,
  getContactNotes,
  addContactTag,
  removeContactTag,
  addCustomField,
  removeCustomField,
  addSocialLink,
  removeSocialLink,
  updateContactStage,
  updateLeadScore,
  getContactStats,
  getContactInsights
};
