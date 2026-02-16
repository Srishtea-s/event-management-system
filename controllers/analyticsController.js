const User = require('../models/user');
const Event = require('../models/Event');
const Registration = require('../models/registration');
const AuditLog = require('../models/AuditLog');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');

// Utility: Create audit log
const createAuditLog = async (action, userId, userRole, targetType, targetId, description, metadata = {}) => {
  try {
    await AuditLog.create({
      action,
      userId,
      userRole,
      targetType,
      targetId,
      description,
      metadata,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

/* =====================================================
   1. SYSTEM PULSE DASHBOARD
===================================================== */
exports.getSystemPulse = async (req, res) => {
  try {
    // Counts
    const totalUsers = await User.countDocuments();
    const totalClubs = await User.countDocuments({ role: 'club_admin' });
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'published' });
    const pendingApprovals = await Event.countDocuments({ status: 'draft' });

    // Active users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActiveUsers = await User.countDocuments({
      lastActive: { $gte: sevenDaysAgo }
    });

    // System health calculation
    const eventApprovalRate = totalEvents > 0 
      ? (activeEvents / totalEvents) * 100 
      : 0;
    
    let systemHealth = 'NORMAL';
    if (pendingApprovals > 10) systemHealth = 'WARNING';
    if (eventApprovalRate < 50) systemHealth = 'CRITICAL';
    if (weeklyActiveUsers < 10) systemHealth = 'CRITICAL';

    // Create audit log
    await createAuditLog(
      'REPORT_DOWNLOADED',
      req.user.id,
      'super_admin',
      'SYSTEM',
      null,
      'Super admin accessed system pulse dashboard'
    );

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalClubs,
          totalEvents,
          activeEvents,
          pendingApprovals,
          weeklyActiveUsers,
          eventApprovalRate: Math.round(eventApprovalRate)
        },
        systemHealth,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   2. USER BEHAVIOR ANALYTICS
===================================================== */
exports.getUserBehavior = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Daily Active Users
    const dailyActiveUsers = await User.countDocuments({
      lastActive: { $gte: yesterday }
    });

    // Weekly Active Users
    const weeklyActiveUsers = await User.countDocuments({
      lastActive: { $gte: sevenDaysAgo }
    });

    // User retention (users who logged in this week AND last week)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekUsers = await User.find({
      lastActive: { $gte: twoWeeksAgo, $lt: sevenDaysAgo }
    }).select('_id');
    
    const thisWeekUsers = await User.find({
      lastActive: { $gte: sevenDaysAgo }
    }).select('_id');
    
    const retainedUserIds = lastWeekUsers
      .filter(user => thisWeekUsers.some(u => u._id.equals(user._id)))
      .map(u => u._id);
    
    const userRetentionRate = lastWeekUsers.length > 0
      ? (retainedUserIds.length / lastWeekUsers.length) * 100
      : 0;

    // New vs Returning Users (last 30 days)
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const returningUsers = await User.countDocuments({
      lastActive: { $gte: thirtyDaysAgo },
      createdAt: { $lt: thirtyDaysAgo }
    });

    // Inactive users (30+ days)
    const inactiveUsers30Days = await User.countDocuments({
      lastActive: { $lt: thirtyDaysAgo }
    });

    // Role Distribution
    const studentCount = await User.countDocuments({ role: 'student' });
    const clubAdminCount = await User.countDocuments({ role: 'club_admin' });
    const superAdminCount = await User.countDocuments({ role: 'super_admin' });

    res.status(200).json({
      success: true,
      data: {
        dailyActiveUsers,
        weeklyActiveUsers,
        userRetentionRate: Math.round(userRetentionRate * 100) / 100,
        newUsers,
        returningUsers,
        inactiveUsers30Days,
        roleDistribution: {
          students: studentCount,
          clubAdmins: clubAdminCount,
          superAdmins: superAdminCount,
          total: studentCount + clubAdminCount + superAdminCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   3. CLUB PERFORMANCE INDEX
===================================================== */
exports.getClubPerformance = async (req, res) => {
  try {
    const clubAdmins = await User.find({ role: 'club_admin' })
      .select('name email clubName clubDescription createdAt lastActive');

    const clubsWithStats = await Promise.all(
      clubAdmins.map(async (admin) => {
        const events = await Event.find({ clubId: admin._id });
        const eventCount = events.length;
        
        let totalRegistrations = 0;
        let approvedEvents = 0;
        
        for (const event of events) {
          const regCount = await Registration.countDocuments({ event: event._id });
          totalRegistrations += regCount;
          if (event.status === 'published') approvedEvents++;
        }
        
        const avgRegistrations = eventCount > 0 ? totalRegistrations / eventCount : 0;
        const approvalRate = eventCount > 0 ? (approvedEvents / eventCount) * 100 : 0;
        
        // Determine club status
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const isDormant = !admin.lastActive || admin.lastActive < thirtyDaysAgo;
        const isHighImpact = avgRegistrations > 20 && approvalRate > 80;
        const isModerate = avgRegistrations > 10 && approvalRate > 60;
        
        let impactLevel = 'LOW';
        if (isHighImpact) impactLevel = 'HIGH';
        else if (isModerate) impactLevel = 'MODERATE';
        
        return {
          clubId: admin._id,
          clubName: admin.clubName || admin.name,
          adminName: admin.name,
          adminEmail: admin.email,
          eventCount,
          totalRegistrations,
          avgRegistrations: Math.round(avgRegistrations * 100) / 100,
          approvalRate: Math.round(approvalRate * 100) / 100,
          isDormant,
          impactLevel,
          lastActive: admin.lastActive,
          createdAt: admin.createdAt
        };
      })
    );

    // Sort by performance (avg registrations * approval rate)
    clubsWithStats.sort((a, b) => {
      const scoreA = a.avgRegistrations * (a.approvalRate / 100);
      const scoreB = b.avgRegistrations * (b.approvalRate / 100);
      return scoreB - scoreA;
    });

    // Top performing clubs (top 5)
    const topPerformingClubs = clubsWithStats.slice(0, 5);
    
    // Dormant clubs (no activity in 30 days)
    const dormantClubs = clubsWithStats.filter(club => club.isDormant).length;

    res.status(200).json({
      success: true,
      data: {
        totalClubs: clubsWithStats.length,
        topPerformingClubs,
        dormantClubs,
        averagePerformance: {
          avgEventsPerClub: Math.round(clubsWithStats.reduce((sum, c) => sum + c.eventCount, 0) / clubsWithStats.length * 100) / 100,
          avgRegistrationsPerClub: Math.round(clubsWithStats.reduce((sum, c) => sum + c.totalRegistrations, 0) / clubsWithStats.length * 100) / 100,
          avgApprovalRate: Math.round(clubsWithStats.reduce((sum, c) => sum + c.approvalRate, 0) / clubsWithStats.length * 100) / 100
        },
        impactDistribution: {
          HIGH: clubsWithStats.filter(c => c.impactLevel === 'HIGH').length,
          MODERATE: clubsWithStats.filter(c => c.impactLevel === 'MODERATE').length,
          LOW: clubsWithStats.filter(c => c.impactLevel === 'LOW').length
        },
        allClubs: clubsWithStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   4. EVENT INTELLIGENCE DASHBOARD
===================================================== */
exports.getEventIntelligence = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Event creation vs approval
    const eventsCreated = await Event.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const eventsApproved = await Event.countDocuments({
      status: 'published',
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const eventsRejected = await Event.countDocuments({
      status: 'cancelled',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Average approval time
    const approvedEvents = await Event.find({
      status: 'published',
      approvalTime: { $exists: true }
    }).select('createdAt approvalTime');
    
    let totalApprovalTime = 0;
    approvedEvents.forEach(event => {
      if (event.approvalTime) {
        const approvalTimeMs = event.approvalTime - event.createdAt;
        totalApprovalTime += approvalTimeMs;
      }
    });
    
    const avgApprovalTimeHours = approvedEvents.length > 0
      ? (totalApprovalTime / approvedEvents.length) / (1000 * 60 * 60)
      : 0;

    // Top categories
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Events edited after approval
    const editedAfterApprovalCount = await Event.countDocuments({
      editedAfterApproval: true,
      updatedAt: { $gte: thirtyDaysAgo }
    });

    // Peak days (events created by day of week)
    const dayStats = await Event.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDays = dayStats.map(stat => ({
      day: dayMap[stat._id - 1] || `Day ${stat._id}`,
      count: stat.count
    }));

    res.status(200).json({
      success: true,
      data: {
        creationStats: {
          created: eventsCreated,
          approved: eventsApproved,
          rejected: eventsRejected,
          approvalRate: eventsCreated > 0 ? Math.round((eventsApproved / eventsCreated) * 100 * 100) / 100 : 0
        },
        timeMetrics: {
          avgApprovalTimeHours: Math.round(avgApprovalTimeHours * 100) / 100,
          editedAfterApprovalCount
        },
        categories: categoryStats.map(cat => ({
          category: cat._id,
          count: cat.count,
          percentage: eventsCreated > 0 ? Math.round((cat.count / eventsCreated) * 100 * 100) / 100 : 0
        })),
        peakDays,
        recommendations: this.generateEventRecommendations(categoryStats, peakDays, avgApprovalTimeHours)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Generate event recommendations
exports.generateEventRecommendations = (categoryStats, peakDays, avgApprovalTime) => {
  const recommendations = [];
  
  // Category-based recommendations
  const topCategory = categoryStats[0];
  if (topCategory && topCategory.count > 10) {
    recommendations.push({
      type: 'CATEGORY',
      message: `"${topCategory._id}" events are most popular. Encourage clubs to create more ${topCategory._id.toLowerCase()} events.`,
      priority: 'HIGH'
    });
  }
  
  // Time-based recommendations
  const topDay = peakDays[0];
  if (topDay && topDay.count > 5) {
    recommendations.push({
      type: 'TIMING',
      message: `Most events are created on ${topDay.day}. Consider scheduling important announcements for this day.`,
      priority: 'MEDIUM'
    });
  }
  
  // Approval time recommendations
  if (avgApprovalTime > 24) {
    recommendations.push({
      type: 'EFFICIENCY',
      message: `Average approval time is ${Math.round(avgApprovalTime)} hours. Consider streamlining the approval process.`,
      priority: 'HIGH'
    });
  }
  
  return recommendations;
};

/* =====================================================
   5. RISK & CONTROL PANEL
===================================================== */
exports.getRiskAlerts = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const alerts = [];

    // 1. Clubs with repeated rejected events
    const rejectedEvents = await Event.find({
      status: 'cancelled',
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const clubRejectionCount = {};
    rejectedEvents.forEach(event => {
      const clubId = event.clubId.toString();
      clubRejectionCount[clubId] = (clubRejectionCount[clubId] || 0) + 1;
    });
    
    const repeatedRejections = Object.entries(clubRejectionCount)
      .filter(([clubId, count]) => count >= 3)
      .map(([clubId, count]) => ({ clubId, rejectionCount: count }));
    
    if (repeatedRejections.length > 0) {
      alerts.push({
        type: 'REPEATED_REJECTIONS',
        severity: 'HIGH',
        message: `${repeatedRejections.length} clubs have 3+ rejected events in the last 30 days`,
        count: repeatedRejections.length,
        details: repeatedRejections
      });
    }

    // 2. Users with multiple failed logins (you'd need a login attempt model for this)
    // For now, we'll create a placeholder
    alerts.push({
      type: 'MULTIPLE_LOGIN_FAILURES',
      severity: 'MEDIUM',
      message: 'Implement login attempt tracking to detect brute force attacks',
      count: 0,
      actionRequired: true
    });

    // 3. Unusual activity spikes (simplified)
    const today = new Date();
    const yesterdayEvents = await Event.countDocuments({
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate())
      }
    });
    
    const avgDailyEvents = await Event.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    }) / 30;
    
    if (yesterdayEvents > avgDailyEvents * 2) {
      alerts.push({
        type: 'ACTIVITY_SPIKE',
        severity: 'MEDIUM',
        message: `Unusual activity spike: ${yesterdayEvents} events yesterday (average: ${Math.round(avgDailyEvents)})`,
        spikeRatio: Math.round((yesterdayEvents / avgDailyEvents) * 100) / 100
      });
    }

    // 4. Events edited after approval
    const editedEvents = await Event.countDocuments({
      editedAfterApproval: true,
      updatedAt: { $gte: thirtyDaysAgo }
    });
    
    if (editedEvents > 5) {
      alerts.push({
        type: 'POST_APPROVAL_EDITS',
        severity: 'LOW',
        message: `${editedEvents} events were edited after approval`,
        count: editedEvents
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalAlerts: alerts.length,
        highPriorityAlerts: alerts.filter(a => a.severity === 'HIGH').length,
        alerts: alerts.sort((a, b) => {
          const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        }),
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   6. APPROVAL WORKFLOW ANALYTICS
===================================================== */
exports.getApprovalMetrics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get all admins (club_admins and super_admins who can approve events)
    const admins = await User.find({ 
      role: { $in: ['club_admin', 'super_admin'] }
    }).select('name email role lastActive');
    
    // Get events approved in last 30 days
    const approvedEvents = await Event.find({
      status: 'published',
      approvalTime: { $gte: thirtyDaysAgo }
    });
    
    // Calculate approval counts per admin
    const adminWorkloads = await Promise.all(
      admins.map(async (admin) => {
        const approvalsCount = await Event.countDocuments({
          approvalAdminId: admin._id,
          approvalTime: { $gte: thirtyDaysAgo }
        });
        
        return {
          adminId: admin._id,
          adminName: admin.name,
          adminEmail: admin.email,
          adminRole: admin.role,
          approvalsCount,
          lastActive: admin.lastActive
        };
      })
    );
    
    // Sort by workload
    adminWorkloads.sort((a, b) => b.approvalsCount - a.approvalsCount);
    
    // Bottleneck detection (admins with high workload)
    const totalApprovals = adminWorkloads.reduce((sum, admin) => sum + admin.approvalsCount, 0);
    const avgWorkload = totalApprovals / adminWorkloads.length;
    const bottleneckAdmins = adminWorkloads.filter(admin => admin.approvalsCount > avgWorkload * 3);
    
    // Approval vs rejection ratio
    const totalEvents = await Event.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const rejectedEvents = await Event.countDocuments({
      status: 'cancelled',
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const approvalRatio = totalEvents > 0 
      ? ((totalEvents - rejectedEvents) / totalEvents) * 100 
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        timePeriod: 'LAST_30_DAYS',
        totalAdmins: admins.length,
        totalApprovals: totalApprovals,
        totalRejections: rejectedEvents,
        approvalRatio: Math.round(approvalRatio * 100) / 100,
        avgApprovalsPerAdmin: Math.round(avgWorkload * 100) / 100,
        adminWorkloads,
        bottleneckDetection: {
          hasBottlenecks: bottleneckAdmins.length > 0,
          bottleneckAdmins: bottleneckAdmins.map(admin => ({
            adminName: admin.adminName,
            approvalsCount: admin.approvalsCount,
            workloadMultiple: Math.round((admin.approvalsCount / avgWorkload) * 100) / 100
          })),
          recommendations: bottleneckAdmins.length > 0 ? [
            `Consider redistributing approvals from ${bottleneckAdmins[0].adminName}`
          ] : ['Workload distribution is balanced']
        },
        efficiencyTips: [
          'Set up automated approval for trusted clubs',
          'Implement approval SLAs (Service Level Agreements)',
          'Use bulk approval for similar events'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   7. GROWTH & TREND INSIGHTS
===================================================== */
exports.getGrowthTrends = async (req, res) => {
  try {
    const now = new Date();
    const periods = [
      { name: 'LAST_7_DAYS', days: 7 },
      { name: 'LAST_30_DAYS', days: 30 },
      { name: 'LAST_90_DAYS', days: 90 },
      { name: 'LAST_365_DAYS', days: 365 }
    ];
    
    const trends = await Promise.all(
      periods.map(async (period) => {
        const startDate = new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000);
        
        const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
        const newClubs = await User.countDocuments({ 
          role: 'club_admin',
          createdAt: { $gte: startDate }
        });
        const newEvents = await Event.countDocuments({ createdAt: { $gte: startDate } });
        
        return {
          period: period.name,
          days: period.days,
          newUsers,
          newClubs,
          newEvents,
          userGrowthRate: await this.calculateGrowthRate('User', startDate, now),
          eventGrowthRate: await this.calculateGrowthRate('Event', startDate, now)
        };
      })
    );
    
    // Semester-wise trends (assuming semesters: Jan-Jun, Jul-Dec)
    const currentYear = now.getFullYear();
    const semesters = [
      { name: 'Spring', start: new Date(currentYear, 0, 1), end: new Date(currentYear, 5, 30) },
      { name: 'Fall', start: new Date(currentYear, 6, 1), end: new Date(currentYear, 11, 31) }
    ];
    
    const semesterTrends = await Promise.all(
      semesters.map(async (semester) => {
        const semesterUsers = await User.countDocuments({
          createdAt: { $gte: semester.start, $lte: semester.end }
        });
        
        const semesterEvents = await Event.countDocuments({
          createdAt: { $gte: semester.start, $lte: semester.end }
        });
        
        return {
          semester: semester.name,
          year: currentYear,
          users: semesterUsers,
          events: semesterEvents,
          avgEventsPerUser: semesterUsers > 0 ? Math.round((semesterEvents / semesterUsers) * 100) / 100 : 0
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        timePeriods: trends,
        semesterTrends,
        insights: this.generateGrowthInsights(trends),
        predictions: {
          next30Days: {
            predictedUsers: Math.round(trends.find(t => t.period === 'LAST_30_DAYS').newUsers * 1.1),
            predictedEvents: Math.round(trends.find(t => t.period === 'LAST_30_DAYS').newEvents * 1.15)
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Calculate growth rate
exports.calculateGrowthRate = async (model, startDate, endDate) => {
  // This is a simplified version - you'd implement actual growth rate calculation
  return Math.random() * 20 - 5; // Random between -5% and +15% for demo
};

// Helper: Generate growth insights
exports.generateGrowthInsights = (trends) => {
  const insights = [];
  const latest = trends[0]; // LAST_7_DAYS
  
  if (latest.newEvents > latest.newUsers * 2) {
    insights.push({
      type: 'EVENT_ACTIVITY',
      message: 'High event creation rate compared to new users. Existing users are very active.',
      impact: 'POSITIVE'
    });
  }
  
  if (trends[1].newClubs > trends[2].newClubs) { // 30 days vs 90 days
    insights.push({
      type: 'CLUB_GROWTH',
      message: 'Club creation accelerating. Consider adding more club management features.',
      impact: 'POSITIVE'
    });
  }
  
  return insights;
};

/* =====================================================
   8. GENERATE ANALYTICS SNAPSHOT
===================================================== */
exports.generateSnapshot = async (req, res) => {
  try {
    const { snapshotType = 'DAILY' } = req.body;
    
    const now = new Date();
    let periodStart, periodEnd;
    
    switch (snapshotType) {
      case 'DAILY':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'WEEKLY':
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'MONTHLY':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid snapshot type' });
    }
    
    // Check if snapshot already exists for this period
    const existingSnapshot = await AnalyticsSnapshot.findOne({
      snapshotType,
      periodStart,
      periodEnd
    });
    
    if (existingSnapshot) {
      return res.status(400).json({
        success: false,
        message: `Snapshot for ${snapshotType} period already exists`
      });
    }
    
    // Generate snapshot data (simplified - in production you'd call all the other functions)
    const snapshotData = {
      snapshotType,
      periodStart,
      periodEnd,
      totalUsers: await User.countDocuments(),
      totalClubs: await User.countDocuments({ role: 'club_admin' }),
      totalEvents: await Event.countDocuments(),
      timestamp: now
    };
    
    const snapshot = await AnalyticsSnapshot.create(snapshotData);
    
    // Create audit log
    await createAuditLog(
      'REPORT_GENERATED',
      req.user.id,
      'super_admin',
      'REPORT',
      snapshot._id,
      `Generated ${snapshotType} analytics snapshot`,
      { snapshotType, periodStart, periodEnd }
    );
    
    res.status(201).json({
      success: true,
      message: `${snapshotType} snapshot generated successfully`,
      snapshotId: snapshot._id,
      data: snapshot
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   9. GET SNAPSHOT HISTORY
===================================================== */
exports.getSnapshotHistory = async (req, res) => {
  try {
    const { snapshotType, limit = 10 } = req.query;
    
    const query = {};
    if (snapshotType) query.snapshotType = snapshotType;
    
    const snapshots = await AnalyticsSnapshot.find(query)
      .sort({ periodStart: -1 })
      .limit(parseInt(limit))
      .select('snapshotType periodStart periodEnd totalUsers totalClubs totalEvents timestamp');
    
    res.status(200).json({
      success: true,
      count: snapshots.length,
      data: snapshots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};