import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isSuperAdmin } from '../services/auth';

const SuperAdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (!isSuperAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default SuperAdminRoute;