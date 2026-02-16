const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    console.log('✅ auth middleware HIT');

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    // Set the FULL decoded user from JWT (includes role, email, etc.)
    req.user = decoded;
    console.log('✅ User authenticated:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      collegeId: req.user.collegeId
    });

    return next();
  } catch (error) {
    console.error('❌ AUTH ERROR:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = { protect };