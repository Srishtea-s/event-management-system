const User = require('../models/user');
const Event = require('../models/Event');
const Registration = require('../models/registration');
const AuditLog = require('../models/AuditLog');

/* =====================================================
   EXPORT SYSTEM REPORT (CSV)
===================================================== */
exports.exportSystemReport = async (req, res) => {
  try {
    const { reportType = 'COMPREHENSIVE' } = req.query;
    
    let csvContent = '';
    let filename = '';
    
    switch (reportType) {
      case 'USERS':
        const users = await User.find()
          .select('name email collegeId department role year createdAt lastActive')
          .sort({ createdAt: -1 });
        
        csvContent = 'Name,Email,College ID,Department,Role,Year,Created At,Last Active\n';
        users.forEach(user => {
          csvContent += `"${user.name}","${user.email}","${user.collegeId}","${user.department}","${user.role}","${user.year}","${user.createdAt.toISOString()}","${user.lastActive ? user.lastActive.toISOString() : 'Never'}"\n`;
        });
        
        filename = `users-export-${Date.now()}.csv`;
        break;
        
      case 'EVENTS':
        const events = await Event.find()
          .populate('clubId', 'name email')
          .select('title description date time venue capacity status category createdAt')
          .sort({ createdAt: -1 });
        
        csvContent = 'Title,Description,Date,Time,Venue,Capacity,Status,Category,Created At,Club Name,Club Email\n';
        events.forEach(event => {
          csvContent += `"${event.title}","${event.description}","${event.date.toISOString()}","${event.time}","${event.venue}",${event.capacity},"${event.status}","${event.category}","${event.createdAt.toISOString()}","${event.clubId?.name || 'N/A'}","${event.clubId?.email || 'N/A'}"\n`;
        });
        
        filename = `events-export-${Date.now()}.csv`;
        break;
        
      case 'AUDIT_LOGS':
        const auditLogs = await AuditLog.find()
          .populate('userId', 'name email role')
          .sort({ timestamp: -1 })
          .limit(1000);
        
        csvContent = 'Timestamp,Action,User Name,User Email,User Role,Target Type,Target ID,Description,IP Address\n';
        auditLogs.forEach(log => {
          csvContent += `"${log.timestamp.toISOString()}","${log.action}","${log.userId?.name || 'N/A'}","${log.userId?.email || 'N/A'}","${log.userRole}","${log.targetType || 'N/A'}","${log.targetId || 'N/A'}","${log.description}","${log.ipAddress || 'N/A'}"\n`;
        });
        
        filename = `audit-logs-${Date.now()}.csv`;
        break;
        
      case 'COMPREHENSIVE':
      default:
        // Generate comprehensive report
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalClubs = await User.countDocuments({ role: 'club_admin' });
        const activeEvents = await Event.countDocuments({ status: 'published' });
        
        csvContent = `College Event Platform - System Report\n`;
        csvContent += `Generated: ${new Date().toISOString()}\n\n`;
        csvContent += `SYSTEM OVERVIEW\n`;
        csvContent += `Total Users,${totalUsers}\n`;
        csvContent += `Total Clubs,${totalClubs}\n`;
        csvContent += `Total Events,${totalEvents}\n`;
        csvContent += `Active Events,${activeEvents}\n\n`;
        
        // Role distribution
        csvContent += `ROLE DISTRIBUTION\n`;
        const studentCount = await User.countDocuments({ role: 'student' });
        const clubAdminCount = await User.countDocuments({ role: 'club_admin' });
        const superAdminCount = await User.countDocuments({ role: 'super_admin' });
        csvContent += `Students,${studentCount}\n`;
        csvContent += `Club Admins,${clubAdminCount}\n`;
        csvContent += `Super Admins,${superAdminCount}\n\n`;
        
        // Event categories
        csvContent += `EVENT CATEGORIES\n`;
        const categories = await Event.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);
        
        categories.forEach(cat => {
          csvContent += `${cat._id},${cat.count}\n`;
        });
        
        filename = `comprehensive-system-report-${Date.now()}.csv`;
        break;
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Create audit log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'EXPORT_GENERATED',
      userId: req.user.id,
      userRole: 'super_admin',
      targetType: 'REPORT',
      description: `Exported ${reportType} report`,
      metadata: { reportType, filename },
      timestamp: new Date()
    });
    
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   EXPORT CUSTOM REPORT
===================================================== */
exports.exportCustomReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      includeUsers = true, 
      includeEvents = true,
      includeLogs = false 
    } = req.body;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    let csvContent = `Custom Report: ${start.toISOString()} to ${end.toISOString()}\n`;
    csvContent += `Generated: ${new Date().toISOString()}\n\n`;
    
    if (includeUsers) {
      const newUsers = await User.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      csvContent += `New Users in Period,${newUsers}\n`;
    }
    
    if (includeEvents) {
      const newEvents = await Event.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      const approvedEvents = await Event.countDocuments({
        status: 'published',
        createdAt: { $gte: start, $lte: end }
      });
      csvContent += `New Events Created,${newEvents}\n`;
      csvContent += `Events Approved,${approvedEvents}\n`;
      csvContent += `Approval Rate,${newEvents > 0 ? Math.round((approvedEvents / newEvents) * 10000) / 100 : 0}%\n`;
    }
    
    if (includeLogs) {
      const auditLogs = await AuditLog.countDocuments({
        timestamp: { $gte: start, $lte: end }
      });
      csvContent += `Audit Logs Created,${auditLogs}\n`;
    }
    
    // Set headers for file download
    const filename = `custom-report-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET REPORT TEMPLATES
===================================================== */
exports.getReportTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'daily-summary',
        name: 'Daily Summary Report',
        description: 'Overview of daily activities and metrics',
        parameters: [],
        type: 'AUTOMATED'
      },
      {
        id: 'user-growth',
        name: 'User Growth Analysis',
        description: 'Analysis of user acquisition and retention',
        parameters: [
          { name: 'startDate', type: 'date', required: true },
          { name: 'endDate', type: 'date', required: true }
        ],
        type: 'CUSTOM'
      },
      {
        id: 'event-performance',
        name: 'Event Performance Report',
        description: 'Detailed analysis of event success metrics',
        parameters: [
          { name: 'category', type: 'string', required: false },
          { name: 'clubId', type: 'string', required: false }
        ],
        type: 'CUSTOM'
      },
      {
        id: 'system-audit',
        name: 'System Audit Report',
        description: 'Security and system access logs',
        parameters: [
          { name: 'startDate', type: 'date', required: true },
          { name: 'actionType', type: 'string', required: false }
        ],
        type: 'CUSTOM'
      }
    ];
    
    res.status(200).json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
