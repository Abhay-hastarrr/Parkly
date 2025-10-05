import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('admin_token');
        const storedAdmin = localStorage.getItem('admin_info');

        if (storedToken && storedAdmin) {
          setToken(storedToken);
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and admin info
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_info', JSON.stringify(data.admin));

      setToken(data.token);
      setAdmin(data.admin);

      return { success: true, message: data.message };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (token) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
      setToken(null);
      setAdmin(null);
    }
  };

  // Check if admin is authenticated
  const isAuthenticated = () => {
    return !!(token && admin);
  };

  // Get authorization header for API calls
  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Verify token validity (optional - can be called periodically)
  const verifyToken = async () => {
    if (!token) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token invalid');
      }

      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Auto logout if token is invalid
      logout();
      return false;
    }
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    getAuthHeader,
    verifyToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};