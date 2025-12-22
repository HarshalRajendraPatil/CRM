/**
 * Email Templates for CRM Platform
 *
 * This file contains all email templates used throughout the CRM platform.
 * Templates are designed to be professional, responsive, and consistent.
 */

/**
 * Base email template wrapper
 */
const getBaseTemplate = (content, signature = "", crmName = "CRM Platform") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${crmName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                  ${
                    signature
                      ? `<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">${signature}</div>`
                      : ""
                  }
                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
                    <p style="margin: 5px 0;">This is an automated email from ${crmName}.</p>
                    <p style="margin: 5px 0;">Please do not reply to this email.</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Button style helper
 */
const getButtonStyle = (color = "#6366f1") => {
  return `background-color: ${color}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;`;
};

/**
 * Email Templates
 */
export const emailTemplates = {
  // ==================== AUTHENTICATION EMAILS ====================

  welcome: (name, verificationUrl, crmName = "CRM Platform") => ({
    subject: `Welcome to ${crmName} - Verify Your Email`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome to ${crmName}!</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for signing up! To complete your registration and start using our CRM platform, please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="${getButtonStyle(
        "#6366f1"
      )}">Verify Email Address</a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin: 10px 0;">${verificationUrl}</p>
      <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0 0;">This link will expire in 24 hours.</p>
      <p style="color: #9ca3af; font-size: 14px; margin: 10px 0 0 0;">If you didn't create an account, please ignore this email.</p>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  passwordReset: (name, resetUrl, crmName = "CRM Platform") => ({
    subject: `Password Reset Request - ${crmName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="${getButtonStyle(
        "#dc2626"
      )}">Reset Password</a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin: 10px 0;">${resetUrl}</p>
      <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0 0;">This link will expire in 1 hour.</p>
      <p style="color: #9ca3af; font-size: 14px; margin: 10px 0 0 0;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  passwordChanged: (name, crmName = "CRM Platform") => ({
    subject: `Password Changed Successfully - ${crmName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Password Changed Successfully</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Your password has been successfully changed.</p>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">Security Notice</p>
        <p style="color: #78350f; font-size: 14px; margin: 5px 0 0 0;">If you didn't make this change, please contact our support team immediately.</p>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  emailVerified: (name, crmName = "CRM Platform") => ({
    subject: `Email Verified Successfully - ${crmName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Email Verified Successfully!</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Your email has been successfully verified. You can now access all features of our CRM platform.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }" style="${getButtonStyle("#10b981")}">Go to Dashboard</a>
      </div>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Thank you for choosing our platform!</p>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  // ==================== PROJECT INVITATIONS ====================

  projectInvitation: (
    invitationUrl,
    projectName,
    inviterName,
    message = "",
    crmName = "CRM Platform"
  ) => ({
    subject: `Invitation to join ${projectName} on ${crmName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">You've been invited to join a project</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${inviterName}</strong> has invited you to join <strong>${projectName}</strong> on ${crmName}.</p>
      ${
        message
          ? `
        <div style="background-color: #eff6ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #1e40af; font-size: 14px; margin: 0; font-style: italic;">"${message}"</p>
        </div>
      `
          : ""
      }
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationUrl}" style="${getButtonStyle(
        "#6366f1"
      )}">Accept Invitation</a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin: 10px 0;">${invitationUrl}</p>
      <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0 0;">This invitation will expire in 7 days.</p>
      <p style="color: #9ca3af; font-size: 14px; margin: 10px 0 0 0;">If you don't have an account yet, you'll be able to create one when you accept the invitation.</p>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  // ==================== TASK EMAILS ====================

  taskAssigned: (
    taskTitle,
    projectName,
    assignerName,
    taskUrl,
    dueDate,
    priority,
    crmName = "CRM Platform"
  ) => ({
    subject: `New Task Assigned: ${taskTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Task Assigned</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${assignerName}</strong> has assigned you a new task in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">${taskTitle}</h3>
        ${
          dueDate
            ? `<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Due Date:</strong> ${new Date(
                dueDate
              ).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>`
            : ""
        }
        ${
          priority
            ? `<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>`
            : ""
        }
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Project:</strong> ${projectName}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${taskUrl}" style="${getButtonStyle("#6366f1")}">View Task</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  taskUpdated: (
    taskTitle,
    projectName,
    updaterName,
    taskUrl,
    changes,
    crmName = "CRM Platform"
  ) => ({
    subject: `Task Updated: ${taskTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Task Updated</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${updaterName}</strong> has updated the task <strong>${taskTitle}</strong> in <strong>${projectName}</strong>.</p>
      ${
        changes
          ? `
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h4 style="color: #111827; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Changes:</h4>
          <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
            ${Object.entries(changes)
              .map(([key, value]) => `<li>${key}: ${value}</li>`)
              .join("")}
          </ul>
        </div>
      `
          : ""
      }
      <div style="text-align: center; margin: 30px 0;">
        <a href="${taskUrl}" style="${getButtonStyle("#6366f1")}">View Task</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  taskCompleted: (
    taskTitle,
    projectName,
    completerName,
    taskUrl,
    crmName = "CRM Platform"
  ) => ({
    subject: `Task Completed: ${taskTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Task Completed</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">The task <strong>${taskTitle}</strong> in <strong>${projectName}</strong> has been marked as completed by <strong>${completerName}</strong>.</p>
      <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #065f46; font-size: 14px; margin: 0; font-weight: 500;">✓ Task Completed</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${taskUrl}" style="${getButtonStyle("#10b981")}">View Task</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  taskOverdue: (
    taskTitle,
    projectName,
    taskUrl,
    dueDate,
    crmName = "CRM Platform"
  ) => ({
    subject: `⚠️ Overdue Task: ${taskTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Task Overdue</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">The task <strong>${taskTitle}</strong> in <strong>${projectName}</strong> is now overdue.</p>
      <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 500;">⚠️ Due Date: ${new Date(
          dueDate
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${taskUrl}" style="${getButtonStyle("#dc2626")}">View Task</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  taskReminder: (
    taskTitle,
    projectName,
    taskUrl,
    dueDate,
    reminderTime,
    crmName = "CRM Platform"
  ) => ({
    subject: `Reminder: ${taskTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Task Reminder</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">This is a reminder for the task <strong>${taskTitle}</strong> in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">${taskTitle}</h3>
        ${
          dueDate
            ? `<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Due Date:</strong> ${new Date(
                dueDate
              ).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>`
            : ""
        }
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Project:</strong> ${projectName}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${taskUrl}" style="${getButtonStyle("#6366f1")}">View Task</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  // ==================== CALENDAR EVENT EMAILS ====================

  eventInvitation: (
    eventTitle,
    projectName,
    inviterName,
    eventUrl,
    startDate,
    startTime,
    location,
    crmName = "CRM Platform"
  ) => ({
    subject: `Event Invitation: ${eventTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Event Invitation</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${inviterName}</strong> has invited you to an event in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">${eventTitle}</h3>
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Date:</strong> ${new Date(
          startDate
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
        ${
          startTime
            ? `<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Time:</strong> ${startTime}</p>`
            : '<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>All Day Event</strong></p>'
        }
        ${
          location
            ? `<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Location:</strong> ${location}</p>`
            : ""
        }
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Project:</strong> ${projectName}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${eventUrl}" style="${getButtonStyle(
        "#6366f1"
      )}">View Event</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  eventUpdated: (
    eventTitle,
    projectName,
    updaterName,
    eventUrl,
    changes,
    crmName = "CRM Platform"
  ) => ({
    subject: `Event Updated: ${eventTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Event Updated</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">The event <strong>${eventTitle}</strong> in <strong>${projectName}</strong> has been updated by <strong>${updaterName}</strong>.</p>
      ${
        changes
          ? `
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h4 style="color: #111827; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Changes:</h4>
          <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
            ${Object.entries(changes)
              .map(([key, value]) => `<li>${key}: ${value}</li>`)
              .join("")}
          </ul>
        </div>
      `
          : ""
      }
      <div style="text-align: center; margin: 30px 0;">
        <a href="${eventUrl}" style="${getButtonStyle(
        "#6366f1"
      )}">View Event</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  eventReminder: (
    eventTitle,
    projectName,
    eventUrl,
    startDate,
    startTime,
    location,
    reminderTime,
    crmName = "CRM Platform"
  ) => ({
    subject: `Reminder: ${eventTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Event Reminder</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">This is a reminder for the event <strong>${eventTitle}</strong> in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">${eventTitle}</h3>
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Date:</strong> ${new Date(
          startDate
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
        ${
          startTime
            ? `<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Time:</strong> ${startTime}</p>`
            : '<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>All Day Event</strong></p>'
        }
        ${
          location
            ? `<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Location:</strong> ${location}</p>`
            : ""
        }
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Project:</strong> ${projectName}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${eventUrl}" style="${getButtonStyle(
        "#6366f1"
      )}">View Event</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  eventCancelled: (
    eventTitle,
    projectName,
    cancellerName,
    eventUrl,
    crmName = "CRM Platform"
  ) => ({
    subject: `Event Cancelled: ${eventTitle}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Event Cancelled</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">The event <strong>${eventTitle}</strong> in <strong>${projectName}</strong> has been cancelled by <strong>${cancellerName}</strong>.</p>
      <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 500;">Event Cancelled</p>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  // ==================== LEAD EMAILS ====================

  leadAssigned: (
    leadName,
    projectName,
    assignerName,
    leadUrl,
    crmName = "CRM Platform"
  ) => ({
    subject: `New Lead Assigned: ${leadName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Lead Assigned</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${assignerName}</strong> has assigned you a new lead in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">${leadName}</h3>
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Project:</strong> ${projectName}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${leadUrl}" style="${getButtonStyle("#6366f1")}">View Lead</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  leadConverted: (
    leadName,
    projectName,
    converterName,
    customerUrl,
    crmName = "CRM Platform"
  ) => ({
    subject: `Lead Converted: ${leadName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Lead Converted to Customer</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">The lead <strong>${leadName}</strong> in <strong>${projectName}</strong> has been converted to a customer by <strong>${converterName}</strong>.</p>
      <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #065f46; font-size: 14px; margin: 0; font-weight: 500;">✓ Lead Successfully Converted</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${customerUrl}" style="${getButtonStyle(
        "#10b981"
      )}">View Customer</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  // ==================== DEAL EMAILS ====================

  dealAssigned: (
    dealName,
    projectName,
    assignerName,
    dealUrl,
    dealValue,
    crmName = "CRM Platform"
  ) => ({
    subject: `New Deal Assigned: ${dealName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Deal Assigned</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${assignerName}</strong> has assigned you a new deal in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">${dealName}</h3>
        ${
          dealValue
            ? `<p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Deal Value:</strong> ${dealValue}</p>`
            : ""
        }
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Project:</strong> ${projectName}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dealUrl}" style="${getButtonStyle("#6366f1")}">View Deal</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  dealWon: (
    dealName,
    projectName,
    winnerName,
    dealUrl,
    dealValue,
    crmName = "CRM Platform"
  ) => ({
    subject: `🎉 Deal Won: ${dealName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Deal Won!</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Congratulations! The deal <strong>${dealName}</strong> in <strong>${projectName}</strong> has been marked as won by <strong>${winnerName}</strong>.</p>
      <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #065f46; font-size: 14px; margin: 0; font-weight: 500;">🎉 Deal Won!</p>
        ${
          dealValue
            ? `<p style="color: #065f46; font-size: 14px; margin: 5px 0 0 0;"><strong>Value:</strong> ${dealValue}</p>`
            : ""
        }
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dealUrl}" style="${getButtonStyle("#10b981")}">View Deal</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  dealLost: (
    dealName,
    projectName,
    loserName,
    dealUrl,
    reason,
    crmName = "CRM Platform"
  ) => ({
    subject: `Deal Lost: ${dealName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Deal Lost</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">The deal <strong>${dealName}</strong> in <strong>${projectName}</strong> has been marked as lost by <strong>${loserName}</strong>.</p>
      ${
        reason
          ? `
        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 500;">Reason: ${reason}</p>
        </div>
      `
          : ""
      }
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dealUrl}" style="${getButtonStyle("#6366f1")}">View Deal</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  // ==================== CUSTOMER EMAILS ====================

  customerAssigned: (
    customerName,
    projectName,
    assignerName,
    customerUrl,
    crmName = "CRM Platform"
  ) => ({
    subject: `New Customer Assigned: ${customerName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Customer Assigned</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${assignerName}</strong> has assigned you a new customer in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">${customerName}</h3>
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Project:</strong> ${projectName}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${customerUrl}" style="${getButtonStyle(
        "#6366f1"
      )}">View Customer</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  // ==================== COMPANY EMAILS ====================

  companyAssigned: (
    companyName,
    projectName,
    assignerName,
    companyUrl,
    crmName = "CRM Platform"
  ) => ({
    subject: `New Company Assigned: ${companyName}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Company Assigned</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${assignerName}</strong> has assigned you a new company in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">${companyName}</h3>
        <p style="color: #374151; font-size: 14px; margin: 8px 0;"><strong>Project:</strong> ${projectName}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${companyUrl}" style="${getButtonStyle(
        "#6366f1"
      )}">View Company</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),

  // ==================== COMMENT/MENTION EMAILS ====================

  mentionedInComment: (
    commenterName,
    resourceType,
    resourceName,
    projectName,
    commentUrl,
    commentText,
    crmName = "CRM Platform"
  ) => ({
    subject: `${commenterName} mentioned you in ${resourceType}`,
    html: getBaseTemplate(
      `
      <h1 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">You've been mentioned</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi there,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"><strong>${commenterName}</strong> mentioned you in a comment on <strong>${resourceName}</strong> (${resourceType}) in <strong>${projectName}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 14px; margin: 0; font-style: italic;">"${commentText}"</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${commentUrl}" style="${getButtonStyle(
        "#6366f1"
      )}">View Comment</a>
      </div>
    `,
      "{{SIGNATURE}}",
      crmName
    ),
  }),
};

export default emailTemplates;
