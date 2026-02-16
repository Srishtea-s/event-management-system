const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: __dirname + '/.env' });
// Import database connection from config/db.js
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const eventRoutes = require("./routes/events");

// ✅ IMPORT ALL SUPER ADMIN ROUTES
const userRoutes = require("./routes/superAdmin/userRoutes");
const analyticsRoutes = require("./routes/superAdmin/analytics");
const clubRoutes = require("./routes/superAdmin/clubRoutes");
const bulkRoutes = require("./routes/superAdmin/bulkRoutes");

// Connect to MongoDB using config/db.js
console.log("🔗 Attempting MongoDB connection via config/db.js...");
console.log("URI:", process.env.MONGO_URI ? "Set ✓" : "Missing ✗");

// Call the connectDB function
connectDB();

// ============ MOUNT ALL ROUTES ============

// Public & User Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/events", eventRoutes);

// ✅ MOUNT ALL SUPER ADMIN ROUTES SEPARATELY
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/clubs", clubRoutes);
app.use("/api/admin/bulk", bulkRoutes);

console.log('✅ Super Admin Routes Loaded:');
console.log('   - /api/admin/users');
console.log('   - /api/admin/analytics');
console.log('   - /api/admin/clubs');
console.log('   - /api/admin/bulk');

// ========== ERROR HANDLING MIDDLEWARE ==========
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ========== CONTINUE WITH REST OF YOUR SERVER.JS ==========

// Home route with enhanced UI (updated to include Analytics endpoints)
app.get("/", (req, res) => {
  const mongoose = require("mongoose");
  const dbStatus = mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected";
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>College Event Platform</title>
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          margin: 0; 
          padding: 30px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 20px; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { 
          color: #4F46E5; 
          border-bottom: 3px solid #4F46E5; 
          padding-bottom: 15px; 
          margin-top: 0;
          font-size: 2.5em;
        }
        .status-badge { 
          display: inline-block; 
          padding: 10px 20px; 
          border-radius: 50px; 
          font-weight: bold; 
          margin: 20px 0; 
          font-size: 1.1em;
        }
        .connected { background: #10B981; color: white; }
        .disconnected { background: #EF4444; color: white; }
        .endpoint-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 15px; 
          margin: 30px 0;
        }
        .endpoint-card { 
          background: #F9FAFB; 
          padding: 20px; 
          border-radius: 10px; 
          border-left: 5px solid #4F46E5;
          transition: transform 0.2s;
        }
        .endpoint-card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .method { 
          display: inline-block; 
          padding: 5px 12px; 
          border-radius: 5px; 
          font-weight: bold; 
          font-size: 0.9em; 
          margin-right: 10px;
        }
        .get { background: #10B981; color: white; }
        .post { background: #3B82F6; color: white; }
        .put { background: #F59E0B; color: white; }
        .delete { background: #EF4444; color: white; }
        .path { font-family: monospace; color: #1F2937; }
        .desc { color: #6B7280; margin-top: 8px; font-size: 0.9em; }
        .day3-badge { 
          background: #8B5CF6; 
          color: white; 
          padding: 3px 8px; 
          border-radius: 4px; 
          font-size: 0.7em; 
          margin-left: 5px;
        }
        .analytics-badge {
          background: #EC4899;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7em;
          margin-left: 5px;
        }
        .superadmin-badge {
          background: #8B5CF6;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7em;
          margin-left: 5px;
        }
        .quick-links { 
          background: #EFF6FF; 
          padding: 25px; 
          border-radius: 15px; 
          margin-top: 30px;
        }
        .api-link { 
          display: inline-block; 
          background: #4F46E5; 
          color: white; 
          padding: 10px 20px; 
          border-radius: 8px; 
          text-decoration: none; 
          margin: 10px 5px; 
          font-weight: bold;
        }
        .api-link:hover { background: #4338CA; }
        .section-title {
          color: #7C3AED;
          margin-top: 30px;
          padding-bottom: 10px;
          border-bottom: 2px solid #EDE9FE;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 College Event Platform API <span style="color: #8B5CF6; font-size: 1rem;">(Super Admin Complete)</span></h1>
        
        <div class="status-badge ${mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'}">
          Database Status: ${dbStatus}
        </div>
        
        <p>Welcome to the College Event Platform API. This backend service powers event management, user authentication, profile management, and <strong>Complete Super Admin System</strong>.</p>
        
        <h2 class="section-title">👑 SUPER ADMIN MANAGEMENT <span class="superadmin-badge">COMPLETE</span></h2>
        <div class="endpoint-grid">
          <!-- USER MANAGEMENT -->
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/users</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">View all users with filters & pagination</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method put">PUT</span>
            <span class="path">/api/admin/users/:id/role</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">Change user role (promote/demote)</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method put">PUT</span>
            <span class="path">/api/admin/users/:id/status</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">Activate/Deactivate/Suspend users</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/users/export/:format</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">Export users as CSV/JSON</div>
          </div>
          
          <!-- CLUB MANAGEMENT -->
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/clubs</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">View all clubs with performance scores</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/admin/clubs</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">Create new club with president</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/admin/clubs/:id/assign-admin</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">Assign club admin to club</div>
          </div>
          
          <!-- BULK OPERATIONS -->
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/admin/bulk/users</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">Bulk import users from CSV/JSON</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method put">PUT</span>
            <span class="path">/api/admin/bulk/users/status</span>
            <span class="superadmin-badge">Super Admin</span>
            <div class="desc">Bulk update user status</div>
          </div>
        </div>
        
        <h2 class="section-title">📊 SUPER ADMIN ANALYTICS <span class="analytics-badge">ANALYTICS</span></h2>
        <div class="endpoint-grid">
          <!-- SYSTEM ANALYTICS -->
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/analytics/pulse</span>
            <span class="analytics-badge">Super Admin</span>
            <div class="desc">System health dashboard with real-time metrics</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/analytics/user-behavior</span>
            <span class="analytics-badge">Super Admin</span>
            <div class="desc">User behavior intelligence and patterns</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/analytics/club-performance</span>
            <span class="analytics-badge">Super Admin</span>
            <div class="desc">Club performance index with rankings</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/analytics/event-intelligence</span>
            <span class="analytics-badge">Super Admin</span>
            <div class="desc">Event analytics and intelligence dashboard</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/analytics/risk-alerts</span>
            <span class="analytics-badge">Super Admin</span>
            <div class="desc">Risk & control panel with security alerts</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/analytics/approval-metrics</span>
            <span class="analytics-badge">Super Admin</span>
            <div class="desc">Approval workflow analytics and bottlenecks</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/analytics/growth-trends</span>
            <span class="analytics-badge">Super Admin</span>
            <div class="desc">Growth trends and semester-wise analytics</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/admin/analytics/export/system-report</span>
            <span class="analytics-badge">Super Admin</span>
            <div class="desc">Export comprehensive system reports (CSV)</div>
          </div>
        </div>
        
        <h2 class="section-title">📡 CORE API ENDPOINTS</h2>
        <div class="endpoint-grid">
          <!-- AUTH -->
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/auth/register</span>
            <div class="desc">Register a new user account</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/auth/login</span>
            <div class="desc">Login user and get JWT token</div>
          </div>
          
          <!-- USERS (PROFILE) -->
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/users/profile</span>
            <div class="desc">Get user profile (JWT required)</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method put">PUT</span>
            <span class="path">/api/users/profile</span>
            <span class="day3-badge">Day 3</span>
            <div class="desc">Update user profile</div>
          </div>
          
          <!-- EVENTS -->
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/events</span>
            <div class="desc">Get all events</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/events</span>
            <div class="desc">Create new event (Admin only)</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/events/:id</span>
            <div class="desc">Get single event details</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method put">PUT</span>
            <span class="path">/api/events/:id</span>
            <span class="day3-badge">Day 3</span>
            <div class="desc">Update event (Admin only)</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method delete">DELETE</span>
            <span class="path">/api/events/:id</span>
            <span class="day3-badge">Day 3</span>
            <div class="desc">Delete event (Admin only)</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/events/:id/register</span>
            <div class="desc">Register for an event</div>
          </div>
          
          <!-- DAY 3 ADMIN ENDPOINTS -->
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/events/admin/dashboard</span>
            <span class="day3-badge">Day 3</span>
            <div class="desc">Admin dashboard with statistics</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/events/:id/registrations</span>
            <span class="day3-badge">Day 3</span>
            <div class="desc">Get event registrations (Admin)</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/events/:id/registrations/export</span>
            <span class="day3-badge">Day 3</span>
            <div class="desc">Export registrations as CSV</div>
          </div>
        </div>
        
        <div class="quick-links">
          <h3>🔗 Quick Test Links (Super Admin Required)</h3>
          <a href="/api/admin/users" class="api-link" style="background: #8B5CF6;">All Users</a>
          <a href="/api/admin/clubs" class="api-link" style="background: #8B5CF6;">All Clubs</a>
          <a href="/api/admin/analytics/pulse" class="api-link">System Pulse</a>
          <a href="/api/admin/analytics/dashboard" class="api-link">Analytics Dashboard</a>
          <a href="/db-status" class="api-link">Database Status</a>
          <a href="/api/health" class="api-link">Health Check</a>
          <a href="/api/admin/users/export/csv" class="api-link" style="background: #EC4899;">Export Users CSV</a>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #F3F4F6; border-radius: 10px; font-size: 0.9em; color: #6B7280;">
          <strong>Server Info:</strong> Running on port ${process.env.PORT || 5000} | 
          <strong>Database:</strong> ${mongoose.connection.name || "collegeapp"} | 
          <strong>Environment:</strong> ${process.env.NODE_ENV || "development"} |
          <strong>Super Admin Features:</strong> COMPLETE ✅
        </div>
      </div>
    </body>
    </html>
  `);
});

// Database status endpoint
app.get("/db-status", (req, res) => {
  const mongoose = require("mongoose");
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  res.json({
    success: mongoose.connection.readyState === 1,
    status: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    models: mongoose.modelNames(),
    connected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
    superAdminRoutes: [
      '/api/admin/users',
      '/api/admin/clubs', 
      '/api/admin/bulk',
      '/api/admin/analytics'
    ]
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    superAdmin: {
      enabled: true,
      userManagement: true,
      clubManagement: true,
      bulkOperations: true,
      analytics: true
    },
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  });
});

// Analytics health check (public endpoint to verify setup)
app.get("/api/analytics/health", (req, res) => {
  const mongoose = require("mongoose");
  
  // Check if analytics models exist
  const hasAuditLog = mongoose.modelNames().includes('AuditLog');
  const hasAnalyticsSnapshot = mongoose.modelNames().includes('AnalyticsSnapshot');
  
  res.json({
    success: true,
    analytics: {
      status: "operational",
      models: {
        AuditLog: hasAuditLog ? "loaded" : "missing",
        AnalyticsSnapshot: hasAnalyticsSnapshot ? "loaded" : "missing"
      },
      endpoints: [
        "/api/admin/analytics/pulse",
        "/api/admin/analytics/user-behavior",
        "/api/admin/analytics/club-performance",
        "/api/admin/analytics/event-intelligence",
        "/api/admin/analytics/risk-alerts",
        "/api/admin/analytics/approval-metrics",
        "/api/admin/analytics/growth-trends",
        "/api/admin/analytics/export/system-report"
      ],
      requiredRole: "super_admin",
      authentication: "JWT Bearer Token Required"
    }
  });
});

// 404 handler (updated with super admin endpoints)
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `Route ${req.method} ${req.url} does not exist`,
    availableRoutes: [
      "GET    /",
      "GET    /db-status",
      "GET    /api/health",
      "GET    /api/analytics/health",
      
      // Auth
      "POST   /api/auth/register",
      "POST   /api/auth/login",
      "POST   /api/auth/verify-otp",
      
      // Users
      "GET    /api/users/profile",
      "PUT    /api/users/profile",
      
      // Events
      "GET    /api/events",
      "GET    /api/events/:id",
      "POST   /api/events",
      "PUT    /api/events/:id",
      "DELETE /api/events/:id",
      "POST   /api/events/:id/register",
      "GET    /api/events/admin/dashboard",
      "GET    /api/events/:id/registrations",
      "GET    /api/events/:id/registrations/export",
      
      // Super Admin User Management
      "GET    /api/admin/users",
      "GET    /api/admin/users/:id",
      "PUT    /api/admin/users/:id/role",
      "PUT    /api/admin/users/:id/status",
      "DELETE /api/admin/users/:id",
      "GET    /api/admin/users/export/:format",
      
      // Super Admin Club Management
      "GET    /api/admin/clubs",
      "GET    /api/admin/clubs/:id",
      "POST   /api/admin/clubs",
      "PUT    /api/admin/clubs/:id",
      "DELETE /api/admin/clubs/:id",
      "PUT    /api/admin/clubs/:id/performance",
      "POST   /api/admin/clubs/:id/assign-admin",
      
      // Super Admin Analytics
      "GET    /api/admin/analytics/pulse",
      "GET    /api/admin/analytics/user-behavior",
      "GET    /api/admin/analytics/club-performance",
      "GET    /api/admin/analytics/event-intelligence",
      "GET    /api/admin/analytics/risk-alerts",
      "GET    /api/admin/analytics/approval-metrics",
      "GET    /api/admin/analytics/growth-trends",
      "GET    /api/admin/analytics/export/system-report",
      
      // Super Admin Bulk Operations
      "POST   /api/admin/bulk/users",
      "DELETE /api/admin/bulk/users",
      "PUT    /api/admin/bulk/users/status",
      "PUT    /api/admin/bulk/users/role",
      "GET    /api/admin/bulk/users/export"
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log("🚀 SERVER STARTED SUCCESSFULLY (Super Admin COMPLETE)");
  console.log(`${'='.repeat(70)}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 DB Config: config/db.js`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`${'='.repeat(70)}`);
  
  console.log("\n📡 CORE API ENDPOINTS:");
  console.log(`${'-'.repeat(70)}`);
  console.log("🔐 AUTHENTICATION:");
  console.log(`   POST   /api/auth/register    - Register user`);
  console.log(`   POST   /api/auth/login       - Login user`);
  console.log(`   POST   /api/auth/verify-otp  - Verify OTP`);
  
  console.log("\n👤 PROFILE (USERS):");
  console.log(`   GET    /api/users/profile    - Get profile`);
  console.log(`   PUT    /api/users/profile    - Update profile \x1b[35m[Day 3]\x1b[0m`);
  
  console.log("\n🎪 EVENTS:");
  console.log(`   GET    /api/events           - Get all events`);
  console.log(`   GET    /api/events/:id       - Get single event`);
  console.log(`   POST   /api/events           - Create event (Admin)`);
  console.log(`   PUT    /api/events/:id       - Update event (Admin) \x1b[35m[Day 3]\x1b[0m`);
  console.log(`   DELETE /api/events/:id       - Delete event (Admin) \x1b[35m[Day 3]\x1b[0m`);
  console.log(`   POST   /api/events/:id/register - Register for event`);
  console.log(`   GET    /api/events/admin/dashboard - Admin stats \x1b[35m[Day 3]\x1b[0m`);
  console.log(`   GET    /api/events/:id/registrations - View registrations \x1b[35m[Day 3]\x1b[0m`);
  console.log(`   GET    /api/events/:id/registrations/export - Export CSV \x1b[35m[Day 3]\x1b[0m`);
  
  console.log("\n👑 SUPER ADMIN MANAGEMENT \x1b[95m[COMPLETE]\x1b[0m:");
  console.log(`   GET    /api/admin/users      - View all users (filters/pagination)`);
  console.log(`   GET    /api/admin/users/:id  - Get single user`);
  console.log(`   PUT    /api/admin/users/:id/role - Change user roles`);
  console.log(`   PUT    /api/admin/users/:id/status - Activate/Deactivate users`);
  console.log(`   DELETE /api/admin/users/:id  - Delete user`);
  console.log(`   GET    /api/admin/users/export/:format - Export users`);
  console.log(`   GET    /api/admin/clubs      - View all clubs`);
  console.log(`   GET    /api/admin/clubs/:id  - Get single club`);
  console.log(`   POST   /api/admin/clubs      - Create clubs`);
  console.log(`   PUT    /api/admin/clubs/:id  - Update club`);
  console.log(`   DELETE /api/admin/clubs/:id  - Delete club`);
  console.log(`   PUT    /api/admin/clubs/:id/performance - Update club performance`);
  console.log(`   POST   /api/admin/clubs/:id/assign-admin - Assign club admins`);
  
  console.log("\n📊 SUPER ADMIN ANALYTICS:");
  console.log(`   GET    /api/admin/analytics/pulse          - System health`);
  console.log(`   GET    /api/admin/analytics/user-behavior  - User intelligence`);
  console.log(`   GET    /api/admin/analytics/club-performance - Club rankings`);
  console.log(`   GET    /api/admin/analytics/event-intelligence - Event analytics`);
  console.log(`   GET    /api/admin/analytics/risk-alerts    - Risk monitoring`);
  console.log(`   GET    /api/admin/analytics/approval-metrics - Workflow analytics`);
  console.log(`   GET    /api/admin/analytics/growth-trends  - Growth insights`);
  console.log(`   GET    /api/admin/analytics/export/system-report - Export reports`);
  
  console.log("\n🔄 SUPER ADMIN BULK OPERATIONS:");
  console.log(`   POST   /api/admin/bulk/users - Bulk import users`);
  console.log(`   DELETE /api/admin/bulk/users - Bulk delete users`);
  console.log(`   PUT    /api/admin/bulk/users/status - Bulk update status`);
  console.log(`   PUT    /api/admin/bulk/users/role - Bulk update role`);
  console.log(`   GET    /api/admin/bulk/users/export - Bulk export`);
  
  console.log("\n🩺 SYSTEM HEALTH:");
  console.log(`   GET    /                     - Home page`);
  console.log(`   GET    /db-status            - Database status`);
  console.log(`   GET    /api/health           - Health check`);
  console.log(`   GET    /api/analytics/health - Analytics health`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log("\n🔐 ACCESS REQUIREMENTS:");
  console.log(`   • Regular users: Role 'student'`);
  console.log(`   • Event management: Role 'club_admin'`);
  console.log(`   • Super Admin Management: Role 'super_admin' \x1b[95m[REQUIRED]\x1b[0m`);
  console.log(`   • All protected routes: JWT Bearer Token in Authorization header`);
  console.log(`${'='.repeat(70)}\n`);
});