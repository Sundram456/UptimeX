# ServicePulse - Quick Start Guide

## 🎯 5-Minute Setup

### Step 1: Backend Setup (3 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with these minimum values:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=servicepulse
# DB_USER=postgres
# DB_PASSWORD=postgres (or your password)
# JWT_SECRET=your-secret-key-here

# Initialize database (requires PostgreSQL running)
npm run migrate

# Start backend server
npm start
# ✓ Server running on http://localhost:5000
```

### Step 2: Frontend Setup (2 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start
# ✓ App running on http://localhost:3000
```

### Step 3: Create Your First Monitor (1 minute)

1. Go to http://localhost:3000
2. Sign up with any email/password
3. Click "+ Add Monitor"
4. Add a monitor:
   - Name: "Google"
   - URL: https://google.com
   - Interval: 300 seconds
5. Click "Create Monitor"
6. Wait 1-2 minutes to see first health check

---

## 📝 Test Checklist

### Backend Health

```bash
# Check health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-18T..."}
```

### Create Monitor

```bash
# First, login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Copy the token from response
# Then create monitor
curl -X POST http://localhost:5000/api/monitors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test API",
    "url":"https://jsonplaceholder.typicode.com",
    "interval_seconds":300
  }'
```

### View Monitors in Frontend

1. Login to http://localhost:3000
2. Click on any monitor card
3. View analytics (wait 2+ checks for data)
4. See recent logs table

---

## 🔧 Database Setup

### PostgreSQL Installation

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu):**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database User

```bash
psql -U postgres

postgres=# CREATE USER servicepulse_user WITH PASSWORD 'your_password';
postgres=# ALTER ROLE servicepulse_user WITH CREATEDB;
postgres=# \q
```

Update `.env`:
```
DB_USER=servicepulse_user
DB_PASSWORD=your_password
```

---

## 🚨 Common Issues

### Issue: "Cannot find module 'pg'"

**Solution:**
```bash
cd backend
npm install
```

### Issue: "Database servicepulse does not exist"

**Solution:**
```bash
cd backend
npm run migrate
```

### Issue: "Connection refused on port 5432"

**Solution:**
- PostgreSQL not running
- Start PostgreSQL service
- Check DB_HOST in .env (usually localhost)

### Issue: "Token not found" error on frontend

**Solution:**
- Make sure you're logged in
- Check browser localStorage for token
- Login again

### Issue: Monitor status always "UNKNOWN"

**Solution:**
- Wait 1-2 minutes for first health check
- Check backend logs for errors
- Verify monitor is active (toggle button)
- Ensure internet connection to monitored URL

---

## 📊 Example Monitors to Test

### Public APIs (Always Available)

```
Name: JSONPlaceholder
URL: https://jsonplaceholder.typicode.com
Interval: 300s

Name: OpenWeather
URL: https://api.openweathermap.org/data/2.5/weather
Interval: 600s

Name: GitHub Status
URL: https://www.githubstatus.com
Interval: 900s
```

### Local Services

```
Name: Local Node App
URL: http://localhost:3000
Interval: 60s

Name: Local API
URL: http://localhost:5000/health
Interval: 60s
```

---

## 🎓 Architecture Overview

### What Happens Every 60 Seconds?

1. **Health Checker** (Background Job)
   - Fetches all active monitors
   - Makes HTTP request to each URL
   - Measures response time
   - Records status (UP/DOWN)

2. **Alert Triggering**
   - After 3 failed checks → DOWN alert
   - If response time > 5s → SLOW alert
   - When recovers → RECOVERED alert

3. **Email Sending**
   - Alert email queued
   - Sent asynchronously (won't block health check)
   - Throttled (max 1 per monitor type per 15 min)

4. **Data Stored**
   - monitor_logs → One entry per check
   - alerts → One per triggered alert
   - alert_history → For throttling

---

## 🔐 Security Notes

### Passwords
- Hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- Changed only by user request

### API Tokens
- JWT format
- Expire after 7 days
- Stored in browser localStorage
- Auto-logout on expiration

### URLs Monitored
- User can only see their own monitors
- No cross-user data access
- Database enforces user_id constraints

---

## 💾 Backing Up Data

### Export Monitors

```bash
# From PostgreSQL
pg_dump -U postgres servicepulse > backup.sql

# Restore later
psql -U postgres servicepulse < backup.sql
```

### Manual Export

1. Login to frontend
2. Export monitor list (feature: coming soon)
3. Keep in safe location

---

## 🚀 Next Steps

### Customize System

1. **Change Branding**
   - Edit `frontend/src/components/Header.js` - change "ServicePulse"
   - Update `frontend/public/index.html` - change title/description

2. **Change Intervals**
   - Edit `.env` - `HEALTH_CHECK_INTERVAL_SECONDS`
   - Change from 60s to 30s or 300s

3. **Change Email**
   - Update SMTP settings in `.env`
   - Send from your domain

4. **Add New Fields**
   - Add to database schema
   - Update models and controllers
   - Update frontend forms

### Deploy to Production

See main [README.md](README.md) for deployment options:
- Vercel (frontend)
- Netlify (frontend)
- Heroku (backend)
- AWS (both)
- Docker containers

---

## 📚 Full Documentation

- **Project Overview**: [README.md](README.md)
- **Backend API**: [backend/README.md](backend/README.md)
- **Frontend Guide**: [frontend/README.md](frontend/README.md)

---

## 🎉 You're All Set!

Your URL monitoring system is ready to:
- ✅ Monitor any HTTP endpoint
- ✅ Track uptime and response times
- ✅ Send email alerts
- ✅ Provide analytics and insights
- ✅ Scale to thousands of monitors

**Start monitoring now!** 🚀

---

**Questions?** Check the detailed README files or review the code comments.
