import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate users using JWT
export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Extract token from "Bearer TOKEN_HERE"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token format.' 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user in database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token invalid. User not found.' 
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Account deactivated. Please contact support.' 
        });
      }

      // Add user info to request
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      next();
      
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired. Please login again.' 
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token. Please login again.' 
        });
      } else {
        throw tokenError;
      }
    }

  } catch (error) {
    console.error('User auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

// Middleware to authenticate admin using JWT
export const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Extract token from "Bearer TOKEN_HERE"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token format.' 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if this is an admin token
      if (decoded.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
      }

      // Add admin info to request
      req.admin = {
        email: decoded.email,
        role: decoded.role
      };

      next();
      
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired. Please login again.' 
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token. Please login again.' 
        });
      } else {
        throw tokenError;
      }
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

// Optional middleware that doesn't require authentication but adds user info if token is present
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = {
          email: decoded.email,
          role: decoded.role
        };
      } catch (tokenError) {
        // Token is invalid but we continue without authentication
        req.admin = null;
      }
    }

    next();
    
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};