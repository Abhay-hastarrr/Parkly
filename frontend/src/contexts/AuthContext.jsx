import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOADING: 'LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
  INIT_COMPLETE: 'INIT_COMPLETE',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.INIT_COMPLETE:
      return {
        ...state,
        isLoading: false,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const user = JSON.parse(userData);
          
          // Verify token is still valid by making a profile request
          try {
            const profileData = await authAPI.getProfile();
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: profileData.user,
            });
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING });
      
      const response = await authAPI.login(credentials);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING });
      
      const response = await authAPI.register(userData);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Update user profile
  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: userData,
    });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!state.user?.name) return '';
    return state.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    updateUser,
    
    // Utilities
    hasRole,
    isAdmin,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;