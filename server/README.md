# CRM Platform - Multi-Tenant Authentication System

A sophisticated multi-tenant authentication system for the CRM platform where users can create and manage multiple independent CRM instances. Each user can own multiple tenants and be a member of other tenants with different roles.

## Features

- ✅ Multi-tenant architecture supporting independent CRM instances
- ✅ User registration with email verification
- ✅ Secure login with account lockout protection
- ✅ JWT-based authentication with refresh tokens
- ✅ Password reset functionality
- ✅ Email verification system
- ✅ Global role-based access control (User, System Admin)
- ✅ Tenant-specific role management (Owner, Admin, Manager, Sales Executive, Support Executive, Viewer)
- ✅ Profile management
- ✅ Comprehensive input validation and sanitization
- ✅ Advanced error handling
- ✅ Security headers and CORS configuration
- ✅ Account lockout after failed login attempts
- ✅ Email templates for all authentication flows

## Multi-Tenant Architecture

### Global Roles
- **User**: Regular user who can create and manage their own tenants
- **System Admin**: Platform administrator with access to all tenants

### Tenant Roles (per CRM instance)
- **Owner**: User who created the tenant (full access)
- **Admin**: Full administrative access within the tenant
- **Manager**: Management-level access within the tenant
- **Sales Executive**: Sales-related access within the tenant
- **Support Executive**: Support-related access within the tenant
- **Viewer**: Read-only access within the tenant

### Tenant Management
- Users can create multiple independent CRM tenants
- Users can be invited to other tenants with specific roles
- Each tenant operates independently with its own data
- Role-based permissions within each tenant

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer
- **Validation**: Custom validation utilities
- **Error Handling**: Custom error middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Email service (Gmail, SendGrid, AWS SES, etc.)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRM/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/crm_platform
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   FRONTEND_URL=http://localhost:3000
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

4. **Start the server**
   ```bash
   npm run test
   ```

## API Endpoints

### Authentication Routes

#### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/verify-email` | Verify email with token |

#### Protected Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/me` | Update user profile |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/resend-verification` | Resend email verification |
| POST | `/api/auth/logout` | Logout user |

## API Documentation

### User Registration

**POST** `/api/auth/register`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "profileImage": "https://example.com/image.jpg",
  "roleGlobal": "user"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "profileImage": "https://example.com/image.jpg",
      "roleGlobal": "user",
      "isEmailVerified": false,
      "lastLogin": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### User Login

**POST** `/api/auth/login`

Request body:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "profileImage": "https://example.com/image.jpg",
      "roleGlobal": "user",
      "isEmailVerified": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### Password Reset

**POST** `/api/auth/forgot-password`

Request body:
```json
{
  "email": "john@example.com"
}
```

**POST** `/api/auth/reset-password`

Request body:
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

### Email Verification

**POST** `/api/auth/verify-email`

Request body:
```json
{
  "token": "verification_token"
}
```

### Profile Management

**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <access_token>
```

**PUT** `/api/auth/me`

Headers:
```
Authorization: Bearer <access_token>
```

Request body:
```json
{
  "name": "John Updated",
  "phone": "+1234567890",
  "profileImage": "https://example.com/new-image.jpg"
}
```

## Multi-Tenant User Model

The user model now supports multi-tenant functionality:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  phone: String,
  profileImage: String,
  roleGlobal: String, // 'user' or 'system-admin'
  
  // Multi-tenant fields
  ownedTenants: [ObjectId], // Tenants created by this user
  memberTenants: [{
    tenant: ObjectId, // Reference to Project model
    role: String, // 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'
    joinedAt: Date
  }],
  
  // Authentication fields
  isEmailVerified: Boolean,
  lastLogin: Date,
  isActive: Boolean,
  // ... other fields
}
```

## Role Hierarchy

### Global Roles
1. **System Admin** - Platform-level access to all tenants
2. **User** - Can create and manage their own tenants

### Tenant Roles (within each CRM)
1. **Owner** - Full access to their own tenants
2. **Admin** - Full administrative access within tenant
3. **Manager** - Management-level access within tenant
4. **Sales Executive** - Sales-related access within tenant
5. **Support Executive** - Support-related access within tenant
6. **Viewer** - Read-only access within tenant

## Security Features

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **Account Lockout**: Temporary lockout after 5 failed login attempts
- **JWT Security**: Secure token generation with proper expiration
- **Input Validation**: Comprehensive validation for all inputs
- **Data Sanitization**: Clean and sanitize user inputs
- **Security Headers**: XSS protection, content type options, frame options
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Multi-tenant Isolation**: Each tenant's data is isolated from others

## Email Templates

The system includes professional email templates for:

- Welcome email with verification link
- Password reset instructions
- Password change confirmation
- Email verification success

## Error Handling

The system provides detailed error responses with:

- HTTP status codes
- Error messages
- Error codes for frontend handling
- Stack traces in development mode

Example error response:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "BAD_REQUEST",
    "stack": "..." // Only in development
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/register"
}
```

## Development

### Project Structure

```
server/
├── config/
│   ├── database.js
│   └── jwt.js
├── controllers/
│   └── authController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   └── User.model.js
├── routes/
│   └── auth.js
├── utils/
│   ├── emailService.js
│   └── validation.js
├── server.js
├── package.json
└── README.md
```

### Running in Development

```bash
npm run test
```

### Environment Variables

See `env.example` for all available configuration options.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper email service (SendGrid, AWS SES)
4. Set up MongoDB Atlas or production database
5. Configure proper CORS origins
6. Set up SSL/TLS certificates
7. Configure rate limiting
8. Set up monitoring and logging

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## License

This project is licensed under the ISC License. 