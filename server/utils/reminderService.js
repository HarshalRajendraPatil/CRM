import CalendarEvent from "../models/CalendarEvent.model.js";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";
import {
  sendEventReminderEmail as sendEventReminderEmailService,
  sendTaskReminderEmail as sendTaskReminderEmailService,
} from "./emailService.js";

/**
 * Calculate reminder time for calendar event
 */
const calculateReminderTime = (event, reminder) => {
  const eventDate = new Date(event.startDate);

  // If event has startTime, combine it with startDate
  if (event.startTime && !event.allDay) {
    const [hours, minutes] = event.startTime.split(":").map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
  } else {
    eventDate.setHours(0, 0, 0, 0);
  }

  const reminderTime = new Date(eventDate);

  // Calculate reminder time based on unit
  if (reminder.unit === "minutes") {
    reminderTime.setMinutes(reminderTime.getMinutes() - reminder.time);
  } else if (reminder.unit === "hours") {
    reminderTime.setHours(reminderTime.getHours() - reminder.time);
  } else if (reminder.unit === "days") {
    reminderTime.setDate(reminderTime.getDate() - reminder.time);
  }

  return reminderTime;
};

/**
 * Calculate reminder time for task
 */
const calculateTaskReminderTime = (task, reminder) => {
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const reminderTime = new Date(dueDate);

  if (reminder.trigger === "before_due") {
    reminderTime.setMinutes(reminderTime.getMinutes() - reminder.offset);
  } else if (reminder.trigger === "on_due") {
    // Reminder at due date/time
    reminderTime.setMinutes(reminderTime.getMinutes() + reminder.offset);
  } else if (reminder.trigger === "overdue") {
    // Reminder after due date
    reminderTime.setMinutes(reminderTime.getMinutes() + reminder.offset);
  }

  return reminderTime;
};

/**
 * Send event reminder email
 */
const sendEventReminderEmail = async (event, reminder, user) => {
  try {
    const eventUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/crm/${event.project}/calendar/${event._id}`;
    const project = await import("../models/Project.model.js").then((m) =>
      m.default.findById(event.project).select("name")
    );
    const projectName = project?.name || "CRM";

    await sendEventReminderEmailService(
      user.email,
      event.title,
      projectName,
      eventUrl,
      event.startDate,
      event.startTime,
      event.location,
      reminder.time,
      event.project
    );

    return true;
  } catch (error) {
    console.error("Failed to send event reminder email:", error);
    return false;
  }
};

/**
 * Send task reminder email
 */
const sendTaskReminderEmail = async (task, reminder, user) => {
  try {
    const taskUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/crm/${task.project}/tasks/${task._id}`;
    const project = await import("../models/Project.model.js").then((m) =>
      m.default.findById(task.project).select("name")
    );
    const projectName = project?.name || "CRM";

    await sendTaskReminderEmailService(
      user.email,
      task.title,
      projectName,
      taskUrl,
      task.dueDate,
      reminder.offset,
      task.project
    );

    return true;
  } catch (error) {
    console.error("Failed to send task reminder email:", error);
    return false;
  }
};

/**
 * Process event reminders
 */
export const processEventReminders = async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find events with reminders that need to be sent
    const events = await CalendarEvent.find({
      status: { $ne: "cancelled" },
      "reminders.enabled": true,
      "reminders.stopped": false,
      "reminders.sent": false,
    })
      .populate("attendees", "email name")
      .populate("createdBy", "email name");

    for (const event of events) {
      for (let i = 0; i < event.reminders.length; i++) {
        const reminder = event.reminders[i];

        // Skip if reminder is disabled, stopped, or already sent
        if (!reminder.enabled || reminder.stopped || reminder.sent) {
          continue;
        }

        // Only process email reminders
        if (reminder.type !== "email") {
          continue;
        }

        const reminderTime = calculateReminderTime(event, reminder);

        // Check if reminder time is within the next 5 minutes
        if (reminderTime >= now && reminderTime <= fiveMinutesFromNow) {
          // Send to event creator
          if (event.createdBy && event.createdBy.email) {
            const sent = await sendEventReminderEmail(
              event,
              reminder,
              event.createdBy
            );
            if (sent) {
              event.reminders[i].sent = true;
              event.reminders[i].sentAt = new Date();
            }
          }

          // Send to all attendees
          if (event.attendees && event.attendees.length > 0) {
            for (const attendee of event.attendees) {
              if (
                attendee.email &&
                attendee._id.toString() !== event.createdBy?._id?.toString()
              ) {
                await sendEventReminderEmail(event, reminder, attendee);
              }
            }
          }

          await event.save();
        }
      }
    }

    return { processed: events.length };
  } catch (error) {
    console.error("Error processing event reminders:", error);
    throw error;
  }
};

/**
 * Process task reminders
 */
export const processTaskReminders = async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find tasks with reminders that need to be sent
    const tasks = await Task.find({
      status: { $nin: ["completed", "cancelled"] },
      "reminders.enabled": true,
      "reminders.stopped": false,
      "reminders.sent": false,
    })
      .populate("assignedTo", "email name")
      .populate("createdBy", "email name");

    for (const task of tasks) {
      for (let i = 0; i < task.reminders.length; i++) {
        const reminder = task.reminders[i];

        // Skip if reminder is disabled, stopped, or already sent
        if (!reminder.enabled || reminder.stopped || reminder.sent) {
          continue;
        }

        // Only process email reminders
        if (reminder.type !== "email") {
          continue;
        }

        const reminderTime = calculateTaskReminderTime(task, reminder);

        // Check if reminder time is within the next 5 minutes
        if (reminderTime >= now && reminderTime <= fiveMinutesFromNow) {
          // Send to assigned user
          if (task.assignedTo && task.assignedTo.email) {
            const sent = await sendTaskReminderEmail(
              task,
              reminder,
              task.assignedTo
            );
            if (sent) {
              task.reminders[i].sent = true;
              task.reminders[i].sentAt = new Date();
            }
          }

          // Also send to creator if different from assigned user
          if (
            task.createdBy &&
            task.createdBy.email &&
            task.createdBy._id.toString() !== task.assignedTo?._id?.toString()
          ) {
            await sendTaskReminderEmail(task, reminder, task.createdBy);
          }

          await task.save();
        }
      }
    }

    return { processed: tasks.length };
  } catch (error) {
    console.error("Error processing task reminders:", error);
    throw error;
  }
};

/**
 * Process all reminders (events and tasks)
 */
export const processAllReminders = async () => {
  try {
    const eventResult = await processEventReminders();
    const taskResult = await processTaskReminders();

    return {
      events: eventResult,
      tasks: taskResult,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error processing all reminders:", error);
    throw error;
  }
};

export default {
  processEventReminders,
  processTaskReminders,
  processAllReminders,
};
