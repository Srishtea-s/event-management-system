import API from './api';

// ============ AUTHENTICATION HELPERS ============

// Check if user is logged in
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// Check if user is super admin
export const isSuperAdmin = () => {
  return getUserRole() === 'super_admin';
};

// Check if user is club admin
export const isClubAdmin = () => {
  return getUserRole() === 'club_admin';
};

// Check if user is student
export const isStudent = () => {
  return getUserRole() === 'student';
};

// Store user data after login
export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Clear auth data on logout
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Logout user and redirect to login
export const logout = () => {
  clearAuthData();
  window.location.href = '/login';
};

// Get token
export const getToken = () => {
  return localStorage.getItem('token');
};

// ============ API AUTH FUNCTIONS ============

export const loginUser = async (email, password) => {
  try {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const verifyOTP = async (otpData) => {
  try {
    const response = await API.post('/auth/verify-otp', otpData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'OTP verification failed' };
  }
};

export const getProfile = async () => {
  try {
    const response = await API.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get profile' };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await API.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// ============ ROLE-BASED ACCESS CONTROL ============

// Check if user has permission to access route
export const hasPermission = (requiredRole) => {
  const userRole = getUserRole();
  
  if (!userRole) return false;
  
  // Role hierarchy: super_admin > club_admin > student
  const roleHierarchy = {
    'student': 1,
    'club_admin': 2,
    'super_admin': 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Redirect to appropriate dashboard based on role
export const redirectToDashboard = () => {
  if (isSuperAdmin()) {
    return '/super-admin';
  } else if (isClubAdmin()) {
    return '/club-admin';
  } else {
    return '/dashboard';
  }
};

// ============ AUTH GUARD FUNCTIONS ============

// Check if user can access super admin routes
export const canAccessSuperAdmin = () => {
  return isAuthenticated() && isSuperAdmin();
};

// Check if user can access club admin routes
export const canAccessClubAdmin = () => {
  return isAuthenticated() && (isClubAdmin() || isSuperAdmin());
};

// Check if user can access student routes
export const canAccessStudent = () => {
  return isAuthenticated();
};

// ============ SESSION MANAGEMENT ============

// Check if session is still valid
export const isSessionValid = () => {
  if (!isAuthenticated()) return false;
  
  // You can add token expiration check here if you store expiry time
  const user = getCurrentUser();
  if (user && user.exp) {
    return Date.now() < user.exp * 1000; // Convert to milliseconds
  }
  
  return true; // Assume valid if no expiration
};

// Refresh session (if needed)
export const refreshSession = async () => {
  if (!isAuthenticated()) return false;
  
  try {
    const profile = await getProfile();
    // Update user data if needed
    if (profile.user) {
      const currentUser = getCurrentUser();
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...profile.user
      }));
    }
    return true;
  } catch (error) {
    // If refresh fails, log out
    logout();
    return false;
  }
};