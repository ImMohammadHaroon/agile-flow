# Agile Flow - Complete Setup Guide

## 🚀 Quick Start

Follow these steps to get Agile Flow up and running.

---

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase account** (free tier works great)
- **Email account** for notifications (Gmail recommended)

---

## 🗄️ Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: Agile Flow
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 1.2 Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - keep this secret!

### 1.3 Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `backend/database/schema.sql`
4. Click **Run**
5. Create another new query
6. Copy and paste the entire contents of `backend/database/policies.sql`
7. Click **Run**

### 1.4 Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `community_messages`
   - `messages`

---

## 🔧 Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
PORT=5000

# Email Configuration (for Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=Agile Flow <noreply@agileflow.com>
```

### 2.3 Gmail App Password Setup (for Email Notifications)

1. Go to your Google Account settings
2. Enable **2-Factor Authentication** if not already enabled
3. Go to **Security** → **2-Step Verification** → **App passwords**
4. Generate a new app password for "Agile Flow"
5. Copy the 16-character password to your `.env` file

### 2.4 Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Agile Flow API Server
Status: Running
Port: 5000
```

---

## 💻 Step 3: Frontend Setup

### 3.1 Install Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 3.2 Configure Environment Variables

Create a `.env` file in the `frontend` folder:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:5000
```

### 3.3 Start Frontend Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🎯 Step 4: Create Your First User (HOD)

Since you need an HOD to create other users, you'll need to create the first HOD manually.

### Option 1: Using Supabase Dashboard

1. Go to **Authentication** → **Users** → **Add User**
2. Fill in:
   - **Email**: your-email@example.com
   - **Password**: secure-password
   - **Auto Confirm User**: Yes
3. Click **Create User**
4. Go to **Table Editor** → **users** table
5. Click **Insert** → **Insert row**
6. Fill in:
   - **id**: (copy from auth.users)
   - **email**: your-email@example.com
   - **name**: Your Name
   - **role**: HOD
7. Click **Save**

### Option 2: Using SQL

Run this in SQL Editor (replace with your details):

```sql
-- Create auth user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
)
VALUES (
  gen_random_uuid(),
  'hod@example.com',
  crypt('your-password', gen_salt('bf')),
  NOW(),
  '{"name": "John Doe", "role": "HOD"}'::jsonb
);

-- Create user profile
INSERT INTO public.users (id, email, name, role)
SELECT id, email, raw_user_meta_data->>'name', raw_user_meta_data->>'role'
FROM auth.users
WHERE email = 'hod@example.com';
```

---

## 🎨 Step 5: Access the Application

1. Open browser to `http://localhost:5173`
2. Click **Admin Login** (for HOD/Professor)
3. Login with your HOD credentials
4. You're in! 🎉

---

## 👥 Step 6: Create Additional Users

Once logged in as HOD:

1. Click **Manage Users** in sidebar
2. Click **Add User** button
3. Fill in user details:
   - Name, Email, Password, Role
4. Click **Create User**

Users can then login via:
- **Admin Login** → HOD & Professors
- **User Login** → Students & Supporting Staff

---

## ✅ Testing the Features

### Task Management
1. Login as HOD
2. Go to **Tasks** → **Create Task**
3. Assign task to any user
4. Logout and login as assigned user
5. Update task status

### Community Chat
1. Go to **Community Chat**
2. Send messages
3. See real-time updates from other users

### Private Messages (HOD ↔ Professor)
1. Login as HOD
2. Go to **Messages**
3. Start chat with a Professor
4. Login as Professor to reply

### Email Notifications
- Create a task → Assigned user receives email
- Check spam folder if not in inbox

---

## 🔐 Default Test Users

Create these for testing:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| HOD | hod@test.com | test123 | Admin Portal |
| Professor | prof@test.com | test123 | Admin Portal |
| Staff | staff@test.com | test123 | User Portal |
| Student | student@test.com | test123 | User Portal |

---

## 🛠️ Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify Supabase credentials in `.env`
- Run `npm install` again

### Frontend won't start
- Check if port 5173 is available
- Verify environment variables in `.env`
- Clear node_modules: `rm -rf node_modules && npm install`

### Can't login
- Verify user exists in Supabase Auth and users table
- Check browser console for errors
- Verify API is running on port 5000

### RLS Policies Error
- Make sure you ran both SQL scripts
- Check Supabase logs for policy violations
- Verify user role matches expected roles

### Email notifications not working
- Verify Gmail app password
- Check EMAIL_USER and EMAIL_PASSWORD in backend `.env`
- Enable "Less secure app access" if using regular password (not recommended)

### Real-time not working
- Enable replication for tables in Supabase
- Check browser console for WebSocket errors
- Verify Supabase URL in frontend `.env`

---

## 📦 Production Deployment

### Backend (Node.js)
Deploy to:
- **Heroku**: Easy deployment with buildpacks
- **Railway**: Modern Node.js hosting
- **DigitalOcean**: App Platform or Droplets
- **AWS**: Elastic Beanstalk or EC2

### Frontend (React)
Deploy to:
- **Vercel**: Best for React/Vite apps
- **Netlify**: Easy setup with CI/CD
- **Cloudflare Pages**: Free and fast

### Environment Variables
Remember to set all environment variables in production:
- Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
- Backend: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, EMAIL_*

---

## 📝 Important Notes

1. **Security**: Never commit `.env` files to git
2. **Service Role Key**: Keep this secret - it bypasses RLS
3. **Email Limits**: Gmail has sending limits (500/day)
4. **Supabase Free Tier**: 
   - 500MB database
   - 2GB bandwidth/month
   - 50,000 monthly active users
5. **Realtime**: 200 concurrent connections on free tier

---

## 🎓 User Roles & Permissions

### HOD (Head of Department)
- ✅ Create/manage all users
- ✅ Assign tasks to anyone
- ✅ View all tasks
- ✅ Chat with professors (private)
- ✅ Community chat

### Professor
- ✅ Assign tasks to students & staff
- ✅ View assigned tasks
- ✅ Chat with HOD (private)
- ✅ Community chat

### Supporting Staff
- ✅ View assigned tasks
- ✅ Update task status
- ✅ Community chat

### Student
- ✅ View assigned tasks
- ✅ Update task status
- ✅ Community chat

---

## 🆘 Support & Contact

For issues or questions:
1. Check this setup guide
2. Review code comments
3. Check Supabase documentation
4. Review API logs in terminal

---

## 🎉 You're All Set!

Your Agile Flow application is now ready to use. Enjoy managing your academic tasks!

**Happy task managing! 🚀**
