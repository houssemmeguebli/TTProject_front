import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AuthService from "./AuthService"; // Update the path if needed

export const AuthContext = createContext();
const authService = new AuthService();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await authService.getCurrentUser(); // Replace with your actual fetch logic
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
