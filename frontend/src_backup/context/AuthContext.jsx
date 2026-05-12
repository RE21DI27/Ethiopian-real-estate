import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:8000';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        console.log('User loaded:', JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      console.log('Registering:', userData.username);
      
      const response = await fetch(`${API_URL}/api/buyer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          full_name: userData.full_name,
          phone: userData.phone,
          password: userData.password,
          email: userData.email || `${userData.username}@example.com`
        })
      });
      
      const data = await response.json();
      console.log('Register response:', data);
      
      if (data.success === true) {
        // Auto login after registration
        const loginResult = await login(userData.username, userData.password);
        return loginResult;
      } else {
        return { success: false, error: data.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Cannot connect to server' };
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Logging in:', username);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_role', data.user.role);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.detail || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Cannot connect to server' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
