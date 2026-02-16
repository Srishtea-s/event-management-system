const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const mongoose = require('mongoose');

// TEMPORARY: Comment out for testing
// const { protect } = require('../../middleware/auth');
// const superAdminMiddleware = require('../../middleware/superAdminMiddleware');

// TEMPORARY: Comment out for testing
// router.use(protect);
// router.use(superAdminMiddleware);

// ============ 1. FIXED: GET ALL USERS - MUST BE FIRST! ============
router.get('/', async (req, res) => {
  try {
    console.log('✅ GET /api/admin/users - Fetching REAL users from MongoDB');
    
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      role = '',
      status = ''
    } = req.query;
    
    console.log('Query params:', { page, limit, search, role, status });
    
    // Build filter for REAL database query
    const filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Role filter
    if (role && ['student', 'club_admin', 'super_admin'].includes(role)) {
      filter.role = role;
    }
    
    // Status filter
    if (status && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      filter.userStatus = status;
    }
    
    console.log('Database filter:', filter);
    
    const skip = (page - 1) * limit;
    
    // REAL DATABASE QUERY - NO MOCK DATA
    const users = await User.find(filter)
      .select('-password -otp -otpExpires')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    console.log(`✅ SUCCESS: Found ${users.length} REAL users in database`);

    // Return REAL data from MongoDB
    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users,
      message: `Fetched ${users.length} real users from MongoDB`,
      source: 'MongoDB'
    });
    
  } catch (error) {
    console.error('❌ Error fetching REAL users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users from database',
      error: error.message
    });
  }
});

// ============ 2. DEBUG ROUTE ============
router.get('/debug', async (req, res) => {
  try {
    console.log('🔍 DEBUG route called');
    
    // Test database connection
    const totalUsers = await User.countDocuments();
    const sampleUsers = await User.find({})
      .select('name email role collegeId')
      .limit(3);
    
    res.json({
      success: true,
      message: 'Database connection working',
      totalUsers: totalUsers,
      sampleData: sampleUsers,
      database: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============ 3. GET SINGLE USER ============
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🟢 GET user by ID:', id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    
    const user = await User.findById(id)
      .select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============ 4. CHANGE USER ROLE ============
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }
    
    if (!['student', 'club_admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }

    const oldUser = await User.findById(id);
    if (!oldUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent removing last super_admin
    if (oldUser.role === 'super_admin' && role !== 'super_admin') {
      const superAdminCount = await User.countDocuments({ 
        role: 'super_admin', 
        userStatus: 'ACTIVE' 
      });
      if (superAdminCount <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot remove the only active super admin' 
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: `Role changed from ${oldUser.role} to ${role}`,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============ 5. CHANGE USER STATUS ============
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const oldUser = await User.findById(id);
    if (!oldUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { userStatus: status },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: `Status changed from ${oldUser.userStatus} to ${status}`,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============ 6. DELETE USER ============
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Soft delete
    await User.findByIdAndUpdate(
      id,
      { userStatus: 'SUSPENDED', isActive: false }
    );
    
    res.json({ 
      success: true, 
      message: `User ${user.email} has been suspended` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============ 7. EXPORT USERS ============
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const users = await User.find({}).select('-password -otp -otpExpires');
    
    if (format === 'csv') {
      let csv = 'Name,Email,College ID,Role,Department,Year,Status\n';
      users.forEach(user => {
        csv += `"${user.name}","${user.email}","${user.collegeId}","${user.role}","${user.department}",${user.year},"${user.userStatus}"\n`;
      });
      
      res.header('Content-Type', 'text/csv');
      res.attachment('users_export.csv');
      return res.send(csv);
    } else if (format === 'json') {
      res.json({ 
        success: true, 
        data: users 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid format' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
