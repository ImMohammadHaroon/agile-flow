# Troubleshooting Guide - Agile Flow

Common issues and their solutions.

---

## 🚨 Installation Issues

### Node Modules Installation Failed

**Problem:** `npm install` fails with errors

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete lock files and node_modules
rm -rf package-lock.json node_modules
rm -rf backend/package-lock.json backend/node_modules
rm -rf frontend/package-lock.json frontend/node_modules

# Reinstall
npm run install-all
```

### Permission Errors (Linux/Mac)

**Problem:** `EACCES: permission denied`

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER .
```

---

## 🔧 Backend Issues

### Port 5000 Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### Supabase Connection Failed

**Problem:** `Error connecting to Supabase`

**Check:**
1. Verify `.env` file exists in backend folder
2. Check Supabase URL format: `https://xxxxx.supabase.co`
3. Verify API keys are correct (no extra spaces)
4. Check Supabase project is active

**Test connection:**
```javascript
// Add to backend/src/server.js temporarily
import { supabase } from './config/supabase.js';

supabase.from('users').select('count').then(console.log);
```

### Email Service Not Working

**Problem:** Emails not being sent

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
3. Use 16-character app password (no spaces)

**Environment Check:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # App password
EMAIL_FROM=Agile Flow <noreply@agileflow.com>
```

**Test email:**
```javascript
// backend/src/test-email.js
import { sendTaskAssignmentEmail } from './services/emailService.js';

sendTaskAssignmentEmail(
  'test@example.com',
  'Test User',
  'Test Task',
  'Test Assigner',
  new Date()
).then(console.log);
```

### Database Schema Not Created

**Problem:** `relation "users" does not exist`

**Solution:**
1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy/paste `backend/database/schema.sql`
4. Run query
5. Verify tables in Table Editor

### RLS Policies Error

**Problem:** `new row violates row-level security policy`

**Solution:**
1. Run `backend/database/policies.sql` in SQL Editor
2. Verify policies in Database → Policies
3. Check user role matches policy requirements

---

## 💻 Frontend Issues

### Port 5173 Already in Use

**Problem:** `Port 5173 is in use`

**Solution:**

**Windows:**
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5173 | xargs kill -9
```

### White Screen / Blank Page

**Problem:** Frontend loads but shows nothing

**Check:**
1. Browser console for errors (F12)
2. Verify API is running on port 5000
3. Check `.env` file in frontend folder

**Debug:**
```javascript
// Add to frontend/src/main.jsx
console.log('Environment:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  apiUrl: import.meta.env.VITE_API_URL
});
```

### CORS Error

**Problem:** `Access to fetch blocked by CORS policy`

**Solution:**
1. Verify backend is running
2. Check backend CORS configuration:
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Vite Build Failed

**Problem:** `Build failed with errors`

**Solution:**
```bash
cd frontend

# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

---

## 🔐 Authentication Issues

### Can't Login - "Invalid credentials"

**Check:**
1. User exists in Supabase Auth (Authentication → Users)
2. User profile exists in public.users table
3. Email matches in both tables
4. Password is correct (reset if needed)

**Verify user:**
```sql
-- Run in Supabase SQL Editor
SELECT 
  au.email as auth_email,
  au.email_confirmed_at,
  u.email as profile_email,
  u.name,
  u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'your-email@example.com';
```

### Token Expired / Invalid

**Problem:** `Invalid or expired token`

**Solution:**
1. Clear browser localStorage
2. Logout and login again
3. Check token in localStorage (DevTools → Application → Local Storage)

**Clear session:**
```javascript
// Browser console
localStorage.clear();
location.reload();
```

### Role-Based Access Not Working

**Problem:** User can access pages they shouldn't

**Check:**
1. User role in database: `SELECT role FROM users WHERE email = 'email@example.com'`
2. Role matches expected values: `HOD`, `Professor`, `Supporting Staff`, `Student`
3. Protected route configuration in frontend

---

## 💬 Real-time Issues

### Messages Not Appearing Instantly

**Problem:** Chat messages don't show in real-time

**Solutions:**

1. **Enable Realtime in Supabase:**
   - Database → Replication
   - Enable for `messages` and `community_messages` tables

2. **Check WebSocket Connection:**
   - Browser DevTools → Network → WS tab
   - Should see active WebSocket connection

3. **Verify Subscription:**
```javascript
// Check in browser console
const channel = supabase.channel('test');
console.log('Channel state:', channel.state);
```

4. **Check Browser Compatibility:**
   - Use modern browser (Chrome, Firefox, Safari, Edge)
   - Ensure WebSockets are not blocked

### Real-time Stopped Working

**Problem:** Was working, now stopped

**Solutions:**
1. Refresh page
2. Check Supabase dashboard for service issues
3. Verify network connection
4. Check browser console for errors

---

## 🗄️ Database Issues

### Table Not Found

**Problem:** `relation "tablename" does not exist`

**Solution:**
```sql
-- Check if tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public';

-- If missing, run schema.sql again
```

### Data Not Showing

**Problem:** Created data but can't see it

**Check:**
1. RLS policies are correct
2. User has permission to view
3. Data actually exists: Check in Supabase Table Editor

**Disable RLS temporarily (testing only):**
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- Remember to enable again!
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### Foreign Key Constraint Error

**Problem:** `violates foreign key constraint`

**Solution:**
- Ensure referenced record exists
- Check user IDs are valid UUIDs
- Verify relationships in schema

---

## 🎨 UI/Styling Issues

### Tailwind Classes Not Working

**Problem:** CSS classes have no effect

**Solution:**
```bash
cd frontend

# Rebuild Tailwind
npm run build

# Or restart dev server
npm run dev
```

### Layout Broken on Mobile

**Problem:** Responsive design not working

**Check:**
1. Viewport meta tag in `index.html`
2. Responsive classes (sm:, md:, lg:)
3. Browser mobile simulation (F12 → Device toolbar)

---

## 📧 Email Notification Issues

### Emails Going to Spam

**Solutions:**
1. Use verified email address
2. Configure SPF/DKIM records (advanced)
3. Use professional email service
4. Ask recipient to whitelist sender

### Gmail Blocking Sign-in

**Problem:** `Less secure app blocked`

**Solution:**
1. Use App Password (recommended)
2. Enable 2FA + App Password
3. Don't use "Less secure app access"

---

## 🚀 Deployment Issues

### Build Fails in Production

**Problem:** `npm run build` fails

**Check:**
1. All environment variables set
2. No development-only imports
3. TypeScript/linting errors resolved

**Test build locally:**
```bash
cd frontend
npm run build
npm run preview  # Test production build
```

### Environment Variables Not Working

**Problem:** `undefined` in production

**Solution:**

**Vercel/Netlify:**
- Add in dashboard under Settings → Environment Variables
- Prefix with `VITE_` for frontend

**Railway/Heroku:**
- Add via CLI or dashboard
- No `VITE_` prefix needed for backend

### API Not Reachable in Production

**Problem:** Frontend can't connect to backend

**Check:**
1. CORS origin includes production URL
2. `VITE_API_URL` points to production API
3. Backend is deployed and running
4. HTTPS enabled (if required)

---

## 🔍 Debug Tools

### Enable Debug Mode

**Backend:**
```javascript
// backend/src/server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Frontend:**
```javascript
// frontend/src/lib/api.js
console.log('API Request:', endpoint, options);
```

### Browser DevTools

**Essential tabs:**
1. **Console**: JavaScript errors
2. **Network**: API requests/responses
3. **Application**: LocalStorage, cookies
4. **Sources**: Breakpoints, debugging

**Useful commands:**
```javascript
// Check current user
localStorage.getItem('supabase_token');

// Check environment
console.table({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  apiUrl: import.meta.env.VITE_API_URL
});

// Test API
fetch('http://localhost:5000/health').then(r => r.json()).then(console.log);
```

### Supabase Dashboard

**Check:**
1. **Logs**: Database/Auth errors
2. **API**: Usage statistics
3. **Auth**: User list
4. **Table Editor**: Verify data

---

## 📝 Logs

### Backend Logs

**View logs:**
```bash
cd backend
npm run dev

# Or with detailed logging
DEBUG=* npm run dev
```

**Log to file:**
```javascript
// backend/src/server.js
import fs from 'fs';

const logStream = fs.createWriteStream('app.log', { flags: 'a' });
app.use((req, res, next) => {
  logStream.write(`${new Date().toISOString()} ${req.method} ${req.path}\n`);
  next();
});
```

### Frontend Logs

**Browser console** (F12)

**React DevTools:**
- Install extension
- Components tab: Component tree
- Profiler tab: Performance

---

## 🆘 Still Stuck?

1. **Read Documentation:**
   - README.md
   - SETUP_GUIDE.md
   - API_DOCUMENTATION.md

2. **Check Logs:**
   - Backend terminal
   - Browser console
   - Supabase dashboard

3. **Test Components:**
   - Test backend API with Postman
   - Test frontend pages individually
   - Check database directly

4. **Search Issues:**
   - Look for similar problems
   - Check dependency documentation

5. **Ask for Help:**
   - Provide error messages
   - Share relevant code
   - Describe steps to reproduce

---

## 📋 Quick Checks Checklist

When something breaks, run through this:

- [ ] Is the backend running? (`http://localhost:5000/health`)
- [ ] Is the frontend running? (`http://localhost:5173`)
- [ ] Are environment variables set correctly?
- [ ] Is Supabase project active?
- [ ] Are database tables created?
- [ ] Are RLS policies applied?
- [ ] Is realtime enabled?
- [ ] Check browser console for errors
- [ ] Check terminal for errors
- [ ] Try hard refresh (Ctrl+Shift+R)
- [ ] Clear browser cache/localStorage
- [ ] Restart servers
- [ ] Check for typos in config files

---

**Remember:** Most issues are configuration or environment related. Double-check your `.env` files first!

Good luck! 🍀
