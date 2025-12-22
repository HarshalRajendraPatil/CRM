import CalendarEvent from "../models/CalendarEvent.model.js";
import Task from "../models/Task.model.js";
import Deal from "../models/Deal.model.js";
import Customer from "../models/Customer.model.js";
import Company from "../models/Company.model.js";
import Lead from "../models/Lead.model.js";
import {
  asyncHandler,
  AppError,
  ForbiddenError,
} from "../middleware/errorHandler.js";
import {
  sendEventInvitationEmail,
  sendEventUpdatedEmail,
  sendEventCancelledEmail,
} from "../utils/emailService.js";

// Get calendar events for a project
export const getCalendarEvents = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    startDate,
    endDate,
    type,
    search,
    attendee,
    priority,
    status,
    visibility,
    page = 1,
    limit = 100,
    sortBy = "startDate",
    sortOrder = "asc",
  } = req.query;

  const query = { project: projectId };

  // Get user's project role
  const userProjectRole = req.user.getProjectRole(projectId);
  const isOwnerAdminManager = ["owner", "admin", "manager"].includes(
    userProjectRole
  );

  // Role-based filtering for custom events
  // Custom events: Only visible to owner, admin, manager, and attendees
  const customEventConditions = [];
  if (isOwnerAdminManager) {
    customEventConditions.push({ type: "custom" });
  } else {
    customEventConditions.push({
      type: "custom",
      $or: [{ attendees: req.user._id }, { createdBy: req.user._id }],
    });
  }

  // For non-custom events (task, deal, etc.), apply different filtering
  const nonCustomEventConditions = [];
  if (isOwnerAdminManager) {
    // Owner, admin, manager can see all non-custom events
    nonCustomEventConditions.push({ type: { $ne: "custom" } });
  } else {
    // For task and deal events, only show if assigned to user
    // For other types, show based on visibility
    nonCustomEventConditions.push({
      type: { $ne: "custom" },
      $or: [
        { visibility: { $in: ["project", "public"] } },
        { createdBy: req.user._id },
      ],
    });
  }

  // Combine conditions
  if (customEventConditions.length > 0 && nonCustomEventConditions.length > 0) {
    query.$or = [...customEventConditions, ...nonCustomEventConditions];
  } else if (customEventConditions.length > 0) {
    query.$or = customEventConditions;
  } else if (nonCustomEventConditions.length > 0) {
    query.$or = nonCustomEventConditions;
  }

  // Date range filter - check if event overlaps with the requested range
  if (startDate || endDate) {
    // Parse dates as local dates to avoid timezone issues
    // If date string is in YYYY-MM-DD format, append time to ensure local parsing
    const start = startDate
      ? new Date(startDate.includes("T") ? startDate : startDate + "T00:00:00")
      : new Date(0);
    const end = endDate
      ? new Date(endDate.includes("T") ? endDate : endDate + "T23:59:59")
      : new Date("2100-01-01");

    // Use $and to combine with existing $or conditions if they exist
    const dateRangeQuery = {
      $or: [
        {
          // Events that start within the range
          startDate: { $gte: start, $lte: end },
        },
        {
          // Events that end within the range
          endDate: { $gte: start, $lte: end },
        },
        {
          // Events that span the entire range (start before and end after)
          startDate: { $lte: start },
          endDate: { $gte: end },
        },
        {
          // Events that start before range but end within range
          startDate: { $lt: start },
          endDate: { $gte: start, $lte: end },
        },
        {
          // Events that start within range but end after range
          startDate: { $gte: start, $lte: end },
          endDate: { $gt: end },
        },
      ],
    };

    // If there's already an $or condition (from role-based filtering), combine with $and
    if (query.$or) {
      query.$and = [{ $or: query.$or }, dateRangeQuery];
      delete query.$or;
    } else {
      // If we already have $and, add date range to it
      if (query.$and) {
        query.$and.push(dateRangeQuery);
      } else {
        Object.assign(query, dateRangeQuery);
      }
    }
  }

  // Type filter
  if (type && type !== "all") {
    if (query.$and) {
      query.$and.push({ type });
    } else {
      query.type = type;
    }
  }

  // Attendee filter
  if (attendee) {
    if (query.$and) {
      query.$and.push({ attendees: attendee });
    } else {
      query.attendees = attendee;
    }
  }

  // Priority filter
  if (priority && priority !== "all") {
    if (query.$and) {
      query.$and.push({ priority });
    } else {
      query.priority = priority;
    }
  }

  // Status filter
  if (status && status !== "all") {
    if (query.$and) {
      query.$and.push({ status });
    } else {
      query.status = status;
    }
  }

  // Visibility filter
  if (visibility && visibility !== "all") {
    if (query.$and) {
      query.$and.push({ visibility });
    } else {
      query.visibility = visibility;
    }
  }

  // Search filter - needs to be combined with existing conditions
  if (search) {
    const searchConditions = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ],
    };

    // If we have $and already, add search to it
    if (query.$and) {
      query.$and.push(searchConditions);
    } else if (query.$or) {
      // Combine with existing $or using $and
      query.$and = [{ $or: query.$or }, searchConditions];
      delete query.$or;
    } else {
      Object.assign(query, searchConditions);
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  // After querying, filter events based on type-specific rules
  let fetchedEvents = await CalendarEvent.find(query)
    .populate("createdBy", "name email avatar")
    .populate("attendees", "name email avatar")
    .populate("relatedEntity.id")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Use fetched events directly
  const allEvents = fetchedEvents;

  // Additional filtering for custom events
  const filteredEvents = allEvents.filter((event) => {
    if (event.type === "custom") {
      // Custom events: Only visible to owner, admin, manager, and attendees
      if (isOwnerAdminManager) {
        return true;
      }
      // Check if user is an attendee or creator
      const isAttendee = event.attendees?.some(
        (attendee) =>
          (attendee._id || attendee).toString() === req.user._id.toString()
      );
      const isCreator =
        event.createdBy?._id?.toString() === req.user._id.toString();
      return isAttendee || isCreator;
    }
    return true;
  });

  // Sort combined events
  filteredEvents.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const total = await CalendarEvent.countDocuments(query);

  res.json({
    success: true,
    data: filteredEvents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// Get aggregated events from all CRM entities
export const getAggregatedEvents = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate, types = "all" } = req.query;

  // Calculate date range for the current view
  const now = new Date();
  let queryStartDate, queryEndDate;

  if (startDate && endDate) {
    // Parse dates as local dates to avoid timezone issues
    queryStartDate = new Date(startDate + "T00:00:00");
    queryEndDate = new Date(endDate + "T23:59:59");
  } else {
    // Default to current month
    queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    queryEndDate.setHours(23, 59, 59, 999);
  }

  const events = [];
  const userId = req.user._id;

  // Get user's project role
  const userProjectRole = req.user.getProjectRole(projectId);
  const isOwnerAdminManager = ["owner", "admin", "manager"].includes(
    userProjectRole
  );

  // Get tasks
  if (types === "all" || types.includes("task")) {
    const taskQuery = {
      project: projectId,
      dueDate: {
        $gte: queryStartDate,
        $lte: queryEndDate,
      },
    };

    // Filter tasks: Only show to owner, admin, manager, and assigned users
    if (!isOwnerAdminManager) {
      taskQuery.assignedTo = userId;
    }

    const tasks = await Task.find(taskQuery)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .lean();

    tasks.forEach((task) => {
      if (task.dueDate) {
        events.push({
          _id: `task_${task._id}`,
          title: task.title,
          description: task.description,
          type: "task",
          startDate: task.dueDate,
          endDate: task.dueDate,
          allDay: true,
          priority: task.priority,
          status: task.status,
          assignedTo: task.assignedTo,
          createdBy: task.createdBy,
          relatedEntity: {
            type: "task",
            id: task._id,
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        });
      }
    });
  }

  // Get deals
  if (types === "all" || types.includes("deal")) {
    const dealQuery = {
      projectId: projectId,
      expectedCloseDate: {
        $gte: queryStartDate,
        $lte: queryEndDate,
      },
    };

    // Filter deals: Only show to owner, admin, manager, and assigned users
    if (!isOwnerAdminManager) {
      dealQuery.assignedTo = userId;
    }

    const deals = await Deal.find(dealQuery)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("customer", "name email")
      .lean();

    deals.forEach((deal) => {
      if (deal.expectedCloseDate) {
        events.push({
          _id: `deal_${deal._id}`,
          title: `Deal: ${deal.name}`,
          description: `Value: $${deal.value?.toLocaleString() || "0"}`,
          type: "deal",
          startDate: deal.expectedCloseDate,
          endDate: deal.expectedCloseDate,
          allDay: true,
          priority: deal.priority,
          status: deal.status,
          assignedTo: deal.assignedTo,
          createdBy: deal.createdBy,
          relatedEntity: {
            type: "deal",
            id: deal._id,
          },
          createdAt: deal.createdAt,
          updatedAt: deal.updatedAt,
        });
      }
    });
  }

  // Get customer events (birthdays, anniversaries, etc.)
  if (types === "all" || types.includes("customer")) {
    const customerQuery = {
      project: projectId,
      $or: [
        {
          dateOfBirth: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
        {
          anniversaryDate: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      ],
    };

    const customers = await Customer.find(customerQuery)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .lean();

    customers.forEach((customer) => {
      if (customer.dateOfBirth) {
        events.push({
          _id: `customer_birthday_${customer._id}`,
          title: `${customer.firstName} ${customer.lastName}'s Birthday`,
          description: `Customer birthday`,
          type: "customer",
          startDate: customer.dateOfBirth,
          endDate: customer.dateOfBirth,
          allDay: true,
          priority: "medium",
          status: "active",
          assignedTo: customer.assignedTo,
          createdBy: customer.createdBy,
          relatedEntity: {
            type: "customer",
            id: customer._id,
          },
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        });
      }

      if (customer.anniversaryDate) {
        events.push({
          _id: `customer_anniversary_${customer._id}`,
          title: `${customer.firstName} ${customer.lastName}'s Anniversary`,
          description: `Customer anniversary`,
          type: "customer",
          startDate: customer.anniversaryDate,
          endDate: customer.anniversaryDate,
          allDay: true,
          priority: "medium",
          status: "active",
          assignedTo: customer.assignedTo,
          createdBy: customer.createdBy,
          relatedEntity: {
            type: "customer",
            id: customer._id,
          },
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        });
      }
    });
  }

  // Get company events
  if (types === "all" || types.includes("company")) {
    const companyQuery = {
      project: projectId,
      $or: [
        {
          foundedDate: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
        {
          anniversaryDate: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      ],
    };

    const companies = await Company.find(companyQuery)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .lean();

    companies.forEach((company) => {
      if (company.foundedDate) {
        events.push({
          _id: `company_founded_${company._id}`,
          title: `${company.name} Founded`,
          description: `Company founded date`,
          type: "company",
          startDate: company.foundedDate,
          endDate: company.foundedDate,
          allDay: true,
          priority: "low",
          status: "active",
          assignedTo: company.assignedTo,
          createdBy: company.createdBy,
          relatedEntity: {
            type: "company",
            id: company._id,
          },
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        });
      }

      if (company.anniversaryDate) {
        events.push({
          _id: `company_anniversary_${company._id}`,
          title: `${company.name} Anniversary`,
          description: `Company anniversary`,
          type: "company",
          startDate: company.anniversaryDate,
          endDate: company.anniversaryDate,
          allDay: true,
          priority: "medium",
          status: "active",
          assignedTo: company.assignedTo,
          createdBy: company.createdBy,
          relatedEntity: {
            type: "company",
            id: company._id,
          },
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        });
      }
    });
  }

  // Get lead events
  if (types === "all" || types.includes("lead")) {
    const leadQuery = {
      project: projectId,
      followUpDate: {
        $gte: queryStartDate,
        $lte: queryEndDate,
      },
    };

    const leads = await Lead.find(leadQuery)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .lean();

    leads.forEach((lead) => {
      if (lead.followUpDate) {
        events.push({
          _id: `lead_followup_${lead._id}`,
          title: `Follow up: ${lead.firstName} ${lead.lastName}`,
          description: `Lead follow-up`,
          type: "lead",
          startDate: lead.followUpDate,
          endDate: lead.followUpDate,
          allDay: true,
          priority: lead.priority,
          status: lead.status,
          assignedTo: lead.assignedTo,
          createdBy: lead.createdBy,
          relatedEntity: {
            type: "lead",
            id: lead._id,
          },
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
        });
      }
    });
  }

  // Get custom calendar events - but only if types includes 'custom' or is 'all'
  // This prevents duplicate events since custom events are already fetched via getCalendarEvents
  if (types === "all" || types.includes("custom")) {
    const customEvents = await CalendarEvent.find({
      project: projectId,
      startDate: {
        $gte: queryStartDate,
        $lte: queryEndDate,
      },
    })
      .populate("createdBy", "name email")
      .populate("attendees", "name email")
      .lean();

    customEvents.forEach((event) => {
      events.push({
        ...event,
        type: "custom",
      });
    });
  }

  // Sort events by start date
  events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  res.json({
    success: true,
    data: events,
    total: events.length,
  });
});

// Create a new calendar event
export const createCalendarEvent = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  const eventData = {
    ...req.body,
    project: projectId,
    createdBy: req.user._id,
  };

  const event = await CalendarEvent.create(eventData);
  await event.populate("createdBy", "name email");
  await event.populate("attendees", "name email");

  // Log activity
  try {
    const ActivityService = (await import("../utils/activityService.js"))
      .default;
    await ActivityService.logEventCreated(event, req.user);
  } catch (error) {
    console.error("Failed to log calendar event activity:", error);
  }

  // Create notification
  try {
    const notificationService = (
      await import("../utils/notificationService.js")
    ).default;
    await notificationService.createCalendarEventNotification(
      "event_created",
      event,
      projectId,
      req.user._id,
      [req.user._id]
    );
  } catch (error) {
    console.error("Failed to create calendar event notification:", error);
  }

  // Send emails to attendees
  try {
    const project = await import("../models/Project.model.js").then((m) =>
      m.default.findById(projectId).select("name")
    );
    const projectName = project?.name || "CRM";
    const eventUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/crm/${projectId}/calendar/${event._id}`;

    if (event.attendees && event.attendees.length > 0) {
      for (const attendee of event.attendees) {
        if (
          attendee.email &&
          attendee._id.toString() !== req.user._id.toString()
        ) {
          await sendEventInvitationEmail(
            attendee.email,
            event.title,
            projectName,
            req.user.name,
            eventUrl,
            event.startDate,
            event.startTime,
            event.location,
            projectId
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to send event invitation emails:", error);
  }

  res.status(201).json({
    success: true,
    data: event,
    message: "Calendar event created successfully",
  });
});

// Update a calendar event
export const updateCalendarEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const eventData = req.body;

  // Get old event data for tracking changes
  const oldEvent = await CalendarEvent.findById(eventId);
  if (!oldEvent) {
    throw new AppError("Calendar event not found", 404);
  }

  const event = await CalendarEvent.findByIdAndUpdate(eventId, eventData, {
    new: true,
    runValidators: true,
  })
    .populate("createdBy", "name email")
    .populate("attendees", "name email")
    .populate("project", "name");

  if (!event) {
    throw new AppError("Calendar event not found", 404);
  }

  // Track changes and log activities
  try {
    const activityHelper = (await import("../utils/activityHelper.js")).default;
    const oldData = oldEvent.toObject();
    const newData = event.toObject();
    await activityHelper.trackEntityChanges(
      "CalendarEvent",
      event,
      oldData,
      newData,
      req.user
    );
  } catch (error) {
    console.error("Failed to log calendar event activity:", error);
  }

  // Create notification
  try {
    const notificationService = (
      await import("../utils/notificationService.js")
    ).default;
    await notificationService.createCalendarEventNotification(
      "event_updated",
      event,
      event.project._id || event.project,
      req.user._id,
      [req.user._id]
    );
  } catch (error) {
    console.error("Failed to create calendar event notification:", error);
  }

  // Send emails to attendees about the update
  try {
    const projectName = event.project?.name || "CRM";
    const projectId = event.project._id || event.project;
    const eventUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/crm/${projectId}/calendar/${event._id}`;

    // Track changes for email
    const changes = {};
    if (oldEvent.title !== event.title)
      changes.title = `${oldEvent.title} → ${event.title}`;
    if (oldEvent.startDate.toString() !== event.startDate.toString())
      changes.date = "Updated";
    if (oldEvent.startTime !== event.startTime) changes.time = "Updated";
    if (oldEvent.location !== event.location) changes.location = "Updated";

    if (
      event.attendees &&
      event.attendees.length > 0 &&
      Object.keys(changes).length > 0
    ) {
      for (const attendee of event.attendees) {
        if (
          attendee.email &&
          attendee._id.toString() !== req.user._id.toString()
        ) {
          await sendEventUpdatedEmail(
            attendee.email,
            event.title,
            projectName,
            req.user.name,
            eventUrl,
            changes,
            projectId
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to send event update emails:", error);
  }

  res.json({
    success: true,
    event,
  });
});

// Delete a calendar event
export const deleteCalendarEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await CalendarEvent.findById(eventId).populate(
    "project",
    "name"
  );

  if (!event) {
    throw new AppError("Calendar event not found", 404);
  }

  const projectId = event.project._id || event.project;
  const eventTitle = event.title;

  // Log activity before deletion
  try {
    const ActivityService = (await import("../utils/activityService.js"))
      .default;
    await ActivityService.logEventDeleted(event, req.user);
  } catch (error) {
    console.error("Failed to log calendar event activity:", error);
  }

  await CalendarEvent.findByIdAndDelete(eventId);

  // Send emails to attendees about cancellation
  try {
    const projectName = event.project?.name || "CRM";
    const eventUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/crm/${projectId}/calendar`;

    if (event.attendees && event.attendees.length > 0) {
      for (const attendee of event.attendees) {
        if (
          attendee.email &&
          attendee._id.toString() !== req.user._id.toString()
        ) {
          await sendEventCancelledEmail(
            attendee.email,
            eventTitle,
            projectName,
            req.user.name,
            eventUrl,
            projectId
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to send event cancellation emails:", error);
  }

  // Create notification
  try {
    const notificationService = (
      await import("../utils/notificationService.js")
    ).default;
    // Create a minimal event object for notification
    const eventForNotification = {
      _id: eventId,
      title: eventTitle,
      attendees: event.attendees,
    };
    await notificationService.createCalendarEventNotification(
      "event_deleted",
      eventForNotification,
      projectId,
      req.user._id,
      [req.user._id]
    );
  } catch (error) {
    console.error("Failed to create calendar event notification:", error);
  }

  res.json({
    success: true,
    message: "Calendar event deleted successfully",
  });
});

// Get a single calendar event
export const getCalendarEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await CalendarEvent.findById(eventId)
    .populate("createdBy", "name email")
    .populate("attendees", "name email");

  if (!event) {
    throw new AppError("Calendar event not found", 404);
  }

  res.json({
    success: true,
    event,
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
      .populate("createdBy", "name email")
      .populate("attendees", "name email")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    CalendarEvent.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
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
      $lte: endDate,
    },
  })
    .populate("createdBy", "name email")
    .populate("attendees", "name email")
    .sort({ startDate: 1 });

  res.json({
    success: true,
    data: events,
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
    status: { $nin: ["completed", "cancelled"] },
  })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .lean();

  const events = overdueTasks.map((task) => ({
    _id: `task_${task._id}`,
    title: task.title,
    description: task.description,
    type: "task",
    startDate: task.dueDate,
    endDate: task.dueDate,
    allDay: true,
    priority: task.priority,
    status: "overdue",
    assignedTo: task.assignedTo,
    createdBy: task.createdBy,
    relatedEntity: {
      type: "task",
      id: task._id,
    },
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));

  res.json({
    success: true,
    data: events,
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
    message: `${result.modifiedCount} events updated successfully`,
  });
});

// Bulk delete events
export const bulkDeleteEvents = asyncHandler(async (req, res) => {
  const { eventIds } = req.body;

  const result = await CalendarEvent.deleteMany({
    _id: { $in: eventIds },
  });

  res.json({
    success: true,
    message: `${result.deletedCount} events deleted successfully`,
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
    eventsThisMonth,
  ] = await Promise.all([
    CalendarEvent.countDocuments(baseQuery),
    CalendarEvent.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    CalendarEvent.countDocuments({
      ...baseQuery,
      startDate: { $gte: new Date() },
    }),
    CalendarEvent.countDocuments({
      ...baseQuery,
      startDate: { $lt: new Date() },
    }),
    CalendarEvent.countDocuments({
      ...baseQuery,
      startDate: {
        $gte: new Date(
          new Date().setDate(new Date().getDate() - new Date().getDay())
        ),
        $lt: new Date(
          new Date().setDate(new Date().getDate() - new Date().getDay() + 7)
        ),
      },
    }),
    CalendarEvent.countDocuments({
      ...baseQuery,
      startDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    }),
  ]);

  res.json({
    success: true,
    stats: {
      totalEvents,
      eventsByType,
      upcomingEvents,
      overdueEvents,
      eventsThisWeek,
      eventsThisMonth,
    },
  });
});

// Check for event conflicts
export const checkEventConflicts = asyncHandler(async (req, res) => {
  const { startDate, endDate, attendees, excludeEventId } = req.body;

  const conflictQuery = {
    $or: [
      {
        startDate: { $lt: new Date(endDate) },
        endDate: { $gt: new Date(startDate) },
      },
    ],
  };

  if (excludeEventId) {
    conflictQuery._id = { $ne: excludeEventId };
  }

  if (attendees && attendees.length > 0) {
    conflictQuery.attendees = { $in: attendees };
  }

  const conflicts = await CalendarEvent.find(conflictQuery)
    .populate("attendees", "name email")
    .populate("createdBy", "name email");

  res.json({
    success: true,
    conflicts,
  });
});

// Get calendar settings
export const getCalendarSettings = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // For now, return default settings
  // In the future, this could be stored in a separate settings collection
  const settings = {
    workingHours: {
      start: "09:00",
      end: "17:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    timezone: "UTC",
    defaultEventDuration: 60,
    reminderSettings: {
      defaultReminders: [{ type: "email", time: 15, unit: "minutes" }],
    },
  };

  res.json({
    success: true,
    settings,
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
    settings,
  });
});

// Respond to calendar event
export const respondToEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { response } = req.body; // 'accepted', 'declined', 'tentative'
  const userId = req.user._id;

  if (!["accepted", "declined", "tentative"].includes(response)) {
    return res.status(400).json({
      success: false,
      message: "Invalid response. Must be accepted, declined, or tentative",
    });
  }

  const event = await CalendarEvent.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // Check if user is an attendee (handle both ObjectId and populated objects)
  const isAttendee = event.attendees.some(
    (attendee) =>
      (attendee._id ? attendee._id.toString() : attendee.toString()) ===
      userId.toString()
  );
  if (!isAttendee) {
    throw new ForbiddenError("You are not an attendee of this event");
  }

  // Update or add response
  const existingResponseIndex = event.responses.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingResponseIndex >= 0) {
    event.responses[existingResponseIndex].response = response;
    event.responses[existingResponseIndex].respondedAt = new Date();
  } else {
    event.responses.push({
      user: userId,
      response: response,
      respondedAt: new Date(),
    });
  }

  await event.save();
  await event.populate("responses.user", "name email");

  res.json({
    success: true,
    message: "Response recorded successfully",
    event,
  });
});

// Get event responses
export const getEventResponses = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await CalendarEvent.findById(eventId)
    .populate("responses.user", "name email")
    .populate("attendees", "name email");

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  res.json({
    success: true,
    responses: event.responses,
    attendees: event.attendees,
  });
});

// Stop reminder for an event
export const stopEventReminder = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { reminderIndex } = req.body;

  const event = await CalendarEvent.findById(eventId);
  if (!event) {
    throw new AppError("Calendar event not found", 404);
  }

  if (reminderIndex === undefined || reminderIndex === null) {
    // Stop all reminders
    event.reminders.forEach((reminder) => {
      reminder.stopped = true;
      reminder.stoppedAt = new Date();
      reminder.enabled = false;
    });
  } else {
    // Stop specific reminder
    if (event.reminders[reminderIndex]) {
      event.reminders[reminderIndex].stopped = true;
      event.reminders[reminderIndex].stoppedAt = new Date();
      event.reminders[reminderIndex].enabled = false;
    } else {
      throw new AppError("Reminder not found", 404);
    }
  }

  await event.save();

  res.json({
    success: true,
    message: "Reminder stopped successfully",
    event,
  });
});
