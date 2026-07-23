/**
 * Email Service for CRM Platform
 *
 * This service handles all email sending functionality using centralized templates.
 * It integrates with CRM settings for email configuration and respects user preferences.
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import emailTemplates from "./emailTemplates.js";
import CrmSettings from "../models/CrmSettings.model.js";

dotenv.config();

/**
 * Create email transporter based on environment and settings
 */
const createTransporter = async (projectId = null) => {
  let emailConfig = {
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  // Try to get project-specific email settings
  if (projectId) {
    try {
      const settings = await CrmSettings.findOne({ projectId });
      if (settings?.email?.fromEmail) {
        emailConfig.auth.user = settings.email.fromEmail;
        // Note: In production, you'd want to store email password securely
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
    }
  }

  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport(emailConfig);
  } else {
    // For development, use Gmail or Ethereal Email
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "test@example.com",
        pass: process.env.EMAIL_PASSWORD || "testpass",
      },
    });
  }
};

/**
 * Get email signature from project settings
 */
const getEmailSignature = async (projectId) => {
  if (!projectId) return "";

  try {
    const settings = await CrmSettings.findOne({ projectId });
    return settings?.email?.emailSignature || "";
  } catch (error) {
    console.error("Error fetching email signature:", error);
    return "";
  }
};

/**
 * Get CRM name from project settings
 */
const getCrmName = async (projectId) => {
  if (!projectId) return process.env.CRM_NAME || "CRM Platform";

  try {
    const settings = await CrmSettings.findOne({ projectId });
    return settings?.general?.crmName || process.env.CRM_NAME || "CRM Platform";
  } catch (error) {
    console.error("Error fetching CRM name:", error);
    return process.env.CRM_NAME || "CRM Platform";
  }
};

/**
 * Get from name and email from settings
 */
const getFromInfo = async (projectId) => {
  const defaultFrom = process.env.EMAIL_FROM || "noreply@crmplatform.com";
  const defaultFromName = process.env.EMAIL_FROM_NAME || "CRM Platform";

  if (!projectId) {
    return {
      from: defaultFrom,
      fromName: defaultFromName,
    };
  }

  try {
    const settings = await CrmSettings.findOne({ projectId });
    return {
      from: settings?.email?.fromEmail || defaultFrom,
      fromName: settings?.email?.fromName || defaultFromName,
    };
  } catch (error) {
    console.error("Error fetching from info:", error);
    return {
      from: defaultFrom,
      fromName: defaultFromName,
    };
  }
};

/**
 * Check if email notifications are enabled for a specific event type
 */
const isEmailNotificationEnabled = async (projectId, eventType) => {
  if (!projectId) return true; // Default to enabled if no project

  try {
    const settings = await CrmSettings.findOne({ projectId });
    if (!settings?.notifications?.emailNotifications?.enabled) {
      return false;
    }

    // Check specific event type settings
    const eventTypeMap = {
      task_assigned: "taskAssigned",
      task_due: "taskDue",
      task_overdue: "taskOverdue",
      event_reminder: "eventReminder",
      new_lead: "newLead",
      new_customer: "newCustomer",
      new_deal: "newDeal",
      deal_update: "dealUpdate",
    };

    const settingKey = eventTypeMap[eventType];
    if (
      settingKey &&
      settings.notifications.emailNotifications[settingKey] === false
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking email notification settings:", error);
    return true; // Default to enabled on error
  }
};

/**
 * Send email using template
 */
export const sendEmail = async (
  to,
  templateName,
  templateData = {},
  projectId = null
) => {
  try {
    // Check if email notifications are enabled
    if (projectId && templateData.eventType) {
      const enabled = await isEmailNotificationEnabled(
        projectId,
        templateData.eventType
      );
      if (!enabled) {
        console.log(
          `Email notification disabled for ${templateData.eventType} in project ${projectId}`
        );
        return { success: false, reason: "disabled" };
      }
    }

    // Get template
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Get CRM name and signature
    const crmName = await getCrmName(projectId);
    const signature = await getEmailSignature(projectId);

    // Add crmName to template data
    const templateDataWithCrm = { ...templateData, crmName };

    // Generate email content - templates are functions that take parameters in specific order
    // Map template data to parameters based on template name
    const templateParamMap = {
      welcome: ["name", "verificationUrl", "crmName"],
      passwordReset: ["name", "resetUrl", "crmName"],
      passwordChanged: ["name", "crmName"],
      emailVerified: ["name", "crmName"],
      projectInvitation: [
        "invitationUrl",
        "projectName",
        "inviterName",
        "message",
        "crmName",
      ],
      taskAssigned: [
        "taskTitle",
        "projectName",
        "assignerName",
        "taskUrl",
        "dueDate",
        "priority",
        "crmName",
      ],
      taskUpdated: [
        "taskTitle",
        "projectName",
        "updaterName",
        "taskUrl",
        "changes",
        "crmName",
      ],
      taskCompleted: [
        "taskTitle",
        "projectName",
        "completerName",
        "taskUrl",
        "crmName",
      ],
      taskOverdue: [
        "taskTitle",
        "projectName",
        "taskUrl",
        "dueDate",
        "crmName",
      ],
      taskReminder: [
        "taskTitle",
        "projectName",
        "taskUrl",
        "dueDate",
        "reminderTime",
        "crmName",
      ],
      eventInvitation: [
        "eventTitle",
        "projectName",
        "inviterName",
        "eventUrl",
        "startDate",
        "startTime",
        "location",
        "crmName",
      ],
      eventUpdated: [
        "eventTitle",
        "projectName",
        "updaterName",
        "eventUrl",
        "changes",
        "crmName",
      ],
      eventReminder: [
        "eventTitle",
        "projectName",
        "eventUrl",
        "startDate",
        "startTime",
        "location",
        "reminderTime",
        "crmName",
      ],
      eventCancelled: [
        "eventTitle",
        "projectName",
        "cancellerName",
        "eventUrl",
        "crmName",
      ],
      leadAssigned: [
        "leadName",
        "projectName",
        "assignerName",
        "leadUrl",
        "crmName",
      ],
      leadConverted: [
        "leadName",
        "projectName",
        "converterName",
        "customerUrl",
        "crmName",
      ],
      dealAssigned: [
        "dealName",
        "projectName",
        "assignerName",
        "dealUrl",
        "dealValue",
        "crmName",
      ],
      dealWon: [
        "dealName",
        "projectName",
        "winnerName",
        "dealUrl",
        "dealValue",
        "crmName",
      ],
      dealLost: [
        "dealName",
        "projectName",
        "loserName",
        "dealUrl",
        "reason",
        "crmName",
      ],
      customerAssigned: [
        "customerName",
        "projectName",
        "assignerName",
        "customerUrl",
        "crmName",
      ],
      companyAssigned: [
        "companyName",
        "projectName",
        "assignerName",
        "companyUrl",
        "crmName",
      ],
      mentionedInComment: [
        "commenterName",
        "resourceType",
        "resourceName",
        "projectName",
        "commentUrl",
        "commentText",
        "crmName",
      ],
    };

    const paramOrder =
      templateParamMap[templateName] || Object.keys(templateDataWithCrm);
    const templateParams = paramOrder
      .map((key) => templateDataWithCrm[key])
      .filter((val) => val !== undefined);
    const emailContent = template(...templateParams);

    // Replace placeholders in HTML
    let htmlContent = emailContent.html;
    if (signature) {
      htmlContent = htmlContent.replace(/\{\{SIGNATURE\}\}/g, signature);
    }
    htmlContent = htmlContent.replace(/\{\{CRM_NAME\}\}/g, crmName);

    // Get from info
    const { from, fromName } = await getFromInfo(projectId);

    // Create transporter
    const transporter = await createTransporter(projectId);

    // Prepare mail options
    const mailOptions = {
      from: `"${fromName}" <${from}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject: emailContent.subject,
      html: htmlContent,
    };

    // Add reply-to if configured
    if (projectId) {
      try {
        const settings = await CrmSettings.findOne({ projectId });
        if (settings?.email?.replyToEmail) {
          mailOptions.replyTo = settings.email.replyToEmail;
        }
      } catch (error) {
        // Ignore error
      }
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === "development") {
      console.log("Email sent:", info.messageId);
      if (nodemailer.getTestMessageUrl) {
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
      }
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    // Don't throw error - email failures shouldn't break the application
    return { success: false, error: error.message };
  }
};

// ==================== AUTHENTICATION EMAILS ====================

export const sendWelcomeEmail = async (email, name, verificationUrl) => {
  return sendEmail(email, "welcome", { name, verificationUrl });
};

export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  return sendEmail(email, "passwordReset", { name, resetUrl });
};

export const sendPasswordChangedEmail = async (email, name) => {
  return sendEmail(email, "passwordChanged", { name });
};

export const sendEmailVerifiedEmail = async (email, name) => {
  return sendEmail(email, "emailVerified", { name });
};

// ==================== PROJECT INVITATIONS ====================

export const sendProjectInvitationEmail = async (
  email,
  invitationUrl,
  projectName,
  inviterName,
  message = "",
  projectId = null
) => {
  return sendEmail(
    email,
    "projectInvitation",
    {
      invitationUrl,
      projectName,
      inviterName,
      message,
    },
    projectId
  );
};

// ==================== TASK EMAILS ====================

export const sendTaskAssignedEmail = async (
  userEmail,
  taskTitle,
  projectName,
  assignerName,
  taskUrl,
  dueDate = null,
  priority = null,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "taskAssigned",
    {
      taskTitle,
      projectName,
      assignerName,
      taskUrl,
      dueDate,
      priority,
      eventType: "task_assigned",
    },
    projectId
  );
};

export const sendTaskUpdatedEmail = async (
  userEmail,
  taskTitle,
  projectName,
  updaterName,
  taskUrl,
  changes = null,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "taskUpdated",
    {
      taskTitle,
      projectName,
      updaterName,
      taskUrl,
      changes,
      eventType: "task_update",
    },
    projectId
  );
};

export const sendTaskCompletedEmail = async (
  userEmail,
  taskTitle,
  projectName,
  completerName,
  taskUrl,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "taskCompleted",
    {
      taskTitle,
      projectName,
      completerName,
      taskUrl,
      eventType: "task_completed",
    },
    projectId
  );
};

export const sendTaskOverdueEmail = async (
  userEmail,
  taskTitle,
  projectName,
  taskUrl,
  dueDate,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "taskOverdue",
    {
      taskTitle,
      projectName,
      taskUrl,
      dueDate,
      eventType: "task_overdue",
    },
    projectId
  );
};

export const sendTaskReminderEmail = async (
  userEmail,
  taskTitle,
  projectName,
  taskUrl,
  dueDate,
  reminderTime,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "taskReminder",
    {
      taskTitle,
      projectName,
      taskUrl,
      dueDate,
      reminderTime,
      eventType: "task_due",
    },
    projectId
  );
};

// ==================== CALENDAR EVENT EMAILS ====================

export const sendEventInvitationEmail = async (
  userEmail,
  eventTitle,
  projectName,
  inviterName,
  eventUrl,
  startDate,
  startTime = null,
  location = null,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "eventInvitation",
    {
      eventTitle,
      projectName,
      inviterName,
      eventUrl,
      startDate,
      startTime,
      location,
      eventType: "event_created",
    },
    projectId
  );
};

export const sendEventUpdatedEmail = async (
  userEmail,
  eventTitle,
  projectName,
  updaterName,
  eventUrl,
  changes = null,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "eventUpdated",
    {
      eventTitle,
      projectName,
      updaterName,
      eventUrl,
      changes,
      eventType: "event_updated",
    },
    projectId
  );
};

export const sendEventReminderEmail = async (
  userEmail,
  eventTitle,
  projectName,
  eventUrl,
  startDate,
  startTime = null,
  location = null,
  reminderTime = null,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "eventReminder",
    {
      eventTitle,
      projectName,
      eventUrl,
      startDate,
      startTime,
      location,
      reminderTime,
      eventType: "event_reminder",
    },
    projectId
  );
};

export const sendEventCancelledEmail = async (
  userEmail,
  eventTitle,
  projectName,
  cancellerName,
  eventUrl,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "eventCancelled",
    {
      eventTitle,
      projectName,
      cancellerName,
      eventUrl,
      eventType: "event_cancelled",
    },
    projectId
  );
};

// ==================== LEAD EMAILS ====================

export const sendLeadAssignedEmail = async (
  userEmail,
  leadName,
  projectName,
  assignerName,
  leadUrl,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "leadAssigned",
    {
      leadName,
      projectName,
      assignerName,
      leadUrl,
      eventType: "new_lead",
    },
    projectId
  );
};

export const sendLeadConvertedEmail = async (
  userEmail,
  leadName,
  projectName,
  converterName,
  customerUrl,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "leadConverted",
    {
      leadName,
      projectName,
      converterName,
      customerUrl,
      eventType: "lead_converted",
    },
    projectId
  );
};

// ==================== DEAL EMAILS ====================

export const sendDealAssignedEmail = async (
  userEmail,
  dealName,
  projectName,
  assignerName,
  dealUrl,
  dealValue = null,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "dealAssigned",
    {
      dealName,
      projectName,
      assignerName,
      dealUrl,
      dealValue,
      eventType: "new_deal",
    },
    projectId
  );
};

export const sendDealWonEmail = async (
  userEmail,
  dealName,
  projectName,
  winnerName,
  dealUrl,
  dealValue = null,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "dealWon",
    {
      dealName,
      projectName,
      winnerName,
      dealUrl,
      dealValue,
      eventType: "deal_won",
    },
    projectId
  );
};

export const sendDealLostEmail = async (
  userEmail,
  dealName,
  projectName,
  loserName,
  dealUrl,
  reason = null,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "dealLost",
    {
      dealName,
      projectName,
      loserName,
      dealUrl,
      reason,
      eventType: "deal_lost",
    },
    projectId
  );
};

// ==================== CUSTOMER EMAILS ====================

export const sendCustomerAssignedEmail = async (
  userEmail,
  customerName,
  projectName,
  assignerName,
  customerUrl,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "customerAssigned",
    {
      customerName,
      projectName,
      assignerName,
      customerUrl,
      eventType: "new_customer",
    },
    projectId
  );
};

// ==================== COMPANY EMAILS ====================

export const sendCompanyAssignedEmail = async (
  userEmail,
  companyName,
  projectName,
  assignerName,
  companyUrl,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "companyAssigned",
    {
      companyName,
      projectName,
      assignerName,
      companyUrl,
      eventType: "company_assigned",
    },
    projectId
  );
};

// ==================== COMMENT/MENTION EMAILS ====================

export const sendMentionedInCommentEmail = async (
  userEmail,
  commenterName,
  resourceType,
  resourceName,
  projectName,
  commentUrl,
  commentText,
  projectId = null
) => {
  return sendEmail(
    userEmail,
    "mentionedInComment",
    {
      commenterName,
      resourceType,
      resourceName,
      projectName,
      commentUrl,
      commentText,
      eventType: "mention",
    },
    projectId
  );
};

// ==================== INVOICE EMAILS ====================

export const sendInvoiceEmail = async (
  customerEmail,
  invoiceNumber,
  invoiceAmount,
  currency,
  dueDate,
  invoiceUrl,
  projectName,
  projectId = null
) => {
  return sendEmail(
    customerEmail,
    "invoice",
    {
      invoiceNumber,
      invoiceAmount,
      currency,
      dueDate: new Date(dueDate).toLocaleDateString(),
      invoiceUrl,
      projectName,
      eventType: "invoice_sent",
    },
    projectId
  );
};

// ==================== RECEIPT EMAILS ====================

export const sendReceiptEmail = async (
  customerEmail,
  receiptNumber,
  receiptAmount,
  currency,
  paymentDate,
  paymentMethod,
  receiptUrl,
  projectName,
  projectId = null
) => {
  return sendEmail(
    customerEmail,
    "receipt",
    {
      receiptNumber,
      receiptAmount,
      currency,
      paymentDate: new Date(paymentDate).toLocaleDateString(),
      paymentMethod,
      receiptUrl,
      projectName,
      eventType: "receipt_sent",
    },
    projectId
  );
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendEmailVerifiedEmail,
  sendProjectInvitationEmail,
  sendTaskAssignedEmail,
  sendTaskUpdatedEmail,
  sendTaskCompletedEmail,
  sendTaskOverdueEmail,
  sendTaskReminderEmail,
  sendEventInvitationEmail,
  sendEventUpdatedEmail,
  sendEventReminderEmail,
  sendEventCancelledEmail,
  sendLeadAssignedEmail,
  sendLeadConvertedEmail,
  sendDealAssignedEmail,
  sendDealWonEmail,
  sendDealLostEmail,
  sendCustomerAssignedEmail,
  sendCompanyAssignedEmail,
  sendMentionedInCommentEmail,
  sendInvoiceEmail,
  sendReceiptEmail,
};
