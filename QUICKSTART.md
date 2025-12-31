# Quick Start - Development Environment

This guide helps you get Agile Flow running in under 5 minutes.

## 🚀 Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] Supabase account created
- [ ] Git installed (optional)

## ⚡ Quick Setup (5 Minutes)

### Step 1: Supabase Setup (2 minutes)

1. **Create Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: "agile-flow"
   - Password: (generate strong password)
   - Region: (closest to you)
   - Click "Create Project" and wait ~2 minutes

2. **Get API Keys**
   - Go to Settings → API
   - Copy:
     - `Project URL`
     - `anon public key`
     - `service_role key`

3. **Setup Database**
   - Go to SQL Editor
   - Click "New Query"
   - Paste contents of `backend/database/schema.sql`
   - Click "Run"
   - Create another query
   - Paste contents of `backend/database/policies.sql`
   - Click "Run"

4. **Enable Realtime**
   - Go to Database → Replication
   - Enable for: `community_messages`, `messages`

### Step 2: Install Dependencies (1 minute)

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 3: Configure Environment (1 minute)

**Backend** - Create `backend/.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
PORT=5000

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Frontend** - Create `frontend/.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```

### Step 4: Create First User (1 minute)

**Option A: Using Supabase Dashboard**
1. Go to Authentication → Users
2. Add User:
   - Email: `hod@test.com`
   - Password: `test123`
   - Auto confirm: ✅
3. Go to Table Editor → users
4. Insert row:
   - id: (copy from auth.users)
   - email: `hod@test.com`
   - name: `Test HOD`
   - role: `HOD`

**Option B: Using SQL**
```sql
-- Run in SQL Editor
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'hod@test.com',
    crypt('test123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Test HOD"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Create profile
  INSERT INTO public.users (id, email, name, role)
  VALUES (user_id, 'hod@test.com', 'Test HOD', 'HOD');
END $$;
```

### Step 5: Start Development Servers

**Option A: Run Both Together**
```bash
npm run dev
```

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Step 6: Access Application

1. Open browser: http://localhost:5173
2. Click "Admin Login"
3. Login with:
   - Email: `hod@test.com`
   - Password: `test123`
4. You're in! 🎉

## 🧪 Create Test Users

Once logged in as HOD:

1. Go to "Manage Users"
2. Click "Add User"
3. Create these test users:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Test Professor | prof@test.com | test123 | Professor |
| Test Staff | staff@test.com | test123 | Supporting Staff |
| Test Student | student@test.com | test123 | Student |

## ✅ Verify Everything Works

### Test Task Management
1. Login as HOD
2. Go to Tasks → Create Task
3. Assign to student
4. Logout
5. Login as student (User Login portal)
6. See assigned task
7. Update status to "In Progress"

### Test Community Chat
1. Login as any user
2. Go to Community Chat
3. Send message
4. Open another browser/incognito
5. Login as different user
6. See message appear in real-time

### Test Private Messages
1. Login as HOD (Admin Login)
2. Go to Messages
3. Click on professor
4. Send message
5. Login as professor
6. Reply to message

### Test Email Notifications
1. Make sure email is configured
2. Create a task as HOD
3. Check assigned user's email
4. Should receive notification

## 🐛 Common Issues & Fixes

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process or change port in .env
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't login
- Verify user exists in both auth.users AND public.users
- Check browser console for errors
- Verify Supabase keys in .env files

### Database errors
- Make sure both SQL scripts ran successfully
- Check Supabase dashboard logs
- Verify RLS policies are enabled

### Real-time not working
- Enable replication in Supabase
- Check browser console for WebSocket errors
- Verify Supabase URL in frontend .env

## 📝 Development Workflow

### Daily Development
1. Pull latest code
2. Run `npm run dev` from root
3. Make changes
4. Test in browser
5. Commit changes

### Making Changes

**Backend Changes:**
- Edit controllers/routes in `backend/src/`
- Server auto-restarts with nodemon
- Test with Postman or frontend

**Frontend Changes:**
- Edit components/pages in `frontend/src/`
- Hot reload updates browser automatically
- Check browser console for errors

**Database Changes:**
- Update `schema.sql` or `policies.sql`
- Run in Supabase SQL Editor
- Document changes in migration files

## 🎯 Next Steps

1. ✅ Read [README.md](README.md) for overview
2. ✅ Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
3. ✅ Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
4. ✅ Explore [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for architecture
5. ✅ Start building features!

## 📞 Need Help?

- Check documentation files
- Review code comments
- Search for similar issues
- Check Supabase dashboard logs

## 🎉 You're Ready!

You now have a fully functional Agile Flow development environment.

**Happy coding! 🚀**

---

**Tips:**
- Use VS Code with ESLint and Prettier
- Install React Developer Tools extension
- Use Supabase Studio for database management
- Keep dependencies updated
- Write tests for new features
- Follow the existing code style
- Document complex logic
- Use meaningful commit messages

---

Last Updated: December 25, 2025
