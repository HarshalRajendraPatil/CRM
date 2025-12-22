import Customer from '../models/Customer.model.js';
import Lead from '../models/Lead.model.js';
import User from '../models/User.model.js';
import notificationService from '../utils/notificationService.js';
import ActivityService from '../utils/activityService.js';
import activityHelper from '../utils/activityHelper.js';
import { ForbiddenError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

// Get all customers for a project with advanced filtering
export const getProjectCustomers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      limit = 20,
      skip = 0,
      sort = 'createdAt',
      order = 'desc',
      stage,
      status,
      source,
      search,
      tags,
      owner,
      priority,
      assignedTo,
      company
    } = req.query;
    const customers = await Customer.findByProject(projectId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort,
      order,
      stage,
      status,
      source,
      search,
      tags: tags ? tags.split(',') : undefined,
      owner,
      priority,
      assignedTo,
      company
    });

    const total = await Customer.countDocuments({ 
      project: projectId, 
      isArchived: false,
    });

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + customers.length
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// Get a single customer by ID
export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id)
      .populate('owner', 'name email profileImage')
      .populate('assignedTo', 'name email profileImage')
      .populate('createdBy', 'name email profileImage')
      .populate('updatedBy', 'name email profileImage')
      .populate('company', 'name industry website')
      .populate('convertedFromLead', 'name email')
      .populate('archivedBy', 'name email profileImage')
      .populate('deals', 'name value currency status priority probability expectedCloseDate createdAt')
      .populate('notes.createdBy', 'name email profileImage')
      .populate('interactions.createdBy', 'name email profileImage');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
};

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const customer = new Customer(customerData);
    await customer.save();

    // Log activity
    try {
      await ActivityService.logCustomerCreated(customer, req.user);
    } catch (error) {
      console.error('Failed to log customer creation activity:', error);
    }

    // Populate the customer with related data
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'company', select: 'name industry' }
    ]);

    // Create notification for assigned user if different from owner
    if (customer.assignedTo && customer.assignedTo.toString() !== req.user.id) {
      await notificationService.createCustomerNotification(
        'customer_assigned',
        customer,
        customer.project,
        req.user.id,
        [req.user.id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

// Update a customer
export const updateCustomer = async (req, res) => {
  try {

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    // Get the existing customer to track changes
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Store old data for comprehensive activity tracking
    const oldData = existingCustomer.toObject();
    const oldTags = [...(existingCustomer.tags || [])];
    const oldCustomFields = existingCustomer.customFields ? new Map(existingCustomer.customFields) : new Map();

    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'company', select: 'name industry' }
    ]);

    // Comprehensive activity tracking
    try {
      // Track all field changes
      await activityHelper.trackEntityChanges('Customer', customer, oldData, updateData, req.user);
      
      // Track tag changes
      const newTags = customer.tags || [];
      if (JSON.stringify(oldTags.sort()) !== JSON.stringify(newTags.sort())) {
        await activityHelper.trackTagChanges('Customer', customer, oldTags, newTags, req.user);
      }
      
      // Track custom field changes
      const newCustomFields = customer.customFields || new Map();
      if (oldCustomFields.size !== newCustomFields.size || 
          JSON.stringify([...oldCustomFields]) !== JSON.stringify([...newCustomFields])) {
        await activityHelper.trackCustomFieldChanges('Customer', customer, 
          Object.fromEntries(oldCustomFields), Object.fromEntries(newCustomFields), req.user);
      }
      } catch (error) {
        console.error('Failed to log customer update activity:', error);
    }

    // Create notification for assignment changes
    if (req.body?.assignedTo && req.body?.assignedTo?.toString() !== customer.assignedTo?.toString()) {
      await notificationService.createCustomerNotification(
        'customer_updated',
        customer,
        customer.project,
        req.user.id,
        [req.user.id]
      );
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

// Archive a customer (soft delete)
export const archiveCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: req.user.id,
        updatedBy: req.user.id
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Log activity
    try {
      await ActivityService.logCustomerArchived(customer, req.user);
    } catch (error) {
      console.error('Failed to log customer archive activity:', error);
    }

    res.json({
      success: true,
      message: 'Customer archived successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error archiving customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive customer',
      error: error.message
    });
  }
};

// Unarchive a customer
export const unarchiveCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        isArchived: false,
        archivedAt: null,
        archivedBy: null,
        updatedBy: req.user.id
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Log activity
    try {
      await ActivityService.logCustomerUnarchived(customer, req.user);
    } catch (error) {
      console.error('Failed to log customer unarchive activity:', error);
    }

    // Populate the customer before returning
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'company', select: 'name' },
      { path: 'notes.createdBy', select: 'name email profileImage' },
      { path: 'interactions.createdBy', select: 'name email profileImage' }
    ]);

    res.json({
      success: true,
      message: 'Customer unarchived successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error unarchiving customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unarchive customer',
      error: error.message
    });
  }
};

// Get archived customers
export const getArchivedCustomers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      limit = 20,
      skip = 0,
      sort = 'archivedAt',
      order = 'desc',
      search
    } = req.query;

    const customers = await Customer.findArchivedByProject(projectId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort,
      order,
      search
    });

    const total = await Customer.countDocuments({ 
      project: projectId, 
      isArchived: true 
    });

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + customers.length
      }
    });
  } catch (error) {
    console.error('Error fetching archived customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch archived customers',
      error: error.message
    });
  }
};

// Add a note to a customer
export const addCustomerNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type = 'general' } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // await customer.addNote(content, type, req.user.id);
    customer.notes.push({ content, type, createdBy: req.user.id, createdAt: new Date(), updatedAt: new Date() });
    customer.updatedBy = req.user.id;
    await customer.save();

    // Get the newly added note
    const newlyAddedNote = customer.notes[customer.notes.length - 1];

    // Log activity
    try {
      await ActivityService.logCustomerNoteAdded(customer, newlyAddedNote, req.user);
    } catch (error) {
      console.error('Failed to log customer note addition activity:', error);
    }

    // Populate the updated customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'notes.createdBy', select: 'name email profileImage' },
      { path: 'interactions.createdBy', select: 'name email profileImage' }
    ]);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
};

// Add an interaction to a customer
export const addCustomerInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const interactionData = req.body;
    interactionData.createdBy = req.user.id;
    interactionData.createdAt = new Date();

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.interactions.push(interactionData);
    customer.updatedBy = req.user.id;
    await customer.save();

    // Get the newly added interaction
    const newlyAddedInteraction = customer.interactions[customer.interactions.length - 1];

    // Log activity
    try {
      await ActivityService.logCustomerInteractionAdded(customer, newlyAddedInteraction, req.user);
    } catch (error) {
      console.error('Failed to log customer interaction addition activity:', error);
    }
    
    // Populate the updated customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'notes.createdBy', select: 'name email profileImage' },
      { path: 'interactions.createdBy', select: 'name email profileImage' }
    ]);

    res.json({
      success: true,
      message: 'Interaction added successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error adding interaction:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add interaction',
      error: error.message
    });
  }
};

// Update a customer note
export const updateCustomerNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { content, type } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const note = customer.notes.id(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user can edit this note (only the creator can edit)
    if (note.createdBy.toString() !== req.user.id && req.user.roleGlobal !== 'system-admin') {
      throw new ForbiddenError('You can only edit your own notes');
    }

    note.content = content.trim();
    if (type) note.type = type;
    note.updatedAt = new Date();
    customer.updatedBy = req.user.id;
    await customer.save();

    // Log activity
    try {
      await ActivityService.logCustomerNoteUpdated(customer, note, req.user);
    } catch (error) {
      console.error('Failed to log customer note update activity:', error);
    }

    // Populate the updated customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'notes.createdBy', select: 'name email profileImage' },
      { path: 'interactions.createdBy', select: 'name email profileImage' }
    ]);

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating note:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update note',
      error: error.message
    });
  }
};

// Delete a customer note
export const deleteCustomerNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const note = customer.notes.id(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user can delete this note (only the creator can delete)
    if (note.createdBy.toString() !== req.user.id && req.user.roleGlobal !== 'system-admin') {
      throw new ForbiddenError('You can only delete your own notes');
    }

    // Log activity before removing note
    try {
      await ActivityService.logCustomerNoteDeleted(customer, noteId, req.user);
    } catch (error) {
      console.error('Failed to log customer note deletion activity:', error);
    }

    customer.notes.pull(noteId);
    customer.updatedBy = req.user.id;
    await customer.save();

    // Populate the updated customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'notes.createdBy', select: 'name email profileImage' },
      { path: 'interactions.createdBy', select: 'name email profileImage' }
    ]);

    res.json({
      success: true,
      message: 'Note deleted successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete note',
      error: error.message
    });
  }
};

// Update a customer interaction
export const updateCustomerInteraction = async (req, res) => {
  try {
    const { id, interactionId } = req.params;
    const interactionData = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const interaction = customer.interactions.id(interactionId);
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    // Check if user can edit this interaction (only the creator can edit)
    if (interaction.createdBy.toString() !== req.user.id && req.user.roleGlobal !== 'system-admin') {
      throw new ForbiddenError('You can only edit your own interactions');
    }

    // Update interaction fields
    if (interactionData.type) interaction.type = interactionData.type;
    if (interactionData.title) interaction.title = interactionData.title;
    if (interactionData.description !== undefined) interaction.description = interactionData.description;
    if (interactionData.date) interaction.date = interactionData.date;
    if (interactionData.duration !== undefined) interaction.duration = interactionData.duration;
    if (interactionData.outcome) interaction.outcome = interactionData.outcome;

    customer.updatedBy = req.user.id;
    await customer.save();

    // Log activity
    try {
      await ActivityService.logCustomerInteractionUpdated(customer, interaction, req.user);
    } catch (error) {
      console.error('Failed to log customer interaction update activity:', error);
    }

    // Populate the updated customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'notes.createdBy', select: 'name email profileImage' },
      { path: 'interactions.createdBy', select: 'name email profileImage' }
    ]);

    res.json({
      success: true,
      message: 'Interaction updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating interaction:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update interaction',
      error: error.message
    });
  }
};

// Delete a customer interaction
export const deleteCustomerInteraction = async (req, res) => {
  try {
    const { id, interactionId } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const interaction = customer.interactions.id(interactionId);
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    // Check if user can delete this interaction (only the creator can delete)
    if (interaction.createdBy.toString() !== req.user.id && req.user.roleGlobal !== 'system-admin') {
      throw new ForbiddenError('You can only delete your own interactions');
    }

    // Log activity before removing interaction
    try {
      await ActivityService.logCustomerInteractionDeleted(customer, interactionId, req.user);
    } catch (error) {
      console.error('Failed to log customer interaction deletion activity:', error);
    }

    customer.interactions.pull(interactionId);
    customer.updatedBy = req.user.id;
    await customer.save();

    // Populate the updated customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'notes.createdBy', select: 'name email profileImage' },
      { path: 'interactions.createdBy', select: 'name email profileImage' }
    ]);

    res.json({
      success: true,
      message: 'Interaction deleted successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error deleting interaction:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete interaction',
      error: error.message
    });
  }
};

// Convert lead to customer
export const convertLeadToCustomer = async (req, res) => {
  try {
    const { leadId } = req.params;
    const customerData = req.body;

    console.log("leadId", req.params);
    console.log("customerData", customerData);

    // Find the lead
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if lead is already converted
    if (lead.convertedAt) {
      return res.status(400).json({
        success: false,
        message: 'Lead has already been converted'
      });
    }

    // Create customer data from lead
    const newCustomerData = {
      project: lead.project,
      owner: lead.owner,
      assignedTo: lead.assignedTo,
      firstName: customerData.firstName || lead.name.split(' ')[0] || '',
      lastName: customerData.lastName || lead.name.split(' ').slice(1).join(' ') || '',
      email: customerData.email || lead.email,
      phone: customerData.phone || lead.phone,
      jobTitle: customerData.jobTitle || lead.jobTitle,
      company: customerData.company || lead.company,
      companyName: customerData.companyName || '',
      industry: customerData.industry || '',
      address: customerData.address || {},
      socialLinks: customerData.socialLinks || {},
      stage: 'lead',
      status: 'active',

      tags: customerData.tags || lead.tags || [],
      source: customerData.source || lead.source,
      score: customerData.score || lead.score,
      priority: customerData.priority || 'medium',
      communicationPreferences: customerData.communicationPreferences || {
        email: true,
        phone: true,
        sms: false,
        preferredContactMethod: 'email'
      },
      lifecycleStage: 'awareness',
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    // Create the customer
    const customer = new Customer(newCustomerData);
    await customer.convertFromLead(leadId, req.user.id);

    // Update the lead as converted and archive
    lead.convertedAt = new Date();
    lead.convertedBy = req.user.id;
    lead.convertedContactId = customer._id;
    lead.convertedCustomerId = customer._id;
    lead.isArchived = true;
    lead.archivedAt = new Date();
    await lead.save();

    // Log activity
    try {
      await ActivityService.logCustomerConvertedFromLead(customer, lead, req.user);
    } catch (error) {
      console.error('Failed to log customer conversion activity:', error);
    }

    // Populate the customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'company', select: 'name industry' },
      { path: 'convertedFromLead', select: 'name email' }
    ]);

    // Create notification
    await notificationService.createCustomerNotification(
      'lead_converted',
      customer,
      customer.project,
      req.user.id,
      [req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Lead converted to customer successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to convert lead',
      error: error.message
    });
  }
};

// Bulk operations
export const bulkUpdateCustomers = async (req, res) => {
  try {
    const { customerIds, updates } = req.body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer IDs are required'
      });
    }

    const result = await Customer.updateMany(
      { _id: { $in: customerIds } },
      { ...updates, updatedBy: req.user.id },
      { runValidators: true }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} customers successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error bulk updating customers:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to bulk update customers',
      error: error.message
    });
  }
};

// Bulk archive customers
export const bulkArchiveCustomers = async (req, res) => {
  try {
    const { customerIds } = req.body;
    const { projectId } = req.query;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: 'Customer IDs are required' });
    }

    const result = await Customer.updateMany(
      { 
        _id: { $in: customerIds }, 
        project: projectId,
        owner: req.user.id 
      },
      { 
        $set: { 
          isArchived: true,
          archivedAt: new Date(),
          archivedBy: req.user.id,
          updatedAt: new Date(),
          updatedBy: req.user.id
        }
      }
    );

    res.json({
      message: `Successfully archived ${result.modifiedCount} customers`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk archive customers error:', error);
    res.status(500).json({ message: 'Failed to bulk archive customers' });
  }
};

// Bulk unarchive customers
export const bulkUnarchiveCustomers = async (req, res) => {
  try {
    const { customerIds } = req.body;
    const { projectId } = req.query;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: 'Customer IDs are required' });
    }

    const result = await Customer.updateMany(
      { 
        _id: { $in: customerIds }, 
        project: projectId,
        owner: req.user.id 
      },
      { 
        $set: { 
          isArchived: false,
          archivedAt: null,
          archivedBy: null,
          updatedAt: new Date(),
          updatedBy: req.user.id
        }
      }
    );

    res.json({
      message: `Successfully unarchived ${result.modifiedCount} customers`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk unarchive customers error:', error);
    res.status(500).json({ message: 'Failed to bulk unarchive customers' });
  }
};

// Bulk assign customers
export const bulkAssignCustomers = async (req, res) => {
  try {
    const { customerIds, assignedTo } = req.body;
    const { projectId } = req.query;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: 'Customer IDs are required' });
    }

    if (!assignedTo) {
      return res.status(400).json({ message: 'Assigned user is required' });
    }

    const result = await Customer.updateMany(
      { 
        _id: { $in: customerIds }, 
        project: projectId,
        owner: req.user.id 
      },
      { 
        $set: { 
          assignedTo,
          updatedAt: new Date(),
          updatedBy: req.user.id
        }
      }
    );

    // Create notification for assignment
    await notificationService.createCustomerNotification(
      'customer_assigned',
      { fullName: 'Multiple Customers' },
      projectId,
      req.user.id,
      [req.user.id]
    );

    res.json({
      message: `Successfully assigned ${result.modifiedCount} customers`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk assign customers error:', error);
    res.status(500).json({ message: 'Failed to bulk assign customers' });
  }
};

// Bulk update customer stages
export const bulkUpdateCustomerStages = async (req, res) => {
  try {
    const { customerIds, stage } = req.body;
    const { projectId } = req.query;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: 'Customer IDs are required' });
    }

    if (!stage) {
      return res.status(400).json({ message: 'Stage is required' });
    }

    const result = await Customer.updateMany(
      { 
        _id: { $in: customerIds }, 
        project: projectId,
        owner: req.user.id 
      },
      { 
        $set: { 
          stage,
          updatedAt: new Date(),
          updatedBy: req.user.id
        }
      }
    );

    res.json({
      message: `Successfully updated stage for ${result.modifiedCount} customers`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update customer stages error:', error);
    res.status(500).json({ message: 'Failed to bulk update customer stages' });
  }
};

// Bulk update customer priorities
export const bulkUpdateCustomerPriorities = async (req, res) => {
  try {
    const { customerIds, priority } = req.body;
    const { projectId } = req.query;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: 'Customer IDs are required' });
    }

    if (!priority) {
      return res.status(400).json({ message: 'Priority is required' });
    }

    const result = await Customer.updateMany(
      { 
        _id: { $in: customerIds }, 
        project: projectId,
        owner: req.user.id 
      },
      { 
        $set: { 
          priority,
          updatedAt: new Date(),
          updatedBy: req.user.id
        }
      }
    );

    res.json({
      message: `Successfully updated priority for ${result.modifiedCount} customers`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update customer priorities error:', error);
    res.status(500).json({ message: 'Failed to bulk update customer priorities' });
  }
};

// Bulk update customer statuses
export const bulkUpdateCustomerStatuses = async (req, res) => {
  try {
    const { customerIds, status } = req.body;
    const { projectId } = req.query;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: 'Customer IDs are required' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const result = await Customer.updateMany(
      { 
        _id: { $in: customerIds }, 
        project: projectId,
        owner: req.user.id 
      },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          updatedBy: req.user.id
        }
      }
    );

    res.json({
      message: `Successfully updated status for ${result.modifiedCount} customers`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update customer statuses error:', error);
    res.status(500).json({ message: 'Failed to bulk update customer statuses' });
  }
};

// Export customers
export const exportCustomers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { format = 'json' } = req.query;

    const customers = await Customer.findByProject(projectId, { limit: 10000 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = customers.map(customer => ({
        'First Name': customer.firstName,
        'Last Name': customer.lastName,
        'Email': customer.email,
        'Phone': customer.phone,
        'Company': customer.companyName,
        'Job Title': customer.jobTitle,
        'Stage': customer.stage,
        'Status': customer.status,

        'Priority': customer.priority,
        'Score': customer.score,
        'Created Date': customer.createdAt,
        'Last Updated': customer.updatedAt
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=customers-${projectId}.csv`);
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      res.json({
        success: true,
        data: customers
      });
    }
  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export customers',
      error: error.message
    });
  }
};

// Delete customer permanently
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if user has permission to delete this customer
    if (customer.owner.toString() !== req.user.id && req.user.roleGlobal !== 'system-admin') {
      throw new ForbiddenError('You do not have permission to delete this customer');
    }

    // Log activity before deletion
    try {
      await ActivityService.logCustomerDeleted(customer, req.user);
    } catch (error) {
      console.error('Failed to log customer deletion activity:', error);
    }

    // Permanently delete the customer
    await Customer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete customer',
      error: error.message
    });
  }
};

// Bulk delete customers permanently
export const bulkDeleteCustomers = async (req, res) => {
  try {
    const { customerIds } = req.body;
    const { projectId } = req.query;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Customer IDs are required' 
      });
    }

    // Verify all customers belong to the user's project
    const customers = await Customer.find({
      _id: { $in: customerIds },
      project: projectId,
      owner: req.user.id
    });

    if (customers.length !== customerIds.length) {
      throw new ForbiddenError('You do not have permission to delete some of the selected customers');
    }

    // Permanently delete the customers
    const result = await Customer.deleteMany({
      _id: { $in: customerIds },
      project: projectId,
      owner: req.user.id
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} customers`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete customers error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to bulk delete customers',
      error: error.message
    });
  }
};

// ==================== CUSTOMER ANALYTICS ENDPOINTS ====================

// Get simplified customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period = '30d' } = req.query;

    // Calculate date filter
    const now = new Date();
    let dateFilter = {};
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    dateFilter = { $gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000) };

    // Get basic counts
    const totalCustomers = await Customer.countDocuments({ project: projectId, isArchived: false });
    const activeCustomers = await Customer.countDocuments({ project: projectId, isArchived: false, status: 'active' });
    const newCustomers = await Customer.countDocuments({ project: projectId, isArchived: false, createdAt: dateFilter });
    const churnedCustomers = await Customer.countDocuments({ project: projectId, isArchived: false, stage: 'churned' });

    // Get distribution data
    const customersByStage = await Customer.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const customersBySource = await Customer.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get average score
    const avgScoreResult = await Customer.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false } },
      { $group: { _id: null, averageScore: { $avg: '$score' } } }
    ]);

    // Get recent customers
    const recentCustomers = await Customer.find({ project: new mongoose.Types.ObjectId(projectId), isArchived: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'name email')
      .select('firstName lastName email stage score createdAt');

    // Calculate churn rate
    const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;

    const stats = {
      overview: {
        totalCustomers,
        activeCustomers,
        newCustomers,
        churnedCustomers,
        churnRate: Math.round(churnRate * 10) / 10,
        averageScore: Math.round((avgScoreResult[0]?.averageScore || 0) * 10) / 10
      },
      distribution: {
        byStage: customersByStage,
        bySource: customersBySource,
      },
      recentCustomers
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics',
      error: error.message
    });
  }
};

// Get simplified customer insights
export const getCustomerInsights = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get creation trend
    const creationTrend = await Customer.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false} },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top customers by score
    const topCustomers = await Customer.find({ project: new mongoose.Types.ObjectId(projectId), isArchived: false })
      .sort({ score: -1 })
      .limit(5)
      .populate('owner', 'name email')
      .select('firstName lastName email stage score');

    // Get top tags
    const topTags = await Customer.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get interaction types
    const interactionTypes = await Customer.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false } },
      { $unwind: '$interactions' },
      { $group: { _id: '$interactions.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const insights = {
      trends: {
        creationTrend: creationTrend.map(item => ({
          date: item._id,
          count: item.count
        }))
      },
      topCustomers,
      topTags: topTags.map(tag => ({
        tag: tag._id,
        count: tag.count
      })),
      interactionTypes
    };

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer insights',
      error: error.message
    });
  }
};

// Get simplified customer forecast
export const getCustomerForecast = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { months = 6 } = req.query;

    const forecastMonths = parseInt(months);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Get historical data for the last 6 months
    const historicalData = await Customer.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), isArchived: false, createdAt: { $gte: startDate } } },
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

    // Calculate average monthly growth
    let avgGrowthRate = 0;
    if (historicalData.length > 1) {
      const growthRates = [];
      for (let i = 1; i < historicalData.length; i++) {
        const current = historicalData[i];
        const previous = historicalData[i - 1];
        if (previous.count > 0) {
          const growthRate = ((current.count - previous.count) / previous.count) * 100;
          growthRates.push(growthRate);
        }
      }
      avgGrowthRate = growthRates.length > 0 
        ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length 
        : 0;
    }

    // Generate simple forecast
    const forecast = [];
    const lastMonth = historicalData[historicalData.length - 1];
    let projectedCount = lastMonth ? lastMonth.count : 0;

    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      projectedCount = Math.round(projectedCount * (1 + avgGrowthRate / 100));
      
      forecast.push({
        month: `${forecastDate.getFullYear()}-${(forecastDate.getMonth() + 1).toString().padStart(2, '0')}`,
        projected: Math.max(0, projectedCount)
      });
    }

    const forecastData = {
      historical: historicalData.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      })),
      forecast,
      growthRate: Math.round(avgGrowthRate * 10) / 10
    };

    res.json({
      success: true,
      data: forecastData
    });
  } catch (error) {
    console.error('Error fetching customer forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer forecast',
      error: error.message
    });
  }
};


// ==================== DEAL-RELATED ENDPOINTS ====================

// Get customer deals
export const getCustomerDeals = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, stage, limit = 20, skip = 0 } = req.query;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Build filter - exclude archived deals
    const filter = { 
      customer: new mongoose.Types.ObjectId(id),
      isArchived: { $ne: true }
    };
    if (status) filter.status = { $in: status.split(',') };
    if (stage) filter.stage = { $in: stage.split(',') };

    const Deal = mongoose.model('Deal');
    const deals = await Deal.find(filter)
      .populate('assignedTo', 'name email profileImage')
      .populate('company', 'name website')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Deal.countDocuments(filter);

    res.json({
      success: true,
      data: deals,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + deals.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching customer deals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer deals',
      error: error.message
    });
  }
};

// Get customer deal statistics
export const getCustomerDealStats = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(new mongoose.Types.ObjectId(id));
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const stats = {
      totalDeals: await customer.getDealCount(),
      activeDeals: await customer.getActiveDealCount(),
      wonDeals: await customer.getWonDealCount(),
      totalValue: await customer.getTotalDealValue(),
      wonValue: await customer.getWonDealValue(),
      conversionRate: await customer.getConversionRate()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching customer deal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer deal statistics',
      error: error.message
    });
  }
};
