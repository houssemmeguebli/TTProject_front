import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import PropTypes from 'prop-types';
import { AuthContext } from "./AuthContext.js";

const ProtectedRoute = ({ roles, children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // If the user is not authenticated, redirect to the sign-in page
    return <Navigate to="/authentication/sign-in" />;
  }

  if (roles && !roles.includes(user.role)) {
    // If the user is authenticated but does not have the required role, redirect to the unauthorized page
    return <Navigate to="/unauthorized" />;
  }

  // If the user is authenticated and has the required role, render the child components
  return children ? children : <Outlet />;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node,
};

export default ProtectedRoute;
