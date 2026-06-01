# Agile Flow - Quick Start & Development Guide

**Version:** 1.0.0  
**Last Updated:** June 1, 2026  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Project Structure](#project-structure)
6. [Key Technologies](#key-technologies)
7. [API Overview](#api-overview)
8. [Development Workflow](#development-workflow)
9. [Troubleshooting](#troubleshooting)
10. [Useful Commands](#useful-commands)

---

## 📱 Project Overview

**Agile Flow** is a full-stack task management system for academic institutions, built with:
- **Backend:** Express.js + Supabase
- **Frontend:** React + Vite + Tailwind CSS
- **Authentication:** Supabase Auth (JWT)
- **Database:** PostgreSQL (Supabase)

### Key Features
✅ Role-based task assignment (HOD → Professor → Students)  
✅ Private and community messaging  
✅ Real-time online status tracking  
✅ Email notifications for tasks  
✅ Comprehensive dashboard with statistics  
✅ Secure JWT-based authentication  

### User Roles
- **HOD:** Full system access
- **Professor:** Can assign tasks, manage users
- **Supporting Staff:** Can receive tasks
- **Student:** Can view assigned tasks

---

## 🔧 Prerequisites

### System Requirements
- Node.js 14+ (recommended: 18 LTS)
- npm or yarn
- Git
- A modern web browser

### Required Accounts
- [Supabase Account](https://supabase.com) (free tier is sufficient)
- [Gmail Account](https://gmail.com) (for email notifications, optional)

### Required Credentials
You'll need:
- Supabase Project URL
- Supabase Anon Key
- Supabase Service Role Key
- Gmail Email & App Password (for email service)

---

## 📦 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd agile-flow
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# OR create manually with:
# cat > .env << 'EOF'
# [paste contents below]
# EOF

# Edit .env with your credentials:
cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Agile Flow <noreply@agileflow.com>
EOF

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# Start development server
npm run dev
```

### 4. Database Setup

In Supabase Dashboard:
1. Go to SQL Editor
2. Run `backend/database/schema.sql`
3. Run `backend/database/policies.sql`
4. Run `backend/database/enable-realtime.sql`
5. Run `backend/database/add-created-by.sql` (if needed)

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Production Mode

**Backend:**
```bash
cd backend
npm start
# Set NODE_ENV=production in .env
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
# Build output in dist/
```

---

## 📁 Project Structure Overview

```
agile-flow/
├── backend/
│   ├── src/
│   │   ├── server.js              # Server entry point
│   │   ├── config/
│   │   │   └── supabase.js        # Supabase client setup
│   │   ├── controllers/           # Business logic
│   │   ├── routes/                # API endpoints
│   │   ├── middleware/            # Auth & validation
│   │   └── services/              # External services (email)
│   ├── database/                  # SQL schema files
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main component & routing
│   │   ├── pages/                # Page components
│   │   ├── components/           # Reusable components
│   │   ├── contexts/             # State management (Auth)
│   │   ├── lib/                  # Utilities (API, Supabase)
│   │   └── utils/                # Helper functions
│   ├── public/                   # Static assets
│   └── package.json
│
└── README.md                      # This file
```

---

## 🛠️ Key Technologies

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| Express.js | Web framework | 4.18.2 |
| Supabase JS | Database & Auth | 2.39.3 |
| Nodemailer | Email service | 6.9.7 |
| Helmet | Security headers | 7.1.0 |
| CORS | Cross-origin support | 2.8.5 |
| Dotenv | Environment variables | 16.3.1 |
| Nodemon | Auto-reload (dev) | 3.0.2 |

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI library | 18.2.0 |
| Vite | Build tool | 5.0.8 |
| React Router | Routing | 6.21.1 |
| Tailwind CSS | Styling | 3.4.0 |
| Lucide React | Icons | 0.303.0 |
| React Hot Toast | Notifications | 2.4.1 |
| Date-fns | Date utilities | 3.0.6 |

---

## 🔌 API Overview

### Base URL
```
http://localhost:5000/api
```

### Key Endpoints

**Authentication**
```
POST   /auth/register     - Register new user
POST   /auth/login        - User login
GET    /auth/me           - Get current user
```

**Tasks**
```
GET    /tasks             - Get tasks (filtered)
POST   /tasks             - Create task (admin)
PUT    /tasks/:id         - Update task
DELETE /tasks/:id         - Delete task
GET    /tasks/stats       - Get statistics
```

**Users**
```
GET    /users             - Get all users
POST   /users             - Create user (admin)
PUT    /users/:id         - Update user
DELETE /users/:id         - Delete user (HOD)
PATCH  /users/status/online - Update online status
```

**Messages**
```
GET    /messages/private  - Get private messages
POST   /messages/private  - Send private message
GET    /messages/community - Get community chat
POST   /messages/community - Send community message
```

### Authentication Header
All requests (except login/register) require:
```
Authorization: Bearer <jwt-token>
```

---

## 💻 Development Workflow

### Adding a New Feature

#### 1. Backend
```javascript
// 1. Create controller in src/controllers/
export const newFeature = async (req, res) => {
  try {
    // Logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Add route in src/routes/
router.post('/new-endpoint', authenticateUser, newFeature);

// 3. Test with curl or Postman
curl -X POST http://localhost:5000/api/new-endpoint \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"data":"value"}'
```

#### 2. Frontend
```javascript
// 1. Add API method in lib/api.js
async newFeature(data) {
  return this.request('/new-endpoint', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 2. Create component in components/
function NewFeature() {
  const [data, setData] = useState(null);
  
  const handleSubmit = async () => {
    try {
      const result = await api.newFeature(data);
      toast.success('Success!');
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return <div>{/* JSX */}</div>;
}

// 3. Add route in App.jsx if needed
<Route path="/new-feature" element={<ProtectedRoute><NewFeature /></ProtectedRoute>} />
```

### Code Standards
- **Indentation:** 2 spaces
- **Naming:** camelCase for variables/functions, PascalCase for components
- **Comments:** JSDoc for functions, inline for complex logic
- **Error Handling:** Always use try-catch, provide meaningful messages
- **Async:** Use async/await, not callbacks

### Testing Changes Locally

```bash
# Backend test
curl -X GET http://localhost:5000/api/keep-alive

# Frontend test
# Open http://localhost:5173 in browser
```

---

## 🚨 Troubleshooting

### Backend Issues

**"Cannot find module" error**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Port 5000 already in use**
```bash
# Change PORT in .env or kill process
lsof -i :5000
kill -9 <PID>
```

**Supabase connection fails**
- Verify SUPABASE_URL is correct (without trailing slash)
- Check SUPABASE_ANON_KEY and SUPABASE_SERVICE_KEY
- Ensure Supabase project is active

**Email not sending**
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- For Gmail: Use [App Password](https://myaccount.google.com/apppasswords), not regular password
- Check email logs: `npm run dev` shows email status

### Frontend Issues

**"Cannot GET /" on page refresh**
- Issue: Vite dev server routing
- Solution: Usually works fine, check browser console for errors

**API requests fail (CORS error)**
- Check FRONTEND_URL in backend .env
- Verify backend is running on correct port
- Check browser console for error details

**Blank page or white screen**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json .vite
npm install
npm run dev
```

**Old API changes not reflected**
- Clear browser localStorage
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache

### Database Issues

**Cannot connect to Supabase**
- Verify internet connection
- Check Supabase project is active
- Verify credentials in .env
- Check Supabase service status

**"Relation does not exist" error**
- Run SQL schema files in Supabase SQL Editor
- Ensure schema.sql was executed first
- Check for SQL syntax errors

---

## 📝 Useful Commands

### Backend Commands
```bash
cd backend

npm install              # Install dependencies
npm run dev             # Start dev server with auto-reload
npm start               # Start production server
npm update              # Update dependencies
npm audit               # Check for vulnerabilities
```

### Frontend Commands
```bash
cd frontend

npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm update              # Update dependencies
```

### Supabase CLI Commands
```bash
# If using Supabase CLI
supabase projects list  # List projects
supabase db push        # Push schema changes
supabase migrations list # View migrations
```

### Database Access
```bash
# Access Supabase database directly
# Go to: https://app.supabase.com → Your Project → SQL Editor
# Or use any PostgreSQL client with:
# Host: your-project.supabase.co
# Port: 5432
# Database: postgres
# User: postgres
# Password: [your-password]
```

---

## 🔐 Environment Variables Reference

### Backend (.env)
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server
PORT=5000
NODE_ENV=development|production
FRONTEND_URL=http://localhost:5173

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Gmail App Password
EMAIL_FROM=Agile Flow <noreply@agileflow.com>
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📚 Additional Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

### Community
- Supabase Discord: https://discord.supabase.com
- React Discussion: https://github.com/facebook/react/discussions

### Tools
- [Postman](https://www.postman.com/) - API testing
- [TablePlus](https://tableplus.com/) - Database client
- [VS Code](https://code.visualstudio.com/) - Recommended editor

---

## 🎯 Getting Help

1. **Check the logs:**
   - Backend: Terminal where `npm run dev` runs
   - Frontend: Browser console (F12)
   - Browser network tab for API calls

2. **Common issues:** See [Troubleshooting](#troubleshooting) section

3. **Documentation:** See [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md) and [FEATURES_CHECKLIST.md](FEATURES_CHECKLIST.md)

4. **Code examples:** Check existing pages/controllers for patterns

---

## 📋 Checklist for First-Time Setup

- [ ] Node.js 14+ installed (`node --version`)
- [ ] Git installed and repository cloned
- [ ] Supabase account created
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] `.env` files created with correct credentials
- [ ] Database schema imported to Supabase
- [ ] Backend running on localhost:5000
- [ ] Frontend running on localhost:5173
- [ ] Can login with test credentials
- [ ] Can view dashboard
- [ ] Understand project structure

---

## 🚀 Next Steps

1. **Explore the codebase** - Start with App.jsx and Dashboard.jsx
2. **Run locally** - Follow installation steps above
3. **Read PROJECT_ANALYSIS.md** - Comprehensive feature documentation
4. **Check FEATURES_CHECKLIST.md** - See what's implemented vs planned
5. **Review existing code** - Understanding patterns before adding features
6. **Start coding** - Pick a feature to implement from the checklist

---

**Happy Coding! 🎉**

For questions or issues, refer to the documentation files or check the code comments.

Last Updated: June 1, 2026
