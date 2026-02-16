console.log("🔥🔥 admin middleware LOADED 🔥🔥");

const User = require('../models/user');

const admin = async (req, res, next) => {
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

    if (user.role !== 'club_admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Club admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in admin middleware'
    });
  }
};

module.exports = admin;
