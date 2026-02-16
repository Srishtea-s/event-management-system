// backend/middleware/superAdminMiddleware.js
const superAdminMiddleware = (req, res, next) => {
  try {
    console.log('🔐 Super Admin Middleware: Checking user role');
    
    // Check if user exists from auth middleware
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    // Debug: Log full user object
    console.log('📋 Full user object from JWT:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      collegeId: req.user.collegeId
    });
    
    // Check role from JWT token
    if (!req.user.role) {
      console.error('❌ No role found in JWT token');
      return res.status(403).json({ 
        success: false, 
        message: "User role not found in token. Please login again.",
        tokenPayload: req.user
      });
    }
    
    if (req.user.role !== 'super_admin') {
      console.log(`❌ Access denied. User role: ${req.user.role}, Required: super_admin`);
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Super admin privileges required.",
        yourRole: req.user.role,
        requiredRole: 'super_admin',
        userEmail: req.user.email
      });
    }
    
    console.log(`✅ Super admin access granted for: ${req.user.email}`);
    next();
  } catch (error) {
    console.error("❌ Super admin middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error in super admin middleware",
      error: error.message 
    });
  }
};

module.exports = superAdminMiddleware;