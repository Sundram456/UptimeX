# UptimeX - Distributed URL Monitoring & Alert System

**A production-ready SaaS application for monitoring URL health with real-time alerts and analytics.**

---

## 🎯 Overview

UptimeX is a complete monitoring solution that:

✅ **Monitors URLs** - HTTP health checks with configurable intervals  
✅ **Tracks Performance** - Response times and status codes  
✅ **Sends Alerts** - Email notifications with throttling  
✅ **Provides Analytics** - Uptime percentages and historical data  
✅ **Scales Horizontally** - Built for distributed systems  
✅ **Production-Ready** - Enterprise-grade code quality  

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL (relational database)
- JWT authentication
- node-cron (background jobs)
- Nodemailer (email alerts)
- Axios (HTTP client)

**Frontend:**
- React 18
- React Router (navigation)
- Chart.js (analytics charts)
- Axios (API client)
- CSS (responsive design)

**DevOps:**
- Git version control
- Environment-based configuration
- Modular architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Login/Signup → Dashboard → Monitor Details → Charts │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬──────────────────────────────────────────┘
                 │ HTTP/JWT
┌────────────────▼──────────────────────────────────────────┐
│                 Backend (Express.js)                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Auth Routes → Monitor Routes → Alert Routes        │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Services Layer (Business Logic)                    │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Models Layer (Database Operations)                 │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Background Job: Health Checker (node-cron)        │ │
│  │  - Continuous URL monitoring                        │ │
│  │  - Creates health check logs                        │ │
│  │  - Triggers alerts (with throttling)               │ │
│  │  - Sends emails asynchronously                      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────┬──────────────────────────────────────────┘
                 │ SQL Queries
┌────────────────▼──────────────────────────────────────────┐
│              PostgreSQL Database                           │
│  ┌──────────────┬──────────────┬──────────────┐           │
│  │ users        │ monitors     │ monitor_logs │           │
│  ├──────────────┼──────────────┼──────────────┤           │
│  │ alerts       │ alert_history│ status_summary
│  └──────────────┴──────────────┴──────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# DB_HOST, DB_PASSWORD, JWT_SECRET, SMTP settings, etc.

# Initialize database
npm run migrate

# Start server
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# App runs on http://localhost:3000
```

### Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Default Endpoint**: http://localhost:3000 (auto-redirects to login)

---

## 📋 Features

### 1. User Authentication

```
POST /api/auth/signup      # Register new user
POST /api/auth/login       # Login (returns JWT)
GET  /api/auth/profile     # Get user profile (protected)
```

**Features:**
- Bcrypt password hashing (10 rounds)
- JWT tokens (7-day expiration)
- Secure password reset flow
- User isolation (users only see own monitors)

### 2. Monitor Management

```
POST   /api/monitors           # Create monitor
GET    /api/monitors           # Get all monitors
GET    /api/monitors/:id       # Get monitor details
PUT    /api/monitors/:id       # Update monitor
DELETE /api/monitors/:id       # Delete monitor
```

**Monitor Configuration:**
- URL (required, validated)
- HTTP method (GET/POST/PUT/DELETE/PATCH)
- Check interval (30s minimum)
- Enable/disable monitoring
- Description (optional)

### 3. Health Check System

**Background Process (runs continuously):**
- Fetches all active monitors
- Makes HTTP requests to URLs
- Measures response time (milliseconds)
- Records status code
- Detects UP/DOWN status
- Stores results in monitor_logs
- Runs independently of HTTP requests
- Doesn't block event loop (concurrent processing)

**Health Check Data:**
```json
{
  "monitor_id": "uuid",
  "status_code": 200,
  "response_time_ms": 245,
  "is_up": true,
  "error_message": null,
  "checked_at": "2024-01-18T10:30:00Z"
}
```

### 4. Alert System

**Alert Types:**
- **DOWN** - URL is down for N consecutive checks
- **SLOW** - Response time exceeds threshold
- **RECOVERED** - Service back online

**Features:**
- Email alerts via Nodemailer
- Throttling (prevent alert spam)
- Consecutive failure tracking
- Alert history logging
- Async email sending (doesn't block checks)

### 5. Analytics & Metrics

```
GET /api/monitors/:id/analytics    # Get analytics
GET /api/monitors/:id/logs         # Get health check logs
```

**Metrics Provided:**
- Uptime percentage (%)
- Downtime incidents
- Average response time (ms)
- Total checks
- Last status code
- Last UP/DOWN time

**Charts:**
- Response time trend (24 hours)
- Uptime percentage (24 hours)
- Status timeline

### 6. Dashboard

**Monitor List:**
- Card view with status badges
- Uptime percentage
- Last check time
- Quick action buttons

**Monitor Details:**
- Full statistics
- Analytics charts
- Recent logs table
- Monitor configuration

---

## 📊 Database Schema

### Users Table
```sql
id (UUID) → email (UNIQUE) → username (UNIQUE)
password_hash → first_name, last_name
is_active → created_at, updated_at
```

### Monitors Table
```sql
id (UUID) → user_id (FK) → name, url
method → interval_seconds → is_active
description → created_at, updated_at
Indexed: (user_id, is_active)
```

### Monitor Logs Table
```sql
id (UUID) → monitor_id (FK) → status_code
response_time_ms → is_up → error_message
checked_at → Indexed: (monitor_id, checked_at)
```

### Alerts Table
```sql
id (UUID) → monitor_id (FK) → user_id (FK)
alert_type (DOWN/SLOW/RECOVERED) → message
sent_at → email_sent
Indexed: (monitor_id, user_id, sent_at)
```

---

## 🔐 Security

✅ **Password Security**
- Bcrypt hashing with 10 salt rounds
- Never store plain text passwords

✅ **API Security**
- JWT authentication on protected routes
- Token expiration (7 days)
- CORS restricted to frontend origin
- Helmet security headers
- Input validation (express-validator)

✅ **Database Security**
- Parameterized queries (no SQL injection)
- Foreign key constraints
- Data isolation (user-based access control)

✅ **Error Handling**
- No sensitive data in error messages
- Centralized error middleware
- Logging for debugging

---

## 📈 Scalability

### Current Architecture (Single Server)

- ✓ Monitors: < 10,000
- ✓ Users: < 1,000
- ✓ Health checks: 1 per minute per monitor
- ✓ Response time: < 100ms

### For Scaling (Comments in code show migration path)

**Option 1: Redis + Distributed Locking**
```
Multiple servers, Redis prevents duplicate checks
Each monitor locked during execution
Efficient use of servers
```

**Option 2: Message Queues (Bull/BullMQ)**
```
Redis-backed job queue
Decouple health checks from API server
Independent worker processes
Easy horizontal scaling
```

**Option 3: Monitoring Sharding**
```
Partition monitors by ID range
Each worker processes assigned shard
Load-balanced distribution
```

---

## 🛠️ Configuration

### Backend Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uptimex
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@uptimex.com

# Alerts
ALERT_THRESHOLD_RESPONSE_TIME=5000        # milliseconds
CONSECUTIVE_FAILURES_THRESHOLD=3
ALERT_THROTTLE_MINUTES=15

# Health Checker
HEALTH_CHECK_INTERVAL_SECONDS=60
HEALTH_CHECK_TIMEOUT_MS=10000
```

### Frontend Environment Variables

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📚 API Examples

### Authentication

**Signup:**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe"
}

Response (201):
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Create Monitor

```bash
POST /api/monitors
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Google DNS",
  "url": "https://8.8.8.8",
  "method": "GET",
  "interval_seconds": 300,
  "description": "Google's public DNS"
}

Response (201):
{
  "message": "Monitor created successfully",
  "monitor": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Google DNS",
    "url": "https://8.8.8.8",
    "current_status": "UNKNOWN",
    "uptime_percentage": 0,
    "created_at": "2024-01-18T10:30:00Z"
  }
}
```

### Get Analytics

```bash
GET /api/monitors/{id}/analytics?hoursBack=24
Authorization: Bearer {token}

Response (200):
{
  "analytics": {
    "total_checks": 100,
    "successful_checks": 99,
    "uptime_percentage": 99.5,
    "average_response_time_ms": 245,
    "last_status_code": 200,
    "current_status": "UP"
  }
}
```

---

## 🧪 Testing

### Test Health Check

```bash
# Monitor a public API
POST /api/monitors
{
  "name": "JSON API",
  "url": "https://jsonplaceholder.typicode.com/todos/1",
  "interval_seconds": 300
}

# Check logs after 1+ minute
GET /api/monitors/{id}/logs

# Verify status changed to UP
GET /api/monitors/{id}
```

### Monitor a Failing Service

```bash
# Monitor an invalid URL
POST /api/monitors
{
  "name": "Test Down",
  "url": "https://this-does-not-exist-xyz.com",
  "interval_seconds": 60
}

# After 3+ checks, DOWN alert triggered
GET /api/alerts
```

---

## 📖 Documentation

- **Backend**: [backend/README.md](backend/README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)

---

## 🚨 Troubleshooting

### Health Checker Not Running

**Symptoms:** Monitors always show "UNKNOWN"

**Solutions:**
1. Check backend console for `[HEALTH_CHECKER]` logs
2. Ensure database is connected
3. Verify all monitors have `is_active = true`
4. Check network connectivity to monitored URLs

### Database Connection Failed

**Solutions:**
1. Verify PostgreSQL is running
2. Check `.env` credentials
3. Ensure database exists: `npm run migrate`
4. Check firewall rules for port 5432

### Alerts Not Sending

**Solutions:**
1. Verify SMTP settings in `.env`
2. Check email credentials (Gmail requires app passwords)
3. Monitor alert_history table for throttling
4. Check backend logs for email errors

### CORS Errors

**Solutions:**
1. Ensure backend CORS config matches frontend URL
2. Check `FRONTEND_URL` in backend `.env`
3. Restart backend server after changes

---

## 🎓 Learning Resources

### Design Patterns Used

- **MVC Pattern**: Models, Views, Controllers separation
- **Service Layer**: Business logic encapsulation
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Reusable request handlers
- **Observer Pattern**: Alert triggering system

### Code Quality

- **No God Classes**: Modular controllers/services
- **DRY Principle**: Reusable utilities
- **Error Handling**: Centralized error middleware
- **Input Validation**: Client + server validation
- **Security**: JWT, bcrypt, CORS, SQL injection prevention

---

## 🔄 Development Workflow

### Adding a New Feature

1. **Backend:**
   - Create model (database operations)
   - Create service (business logic)
   - Create controller (HTTP handlers)
   - Create routes (API endpoints)
   - Test with Postman/curl

2. **Frontend:**
   - Create service (API calls)
   - Create component (UI)
   - Add routes (navigation)
   - Test in browser

3. **Integration:**
   - Full end-to-end testing
   - Error handling
   - Loading states

---

## 📦 Project Structure

```
UptimeX/
├── backend/
│   ├── app.js                    # Main server
│   ├── package.json
│   ├── .env.example
│   ├── migrations/               # Database setup
│   ├── config/                   # Configuration
│   ├── middleware/               # Auth, errors, validation
│   ├── models/                   # Database operations
│   ├── services/                 # Business logic
│   ├── controllers/              # HTTP handlers
│   ├── routes/                   # API routes
│   ├── jobs/                     # Background jobs
│   ├── utils/                    # Helper functions
│   └── README.md
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   ├── pages/                # Page components
    │   ├── components/           # Reusable components
    │   ├── services/             # API services
    │   └── utils/                # Helper functions
    ├── package.json
    └── README.md
```

---

## 🌟 Best Practices Implemented

✅ **Async/Await** - All async operations use modern syntax  
✅ **Error Handling** - Try/catch blocks and error middleware  
✅ **Input Validation** - Server-side and client-side  
✅ **Database Indexing** - Optimized query performance  
✅ **Separation of Concerns** - Models, services, controllers  
✅ **Environment Config** - Environment-based settings  
✅ **Security** - JWT, bcrypt, CORS, SQL injection prevention  
✅ **Documentation** - Comprehensive comments and README  
✅ **Responsive Design** - Mobile-friendly UI  
✅ **Clean Code** - Readable, maintainable code  

---

## 🚀 Deployment

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure SMTP with production email
- [ ] Use HTTPS for all connections
- [ ] Set NODE_ENV=production
- [ ] Configure database backup
- [ ] Enable CORS for frontend domain
- [ ] Set up rate limiting
- [ ] Configure logging/monitoring
- [ ] Test all alert emails
- [ ] Load test the system

---

## 📝 License

MIT License - Feel free to use for personal or commercial projects

---

## 👨‍💻 Author

Built as a production-grade SaaS monitoring system.

---

## 🤝 Contributing

This is a complete implementation. For improvements:

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

## 📞 Support

For issues or questions:

1. Check the README files
2. Review API documentation
3. Check database logs
4. Consult troubleshooting section

---

**🎉 Ready to build? Start with the backend setup above!**

Last Updated: January 18, 2024
