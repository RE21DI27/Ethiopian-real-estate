import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');
  
  console.log('AdminRoute - Token:', !!token);
  console.log('AdminRoute - User Role:', userRole);
  
  if (!token) {
    console.log('No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'admin') {
    console.log('Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('Admin access granted');
  return children;
};

export default AdminRoute;
