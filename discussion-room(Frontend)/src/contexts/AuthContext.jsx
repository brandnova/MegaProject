import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, logout, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = async (username, password) => {
    const data = await login(username, password);
    setUser(data.user);
    localStorage.setItem('token', data.access);
    return data;
  };

  const registerUser = async (username, email, password, confirmPassword) => {
    const data = await register(username, email, password, confirmPassword);
    setUser(data.user);
    localStorage.setItem('token', data.access);
    return data;
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('token');
    logout();
  };

  const value = {
    user,
    loginUser,
    registerUser,
    logoutUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};