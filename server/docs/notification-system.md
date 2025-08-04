# Notification System Documentation

## Overview

The notification system provides real-time in-app notifications for various events within the CRM platform. It supports multiple notification types, prioritization, and real-time delivery through WebSockets.

## Features

- **Real-time notifications** via Socket.IO
- **Notification types** for different events (project invitations, task assignments, etc.)
- **Priority levels** (low, medium, high, urgent)
- **Read/unread status** tracking
- **Pagination and filtering** for notification retrieval
- **Notification expiration** for automatic cleanup
- **Bulk operations** for marking multiple notifications as read
- **Project-specific notifications** for team collaboration

## Notification Model

### Core Fields

| Field       | Type                | Description                                         |
|-------------|---------------------|-----------------------------------------------------|
| recipient   | ObjectId (User)     | User who receives the notification                  |
| project     | ObjectId (Project)  | Related project (optional)                          |
| sender      | ObjectId (User)     | User who triggered the notification (optional)      |
| message     | String              | Notification message content                        |
| title       | String              | Short title for the notification                    |
| type        | String (enum)       | Type of notification (see below)                    |
| isRead      | Boolean             | Whether the notification has been read              |
| link        | String              | URL path to navigate when clicking the notification |
| priority    | String (enum)       | Priority level (low, medium, high, urgent)          |
| metadata    | Object              | Additional contextual data                          |
| expiresAt   | Date                | When the notification should expire                 |
| createdAt   | Date                | When the notification was created                   |
| updatedAt   | Date                | When the notification was last updated              |

### Notification Types

- **Project Management**
  - `project_invitation`: Invitation to join a project
  - `project_role_change`: User role changed in a project
  - `project_removed`: User removed from a project

- **Pipeline Management**
  - `pipeline_created`: New pipeline created
  - `pipeline_updated`: Pipeline updated
  - `pipeline_deleted`: Pipeline deleted
  - `stage_created`: New stage created
  - `stage_updated`: Stage updated
  - `stage_deleted`: Stage deleted

- **Deal Management**
  - `deal_created`: New deal created
  - `deal_updated`: Deal updated
  - `deal_moved`: Deal moved to a different stage
  - `deal_assigned`: Deal assigned to a user

- **Task Management**
  - `task_created`: New task created
  - `task_updated`: Task updated
  - `task_completed`: Task marked as completed
  - `task_assigned`: Task assigned to a user

- **Communication**
  - `comment_added`: New comment added
  - `mention`: User mentioned in a comment

- **System**
  - `system_alert`: System-level alert or announcement

## API Endpoints

### Get User Notifications

```
GET /api/notifications
```

**Query Parameters:**
- `limit`: Number of notifications to return (default: 20)
- `skip`: Number of notifications to skip (for pagination)
- `isRead`: Filter by read status (true/false)
- `type`: Filter by notification type
- `project`: Filter by project ID

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "recipient": {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "project": {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "Project X"
        },
        "sender": {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "message": "You have been invited to join Project X",
        "title": "Project Invitation",
        "type": "project_invitation",
        "isRead": false,
        "link": "/invitations/abc123",
        "priority": "high",
        "createdAt": "2023-06-23T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "unreadCount": 12,
      "limit": 20,
      "skip": 0,
      "hasMore": true
    }
  }
}
```

### Get Notification by ID

```
GET /api/notifications/:id
```

### Mark Notification as Read

```
PUT /api/notifications/:id/read
```

### Mark All Notifications as Read

```
PUT /api/notifications/read-all
```

**Request Body:**
```json
{
  "type": "task_assigned",  // Optional: filter by type
  "project": "60d21b4667d0d8992e610c85"  // Optional: filter by project
}
```

### Get Unread Count

```
GET /api/notifications/unread-count
```

### Delete Notification

```
DELETE /api/notifications/:id
```

### Delete All Notifications

```
DELETE /api/notifications
```

**Request Body:**
```json
{
  "type": "task_assigned",  // Optional: filter by type
  "project": "60d21b4667d0d8992e610c85",  // Optional: filter by project
  "isRead": true  // Optional: filter by read status
}
```

### Create Notification (Admin Only)

```
POST /api/notifications
```

**Request Body:**
```json
{
  "recipientId": "60d21b4667d0d8992e610c85",
  "projectId": "60d21b4667d0d8992e610c85",
  "message": "Important system maintenance scheduled",
  "title": "System Maintenance",
  "type": "system_alert",
  "link": "/announcements/maintenance",
  "priority": "high",
  "metadata": {
    "maintenanceStart": "2023-07-01T02:00:00.000Z",
    "maintenanceEnd": "2023-07-01T04:00:00.000Z"
  }
}
```

## Socket.IO Integration

### Client-Side Connection

```javascript
// Connect to Socket.IO server with authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // Update UI or show notification toast
});

// Join project room to receive project-specific notifications
socket.emit('join-project', 'project-id');

// Leave project room when navigating away
socket.emit('leave-project', 'project-id');
```

## Notification Service

The notification service provides helper functions for creating different types of notifications:

### Available Helper Functions

- `createAndEmitNotification`: Create a single notification and emit via socket
- `createBulkNotifications`: Create notifications for multiple recipients
- `createProjectNotification`: Create notifications for all project members
- `createInvitationNotification`: Create notification for project invitation
- `createRoleChangeNotification`: Create notification for role change
- `createPipelineNotification`: Create notification for pipeline events
- `createStageNotification`: Create notification for stage events
- `createDealNotification`: Create notification for deal events
- `createTaskNotification`: Create notification for task events
- `createCommentNotification`: Create notification for comments and mentions
- `createSystemAlertNotification`: Create system-level alert notification

### Example Usage

```javascript
// Import the notification service
import notificationService from '../utils/notificationService.js';

// Create a task assignment notification
await notificationService.createTaskNotification(
  'assigned',
  task,
  projectId,
  currentUserId,
  { assigneeId: task.assignee }
);
```

## Best Practices

1. **Use appropriate notification types** for different events
2. **Set proper priority levels** based on urgency
3. **Include meaningful messages** that provide context
4. **Set expiration dates** for time-sensitive notifications
5. **Batch notifications** when possible to avoid overwhelming users
6. **Include deep links** to relevant content
7. **Use metadata** for additional context and filtering

## Implementation Considerations

- **Performance**: Notifications are indexed for efficient querying
- **Scalability**: The system supports high notification volumes
- **Cleanup**: Expired notifications are automatically removed
- **Security**: Notifications are scoped to recipients only
- **Real-time**: Socket.IO ensures immediate delivery when users are online