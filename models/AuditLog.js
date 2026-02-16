const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
      'EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED', 'EVENT_APPROVED', 'EVENT_REJECTED',
      'LOGIN', 'LOGOUT', 'ROLE_CHANGED',
      'EXPORT_GENERATED', 'REPORT_DOWNLOADED',
      'SYSTEM_ACTION', 'DATA_CLEANUP'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['student', 'club_admin', 'super_admin'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['USER', 'EVENT', 'REGISTRATION', 'SYSTEM', 'REPORT']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);