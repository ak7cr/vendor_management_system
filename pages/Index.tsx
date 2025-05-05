
import React from 'react';
import { Navigate } from 'react-router-dom';

// This page just redirects to the dashboard
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
