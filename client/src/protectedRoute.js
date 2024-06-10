import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // If the user is not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the children (main content)
  return children;
};

export default ProtectedRoute;
