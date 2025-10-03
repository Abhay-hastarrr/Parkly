import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  login, 
  getAdminProfile, 
  logout 
} from '../controllers/authController.js';
import { authenticateUser, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes
// Register new user - no authentication required
router.post('/register', registerUser);

// User login - no authentication required
router.post('/login', loginUser);

// Get user profile - authentication required
router.get('/profile', authenticateUser, getUserProfile);

// Admin routes
// Admin login route - no authentication required
router.post('/admin/login', login);

// Get admin profile - authentication required
router.get('/admin/profile', authenticateAdmin, getAdminProfile);

// Admin logout route - authentication required
router.post('/admin/logout', authenticateAdmin, logout);

export default router;