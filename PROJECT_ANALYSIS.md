# Agile Flow - Project Analysis & Documentation

**Last Updated:** June 1, 2026  
**Project Type:** Full-Stack Task Management System  
**Status:** Active Development  

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features Implemented](#features-implemented)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Routes & Pages](#frontend-routes--pages)
8. [Authentication & Authorization](#authentication--authorization)
9. [User Roles & Permissions](#user-roles--permissions)
10. [Security Features](#security-features)
11. [Configuration & Environment Variables](#configuration--environment-variables)
12. [Missing/To-Do Features](#missingto-do-features)
13. [Deployment Information](#deployment-information)
14. [Development Guidelines](#development-guidelines)

---

## Project Overview

**Agile Flow** is a comprehensive task management system designed for academic institutions. It facilitates efficient task assignment, tracking, and communication between HOD (Head of Department), Professors, Supporting Staff, and Students.

### Project Goals
- Streamline task assignment and management within academic institutions
- Enable role-based communication and task delegation
- Provide real-time status tracking and notifications
- Support both private and community-based communications
- Maintain data security with JWT-based authentication

### Target Users
- **HOD (Head of Department):** Full system access, can manage all users and tasks
- **Professors:** Can assign tasks to students and staff, manage their assignments
- **Supporting Staff:** Can receive tasks and participate in community chat
- **Students:** Can receive tasks and participate in community chat

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (v4.18.2)
- **Authentication:** Supabase Auth (JWT-based)
- **Database:** Supabase PostgreSQL
- **Email Service:** Nodemailer (v6.9.7)
- **Security:** 
  - Helmet (v7.1.0) - HTTP header security
  - CORS (v2.8.5) - Cross-origin resource sharing
  - Express Rate Limit (v7.1.5) - Rate limiting
- **Environment:** dotenv (v16.3.1)
- **Dev Tools:** Nodemon (v3.0.2)

### Frontend
- **Framework:** React (v18.2.0)
- **Routing:** React Router DOM (v6.21.1)
- **Styling:** Tailwind CSS (v3.4.0)
- **Build Tool:** Vite (v5.0.8)
- **UI Libraries:**
  - Lucide React (v0.303.0) - Icons
  - React Hot Toast (v2.4.1) - Notifications
  - Date-fns (v3.0.6) - Date formatting
- **Backend Integration:** @supabase/supabase-js (v2.39.3)
- **PostCSS:** Autoprefixer support

---

## Project Structure

```
project/
├── backend/
│   ├── index.js                      # Entry point (legacy)
│   ├── package.json                  # Dependencies
│   ├── database/
│   │   ├── schema.sql               # Database schema & setup
│   │   ├── policies.sql             # Row-level security policies
│   │   ├── enable-realtime.sql      # Real-time features
│   │   └── add-created-by.sql       # Additional schema migrations
│   └── src/
│       ├── server.js                # Server initialization
│       ├── config/
│       │   └── supabase.js          # Supabase client configuration
│       ├── controllers/
│       │   ├── authController.js    # Authentication logic
│       │   ├── userController.js    # User management logic
│       │   ├── taskController.js    # Task management logic
│       │   └── messageController.js # Messaging logic
│       ├── middleware/
│       │   └── auth.js              # Authentication & authorization middleware
│       ├── routes/
│       │   ├── authRoutes.js        # Auth endpoints
│       │   ├── userRoutes.js        # User endpoints
│       │   ├── taskRoutes.js        # Task endpoints
│       │   ├── messageRoutes.js     # Message endpoints
│       │   └── keepAliveRoute.js    # Server health check
│       └── services/
│           └── emailService.js      # Email notification service
├── frontend/
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── vercel.json                  # Deployment configuration
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Main app component with routing
│       ├── index.css                # Global styles
│       ├── components/
│       │   ├── DashboardLayout.jsx  # Shared layout component
│       │   └── ProtectedRoute.jsx   # Route protection component
│       ├── contexts/
│       │   └── AuthContext.jsx      # Authentication state management
│       ├── lib/
│       │   ├── api.js               # API client service
│       │   └── supabase.js          # Supabase client configuration
│       ├── pages/
│       │   ├── AdminLogin.jsx       # HOD login page
│       │   ├── UserLogin.jsx        # Regular user login page
│       │   ├── Dashboard.jsx        # Main dashboard (stats & overview)
│       │   ├── Tasks.jsx            # Task management page
│       │   ├── Users.jsx            # User management page (HOD/Professor)
│       │   ├── CommunityChat.jsx    # Community messaging
│       │   └── PrivateMessages.jsx  # Private messaging (HOD/Professor)
│       └── utils/
│           └── notifications.js     # Notification utilities
└── login.txt                         # Admin credentials (SECURITY: Move to secure storage)
```

---

## Features Implemented

### ✅ Authentication & Authorization
- [x] Email/Password registration
- [x] Email/Password login (Admin & User)
- [x] JWT token-based authentication
- [x] Token persistence in localStorage
- [x] Token refresh on session
- [x] Logout functionality
- [x] Protected routes with role-based access
- [x] Session validation on app load

### ✅ User Management
- [x] User registration with role assignment
- [x] User profile display
- [x] View all users (filtered by role)
- [x] Update user information
- [x] Delete user accounts (HOD only)
- [x] Online status tracking
- [x] Heartbeat mechanism (30-second intervals)
- [x] Offline status on page unload (sendBeacon)

### ✅ Task Management
- [x] Create tasks with title, description, deadline
- [x] Assign tasks based on role hierarchy
- [x] View assigned tasks
- [x] Update task status (Pending → In Progress → Completed)
- [x] Delete tasks
- [x] Task statistics dashboard
- [x] Task filtering by status and assignee
- [x] Email notifications on task assignment

### ✅ Messaging System

#### Private Messaging
- [x] One-to-one messaging between HOD and Professors
- [x] Message read/unread status tracking
- [x] Conversation history
- [x] Message timestamps
- [x] Unread message count

#### Community Chat
- [x] Global messaging for all users
- [x] Real-time message display
- [x] User identification in messages
- [x] Message timestamps
- [x] Message persistence in database

### ✅ Security Features
- [x] Helmet.js for HTTP header security
- [x] CORS configuration (localhost & configurable production URLs)
- [x] Rate limiting (disabled in dev, enabled in production)
- [x] JWT token verification
- [x] Role-based access control (RBAC)
- [x] Request/response data validation
- [x] Error handling and logging

### ✅ Email Service
- [x] Task assignment notifications
- [x] Configurable email templates
- [x] Nodemailer integration
- [x] HTML-formatted emails with branding
- [x] Grace handling for email failures

### ✅ UI/UX Features
- [x] Toast notifications (success, error, loading)
- [x] Responsive design with Tailwind CSS
- [x] Dashboard with statistics cards
- [x] Status badges for tasks
- [x] Icon integration (Lucide React)
- [x] Date formatting and display
- [x] Loading states
- [x] Error messages
- [x] Consistent layout component

---

## Database Schema

### Tables

#### `public.users`
```sql
- id (UUID) - Primary key, references auth.users
- name (TEXT) - User's full name
- email (TEXT) - Unique email address
- role (TEXT) - One of: 'HOD', 'Professor', 'Supporting Staff', 'Student'
- online_status (BOOLEAN) - Current online/offline status
- created_at (TIMESTAMP) - Account creation time
- updated_at (TIMESTAMP) - Last update time
```

#### `public.tasks`
```sql
- id (UUID) - Primary key
- title (TEXT) - Task title
- description (TEXT) - Detailed description
- deadline (TIMESTAMP) - Task deadline
- assigned_by (UUID) - Assigner's user ID (foreign key)
- assigned_to (UUID) - Assignee's user ID (foreign key)
- status (TEXT) - One of: 'Pending', 'In Progress', 'Completed'
- created_at (TIMESTAMP) - Creation time
- updated_at (TIMESTAMP) - Last modification time
```

#### `public.messages`
```sql
- id (UUID) - Primary key
- sender_id (UUID) - Sender's user ID (foreign key)
- receiver_id (UUID) - Receiver's user ID (foreign key)
- message (TEXT) - Message content
- read (BOOLEAN) - Read status
- created_at (TIMESTAMP) - Creation time
```

#### `public.community_messages`
```sql
- id (UUID) - Primary key
- user_id (UUID) - Author's user ID (foreign key)
- message (TEXT) - Message content
- created_at (TIMESTAMP) - Creation time
```

### Indexes
- `idx_tasks_assigned_to` - Task lookup by assignee
- `idx_tasks_assigned_by` - Task lookup by assigner
- `idx_tasks_status` - Task filtering by status
- `idx_messages_sender` - Message lookup by sender
- `idx_messages_receiver` - Message lookup by receiver
- `idx_community_messages_created` - Community chat chronological ordering

### Triggers
- `update_users_updated_at` - Auto-updates users.updated_at on modification
- `update_tasks_updated_at` - Auto-updates tasks.updated_at on modification

---

## API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
GET    /api/auth/me                - Get current user profile
POST   /api/auth/logout            - Logout (client-side)
```

### User Routes (`/api/users`)
```
GET    /api/users                  - Get all users (filtered)
GET    /api/users/role/:role       - Get users by role
GET    /api/users/:id              - Get user by ID
POST   /api/users                  - Create new user (admin only)
PUT    /api/users/:id              - Update user profile
DELETE /api/users/:id              - Delete user (HOD only)
PATCH  /api/users/status/online    - Update online status
```

### Task Routes (`/api/tasks`)
```
GET    /api/tasks                  - Get tasks (filtered by role)
GET    /api/tasks/:id              - Get task details
GET    /api/tasks/stats            - Get task statistics
POST   /api/tasks                  - Create task (admin only)
PUT    /api/tasks/:id              - Update task status
DELETE /api/tasks/:id              - Delete task
```

### Message Routes (`/api/messages`)
```
GET    /api/messages/private?otherUserId=<id>    - Get private messages
POST   /api/messages/private                      - Send private message
PATCH  /api/messages/private/:id/read             - Mark as read
GET    /api/messages/private/unread-count         - Get unread count
GET    /api/messages/private/conversations        - Get conversations list

GET    /api/messages/community                    - Get community messages
POST   /api/messages/community                    - Send community message
```

### Keep-Alive Route
```
GET    /api/keep-alive             - Server health check
```

---

## Frontend Routes & Pages

### Public Routes
```
/admin-login                - HOD login form
/login                      - User login form
/                          - Redirects to /login
```

### Protected Routes (Authentication Required)
```
/dashboard                  - Main dashboard with stats and recent tasks
/tasks                      - Task management page
/community                  - Community chat page
```

### Protected Routes (Admin Only: HOD & Professor)
```
/users                      - User management page
/messages                   - Private messaging page
```

---

## Authentication & Authorization

### Authentication Flow
1. User enters credentials on login page
2. Frontend sends request to `/api/auth/login` or `/api/auth/register`
3. Supabase returns JWT token (access_token)
4. Token stored in localStorage as `supabase_token`
5. Token included in all subsequent API requests
6. Backend validates token via Supabase
7. User profile fetched and stored in AuthContext
8. Protected routes check authentication status

### Token Management
- **Storage:** localStorage (`supabase_token`)
- **Validation:** Supabase JWT verification
- **Refresh:** Automatic on session changes
- **Expiry:** Handled by Supabase
- **Cleanup:** Removed on logout or session error

### Role-Based Access Control (RBAC)

#### Role Hierarchy
```
HOD (Head of Department) - Full system access
    ├── Can manage all users
    ├── Can assign tasks to anyone
    ├── Can view all tasks
    ├── Can access private messaging
    └── Can access community chat

Professor - Limited admin access
    ├── Can assign tasks to Students & Supporting Staff only
    ├── Can view their assigned tasks
    ├── Can access private messaging
    └── Can access community chat

Supporting Staff - Standard user
    ├── Cannot assign tasks
    ├── Can only view tasks assigned to them
    └── Can access community chat

Student - Limited user
    ├── Cannot assign tasks
    ├── Can only view tasks assigned to them
    └── Can access community chat
```

#### Middleware Protection
```javascript
authenticateUser    - Verifies JWT and loads user profile
requireRole(roles)  - Ensures user has one of specified roles
requireAdmin        - Shortcut for requireRole('HOD', 'Professor')
requireHOD          - Shortcut for requireRole('HOD')
```

---

## Security Features

### Backend Security
1. **Helmet.js** - Sets secure HTTP headers
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - HSTS

2. **CORS** - Controlled cross-origin requests
   - Whitelist: localhost:5173, localhost:5174, 127.0.0.1:5173
   - Configurable via FRONTEND_URL environment variable

3. **Rate Limiting** - Prevents abuse
   - 15-minute window
   - 10,000 requests/window (dev)
   - 100 requests/window (production)
   - Enabled only in production

4. **JWT Token Verification** - Validates all requests
   - Token format validation (Bearer scheme)
   - Signature verification with Supabase
   - Token expiry checking
   - User profile validation

5. **Input Validation** - Prevents injection attacks
   - Required field checking
   - Role validation against enum
   - Type checking

### Frontend Security
1. **Protected Routes** - AuthContext-based access control
2. **Token Refresh** - Automatic token management
3. **Logout** - Clears tokens and session data
4. **Error Boundaries** - Graceful error handling

### Database Security
1. **Row-Level Security (RLS)** - Defined in policies.sql
2. **Triggers** - Auto-update timestamps
3. **Constraints** - Data integrity
4. **Foreign Keys** - Referential integrity

---

## Configuration & Environment Variables

### Backend (.env)
```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>
PORT=5000
NODE_ENV=development|production
FRONTEND_URL=http://localhost:5173

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<your-app-password>
EMAIL_FROM=Agile Flow <noreply@agileflow.com>
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Admin Credentials (TEMPORARY - STORED IN login.txt)
```
Email: hod@gmail.com
Password: Devowl14
```
**⚠️ SECURITY WARNING:** Credentials should be moved to a secure secret management system

---

## Missing/To-Do Features

### High Priority
- [ ] **Password Reset Flow**
  - Email-based password recovery
  - Reset token generation and validation
  - Password reset page

- [ ] **File Attachments**
  - Task attachments (documents, images)
  - Message attachments
  - File upload/download with Supabase storage

- [ ] **Email Verification**
  - Email confirmation on registration
  - Resend verification email
  - Email change confirmation

- [ ] **Real-time Updates (WebSocket/Supabase Realtime)**
  - Live task updates
  - Live message notifications
  - Live user online status
  - Supabase Realtime integration

- [ ] **Notification System**
  - In-app notification center
  - Browser push notifications
  - Email notification preferences
  - Notification history

### Medium Priority
- [ ] **Advanced Task Features**
  - Task priority levels (Low, Medium, High, Urgent)
  - Task categories/tags
  - Task dependencies
  - Recurring tasks
  - Task comments/activity log
  - Task assignment history

- [ ] **Analytics & Reporting**
  - Task completion rates
  - User activity reports
  - Department statistics
  - Performance metrics
  - Export reports (PDF, CSV)

- [ ] **Search & Filtering**
  - Full-text search for tasks
  - Advanced filtering options
  - Search history
  - Saved filters

- [ ] **User Features**
  - User profile pages
  - Profile picture/avatar
  - Department/group assignment
  - User activity log
  - User preferences

- [ ] **Audit Logging**
  - Track all user actions
  - Login/logout history
  - Task change history
  - Data access logs
  - Compliance reporting

### Low Priority
- [ ] **Dark Mode**
  - Theme toggle
  - Persistent theme preference
  - System theme detection

- [ ] **Localization**
  - Multi-language support
  - Language preference persistence
  - Date/time formatting per locale

- [ ] **Mobile App**
  - React Native or PWA version
  - Offline support
  - Push notifications

- [ ] **Third-Party Integration**
  - Google Calendar integration
  - Slack notifications
  - Microsoft Teams integration
  - Email client integration

- [ ] **Performance Optimization**
  - Pagination for large lists
  - Lazy loading
  - Image optimization
  - Code splitting
  - Caching strategies

---

## Deployment Information

### Backend Deployment
- **Platform:** Can be deployed to Node.js hosting (Vercel, Heroku, DigitalOcean, AWS, etc.)
- **Start Command:** `npm start` (runs `node src/server.js`)
- **Development:** `npm run dev` (runs with Nodemon for auto-reload)
- **Environment:** Requires .env file with Supabase credentials
- **Port:** Configurable via PORT environment variable (default: 5000)

### Frontend Deployment
- **Platform:** Vercel, Netlify, AWS S3+CloudFront, etc.
- **Build Command:** `npm run build`
- **Preview:** `npm run preview`
- **Configuration:** vercel.json included for Vercel deployment
- **Redirects:** Configured in public/_redirects for single-page app routing

### Database Deployment
- **Platform:** Supabase (managed PostgreSQL)
- **Schema:** Run SQL files in database/
- **Order:** 
  1. schema.sql (initial tables)
  2. policies.sql (RLS policies)
  3. enable-realtime.sql (real-time features)
  4. add-created-by.sql (additional migrations)

---

## Development Guidelines

### Getting Started

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API and Supabase URLs
npm run dev
```

### Code Standards
- **Language:** JavaScript (ES6+)
- **Package Manager:** npm
- **Formatting:** Consistent indentation (2 spaces)
- **Comments:** JSDoc for functions, inline for complex logic
- **Error Handling:** Try-catch blocks with proper logging

### API Request Pattern
```javascript
// Frontend
const response = await api.methodName(params);

// Response structure
{
  message: "Success message",
  data: { /* response data */ },
  error: "Error message if failed"
}
```

### Database Operations
- Use Supabase client for all database queries
- Always include proper error handling
- Use select() with specific columns when possible
- Use indexes for frequently queried columns

### Middleware Application
```javascript
// In routes
router.use(authenticateUser);  // Verify JWT
router.post('/', requireAdmin, createFunction);  // Check role
```

### Adding New Features

1. **Backend**
   - Create controller function in controllers/
   - Add route in routes/
   - Update database schema if needed
   - Add middleware protection if needed

2. **Frontend**
   - Create component or page in components/pages
   - Add API method in lib/api.js
   - Add route in App.jsx if needed
   - Handle loading and error states

---

## Monitoring & Maintenance

### Regular Tasks
- [ ] Check error logs in backend console
- [ ] Monitor email delivery
- [ ] Verify database backups (Supabase automatic)
- [ ] Update dependencies monthly
- [ ] Security audits quarterly

### Performance Monitoring
- Monitor API response times
- Track database query performance
- Monitor frontend load times
- Check error rate and user reports

### Backup & Recovery
- Supabase handles automatic backups
- Store environment variables securely
- Maintain database migration scripts
- Document deployment procedures

---

## Known Issues & Limitations

1. **Admin Credentials in Plain Text**
   - login.txt contains credentials
   - Should use secure credential management

2. **Email Service**
   - Requires gmail app password (2FA)
   - May fail silently if credentials wrong
   - No retry mechanism

3. **Real-time Updates**
   - Not yet implemented
   - Requires page refresh for updates

4. **Rate Limiting**
   - Currently disabled in development
   - May need adjustment for production

5. **Message Read Status**
   - Private messages have read tracking but no UI indication
   - Community messages don't track read status

---

## Support & Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Useful Commands

Backend:
```bash
npm run dev         # Start development server
npm start           # Start production server
npm install         # Install dependencies
```

Frontend:
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm install         # Install dependencies
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-01 | Initial implementation with core features |

---

## Contact & Support

**Project Owner:** [Devowl]
**Last Updated:** June 1, 2026

For questions or issues, please refer to the project repository or contact the development team.

---

**Document Summary:** This comprehensive analysis covers all aspects of the Agile Flow task management system, including architecture, features, security, and deployment guidelines. Refer to this document for project understanding, onboarding, and feature planning.
