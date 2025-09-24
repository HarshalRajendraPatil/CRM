# CRM Settings Integration Guide

This document explains how CRM settings are integrated throughout the application to provide a consistent and personalized experience.

## Overview

The CRM settings system allows each project to have its own configuration that affects:
- Default values for new records
- Display formatting (currency, dates, time)
- Business rules and validation
- Notification preferences
- Security policies
- Integration settings

## Architecture

### Frontend Integration

#### 1. Settings Context Provider
- **File**: `client/src/contexts/SettingsContext.jsx`
- **Purpose**: Provides settings to all CRM components
- **Usage**: Automatically wraps all CRM pages via `CrmLayout`

#### 2. Settings Utilities
- **File**: `client/src/utils/settingsUtils.js`
- **Purpose**: Utility functions for formatting and applying settings
- **Key Functions**:
  - `formatCurrency()` - Format amounts based on CRM currency
  - `formatDate()` - Format dates based on CRM date format
  - `formatTime()` - Format time based on CRM time format
  - `getCrmName()` - Get the CRM name for display
  - `isEmailNotificationEnabled()` - Check notification preferences

#### 3. Settings Integration Hook
- **File**: `client/src/hooks/useSettingsIntegration.js`
- **Purpose**: Comprehensive hook for accessing all settings
- **Usage**: `const { crmName, defaultDealCurrency, workingHours } = useSettingsIntegration();`

### Backend Integration

#### 1. Settings Middleware
- **File**: `server/middleware/settingsMiddleware.js`
- **Purpose**: Automatically injects and applies settings to API requests
- **Key Middleware**:
  - `injectSettings` - Loads settings for the project
  - `applyDefaultValues` - Applies default values based on settings
  - `validateBusinessRules` - Validates business rules from settings
  - `checkNotificationSettings` - Applies notification preferences

#### 2. Settings Model
- **File**: `server/models/CrmSettings.model.js`
- **Purpose**: Defines the settings schema and validation
- **Features**: 12 main setting categories with comprehensive configuration options

## Settings Categories

### 1. General Settings
**Affects**: CRM name, timezone, date/time formats, currency, language
**Integration Points**:
- CRM name displayed in sidebar and headers
- Date/time formatting throughout the application
- Currency formatting for deals and financial data
- Timezone handling for calendar events

### 2. Email Settings
**Affects**: Email configuration, signatures, auto-responders
**Integration Points**:
- Email templates use configured sender information
- Auto-responders for lead inquiries
- Email signatures in all outgoing emails

### 3. Notification Settings
**Affects**: Email and in-app notification preferences
**Integration Points**:
- Notification bell shows/hides based on preferences
- Email notifications sent based on user preferences
- Sound notifications enabled/disabled

### 4. Lead Settings
**Affects**: Auto-assignment, scoring, duplicate detection
**Integration Points**:
- New leads automatically assigned based on settings
- Lead scoring calculated using configured weights
- Duplicate detection runs on specified fields
- Lead forms pre-populate with default values

### 5. Deal Settings
**Affects**: Default currency, probability, pipeline stages
**Integration Points**:
- New deals use default currency and probability
- Deal value formatting uses configured currency
- Pipeline stages can be customized per CRM

### 6. Task Settings
**Affects**: Default priority, type, auto-reminders, time tracking
**Integration Points**:
- New tasks use default priority and type
- Auto-reminders sent based on configured timing
- Time tracking enabled/disabled per CRM
- Task forms pre-populate with defaults

### 7. Calendar Settings
**Affects**: Working hours, default duration, buffer time
**Integration Points**:
- Calendar events respect working hours
- Default event duration applied to new events
- Buffer time between events enforced
- Working days configuration affects availability

### 8. Security Settings
**Affects**: Session timeout, password policy, 2FA, IP whitelist
**Integration Points**:
- Session timeout enforced per CRM
- Password validation uses configured policy
- 2FA required based on settings
- IP whitelist restricts access

### 9. Integration Settings
**Affects**: Google Calendar, Slack, webhooks
**Integration Points**:
- Google Calendar sync uses configured calendar
- Slack notifications sent to configured channel
- Webhooks triggered based on settings

### 10. Custom Fields Settings
**Affects**: Custom fields for leads, customers, deals, companies
**Integration Points**:
- Custom fields displayed in forms
- Field validation based on configuration
- Custom field data stored and retrieved

### 11. Backup Settings
**Affects**: Automated backups, retention policies
**Integration Points**:
- Automated backups scheduled based on settings
- Data retention enforced
- Backup notifications sent

### 12. Analytics Settings
**Affects**: Tracking, data retention, reporting
**Integration Points**:
- Analytics tracking enabled/disabled
- Data retention policies enforced
- Automated reports generated

## Implementation Examples

### 1. Currency Formatting
```javascript
// In any component
import { useSettingsIntegration } from '../hooks/useSettingsIntegration';

const DealCard = ({ deal }) => {
  const { formatCurrency } = useSettingsIntegration();
  
  return (
    <div>
      <h3>{deal.name}</h3>
      <p>Value: {formatCurrency(deal.value)}</p>
    </div>
  );
};
```

### 2. Default Values in Forms
```javascript
// In CreateDealSidebar.jsx
const { defaultDealCurrency, defaultDealProbability } = useSettingsIntegration();

const [formData, setFormData] = useState({
  currency: defaultDealCurrency,
  probability: defaultDealProbability,
  // ... other fields
});
```

### 3. Working Hours Validation
```javascript
// In CreateEventSidebar.jsx
const { workingHours } = useSettingsIntegration();

const validateEventTime = (startTime) => {
  if (workingHours.enabled) {
    return startTime >= workingHours.startTime && startTime <= workingHours.endTime;
  }
  return true;
};
```

### 4. Notification Preferences
```javascript
// In notification service
const { isEmailNotificationEnabled } = useSettingsIntegration();

const sendNotification = (type, data) => {
  if (isEmailNotificationEnabled(type)) {
    // Send email notification
  }
};
```

## Backend Integration Examples

### 1. Default Values Middleware
```javascript
// Automatically applied to all API routes
app.use('/api/deals', injectSettings, applyDefaultValues, dealRoutes);

// In deal controller
const createDeal = async (req, res) => {
  // req.body already has default values applied
  const deal = new Deal(req.body);
  await deal.save();
};
```

### 2. Business Rules Validation
```javascript
// In lead controller
const createLead = async (req, res) => {
  // Duplicate detection runs automatically
  if (req.duplicateCheckFields) {
    const duplicate = await checkForDuplicates(req.body, req.duplicateCheckFields);
    if (duplicate) {
      return res.status(400).json({ message: 'Duplicate lead detected' });
    }
  }
};
```

### 3. Working Hours Validation
```javascript
// In calendar controller
const createEvent = async (req, res) => {
  // Working hours validation runs automatically
  // If event is outside working hours, returns error
};
```

## Settings Inheritance

Settings are applied in the following order:
1. **Default Settings** - System defaults
2. **Project Settings** - CRM-specific settings
3. **User Preferences** - Individual user overrides (future)

## Performance Considerations

- Settings are cached in Redux store
- Backend settings are loaded once per request
- Settings changes trigger immediate updates
- Bulk operations respect settings efficiently

## Testing Settings Integration

### Frontend Testing
```javascript
// Mock settings in tests
const mockSettings = {
  general: { currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
  deals: { defaultCurrency: 'EUR', defaultProbability: 75 }
};

// Test currency formatting
expect(formatCurrency(1000, mockSettings)).toBe('€1,000');
```

### Backend Testing
```javascript
// Test middleware
const req = { params: { projectId: '123' } };
const res = {};
const next = jest.fn();

await injectSettings(req, res, next);
expect(req.settings).toBeDefined();
```

## Migration and Updates

When settings are updated:
1. Frontend immediately reflects changes
2. Backend applies new rules to subsequent requests
3. Existing data is not retroactively changed
4. New records use updated settings

## Troubleshooting

### Common Issues
1. **Settings not loading**: Check if projectId is correct
2. **Default values not applied**: Verify middleware is applied to routes
3. **Formatting issues**: Check settings utilities are imported
4. **Validation errors**: Verify business rules middleware is active

### Debug Tools
- Settings context provides loading state
- Backend middleware logs settings injection
- Redux DevTools show settings state
- Network tab shows settings API calls

## Future Enhancements

1. **User-level overrides**: Allow individual users to override project settings
2. **Settings templates**: Pre-configured settings for different industries
3. **Settings import/export**: Backup and restore settings
4. **Advanced validation**: More complex business rules
5. **Settings analytics**: Track which settings are most used
