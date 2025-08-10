# Contact Management System

A comprehensive contact management system for the CRM platform that seamlessly integrates with existing company management, notification, and email systems.

## Features

- ✅ Complete contact lifecycle management
- ✅ Advanced filtering and search capabilities
- ✅ Lead scoring and stage management
- ✅ Activity tracking and history
- ✅ Notes and tags system
- ✅ Custom fields support
- ✅ Social media links management
- ✅ Address management (multiple addresses)
- ✅ Communication preferences
- ✅ Deal associations
- ✅ Pipeline integration
- ✅ Comprehensive analytics and insights
- ✅ Real-time notifications
- ✅ Role-based access control
- ✅ Multi-tenant architecture

## Contact Model

### Core Properties

```javascript
{
  // Basic Information
  firstName: String (required),
  lastName: String (required),
  email: String (optional),
  phone: String (optional),
  jobTitle: String (optional),
  department: String (optional),
  
  // Company Association
  company: ObjectId (required, ref: 'Company'),
  project: ObjectId (required, ref: 'Project'),
  
  // Assignment and Ownership
  assignedTo: ObjectId (optional, ref: 'User'),
  owner: ObjectId (required, ref: 'User'),
  
  // Pipeline and Stage Management
  stage: String (enum: ['lead', 'prospect', 'qualified', 'opportunity', 'customer', 'inactive', 'lost', 'other']),
  pipeline: ObjectId (optional, ref: 'Pipeline'),
  pipelineStage: ObjectId (optional, ref: 'Stage'),
  
  // Contact Details
  addresses: [AddressSchema],
  socialLinks: [SocialLinkSchema],
  
  // Business Information
  source: String (enum: ['website', 'referral', 'cold_outreach', 'event', 'social_media', 'advertising', 'partner', 'other']),
  leadScore: Number (0-100),
  status: String (enum: ['active', 'inactive', 'unsubscribed', 'bounced', 'other']),
  
  // Relationships
  deals: [DealSchema],
  
  // Organization
  tags: [String],
  notes: [NoteSchema],
  
  // Custom Fields
  customFields: Map,
  
  // Activity Tracking
  activities: [ActivitySchema],
  lastActivityDate: Date,
  lastActivityType: String,
  lastActivityBy: ObjectId (ref: 'User'),
  
  // Communication Preferences
  communicationPreferences: {
    email: Boolean,
    phone: Boolean,
    sms: Boolean,
    preferredContactMethod: String,
    timezone: String,
    language: String
  },
  
  // Metadata
  createdBy: ObjectId (required, ref: 'User'),
  updatedBy: ObjectId (required, ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Address Schema

```javascript
{
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  type: String (enum: ['home', 'work', 'other'])
}
```

### Social Link Schema

```javascript
{
  platform: String (enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'github', 'website', 'other']),
  url: String (required),
  handle: String,
  isPrimary: Boolean
}
```

### Deal Schema

```javascript
{
  deal: ObjectId (required, ref: 'Deal'),
  role: String (enum: ['decision_maker', 'influencer', 'user', 'champion', 'blocker', 'other']),
  addedAt: Date
}
```

### Note Schema

```javascript
{
  content: String (required),
  type: String (enum: ['general', 'meeting', 'call', 'email', 'task', 'follow_up', 'other']),
  createdBy: ObjectId (required, ref: 'User'),
  createdAt: Date,
  updatedAt: Date,
  isPrivate: Boolean
}
```

### Activity Schema

```javascript
{
  type: String (enum: ['email_sent', 'email_received', 'call_made', 'call_received', 'meeting_scheduled', 'meeting_completed', 'task_created', 'task_completed', 'note_added', 'deal_created', 'deal_updated', 'stage_changed', 'tag_added', 'tag_removed', 'contact_updated', 'other']),
  description: String (required),
  performedBy: ObjectId (required, ref: 'User'),
  performedAt: Date,
  metadata: Map
}
```

## API Endpoints

### Contact CRUD Operations

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/contacts` | Create a new contact | Project members |
| GET | `/api/contacts/project/:projectId` | Get all contacts for a project | Project members |
| GET | `/api/contacts/company/:companyId` | Get all contacts for a company | Project members |
| GET | `/api/contacts/:id` | Get contact by ID | Project members |
| PUT | `/api/contacts/:id` | Update contact | Contact owner, assigned user, or managers |
| DELETE | `/api/contacts/:id` | Delete contact | Project owner, admin, or contact owner |

### Contact Notes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/contacts/:id/notes` | Add note to contact | Project members |
| GET | `/api/contacts/:id/notes` | Get contact notes | Project members |

### Contact Tags

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/contacts/:id/tags` | Add tag to contact | Managers, contact owner |
| DELETE | `/api/contacts/:id/tags/:tag` | Remove tag from contact | Managers, contact owner |

### Contact Custom Fields

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/contacts/:id/custom-fields` | Add custom field | Managers, contact owner |
| DELETE | `/api/contacts/:id/custom-fields/:key` | Remove custom field | Managers, contact owner |

### Contact Social Links

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/contacts/:id/social-links` | Add social link | Managers, contact owner |
| DELETE | `/api/contacts/:id/social-links/:linkId` | Remove social link | Managers, contact owner |

### Contact Stage and Lead Score

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| PUT | `/api/contacts/:id/stage` | Update contact stage | Managers, contact owner, assigned user |
| PUT | `/api/contacts/:id/lead-score` | Update lead score | Managers, contact owner, assigned user |

### Contact Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/contacts/project/:projectId/stats` | Get contact statistics | Project members |
| GET | `/api/contacts/project/:projectId/insights` | Get detailed contact insights | Project members |

## API Documentation

### Create Contact

**POST** `/api/contacts`

Request body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "jobTitle": "Sales Manager",
  "department": "Sales",
  "companyId": "company_id",
  "projectId": "project_id",
  "assignedTo": "user_id",
  "stage": "lead",
  "source": "website",
  "leadScore": 75,
  "status": "active",
  "addresses": [
    {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "type": "work"
    }
  ],
  "socialLinks": [
    {
      "platform": "linkedin",
      "url": "https://linkedin.com/in/johndoe",
      "handle": "johndoe",
      "isPrimary": true
    }
  ],
  "tags": ["hot-lead", "enterprise"],
  "communicationPreferences": {
    "email": true,
    "phone": true,
    "sms": false,
    "preferredContactMethod": "email",
    "timezone": "America/New_York",
    "language": "en"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": {
    "contact": {
      "_id": "contact_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "jobTitle": "Sales Manager",
      "department": "Sales",
      "company": {
        "_id": "company_id",
        "name": "Example Corp",
        "industry": "Technology"
      },
      "assignedTo": {
        "_id": "user_id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "profileImage": "https://example.com/image.jpg"
      },
      "stage": "lead",
      "source": "website",
      "leadScore": 75,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Project Contacts

**GET** `/api/contacts/project/:projectId?limit=20&skip=0&sort=firstName&order=asc&stage=lead&status=active&assignedTo=user_id&search=john&tags=hot-lead&source=website&leadScoreMin=50&leadScoreMax=100&lastActivityDays=7`

Response:
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "contact_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "jobTitle": "Sales Manager",
        "company": {
          "_id": "company_id",
          "name": "Example Corp",
          "industry": "Technology"
        },
        "assignedTo": {
          "_id": "user_id",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "stage": "lead",
        "leadScore": 75,
        "lastActivityDate": "2024-01-01T00:00:00.000Z",
        "tags": ["hot-lead", "enterprise"]
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "skip": 0,
      "hasMore": true
    }
  }
}
```

### Get Contact Statistics

**GET** `/api/contacts/project/:projectId/stats`

Response:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStage": {
      "lead": 45,
      "prospect": 30,
      "qualified": 25,
      "opportunity": 20,
      "customer": 30
    },
    "byStatus": {
      "active": 140,
      "inactive": 10
    },
    "bySource": {
      "website": 50,
      "referral": 30,
      "cold_outreach": 20,
      "event": 15,
      "social_media": 35
    },
    "byAssignedUser": [
      {
        "user": {
          "_id": "user_id",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "count": 25
      }
    ],
    "recentActivity": [
      {
        "_id": "contact_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "lastActivityDate": "2024-01-01T00:00:00.000Z",
        "lastActivityType": "note_added",
        "lastActivityBy": {
          "_id": "user_id",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "stage": "lead",
        "company": {
          "_id": "company_id",
          "name": "Example Corp"
        }
      }
    ],
    "leadScoreStats": {
      "average": 65,
      "max": 95,
      "min": 10
    }
  }
}
```

### Get Contact Insights

**GET** `/api/contacts/project/:projectId/insights?timeframe=30`

Response:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 150,
      "new": 25,
      "active": 120,
      "growthRate": 17
    },
    "byStage": [
      { "_id": "lead", "count": 45 },
      { "_id": "prospect", "count": 30 },
      { "_id": "qualified", "count": 25 },
      { "_id": "opportunity", "count": 20 },
      { "_id": "customer", "count": 30 }
    ],
    "bySource": [
      { "_id": "website", "count": 50 },
      { "_id": "referral", "count": 30 },
      { "_id": "cold_outreach", "count": 20 },
      { "_id": "event", "count": 15 },
      { "_id": "social_media", "count": 35 }
    ],
    "topCompanies": [
      {
        "company": {
          "_id": "company_id",
          "name": "Example Corp"
        },
        "count": 8
      }
    ],
    "topJobTitles": [
      { "_id": "Sales Manager", "count": 15 },
      { "_id": "CEO", "count": 10 },
      { "_id": "Marketing Director", "count": 8 }
    ],
    "leadScoreDistribution": [
      { "_id": 0, "count": 10 },
      { "_id": 20, "count": 25 },
      { "_id": 40, "count": 35 },
      { "_id": 60, "count": 45 },
      { "_id": 80, "count": 25 },
      { "_id": 100, "count": 10 }
    ],
    "activityTrends": [
      { "_id": "2024-01-01", "count": 15 },
      { "_id": "2024-01-02", "count": 12 },
      { "_id": "2024-01-03", "count": 18 }
    ],
    "conversionRates": [
      {
        "stage": "lead",
        "total": 45,
        "converted": 15,
        "rate": 33
      },
      {
        "stage": "prospect",
        "total": 30,
        "converted": 12,
        "rate": 40
      }
    ]
  }
}
```

## Integration Points

### Company Integration

- Contacts are automatically associated with companies
- Company contacts array is updated when contacts are created/deleted
- Contact creation triggers company activity updates

### Notification Integration

- Contact events trigger real-time notifications
- Notifications are sent to project members
- Supports email and in-app notifications

### Email Integration

- Contact creation can trigger welcome emails
- Activity updates can trigger follow-up emails
- Communication preferences are respected

### Pipeline Integration

- Contacts can be assigned to pipeline stages
- Stage changes trigger notifications
- Lead scoring affects pipeline progression

### Deal Integration

- Contacts can be associated with multiple deals
- Deal roles define contact involvement
- Deal updates affect contact activity

## Security and Permissions

### Role-Based Access Control

- **Viewer**: Can view contacts and add notes
- **Manager**: Can create, update, and manage contacts
- **Admin**: Can delete contacts and manage all aspects
- **Owner**: Full access to all contacts in their projects

### Data Validation

- Comprehensive input validation
- XSS protection
- SQL injection prevention
- Data sanitization

### Multi-Tenant Isolation

- Contacts are isolated by project
- Users can only access contacts in projects they're members of
- Company associations respect project boundaries

## Performance Optimizations

### Database Indexes

- Compound indexes for common queries
- Text indexes for search functionality
- Geospatial indexes for location-based queries

### Query Optimization

- Efficient aggregation pipelines
- Pagination support
- Selective field population
- Caching strategies

### Scalability

- Horizontal scaling support
- Database sharding ready
- Microservices architecture compatible

## Error Handling

### Validation Errors

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "BAD_REQUEST",
    "errors": {
      "firstName": "First name is required",
      "email": "Please enter a valid email address"
    }
  }
}
```

### Authorization Errors

```json
{
  "success": false,
  "error": {
    "message": "You do not have permission to update this contact",
    "code": "FORBIDDEN"
  }
}
```

### Not Found Errors

```json
{
  "success": false,
  "error": {
    "message": "Contact not found",
    "code": "NOT_FOUND"
  }
}
```

## Future Enhancements

### Planned Features

- Contact import/export functionality
- Advanced analytics and reporting
- Contact scoring algorithms
- Integration with external CRM systems
- Mobile app support
- Advanced search and filtering
- Contact deduplication
- Automated follow-up sequences
- Contact enrichment services
- Advanced workflow automation

### API Extensions

- Bulk operations
- Advanced search endpoints
- Contact merge functionality
- Contact history tracking
- Advanced analytics endpoints
- Webhook support
- GraphQL support

## Development Guidelines

### Code Standards

- Follow existing code patterns
- Use async/await for database operations
- Implement proper error handling
- Add comprehensive validation
- Write unit tests for all functions
- Document all API endpoints

### Testing

- Unit tests for all functions
- Integration tests for API endpoints
- Performance testing for large datasets
- Security testing for all endpoints

### Deployment

- Environment-specific configurations
- Database migration scripts
- Monitoring and logging setup
- Performance monitoring
- Error tracking and alerting
