const User = require('../models/user');

const superAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only super_admin can access analytics
    if (user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in super admin middleware'
    });
  }
};

module.exports = superAdmin;