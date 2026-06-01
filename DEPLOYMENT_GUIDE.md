# Agile Flow - Deployment Guide

**Last Updated:** June 1, 2026  
**Version:** 1.0.0  

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting Deployment](#troubleshooting-deployment)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All code is committed and pushed
- [ ] All tests pass locally
- [ ] No sensitive data in repository (credentials, API keys)
- [ ] Environment variables are documented
- [ ] Database backup procedure is in place
- [ ] Production Supabase project is created
- [ ] Admin credentials are securely stored
- [ ] Domain name is registered (if applicable)
- [ ] SSL/TLS certificates are ready
- [ ] Email service is configured for production
- [ ] Rate limiting is enabled in production
- [ ] Security headers are verified
- [ ] CORS whitelist is updated
- [ ] Monitoring and logging are configured
- [ ] Team members have access credentials

---

## Backend Deployment

### Option 1: Deploy to Vercel (Recommended for Serverless)

**Why Vercel?**
- Free tier available
- Automatic deployments from GitHub
- Easy environment variable management
- Built-in monitoring
- Auto-scaling

**Steps:**

1. **Prepare Repository**
   ```bash
   # Ensure backend has proper structure
   # backend/
   # ├── src/
   # ├── package.json
   # └── vercel.json (optional)
   ```

2. **Create vercel.json in backend/**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/server.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Vercel Setup**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository
   - Select `backend` folder as root directory
   - Add environment variables (see below)
   - Deploy

4. **Get Production URL**
   - After deployment, Vercel provides a URL
   - Update frontend VITE_API_URL with this URL
   - Update CORS whitelist in backend with frontend URL

### Option 2: Deploy to Heroku

**Steps:**

1. **Create Heroku Account**
   - Go to [Heroku](https://www.heroku.com)
   - Create free account

2. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   choco install heroku-cli
   
   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

3. **Deploy**
   ```bash
   # Login to Heroku
   heroku login
   
   # Create new app
   heroku create agile-flow-backend
   
   # Set environment variables
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_ANON_KEY=your_key
   heroku config:set SUPABASE_SERVICE_KEY=your_key
   heroku config:set FRONTEND_URL=https://your-frontend-url
   heroku config:set EMAIL_USER=your-email
   heroku config:set EMAIL_PASSWORD=your-password
   heroku config:set NODE_ENV=production
   
   # Deploy
   git push heroku main
   
   # View logs
   heroku logs --tail
   ```

### Option 3: Deploy to DigitalOcean App Platform

**Steps:**

1. **Create DigitalOcean Account**
   - Go to [DigitalOcean](https://www.digitalocean.com)

2. **App Platform Setup**
   - Click "Create" → "App"
   - Connect GitHub repository
   - Select `backend` folder
   - Configure environment variables
   - Deploy

3. **Get Production URL**
   - DigitalOcean provides a live app URL
   - Use this for frontend API configuration

### Option 4: Deploy to AWS (EC2/Elastic Beanstalk)

**For EC2:**
```bash
# SSH into server
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs

# Clone repository
git clone https://github.com/your-repo.git
cd agile-flow/backend

# Install dependencies and start
npm install
npm start
```

**For Elastic Beanstalk:**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Set environment variables
eb setenv SUPABASE_URL=... NODE_ENV=production

# Deploy
eb deploy
```

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

**Steps:**

1. **Vercel Setup**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository
   - Select `frontend` folder as root directory

2. **Configure Build**
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy**
   - Vercel automatically deploys on push to main
   - Get live URL from Vercel dashboard

### Option 2: Deploy to Netlify

**Steps:**

1. **Netlify Setup**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect GitHub repository

2. **Configure Build**
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Base Directory: `frontend`

3. **Set Environment Variables**
   - Go to Site Settings → Build & Deploy → Environment
   - Add your environment variables

4. **Deploy**
   - Netlify automatically builds and deploys
   - Get live URL from Netlify dashboard

3. **Configure Redirects**
   - Create `netlify.toml` in frontend/:
   ```toml
   [build]
   command = "npm run build"
   publish = "dist"

   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

### Option 3: Deploy to AWS S3 + CloudFront

**Steps:**

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - AWS Console → S3
   - Create bucket: `agile-flow-frontend`
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Create CloudFront Distribution**
   - CloudFront → Create Distribution
   - Set origin to S3 bucket
   - Set default root object to `index.html`
   - Create distribution

4. **Set Environment Variables**
   - Rebuild with production API URL
   - Redeploy to S3

### Option 4: Deploy to GitHub Pages

**Steps:**

1. **Update vite.config.js**
   ```javascript
   export default {
     base: '/',  // Change if needed
     build: {
       outDir: 'dist'
     }
   }
   ```

2. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   
   # Push dist folder to gh-pages branch
   gh-pages -d dist
   ```

3. **Configure GitHub**
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages
   - Get live URL

---

## Database Setup

### Supabase Production Project

1. **Create Production Project**
   - Go to [Supabase](https://app.supabase.com)
   - Click "New project"
   - Select region (choose closest to users)
   - Create

2. **Set Up Database**
   - Go to SQL Editor
   - Run schema files in order:
     1. `backend/database/schema.sql`
     2. `backend/database/policies.sql`
     3. `backend/database/enable-realtime.sql`
     4. `backend/database/add-created-by.sql`

3. **Enable RLS (Row Level Security)**
   - Authentication → Policies
   - Review generated policies
   - Test access controls

4. **Set Up Backups**
   - Go to Settings → Backups
   - Enable automatic daily backups
   - Set backup retention (30+ days recommended)

5. **Enable Real-time (Optional)**
   - Database → Replication
   - Enable for tables: messages, community_messages, tasks, users

6. **Configure Auth**
   - Authentication → Providers
   - Enable Email provider
   - Email settings → Redirect URLs
   - Add both backend and frontend URLs

---

## Environment Variables

### Backend Production (.env)

```bash
# Supabase (Production)
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=<your-production-anon-key>
SUPABASE_SERVICE_KEY=<your-production-service-key>

# Server
PORT=5000  # May be ignored on some platforms
NODE_ENV=production
FRONTEND_URL=https://your-production-frontend-url.com

# Email (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=<your-16-char-app-password>
EMAIL_FROM=Agile Flow <noreply@agileflow.com>

# Security (Optional)
CORS_ORIGIN=https://your-production-frontend-url.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Frontend Production (.env)

```bash
VITE_API_URL=https://your-production-backend-url.com
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=<your-production-anon-key>
```

### Setting Environment Variables

**Vercel:**
```
Settings → Environment Variables → Add
```

**Heroku:**
```bash
heroku config:set KEY=value
```

**DigitalOcean:**
```
App Settings → Environment Variables → Add
```

**Netlify:**
```
Site Settings → Build & Deploy → Environment Variables
```

---

## Post-Deployment Verification

### Smoke Tests

```bash
# Backend Health Check
curl https://your-backend-url/api/keep-alive

# Frontend Access
# Open https://your-frontend-url in browser
# Verify page loads without errors
```

### Functionality Tests

1. **Authentication**
   - [ ] Can register new user
   - [ ] Can login with credentials
   - [ ] Can logout
   - [ ] Session persists on refresh
   - [ ] Invalid credentials rejected

2. **Tasks**
   - [ ] Can create task
   - [ ] Can view tasks
   - [ ] Can update task status
   - [ ] Email notification sent
   - [ ] Can delete task

3. **Users**
   - [ ] Can view users list
   - [ ] Can view user details
   - [ ] Can create user (admin)
   - [ ] Online status updates

4. **Messaging**
   - [ ] Can send private message
   - [ ] Can view message history
   - [ ] Can send community message
   - [ ] Messages are persistent

5. **Dashboard**
   - [ ] Stats display correctly
   - [ ] Recent tasks shown
   - [ ] No console errors
   - [ ] Responsive design works

### Performance Tests

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-backend-url/api/keep-alive

# Load testing (optional)
# Use Apache Bench, hey, or k6
ab -n 1000 -c 100 https://your-backend-url/api/keep-alive
```

### Security Verification

```bash
# Check security headers
curl -I https://your-backend-url

# Should see:
# Strict-Transport-Security
# X-Content-Type-Options
# X-Frame-Options
# Content-Security-Policy
```

---

## Monitoring & Maintenance

### Set Up Monitoring

1. **Backend Monitoring**
   - Vercel Analytics
   - Sentry (error tracking)
   - LogRocket (user sessions)
   - CloudWatch/DataDog (if using AWS)

2. **Frontend Monitoring**
   - Google Analytics
   - Sentry
   - LogRocket

3. **Database Monitoring**
   - Supabase Postgres Logs
   - Query performance monitoring
   - Backup verification

### Daily/Weekly Tasks

- [ ] Check error logs
- [ ] Monitor uptime/availability
- [ ] Verify backups are running
- [ ] Check email delivery
- [ ] Review user feedback

### Monthly Tasks

- [ ] Update dependencies
- [ ] Review security vulnerabilities
- [ ] Analyze performance metrics
- [ ] Check database growth
- [ ] Update documentation

### Quarterly Tasks

- [ ] Security audit
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Disaster recovery test
- [ ] User feedback review

---

## Rollback Procedures

### Quick Rollback (Last Known Good Version)

**Vercel:**
```
Deployments → Select previous version → Click "Redeploy"
```

**Heroku:**
```bash
heroku releases
heroku rollback v<previous-version>
```

**GitHub Actions:**
```
Actions → Select workflow run → Re-run jobs
```

### Database Rollback

1. **Contact Supabase Support** (if needed)
2. **Use Automatic Backups**
   - Supabase → Settings → Backups
   - Request restore to specific time
3. **Manual Backup Restore**
   - Have pg_dump backup ready
   - Restore to temporary database
   - Verify data integrity
   - Switch if acceptable

### Emergency Rollback Plan

1. **Identify Issue**
   - Check error logs
   - Verify reproduction
   - Identify root cause

2. **Decision**
   - Fix in production (hotfix)
   - Rollback to previous version
   - Emergency maintenance window

3. **Execute Rollback**
   - For backend: redeploy previous version
   - For frontend: clear cache, redeploy
   - For database: restore from backup
   - Test all systems

4. **Communicate**
   - Notify users of status
   - Provide ETA for resolution
   - Post incident summary

---

## Troubleshooting Deployment

### Backend Won't Start

**Symptom:** 500 errors on all endpoints

**Solutions:**
1. Check environment variables are set correctly
2. Verify Supabase credentials and connectivity
3. Check logs: `heroku logs --tail` or Vercel dashboard
4. Ensure database tables exist
5. Restart application

### CORS Errors

**Symptom:** Browser console shows CORS errors

**Solutions:**
1. Update `FRONTEND_URL` in backend .env
2. Add frontend URL to CORS whitelist in server.js
3. Verify CORS middleware is applied
4. Clear browser cache
5. Check request origin header

### Email Not Sending

**Symptom:** Tasks assigned but no email received

**Solutions:**
1. Verify EMAIL_USER and EMAIL_PASSWORD
2. For Gmail: ensure App Password (not regular password)
3. Enable "Less Secure Apps" if using Gmail
4. Check email logs in backend
5. Test with manual email send
6. Verify recipient email is valid

### Database Connection Issues

**Symptom:** "Cannot connect to database" errors

**Solutions:**
1. Verify SUPABASE_URL format (no trailing slash)
2. Check SUPABASE_SERVICE_KEY is correct
3. Verify Supabase project is active
4. Check firewall/network access
5. Verify database tables exist
6. Test connection with psql

### Frontend Not Loading

**Symptom:** Blank page or 404 errors

**Solutions:**
1. Check build output (npm run build)
2. Verify VITE_API_URL points to correct backend
3. Clear browser cache and localStorage
4. Hard refresh (Ctrl+Shift+R)
5. Check browser console for errors
6. Verify static file serving

### Performance Issues

**Symptom:** Slow page loads or unresponsive UI

**Solutions:**
1. Check network tab in DevTools
2. Optimize database queries
3. Enable response caching
4. Reduce bundle size (analyze with vite plugin)
5. Use CDN for static assets
6. Monitor backend response times
7. Scale backend/database if needed

---

## Deployment Checklist

- [ ] All code committed and tested
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers verified
- [ ] CORS whitelist updated
- [ ] Email service working
- [ ] SSL/TLS certificates valid
- [ ] Monitoring configured
- [ ] Backups enabled and tested
- [ ] Documentation updated
- [ ] Team notified
- [ ] Post-deployment tests passed
- [ ] User communication ready
- [ ] Rollback plan documented

---

## Deployment Timeline

### Day 1 (Preparation)
- [ ] Test all features locally
- [ ] Create production databases
- [ ] Configure environment variables
- [ ] Set up monitoring

### Day 2 (Deployment)
- [ ] Deploy backend
- [ ] Verify backend functionality
- [ ] Deploy frontend
- [ ] Run smoke tests
- [ ] Monitor errors

### Day 3 (Verification)
- [ ] Monitor user feedback
- [ ] Check performance metrics
- [ ] Verify backups
- [ ] Document issues

---

## Support & Escalation

### Common Issues
- Refer to [Troubleshooting Deployment](#troubleshooting-deployment)

### Get Help
- **Supabase Support:** https://supabase.com/support
- **Vercel Support:** https://vercel.com/support
- **Node.js Docs:** https://nodejs.org/docs

### Emergency Contact
- Have backup contacts for key services
- Document escalation procedures
- Maintain SLAs for critical issues

---

## References

- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-production)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Deployment Guide](https://react.dev/learn/deployment)

---

**Last Updated:** June 1, 2026  
**Version:** 1.0.0
