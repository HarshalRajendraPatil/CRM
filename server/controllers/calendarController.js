import CalendarEvent from '../models/CalendarEvent.model.js';
import Task from '../models/Task.model.js';
import Deal from '../models/Deal.model.js';
import Customer from '../models/Customer.model.js';
import Company from '../models/Company.model.js';
import Lead from '../models/Lead.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

// Get calendar events for a project
export const getCalendarEvents = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { 
    startDate, 
    endDate, 
    type, 
    search, 
    page = 1, 
    limit = 50,
    sortBy = 'startDate',
    sortOrder = 'asc'
  } = req.query;

  const query = { project: projectId };

  // Date range filter
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  // Type filter
  if (type && type !== 'all') {
    query.type = type;
  }

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [events, total] = await Promise.all([
    CalendarEvent.find(query)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    CalendarEvent.countDocuments(query)
  ]);

  res.json({
    success: true,
    events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Get aggregated events from all CRM entities
export const getAggregatedEvents = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate, types = 'all' } = req.query;

  // Calculate date range for the current view
  const now = new Date();
  let queryStartDate, queryEndDate;
  
  if (startDate && endDate) {
    queryStartDate = new Date(startDate);
    queryEndDate = new Date(endDate);
  } else {
    // Default to current month
    queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  const events = [];

  // Get tasks
  if (types === 'all' || types.includes('task')) {
    const taskQuery = { 
      project: projectId,
      dueDate: {
        $gte: queryStartDate,
        $lte: queryEndDate
      }
    };

    const tasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    tasks.forEach(task => {
      if (task.dueDate) {
        events.push({
          _id: `task_${task._id}`,
          title: task.title,
          description: task.description,
          type: 'task',
          startDate: task.dueDate,
          endDate: task.dueDate,
          allDay: true,
          priority: task.priority,
          status: task.status,
          assignedTo: task.assignedTo,
          createdBy: task.createdBy,
          relatedEntity: {
            type: 'task',
            id: task._id
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        });
      }
    });
  }

  // Get deals
  if (types === 'all' || types.includes('deal')) {
    const dealQuery = { 
      project: projectId,
      expectedCloseDate: {
        $gte: queryStartDate,
        $lte: queryEndDate
      }
    };

    const deals = await Deal.find(dealQuery)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('customer', 'name email')
      .lean();

    deals.forEach(deal => {
      if (deal.expectedCloseDate) {
        events.push({
          _id: `deal_${deal._id}`,
          title: `Deal: ${deal.name}`,
          description: `Value: $${deal.value?.toLocaleString() || '0'}`,
          type: 'deal',
          startDate: deal.expectedCloseDate,
          endDate: deal.expectedCloseDate,
          allDay: true,
          priority: deal.priority,
          status: deal.status,
          assignedTo: deal.assignedTo,
          createdBy: deal.createdBy,
          relatedEntity: {
            type: 'deal',
            id: deal._id
          },
          createdAt: deal.createdAt,
          updatedAt: deal.updatedAt
        });
      }
    });
  }

  // Get customer events (birthdays, anniversaries, etc.)
  if (types === 'all' || types.includes('customer')) {
    const customerQuery = { 
      project: projectId,
      $or: [
        { 
          dateOfBirth: {
            $gte: queryStartDate,
            $lte: queryEndDate
          }
        },
        { 
          anniversaryDate: {
            $gte: queryStartDate,
            $lte: queryEndDate
          }
        }
      ]
    };

    const customers = await Customer.find(customerQuery)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    customers.forEach(customer => {
      if (customer.dateOfBirth) {
        events.push({
          _id: `customer_birthday_${customer._id}`,
          title: `${customer.firstName} ${customer.lastName}'s Birthday`,
          description: `Customer birthday`,
          type: 'customer',
          startDate: customer.dateOfBirth,
          endDate: customer.dateOfBirth,
          allDay: true,
          priority: 'medium',
          status: 'active',
          assignedTo: customer.assignedTo,
          createdBy: customer.createdBy,
          relatedEntity: {
            type: 'customer',
            id: customer._id
          },
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        });
      }

      if (customer.anniversaryDate) {
        events.push({
          _id: `customer_anniversary_${customer._id}`,
          title: `${customer.firstName} ${customer.lastName}'s Anniversary`,
          description: `Customer anniversary`,
          type: 'customer',
          startDate: customer.anniversaryDate,
          endDate: customer.anniversaryDate,
          allDay: true,
          priority: 'medium',
          status: 'active',
          assignedTo: customer.assignedTo,
          createdBy: customer.createdBy,
          relatedEntity: {
            type: 'customer',
            id: customer._id
          },
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        });
      }
    });
  }

  // Get company events
  if (types === 'all' || types.includes('company')) {
    const companyQuery = { 
      project: projectId,
      $or: [
        { 
          foundedDate: {
            $gte: queryStartDate,
            $lte: queryEndDate
          }
        },
        { 
          anniversaryDate: {
            $gte: queryStartDate,
            $lte: queryEndDate
          }
        }
      ]
    };

    const companies = await Company.find(companyQuery)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    companies.forEach(company => {
      if (company.foundedDate) {
        events.push({
          _id: `company_founded_${company._id}`,
          title: `${company.name} Founded`,
          description: `Company founded date`,
          type: 'company',
          startDate: company.foundedDate,
          endDate: company.foundedDate,
          allDay: true,
          priority: 'low',
          status: 'active',
          assignedTo: company.assignedTo,
          createdBy: company.createdBy,
          relatedEntity: {
            type: 'company',
            id: company._id
          },
          createdAt: company.createdAt,
          updatedAt: company.updatedAt
        });
      }

      if (company.anniversaryDate) {
        events.push({
          _id: `company_anniversary_${company._id}`,
          title: `${company.name} Anniversary`,
          description: `Company anniversary`,
          type: 'company',
          startDate: company.anniversaryDate,
          endDate: company.anniversaryDate,
          allDay: true,
          priority: 'medium',
          status: 'active',
          assignedTo: company.assignedTo,
          createdBy: company.createdBy,
          relatedEntity: {
            type: 'company',
            id: company._id
          },
          createdAt: company.createdAt,
          updatedAt: company.updatedAt
        });
      }
    });
  }

  // Get lead events
  if (types === 'all' || types.includes('lead')) {
    const leadQuery = { 
      project: projectId,
      followUpDate: {
        $gte: queryStartDate,
        $lte: queryEndDate
      }
    };

    const leads = await Lead.find(leadQuery)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    leads.forEach(lead => {
      if (lead.followUpDate) {
        events.push({
          _id: `lead_followup_${lead._id}`,
          title: `Follow up: ${lead.firstName} ${lead.lastName}`,
          description: `Lead follow-up`,
          type: 'lead',
          startDate: lead.followUpDate,
          endDate: lead.followUpDate,
          allDay: true,
          priority: lead.priority,
          status: lead.status,
          assignedTo: lead.assignedTo,
          createdBy: lead.createdBy,
          relatedEntity: {
            type: 'lead',
            id: lead._id
          },
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt
        });
      }
    });
  }

  // Get custom calendar events
  const customEvents = await CalendarEvent.find({
    project: projectId,
    startDate: {
      $gte: queryStartDate,
      $lte: queryEndDate
    }
  })
    .populate('createdBy', 'name email')
    .populate('attendees', 'name email')
    .lean();

  customEvents.forEach(event => {
    events.push({
      ...event,
      type: 'custom'
    });
  });

  // Sort events by start date
  events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  res.json({
    success: true,
    events,
    total: events.length
  });
});

// Create a new calendar event
export const createCalendarEvent = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  const eventData = {
    ...req.body,
    project: projectId,
    createdBy: req.user._id
  };

  const event = await CalendarEvent.create(eventData);
  await event.populate('createdBy', 'name email');
  await event.populate('attendees', 'name email');

  res.status(201).json({
    success: true,
    event
  });
});

// Update a calendar event
export const updateCalendarEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const eventData = req.body;

  const event = await CalendarEvent.findByIdAndUpdate(
    eventId,
    eventData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email')
   .populate('attendees', 'name email');

  if (!event) {
    throw new AppError('Calendar event not found', 404);
  }

  res.json({
    success: true,
    event
  });
});

// Delete a calendar event
export const deleteCalendarEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await CalendarEvent.findByIdAndDelete(eventId);

  if (!event) {
    throw new AppError('Calendar event not found', 404);
  }

  res.json({
    success: true,
    message: 'Calendar event deleted successfully'
  });
});

// Get a single calendar event
export const getCalendarEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await CalendarEvent.findById(eventId)
    .populate('createdBy', 'name email')
    .populate('attendees', 'name email');

  if (!event) {
    throw new AppError('Calendar event not found', 404);
  }

  res.json({
    success: true,
    event
  });
});

// Get events by type
export const getEventsByType = asyncHandler(async (req, res) => {
  const { projectId, type } = req.params;
  const { startDate, endDate, page = 1, limit = 50 } = req.query;

  const query = { project: projectId, type };
  
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [events, total] = await Promise.all([
    CalendarEvent.find(query)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    CalendarEvent.countDocuments(query)
  ]);

  res.json({
    success: true,
    events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Get upcoming events
export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { days = 7 } = req.query;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days));

  const events = await CalendarEvent.find({
    project: projectId,
    startDate: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .populate('createdBy', 'name email')
    .populate('attendees', 'name email')
    .sort({ startDate: 1 });

  res.json({
    success: true,
    events
  });
});

// Get overdue events
export const getOverdueEvents = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const now = new Date();
  
  // Get overdue tasks
  const overdueTasks = await Task.find({
    project: projectId,
    dueDate: { $lt: now },
    status: { $nin: ['completed', 'cancelled'] }
  })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .lean();

  const events = overdueTasks.map(task => ({
    _id: `task_${task._id}`,
    title: task.title,
    description: task.description,
    type: 'task',
    startDate: task.dueDate,
    endDate: task.dueDate,
    allDay: true,
    priority: task.priority,
    status: 'overdue',
    assignedTo: task.assignedTo,
    createdBy: task.createdBy,
    relatedEntity: {
      type: 'task',
      id: task._id
    },
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }));

  res.json({
    success: true,
    events
  });
});

// Bulk update events
export const bulkUpdateEvents = asyncHandler(async (req, res) => {
  const { eventIds, updates } = req.body;

  const result = await CalendarEvent.updateMany(
    { _id: { $in: eventIds } },
    updates
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} events updated successfully`
  });
});

// Bulk delete events
export const bulkDeleteEvents = asyncHandler(async (req, res) => {
  const { eventIds } = req.body;

  const result = await CalendarEvent.deleteMany({
    _id: { $in: eventIds }
  });

  res.json({
    success: true,
    message: `${result.deletedCount} events deleted successfully`
  });
});

// Get calendar statistics
export const getCalendarStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const baseQuery = { project: projectId };
  if (Object.keys(dateFilter).length > 0) {
    baseQuery.startDate = dateFilter;
  }

  const [
    totalEvents,
    eventsByType,
    upcomingEvents,
    overdueEvents,
    eventsThisWeek,
    eventsThisMonth
  ] = await Promise.all([
    CalendarEvent.countDocuments(baseQuery),
    CalendarEvent.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    CalendarEvent.countDocuments({
      ...baseQuery,
      startDate: { $gte: new Date() }
    }),
    CalendarEvent.countDocuments({
      ...baseQuery,
      startDate: { $lt: new Date() }
    }),
    CalendarEvent.countDocuments({
      ...baseQuery,
      startDate: {
        $gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
        $lt: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7))
      }
    }),
    CalendarEvent.countDocuments({
      ...baseQuery,
      startDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      }
    })
  ]);

  res.json({
    success: true,
    stats: {
      totalEvents,
      eventsByType,
      upcomingEvents,
      overdueEvents,
      eventsThisWeek,
      eventsThisMonth
    }
  });
});

// Check for event conflicts
export const checkEventConflicts = asyncHandler(async (req, res) => {
  const { startDate, endDate, attendees, excludeEventId } = req.body;

  const conflictQuery = {
    $or: [
      {
        startDate: { $lt: new Date(endDate) },
        endDate: { $gt: new Date(startDate) }
      }
    ]
  };

  if (excludeEventId) {
    conflictQuery._id = { $ne: excludeEventId };
  }

  if (attendees && attendees.length > 0) {
    conflictQuery.attendees = { $in: attendees };
  }

  const conflicts = await CalendarEvent.find(conflictQuery)
    .populate('attendees', 'name email')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    conflicts
  });
});

// Get calendar settings
export const getCalendarSettings = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // For now, return default settings
  // In the future, this could be stored in a separate settings collection
  const settings = {
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    timezone: 'UTC',
    defaultEventDuration: 60,
    reminderSettings: {
      defaultReminders: [
        { type: 'email', time: 15, unit: 'minutes' }
      ]
    }
  };

  res.json({
    success: true,
    settings
  });
});

// Update calendar settings
export const updateCalendarSettings = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const settings = req.body;

  // For now, just return the updated settings
  // In the future, this would save to a database
  res.json({
    success: true,
    settings
  });
});

// Respond to calendar event
export const respondToEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { response } = req.body; // 'accepted', 'declined', 'tentative'
  const userId = req.user._id;

  if (!['accepted', 'declined', 'tentative'].includes(response)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid response. Must be accepted, declined, or tentative'
    });
  }

  const event = await CalendarEvent.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user is an attendee
  if (!event.attendees.includes(userId)) {
    return res.status(403).json({
      success: false,
      message: 'You are not an attendee of this event'
    });
  }

  // Update or add response
  const existingResponseIndex = event.responses.findIndex(r => r.user.toString() === userId.toString());
  
  if (existingResponseIndex >= 0) {
    event.responses[existingResponseIndex].response = response;
    event.responses[existingResponseIndex].respondedAt = new Date();
  } else {
    event.responses.push({
      user: userId,
      response: response,
      respondedAt: new Date()
    });
  }

  await event.save();
  await event.populate('responses.user', 'name email');

  res.json({
    success: true,
    message: 'Response recorded successfully',
    event
  });
});

// Get event responses
export const getEventResponses = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await CalendarEvent.findById(eventId)
    .populate('responses.user', 'name email')
    .populate('attendees', 'name email');

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  res.json({
    success: true,
    responses: event.responses,
    attendees: event.attendees
  });
});
