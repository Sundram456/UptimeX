# UptimeX Frontend Documentation

## Overview

ServicePulse Frontend is a modern React application for managing and monitoring URLs. It provides:

- **User Authentication** (login/signup)
- **Monitor Dashboard** (view all monitors)
- **Monitor Details** (analytics and logs)
- **Monitor Management** (CRUD operations)
- **Real-time Charts** (response time and uptime)
- **Responsive Design** (mobile-friendly)

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment (Optional)

Create `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

Server will start on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` folder.

---

## Folder Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
│
├── src/
│   ├── App.js              # Main app component
│   ├── App.css             # Global styles
│   ├── index.js            # React entry point
│   ├── index.css           # Global styles
│   │
│   ├── pages/              # Page components
│   │   ├── AuthPage.js     # Login/Signup
│   │   ├── AuthPage.css
│   │   ├── DashboardPage.js   # Monitor list
│   │   ├── DashboardPage.css
│   │   ├── MonitorDetailPage.js   # Monitor details
│   │   └── MonitorDetailPage.css
│   │
│   ├── components/         # Reusable components
│   │   ├── Header.js       # Top navigation
│   │   ├── Header.css
│   │   ├── ProtectedRoute.js   # Route protection
│   │   ├── ProtectedRoute.css
│   │   ├── MonitorForm.js  # Add/edit monitor
│   │   ├── MonitorForm.css
│   │   ├── MonitorCard.js  # Monitor card
│   │   ├── MonitorCard.css
│   │   ├── MonitorChart.js # Charts
│   │   └── MonitorChart.css
│   │
│   ├── services/           # API integration
│   │   └── api.js          # Axios instance & endpoints
│   │
│   └── utils/              # Utility functions
│       ├── auth.js         # Auth helpers
│       ├── format.js       # Data formatting
│       └── validation.js   # Input validation
│
└── package.json            # Dependencies
```

---

## Features & Components

### 1. Authentication (`AuthPage.js`)

**Login Component:**
- Email and password validation
- JWT token storage
- Error handling
- Link to signup

**Signup Component:**
- Email, username, password validation
- Optional first/last name
- Auto-login after signup
- Link to login

### 2. Dashboard (`DashboardPage.js`)

**Features:**
- Display all user monitors
- Add new monitor form
- Edit monitor
- Delete monitor
- Status indicators
- Uptime percentages

**Interaction:**
- Click monitor card to view details
- Edit button to update monitor
- Delete button with confirmation

### 3. Monitor Details (`MonitorDetailPage.js`)

**Tabs:**

1. **Analytics**
   - Response time chart (Line chart)
   - Uptime percentage chart (Bar chart)
   - Last 24 hours data

2. **Recent Logs**
   - Table of recent health checks
   - Status code
   - Response time
   - UP/DOWN status
   - Timestamp

3. **Info**
   - Monitor ID
   - URL
   - HTTP Method
   - Check interval
   - Created date
   - Description

**Statistics:**
- Current status
- Uptime percentage
- Average response time
- Total checks

### 4. Monitor Form (`MonitorForm.js`)

**Fields:**
- Monitor name (required)
- URL (required, validated)
- HTTP method (GET/POST/PUT/DELETE/PATCH)
- Check interval (min 30 seconds)
- Description (optional)

**Validation:**
- Client-side validation
- Real-time error display
- Server-side validation

### 5. Monitor Card (`MonitorCard.js`)

**Displays:**
- Monitor name
- Monitor URL
- Status badge (UP/DOWN/SLOW)
- Uptime percentage
- Last check time (relative)
- Edit button
- Delete button

---

## Services & APIs

### API Service (`services/api.js`)

Centralized axios instance with:
- Base URL configuration
- JWT token injection
- Auto-logout on 401

**Endpoints:**

```javascript
// Auth
authAPI.signup(data)
authAPI.login(email, password)
authAPI.getProfile()

// Monitors
monitorAPI.create(data)
monitorAPI.getAll()
monitorAPI.getById(id)
monitorAPI.update(id, data)
monitorAPI.delete(id)
monitorAPI.getLogs(id, params)
monitorAPI.getAnalytics(id, params)

// Alerts
alertAPI.getAll(params)
```

---

## Utilities

### Auth Utils (`utils/auth.js`)

```javascript
setToken(token)              // Store JWT
getToken()                   // Retrieve JWT
removeToken()                // Delete JWT
isAuthenticated()            // Check if logged in
setUser(user)                // Store user info
getUser()                    // Retrieve user
clearAuth()                  // Logout
```

### Format Utils (`utils/format.js`)

```javascript
formatDate(date)             // Format timestamp
formatTime(ms)               // Format milliseconds
formatPercentage(value)      // Format percentage
formatUptime(percentage)     // Get uptime level
getStatusColor(status)       // Get status color
getStatusBgColor(status)     // Get status bg color
```

### Validation Utils (`utils/validation.js`)

```javascript
validateEmail(email)         // Validate email format
validatePassword(password)   // Check password length
validateUrl(url)             // Validate URL
validateInterval(interval)   // Check interval >= 30
getValidationError(field, value)  // Get error message
```

---

## Styling

### Color Scheme

```css
Primary Blue: #667eea
Secondary Purple: #764ba2
Success Green: #28a745
Danger Red: #dc3545
Warning Yellow: #ffc107
Light Gray: #f5f5f5
Dark Gray: #333
Medium Gray: #666
Light Border: #ddd
```

### Responsive Design

- **Desktop**: Full grid layout
- **Tablet**: Adjusted grid columns
- **Mobile**: Single column, adjusted spacing

Breakpoints:
- `@media (max-width: 768px)` - Mobile/Tablet
- `@media (max-width: 480px)` - Small phones

---

## Authentication Flow

1. **Signup/Login**
   - User enters credentials
   - Frontend validates input
   - API call to backend
   - JWT token received
   - Store token in localStorage
   - Store user info
   - Redirect to dashboard

2. **Protected Routes**
   - `ProtectedRoute` component checks token
   - If no token, redirect to login
   - If token exists, render page
   - Header shows user info

3. **API Requests**
   - API service intercepts all requests
   - Adds JWT from localStorage to Authorization header
   - If 401 response, clear token and redirect to login

4. **Logout**
   - Clear token from localStorage
   - Clear user info
   - Redirect to login page

---

## Charts Implementation

Using `chart.js` and `react-chartjs-2`:

**Line Chart (Response Time)**
- X-axis: Time (hourly)
- Y-axis: Response time (ms)
- Shows trend over 24 hours

**Bar Chart (Uptime)**
- X-axis: Time (hourly)
- Y-axis: Uptime percentage
- Color-coded by uptime level:
  - Green (>=95%)
  - Yellow (90-95%)
  - Red (<90%)

Data is grouped from individual health check logs.

---

## Error Handling

### Validation Errors
- Displayed inline on form
- Real-time feedback as user types
- Clear error messages

### API Errors
- Try/catch blocks
- User-friendly error messages
- Logged to console for debugging

### Network Errors
- Auto-retry for specific endpoints
- Clear error alerts to user
- Fallback UI states

---

## Performance Optimizations

1. **Code Splitting**
   - React Router lazy loading
   - Dynamic imports for pages

2. **Lazy Loading**
   - Images loaded on scroll
   - Charts rendered on view

3. **Caching**
   - Monitor data cached
   - User profile cached
   - Automatic refresh every 30s

4. **Minification**
   - CSS minified in production
   - JavaScript minified in production

---

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Development

### Environment Variables

```
REACT_APP_API_URL     Backend API URL (default: http://localhost:5000/api)
```

### Debug Mode

Enable Redux DevTools in development:
```javascript
// See browser console for detailed logs
```

### Testing

```bash
npm test          # Run tests
npm run build     # Production build
```

---

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=build
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup for Production

Update `.env`:
```
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Common Issues

### CORS Errors
- Ensure backend has correct CORS configuration
- Check `FRONTEND_URL` in backend `.env`

### Token Expiration
- Token set to 7 days
- Automatic logout on expiration
- User directed to login page

### 404 on Page Refresh
- React Router handles client-side routing
- Ensure production server redirects to index.html

---

## Future Enhancements

1. **Real-time Notifications**
   - WebSocket integration
   - Instant alert notifications

2. **Dark Mode**
   - Theme toggle
   - CSS variables for theming

3. **Internationalization**
   - Multi-language support
   - i18n library integration

4. **Advanced Analytics**
   - Custom date ranges
   - Export to CSV
   - Comparison charts

5. **Integrations**
   - Slack integration
   - Discord webhooks
   - Webhook management UI

---

## Support & Documentation

For detailed backend API documentation, see [backend/README.md](../backend/README.md)

---

**Built with ❤️ using React and modern web technologies**
