import Customer from '../models/Customer.model.js';
import Lead from '../models/Lead.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import { sendEmail } from '../utils/emailService.js';
import notificationService from '../utils/notificationService.js';
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
      assignedTo
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
      assignedTo
    });

    const total = await Customer.countDocuments({ 
      project: projectId, 
      isArchived: false 
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
      .populate('lastActivityBy', 'name email profileImage')
      .populate('archivedBy', 'name email profileImage')
      .populate('deals', 'name value currency status priority probability expectedCloseDate createdAt');

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

    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'company', select: 'name industry' }
    ]);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create notification for assignment changes
    if (req.body.assignedTo && req.body.assignedTo !== customer.assignedTo?.toString()) {
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

    await customer.addNote(content, type, req.user.id);

    // Populate the updated customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
      { path: 'notes.createdBy', select: 'name email profileImage' }
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

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.addInteraction(interactionData, req.user.id);

    // Populate the updated customer
    await customer.populate([
      { path: 'owner', select: 'name email profileImage' },
      { path: 'assignedTo', select: 'name email profileImage' },
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

// Convert lead to customer
export const convertLeadToCustomer = async (req, res) => {
  try {
    const { leadId } = req.params;
    const customerData = req.body;

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

    // Update the lead as converted
    lead.convertedAt = new Date();
    lead.convertedBy = req.user.id;
    lead.convertedContactId = customer._id;
    await lead.save();

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

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [
      totalCustomers,
      activeCustomers,
      customersThisMonth,
      customersByStage,
      customersBySource,
      topCustomers,
      recentActivity
    ] = await Promise.all([
      Customer.countDocuments({ project: projectId, isArchived: false }),
      Customer.countDocuments({ project: projectId, isArchived: false, status: 'active' }),
      Customer.countDocuments({
        project: projectId,
        isArchived: false,
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }),
      Customer.aggregate([
        { $match: { project: projectId, isArchived: false } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Customer.aggregate([
        { $match: { project: projectId, isArchived: false } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Customer.aggregate([
      ]),
      Customer.find({ project: projectId, isArchived: false })
        .sort({ score: -1 })
        .limit(5)
        .populate('owner', 'name email profileImage'),
      Customer.find({ project: projectId, isArchived: false })
        .sort({ lastActivityDate: -1 })
        .limit(10)
        .populate('owner', 'name email profileImage')
        .populate('lastActivityBy', 'name email profileImage')
    ]);


    const stats = {
      totals: {
        totalCustomers,
        activeCustomers,
        customersThisMonth,
      },
      stageDistribution: customersByStage,
      sourceDistribution: customersBySource,
      topCustomers,
      recentActivity
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

// Get customer insights and analytics
export const getCustomerInsights = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period = '30d' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    const [
      dailyCreationTrend,
      stageConversionRates,
      ownerPerformance,
      churnRate,
      topTags,
      interactionAnalysis,
      customerLifetimeValue
    ] = await Promise.all([
      // Daily creation trend
      Customer.aggregate([
        { $match: { project: projectId, isArchived: false, createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Stage conversion rates
      Customer.aggregate([
        { $match: { project: projectId, isArchived: false } },
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Owner performance
      Customer.aggregate([
        { $match: { project: projectId, isArchived: false } },
        {
          $group: {
            _id: '$owner',
            totalCustomers: { $sum: 1 },
            averageScore: { $avg: '$score' },
          }
        },
        { $sort: { totalCustomers: -1 } }
      ]),





      // Churn rate calculation
      Customer.aggregate([
        { $match: { project: projectId, stage: 'churned' } },
        { $group: { _id: null, churnedCount: { $sum: 1 } } }
      ]),

      // Top tags
      Customer.aggregate([
        { $match: { project: projectId, isArchived: false } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Interaction analysis
      Customer.aggregate([
        { $match: { project: projectId, isArchived: false } },
        { $unwind: '$interactions' },
        {
          $group: {
            _id: '$interactions.type',
            count: { $sum: 1 },
            avgDuration: { $avg: '$interactions.duration' }
          }
        },
        { $sort: { count: -1 } }
      ]),

    ]);

    // Calculate churn rate
    const totalCustomers = await Customer.countDocuments({ project: projectId, isArchived: false });
    const churnedCount = churnRate[0]?.churnedCount || 0;
    const churnRateValue = totalCustomers > 0 ? (churnedCount / totalCustomers) * 100 : 0;

    const ltvData = customerLifetimeValue[0] || {
      avgLifetimeValue: 0,
      maxLifetimeValue: 0,
      minLifetimeValue: 0,
      totalLifetimeValue: 0
    };

    const insights = {
      dailyCreationTrend: dailyCreationTrend.map(item => ({
        date: item._id,
        count: item.count
      })),
      stageConversionRates,
      ownerPerformance: await Promise.all(
        ownerPerformance.map(async (perf) => {
          const user = await User.findById(perf._id).select('name email profileImage');
          return {
            ...perf,
            owner: user
          };
        })
      ),
      churnRate: churnRateValue,
      topTags: topTags.map(tag => ({
        tag: tag._id,
        count: tag.count
      })),
      interactionAnalysis
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
        'Last Activity': customer.lastActivityDate
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
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this customer'
      });
    }

    // Permanently delete the customer
    await Customer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
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
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete some of the selected customers'
      });
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
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete customers',
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
      customer: id,
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

    const customer = await Customer.findById(id);
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
