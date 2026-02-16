const mongoose = require('mongoose');

const AnalyticsSnapshotSchema = new mongoose.Schema({
  snapshotType: {
    type: String,
    required: true,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  
  // System Pulse Metrics
  totalUsers: Number,
  totalClubs: Number,
  totalEvents: Number,
  activeEvents: Number,
  pendingApprovals: Number,
  systemHealth: {
    type: String,
    enum: ['NORMAL', 'WARNING', 'CRITICAL']
  },
  
  // User Behavior
  dailyActiveUsers: Number,
  weeklyActiveUsers: Number,
  userRetentionRate: Number,
  newUsers: Number,
  returningUsers: Number,
  inactiveUsers30Days: Number,
  
  // Role Distribution
  studentCount: Number,
  clubAdminCount: Number,
  superAdminCount: Number,
  
  // Club Performance
  topPerformingClubs: [{
    clubId: mongoose.Schema.Types.ObjectId,
    clubName: String,
    eventCount: Number,
    avgRegistrations: Number,
    approvalRate: Number
  }],
  dormantClubs: Number,
  
  // Event Intelligence
  eventsCreated: Number,
  eventsApproved: Number,
  avgApprovalTimeHours: Number,
  topCategories: [{
    category: String,
    count: Number
  }],
  rejectionReasons: [{
    reason: String,
    count: Number
  }],
  
  // Risk Alerts
  riskAlertsCount: Number,
  repeatedRejectionsCount: Number,
  unusualActivityCount: Number,
  
  // Approval Metrics
  approvalMetrics: {
    avgApprovalTime: Number,
    approvalRatio: Number,
    adminWorkloads: [{
      adminId: mongoose.Schema.Types.ObjectId,
      adminName: String,
      approvalsCount: Number
    }]
  },
  
  // Growth Trends
  userGrowth: Number,
  clubGrowth: Number,
  eventGrowth: Number,
  
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for time-based queries
AnalyticsSnapshotSchema.index({ periodStart: -1 });
AnalyticsSnapshotSchema.index({ snapshotType: 1, periodStart: -1 });

module.exports = mongoose.model('AnalyticsSnapshot', AnalyticsSnapshotSchema);