const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Club = require('../../models/Club');
const { protect } = require('../../middleware/auth');
const superAdminMiddleware = require('../../middleware/superAdminMiddleware');
const AuditLog = require('../../models/AuditLog');

router.use(protect);
router.use(superAdminMiddleware);

// ============ 1. BULK IMPORT USERS ============
router.post('/bulk/users', async (req, res) => {
  try {
    const { users } = req.body; // Array of user objects
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No users provided' 
      });
    }

    if (users.length > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum 100 users per import' 
      });
    }

    const results = [];
    const errors = [];

    for (const userData of users) {
      try {
        // Generate random password
        const tempPassword = Math.random().toString(36).slice(-8);
        userData.password = tempPassword;
        
        const user = await User.create(userData);
        
        results.push({
          email: user.email,
          name: user.name,
          collegeId: user.collegeId,
          tempPassword: tempPassword,
          success: true
        });
      } catch (error) {
        errors.push({
          email: userData.email,
          error: error.message
        });
      }
    }

    // Log bulk import
    await AuditLog.create({
      action: 'SYSTEM_ACTION',
      userId: req.user.id,
      userRole: req.user.role,
      targetType: 'SYSTEM',
      description: `Bulk user import: ${results.length} successful, ${errors.length} failed`,
      metadata: { 
        total: users.length,
        successful: results.length,
        failed: errors.length 
      }
    });

    res.json({
      success: true,
      message: `Imported ${results.length} users, ${errors.length} failed`,
      imported: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 2. BULK DELETE USERS ============
router.delete('/bulk/users', async (req, res) => {
  try {
    const { userIds } = req.body; // Array of user IDs
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No user IDs provided' 
      });
    }

    // Don't allow deleting yourself
    if (userIds.includes(req.user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account in bulk operation' 
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { userStatus: 'SUSPENDED', isActive: false }
    );

    // Log bulk delete
    await AuditLog.create({
      action: 'SYSTEM_ACTION',
      userId: req.user.id,
      userRole: req.user.role,
      targetType: 'SYSTEM',
      description: `Bulk user suspension: ${result.modifiedCount} users suspended`,
      metadata: { 
        count: result.modifiedCount,
        userIds: userIds.length 
      }
    });

    res.json({ 
      success: true, 
      message: `Suspended ${result.modifiedCount} users`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 3. BULK UPDATE USER STATUS ============
router.put('/bulk/users/status', async (req, res) => {
  try {
    const { userIds, status } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No user IDs provided' 
      });
    }

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { userStatus: status, isActive: status === 'ACTIVE' }
    );

    // Log bulk status change
    await AuditLog.create({
      action: 'SYSTEM_ACTION',
      userId: req.user.id,
      userRole: req.user.role,
      targetType: 'SYSTEM',
      description: `Bulk user status update: ${result.modifiedCount} users set to ${status}`,
      metadata: { 
        count: result.modifiedCount,
        status: status 
      }
    });

    res.json({ 
      success: true, 
      message: `Updated ${result.modifiedCount} users to ${status}`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 4. BULK UPDATE USER ROLE ============
router.put('/bulk/users/role', async (req, res) => {
  try {
    const { userIds, role } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No user IDs provided' 
      });
    }

    if (!['student', 'club_admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { role }
    );

    // Log bulk role change
    await AuditLog.create({
      action: 'SYSTEM_ACTION',
      userId: req.user.id,
      userRole: req.user.role,
      targetType: 'SYSTEM',
      description: `Bulk user role change: ${result.modifiedCount} users set to ${role}`,
      metadata: { 
        count: result.modifiedCount,
        role: role 
      }
    });

    res.json({ 
      success: true, 
      message: `Updated ${result.modifiedCount} users to ${role} role`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ 5. BULK EXPORT USERS ============
router.get('/bulk/users/export', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    const users = await User.find({})
      .select('name email collegeId role department year userStatus createdAt lastLogin')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      let csv = 'Name,Email,College ID,Role,Department,Year,Status,Created At,Last Login\n';
      users.forEach(user => {
        csv += `"${user.name}","${user.email}","${user.collegeId}","${user.role}","${user.department}",${user.year},"${user.userStatus}","${user.createdAt.toISOString()}","${user.lastLogin ? user.lastLogin.toISOString() : 'Never'}"\n`;
      });
      
      res.header('Content-Type', 'text/csv');
      res.attachment('users_bulk_export.csv');
      return res.send(csv);
    } else {
      res.json({ 
        success: true, 
        count: users.length,
        data: users 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;