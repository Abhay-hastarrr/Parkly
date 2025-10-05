import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import validator from 'validator';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email, 
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d' // Token expires in 7 days
    }
  );
};

// User Registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Validate phone number (with country code)
    if (!/^\+\d{1,4}\d{7,15}$/.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number must include country code and be valid (e.g., +1234567890)' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this phone number already exists' 
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return success response with token and user info
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `User with this ${field} already exists`
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// User Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email and include password
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, profileImage } = req.body;

    const update = {};
    if (typeof name === 'string' && name.trim().length >= 2) update.name = name.trim();
    if (typeof phone === 'string' && phone.trim()) update.phone = phone.trim();
    if (typeof profileImage === 'string') update.profileImage = profileImage.trim();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    // Ensure phone uniqueness if phone is being updated
    if (update.phone) {
      const existingPhone = await User.findOne({ phone: update.phone, _id: { $ne: userId } });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Phone number already in use' });
      }
    }

    const updated = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'Profile updated', user: updated.toPublicJSON() });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    return res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
};

// Admin Login controller (existing)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if credentials match admin credentials from env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    // Compare credentials
    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: adminEmail, 
        role: 'admin',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '7d' // Token expires in 7 days
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        email: adminEmail,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// Verify token and get admin info
export const getAdminProfile = async (req, res) => {
  try {
    // Token verification is handled by middleware
    // If we reach here, token is valid
    
    res.status(200).json({
      success: true,
      admin: {
        email: req.admin.email,
        role: req.admin.role
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Logout (mainly for cleanup, JWT is stateless)
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
};