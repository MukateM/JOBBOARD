import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, updates);
      
      if (response.data.success) {
        // Refresh user data
        await fetchUser();
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Update failed' };
    }
  };

  const isTokenExpired = () => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user && !isTokenExpired(),
    isAdmin: user?.role === 'admin',
    isEmployer: user?.role === 'employer',
    isApplicant: user?.role === 'applicant'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};