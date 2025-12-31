# Agile Flow - Academic Task Management System

A full-stack task management system for academic institutions with role-based access control, real-time chat, and task assignment features.

## Features

- **Role-Based Authentication**: HOD, Professor, Supporting Staff, Student
- **Task Management**: Assign, track, and update tasks with role-based permissions
- **Real-Time Community Chat**: All users can communicate in a shared space
- **Private Messaging**: HOD and Professors can chat one-on-one
- **Email Notifications**: Automatic notifications for task assignments
- **Responsive UI**: Built with Tailwind CSS

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database & Auth**: Supabase
- **Real-time**: Supabase Realtime

## Prerequisites

- Node.js (v18 or higher)
- Supabase account
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agile-flow
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Set up environment variables:

**Backend (.env)**:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
PORT=5000
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

**Frontend (.env)**:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

4. Set up Supabase database:
   - Run the SQL scripts in `backend/database/schema.sql`
   - Apply Row Level Security policies from `backend/database/policies.sql`

## Running the Application

Development mode (runs both frontend and backend):
```bash
npm run dev
```

Or run separately:
```bash
# Backend
npm run server

# Frontend
npm run client
```

## User Roles

- **HOD (Head of Department)**: 
  - Manage all users
  - Assign tasks to everyone
  - Chat with professors
  
- **Professor**: 
  - Assign tasks to students and staff
  - View task progress
  - Chat with HOD
  
- **Supporting Staff**: 
  - View assigned tasks
  - Update task status
  
- **Student**: 
  - View assigned tasks
  - Update task status

## Login Portals

- **Admin Login**: For HOD and Professors
- **User Login**: For Supporting Staff and Students

## Project Structure

```
agile-flow/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   ├── database/
│   └── package.json
└── package.json
```

## License

MIT
