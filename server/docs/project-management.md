# Project Management System Documentation

## Overview

The Project Management System is a core component of the CRM Platform, enabling users to create and manage multiple independent CRM instances (tenants). Each project can have its own members, pipelines, and stages, providing a flexible and customizable environment for various business needs.

## Features

- ✅ Multi-tenant architecture with isolated CRM instances
- ✅ Project ownership and member management with role-based permissions
- ✅ Customizable pipelines with reorderable stages
- ✅ Project invitations system
- ✅ Project settings and metadata (industry, tags, timezone, etc.)
- ✅ Ownership transfer capabilities
- ✅ Comprehensive validation and error handling

## Project Model

The Project model represents a tenant in the multi-tenant architecture:

```javascript
{
  name: String,              // Project name
  owner: ObjectId,           // Reference to User model
  members: [{                // Array of project members
    user: ObjectId,          // Reference to User model
    role: String,            // admin, manager, sales_executive, support_executive, viewer
    inviteStatus: String,    // pending, accepted, declined
    invitedBy: ObjectId,     // Reference to User model
    invitedAt: Date,
    joinedAt: Date
  }],
  visibility: String,        // public, private, team
  description: String,
  industry: String,
  tags: [String],
  timezone: String,
  logo: String,
  pipelines: [{              // Array of pipelines
    name: String,
    description: String,
    isDefault: Boolean,
    isArchived: Boolean,
    stages: [{               // Array of stages in the pipeline
      name: String,
      description: String,
      order: Number,
      color: String,
      isDefault: Boolean,
      isArchived: Boolean
    }]
  }],
  isActive: Boolean,
  settings: {
    currency: String,
    dateFormat: String,
    timeFormat: String,
    language: String,
    notificationSettings: {
      email: Boolean,
      inApp: Boolean
    }
  }
}
```

## Role Hierarchy

### Project Roles
1. **Owner** - Full access to the project, can transfer ownership
2. **Admin** - Full administrative access within the project
3. **Manager** - Management-level access, can create/edit pipelines and stages
4. **Sales Executive** - Sales-related access
5. **Support Executive** - Support-related access
6. **Viewer** - Read-only access

## API Endpoints

### Project Management

#### Create a new project
- **POST** `/api/projects`
- **Access**: Private (authenticated, email verified)
- **Description**: Creates a new project/tenant
- **Request Body**:
  ```json
  {
    "name": "My CRM Project",
    "description": "Project description",
    "visibility": "private",
    "industry": "Technology",
    "tags": ["tech", "saas"],
    "timezone": "UTC",
    "logo": "https://example.com/logo.png"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Project created successfully",
    "data": {
      "project": {
        "_id": "project_id",
        "name": "My CRM Project",
        "owner": "user_id",
        "description": "Project description",
        "visibility": "private",
        "industry": "Technology",
        "tags": ["tech", "saas"],
        "timezone": "UTC",
        "logo": "https://example.com/logo.png",
        "pipelines": [
          {
            "_id": "pipeline_id",
            "name": "Sales Pipeline",
            "description": "Default sales pipeline",
            "isDefault": true,
            "stages": [
              {
                "_id": "stage_id",
                "name": "Lead",
                "order": 0,
                "isDefault": true
              },
              // ... other default stages
            ]
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
  ```

#### Get all user projects
- **GET** `/api/projects`
- **Access**: Private
- **Description**: Gets all projects where the user is owner or member
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of results per page (default: 10)
  - `search`: Search term for project name or description
  - `active`: Filter by active status (true/false)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "projects": [
        {
          "_id": "project_id",
          "name": "My CRM Project",
          "owner": {
            "_id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "profileImage": "https://example.com/profile.jpg"
          },
          "description": "Project description",
          "visibility": "private",
          "industry": "Technology",
          "tags": ["tech", "saas"],
          "timezone": "UTC",
          "logo": "https://example.com/logo.png",
          "members": [
            {
              "user": {
                "_id": "user_id",
                "name": "Jane Smith",
                "email": "jane@example.com",
                "profileImage": "https://example.com/jane.jpg"
              },
              "role": "admin",
              "inviteStatus": "accepted",
              "invitedBy": {
                "_id": "user_id",
                "name": "John Doe",
                "email": "john@example.com"
              },
              "invitedAt": "2024-01-01T00:00:00.000Z",
              "joinedAt": "2024-01-01T00:00:00.000Z"
            }
          ],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "pages": 1
      }
    }
  }
  ```

#### Get project by ID
- **GET** `/api/projects/:id`
- **Access**: Private (project members only)
- **Description**: Gets a specific project by ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "project": {
        "_id": "project_id",
        "name": "My CRM Project",
        "owner": {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "profileImage": "https://example.com/profile.jpg"
        },
        "description": "Project description",
        "visibility": "private",
        "industry": "Technology",
        "tags": ["tech", "saas"],
        "timezone": "UTC",
        "logo": "https://example.com/logo.png",
        "members": [
          {
            "user": {
              "_id": "user_id",
              "name": "Jane Smith",
              "email": "jane@example.com",
              "profileImage": "https://example.com/jane.jpg"
            },
            "role": "admin",
            "inviteStatus": "accepted",
            "invitedBy": {
              "_id": "user_id",
              "name": "John Doe",
              "email": "john@example.com"
            },
            "invitedAt": "2024-01-01T00:00:00.000Z",
            "joinedAt": "2024-01-01T00:00:00.000Z"
          }
        ],
        "pipelines": [
          {
            "_id": "pipeline_id",
            "name": "Sales Pipeline",
            "description": "Default sales pipeline",
            "isDefault": true,
            "stages": [
              {
                "_id": "stage_id",
                "name": "Lead",
                "order": 0,
                "isDefault": true
              },
              // ... other stages
            ]
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
  ```

#### Update project
- **PUT** `/api/projects/:id`
- **Access**: Private (project owner, admin)
- **Description**: Updates a project's details
- **Request Body**:
  ```json
  {
    "name": "Updated Project Name",
    "description": "Updated description",
    "visibility": "team",
    "industry": "Finance",
    "tags": ["finance", "banking"],
    "timezone": "America/New_York",
    "logo": "https://example.com/new-logo.png",
    "isActive": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Project updated successfully",
    "data": {
      "project": {
        // Updated project details
      }
    }
  }
  ```

#### Delete project
- **DELETE** `/api/projects/:id`
- **Access**: Private (project owner, system-admin)
- **Description**: Deletes a project and removes references from all users
- **Response**:
  ```json
  {
    "success": true,
    "message": "Project deleted successfully"
  }
  ```

### Project Members Management

#### Add member to project
- **POST** `/api/projects/:id/members`
- **Access**: Private (project owner, admin)
- **Description**: Invites a user to join the project
- **Request Body**:
  ```json
  {
    "email": "newmember@example.com",
    "role": "manager"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invitation sent successfully",
    "data": {
      "project": {
        // Project details with updated members array
      }
    }
  }
  ```

#### Update project member role
- **PUT** `/api/projects/:id/members/:userId`
- **Access**: Private (project owner, admin)
- **Description**: Updates a member's role in the project
- **Request Body**:
  ```json
  {
    "role": "admin"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Member role updated successfully",
    "data": {
      "project": {
        // Project details with updated members array
      }
    }
  }
  ```

#### Remove project member
- **DELETE** `/api/projects/:id/members/:userId`
- **Access**: Private (project owner, admin, or self-removal)
- **Description**: Removes a member from the project
- **Response**:
  ```json
  {
    "success": true,
    "message": "Member removed successfully",
    "data": {
      "project": {
        // Project details with updated members array
      }
    }
  }
  ```

#### Respond to project invitation
- **PUT** `/api/projects/:id/invitation`
- **Access**: Private (invited user only)
- **Description**: Accept or decline a project invitation
- **Request Body**:
  ```json
  {
    "accept": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invitation accepted successfully",
    "data": {
      "project": {
        // Project details
      }
    }
  }
  ```

#### Get user's pending invitations
- **GET** `/api/projects/invitations`
- **Access**: Private
- **Description**: Gets all pending project invitations for the current user
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "invitations": [
        {
          "_id": "project_id",
          "name": "Project Name",
          "description": "Project description",
          "logo": "https://example.com/logo.png",
          "industry": "Technology",
          "tags": ["tech", "saas"],
          "owner": {
            "_id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "profileImage": "https://example.com/profile.jpg"
          },
          "members": [
            {
              "invitedBy": {
                "_id": "user_id",
                "name": "John Doe",
                "email": "john@example.com",
                "profileImage": "https://example.com/profile.jpg"
              },
              "invitedAt": "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      ]
    }
  }
  ```

#### Transfer project ownership
- **PUT** `/api/projects/:id/transfer-ownership`
- **Access**: Private (project owner, system-admin)
- **Description**: Transfers ownership of a project to another member
- **Request Body**:
  ```json
  {
    "userId": "new_owner_id"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Project ownership transferred successfully",
    "data": {
      "project": {
        // Project details with updated owner
      }
    }
  }
  ```

### Pipeline Management

#### Create a new pipeline
- **POST** `/api/projects/:projectId/pipelines`
- **Access**: Private (project owner, admin, manager)
- **Description**: Creates a new pipeline in a project
- **Request Body**:
  ```json
  {
    "name": "Marketing Pipeline",
    "description": "Pipeline for marketing campaigns",
    "stages": [
      {
        "name": "Planning",
        "description": "Campaign planning phase",
        "color": "#3B82F6"
      },
      {
        "name": "Execution",
        "description": "Campaign execution phase",
        "color": "#10B981"
      },
      {
        "name": "Evaluation",
        "description": "Campaign evaluation phase",
        "color": "#F59E0B"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Pipeline created successfully",
    "data": {
      "pipeline": {
        "_id": "pipeline_id",
        "name": "Marketing Pipeline",
        "description": "Pipeline for marketing campaigns",
        "isDefault": false,
        "isArchived": false,
        "stages": [
          {
            "_id": "stage_id",
            "name": "Planning",
            "description": "Campaign planning phase",
            "order": 0,
            "color": "#3B82F6",
            "isDefault": true,
            "isArchived": false
          },
          // ... other stages
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
  ```

#### Get all pipelines in a project
- **GET** `/api/projects/:projectId/pipelines`
- **Access**: Private (project members)
- **Description**: Gets all pipelines in a project
- **Query Parameters**:
  - `includeArchived`: Include archived pipelines (true/false, default: false)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "pipelines": [
        {
          "_id": "pipeline_id",
          "name": "Sales Pipeline",
          "description": "Default sales pipeline",
          "isDefault": true,
          "isArchived": false,
          "stages": [
            // ... stages
          ],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        // ... other pipelines
      ]
    }
  }
  ```

#### Get pipeline by ID
- **GET** `/api/projects/:projectId/pipelines/:pipelineId`
- **Access**: Private (project members)
- **Description**: Gets a specific pipeline by ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "pipeline": {
        "_id": "pipeline_id",
        "name": "Sales Pipeline",
        "description": "Default sales pipeline",
        "isDefault": true,
        "isArchived": false,
        "stages": [
          // ... stages
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
  ```

#### Update pipeline
- **PUT** `/api/projects/:projectId/pipelines/:pipelineId`
- **Access**: Private (project owner, admin, manager)
- **Description**: Updates a pipeline's details
- **Request Body**:
  ```json
  {
    "name": "Updated Pipeline Name",
    "description": "Updated description",
    "isDefault": true,
    "isArchived": false
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Pipeline updated successfully",
    "data": {
      "pipeline": {
        // Updated pipeline details
      }
    }
  }
  ```

#### Delete pipeline
- **DELETE** `/api/projects/:projectId/pipelines/:pipelineId`
- **Access**: Private (project owner, admin)
- **Description**: Deletes a pipeline
- **Response**:
  ```json
  {
    "success": true,
    "message": "Pipeline deleted successfully"
  }
  ```

### Stage Management

#### Create a new stage
- **POST** `/api/projects/:projectId/pipelines/:pipelineId/stages`
- **Access**: Private (project owner, admin, manager)
- **Description**: Creates a new stage in a pipeline
- **Request Body**:
  ```json
  {
    "name": "Negotiation",
    "description": "Deal negotiation phase",
    "color": "#8B5CF6"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Stage created successfully",
    "data": {
      "stage": {
        "_id": "stage_id",
        "name": "Negotiation",
        "description": "Deal negotiation phase",
        "order": 5,
        "color": "#8B5CF6",
        "isDefault": false,
        "isArchived": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
  ```

#### Update stage
- **PUT** `/api/projects/:projectId/pipelines/:pipelineId/stages/:stageId`
- **Access**: Private (project owner, admin, manager)
- **Description**: Updates a stage's details
- **Request Body**:
  ```json
  {
    "name": "Updated Stage Name",
    "description": "Updated description",
    "color": "#EC4899",
    "order": 2,
    "isDefault": false,
    "isArchived": false
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Stage updated successfully",
    "data": {
      "stage": {
        // Updated stage details
      }
    }
  }
  ```

#### Delete stage
- **DELETE** `/api/projects/:projectId/pipelines/:pipelineId/stages/:stageId`
- **Access**: Private (project owner, admin)
- **Description**: Deletes a stage
- **Response**:
  ```json
  {
    "success": true,
    "message": "Stage deleted successfully"
  }
  ```

#### Reorder stages
- **PUT** `/api/projects/:projectId/pipelines/:pipelineId/reorder`
- **Access**: Private (project owner, admin, manager)
- **Description**: Reorders stages in a pipeline
- **Request Body**:
  ```json
  {
    "stageOrder": ["stage_id_1", "stage_id_2", "stage_id_3", "stage_id_4"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Stages reordered successfully",
    "data": {
      "stages": [
        // Updated stages with new order
      ]
    }
  }
  ```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "stack": "..." // Only in development
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/projects"
}
```

Common error codes:
- `BAD_REQUEST`: Invalid input data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_SERVER_ERROR`: Server error

## Security and Permissions

- All endpoints require authentication via JWT token
- Project creation requires email verification
- Project access is restricted to members with appropriate roles
- Pipeline and stage management requires manager role or higher
- Project deletion and ownership transfer restricted to owner or system-admin
- Member management restricted to admin role or higher