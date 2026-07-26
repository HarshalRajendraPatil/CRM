# CRM Platform Master README

This repository contains a full-stack, multi-tenant CRM platform built with a React/Vite frontend and a Node.js/Express/MongoDB backend. It is not a single-purpose CRM demo. The codebase is organized around independent CRM projects, each project owning its own pipelines, members, settings, activity stream, notifications, finance records, and analytics surface.

This document is intentionally broad and detailed. It is meant to be the first thing you read after returning to the project after a long break.

## What The App Is

At a high level, the app has three layers:

1. A public marketing site for discovery and onboarding.
2. An authenticated workspace for users to manage projects and invitations.
3. A project-scoped CRM experience where each project contains its own customers, leads, deals, tasks, calendar events, reports, settings, and financial records.

There is also a global system-admin layer for platform-wide user and project management.

The app uses:

- React 18 + Vite on the client.
- Redux Toolkit for client state.
- React Router for navigation.
- Socket.IO for live notifications and project room updates.
- Express 5 + MongoDB + Mongoose on the server.
- JWT access tokens and refresh tokens for auth.
- Per-project settings stored in MongoDB and injected into request handling on the server.

## Key Ideas To Remember

- The product is multi-tenant at the project level. A user can own multiple projects and can also be invited into other users' projects.
- A project is the unit that groups CRM data, pipelines, permissions, settings, dashboards, and notifications.
- The server applies different permission checks depending on whether a route is global, project-scoped, or system-admin-only.
- Many project-scoped routes load the current project's CRM settings before executing business logic.
- Notifications are real-time and also persist in the database/store.

## Run And Setup

The repository is split into `client/` and `server/`. Install and run them separately.

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm run test
```

Note: the server uses the script name `test` to start `nodemon server.js`. That is the current project convention.

### Typical Local URLs

- Client dev server: usually `http://localhost:5173`
- Server API: `http://localhost:8000`
- Server health check: `http://localhost:8000/health`

If your client and server ports differ from those defaults, update the environment variables described below.

## Environment Variables

### Server

The server reads its environment from [server/.env](server/.env).

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode, usually `development` or `production` |
| `PORT` | Express server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access/password-reset/email-verification signing secret |
| `JWT_EXPIRES_IN` | Access token expiry |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry |
| `FRONTEND_URL` | Allowed frontend origin for CORS and links |
| `EMAIL_SERVICE` | Email provider used by Nodemailer |
| `EMAIL_USER` | Email account username |
| `EMAIL_PASSWORD` | Email account password or app password |
| `EMAIL_FROM` | From address used in outgoing mail |
| `BCRYPT_SALT_ROUNDS` | Password hash cost |

### Client

The client reads runtime API configuration from Vite environment variables.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL for both API calls and Socket.IO connection fallback |

Client networking defaults are:

- API calls: `http://localhost:8000/api`
- Socket.IO connection: `http://localhost:8000`

## Repository Structure

### Root

- [README.md](README.md) - master project documentation.
- `client/` - frontend application.
- `server/` - backend API and realtime services.

### Client Overview

#### Entry And App Shell

- [client/src/main.jsx](client/src/main.jsx) - React bootstrap, Redux provider, authentication initialization.
- [client/src/App.jsx](client/src/App.jsx) - route registry and access control wrapper.
- [client/src/index.css](client/src/index.css) - global client styling.
- [client/src/App.css](client/src/App.css) - app-level styles.

#### Layouts

- [client/src/layouts/MainLayout.jsx](client/src/layouts/MainLayout.jsx) - public site shell with navbar and footer.
- [client/src/layouts/DashboardLayout.jsx](client/src/layouts/DashboardLayout.jsx) - authenticated dashboard/project shell for the main workspace.
- [client/src/layouts/CrmLayout.jsx](client/src/layouts/CrmLayout.jsx) - project-scoped CRM shell with sidebar, search, profile menu, notifications, and Socket.IO room handling.
- [client/src/layouts/AdminLayout.jsx](client/src/layouts/AdminLayout.jsx) - system-admin shell for platform-level administration.

#### Public Pages

- [client/src/pages/Home.jsx](client/src/pages/Home.jsx) - landing page with hero, feature overview, workflow teaser, and CTA.
- [client/src/pages/About.jsx](client/src/pages/About.jsx) - about page.
- [client/src/pages/Contact.jsx](client/src/pages/Contact.jsx) - contact page.
- [client/src/pages/Features.jsx](client/src/pages/Features.jsx) - product feature page.
- [client/src/pages/Pricing.jsx](client/src/pages/Pricing.jsx) - pricing page.

#### General Auth And User Pages

- [client/src/pages/auth/Login.jsx](client/src/pages/auth/Login.jsx) - sign-in screen.
- [client/src/pages/auth/Register.jsx](client/src/pages/auth/Register.jsx) - sign-up screen.
- [client/src/pages/auth/ForgotPassword.jsx](client/src/pages/auth/ForgotPassword.jsx) - password reset request.
- [client/src/pages/auth/ResetPassword.jsx](client/src/pages/auth/ResetPassword.jsx) - password reset completion.
- [client/src/pages/auth/VerifyEmail.jsx](client/src/pages/auth/VerifyEmail.jsx) - email verification flow.
- [client/src/pages/Profile.jsx](client/src/pages/Profile.jsx) - authenticated profile management.
- [client/src/pages/NotificationsPage.jsx](client/src/pages/NotificationsPage.jsx) - notification inbox.

#### Workspace And Admin Pages

- [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx) - workspace landing dashboard with sample summary metrics and quick context.
- [client/src/pages/projects/Projects.jsx](client/src/pages/projects/Projects.jsx) - project list and create-project entry point.
- [client/src/pages/projects/ProjectDetail.jsx](client/src/pages/projects/ProjectDetail.jsx) - project detail and member/pipeline tabs.
- [client/src/pages/projects/CreateProjectSidebar.jsx](client/src/pages/projects/CreateProjectSidebar.jsx) - project creation form.
- [client/src/pages/projects/EditProjectSidebar.jsx](client/src/pages/projects/EditProjectSidebar.jsx) - project edit form.
- [client/src/pages/projects/members/InviteMemberModal.jsx](client/src/pages/projects/members/InviteMemberModal.jsx) - invite-member modal.
- [client/src/pages/projects/members/InviteMemberSidebar.jsx](client/src/pages/projects/members/InviteMemberSidebar.jsx) - invite-member side panel.
- [client/src/pages/projects/pipeline/CreatePipelineSidebar.jsx](client/src/pages/projects/pipeline/CreatePipelineSidebar.jsx) - pipeline creation form.
- [client/src/pages/projects/pipeline/EditPipelineSidebar.jsx](client/src/pages/projects/pipeline/EditPipelineSidebar.jsx) - pipeline edit form.
- [client/src/pages/projects/pipeline/CreateStageSidebar.jsx](client/src/pages/projects/pipeline/CreateStageSidebar.jsx) - stage creation form.
- [client/src/pages/projects/pipeline/EditStageSidebar.jsx](client/src/pages/projects/pipeline/EditStageSidebar.jsx) - stage edit form.
- [client/src/pages/projects/pipeline/PipelineDetail.jsx](client/src/pages/projects/pipeline/PipelineDetail.jsx) - pipeline detail view.
- [client/src/pages/projects/tabs/MembersTab.jsx](client/src/pages/projects/tabs/MembersTab.jsx) - project members tab.
- [client/src/pages/projects/tabs/PipelinesTab.jsx](client/src/pages/projects/tabs/PipelinesTab.jsx) - project pipelines tab.
- [client/src/pages/projects/tabs/SettingsTab.jsx](client/src/pages/projects/tabs/SettingsTab.jsx) - project settings tab.
- [client/src/pages/invitations/UserInvitations.jsx](client/src/pages/invitations/UserInvitations.jsx) - user invitation list.
- [client/src/pages/invitations/InvitationPage.jsx](client/src/pages/invitations/InvitationPage.jsx) - invitation accept/decline page.
- [client/src/pages/admin/AdminDashboard.jsx](client/src/pages/admin/AdminDashboard.jsx) - admin entry dashboard.
- [client/src/pages/admin/SystemAdminDashboard.jsx](client/src/pages/admin/SystemAdminDashboard.jsx) - platform-wide admin dashboard.
- [client/src/pages/admin/CreateUser.jsx](client/src/pages/admin/CreateUser.jsx) - admin user creation.
- [client/src/pages/admin/UserDetail.jsx](client/src/pages/admin/UserDetail.jsx) - admin user detail and control view.

#### CRM Modules

- [client/src/pages/crm/CrmDashboard.jsx](client/src/pages/crm/CrmDashboard.jsx) - project CRM dashboard with charts and live analytics.
- [client/src/pages/crm/Settings.jsx](client/src/pages/crm/Settings.jsx) - settings hub with section tabs.
- [client/src/pages/crm/Reports.jsx](client/src/pages/crm/Reports.jsx) - report center.
- [client/src/pages/crm/Performance.jsx](client/src/pages/crm/Performance.jsx) - performance analytics.
- [client/src/pages/crm/Calendar.jsx](client/src/pages/crm/Calendar.jsx) - calendar module.
- [client/src/pages/crm/companies/Companies.jsx](client/src/pages/crm/companies/Companies.jsx) - company list.
- [client/src/pages/crm/companies/CompanyDetail.jsx](client/src/pages/crm/companies/CompanyDetail.jsx) - company detail page.
- [client/src/pages/crm/leads/Leads.jsx](client/src/pages/crm/leads/Leads.jsx) - lead list.
- [client/src/pages/crm/leads/LeadDetail.jsx](client/src/pages/crm/leads/LeadDetail.jsx) - lead detail page.
- [client/src/pages/crm/customers/Customers.jsx](client/src/pages/crm/customers/Customers.jsx) - customer list.
- [client/src/pages/crm/customers/CustomerDetail.jsx](client/src/pages/crm/customers/CustomerDetail.jsx) - customer detail page.
- [client/src/pages/crm/deals/Deals.jsx](client/src/pages/crm/deals/Deals.jsx) - deal list.
- [client/src/pages/crm/deals/DealDetail.jsx](client/src/pages/crm/deals/DealDetail.jsx) - deal detail page.
- [client/src/pages/crm/tasks/Tasks.jsx](client/src/pages/crm/tasks/Tasks.jsx) - task list.
- [client/src/pages/crm/tasks/TaskDetail.jsx](client/src/pages/crm/tasks/TaskDetail.jsx) - task detail page.
- [client/src/pages/crm/invoices/Invoices.jsx](client/src/pages/crm/invoices/Invoices.jsx) - invoice list.
- [client/src/pages/crm/invoices/InvoiceDetail.jsx](client/src/pages/crm/invoices/InvoiceDetail.jsx) - invoice detail page.
- [client/src/pages/crm/payments/Payments.jsx](client/src/pages/crm/payments/Payments.jsx) - payment list.
- [client/src/pages/crm/payments/PaymentDetail.jsx](client/src/pages/crm/payments/PaymentDetail.jsx) - payment detail page.
- [client/src/pages/crm/receipts/Receipts.jsx](client/src/pages/crm/receipts/Receipts.jsx) - receipt list.
- [client/src/pages/crm/receipts/ReceiptDetail.jsx](client/src/pages/crm/receipts/ReceiptDetail.jsx) - receipt detail page.
- [client/src/pages/crm/financial/Financial.jsx](client/src/pages/crm/financial/Financial.jsx) - financial overview.

#### Shared Client Components

- [client/src/components/layout/Navbar.jsx](client/src/components/layout/Navbar.jsx) - public navigation bar.
- [client/src/components/layout/Footer.jsx](client/src/components/layout/Footer.jsx) - public footer.
- [client/src/components/activity/ActivityStats.jsx](client/src/components/activity/ActivityStats.jsx) - activity summary block.
- [client/src/components/activity/ActivityTimeline.jsx](client/src/components/activity/ActivityTimeline.jsx) - activity timeline.
- [client/src/components/notifications/NotificationBell.jsx](client/src/components/notifications/NotificationBell.jsx) - notification trigger.
- [client/src/components/notifications/NotificationDropdown.jsx](client/src/components/notifications/NotificationDropdown.jsx) - dropdown notification list.
- [client/src/components/notifications/NotificationItem.jsx](client/src/components/notifications/NotificationItem.jsx) - notification row.
- [client/src/components/ui/Alert.jsx](client/src/components/ui/Alert.jsx) - feedback banner component.
- [client/src/components/ui/Button.jsx](client/src/components/ui/Button.jsx) - shared button component.
- [client/src/components/ui/Input.jsx](client/src/components/ui/Input.jsx) - shared input component.

#### Contexts, Hooks, Services, Store, Utilities

- [client/src/contexts/SettingsContext.jsx](client/src/contexts/SettingsContext.jsx) - project settings provider and settings access hooks.
- [client/src/hooks/useSettingsIntegration.js](client/src/hooks/useSettingsIntegration.js) - settings-derived defaults and helper formatters.
- [client/src/hooks/useProjectAccess.js](client/src/hooks/useProjectAccess.js) - project membership and role checks in the client.
- [client/src/services/*.js](client/src/services) - API wrappers for each business module.
- [client/src/store/*.js](client/src/store) - Redux slices for auth, projects, invitations, notifications, CRM entities, settings, admin, activity, invoices, payments, receipts, and financial data.
- [client/src/utils/authUtils.js](client/src/utils/authUtils.js) - auth initialization and logout cleanup.
- [client/src/utils/axiosConfig.js](client/src/utils/axiosConfig.js) - Axios instance, token injection, and refresh-token retry logic.
- [client/src/utils/socketService.js](client/src/utils/socketService.js) - client-side Socket.IO connection and project room joins.
- [client/src/utils/settingsUtils.js](client/src/utils/settingsUtils.js) - formatting helpers driven by CRM settings.

### Server Overview

#### Bootstrap And Configuration

- [server/server.js](server/server.js) - Express app setup, middleware, API registration, health endpoint, socket server startup, and scheduler startup.
- [server/config/database.js](server/config/database.js) - MongoDB connection.
- [server/config/jwt.js](server/config/jwt.js) - access token, refresh token, password reset token, and email verification token helpers.

#### Middleware

- [server/middleware/auth.js](server/middleware/auth.js) - token authentication and role guards.
- [server/middleware/settingsMiddleware.js](server/middleware/settingsMiddleware.js) - CRM settings injection, business-rule validation, and response shaping.
- [server/middleware/errorHandler.js](server/middleware/errorHandler.js) - not-found and error response handling.

#### Models

- [server/models/User.model.js](server/models/User.model.js) - user identity, auth state, global role, and project membership model.
- [server/models/Project.model.js](server/models/Project.model.js) - project ownership, members, visibility, pipelines, stages, and project-level settings.
- [server/models/CrmSettings.model.js](server/models/CrmSettings.model.js) - per-project settings document.
- [server/models/Lead.model.js](server/models/Lead.model.js) - lead records.
- [server/models/Customer.model.js](server/models/Customer.model.js) - customer records.
- [server/models/Company.model.js](server/models/Company.model.js) - company records.
- [server/models/Deal.model.js](server/models/Deal.model.js) - deal/pipeline records.
- [server/models/Task.model.js](server/models/Task.model.js) - task records.
- [server/models/CalendarEvent.model.js](server/models/CalendarEvent.model.js) - calendar event records.
- [server/models/Invoice.model.js](server/models/Invoice.model.js) - invoice records.
- [server/models/Payment.model.js](server/models/Payment.model.js) - payment records.
- [server/models/Receipt.model.js](server/models/Receipt.model.js) - receipt records.
- [server/models/Notification.model.js](server/models/Notification.model.js) - notification records.
- [server/models/Activity.model.js](server/models/Activity.model.js) - audit/activity events.
- [server/models/Invitation.model.js](server/models/Invitation.model.js) - project invitation records.

#### Controllers

- [server/controllers/authController.js](server/controllers/authController.js) - register, login, token refresh, password reset, email verification, profile management.
- [server/controllers/userController.js](server/controllers/userController.js) - global user management.
- [server/controllers/projectController.js](server/controllers/projectController.js) - project CRUD, pipelines, stages, members, ownership transfer.
- [server/controllers/invitationController.js](server/controllers/invitationController.js) - invite lifecycle.
- [server/controllers/notificationController.js](server/controllers/notificationController.js) - notification inbox and admin-generated notifications.
- [server/controllers/companyController.js](server/controllers/companyController.js) - company workflows.
- [server/controllers/leadController.js](server/controllers/leadController.js) - lead workflows.
- [server/controllers/customerController.js](server/controllers/customerController.js) - customer workflows.
- [server/controllers/dealController.js](server/controllers/dealController.js) - deal workflows.
- [server/controllers/taskController.js](server/controllers/taskController.js) - task workflows.
- [server/controllers/calendarController.js](server/controllers/calendarController.js) - calendar workflows.
- [server/controllers/reportController.js](server/controllers/reportController.js) - reporting workflows.
- [server/controllers/dashboardController.js](server/controllers/dashboardController.js) - dashboard analytics.
- [server/controllers/settingsController.js](server/controllers/settingsController.js) - CRM settings CRUD.
- [server/controllers/activityController.js](server/controllers/activityController.js) - activity stream queries and deletion.
- [server/controllers/performanceController.js](server/controllers/performanceController.js) - performance analytics.
- [server/controllers/invoiceController.js](server/controllers/invoiceController.js) - invoice workflows.
- [server/controllers/paymentController.js](server/controllers/paymentController.js) - payment workflows.
- [server/controllers/receiptController.js](server/controllers/receiptController.js) - receipt workflows.
- [server/controllers/financialController.js](server/controllers/financialController.js) - financial overview views.
- [server/controllers/systemAdminController.js](server/controllers/systemAdminController.js) - platform-wide admin operations.
- [server/controllers/pipelineController.js](server/controllers/pipelineController.js) - pipeline helper logic.

#### Routes

- [server/routes/auth.js](server/routes/auth.js) - authentication routes.
- [server/routes/users.js](server/routes/users.js) - global user administration routes.
- [server/routes/projects.js](server/routes/projects.js) - project and pipeline routes.
- [server/routes/invitations.js](server/routes/invitations.js) - invitation routes.
- [server/routes/notifications.js](server/routes/notifications.js) - notification routes.
- [server/routes/companies.js](server/routes/companies.js) - company routes.
- [server/routes/leads.js](server/routes/leads.js) - lead routes.
- [server/routes/customers.js](server/routes/customers.js) - customer routes.
- [server/routes/deals.js](server/routes/deals.js) - deal routes.
- [server/routes/tasks.js](server/routes/tasks.js) - task routes.
- [server/routes/calendar.js](server/routes/calendar.js) - calendar routes.
- [server/routes/reports.js](server/routes/reports.js) - report generation routes.
- [server/routes/dashboard.js](server/routes/dashboard.js) - dashboard routes.
- [server/routes/settings.js](server/routes/settings.js) - CRM settings routes.
- [server/routes/systemAdmin.js](server/routes/systemAdmin.js) - system-admin routes.
- [server/routes/activities.js](server/routes/activities.js) - activity routes.
- [server/routes/performance.js](server/routes/performance.js) - performance routes.
- [server/routes/invoices.js](server/routes/invoices.js) - invoice routes.
- [server/routes/payments.js](server/routes/payments.js) - payment routes.
- [server/routes/receipts.js](server/routes/receipts.js) - receipt routes.
- [server/routes/financial.js](server/routes/financial.js) - financial overview routes.

#### Server Utilities

- [server/utils/activityHelper.js](server/utils/activityHelper.js) - activity record helper logic.
- [server/utils/activityService.js](server/utils/activityService.js) - activity processing helpers.
- [server/utils/companyValidation.js](server/utils/companyValidation.js) - company validation rules.
- [server/utils/dealValidation.js](server/utils/dealValidation.js) - deal validation rules.
- [server/utils/emailService.js](server/utils/emailService.js) - outbound email sending.
- [server/utils/emailTemplates.js](server/utils/emailTemplates.js) - email template markup.
- [server/utils/invitationUtils.js](server/utils/invitationUtils.js) - invitation helper logic.
- [server/utils/invoiceService.js](server/utils/invoiceService.js) - invoice helper logic.
- [server/utils/invoiceValidation.js](server/utils/invoiceValidation.js) - invoice validation rules.
- [server/utils/leadValidation.js](server/utils/leadValidation.js) - lead validation rules.
- [server/utils/notificationService.js](server/utils/notificationService.js) - notification helper logic.
- [server/utils/paymentValidation.js](server/utils/paymentValidation.js) - payment validation rules.
- [server/utils/performanceService.js](server/utils/performanceService.js) - performance calculations.
- [server/utils/projectValidation.js](server/utils/projectValidation.js) - project validation rules.
- [server/utils/receiptValidation.js](server/utils/receiptValidation.js) - receipt validation rules.
- [server/utils/reminderService.js](server/utils/reminderService.js) - reminder logic.
- [server/utils/reportTemplates.js](server/utils/reportTemplates.js) - report template definitions.
- [server/utils/scheduler.js](server/utils/scheduler.js) - scheduled background jobs.
- [server/utils/socketService.js](server/utils/socketService.js) - Socket.IO server setup and event emission.
- [server/utils/taskValidation.js](server/utils/taskValidation.js) - task validation rules.
- [server/utils/validation.js](server/utils/validation.js) - shared validation helpers.

## Authentication And Access Model

There are two role systems.

### Global Roles

- `user` - normal authenticated user.
- `system-admin` - platform administrator with global access to users and projects.

### Project Roles

- `owner` - project creator and highest project-level authority.
- `admin` - full project administration.
- `manager` - management-level access.
- `sales_executive` - sales-focused access.
- `support_executive` - support-focused access.
- `viewer` - read-only access.

The frontend checks these roles in [client/src/hooks/useProjectAccess.js](client/src/hooks/useProjectAccess.js), and the backend enforces them in [server/middleware/auth.js](server/middleware/auth.js).

### Authentication Flow Summary

1. A user registers or logs in.
2. The backend returns access and refresh tokens.
3. The client stores both tokens and the user object in `localStorage`.
4. [client/src/utils/authUtils.js](client/src/utils/authUtils.js) initializes Socket.IO if a token already exists.
5. [client/src/utils/axiosConfig.js](client/src/utils/axiosConfig.js) attaches the bearer token to every request.
6. If an API request gets `401`, the client tries the refresh token once.
7. If refresh fails, the client clears auth state and redirects to `/login`.

## Application Routing

### Public Routes

- `/` - landing page.
- `/about` - about page.
- `/contact` - contact page.
- `/features` - feature page.
- `/pricing` - pricing page.
- `/login` - login page.
- `/register` - registration page.
- `/forgot-password` - password reset request.
- `/reset-password` - reset form.
- `/verify-email` - verification landing page.

### Authenticated Workspace Routes

- `/dashboard` - authenticated dashboard.
- `/profile` - profile management.
- `/notifications` - notifications inbox.
- `/projects` - project list.
- `/projects/:id` - project detail.
- `/invitations` - your invitations.
- `/invitations/:token` - invitation acceptance page.

### System-Admin Routes

- `/admin/dashboard` - admin dashboard.
- `/admin/system-dashboard` - system admin dashboard.
- `/admin/users/create` - create user.
- `/admin/users/:id` - user detail.

### CRM Routes

All CRM routes are scoped under `/crm/:projectId`.

- `/crm/:projectId/dashboard`
- `/crm/:projectId/companies`
- `/crm/:projectId/companies/:companyId`
- `/crm/:projectId/leads`
- `/crm/:projectId/leads/:leadId`
- `/crm/:projectId/customers`
- `/crm/:projectId/customers/:customerId`
- `/crm/:projectId/deals`
- `/crm/:projectId/deals/:dealId`
- `/crm/:projectId/tasks`
- `/crm/:projectId/tasks/:taskId`
- `/crm/:projectId/calendar`
- `/crm/:projectId/reports`
- `/crm/:projectId/performance`
- `/crm/:projectId/settings`
- `/crm/:projectId/invoices`
- `/crm/:projectId/invoices/:invoiceId`
- `/crm/:projectId/payments`
- `/crm/:projectId/payments/:paymentId`
- `/crm/:projectId/receipts`
- `/crm/:projectId/receipts/:receiptId`
- `/crm/:projectId/financial`

## Complete User Journey

### 1. Public Discovery

The public site uses [client/src/layouts/MainLayout.jsx](client/src/layouts/MainLayout.jsx), which renders the global navbar and footer around marketing pages.

The homepage [client/src/pages/Home.jsx](client/src/pages/Home.jsx) explains the platform as a multi-tenant CRM and drives users toward registration. It uses visually rich hero sections, feature cards, and a three-step onboarding story.

The other public pages support the same discovery flow:

- About explains the product story.
- Features explains what the platform does.
- Pricing explains plans or pricing structure.
- Contact gives a contact path.

### 2. Account Creation And Login

The auth pages live in [client/src/pages/auth](client/src/pages/auth).

The expected sequence is:

1. Register or log in.
2. Receive JWT tokens from the backend.
3. Store auth state in Redux and `localStorage`.
4. If the account is not verified, route the user through email verification.
5. Allow password reset through the forgot/reset pages.

The auth slice in [client/src/store/authSlice.js](client/src/store/authSlice.js) manages:

- `user`
- `isAuthenticated`
- loading/success/error state
- email verification requirement tracking

### 3. Workspace Entry

After authentication, the user lands in the workspace dashboard.

The workspace dashboard page [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx) is a general landing surface. In the current code it uses illustrative dashboard data and mock summaries to give the user a quick overview of what the platform can show.

From there, the user usually moves into one of three paths:

- `My Projects` to open or create a project.
- `Invitations` to accept pending membership invites.
- `Profile` or `Notifications` for account-level management.

### 4. Project Creation And Membership

The project list page [client/src/pages/projects/Projects.jsx](client/src/pages/projects/Projects.jsx) is the entry point for creating or entering a CRM project.

Typical flow:

1. Load the list of projects owned by or assigned to the current user.
2. Create a new project from the sidebar form.
3. View project metadata, members, visibility, and ownership status.
4. Click `Enter` to jump into `/crm/:projectId/dashboard`.

Project lifecycle is backed by [client/src/services/projectService.js](client/src/services/projectService.js) and [client/src/store/projectSlice.js](client/src/store/projectSlice.js).

The project model [server/models/Project.model.js](server/models/Project.model.js) is important here because it automatically ensures the project has at least one default pipeline and at least one default stage when necessary.

### 5. Invitation Flow

Invitation handling is a full workflow of its own.

The user can see invitations in [client/src/pages/invitations/UserInvitations.jsx](client/src/pages/invitations/UserInvitations.jsx), which lists pending invitations with project name, inviter, role, and expiry date.

The token-based invitation page [client/src/pages/invitations/InvitationPage.jsx](client/src/pages/invitations/InvitationPage.jsx) handles acceptance or decline.

Typical invitation flow:

1. A manager or higher role creates an invitation on a project.
2. The invitee receives the token link.
3. The invitee opens the invitation page.
4. If not authenticated, the app redirects them to login and preserves the return path.
5. If logged in as the wrong email, the app blocks the action and explains the mismatch.
6. Accepting the invitation moves the user into the project.
7. Declining the invitation returns the user to the project list.

The backend route set for this flow is [server/routes/invitations.js](server/routes/invitations.js).

### 6. Entering The CRM Workspace

The CRM shell is [client/src/layouts/CrmLayout.jsx](client/src/layouts/CrmLayout.jsx).

This layout does a lot of the invisible setup work:

- It reads the current `projectId` from the URL.
- It fetches the project details when the route changes.
- It joins the Socket.IO project room so the user receives project-specific notifications.
- It exposes project navigation links for dashboard, companies, leads, customers, deals, tasks, calendar, reports, performance, financial, and settings.
- It switches navigation options based on whether the user has manager-level access.

The CRM pages always sit on top of the project-scoped settings provider in [client/src/contexts/SettingsContext.jsx](client/src/contexts/SettingsContext.jsx). That provider automatically fetches the current project's settings and exposes them to the rest of the app.

### 7. CRM Dashboard

The live CRM dashboard is [client/src/pages/crm/CrmDashboard.jsx](client/src/pages/crm/CrmDashboard.jsx).

This page is the main analytics surface for a single project. It pulls multiple data feeds from the dashboard slice:

- overview cards
- KPI/metrics cards
- revenue trend chart
- deal funnel chart
- task completion chart
- lead conversion/status chart
- recent activity stream
- top performers

Workflow:

1. Load data for the selected time period.
2. Fetch the main dashboard payload.
3. Fetch chart data and trend series separately.
4. Render charts and summary cards.
5. Allow manual refresh.

The live dashboard route is backed by [server/routes/dashboard.js](server/routes/dashboard.js).

### 8. Companies

Companies are the organizational accounts or businesses tracked in a project.

Key files:

- [client/src/pages/crm/companies/Companies.jsx](client/src/pages/crm/companies/Companies.jsx)
- [client/src/pages/crm/companies/CompanyDetail.jsx](client/src/pages/crm/companies/CompanyDetail.jsx)
- [client/src/pages/crm/companies/CompanyFilters.jsx](client/src/pages/crm/companies/CompanyFilters.jsx)
- [client/src/pages/crm/companies/CompanyForecast.jsx](client/src/pages/crm/companies/CompanyForecast.jsx)
- [client/src/pages/crm/companies/CompanyListItem.jsx](client/src/pages/crm/companies/CompanyListItem.jsx)
- [client/src/pages/crm/companies/CompanyOverviewCard.jsx](client/src/pages/crm/companies/CompanyOverviewCard.jsx)
- [client/src/pages/crm/companies/CompanySidebar.jsx](client/src/pages/crm/companies/CompanySidebar.jsx)
- [client/src/pages/crm/companies/CompanyStats.jsx](client/src/pages/crm/companies/CompanyStats.jsx)
- [client/src/pages/crm/companies/CompanyStatsCards.jsx](client/src/pages/crm/companies/CompanyStatsCards.jsx)

Workflow:

1. Open the companies list.
2. Filter or search companies.
3. Create or edit a company from the sidebar.
4. Open the detail page for notes, tags, custom fields, and linked deals.
5. Inspect stats, insights, and forecast information.

Backend support comes from [server/routes/companies.js](server/routes/companies.js), which includes bulk updates, notes, tags, custom fields, deal relationships, stats, insights, and forecasting endpoints.

### 9. Leads

Leads represent the earliest stage of the CRM funnel.

Key files:

- [client/src/pages/crm/leads/Leads.jsx](client/src/pages/crm/leads/Leads.jsx)
- [client/src/pages/crm/leads/LeadDetail.jsx](client/src/pages/crm/leads/LeadDetail.jsx)
- [client/src/pages/crm/leads/CreateLeadSidebar.jsx](client/src/pages/crm/leads/CreateLeadSidebar.jsx)
- [client/src/pages/crm/leads/EditLeadSidebar.jsx](client/src/pages/crm/leads/EditLeadSidebar.jsx)
- [client/src/pages/crm/leads/LeadForecast.jsx](client/src/pages/crm/leads/LeadForecast.jsx)
- [client/src/pages/crm/leads/LeadKanban.jsx](client/src/pages/crm/leads/LeadKanban.jsx)
- [client/src/pages/crm/leads/LeadStats.jsx](client/src/pages/crm/leads/LeadStats.jsx)

Workflow:

1. Capture a new lead.
2. Review lead details, notes, and status.
3. Assign or reassign the lead.
4. Archive or permanently remove it if needed.
5. Convert it into a customer when it is qualified.
6. Use forecast and insight views to understand lead distribution.

Backend support comes from [server/routes/leads.js](server/routes/leads.js), which includes archive, unarchive, permanent delete, status changes, assignment, conversion, notes, forecast, insights, and cleanup operations.

### 10. Customers

Customers represent converted or active accounts in the CRM.

Key files:

- [client/src/pages/crm/customers/Customers.jsx](client/src/pages/crm/customers/Customers.jsx)
- [client/src/pages/crm/customers/CustomerDetail.jsx](client/src/pages/crm/customers/CustomerDetail.jsx)
- [client/src/pages/crm/customers/CustomerFilters.jsx](client/src/pages/crm/customers/CustomerFilters.jsx)
- [client/src/pages/crm/customers/CustomerForecast.jsx](client/src/pages/crm/customers/CustomerForecast.jsx)
- [client/src/pages/crm/customers/CustomerKanban.jsx](client/src/pages/crm/customers/CustomerKanban.jsx)
- [client/src/pages/crm/customers/CustomerListItem.jsx](client/src/pages/crm/customers/CustomerListItem.jsx)
- [client/src/pages/crm/customers/CustomerSidebar.jsx](client/src/pages/crm/customers/CustomerSidebar.jsx)
- [client/src/pages/crm/customers/CustomerStats.jsx](client/src/pages/crm/customers/CustomerStats.jsx)

Workflow:

1. Create or convert a customer record.
2. Store notes, interactions, and custom fields.
3. Update stages, statuses, priorities, or assignments in bulk.
4. View related deals and customer-level insights.
5. Archive or unarchive as needed.

Backend support comes from [server/routes/customers.js](server/routes/customers.js), which includes bulk update actions, archive actions, interaction tracking, lead conversion, stats, insights, forecast, export, and linked-deal views.

### 11. Deals

Deals are pipeline-driven revenue opportunities.

Key files:

- [client/src/pages/crm/deals/Deals.jsx](client/src/pages/crm/deals/Deals.jsx)
- [client/src/pages/crm/deals/DealDetail.jsx](client/src/pages/crm/deals/DealDetail.jsx)
- [client/src/pages/crm/deals/CreateDealSidebar.jsx](client/src/pages/crm/deals/CreateDealSidebar.jsx)
- [client/src/pages/crm/deals/EditDealSidebar.jsx](client/src/pages/crm/deals/EditDealSidebar.jsx)
- [client/src/pages/crm/deals/DealFilters.jsx](client/src/pages/crm/deals/DealFilters.jsx)
- [client/src/pages/crm/deals/DealForecasting.jsx](client/src/pages/crm/deals/DealForecasting.jsx)
- [client/src/pages/crm/deals/DealInsights.jsx](client/src/pages/crm/deals/DealInsights.jsx)
- [client/src/pages/crm/deals/DealKanban.jsx](client/src/pages/crm/deals/DealKanban.jsx)
- [client/src/pages/crm/deals/DealListItem.jsx](client/src/pages/crm/deals/DealListItem.jsx)
- [client/src/pages/crm/deals/DealStats.jsx](client/src/pages/crm/deals/DealStats.jsx)

Workflow:

1. Create a deal tied to a company, lead, or customer.
2. Move the deal through the pipeline.
3. Add notes and activities.
4. Archive or restore it.
5. Bulk update, bulk archive, or bulk delete when needed.
6. Review forecasting, velocity, and insight metrics.

Backend support comes from [server/routes/deals.js](server/routes/deals.js), which exposes activities, notes, status updates, archive/restore, bulk operations, stats, velocity, forecast, insights, and export.

### 12. Tasks

Tasks are the operational work items that support the sales pipeline.

Key files:

- [client/src/pages/crm/tasks/Tasks.jsx](client/src/pages/crm/tasks/Tasks.jsx)
- [client/src/pages/crm/tasks/TaskDetail.jsx](client/src/pages/crm/tasks/TaskDetail.jsx)
- [client/src/pages/crm/tasks/CreateTaskSidebar.jsx](client/src/pages/crm/tasks/CreateTaskSidebar.jsx)
- [client/src/pages/crm/tasks/EditTaskSidebar.jsx](client/src/pages/crm/tasks/EditTaskSidebar.jsx)
- [client/src/pages/crm/tasks/TaskFilters.jsx](client/src/pages/crm/tasks/TaskFilters.jsx)
- [client/src/pages/crm/tasks/TaskKanban.jsx](client/src/pages/crm/tasks/TaskKanban.jsx)
- [client/src/pages/crm/tasks/TaskListItem.jsx](client/src/pages/crm/tasks/TaskListItem.jsx)
- [client/src/pages/crm/tasks/TaskStats.jsx](client/src/pages/crm/tasks/TaskStats.jsx)
- [client/src/pages/crm/tasks/ArchiveConfirmModal.jsx](client/src/pages/crm/tasks/ArchiveConfirmModal.jsx)
- [client/src/pages/crm/tasks/BulkActionsModal.jsx](client/src/pages/crm/tasks/BulkActionsModal.jsx)
- [client/src/pages/crm/tasks/BulkAssignModal.jsx](client/src/pages/crm/tasks/BulkAssignModal.jsx)
- [client/src/pages/crm/tasks/DeleteConfirmModal.jsx](client/src/pages/crm/tasks/DeleteConfirmModal.jsx)

Workflow:

1. Create a task for a person, company, deal, or other CRM entity.
2. Assign the task and set due dates, priorities, and reminders.
3. Track comments and subtasks.
4. Archive, restore, or delete tasks in bulk.
5. Use task stats, overdue views, and exports for supervision.

Backend support comes from [server/routes/tasks.js](server/routes/tasks.js), which includes entity-linked tasks, stats, insights, overdue views, export, bulk actions, comments, subtasks, custom fields, and reminder control.

### 13. Calendar

The calendar is the scheduling layer for events and availability.

Key files:

- [client/src/pages/crm/Calendar.jsx](client/src/pages/crm/Calendar.jsx)
- [client/src/pages/crm/calendar/CreateEventSidebar.jsx](client/src/pages/crm/calendar/CreateEventSidebar.jsx)
- [client/src/pages/crm/calendar/EditEventSidebar.jsx](client/src/pages/crm/calendar/EditEventSidebar.jsx)
- [client/src/pages/crm/calendar/EventDetailModal.jsx](client/src/pages/crm/calendar/EventDetailModal.jsx)

Workflow:

1. Create events for calls, meetings, or reminders.
2. Edit or delete events.
3. Review time ranges, stats, and overdue items.
4. Manage working hours, holidays, templates, attendees, and event responses.
5. Apply settings so event validation respects project business rules.

Backend support comes from [server/routes/calendar.js](server/routes/calendar.js), which includes event CRUD, range queries, stats, settings, responses, working hours, holidays, templates, availability, and attendee management.

### 14. Reports

The reports module turns CRM data into generated documents or structured reporting payloads.

Key files:

- [client/src/pages/crm/Reports.jsx](client/src/pages/crm/Reports.jsx)
- [server/routes/reports.js](server/routes/reports.js)
- [server/utils/reportTemplates.js](server/utils/reportTemplates.js)

The reports layer can generate:

- overview reports
- companies reports
- customers reports
- deals reports
- leads reports
- tasks reports
- activities reports
- performance reports
- financial reports

### 15. Performance

Performance analytics are available for users and teams.

Key files:

- [client/src/pages/crm/Performance.jsx](client/src/pages/crm/Performance.jsx)
- [server/routes/performance.js](server/routes/performance.js)
- [server/controllers/performanceController.js](server/controllers/performanceController.js)
- [server/utils/performanceService.js](server/utils/performanceService.js)

Typical views:

- per-user performance
- team overview
- user list for performance comparison
- cross-user comparison

### 16. Invoices, Payments, Receipts, And Financials

The financial stack is separated into four but related modules.

#### Invoices

Key files:

- [client/src/pages/crm/invoices/Invoices.jsx](client/src/pages/crm/invoices/Invoices.jsx)
- [client/src/pages/crm/invoices/InvoiceDetail.jsx](client/src/pages/crm/invoices/InvoiceDetail.jsx)
- [client/src/pages/crm/invoices/CreateInvoiceSidebar.jsx](client/src/pages/crm/invoices/CreateInvoiceSidebar.jsx)
- [client/src/pages/crm/invoices/EditInvoiceSidebar.jsx](client/src/pages/crm/invoices/EditInvoiceSidebar.jsx)
- [server/routes/invoices.js](server/routes/invoices.js)
- [server/utils/invoiceService.js](server/utils/invoiceService.js)
- [server/utils/invoiceValidation.js](server/utils/invoiceValidation.js)

Workflow:

1. Create an invoice for a project/customer.
2. Review invoice detail and list views.
3. Send the invoice.
4. Archive or restore it.
5. Inspect invoice stats.

#### Payments

Key files:

- [client/src/pages/crm/payments/Payments.jsx](client/src/pages/crm/payments/Payments.jsx)
- [client/src/pages/crm/payments/PaymentDetail.jsx](client/src/pages/crm/payments/PaymentDetail.jsx)
- [client/src/pages/crm/payments/CreatePaymentSidebar.jsx](client/src/pages/crm/payments/CreatePaymentSidebar.jsx)
- [server/routes/payments.js](server/routes/payments.js)
- [server/utils/paymentValidation.js](server/utils/paymentValidation.js)

Workflow:

1. Record a payment.
2. Mark it complete or refund it.
3. View payment details and stats.

#### Receipts

Key files:

- [client/src/pages/crm/receipts/Receipts.jsx](client/src/pages/crm/receipts/Receipts.jsx)
- [client/src/pages/crm/receipts/ReceiptDetail.jsx](client/src/pages/crm/receipts/ReceiptDetail.jsx)
- [server/routes/receipts.js](server/routes/receipts.js)
- [server/utils/receiptValidation.js](server/utils/receiptValidation.js)

Workflow:

1. Create or record a receipt.
2. Send it if needed.
3. View receipt detail and totals.

#### Financial Overview

Key files:

- [client/src/pages/crm/financial/Financial.jsx](client/src/pages/crm/financial/Financial.jsx)
- [server/routes/financial.js](server/routes/financial.js)

This module aggregates:

- revenue overview
- receivables
- payment methods
- customer-level financial data
- overdue financial items

### 17. Notifications

Notifications have both a client inbox and a server push layer.

Key files:

- [client/src/components/notifications/NotificationBell.jsx](client/src/components/notifications/NotificationBell.jsx)
- [client/src/components/notifications/NotificationDropdown.jsx](client/src/components/notifications/NotificationDropdown.jsx)
- [client/src/components/notifications/NotificationItem.jsx](client/src/components/notifications/NotificationItem.jsx)
- [client/src/pages/NotificationsPage.jsx](client/src/pages/NotificationsPage.jsx)
- [client/src/store/notificationSlice.js](client/src/store/notificationSlice.js)
- [client/src/utils/socketService.js](client/src/utils/socketService.js)
- [server/routes/notifications.js](server/routes/notifications.js)
- [server/utils/notificationService.js](server/utils/notificationService.js)

Workflow:

1. The server creates or emits a notification.
2. Socket.IO sends it to connected clients.
3. The client stores the notification in Redux.
4. The notification bell and dropdown update.
5. The notifications page provides read/unread management.

### 18. Settings

The settings system is one of the most important project-scoped subsystems.

Key files:

- [client/src/pages/crm/Settings.jsx](client/src/pages/crm/Settings.jsx)
- [client/src/pages/crm/settings/GeneralSettings.jsx](client/src/pages/crm/settings/GeneralSettings.jsx)
- [client/src/pages/crm/settings/EmailSettings.jsx](client/src/pages/crm/settings/EmailSettings.jsx)
- [client/src/pages/crm/settings/NotificationSettings.jsx](client/src/pages/crm/settings/NotificationSettings.jsx)
- [client/src/pages/crm/settings/LeadSettings.jsx](client/src/pages/crm/settings/LeadSettings.jsx)
- [client/src/pages/crm/settings/DealSettings.jsx](client/src/pages/crm/settings/DealSettings.jsx)
- [client/src/pages/crm/settings/TaskSettings.jsx](client/src/pages/crm/settings/TaskSettings.jsx)
- [client/src/pages/crm/settings/CalendarSettings.jsx](client/src/pages/crm/settings/CalendarSettings.jsx)
- [client/src/pages/crm/settings/SecuritySettings.jsx](client/src/pages/crm/settings/SecuritySettings.jsx)
- [client/src/pages/crm/settings/IntegrationSettings.jsx](client/src/pages/crm/settings/IntegrationSettings.jsx)
- [client/src/pages/crm/settings/CustomFieldsSettings.jsx](client/src/pages/crm/settings/CustomFieldsSettings.jsx)
- [client/src/pages/crm/settings/BackupSettings.jsx](client/src/pages/crm/settings/BackupSettings.jsx)
- [client/src/pages/crm/settings/AnalyticsSettings.jsx](client/src/pages/crm/settings/AnalyticsSettings.jsx)
- [client/src/pages/crm/settings/README.md](client/src/pages/crm/settings/README.md)
- [client/src/pages/crm/settings/SETTINGS_INTEGRATION.md](client/src/pages/crm/settings/SETTINGS_INTEGRATION.md)
- [client/src/contexts/SettingsContext.jsx](client/src/contexts/SettingsContext.jsx)
- [client/src/hooks/useSettingsIntegration.js](client/src/hooks/useSettingsIntegration.js)
- [server/models/CrmSettings.model.js](server/models/CrmSettings.model.js)
- [server/routes/settings.js](server/routes/settings.js)
- [server/middleware/settingsMiddleware.js](server/middleware/settingsMiddleware.js)

Workflow:

1. Open the CRM settings page for a project.
2. Load the current project settings.
3. Edit a section such as general, email, notifications, leads, deals, tasks, calendar, security, integrations, custom fields, backup, or analytics.
4. Save the section through Redux and the backend API.
5. Optionally reset all settings back to defaults.

Important behavior:

- The client settings provider fetches settings automatically when `projectId` changes.
- The hooks in [client/src/hooks/useSettingsIntegration.js](client/src/hooks/useSettingsIntegration.js) expose convenient defaults and formatting helpers.
- The backend settings middleware can enforce working hours, duplicate detection, password policy, and other business rules based on stored settings.

### 19. System Administration

System-admin features are separate from project-scoped CRM features.

Key files:

- [client/src/pages/admin/AdminDashboard.jsx](client/src/pages/admin/AdminDashboard.jsx)
- [client/src/pages/admin/SystemAdminDashboard.jsx](client/src/pages/admin/SystemAdminDashboard.jsx)
- [client/src/pages/admin/CreateUser.jsx](client/src/pages/admin/CreateUser.jsx)
- [client/src/pages/admin/UserDetail.jsx](client/src/pages/admin/UserDetail.jsx)
- [server/routes/systemAdmin.js](server/routes/systemAdmin.js)
- [server/controllers/systemAdminController.js](server/controllers/systemAdminController.js)

Workflow:

1. A global `system-admin` opens the admin dashboard.
2. They can inspect global users and projects.
3. They can create, update, toggle, or delete users.
4. They can inspect project details at the platform level.

## Backend Request Flow

The server startup path in [server/server.js](server/server.js) is worth remembering because it explains a lot of the app behavior:

1. Load environment variables.
2. Create the Express app and HTTP server.
3. Initialize Socket.IO.
4. Connect to MongoDB.
5. Register JSON/body parsing middleware.
6. Apply CORS and security headers.
7. Log requests.
8. Register a `/health` endpoint.
9. Register all API route groups.
10. Register not-found and error handling.
11. Start the HTTP listener.
12. Start the scheduler.

### Important Middleware Patterns

- `authenticateToken` verifies the bearer token and loads the current user.
- `requireGlobalRole` enforces global platform roles.
- `requireViewerRole`, `requireManagerRole`, `requireAdminRole`, and related guards enforce project-level access.
- `requireEmailVerification` blocks certain project actions until email verification is complete.
- `injectSettings` loads the project's CRM settings into `req.settings`.
- `validateBusinessRules` can reject requests that violate project settings, such as outside working hours.

## State Management On The Client

Redux is used as the central client state layer.

### Store Slices

- [client/src/store/authSlice.js](client/src/store/authSlice.js) - auth session, current user, login/logout, verification state.
- [client/src/store/projectSlice.js](client/src/store/projectSlice.js) - projects, project detail, pipelines, stages, membership changes.
- [client/src/store/invitationSlice.js](client/src/store/invitationSlice.js) - invitation lifecycle.
- [client/src/store/notificationSlice.js](client/src/store/notificationSlice.js) - notification inbox state.
- [client/src/store/companySlice.js](client/src/store/companySlice.js) - company data.
- [client/src/store/leadSlice.js](client/src/store/leadSlice.js) - lead data.
- [client/src/store/customerSlice.js](client/src/store/customerSlice.js) - customer data.
- [client/src/store/dealSlice.js](client/src/store/dealSlice.js) - deal data.
- [client/src/store/taskSlice.js](client/src/store/taskSlice.js) - task data.
- [client/src/store/calendarSlice.js](client/src/store/calendarSlice.js) - calendar data.
- [client/src/store/dashboardSlice.js](client/src/store/dashboardSlice.js) - CRM analytics data.
- [client/src/store/settingsSlice.js](client/src/store/settingsSlice.js) - project settings data.
- [client/src/store/systemAdminSlice.js](client/src/store/systemAdminSlice.js) - admin data.
- [client/src/store/activitySlice.js](client/src/store/activitySlice.js) - activity stream data.
- [client/src/store/invoiceSlice.js](client/src/store/invoiceSlice.js) - invoice data.
- [client/src/store/paymentSlice.js](client/src/store/paymentSlice.js) - payment data.
- [client/src/store/receiptSlice.js](client/src/store/receiptSlice.js) - receipt data.
- [client/src/store/financialSlice.js](client/src/store/financialSlice.js) - financial aggregates.

### Client Bootstrapping Details

[client/src/main.jsx](client/src/main.jsx) does two important things before rendering:

- It initializes auth handling, which may reconnect sockets when a token exists.
- It renders the app inside the Redux provider.

## Real-Time Behavior

The app uses Socket.IO on both server and client.

### Client-Side Behavior

- [client/src/utils/socketService.js](client/src/utils/socketService.js) opens the socket connection using the current access token.
- It listens for `notification` events and dispatches them into Redux.
- It can join or leave a project room when the user enters or exits a project-scoped CRM route.
- It optionally shows browser notifications when permissions allow it.

### Server-Side Behavior

- [server/utils/socketService.js](server/utils/socketService.js) initializes the Socket.IO server.
- The server emits notifications and project-specific events to connected clients.

## Data Model Summary

### User

[server/models/User.model.js](server/models/User.model.js) handles:

- name, email, password, phone, profile image
- global role
- project ownership and project membership roles
- login attempt tracking and account lockout
- email verification and password reset tokens

### Project

[server/models/Project.model.js](server/models/Project.model.js) handles:

- project owner
- project members
- visibility
- description, tags, industry, timezone, branding
- pipelines and stages
- project-level settings such as currency, formats, and notification preferences

One important behavior: if a new project is saved without pipelines, the model creates a default sales pipeline with default stages.

### CRM Settings

[server/models/CrmSettings.model.js](server/models/CrmSettings.model.js) stores configurable settings sections:

- general
- email
- notifications
- leads
- deals
- tasks
- calendar
- security
- integrations
- custom fields
- backup
- analytics

### Business Records

The rest of the model files map to the major business objects:

- leads
- customers
- companies
- deals
- tasks
- calendar events
- invoices
- payments
- receipts
- notifications
- activities
- invitations

## API Route Groups At A Glance

The route files are designed as feature groups rather than a flat endpoint list.

### Auth Routes

[server/routes/auth.js](server/routes/auth.js)

- register
- login
- refresh token
- forgot password
- reset password
- verify email
- resend verification
- get/update current profile
- change password
- remove profile image
- logout

### Project Routes

[server/routes/projects.js](server/routes/projects.js)

- project CRUD
- member management
- ownership transfer
- pipeline CRUD
- stage CRUD
- stage reorder

### Invitation Routes

[server/routes/invitations.js](server/routes/invitations.js)

- create invitation
- view project invitations
- view your invitations
- fetch by token
- accept or decline invitation
- resend, cancel, or delete invitation

### CRM Data Routes

The main CRM data routes all follow a similar pattern: list, detail, create, update, archive/delete, stats/insights/forecast, and bulk actions where appropriate.

- [server/routes/companies.js](server/routes/companies.js)
- [server/routes/leads.js](server/routes/leads.js)
- [server/routes/customers.js](server/routes/customers.js)
- [server/routes/deals.js](server/routes/deals.js)
- [server/routes/tasks.js](server/routes/tasks.js)
- [server/routes/calendar.js](server/routes/calendar.js)
- [server/routes/invoices.js](server/routes/invoices.js)
- [server/routes/payments.js](server/routes/payments.js)
- [server/routes/receipts.js](server/routes/receipts.js)

### Reporting And Analytics Routes

- [server/routes/dashboard.js](server/routes/dashboard.js)
- [server/routes/reports.js](server/routes/reports.js)
- [server/routes/performance.js](server/routes/performance.js)
- [server/routes/financial.js](server/routes/financial.js)
- [server/routes/activities.js](server/routes/activities.js)

### Settings And Admin Routes

- [server/routes/settings.js](server/routes/settings.js)
- [server/routes/systemAdmin.js](server/routes/systemAdmin.js)
- [server/routes/users.js](server/routes/users.js)
- [server/routes/notifications.js](server/routes/notifications.js)

## Implementation Notes Worth Remembering

- [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx) is a presentation dashboard and currently uses example metrics rather than live CRM API data.
- [client/src/pages/crm/CrmDashboard.jsx](client/src/pages/crm/CrmDashboard.jsx) is the live analytics dashboard.
- [client/src/layouts/CrmLayout.jsx](client/src/layouts/CrmLayout.jsx) is the main place where project-room Socket.IO membership is managed.
- [client/src/contexts/SettingsContext.jsx](client/src/contexts/SettingsContext.jsx) automatically reloads settings when the URL project ID changes.
- [client/src/utils/axiosConfig.js](client/src/utils/axiosConfig.js) is where token refresh happens transparently.
- [server/server.js](server/server.js) attaches settings-aware middleware to many CRM routes, so business rules can change per project without changing controller code.
- [server/middleware/auth.js](server/middleware/auth.js) is the source of truth for global vs project-level access control.

## If You Need A Fast Mental Model

Think of the product as:

1. A public marketing website.
2. A user account system.
3. A project container system.
4. A CRM workspace inside each project.
5. A settings layer that changes the behavior of the CRM workspace.
6. A live notification system that keeps the workspace current.
7. A system-admin layer that controls the whole platform.

## Useful References

- [client/README.md](client/README.md) - starter Vite/React notes.
- [server/README.md](server/README.md) - older backend documentation focused on auth and multi-tenant concepts.
- [client/src/pages/crm/settings/README.md](client/src/pages/crm/settings/README.md) - settings module reference.
- [client/src/pages/crm/settings/SETTINGS_INTEGRATION.md](client/src/pages/crm/settings/SETTINGS_INTEGRATION.md) - settings integration notes.

## What To Read First If You Are Re-Entering The Codebase

If you only have time to inspect a few files before changing behavior, start here:

1. [client/src/App.jsx](client/src/App.jsx)
2. [client/src/main.jsx](client/src/main.jsx)
3. [client/src/utils/axiosConfig.js](client/src/utils/axiosConfig.js)
4. [client/src/layouts/CrmLayout.jsx](client/src/layouts/CrmLayout.jsx)
5. [client/src/contexts/SettingsContext.jsx](client/src/contexts/SettingsContext.jsx)
6. [server/server.js](server/server.js)
7. [server/middleware/auth.js](server/middleware/auth.js)
8. [server/models/User.model.js](server/models/User.model.js)
9. [server/models/Project.model.js](server/models/Project.model.js)
10. [server/models/CrmSettings.model.js](server/models/CrmSettings.model.js)

## Final Notes

This README documents the current structure and behavior as reflected in the codebase. The CRM is clearly split into public, authenticated, project-scoped, and system-admin layers, and most of the complexity comes from role-based access, per-project settings, and the wide set of CRM modules that all hang off a single project ID.

If you make major architectural changes later, update this README first so future-you does not have to rediscover the whole system from scratch.