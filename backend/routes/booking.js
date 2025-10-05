import express from 'express';
import { createBooking, getAllBookings, updateBookingStatus, deleteBooking, getUserBookings, cancelBookingByUser } from '../controllers/bookingController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Admin: list bookings
router.get('/', authenticateAdmin, getAllBookings);

// Create booking (admin)
router.post('/', authenticateAdmin, createBooking);

// Create booking (user)
router.post('/user', authenticateUser, createBooking);

// User: list own bookings
router.get('/user/list', authenticateUser, getUserBookings);

// User: cancel own booking
router.patch('/user/:id/cancel', authenticateUser, cancelBookingByUser);

// Admin: update booking status/paymentStatus
router.patch('/:id/status', authenticateAdmin, updateBookingStatus);

// Admin: delete booking
router.delete('/:id', authenticateAdmin, deleteBooking);

export default router;
