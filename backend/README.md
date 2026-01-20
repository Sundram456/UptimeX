# UptimeX Backend Documentation

## Overview

ServicePulse is a production-ready, distributed URL monitoring and alert system built with Node.js and PostgreSQL. The backend provides:

- **User Authentication** with JWT
- **Monitor Management** (CRUD operations)
- **Background Health Checks** (independent worker process)
- **Alert & Notification System** with throttling
- **Analytics & Metrics** engine
- **Email Alerts** using Nodemailer

---

## Architecture

### Folder Structure

```
backend/
├── app.js                    # Main application entry point
├── package.json              # Dependencies
├── .env.example              # Environment variables template
│
├── config/                   # Configuration
│   ├── database.js          # PostgreSQL connection pool
│   └── email.js             # Email transporter setup
│
├── migrations/              # Database setup
│   ├── schema.sql           # PostgreSQL schema
│   └── setup.js             # Database initialization script
│
├── middleware/              # Express middleware
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Error handling & async wrapper
│   └── validation.js        # Input validation
│
├── models/                  # Database operations
│   ├── userModel.js         # User CRUD
│   ├── monitorModel.js      # Monitor CRUD
│   ├── monitorLogModel.js   # Health check logs
│   └── alertModel.js        # Alerts & alert history
│
├── services/                # Business logic
│   ├── authService.js       # Auth logic
│   ├── monitorService.js    # Monitor operations
│   └── alertService.js      # Alert triggering & throttling
│
├── controllers/             # HTTP request handlers
│   ├── authController.js    # Auth endpoints
│   ├── monitorController.js # Monitor endpoints
│   └── alertController.js   # Alert endpoints
│
├── routes/                  # Express route definitions
│   ├── authRoutes.js        # /api/auth/*
│   └── monitorRoutes.js     # /api/monitors/*
│
├── jobs/                    # Background jobs
│   └── healthChecker.js     # Background health checker
│
└── utils/                   # Utility functions
    ├── jwt.js               # JWT token generation/verification
    ├── password.js          # Password hashing (bcrypt)
    └── urlValidator.js      # URL validation & normalization
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=servicepulse
DB_USER=postgres
DB_PASSWORD=your_password

PORT=5000
JWT_SECRET=your_secret_key_here

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@servicepulse.com
```

### 3. Initialize Database

```bash
npm run migrate
```

This creates the database and all tables with proper indexing.

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start on `http://localhost:5000`

---

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email
- `username` (VARCHAR) - Unique username
- `password_hash` (VARCHAR) - Bcrypt hash
- `first_name`, `last_name` (VARCHAR)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### Monitors Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - FK to users
- `name` (VARCHAR) - Monitor name
- `url` (VARCHAR) - URL to monitor
- `method` (VARCHAR) - HTTP method (GET, POST, etc.)
- `interval_seconds` (INT) - Check interval
- `is_active` (BOOLEAN) - Enable/disable
- `created_at`, `updated_at` (TIMESTAMP)

### Monitor Logs Table
- `id` (UUID) - Primary key
- `monitor_id` (UUID) - FK to monitors
- `status_code` (INT) - HTTP status code
- `response_time_ms` (INT) - Response time
- `is_up` (BOOLEAN) - Success/failure
- `error_message` (TEXT) - Error details
- `checked_at` (TIMESTAMP) - Check timestamp

### Alerts Table
- `id` (UUID) - Primary key
- `monitor_id` (UUID) - FK to monitors
- `user_id` (UUID) - FK to users
- `alert_type` (VARCHAR) - DOWN, SLOW, RECOVERED
- `message` (TEXT) - Alert message
- `sent_at` (TIMESTAMP) - Alert created time
- `email_sent` (BOOLEAN) - Email delivery status

### Alert History Table
- Used for throttling (prevents alert spam)
- `monitor_id` + `alert_type` - Composite unique key
- `consecutive_count` - Failure count
- `last_sent_at` - Last alert timestamp

---

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register new user.

**Request:**
```json
{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "Doe"
}
```

**Response:**
```json
{
    "message": "User created successfully",
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "username": "johndoe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/login`
Login user.

**Request:**
```json
{
    "email": "user@example.com",
    "password": "securepass123"
}
```

**Response:**
```json
{
    "message": "Login successful",
    "user": {
        "id": "uuid",
        "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/api/auth/profile`
Get current user profile (protected).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

---

### Monitor Endpoints (All Protected)

#### POST `/api/monitors`
Create new monitor.

**Request:**
```json
{
    "name": "My API",
    "url": "https://api.example.com",
    "method": "GET",
    "interval_seconds": 300,
    "description": "Production API health"
}
```

**Response:**
```json
{
    "message": "Monitor created successfully",
    "monitor": {
        "id": "uuid",
        "user_id": "uuid",
        "name": "My API",
        "url": "https://api.example.com",
        "method": "GET",
        "interval_seconds": 300,
        "is_active": true,
        "current_status": "UNKNOWN",
        "uptime_percentage": 0,
        "created_at": "2024-01-18T10:30:00Z"
    }
}
```

#### GET `/api/monitors`
Get all monitors for user.

**Response:**
```json
{
    "monitors": [
        {
            "id": "uuid",
            "name": "My API",
            "url": "https://api.example.com",
            "current_status": "UP",
            "uptime_percentage": 99.5,
            "last_checked_at": "2024-01-18T10:35:00Z",
            "stats": {
                "total_checks": 100,
                "successful_checks": 99,
                "avg_response_time_ms": 245
            }
        }
    ]
}
```

#### GET `/api/monitors/:id`
Get monitor details.

**Response:**
```json
{
    "monitor": {
        "id": "uuid",
        "name": "My API",
        "url": "https://api.example.com",
        "stats": {
            "total_checks": 100,
            "successful_checks": 99,
            "uptime_percentage": 99.5,
            "avg_response_time_ms": 245,
            "last_status_code": 200
        },
        "recent_logs": [
            {
                "id": "uuid",
                "status_code": 200,
                "response_time_ms": 234,
                "is_up": true,
                "checked_at": "2024-01-18T10:35:00Z"
            }
        ]
    }
}
```

#### PUT `/api/monitors/:id`
Update monitor.

**Request:**
```json
{
    "name": "Updated API Name",
    "interval_seconds": 600,
    "is_active": true
}
```

#### DELETE `/api/monitors/:id`
Delete monitor.

#### GET `/api/monitors/:id/logs`
Get monitor logs.

**Query Parameters:**
- `limit` (default: 100)
- `hoursBack` (default: 24)

#### GET `/api/monitors/:id/analytics`
Get detailed analytics.

**Query Parameters:**
- `hoursBack` (default: 24)

**Response:**
```json
{
    "analytics": {
        "total_checks": 100,
        "successful_checks": 99,
        "uptime_percentage": 99.5,
        "average_response_time_ms": 245,
        "last_status_code": 200,
        "last_up_at": "2024-01-18T10:35:00Z",
        "current_status": "UP"
    }
}
```

---

### Alert Endpoints (Protected)

#### GET `/api/alerts`
Get all alerts for user.

**Query Parameters:**
- `limit` (default: 50)

**Response:**
```json
{
    "alerts": [
        {
            "id": "uuid",
            "monitor_id": "uuid",
            "monitor_name": "My API",
            "alert_type": "DOWN",
            "message": "Your monitored URL has been down for 3 consecutive checks",
            "sent_at": "2024-01-18T10:35:00Z",
            "email_sent": true
        }
    ]
}
```

---

## Background Health Checker

The health checker is a **critical component** that:

1. **Runs independently** from HTTP requests (using node-cron)
2. **Continuously monitors** all active monitors
3. **Measures** status codes and response times
4. **Creates logs** for every check
5. **Triggers alerts** with throttling
6. **Doesn't block** the Node.js event loop (runs concurrently)

### How It Works

```javascript
// Health check cycle runs every HEALTH_CHECK_INTERVAL_SECONDS
// Default: 60 seconds

1. Fetch all active monitors from DB
2. For each monitor:
   a. Make HTTP request with timeout
   b. Measure response time
   c. Record result in monitor_logs
   d. Track consecutive failures
3. If failures >= threshold:
   a. Create DOWN alert
   b. Send email (async)
   c. Throttle to prevent spam
4. If recovered:
   a. Create RECOVERED alert
   b. Reset failure counter
5. If response time > threshold:
   a. Create SLOW alert (throttled)
```

### Scalability Notes

**Current (Single Server):**
- Uses node-cron for scheduling
- All monitors on one server
- Suitable for < 10,000 monitors

**For Distributed Systems:**

The architecture is designed to support scaling:

```
Option 1: Redis + Distributed Locking
- Use redis-lock for preventing duplicate checks
- Multiple servers, one processes each monitor

Option 2: Message Queue (BullMQ)
- Redis-backed job queue
- Enqueue health checks as jobs
- Worker processes consume jobs
- Horizontal scaling of workers

Option 3: Monitoring Sharding
- Split monitors by ID range
- Each worker handles shard
- Database stores worker assignment

Implementation example in comments in healthChecker.js
```

---

## Error Handling

All errors are caught and returned in consistent format:

```json
{
    "error": "Error message",
    "statusCode": 400,
    "details": [
        {
            "field": "email",
            "message": "Invalid email format"
        }
    ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict (duplicate)
- `500` - Server error

---

## Configuration

### Environment Variables

```
# Database
DB_HOST              PostgreSQL host
DB_PORT              PostgreSQL port
DB_NAME              Database name
DB_USER              Database user
DB_PASSWORD          Database password

# Server
PORT                 Server port (default: 5000)
NODE_ENV             Environment (development/production)

# JWT
JWT_SECRET           Secret key for signing tokens

# Email
SMTP_HOST            SMTP server
SMTP_PORT            SMTP port
SMTP_USER            Email username
SMTP_PASSWORD        Email password
SMTP_FROM            From email address

# Alerts
ALERT_THRESHOLD_RESPONSE_TIME    Response time threshold (ms)
CONSECUTIVE_FAILURES_THRESHOLD   Failures before DOWN alert
ALERT_THROTTLE_MINUTES           Throttle duration between alerts

# Health Checker
HEALTH_CHECK_INTERVAL_SECONDS    Check interval
HEALTH_CHECK_TIMEOUT_MS          Request timeout
```

---

## Security Best Practices

1. **Passwords** - Hashed with bcrypt (10 salt rounds)
2. **Tokens** - JWT with 7-day expiration
3. **Validation** - All inputs validated with express-validator
4. **CORS** - Restricted to frontend origin
5. **Helmet** - Security headers middleware
6. **SQL** - Parameterized queries (no SQL injection)
7. **Rate Limiting** - TODO: Consider express-rate-limit for production
8. **HTTPS** - Required in production

---

## Testing Examples

### Create Monitor
```bash
curl -X POST http://localhost:5000/api/monitors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google DNS",
    "url": "https://8.8.8.8",
    "interval_seconds": 300
  }'
```

### Get Monitors
```bash
curl http://localhost:5000/api/monitors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Analytics
```bash
curl "http://localhost:5000/api/monitors/:id/analytics?hoursBack=24" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Health Checker Not Running
- Check logs: Look for `[HEALTH_CHECKER]` messages
- Ensure database is connected
- Check `.env` variables

### Alerts Not Sending
- Verify SMTP configuration in `.env`
- Check email credentials
- See alert_history table for throttling

### Monitor Always Showing UNKNOWN
- Ensure monitor is active (`is_active = true`)
- Check if health checker is running
- Verify monitor URL is reachable
- Check network/firewall settings

---

## Performance Optimization

### Indexed Columns
- `users(email)` - Fast lookups
- `monitors(user_id, is_active)` - Filter active monitors
- `monitor_logs(monitor_id, checked_at)` - Recent logs
- `alerts(monitor_id, user_id, sent_at)` - Alert queries

### Query Optimization
- Aggregate in SQL (not application)
- Use LEFT JOINs for optional data
- Limit results with pagination

### Connection Pooling
- PostgreSQL pool: 20 max connections
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

---

## Design Decisions

1. **node-cron over Bull/BullMQ** - Simpler for MVP, documented upgrade path
2. **Concurrent checks (5 at a time)** - Prevents overwhelming database
3. **Consecutive failure threshold** - Avoids alert spam on transient failures
4. **Alert throttling** - Only send one alert per monitor/type per 15 minutes
5. **Separate models/services/controllers** - Clean separation of concerns
6. **Left joins for status summary** - Don't require pre-computed data

---

## Future Enhancements

1. **Rate Limiting** - Prevent abuse
2. **WebSocket Alerts** - Real-time notifications
3. **Custom Alert Rules** - User-defined conditions
4. **Webhooks** - Send alerts to custom endpoints
5. **Slack/Discord Integration** - In addition to email
6. **Multi-region Checks** - Monitor from different locations
7. **API Monitoring** - Full request/response inspection
8. **Synthetic Monitoring** - Browser automation checks
9. **Dashboard APIs** - Public uptime page

---

## Support & Issues

For bugs or questions, check:
1. Server logs (console output)
2. Database logs
3. `.env` configuration
4. Network connectivity
5. Database permissions

---

**Built with ❤️ for production-grade monitoring**
