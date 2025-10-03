import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectTo = null,
  fallback = null,
  roles = null // Array of required roles
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-gray-600 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // If a custom fallback is provided, use it
    if (fallback) {
      return fallback;
    }

    // If a redirect is specified, redirect there
    if (redirectTo) {
      window.location.href = redirectTo;
      return null;
    }

    // Default: Show sign-in prompt
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to access this page
            </p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access if roles are specified
  if (requireAuth && roles && user) {
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Access Denied
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You don't have permission to access this page
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Required role(s): {roles.join(', ')}
              </p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out"
              >
                Go Back
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // If we're checking for non-authenticated users (e.g., login page when already logged in)
  if (!requireAuth && isAuthenticated) {
    if (redirectTo) {
      window.location.href = redirectTo;
      return null;
    }
    
    // Default: redirect to dashboard or home
    window.location.href = '/dashboard';
    return null;
  }

  // All checks passed, render the protected content
  return children;
};

// Higher-order component for easy wrapping
export const withProtection = (Component, options = {}) => {
  return (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based protection components
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute roles={['admin']} {...props}>
    {children}
  </ProtectedRoute>
);

export const UserRoute = ({ children, ...props }) => (
  <ProtectedRoute roles={['user', 'admin']} {...props}>
    {children}
  </ProtectedRoute>
);

// For pages that should only be accessible when NOT authenticated (like login, register)
export const GuestRoute = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={false} redirectTo="/dashboard" {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;