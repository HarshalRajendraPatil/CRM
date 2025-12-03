import Lead from '../models/Lead.model.js';
import Customer from '../models/Customer.model.js';
import Company from '../models/Company.model.js';
import Project from '../models/Project.model.js';
import mongoose from 'mongoose';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import { validateLeadData, sanitizeLeadData } from '../utils/leadValidation.js';
import { validateObjectId } from '../utils/validation.js';
import notificationService from '../utils/notificationService.js';
import ActivityService from '../utils/activityService.js';

// Create a new lead
export const createLead = asyncHandler(async (req, res) => {
  const { projectId, ...leadData } = req.body;
  
  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to create leads in this project');
  }

  // Validate lead data
  const validation = validateLeadData({ ...leadData, project: projectId });
  if (!validation.isValid) {
    throw new ValidationError('Invalid lead data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizeLeadData(leadData);

  // Create lead
  const lead = new Lead({
    ...sanitizedData,
    project: projectId,
    owner: req.user._id,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    assignedTo: sanitizedData.assignedTo || null,
    company: sanitizedData.company || null,
    score: parseInt(sanitizedData.score) || 0,
    customFields: sanitizedData.customFields || {},
    tags: sanitizedData.tags || []
  });

  await lead.save();
  
  // Log activity
  try {
    await ActivityService.logLeadCreated(lead, req.user);
  } catch (error) {
    console.error('Failed to log lead creation activity:', error);
  }
  
  await lead.populate([
    { path: 'owner', select: 'name email profileImage' },
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'updatedBy', select: 'name email profileImage' },
    { path: 'company', select: 'name industry address' }
  ]);

  // Create notification
  await notificationService.createProjectNotification(
    projectId,
    {
      sender: req.user._id,
      type: 'lead_created',
      title: `New Lead in ${project.name}`,
      message: `${req.user.name} created a new lead: ${lead.name}`,
      link: `/crm/${projectId}/leads/${lead._id}`,
      priority: 'medium',
      metadata: { leadId: lead._id, leadName: lead.name }
    },
    [req.user._id]
  );

  res.status(201).json({
    success: true,
    data: { lead }
  });
});

// Get leads for a project
export const getProjectLeads = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  if (!projectId || projectId === 'undefined') {
    throw new ValidationError('Project ID is required');
  }
  
  const { limit = 20, skip = 0, sort = 'createdAt', order = 'desc', status, stage, source, search, tags, owner, includeArchived = false } = req.query;

  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view leads in this project');
  }

  const leads = await Lead.findByProject(projectId, { limit, skip, sort, order, stage: stage || status, source, search, tags: tags ? tags.split(',') : undefined, owner, includeArchived });
  const total = await Lead.countDocuments({ project: projectId, isArchived: includeArchived === 'true' });

  res.json({ success: true, data: { leads, pagination: { total, limit: parseInt(limit), skip: parseInt(skip), hasMore: parseInt(skip) + leads.length < total } } });
});

// Get archived leads for a project
export const getArchivedLeads = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { limit = 20, skip = 0, sort = 'archivedAt', order = 'desc' } = req.query;

  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view archived leads in this project');
  }

  const leads = await Lead.findArchivedByProject(projectId, { limit, skip, sort, order });
  const total = await Lead.countDocuments({ project: projectId, isArchived: true });

  res.json({ success: true, data: { leads, pagination: { total, limit: parseInt(limit), skip: parseInt(skip), hasMore: parseInt(skip) + leads.length < total } } });
});

// Unarchive lead
export const unarchiveLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const lead = await Lead.findById(id).populate('project');
  if (!lead) throw new NotFoundError('Lead not found');

  const project = lead.project;
  if (!project.hasPermission(req.user._id, 'manager') && lead.owner.toString() !== req.user._id.toString() && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to unarchive this lead');
  }

  lead.isArchived = false;
  lead.archivedAt = null;
  lead.updatedBy = req.user._id;
  await lead.save();
  
  // Log activity
  try {
    await ActivityService.logLeadUnarchived(lead, req.user);
  } catch (error) {
    console.error('Failed to log lead unarchive activity:', error);
  }

  await lead.populate([
    { path: 'owner', select: 'name email profileImage' },
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'updatedBy', select: 'name email profileImage' },
    { path: 'company', select: 'name industry' },
    { path: 'notes.createdBy', select: 'name email' }
  ]);

  try {
    await notificationService.createProjectNotification(
      project._id,
      {
        sender: req.user._id,
        type: 'lead_unarchived',
        title: `Lead Unarchived in ${project.name}`,
        message: `${req.user.name} unarchived lead: ${lead.name}`,
        link: `/crm/${project._id}/leads/${lead._id}`,
        priority: 'medium',
        metadata: { leadId: lead._id, leadName: lead.name }
      },
      [req.user._id]
    );
  } catch (e) {
    console.error('Failed to create lead unarchive notification:', e);
  }

  res.json({ success: true, message: 'Lead unarchived successfully', data: { lead } });
});

// Cleanup old archived leads (delete after 7 days)
export const cleanupArchivedLeads = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const deletedCount = await Lead.deleteMany({
    isArchived: true,
    archivedAt: { $lt: sevenDaysAgo }
  });

  res.json({ 
    success: true, 
    message: `Cleaned up ${deletedCount.deletedCount} archived leads older than 7 days`,
    data: { deletedCount: deletedCount.deletedCount }
  });
});

// Get lead by ID
export const getLeadById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  const lead = await Lead.findById(id)
    .populate('owner', 'name email profileImage')
    .populate('createdBy', 'name email profileImage')
    .populate('updatedBy', 'name email profileImage')
    .populate('company', 'name industry address')
    .populate('assignedTo', 'name email profileImage')
    .populate('convertedBy', 'name email profileImage')
    .populate('convertedCustomerId', 'name email')
    .populate('notes.createdBy', 'name email');
  if (!lead) throw new NotFoundError('Lead not found');

  const project = await Project.findById(lead.project);
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view this lead');
  }

  res.json({ success: true, data: { lead } });
});

// Update lead
export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Find lead and check permissions
  const lead = await Lead.findById(id);
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  // Check if lead is converted - prevent editing
  if (lead.convertedAt) {
    throw new ValidationError('Cannot edit a lead that has been converted to customer');
  }

  const project = await Project.findById(lead.project);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update this lead');
  }

  // Validate update data
  const validation = validateLeadData(updateData);
  if (!validation.isValid) {
    throw new ValidationError('Invalid lead data', validation.errors);
  }

  // Sanitize data
  const sanitizedData = sanitizeLeadData(updateData);

  // Track changes for activity logging
  const changes = {};
  Object.keys(sanitizedData).forEach(key => {
    if (lead[key] !== sanitizedData[key] && key !== 'updatedAt' && key !== 'updatedBy') {
      changes[key] = {
        oldValue: lead[key],
        newValue: sanitizedData[key]
      };
    }
  });

  // Update lead
  Object.assign(lead, {
    ...sanitizedData,
    updatedBy: req.user._id,
    assignedTo: sanitizedData.assignedTo || null,
    company: sanitizedData.company || null,
    score: parseInt(sanitizedData.score) || 0,
    customFields: sanitizedData.customFields || lead.customFields,
    tags: sanitizedData.tags || lead.tags
  });

  await lead.save();
  
  // Log activity if there were changes
  if (Object.keys(changes).length > 0) {
    try {
      await ActivityService.logLeadUpdated(lead, changes, req.user);
    } catch (error) {
      console.error('Failed to log lead update activity:', error);
    }
  }
  await lead.populate([
    { path: 'owner', select: 'name email profileImage' },
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'updatedBy', select: 'name email profileImage' },
    { path: 'company', select: 'name industry address' },
    { path: 'convertedBy', select: 'name email profileImage' },
    { path: 'notes.createdBy', select: 'name email' }
  ]);

  // Create notification
  await notificationService.createProjectNotification(
    project._id,
    {
      sender: req.user._id,
      type: 'lead_updated',
      title: `Lead Updated in ${project.name}`,
      message: `${req.user.name} updated lead: ${lead.name}`,
      link: `/crm/${project._id}/leads/${lead._id}`,
      priority: 'low',
      metadata: { leadId: lead._id, leadName: lead.name }
    },
    [req.user._id]
  );

  res.json({
    success: true,
    data: { lead }
  });
});

// Archive/Delete lead (soft-delete)
export const archiveLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const lead = await Lead.findById(id).populate('project');
  if (!lead) throw new NotFoundError('Lead not found');

  const project = lead.project;
  if (!project.hasPermission(req.user._id, 'manager') && lead.owner.toString() !== req.user._id.toString() && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to archive this lead');
  }

  lead.isArchived = true;
  lead.archivedAt = new Date();
  lead.status = 'disqualified';
  lead.updatedBy = req.user._id;
  await lead.save();
  
  // Log activity
  try {
    await ActivityService.logLeadArchived(lead, req.user);
  } catch (error) {
    console.error('Failed to log lead archive activity:', error);
  }

  try {
    await notificationService.createProjectNotification(
      project._id,
      {
        sender: req.user._id,
        type: 'lead_archived',
        title: `Lead Archived in ${project.name}`,
        message: `${req.user.name} archived lead: ${lead.name}`,
        link: `/crm/${project._id}/leads`,
        priority: 'low',
        metadata: { leadId: lead._id, leadName: lead.name }
      },
      [req.user._id]
    );
  } catch (e) {
    console.error('Failed to create lead archive notification:', e);
  }

  res.json({ success: true, message: 'Lead archived successfully' });
});

// Permanently delete lead (hard-delete)
export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }

  // Find lead and populate necessary fields
  const lead = await Lead.findById(id).populate('project');
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  const project = lead.project;
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions: Only manager, owner, or system-admin can delete
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    lead.owner.toString() !== req.user._id.toString() && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to delete this lead');
  }

  // Prevent deletion if lead is converted (optional - you may want to allow this)
  if (lead.convertedAt) {
    throw new ValidationError('Cannot delete a lead that has been converted to customer. Please archive it instead.');
  }

  // Store lead information for logging and notifications before deletion
  const leadName = lead.name;
  const leadEmail = lead.email;
  const projectId = lead.project._id || lead.project;
  const leadId = lead._id;

  // Log activity BEFORE deletion (so we have the lead data)
  try {
    await ActivityService.logLeadDeleted(lead, req.user);
  } catch (error) {
    console.error('Failed to log lead deletion activity:', error);
  }

  // Delete associated tasks (remove lead reference from tasks)
  try {
    const Task = mongoose.model('Task');
    await Task.updateMany(
      { 
        'relatedEntity.type': 'lead',
        'relatedEntity.entityId': leadId
      },
      { 
        $unset: { 
          relatedEntity: ''
        }
      }
    );
  } catch (error) {
    console.error('Failed to remove lead reference from tasks:', error);
  }

  // Delete activity logs related to this lead
  try {
    const Activity = mongoose.model('Activity');
    await Activity.deleteMany({
      entityType: 'Lead',
      entityId: leadId
    });
  } catch (error) {
    console.error('Failed to delete lead activity logs:', error);
  }

  // Delete notifications related to this lead
  try {
    const Notification = mongoose.model('Notification');
    await Notification.deleteMany({
      $or: [
        { type: 'lead_created', 'metadata.leadId': leadId },
        { type: 'lead_updated', 'metadata.leadId': leadId },
        { type: 'lead_archived', 'metadata.leadId': leadId },
        { type: 'lead_unarchived', 'metadata.leadId': leadId },
        { type: 'lead_deleted', 'metadata.leadId': leadId },
        { type: 'lead_note_added', 'metadata.leadId': leadId },
        { type: 'lead_status_updated', 'metadata.leadId': leadId },
        { type: 'lead_assigned', 'metadata.leadId': leadId },
        { type: 'lead_unassigned', 'metadata.leadId': leadId },
        { type: 'lead_converted', 'metadata.leadId': leadId }
      ]
    });
  } catch (error) {
    console.error('Failed to delete lead notifications:', error);
  }

  // Remove lead reference from company if it exists (optional - you may want to keep this)
  // Companies don't typically have a direct leads array, but if they do, handle it here

  // Actually delete the lead from database
  await lead.deleteOne();

  // Create notification for lead deletion
  try {
    await notificationService.createProjectNotification(
      projectId,
      {
        sender: req.user._id,
        type: 'lead_deleted',
        title: `Lead Deleted in ${project.name}`,
        message: `${req.user.name} permanently deleted lead: ${leadName}`,
        link: `/crm/${projectId}/leads`,
        priority: 'high',
        metadata: { leadId: leadId.toString(), leadName, leadEmail }
      },
      [req.user._id]
    );
  } catch (error) {
    console.error('Failed to create lead deletion notification:', error);
  }

  res.json({ 
    success: true, 
    message: 'Lead deleted permanently and all associated resources have been cleaned up'
  });
});

// Add note to lead
export const addLeadNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError('Note content is required');
  }

  const lead = await Lead.findById(id).populate('project');
  if (!lead) throw new NotFoundError('Lead not found');
  const project = lead.project;
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to add notes to this lead');
  }

  const newNote = { content: content.trim(), createdBy: req.user._id, createdAt: new Date(), updatedAt: new Date() };
  lead.notes.push(newNote);
  lead.updatedBy = req.user._id;
  await lead.save();
  
  // Log activity
  try {
    await ActivityService.logLeadNoteAdded(lead, newNote, req.user);
  } catch (error) {
    console.error('Failed to log lead note addition activity:', error);
  }

  await lead.populate('notes.createdBy', 'name email profileImage');
  const latestNote = lead.notes[lead.notes.length - 1];

  try {
    await notificationService.createProjectNotification(
      project._id,
      {
        sender: req.user._id,
        type: 'lead_note_added',
        title: `Note added on Lead in ${project.name}`,
        message: `${req.user.name} added a note on lead: ${lead.name}`,
        link: `/crm/${project._id}/leads/${lead._id}`,
        priority: 'low',
        metadata: { leadId: lead._id, leadName: lead.name }
      },
      [req.user._id]
    );
  } catch (e) {
    console.error('Failed to create lead note notification:', e);
  }

  res.status(201).json({ success: true, message: 'Note added successfully', data: { note: latestNote } });
});

// Update lead note
export const updateLeadNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  const { content } = req.body;
  
  const leadValidation = validateObjectId(id);
  const noteValidation = validateObjectId(noteId);
  if (!leadValidation.isValid) throw new ValidationError(leadValidation.message);
  if (!noteValidation.isValid) throw new ValidationError(noteValidation.message);
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError('Note content is required');
  }

  const lead = await Lead.findById(id).populate('project');
  if (!lead) throw new NotFoundError('Lead not found');
  
  const project = lead.project;
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update notes on this lead');
  }

  const note = lead.notes.id(noteId);
  if (!note) throw new NotFoundError('Note not found');
  
  // Check if user can edit this note (only the creator can edit)
  if (note.createdBy.toString() !== req.user._id.toString() && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You can only edit your own notes');
  }

  note.content = content.trim();
  note.updatedAt = new Date();
  lead.updatedBy = req.user._id;
  await lead.save();
  
  // Log activity
  try {
    await ActivityService.logLeadNoteUpdated(lead, note, req.user);
  } catch (error) {
    console.error('Failed to log lead note update activity:', error);
  }

  await lead.populate('notes.createdBy', 'name email profileImage');

  res.json({ success: true, message: 'Note updated successfully', data: { content: note.content } });
});

// Delete lead note
export const deleteLeadNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  
  const leadValidation = validateObjectId(id);
  const noteValidation = validateObjectId(noteId);
  if (!leadValidation.isValid) throw new ValidationError(leadValidation.message);
  if (!noteValidation.isValid) throw new ValidationError(noteValidation.message);

  const lead = await Lead.findById(id).populate('project');
  if (!lead) throw new NotFoundError('Lead not found');
  
  const project = lead.project;
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to delete notes on this lead');
  }

  const note = lead.notes.id(noteId);
  if (!note) throw new NotFoundError('Note not found');
  
  // Check if user can delete this note (only the creator can delete)
  if (note.createdBy.toString() !== req.user._id.toString() && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You can only delete your own notes');
  }

  // Log activity before removing note
  try {
    await ActivityService.logLeadNoteDeleted(lead, noteId, req.user);
  } catch (error) {
    console.error('Failed to log lead note deletion activity:', error);
  }
  
  // Remove the note from the array
  lead.notes.pull(noteId);
  lead.updatedBy = req.user._id;
  await lead.save();

  res.json({ success: true, message: 'Note deleted successfully' });
});

// Convert lead -> Customer (and optionally Company if not exists)
export const convertLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // const { createCompanyIfMissing = true } = req.body;
  const createCompanyIfMissing = true;
  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const lead = await Lead.findById(id);
  if (!lead) throw new NotFoundError('Lead not found');

  const project = await Project.findById(lead.project);
  if (!project) throw new NotFoundError('Project not found');

  // Permissions: manager or lead owner or system-admin
  if (!project.hasPermission(req.user._id, 'manager') && lead.owner.toString() !== req.user._id.toString() && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to convert this lead');
  }

  if ((lead.stage || lead.status) !== 'qualified') {
    throw new ValidationError('Only qualified leads can be converted');
  }

  let companyDoc = null;
  if (lead.company) {
    companyDoc = await Company.findById(lead.company);
  } else if (createCompanyIfMissing && lead.companyName) {
    // Try to find existing company in project by name
    companyDoc = await Company.findOne({ project: lead.project, name: lead.companyName.trim() });
    if (!companyDoc) {
      companyDoc = await Company.create({
        name: lead.companyName.trim(),
        project: lead.project,
        owner: req.user._id,
        createdBy: req.user._id,
        updatedBy: req.user._id,
      });
      try {
        await notificationService.createCompanyNotification('company_created', companyDoc, lead.project, req.user._id, [req.user._id]);
      } catch (e) {
        console.error('Failed to notify company creation during lead conversion:', e);
      }
    }
  }

  // Create Customer
  const customer = await Customer.create({
    project: lead.project,
    owner: req.user._id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: companyDoc ? companyDoc._id : null,
    tags: lead.tags,
    customFields: lead.customFields,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  // Mark lead as converted and archive
  lead.convertedAt = new Date();
  lead.convertedBy = req.user._id;
  lead.isArchived = true;
  lead.archivedAt = new Date();
  lead.convertedCustomerId = customer._id;
  await lead.save();
  
  // Log activity
  try {
    await ActivityService.logLeadConverted(lead, customer, req.user);
  } catch (error) {
    console.error('Failed to log lead conversion activity:', error);
  }

  // Notify project
  try {
    await notificationService.createProjectNotification(
      project._id,
      {
        sender: req.user._id,
        type: 'lead_converted',
        title: `Lead Converted in ${project.name}`,
        message: `${req.user.name} converted lead ${lead.name} to customer`,
        link: `/crm/${project._id}/customers/${customer._id}`,
        priority: 'high',
        metadata: { leadId: lead._id, customerId: customer._id, companyId: companyDoc?._id }
      },
      [req.user._id]
    );
  } catch (e) {
    console.error('Failed to create lead conversion notification:', e);
  }

  res.json({ success: true, message: 'Lead converted successfully', data: { customer, company: companyDoc } });
});

// Update lead status (enforce workflow transitions)
export const updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);
  const statusVal = ['new', 'contacted', 'qualified', 'disqualified'];
  if (!status || !statusVal.includes(status)) {
    throw new ValidationError('Invalid status');
  }
  const lead = await Lead.findById(id).populate('project');
  if (!lead) throw new NotFoundError('Lead not found');
  
  // Check if lead is converted - prevent status updates
  if (lead.convertedAt) {
    throw new ValidationError('Cannot update status of a lead that has been converted to customer');
  }

  const project = lead.project;
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to update this lead');
  }

  // Allowed transitions based on provided workflow
  // new -> contacted | qualified | disqualified
  // contacted -> qualified | disqualified | contacted
  // qualified -> convert (handled separately) | disqualified
  // disqualified -> archived (already terminal)

  const oldStatus = lead.status;
  lead.status = status;
  lead.updatedBy = req.user._id;
  await lead.save();
  
  // Log activity
  try {
    await ActivityService.logLeadStatusChanged(lead, oldStatus, status, req.user);
  } catch (error) {
    console.error('Failed to log lead status change activity:', error);
  }
  await lead.populate([
    { path: 'owner', select: 'name email profileImage' },
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'updatedBy', select: 'name email profileImage' },
    { path: 'company', select: 'name industry' },
    { path: 'convertedBy', select: 'name email profileImage' },
    { path: 'notes.createdBy', select: 'name email' }
  ]);

  try {
    await notificationService.createProjectNotification(
      project._id,
      {
        sender: req.user._id,
        type: 'lead_status_updated',
        title: `Lead Status Updated in ${project.name}`,
        message: `${req.user.name} set lead ${lead.name} status to ${status}`,
        link: `/crm/${project._id}/leads/${lead._id}`,
        priority: 'low',
        metadata: { leadId: lead._id, status }
      },
      [req.user._id]
    );
  } catch (e) {
    console.error('Failed to create lead status update notification:', e);
  }

  res.json({ success: true, message: 'Lead status updated', data: { lead } });
});

// Assign lead to user
export const assignLeadToUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;
  const validation = validateObjectId(id);
  if (!validation.isValid) throw new ValidationError(validation.message);

  const lead = await Lead.findById(id).populate('project');
  if (!lead) throw new NotFoundError('Lead not found');

  const project = lead.project;
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to assign this lead');
  }

  // If assignedTo is provided, validate that the user exists and is a project member
  if (assignedTo) {
    const assignedToValidation = validateObjectId(assignedTo);
    if (!assignedToValidation.isValid) {
      throw new ValidationError('Invalid user ID');
    }
    
    // Check if the user is a member of the project
    const isProjectMember = project.members.some(member => 
      member.user.toString() === assignedTo
    );
    
    if (!isProjectMember) {
      throw new ValidationError('User is not a member of this project');
    }
  }

  const oldAssignedTo = lead.assignedTo;
  lead.assignedTo = assignedTo || null;
  lead.updatedBy = req.user._id;
  await lead.save();
  
  // Log activity
  try {
    if (assignedTo && !oldAssignedTo) {
      await ActivityService.logLeadAssigned(lead, assignedTo, req.user);
    } else if (!assignedTo && oldAssignedTo) {
      await ActivityService.logLeadUnassigned(lead, req.user);
    }
  } catch (error) {
    console.error('Failed to log lead assignment activity:', error);
  }

  await lead.populate([
    { path: 'owner', select: 'name email profileImage' },
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'createdBy', select: 'name email profileImage' },
    { path: 'updatedBy', select: 'name email profileImage' },
    { path: 'company', select: 'name industry' },
    { path: 'notes.createdBy', select: 'name email' }
  ]);

  try {
    await notificationService.createProjectNotification(
      project._id,
      {
        sender: req.user._id,
        type: assignedTo ? 'lead_assigned' : 'lead_unassigned',
        title: assignedTo ? `Lead Assigned in ${project.name}` : `Lead Unassigned in ${project.name}`,
        message: assignedTo 
          ? `${req.user.name} assigned lead ${lead.name} to a team member`
          : `${req.user.name} unassigned lead ${lead.name}`,
        link: `/crm/${project._id}/leads/${lead._id}`,
        priority: 'medium',
        metadata: { leadId: lead._id, assignedTo }
      },
      [req.user._id]
    );
  } catch (e) {
    console.error('Failed to create lead assignment notification:', e);
  }

  res.json({ success: true, message: assignedTo ? 'Lead assigned successfully' : 'Lead unassigned successfully', data: { lead } });
});

// Stats for leads in a project
export const getLeadStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) throw new ValidationError(projectValidation.message);

  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError('Project not found');
  if (!project.hasPermission(req.user._id, 'viewer') && req.user.roleGlobal !== 'system-admin') {
    throw new ForbiddenError('You do not have permission to view lead stats');
  }

  const total = await Lead.countDocuments({ project: projectId, isArchived: false });
  const byStatusAgg = await Lead.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const bySourceAgg = await Lead.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false } },
    { $group: { _id: '$source', count: { $sum: 1 } } }
  ]);
  const growthAgg = await Lead.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const byStatus = {};
  byStatusAgg.forEach(i => { byStatus[i._id || 'unknown'] = i.count; });
  const bySource = {};
  bySourceAgg.forEach(i => { bySource[i._id || 'unknown'] = i.count; });
  const growthTrend = growthAgg.map(i => ({ month: `${i._id.year}-${String(i._id.month).padStart(2, '0')}`, count: i.count }));

  res.json({ success: true, data: { total, byStatus, bySource, growthTrend } });
});



// Advanced insights for leads in a project
export const getLeadInsights = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  // Verify project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Get all leads for the project
  const leads = await Lead.find({ project: projectId, isArchived: false })
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email')
    .populate('company', 'name')
    .lean();

  // Calculate totals
  const totalLeads = leads.length;
  const totalQualified = leads.filter(lead => (lead.stage || lead.status) === 'qualified').length;
  const totalContacted = leads.filter(lead => (lead.stage || lead.status) === 'contacted').length;
  const totalNew = leads.filter(lead => (lead.stage || lead.status) === 'new').length;
  const totalDisqualified = leads.filter(lead => (lead.stage || lead.status) === 'disqualified').length;
  
  // Conversion rate
  const conversionRate = totalLeads > 0 ? Math.round((totalQualified / totalLeads) * 100) : 0;
  
  // This month's leads
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const leadsThisMonth = leads.filter(lead => new Date(lead.createdAt) >= startOfMonth).length;

  // Funnel analysis
  const funnel = [
    { stage: 'new', count: totalNew, conversionFromPrev: 100 },
    { stage: 'contacted', count: totalContacted, conversionFromPrev: totalNew > 0 ? Math.round((totalContacted / totalNew) * 100) : 0 },
    { stage: 'qualified', count: totalQualified, conversionFromPrev: totalContacted > 0 ? Math.round((totalQualified / totalContacted) * 100) : 0 },
    { stage: 'disqualified', count: totalDisqualified, conversionFromPrev: totalLeads > 0 ? Math.round((totalDisqualified / totalLeads) * 100) : 0 }
  ];

  // Source distribution
  const sourceCounts = {};
  leads.forEach(lead => {
    sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
  });
  
  const sourceDistribution = Object.entries(sourceCounts).map(([source, count]) => ({
    source,
    count,
    percentage: Math.round((count / totalLeads) * 100)
  })).sort((a, b) => b.count - a.count);
  
  // Owner performance
  const ownerStats = {};
  leads.forEach(lead => {
    const ownerId = lead.assignedTo?._id?.toString();
    if (ownerId) {
      if (!ownerStats[ownerId]) {
        ownerStats[ownerId] = {
          owner: lead.assignedTo,
          total: 0,
          qualified: 0,
          contacted: 0,
          new: 0,
          disqualified: 0
        };
      }
      ownerStats[ownerId].total++;
      const status = lead.stage || lead.status;
      ownerStats[ownerId][status]++;
    }
  });

  const ownerPerformance = Object.values(ownerStats).map(stats => ({
    ...stats,
    conversionRate: stats.total > 0 ? Math.round((stats.qualified / stats.total) * 100) : 0
  })).sort((a, b) => b.conversionRate - a.conversionRate);

  // Aging analysis
  const now = new Date();
  const agingBuckets = {
    '0-7 days': 0,
    '8-30 days': 0,
    '31-60 days': 0,
    '61-90 days': 0,
    '90+ days': 0
  };

  leads.forEach(lead => {
    const daysSinceCreation = Math.floor((now - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation <= 7) agingBuckets['0-7 days']++;
    else if (daysSinceCreation <= 30) agingBuckets['8-30 days']++;
    else if (daysSinceCreation <= 60) agingBuckets['31-60 days']++;
    else if (daysSinceCreation <= 90) agingBuckets['61-90 days']++;
    else agingBuckets['90+ days']++;
  });

  // Top tags
  const tagCounts = {};
  leads.forEach(lead => {
    if (lead.tags && Array.isArray(lead.tags)) {
      lead.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Daily creation trend (last 30 days)
  const dailyTrend = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const count = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= date && leadDate < nextDate;
    }).length;
    
    dailyTrend.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }

  // Recent leads (last 10 leads)
  const recentActivity = leads
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10)
    .map(lead => ({
      _id: lead._id,
      name: lead.name,
      status: lead.stage || lead.status,
      owner: lead.owner,
      updatedAt: lead.updatedAt
    }));

  // Company analysis
  const companyStats = {};
  leads.forEach(lead => {
    const companyName = lead.companyName || lead.company?.name || 'Unknown';
    if (!companyStats[companyName]) {
      companyStats[companyName] = {
        name: companyName,
        total: 0,
        qualified: 0,
        contacted: 0
      };
    }
    companyStats[companyName].total++;
    const status = lead.stage || lead.status;
    if (status === 'qualified') companyStats[companyName].qualified++;
    if (status === 'contacted') companyStats[companyName].contacted++;
  });

  const topCompanies = Object.values(companyStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Score distribution
  const scoreRanges = {
    '0-25': 0,
    '26-50': 0,
    '51-75': 0,
    '76-100': 0
  };

  leads.forEach(lead => {
    const score = lead.score || 0;
    if (score <= 25) scoreRanges['0-25']++;
    else if (score <= 50) scoreRanges['26-50']++;
    else if (score <= 75) scoreRanges['51-75']++;
    else scoreRanges['76-100']++;
  });

  // Monthly trends (last 12 months)
  const monthlyTrends = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const monthLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= date && leadDate < nextMonth;
    });
    
    const qualified = monthLeads.filter(lead => (lead.stage || lead.status) === 'qualified').length;
    
    monthlyTrends.push({
      month: date.toISOString().slice(0, 7),
      total: monthLeads.length,
      qualified,
      conversionRate: monthLeads.length > 0 ? Math.round((qualified / monthLeads.length) * 100) : 0
    });
  }

  res.json({
    totals: {
      totalLeads,
      totalQualified,
      totalContacted,
      totalNew,
      totalDisqualified,
      conversionRate,
      leadsThisMonth
    },
    funnel,
    sourceDistribution,
    ownerPerformance,
    agingBuckets,
    topTags,
    dailyCreationTrend: dailyTrend,
    recentActivity,
    topCompanies,
    scoreRanges,
    monthlyTrends
  });
});

// @desc    Get lead forecasting data
// @route   GET /api/leads/project/:projectId/forecast
// @access  Private (project members)
export const getLeadForecast = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { period = '12', type = 'conversion' } = req.query;
  
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
  
  // Check if user has permission to view lead forecast in this project
  if (
    !project.hasPermission(req.user._id, 'viewer') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to view lead forecast in this project');
  }
  
  const months = parseInt(period);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  // Get historical lead data
  const leads = await Lead.find({
    project: projectId,
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: 1 });
  
  // Calculate monthly trends
  const monthlyData = [];
  for (let i = 0; i < months; i++) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - (months - i - 1));
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const monthLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= monthStart && leadDate < monthEnd;
    });
    
    const convertedLeads = monthLeads.filter(lead => lead.convertedAt);
    const qualifiedLeads = monthLeads.filter(lead => (lead.stage || lead.status) === 'qualified');
    const contactedLeads = monthLeads.filter(lead => (lead.stage || lead.status) === 'contacted');
    const newLeads = monthLeads.filter(lead => (lead.stage || lead.status) === 'new');
    
    monthlyData.push({
      month: monthStart.toISOString().slice(0, 7),
      total: monthLeads.length,
      new: newLeads.length,
      contacted: contactedLeads.length,
      qualified: qualifiedLeads.length,
      converted: convertedLeads.length,
      conversionRate: monthLeads.length > 0 ? (convertedLeads.length / monthLeads.length) * 100 : 0,
      qualificationRate: monthLeads.length > 0 ? (qualifiedLeads.length / monthLeads.length) * 100 : 0
    });
  }
  
  // Calculate conversion funnel trends
  const funnelTrends = {
    newToContacted: monthlyData.reduce((sum, month) => sum + (month.contacted / Math.max(month.new, 1)), 0) / months,
    contactedToQualified: monthlyData.reduce((sum, month) => sum + (month.qualified / Math.max(month.contacted, 1)), 0) / months,
    qualifiedToConverted: monthlyData.reduce((sum, month) => sum + (month.converted / Math.max(month.qualified, 1)), 0) / months
  };
  
  // Forecast next 6 months
  const forecast = [];
  const lastMonthData = monthlyData[monthlyData.length - 1];
  const avgGrowth = monthlyData.length > 1 
    ? monthlyData.slice(-3).reduce((sum, month, index, arr) => {
        if (index === 0) return 0;
        return sum + ((month.total - arr[index - 1].total) / Math.max(arr[index - 1].total, 1));
      }, 0) / Math.max(monthlyData.length - 1, 1)
    : 0;
  
  const avgConversionRate = monthlyData.reduce((sum, month) => sum + month.conversionRate, 0) / months;
  const avgQualificationRate = monthlyData.reduce((sum, month) => sum + month.qualificationRate, 0) / months;
  
  for (let i = 1; i <= 6; i++) {
    const forecastDate = new Date();
    forecastDate.setMonth(forecastDate.getMonth() + i);
    
    const projectedTotal = Math.max(0, Math.round(
      lastMonthData.total * Math.pow(1 + (avgGrowth / 100), i)
    ));
    
    const projectedConverted = Math.round(projectedTotal * (avgConversionRate / 100));
    const projectedQualified = Math.round(projectedTotal * (avgQualificationRate / 100));
    
    forecast.push({
      month: forecastDate.toISOString().slice(0, 7),
      projectedTotal,
      projectedConverted,
      projectedQualified,
      projectedConversionRate: avgConversionRate,
      confidence: Math.max(0.3, 1 - (i * 0.1)),
      factors: {
        historicalGrowth: avgGrowth,
        conversionTrend: avgConversionRate,
        qualificationTrend: avgQualificationRate,
        seasonality: 0
      }
    });
  }
  
  // Source performance analysis
  const sourcePerformance = await Lead.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $group: {
      _id: '$source',
      total: { $sum: 1 },
      converted: { $sum: { $cond: [{ $ne: ['$convertedAt', null] }, 1, 0] } },
      qualified: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
      avgScore: { $avg: '$score' }
    }},
    { $addFields: {
      conversionRate: { $multiply: [{ $divide: ['$converted', '$total'] }, 100] },
      qualificationRate: { $multiply: [{ $divide: ['$qualified', '$total'] }, 100] }
    }},
    { $sort: { conversionRate: -1 } }
  ]);
  
  // Lead scoring trends
  const scoreDistribution = await Lead.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    { $bucket: {
      groupBy: '$score',
      boundaries: [0, 25, 50, 75, 100],
      default: '100+',
      output: {
        count: { $sum: 1 },
        converted: { $sum: { $cond: [{ $ne: ['$convertedAt', null] }, 1, 0] } }
      }
    }}
  ]);
  
  // Time-to-conversion analysis
  const conversionTimes = leads
    .filter(lead => lead.convertedAt)
    .map(lead => {
      const created = new Date(lead.createdAt);
      const converted = new Date(lead.convertedAt);
      return Math.floor((converted - created) / (1000 * 60 * 60 * 24)); // days
    });
  
  const avgConversionTime = conversionTimes.length > 0 
    ? conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length 
    : 0;
  
  // Lead velocity forecasting
  const velocityForecast = [];
  const currentVelocity = leads.filter(lead => {
    const daysSinceCreation = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 30;
  }).length;
  
  for (let i = 1; i <= 6; i++) {
    const projectedVelocity = Math.round(currentVelocity * Math.pow(1 + (avgGrowth / 100), i));
    velocityForecast.push({
      month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
      projectedVelocity,
      expectedConversions: Math.round(projectedVelocity * (avgConversionRate / 100))
    });
  }
  
  // Risk assessment for lead quality
  const riskFactors = {
    lowScoreLeads: await Lead.countDocuments({
      project: projectId,
      score: { $lt: 25 }
    }),
    staleLeads: await Lead.countDocuments({
      project: projectId,
      createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status: { $in: ['new', 'contacted'] }
    }),
    unassignedLeads: await Lead.countDocuments({
      project: projectId,
      assignedTo: null
    }),
    inactiveLeads: await Lead.countDocuments({
      project: projectId,
      updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
  };
  
  const riskScore = Math.min(100, 
    (riskFactors.lowScoreLeads * 0.2) + 
    (riskFactors.staleLeads * 0.3) + 
    (riskFactors.unassignedLeads * 0.2) + 
    (riskFactors?.inactiveLeads * 0.3)
  );
  
  res.json({
    success: true,
    data: {
      historical: monthlyData,
      forecast,
      funnelTrends,
      sourcePerformance,
      scoreDistribution,
      conversionMetrics: {
        avgConversionTime,
        avgConversionRate,
        avgQualificationRate,
        totalLeads: leads.length,
        totalConverted: leads.filter(lead => lead.convertedAt).length
      },
      velocityForecast,
      riskAssessment: {
        score: riskScore,
        factors: riskFactors,
        recommendations: riskScore > 70 ? [
          'Focus on lead scoring and qualification',
          'Implement lead nurturing campaigns',
          'Assign unassigned leads to team members',
          'Follow up on stale leads'
        ] : riskScore > 40 ? [
          'Improve lead scoring criteria',
          'Monitor lead activity',
          'Optimize lead assignment'
        ] : [
          'Maintain current lead management practices'
        ]
      },
      insights: {
        totalLeads: leads.length,
        avgMonthlyGrowth: avgGrowth,
        projectedGrowth: forecast[forecast.length - 1]?.projectedTotal || 0,
        expectedConversions: forecast[forecast.length - 1]?.projectedConverted || 0,
        bestPerformingSource: sourcePerformance[0]?._id || 'N/A'
      }
    }
  });
});

export default {
  createLead,
  getProjectLeads,
  getArchivedLeads,
  getLeadById,
  updateLead,
  archiveLead,
  deleteLead,
  unarchiveLead,
  addLeadNote,
  updateLeadNote,
  deleteLeadNote,
  convertLead,
  updateLeadStatus,
  assignLeadToUser,
  getLeadStats,
  getLeadInsights,
  cleanupArchivedLeads,
  getLeadForecast
};


