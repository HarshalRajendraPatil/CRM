# Company Management System

The Company Management System is a core feature of the CRM platform that allows users to track and manage company information, notes, tags, and custom fields. It integrates with the notification system to keep team members updated on company-related activities.

## Features

- **Company Profile Management**: Create and maintain comprehensive company profiles with detailed information
- **Custom Fields**: Add custom fields to track industry-specific or company-specific information
- **Notes System**: Add and view notes related to companies
- **Tagging System**: Organize companies with customizable tags
- **Activity Tracking**: Monitor and record all activities related to companies
- **Notification Integration**: Real-time notifications for company-related events
- **Statistics and Reporting**: View company statistics and reports

## Company Model

The Company model includes the following fields:

| Field | Type | Description |
|-------|------|-------------|
| name | String | Company name (required) |
| industry | String | Company industry |
| website | String | Company website URL |
| logo | String | URL to company logo |
| description | String | Company description |
| address | Object | Company address (street, city, state, zipCode, country) |
| phone | String | Company phone number |
| email | String | Company email address |
| socialMedia | Array | Array of social media profiles (platform, url, handle) |
| size | String | Company size (e.g., '1-10', '11-50', etc.) |
| annualRevenue | String | Annual revenue range (e.g., '<1M', '1M-10M', etc.) |
| founded | Number | Year the company was founded |
| tags | Array | Array of tags for categorizing companies |
| project | ObjectId | Reference to the project this company belongs to |
| owner | ObjectId | User who created or owns this company record |
| customFields | Map | Custom fields for storing additional company information |
| status | String | Company status (active, inactive, lead, customer, etc.) |
| contacts | Array | References to contacts associated with this company |
| deals | Array | References to deals associated with this company |
| notes | Array | Notes related to the company |
| lastActivityDate | Date | Date of the last activity on this company |
| lastActivityType | String | Type of the last activity |
| lastActivityBy | ObjectId | User who performed the last activity |
| createdBy | ObjectId | User who created the company record |
| updatedBy | ObjectId | User who last updated the company record |
| createdAt | Date | Date when the company was created |
| updatedAt | Date | Date when the company was last updated |

## API Endpoints

### Company Management

#### Create a new company
- **POST** `/api/companies`
- **Auth Required**: Yes
- **Permissions**: Project member
- **Request Body**:
  ```json
  {
    "projectId": "project_id",
    "name": "Company Name",
    "industry": "Technology",
    "website": "https://example.com",
    "logo": "https://example.com/logo.png",
    "description": "Company description",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105",
      "country": "USA"
    },
    "phone": "+1 (555) 123-4567",
    "email": "info@example.com",
    "socialMedia": [
      {
        "platform": "linkedin",
        "url": "https://linkedin.com/company/example",
        "handle": "example"
      }
    ],
    "size": "11-50",
    "annualRevenue": "1M-10M",
    "founded": 2010,
    "tags": ["tech", "saas", "b2b"],
    "status": "active",
    "customFields": {
      "industry_segment": "Cloud Services",
      "lead_source": "Website"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Company created successfully",
    "data": {
      "company": {
        "_id": "company_id",
        "name": "Company Name",
        "industry": "Technology",
        ...
      }
    }
  }
  ```

#### Get companies for a project
- **GET** `/api/companies/project/:projectId`
- **Auth Required**: Yes
- **Permissions**: Project member
- **Query Parameters**:
  - `limit`: Number of results per page (default: 20)
  - `skip`: Number of results to skip (default: 0)
  - `sort`: Field to sort by (default: 'name')
  - `order`: Sort order ('asc' or 'desc', default: 'asc')
  - `status`: Filter by status
  - `industry`: Filter by industry
  - `search`: Search term for name, description, city, country, or email
  - `tags`: Comma-separated list of tags to filter by
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "companies": [
        {
          "_id": "company_id",
          "name": "Company Name",
          "industry": "Technology",
          ...
        }
      ],
      "pagination": {
        "total": 50,
        "limit": 20,
        "skip": 0,
        "hasMore": true
      }
    }
  }
  ```

#### Get company by ID
- **GET** `/api/companies/:id`
- **Auth Required**: Yes
- **Permissions**: Project member
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "company": {
        "_id": "company_id",
        "name": "Company Name",
        "industry": "Technology",
        ...
      }
    }
  }
  ```

#### Update company
- **PUT** `/api/companies/:id`
- **Auth Required**: Yes
- **Permissions**: Project manager, admin, or company owner
- **Request Body**: Same as create company, but fields are optional
- **Response**:
  ```json
  {
    "success": true,
    "message": "Company updated successfully",
    "data": {
      "company": {
        "_id": "company_id",
        "name": "Updated Company Name",
        ...
      }
    }
  }
  ```

#### Delete company
- **DELETE** `/api/companies/:id`
- **Auth Required**: Yes
- **Permissions**: Project owner, admin, or company owner
- **Response**:
  ```json
  {
    "success": true,
    "message": "Company deleted successfully"
  }
  ```

### Company Notes

#### Add note to company
- **POST** `/api/companies/:id/notes`
- **Auth Required**: Yes
- **Permissions**: Project member
- **Request Body**:
  ```json
  {
    "content": "Note content goes here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Note added successfully",
    "data": {
      "note": {
        "_id": "note_id",
        "content": "Note content goes here",
        "createdBy": {
          "_id": "user_id",
          "name": "User Name",
          "email": "user@example.com",
          "profileImage": "https://example.com/profile.jpg"
        },
        "createdAt": "2023-09-15T12:00:00.000Z",
        "updatedAt": "2023-09-15T12:00:00.000Z"
      }
    }
  }
  ```

#### Get company notes
- **GET** `/api/companies/:id/notes`
- **Auth Required**: Yes
- **Permissions**: Project member
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "notes": [
        {
          "_id": "note_id",
          "content": "Note content goes here",
          "createdBy": {
            "_id": "user_id",
            "name": "User Name",
            "email": "user@example.com",
            "profileImage": "https://example.com/profile.jpg"
          },
          "createdAt": "2023-09-15T12:00:00.000Z",
          "updatedAt": "2023-09-15T12:00:00.000Z"
        }
      ]
    }
  }
  ```

### Company Tags

#### Add tag to company
- **POST** `/api/companies/:id/tags`
- **Auth Required**: Yes
- **Permissions**: Project manager, admin, or company owner
- **Request Body**:
  ```json
  {
    "tag": "enterprise"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Tag added successfully",
    "data": {
      "company": {
        "_id": "company_id",
        "name": "Company Name",
        "tags": ["tech", "saas", "b2b", "enterprise"],
        ...
      }
    }
  }
  ```

#### Remove tag from company
- **DELETE** `/api/companies/:id/tags/:tag`
- **Auth Required**: Yes
- **Permissions**: Project manager, admin, or company owner
- **Response**:
  ```json
  {
    "success": true,
    "message": "Tag removed successfully",
    "data": {
      "company": {
        "_id": "company_id",
        "name": "Company Name",
        "tags": ["tech", "saas", "b2b"],
        ...
      }
    }
  }
  ```

### Custom Fields

#### Add custom field to company
- **POST** `/api/companies/:id/custom-fields`
- **Auth Required**: Yes
- **Permissions**: Project manager, admin, or company owner
- **Request Body**:
  ```json
  {
    "key": "account_manager",
    "value": "John Smith"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Custom field added successfully",
    "data": {
      "company": {
        "_id": "company_id",
        "name": "Company Name",
        "customFields": {
          "industry_segment": "Cloud Services",
          "lead_source": "Website",
          "account_manager": "John Smith"
        },
        ...
      }
    }
  }
  ```

#### Remove custom field from company
- **DELETE** `/api/companies/:id/custom-fields/:key`
- **Auth Required**: Yes
- **Permissions**: Project manager, admin, or company owner
- **Response**:
  ```json
  {
    "success": true,
    "message": "Custom field removed successfully",
    "data": {
      "company": {
        "_id": "company_id",
        "name": "Company Name",
        "customFields": {
          "industry_segment": "Cloud Services",
          "lead_source": "Website"
        },
        ...
      }
    }
  }
  ```

### Statistics

#### Get company statistics for a project
- **GET** `/api/companies/project/:projectId/stats`
- **Auth Required**: Yes
- **Permissions**: Project member
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "total": 50,
      "byStatus": {
        "active": 30,
        "inactive": 5,
        "lead": 10,
        "customer": 5
      },
      "byIndustry": {
        "Technology": 20,
        "Finance": 10,
        "Healthcare": 8,
        "Education": 5,
        "Other": 7
      },
      "recentActivity": [
        {
          "_id": "company_id",
          "name": "Company Name",
          "lastActivityDate": "2023-09-15T12:00:00.000Z",
          "lastActivityType": "company_updated",
          "lastActivityBy": {
            "_id": "user_id",
            "name": "User Name",
            "email": "user@example.com",
            "profileImage": "https://example.com/profile.jpg"
          }
        }
      ]
    }
  }
  ```

## Notification Types

The company management system integrates with the notification system to send real-time updates for the following events:

| Event Type | Description | Priority |
|------------|-------------|----------|
| company_created | A new company is created | Medium |
| company_updated | A company is updated | Low |
| company_deleted | A company is deleted | Medium |
| company_note_added | A note is added to a company | Low |

## Integration with Other Modules

The Company Management System integrates with:

1. **Project System**: Companies belong to specific projects
2. **User System**: Companies have owners and track user activities
3. **Notification System**: Company events generate notifications
4. **Contact System**: Companies can be linked to contacts
5. **Deal System**: Companies can be linked to deals

## Best Practices

1. **Data Validation**: Always validate company data before creating or updating
2. **Permissions**: Check user permissions before allowing company operations
3. **Activity Tracking**: Update the lastActivity fields when performing operations
4. **Notification**: Create appropriate notifications for company events
5. **Custom Fields**: Use custom fields for industry-specific or company-specific data
6. **Tags**: Use tags for easy filtering and categorization
7. **Notes**: Use notes to document important information about companies

## Example Usage

### Creating a Company

```javascript
// Example API call to create a company
const createCompany = async (projectId, companyData) => {
  try {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        projectId,
        ...companyData
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};
```

### Fetching Companies for a Project

```javascript
// Example API call to fetch companies for a project
const getProjectCompanies = async (projectId, options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.skip) queryParams.append('skip', options.skip);
    if (options.sort) queryParams.append('sort', options.sort);
    if (options.order) queryParams.append('order', options.order);
    if (options.status) queryParams.append('status', options.status);
    if (options.industry) queryParams.append('industry', options.industry);
    if (options.search) queryParams.append('search', options.search);
    if (options.tags) queryParams.append('tags', options.tags.join(','));
    
    const response = await fetch(`/api/companies/project/${projectId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};
```