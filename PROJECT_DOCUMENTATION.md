# Agile Flow Documentation

## 1. Project Overview

### What this project does
Agile Flow is a two-tier task management and communication system built for an educational organization. It supports:
- Role-based task creation and assignment
- Task status tracking and progress updates
- Private messaging between HOD and Professors
- Community chat for all authenticated users
- Real-time updates using Supabase realtime subscriptions
- Email notifications when tasks are assigned

### Why it exists
This project is designed to manage academic or institutional workflows where hierarchical roles such as HOD, Professor, Supporting Staff, and Student require controlled access to tasks and messaging.

### Core problem it solves
It solves the problem of coordinating assignments and communications between academic staff and students with role-based access control, task status visibility, and a shared community channel.

### Target users / use cases
- Heads of Department (HOD) who need full administrative control
- Professors who assign tasks and message other faculty
- Supporting Staff who receive tasks and participate in community chat
- Students who receive tasks, update status, and engage in community chat

---

## 2. Tech Stack

### Backend
- Node.js
- Express
- Supabase JS (`@supabase/supabase-js`)
- dotenv
- Helmet
- express-rate-limit
- cors
- nodemailer
- nodemon (dev)

### Frontend
- React
- Vite
- Tailwind CSS
- React Router DOM
- Supabase JS
- react-hot-toast
- lucide-react
- date-fns

### Why each major technology was chosen
- **Express**: simple and lightweight HTTP server framework for API routing.
- **Supabase**: provides authentication, database, and realtime capabilities with one managed backend.
- **React + Vite**: fast frontend development and optimized builds.
- **Tailwind CSS**: utility-first styling used throughout the UI.
- **nodemailer**: email notifications on task assignment.
- **react-hot-toast**: user feedback and notifications in the UI.

---

## 3. Architecture & System Design

### High-level architecture
This repository is structured as a two-part application:
- `backend/` contains the Express server, Supabase integration, and business logic.
- `frontend/` contains a React SPA with authentication, task management, chat, and admin pages.

### Major modules / layers
- **API layer**: `backend/src/routes/*.js`
- **Business logic layer**: `backend/src/controllers/*.js`
- **Auth middleware**: `backend/src/middleware/auth.js`
- **Database interface**: `backend/src/config/supabase.js`
- **Email service**: `backend/src/services/emailService.js`
- **Frontend UI**: `frontend/src/pages/*`, `frontend/src/components/*`
- **Frontend state/auth**: `frontend/src/contexts/AuthContext.jsx`
- **API client**: `frontend/src/lib/api.js`
- **Realtime updates**: `frontend/src/lib/supabase.js`

### Data flow from user input to output
1. User interacts with the React UI.
2. UI calls `frontend/src/lib/api.js` to send HTTP requests to the backend.
3. Backend middleware verifies the Bearer token via Supabase.
4. Authenticated requests are handled in controllers.
5. Controllers read/write Supabase tables via `supabaseAdmin`.
6. The backend returns JSON responses to the frontend.
7. Frontend updates UI state and renders new data.
8. Supabase realtime subscriptions refresh task, user, and message views automatically.

### Patterns used
- **Separation of concerns**: routes, controllers, middleware, and services are separated.
- **Role-based authorization**: `requireRole`, `requireAdmin`, and `requireHOD` middleware.
- **React context**: `AuthContext` centralizes authentication and current user state.
- **Protected routes**: `ProtectedRoute` guards frontend routes.
- **Client-server split**: backend API and frontend SPA are separate packages.

---

## 4. Project Structure

### Root
- `FEATURES_CHECKLIST.md` — feature tracking file.
- `README.md` — likely existing project summary.
- `PROJECT_ANALYSIS.md` — analysis notes.
- `backend/` — backend Express API and Supabase integration.
- `frontend/` — frontend React application.

### backend/
- `index.js` — entry point for Render-style deployment; imports `src/server.js`.
- `package.json` — backend dependencies and scripts.
- `.env` — backend environment configuration.
- `src/server.js` — Express app setup, CORS, rate limiting, route mounting.
- `src/config/supabase.js` — initializes Supabase client and admin client.
- `src/routes/authRoutes.js` — auth registration and current user profile endpoint.
- `src/routes/userRoutes.js` — user management endpoints.
- `src/routes/taskRoutes.js` — task CRUD and statistics endpoints.
- `src/routes/messageRoutes.js` — private and community messaging endpoints.
- `src/routes/keepAliveRoute.js` — health and Supabase connectivity check.
- `src/controllers/userController.js` — user CRUD and online status updates.
- `src/controllers/taskController.js` — task creation, retrieval, update, delete, stats.
- `src/controllers/messageController.js` — private messages, community chat, read receipts.
- `src/middleware/auth.js` — JWT validation and role guard middleware.
- `src/services/emailService.js` — email notifications for task assignments.
- `database/schema.sql` — Supabase table definitions and constraints.
- `database/enable-realtime.sql` — realtime publication configuration.
- `database/policies.sql` — Supabase RLS policies.
- `database/add-created-by.sql` — likely schema evolution / audit field helper.

### frontend/
- `package.json` — frontend dependencies and scripts.
- `vite.config.js` — Vite config, dev server proxy to backend.
- `index.html` — SPA entry HTML.
- `postcss.config.js` / `tailwind.config.js` — Tailwind configuration.
- `public/_redirects` — custom redirects for deployment.
- `src/main.jsx` — React app bootstrap.
- `src/App.jsx` — router configuration and app shell.
- `src/index.css` — global styles.
- `src/contexts/AuthContext.jsx` — Supabase auth state and online heartbeat.
- `src/lib/api.js` — HTTP API wrapper with auth headers.
- `src/lib/supabase.js` — Supabase client for realtime and auth.
- `src/components/DashboardLayout.jsx` — sidebar layout and navigation.
- `src/components/ProtectedRoute.jsx` — route guard component.
- `src/pages/AdminLogin.jsx` — admin login page.
- `src/pages/UserLogin.jsx` — user login page.
- `src/pages/Dashboard.jsx` — overview dashboard.
- `src/pages/Tasks.jsx` — task list, creation, filtering, editing.
- `src/pages/Users.jsx` — user management grid and creation.
- `src/pages/CommunityChat.jsx` — shared chat room.
- `src/pages/PrivateMessages.jsx` — private messaging experience.
- `src/utils/notifications.js` — browser notification and sound utilities.

---

## 5. Features (Detailed)

### Authentication
- **What it does**: authenticates users with Supabase email/password.
- **How it works**: frontend uses Supabase auth via `supabase.auth.signInWithPassword`; backend verifies the Bearer token with `supabaseAdmin.auth.getUser(token)`.
- **Files**: `frontend/src/contexts/AuthContext.jsx`, `frontend/src/lib/supabase.js`, `backend/src/middleware/auth.js`, `backend/src/routes/authRoutes.js`, `backend/src/config/supabase.js`.
- **User experience**: login pages for users and admins; protected pages redirect to login if unauthenticated.

### Role-based Access Control
- **What it does**: restricts endpoints and pages based on roles `HOD`, `Professor`, `Supporting Staff`, and `Student`.
- **How it works**: backend middleware checks `req.user.role`; frontend `ProtectedRoute` optionally restricts routes.
- **Files**: `backend/src/middleware/auth.js`, `backend/src/routes/taskRoutes.js`, `backend/src/routes/messageRoutes.js`, `backend/src/routes/userRoutes.js`, `frontend/src/components/ProtectedRoute.jsx`, `frontend/src/pages/Users.jsx`.
- **User experience**: only HOD/Professors can access user management and private messages; Students and Support Staff see tasks and community chat.

### User Management
- **What it does**: lists users, filters by role, creates new users, deletes users, updates online status.
- **How it works**: REST endpoints use Supabase admin client to manage `public.users` and link with Supabase auth users.
- **Files**: `backend/src/controllers/userController.js`, `backend/src/routes/userRoutes.js`, `frontend/src/pages/Users.jsx`, `frontend/src/contexts/AuthContext.jsx`, `frontend/src/lib/api.js`.
- **User experience**: HOD and Professor can add users; HOD can delete users; all users can see a users list with online status.

### Task Management
- **What it does**: create tasks, list tasks, update task status, delete tasks, task statistics.
- **How it works**: `tasks` table stores assignment, deadline, status. Controllers enforce role constraints on assignment and updating.
- **Files**: `backend/src/controllers/taskController.js`, `backend/src/routes/taskRoutes.js`, `frontend/src/pages/Tasks.jsx`, `frontend/src/pages/Dashboard.jsx`, `frontend/src/lib/api.js`.
- **User experience**: admins can create tasks, everyone can search/filter tasks, assignees can update status, task cards show current assignment and due date.

### Email Notifications
- **What it does**: sends an email when a task is assigned.
- **How it works**: `sendTaskAssignmentEmail` builds an HTML message and sends via Nodemailer.
- **Files**: `backend/src/services/emailService.js`, `backend/src/controllers/taskController.js`.
- **User experience**: assigned users receive email notification when tasks are created (if email service is configured).

### Private Messaging
- **What it does**: private chat for HOD and Professors.
- **How it works**: messages are stored in `public.messages`; controllers enforce sender and receiver role restrictions and allow marking read.
- **Files**: `backend/src/controllers/messageController.js`, `backend/src/routes/messageRoutes.js`, `frontend/src/pages/PrivateMessages.jsx`, `frontend/src/lib/api.js`.
- **User experience**: selected recipients appear in a sidebar; users can send messages, view conversation threads, and see unread counts.

### Community Chat
- **What it does**: all authenticated users can post and view shared messages.
- **How it works**: messages are inserted into `public.community_messages`; the frontend subscribes to realtime inserts and renders chat.
- **Files**: `backend/src/controllers/messageController.js`, `backend/src/routes/messageRoutes.js`, `frontend/src/pages/CommunityChat.jsx`, `frontend/src/lib/api.js`.
- **User experience**: a chat interface with message history, input field, and real-time updates.

### Realtime Updates
- **What it does**: refreshes task and message lists automatically when the database changes.
- **How it works**: Supabase realtime channels subscribe to table changes in `users`, `tasks`, `messages`, and `community_messages`.
- **Files**: `frontend/src/lib/supabase.js`, `frontend/src/pages/Tasks.jsx`, `frontend/src/pages/Users.jsx`, `frontend/src/pages/CommunityChat.jsx`, `frontend/src/pages/PrivateMessages.jsx`, `backend/database/enable-realtime.sql`.
- **User experience**: task list and chat views update without manual refresh.

### Health Check / Keep Alive
- **What it does**: verifies the backend and Supabase connectivity.
- **How it works**: `GET /api/keep-alive` makes a Supabase REST request to confirm the database connection.
- **Files**: `backend/src/routes/keepAliveRoute.js`, `backend/src/server.js`.
- **User experience**: not directly user-facing; useful for uptime monitoring.

---

## 6. API Reference

### Auth

#### `POST /api/auth/register`
- Request body:
  - `email` (string)
  - `password` (string)
  - `name` (string)
  - `role` (string: `HOD`, `Professor`, `Supporting Staff`, `Student`)
- Response:
  - `201` on success with `message` and `user` fields
  - `400` on validation or Supabase error
  - `500` on server error
- Authentication: none
- Notes: creates Supabase auth user and `public.users` profile.

#### `GET /api/auth/me`
- Response:
  - `200` with current `user` profile
  - `401` if token missing or invalid
  - `404` if profile not found
- Authentication: Bearer token required

### Users

#### `GET /api/users`
- Response:
  - `200` with `{ users: [...] }`
  - `500` on error
- Authentication: Bearer token required
- Authorization: any authenticated user can request, but data returned is via Supabase selection.

#### `GET /api/users/role/:role`
- Response:
  - `200` with `{ users: [...] }`
  - `500` on error
- Authentication: Bearer token required

#### `GET /api/users/:id`
- Response:
  - `200` with `{ user }`
  - `500` on error
- Authentication: Bearer token required

#### `POST /api/users`
- Request body:
  - `email`, `password`, `name`, `role`
- Response:
  - `201` with `message` and `user`
  - `500` on error
- Authentication: Bearer token required
- Authorization: roles `HOD` and `Professor` only

#### `PUT /api/users/:id`
- Request body may contain:
  - `name`, `role`, `online_status`
- Response:
  - `200` with updated `user`
  - `500` on error
- Authentication: Bearer token required

#### `DELETE /api/users/:id`
- Response:
  - `200` with `message`
  - `403` if user deletes self
  - `500` on error
- Authentication: Bearer token required
- Authorization: `HOD` only

#### `PATCH /api/users/status/online`
- Request body:
  - `online_status` (boolean)
- Response:
  - `200` with updated `user`
  - `500` on error
- Authentication: Bearer token required

### Tasks

#### `GET /api/tasks/stats`
- Response:
  - `200` with `{ stats: { total, pending, inProgress, completed, assigned, received } }`
- Authentication: Bearer token required

#### `GET /api/tasks`
- Query params: `status`, `assigned_to`, `assigned_by`
- Response:
  - `200` with `{ tasks: [...] }`
- Authentication: Bearer token required
- Behavior: Students/Staff see assigned tasks only; Professors see tasks they created or that are assigned to them; HOD sees all tasks.

#### `GET /api/tasks/:id`
- Response:
  - `200` with `{ task }`
  - `403` if access denied
  - `404` if not found
- Authentication: Bearer token required

#### `POST /api/tasks`
- Request body:
  - `title`, `description`, `deadline`, `assigned_to`
- Response:
  - `201` with `{ message, task }`
- Authentication: Bearer token required
- Authorization: `HOD` and `Professor` via `requireAdmin`
- Notes: sends task assignment email after successful creation

#### `PUT /api/tasks/:id`
- Request body may contain `title`, `description`, `deadline`, `status`
- Response:
  - `200` with `{ message, task }`
  - `403` if permission denied
  - `404` if task not found
- Authentication: Bearer token required
- Permissions:
  - Students/Supporting Staff can only update status on tasks assigned to them
  - Professors can update status on their assigned tasks and edit tasks they created
  - HOD can update any task

#### `DELETE /api/tasks/:id`
- Response:
  - `200` with `message`
  - `403` if not created by user and not HOD
  - `404` if task not found
- Authentication: Bearer token required

### Messages

#### `GET /api/messages/community`
- Query params: `limit`
- Response:
  - `200` with `{ messages: [...] }`
- Authentication: Bearer token required
- Notes: all authenticated users can access.

#### `POST /api/messages/community`
- Request body:
  - `message` (string)
- Response:
  - `201` with `{ message, data }`
- Authentication: Bearer token required

#### `GET /api/messages/private`
- Query params: `otherUserId`
- Response:
  - `200` with `{ messages: [...] }`
- Authentication: Bearer token required
- Authorization: `HOD` and `Professor` only

#### `POST /api/messages/private`
- Request body:
  - `receiver_id`, `message`
- Response:
  - `201` with `{ message, data }`
- Authentication: Bearer token required
- Authorization: `HOD` and `Professor` only

#### `PATCH /api/messages/private/:id/read`
- Response:
  - `200` with `{ message }`
  - `403` if user is not the message receiver
- Authentication: Bearer token required
- Authorization: `HOD` and `Professor` only

#### `GET /api/messages/private/unread-count`
- Response:
  - `200` with `{ unreadCount }`
- Authentication: Bearer token required
- Authorization: `HOD` and `Professor` only

#### `GET /api/messages/private/conversations`
- Response:
  - `200` with `{ conversations: [...] }`
- Authentication: Bearer token required
- Authorization: `HOD` and `Professor` only

### Health

#### `GET /health`
- Response:
  - `200` with basic app health details
- No authentication

#### `GET /api/keep-alive`
- Response:
  - `200` with Supabase connectivity status
- No authentication

---

## 7. Database / Data Models

### Users table (`public.users`)
- `id` UUID, PK, references `auth.users(id)`
- `name` TEXT, required
- `email` TEXT, unique, required
- `role` TEXT, required, constraint: `HOD`, `Professor`, `Supporting Staff`, `Student`
- `online_status` BOOLEAN, default `false`
- `created_at` TIMESTAMP WITH TIME ZONE, default `NOW()`
- `updated_at` TIMESTAMP WITH TIME ZONE, default `NOW()`

### Tasks table (`public.tasks`)
- `id` UUID, PK, default `uuid_generate_v4()`
- `title` TEXT, required
- `description` TEXT
- `deadline` TIMESTAMP WITH TIME ZONE
- `assigned_by` UUID, FK to `public.users(id)`
- `assigned_to` UUID, FK to `public.users(id)`
- `status` TEXT, default `Pending`, constraint: `Pending`, `In Progress`, `Completed`
- `created_at` TIMESTAMP WITH TIME ZONE, default `NOW()`
- `updated_at` TIMESTAMP WITH TIME ZONE, default `NOW()`

### Private messages table (`public.messages`)
- `id` UUID, PK, default `uuid_generate_v4()`
- `sender_id` UUID, FK to `public.users(id)`
- `receiver_id` UUID, FK to `public.users(id)`
- `message` TEXT, required
- `read` BOOLEAN, default `false`
- `created_at` TIMESTAMP WITH TIME ZONE, default `NOW()`

### Community chat table (`public.community_messages`)
- `id` UUID, PK, default `uuid_generate_v4()`
- `user_id` UUID, FK to `public.users(id)`
- `message` TEXT, required
- `created_at` TIMESTAMP WITH TIME ZONE, default `NOW()`

### Relationships
- `public.tasks.assigned_by` → `public.users.id`
- `public.tasks.assigned_to` → `public.users.id`
- `public.messages.sender_id` → `public.users.id`
- `public.messages.receiver_id` → `public.users.id`
- `public.community_messages.user_id` → `public.users.id`

---

## 8. Authentication & Authorization

### Authentication implementation
- Backend uses Supabase JWT authentication.
- Frontend uses client-side Supabase auth from `frontend/src/lib/supabase.js`.
- Backend verifies tokens with `supabaseAdmin.auth.getUser(token)` in `backend/src/middleware/auth.js`.
- The backend stores Supabase service key in `SUPABASE_SERVICE_KEY` and uses `supabaseAdmin` for admin-level operations.

### Roles and permissions
- `HOD`: highest privilege, full access to user, task, and message management.
- `Professor`: can create tasks for Students and Supporting Staff, access private messages, manage users.
- `Supporting Staff`: can view and update tasks assigned to them and participate in community chat.
- `Student`: can view and update tasks assigned to them and participate in community chat.

### Protected routes
- Frontend routing protected by `ProtectedRoute.jsx`.
- `Users` and `PrivateMessages` pages restrict access to `HOD` and `Professor`.
- Backend uses `requireAdmin` and `requireHOD` in routes.

---

## 9. State Management & Data Flow (Frontend)

### State management
- Uses React `useState`, `useEffect`, and Context API.
- `AuthContext.jsx` holds current profile, user session, and load state.
- API and auth token are stored in `localStorage` by the Supabase client.

### Key data flows
- Login updates Supabase session and saves token.
- `AuthContext` fetches `GET /api/auth/me` to load user profile.
- `Users.jsx`, `Tasks.jsx`, `CommunityChat.jsx`, and `PrivateMessages.jsx` fetch data via the shared `api` client.
- Realtime updates from `frontend/src/lib/supabase.js` refresh UI automatically.
- Online status is updated periodically via `api.updateOnlineStatus(true)`.

### Component interactions
- `App.jsx` defines routes and wraps the app with `AuthProvider`.
- `DashboardLayout.jsx` renders navigation and uses `useAuth` to display user role and sign out.
- `ProtectedRoute.jsx` blocks unauthenticated access and role-restricted paths.

---

## 10. Environment Variables & Configuration

### Backend variables
- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_ANON_KEY` — public Supabase anon key for client-like requests.
- `SUPABASE_SERVICE_KEY` — service key for admin operations and auth verification.
- `PORT` — backend port, default `5000`.
- `EMAIL_SERVICE` — email provider for Nodemailer, e.g. `gmail`.
- `EMAIL_USER` — sender email account username.
- `EMAIL_PASSWORD` — sender email password or app-specific password.
- `EMAIL_FROM` — display sender address, e.g. `Agile Flow <noreply@agileflow.com>`.
- `FRONTEND_URL` — frontend URL used in email templates and CORS allowlist.

### Frontend variables
- `VITE_API_URL` — backend API base URL; default `http://localhost:5000`.
- `VITE_SUPABASE_URL` — Supabase project URL for frontend auth.
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key for frontend auth.

---

## 11. Installation & Local Setup

### Prerequisites
- Node.js 18+ recommended
- npm
- Supabase project with database and auth enabled
- Email provider credentials for Nodemailer

### Setup steps
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```
2. Backend setup:
   ```bash
   cd backend
   npm install
   ```
3. Frontend setup:
   ```bash
   cd ../frontend
   npm install
   ```
4. Configure backend environment variables in `backend/.env`.
5. Configure frontend environment variables in `.env` or `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SUPABASE_URL=<your_supabase_url>
   VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   ```
6. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
7. Start the frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```
8. Open the application in the browser at `http://localhost:5173`.

---

## 12. Deployment

### Recommended deployment model
- Deploy backend and frontend separately.
- Use the backend on a Node.js hosting platform such as Render, Railway, or Vercel Serverless.
- Use the frontend as a static Vite app on Vercel or Netlify.

### Backend deployment notes
- `backend/index.js` imports `src/server.js` and is designed for deployment platforms that run `node index.js`.
- Ensure environment variables are configured on the host.
- Use `npm start` or `node src/server.js` for production.

### Frontend deployment notes
- Build the frontend with:
  ```bash
  npm run build
  ```
- Deploy the `dist/` output to a static host.
- Configure `VITE_API_URL` in the deployment environment to point to the backend.

### Platform recommendations
- **Frontend**: Vercel or Netlify
- **Backend**: Render, Railway, Heroku, or any Node.js-compatible host
- **Database**: Supabase (already required by the code)

---

## 13. Known Issues / Limitations

- No dedicated registration page for new users is present in the UI, despite `POST /api/auth/register` existing in the backend.
- Hardcoded role strings and client-side role assumptions reduce flexibility.
- No automated tests or CI configuration are present.
- The backend currently uses `SUPABASE_SERVICE_KEY` in server code; this must be kept secret.
- `frontend/src/pages/Tasks.jsx` uses optimistic UI behavior but may duplicate messages if subscriptions and fetches conflict.
- There is no explicit pagination for user, task, or message lists.
- Private messaging is restricted to HOD and Professors only; Supporting Staff and Students cannot use it.
- The database and backend policy SQL files imply Supabase RLS, but the project does not appear to deploy or enforce those automatically.
- Email credentials are stored via environment variables without additional encryption.

---

## 14. Future Improvements

- Add a proper registration / onboarding UI flow.
- Add tests for backend routes and frontend components.
- Add pagination and search API support for large datasets.
- Add user profile editing in the frontend.
- Add stronger form validation and error messaging on all pages.
- Add audit logging for user actions and task changes.
- Add role management to let HOD configure permissions dynamically.
- Improve notification settings and allow users to opt out of email or browser notifications.
- Add Docker support for local development and deployment.
- Add a separate admin dashboard for HOD-specific analytics.
- Add better read/unread status indicators and message search in private chat.

---

## File Created
- `PROJECT_DOCUMENTATION.md`
