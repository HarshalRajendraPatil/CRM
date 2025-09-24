# CRM Settings

This directory contains all the settings components for the CRM system. Each component handles a specific aspect of CRM configuration.

## Components

### GeneralSettings.jsx
- CRM name and description
- Regional settings (timezone, currency, language)
- Display preferences (date/time format)

### EmailSettings.jsx
- Email configuration (from name, email addresses)
- Email signature
- Auto-responder settings

### NotificationSettings.jsx
- Email notification preferences
- In-app notification settings
- Notification frequency controls

### LeadSettings.jsx
- Auto-assignment rules
- Lead scoring configuration
- Duplicate detection settings

### DealSettings.jsx
- Default currency and probability
- Auto-close settings
- Deal stage configuration

### TaskSettings.jsx
- Default priority and type
- Auto-reminder settings
- Time tracking configuration

### CalendarSettings.jsx
- Working hours configuration
- Event duration and buffer settings
- Time slot preferences

### SecuritySettings.jsx
- Session timeout settings
- Password policy configuration
- Two-factor authentication
- IP whitelist management

### IntegrationSettings.jsx
- Google Calendar integration
- Slack notifications
- Webhook configuration

### CustomFieldsSettings.jsx
- Custom field creation and management
- Field validation rules
- Display preferences

### BackupSettings.jsx
- Automated backup configuration
- Data retention settings
- Manual backup controls

### AnalyticsSettings.jsx
- Analytics tracking preferences
- Data retention policies
- Automated reporting

## Usage

All settings components follow the same pattern:

1. **Props**: Receive settings data, update handlers, and configuration
2. **State Management**: Use local state for form data and changes
3. **Validation**: Client-side validation before saving
4. **Persistence**: Save changes via Redux actions

## Features

- **Real-time Updates**: Changes are saved immediately
- **Validation**: Client and server-side validation
- **Permissions**: Role-based access control
- **Reset Functionality**: Reset to default settings
- **Preview**: Live preview of settings changes

## Integration

Settings are integrated with:
- Redux store for state management
- Backend API for persistence
- Real-time updates via WebSocket
- Role-based permissions
