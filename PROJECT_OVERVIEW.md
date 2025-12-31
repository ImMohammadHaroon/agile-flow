# Agile Flow - Project Overview

## 📖 Table of Contents
1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Key Components](#key-components)
7. [Security & Authorization](#security--authorization)
8. [Database Design](#database-design)
9. [API Design](#api-design)
10. [Real-time Features](#real-time-features)
11. [Deployment](#deployment)

---

## 📌 Introduction

**Agile Flow** is a full-stack academic task management system designed for educational institutions. It provides role-based access control, real-time communication, and comprehensive task management features.

### Purpose
- Streamline task assignment and tracking in academic settings
- Enable efficient communication between faculty and students
- Provide real-time updates and notifications
- Maintain organized workflow management

### Target Users
- **HOD (Head of Department)**: Complete system administration
- **Professors**: Task assignment and monitoring
- **Supporting Staff**: Task execution and updates
- **Students**: Task completion and collaboration

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Dashboard  │  │    Tasks    │  │    Chat     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API + WebSocket
┌───────────────────────┴─────────────────────────────────┐
│                  Backend (Node.js/Express)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Auth Midw.  │  │ Controllers │  │  Services   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │ PostgreSQL + Realtime
┌───────────────────────┴─────────────────────────────────┐
│                    Supabase Platform                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Database  │  │    Auth     │  │  Realtime   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Technology Flow

1. **Client** → React app with Vite + Tailwind CSS
2. **API Layer** → Express.js REST API with role-based middleware
3. **Authentication** → Supabase Auth (JWT tokens)
4. **Database** → PostgreSQL with Row Level Security
5. **Real-time** → Supabase Realtime (WebSocket)
6. **Notifications** → Nodemailer (SMTP)

---

## ✨ Features

### 1. Authentication & Authorization
- ✅ Separate login portals (Admin & User)
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Session management

### 2. User Management (HOD Only)
- ✅ Create/Read/Update/Delete users
- ✅ Role assignment
- ✅ User statistics
- ✅ Online status tracking

### 3. Task Management
- ✅ Role-based task creation
- ✅ Task assignment with email notifications
- ✅ Status tracking (Pending, In Progress, Completed)
- ✅ Deadline management
- ✅ Task filtering and search

### 4. Communication
- ✅ Community chat (all users)
- ✅ Private messaging (HOD ↔ Professors)
- ✅ Real-time message delivery
- ✅ Read receipts
- ✅ Conversation history

### 5. Dashboard & Analytics
- ✅ Role-specific dashboards
- ✅ Task statistics
- ✅ User overview (HOD)
- ✅ Recent activity feed

### 6. Email Notifications
- ✅ Task assignment notifications
- ✅ HTML email templates
- ✅ Async email delivery

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.2.0 |
| Vite | Build Tool | 5.0.8 |
| React Router | Routing | 6.21.1 |
| Tailwind CSS | Styling | 3.4.0 |
| Supabase JS | Supabase Client | 2.39.3 |
| Lucide React | Icons | 0.303.0 |
| React Hot Toast | Notifications | 2.4.1 |
| date-fns | Date Formatting | 3.0.6 |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18+ |
| Express | Web Framework | 4.18.2 |
| Supabase JS | Database Client | 2.39.3 |
| Nodemailer | Email Service | 6.9.7 |
| Helmet | Security Headers | 7.1.0 |
| CORS | Cross-Origin | 2.8.5 |
| dotenv | Environment Config | 16.3.1 |

### Database & Services
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary Database |
| Supabase Auth | Authentication |
| Supabase Realtime | WebSocket |
| Gmail SMTP | Email Delivery |

---

## 📁 Project Structure

```
agile-flow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js         # Supabase client configuration
│   │   ├── controllers/
│   │   │   ├── userController.js   # User CRUD operations
│   │   │   ├── taskController.js   # Task management
│   │   │   └── messageController.js # Chat functionality
│   │   ├── middleware/
│   │   │   └── auth.js             # Authentication & authorization
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # Auth endpoints
│   │   │   ├── userRoutes.js       # User endpoints
│   │   │   ├── taskRoutes.js       # Task endpoints
│   │   │   └── messageRoutes.js    # Message endpoints
│   │   ├── services/
│   │   │   └── emailService.js     # Email notification service
│   │   └── server.js               # Express app setup
│   ├── database/
│   │   ├── schema.sql              # Database schema
│   │   └── policies.sql            # RLS policies
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx # Main layout wrapper
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   ├── lib/
│   │   │   ├── supabase.js         # Supabase client
│   │   │   └── api.js              # API service layer
│   │   ├── pages/
│   │   │   ├── AdminLogin.jsx      # Admin login page
│   │   │   ├── UserLogin.jsx       # User login page
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── Tasks.jsx           # Task management
│   │   │   ├── Users.jsx           # User management (HOD)
│   │   │   ├── CommunityChat.jsx   # Community chat
│   │   │   └── PrivateMessages.jsx # Private messaging
│   │   ├── App.jsx                 # App routes
│   │   ├── main.jsx                # App entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── README.md                        # Project overview
├── SETUP_GUIDE.md                   # Setup instructions
├── API_DOCUMENTATION.md             # API reference
├── PROJECT_OVERVIEW.md              # This file
└── package.json                     # Root package file
```

---

## 🔑 Key Components

### Backend Components

#### 1. Authentication Middleware (`auth.js`)
- Verifies JWT tokens from Supabase
- Extracts user profile with role
- Implements role-based guards

#### 2. Controllers
- **userController**: CRUD operations for users
- **taskController**: Task lifecycle management
- **messageController**: Chat functionality

#### 3. Email Service
- Sends HTML formatted emails
- Task assignment notifications
- Async email delivery

### Frontend Components

#### 1. AuthContext
- Global authentication state
- User profile management
- Login/logout functionality

#### 2. ProtectedRoute
- Route-level authentication
- Role-based access control
- Loading states

#### 3. DashboardLayout
- Responsive sidebar navigation
- Role-specific menu items
- User profile display

#### 4. Page Components
- **Dashboard**: Overview and statistics
- **Tasks**: Task management interface
- **Users**: User administration
- **Chats**: Real-time messaging

---

## 🔐 Security & Authorization

### Authentication Flow

1. User enters credentials
2. Frontend sends to Supabase Auth
3. Supabase returns JWT token
4. Token stored in localStorage
5. Token included in API requests
6. Backend verifies token with Supabase
7. User profile loaded from database

### Authorization Matrix

| Action | HOD | Professor | Staff | Student |
|--------|-----|-----------|-------|---------|
| View all users | ✅ | ✅ | ✅ | ✅ |
| Create users | ✅ | ❌ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ | ❌ |
| Assign tasks to all | ✅ | ❌ | ❌ | ❌ |
| Assign to staff/students | ✅ | ✅ | ❌ | ❌ |
| View all tasks | ✅ | ✅ (own) | ❌ | ❌ |
| Update task status | ✅ | ✅ | ✅ | ✅ |
| Update task details | ✅ | ✅ (own) | ❌ | ❌ |
| Delete tasks | ✅ | ✅ (own) | ❌ | ❌ |
| Private messages | ✅ | ✅ | ❌ | ❌ |
| Community chat | ✅ | ✅ | ✅ | ✅ |

### Row Level Security (RLS)

All database tables have RLS policies:
- **users**: Read all, update own, HOD can insert/delete
- **tasks**: Role-based read/write permissions
- **messages**: Only sender/receiver can view
- **community_messages**: All authenticated users

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│  public.users   │
│─────────────────│
│ id (PK)         │───┐
│ name            │   │
│ email           │   │
│ role            │   │
│ online_status   │   │
└─────────────────┘   │
                      │
         ┌────────────┼────────────┐
         │            │            │
         │ 1:N        │ 1:N        │ 1:N
         │            │            │
┌────────▼────────┐  │  ┌─────────▼────────┐
│     tasks       │  │  │    messages       │
│─────────────────│  │  │──────────────────│
│ id (PK)         │  │  │ id (PK)          │
│ title           │  │  │ sender_id (FK)   │
│ description     │  │  │ receiver_id (FK) │
│ deadline        │  │  │ message          │
│ assigned_by (FK)│──┘  │ read             │
│ assigned_to (FK)│──┐  │ created_at       │
│ status          │  │  └──────────────────┘
│ created_at      │  │
└─────────────────┘  │
                     │  ┌──────────────────────┐
                     └──│ community_messages   │
                        │──────────────────────│
                        │ id (PK)              │
                        │ user_id (FK)         │
                        │ message              │
                        │ created_at           │
                        └──────────────────────┘
```

### Tables

#### users
- Extends Supabase auth.users
- Stores additional profile information
- Tracks online status

#### tasks
- Stores task information
- References assigner and assignee
- Tracks status and deadline

#### messages
- Private one-to-one messages
- Between HOD and Professors only
- Supports read receipts

#### community_messages
- Public messages for all users
- Real-time updates
- Chronological display

---

## 🌐 API Design

### RESTful Principles
- Resource-based URLs
- HTTP method conventions (GET, POST, PUT, DELETE)
- JSON request/response format
- Status code conventions

### Endpoint Structure
```
/api/auth/*          # Authentication
/api/users/*         # User management
/api/tasks/*         # Task management
/api/messages/*      # Messaging
```

### Response Format

**Success:**
```json
{
  "data": { /* resource */ },
  "message": "Success message"
}
```

**Error:**
```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

---

## ⚡ Real-time Features

### Implementation
- Supabase Realtime (WebSocket)
- PostgreSQL LISTEN/NOTIFY
- Automatic reconnection
- Optimistic UI updates

### Subscriptions

#### Community Chat
```javascript
supabase
  .channel('community_messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'community_messages'
  }, handleNewMessage)
  .subscribe();
```

#### Private Messages
```javascript
supabase
  .channel('private_messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${userId}`
  }, handleNewMessage)
  .subscribe();
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend Deployment (Railway)
```bash
cd backend
railway up
```

### Environment Variables

**Production Checklist:**
- ✅ Update CORS origins
- ✅ Use HTTPS URLs
- ✅ Secure service role key
- ✅ Configure email service
- ✅ Set production database
- ✅ Enable rate limiting
- ✅ Configure logging

---

## 📊 Performance Considerations

### Optimization Strategies
1. **Database Indexing**: All foreign keys indexed
2. **Query Optimization**: Select only needed columns
3. **Pagination**: Limit result sets
4. **Caching**: Browser caching for static assets
5. **Code Splitting**: Lazy load routes
6. **Image Optimization**: Use appropriate formats
7. **API Rate Limiting**: Prevent abuse

### Monitoring
- Server logs for API requests
- Supabase dashboard for database metrics
- Error tracking for exceptions
- Performance profiling for slow queries

---

## 🧪 Testing Strategy

### Backend Testing
```bash
# Unit tests for controllers
npm run test:unit

# Integration tests for API endpoints
npm run test:integration

# E2E tests
npm run test:e2e
```

### Frontend Testing
```bash
# Component tests
npm run test

# E2E tests with Cypress
npm run test:e2e
```

---

## 🔄 Future Enhancements

### Planned Features
1. **File Attachments**: Upload files to tasks
2. **Task Comments**: Discussion threads
3. **Notifications**: Browser push notifications
4. **Calendar View**: Deadline visualization
5. **Reports**: Generate PDF reports
6. **Mobile App**: React Native version
7. **Dark Mode**: Theme switcher
8. **Audit Log**: Track all actions
9. **Analytics**: Usage statistics
10. **Video Chat**: Real-time video calls

---

## 📞 Support & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Review and rotate API keys quarterly
- Database backup weekly
- Monitor error logs daily
- Performance review monthly

### Getting Help
1. Check documentation
2. Review code comments
3. Search GitHub issues
4. Contact development team

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Supabase for BaaS platform
- React team for excellent framework
- Tailwind CSS for styling system
- Open source community

---

**Built with ❤️ for academic institutions**

Last Updated: December 25, 2025
Version: 1.0.0
