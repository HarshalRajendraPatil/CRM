# Invitation System Documentation

## Overview

The Invitation System is a dedicated component of the CRM Platform that manages project member invitations. It provides a robust way to invite users to join projects, track invitation status, and handle acceptance or rejection of invitations.

## Features

- ✅ Dedicated invitation model with complete lifecycle tracking
- ✅ Secure token-based invitation mechanism
- ✅ Email notifications for invitations
- ✅ Support for personalized invitation messages
- ✅ Invitation expiration and resending capabilities
- ✅ Comprehensive invitation management for project owners and admins
- ✅ Seamless integration with the project management system

## Invitation Model

The Invitation model represents an invitation to join a project:

```javascript
{
  project: ObjectId,          // Reference to Project model
  inviter: ObjectId,          // Reference to User model (who sent the invitation)
  invitee: {
    email: String,            // Email address of the invitee
    user: ObjectId            // Reference to User model (if registered)
  },
  role: String,               // Role to assign (admin, manager, sales_executive, support_executive, viewer)
  status: String,             // pending, accepted, declined, expired, revoked
  token: String,              // Secure random token for invitation link
  message: String,            // Optional personal message
  expiresAt: Date,            // When the invitation expires
  acceptedAt: Date,           // When the invitation was accepted
  lastSentAt: Date,           // When the invitation was last sent
  resendCount: Number         // How many times the invitation has been resent
}
```

## Invitation Workflow

1. **Creation**: Project owner/admin/manager creates an invitation for a user by email
2. **Notification**: System sends an email with a secure invitation link
3. **Response**: Recipient accepts or declines the invitation
4. **Integration**: Upon acceptance, user is added to the project with the specified role
5. **Management**: Invitations can be tracked, resent, or revoked by project administrators

## API Endpoints

### Invitation Management

#### Create a new invitation
- **POST** `/api/invitations`
- **Access**: Private (project owner, admin, or manager)
- **Description**: Creates a new invitation and sends an email
- **Request Body**:
  ```json
  {
    "projectId": "project_id",
    "email": "user@example.com",
    "role": "manager",
    "message": "Hey, please join our project!",
    "expirationDays": 7
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invitation sent successfully",
    "data": {
      "invitation": {
        "_id": "invitation_id",
        "project": {
          "_id": "project_id",
          "name": "Project Name",
          "description": "Project description"
        },
        "inviter": {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "profileImage": "https://example.com/profile.jpg"
        },
        "invitee": {
          "email": "user@example.com",
          "user": null
        },
        "role": "manager",
        "status": "pending",
        "token": "secure_random_token",
        "message": "Hey, please join our project!",
        "expiresAt": "2024-01-08T00:00:00.000Z",
        "lastSentAt": "2024-01-01T00:00:00.000Z",
        "resendCount": 0,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
  ```

#### Get all invitations for a project
- **GET** `/api/invitations/project/:projectId`
- **Access**: Private (project owner, admin, or manager)
- **Description**: Gets all invitations for a specific project
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "invitations": [
        {
          "_id": "invitation_id",
          "project": "project_id",
          "inviter": {
            "_id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "profileImage": "https://example.com/profile.jpg"
          },
          "invitee": {
            "email": "user@example.com",
            "user": {
              "_id": "user_id",
              "name": "Jane Smith",
              "email": "user@example.com",
              "profileImage": "https://example.com/jane.jpg"
            }
          },
          "role": "manager",
          "status": "pending",
          "token": "secure_random_token",
          "expiresAt": "2024-01-08T00:00:00.000Z",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get all invitations for current user
- **GET** `/api/invitations/me`
- **Access**: Private
- **Description**: Gets all pending invitations for the current user
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "invitations": [
        {
          "_id": "invitation_id",
          "project": {
            "_id": "project_id",
            "name": "Project Name",
            "description": "Project description",
            "logo": "https://example.com/logo.png"
          },
          "inviter": {
            "_id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "profileImage": "https://example.com/profile.jpg"
          },
          "invitee": {
            "email": "user@example.com",
            "user": null
          },
          "role": "manager",
          "status": "pending",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get invitation by token
- **GET** `/api/invitations/:token`
- **Access**: Public (but token must be valid)
- **Description**: Gets invitation details by token
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "invitation": {
        "_id": "invitation_id",
        "project": {
          "_id": "project_id",
          "name": "Project Name",
          "description": "Project description",
          "owner": "user_id"
        },
        "inviter": {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "profileImage": "https://example.com/profile.jpg"
        },
        "invitee": {
          "email": "user@example.com",
          "user": null
        },
        "role": "manager",
        "status": "pending",
        "token": "secure_random_token",
        "message": "Hey, please join our project!",
        "expiresAt": "2024-01-08T00:00:00.000Z"
      }
    }
  }
  ```

#### Accept invitation
- **PUT** `/api/invitations/:token/accept`
- **Access**: Private
- **Description**: Accepts an invitation and adds user to project
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invitation accepted successfully",
    "data": {
      "project": {
        "_id": "project_id",
        "name": "Project Name",
        "description": "Project description",
        "owner": "user_id",
        "members": [
          {
            "user": "current_user_id",
            "role": "manager",
            "inviteStatus": "accepted",
            "invitedBy": "inviter_id",
            "invitedAt": "2024-01-01T00:00:00.000Z",
            "joinedAt": "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    }
  }
  ```

#### Decline invitation
- **PUT** `/api/invitations/:token/decline`
- **Access**: Private
- **Description**: Declines an invitation
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invitation declined successfully"
  }
  ```

#### Resend invitation
- **PUT** `/api/invitations/:id/resend`
- **Access**: Private (project owner, admin, or manager)
- **Description**: Resends an invitation email and resets expiration
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invitation resent successfully",
    "data": {
      "invitation": {
        // Updated invitation details
      }
    }
  }
  ```

#### Cancel invitation
- **PUT** `/api/invitations/:id/cancel`
- **Access**: Private (project owner, admin, or manager)
- **Description**: Cancels a pending invitation
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invitation cancelled successfully"
  }
  ```

#### Delete invitation
- **DELETE** `/api/invitations/:id`
- **Access**: Private (project owner, admin, or system-admin)
- **Description**: Permanently deletes an invitation
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invitation deleted successfully"
  }
  ```

## Integration with Project Management

The Invitation System is tightly integrated with the Project Management System:

1. **Member Addition**: The `addProjectMember` endpoint in the Project Controller now redirects to the Invitation System
2. **Invitation Response**: When an invitation is accepted, the user is automatically added to the project with the specified role
3. **Backward Compatibility**: Legacy endpoints now redirect to the Invitation System for seamless integration

## Security Features

- **Secure Tokens**: Invitations use cryptographically secure random tokens
- **Expiration**: Invitations automatically expire after a configurable period (default: 7 days)
- **Email Verification**: Only the recipient of the invitation email can accept it
- **Permission Checks**: Only authorized users can create, resend, or cancel invitations
- **Status Tracking**: Complete audit trail of invitation lifecycle

## Email Notifications

The system sends email notifications for:

- Initial invitation with a secure link
- Invitation resends

Email templates include:
- Project name and description
- Inviter's name
- Optional personal message
- Secure acceptance link
- Expiration information

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

Common error scenarios:
- Invalid invitation token
- Expired invitation
- Already accepted/declined invitation
- Insufficient permissions
- Email address mismatch

## Best Practices

1. **Set appropriate expiration**: Default is 7 days, but can be customized based on urgency
2. **Include personal messages**: Personalized invitations have higher acceptance rates
3. **Manage invitations**: Regularly check and clean up expired or declined invitations
4. **Assign appropriate roles**: Only give users the permissions they need
5. **Limit resends**: Avoid resending invitations too frequently to prevent spam