// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = () => {
    return user && (user.role === 'club_admin' || user.role === 'admin');
  };

  // Add these two functions
  const isAuthenticated = () => {
    return !!user;  // Returns true if user exists
  };

  const isSuperAdmin = () => {
    // Check if user exists and has super_admin role
    return user && user.role === 'super_admin';
  };

  const updateUser = (updatedData) => {
    const currentData = JSON.parse(localStorage.getItem('user') || '{}');
    const newData = { ...currentData, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newData));
    setUser(newData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    updateUser,
    setUser,
    // Add these to the value object
    isAuthenticated,
    isSuperAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};