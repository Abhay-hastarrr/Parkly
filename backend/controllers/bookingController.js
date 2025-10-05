import Booking from '../models/Booking.js';
import parkingSpotModel from '../models/ParkingSpot.js';

// Helper to safely compute amount based on hourly rate and duration
const computeAmount = (pricing, durationHours = 1) => {
  const hours = Math.max(1, Number(durationHours) || 1);
  const rate = pricing?.hourlyRate ?? null;
  if (rate == null) {
    // fallback: if hourly not set, try dailyRate as 8-hour day chunk approximation
    const daily = pricing?.dailyRate ?? 0;
    if (daily) return Number(daily);
    return 0;
  }
  return Number(rate) * hours;
};

export const createBooking = async (req, res) => {
  try {
    const {
      spotId,
      customerName,
      customerPhone,
      vehicleNumber,
      vehicleType,
      durationHours = 1,
      paymentMethod = 'COD',
      startTime // optional
    } = req.body;

    if (!spotId || !customerName || !customerPhone || !vehicleNumber || !vehicleType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!['COD', 'STRIPE'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    if (paymentMethod === 'STRIPE') {
      // Placeholder for future Stripe integration
      return res.status(501).json({ success: false, message: 'Stripe payment not implemented yet' });
    }

    // Fetch spot to compute amount and verify availability
    const spot = await parkingSpotModel.findById(spotId);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Parking spot not found' });
    }

    if ((spot.availableSlots ?? 0) <= 0) {
      return res.status(409).json({ success: false, message: 'No slots available for this spot' });
    }

    // Validate vehicle type
    const validTypes = ['cars','bikes','trucks','electric_vehicles'];
    if (!validTypes.includes(vehicleType)) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
    }
    const allowed = Array.isArray(spot.allowedVehicleTypes) ? spot.allowedVehicleTypes : [];
    if (allowed.length > 0 && !allowed.includes(vehicleType)) {
      return res.status(400).json({ success: false, message: `Vehicle type not allowed for this spot. Allowed: ${allowed.join(', ')}` });
    }

    const amount = computeAmount(spot.pricing, durationHours);

    // Atomically decrement availableSlots to avoid overbooking
    const dec = await parkingSpotModel.findOneAndUpdate(
      { _id: spotId, availableSlots: { $gt: 0 } },
      { $inc: { availableSlots: -1 } },
      { new: true }
    );

    if (!dec) {
      return res.status(409).json({ success: false, message: 'Slot just sold out. Please try another spot.' });
    }

    try {
      const booking = await Booking.create({
        user: req.user?.id || undefined,
        parkingSpot: spotId,
        customerName,
        customerPhone,
        vehicleNumber,
        vehicleType,
        durationHours: Math.max(1, Number(durationHours) || 1),
        amount,
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        status: 'pending',
        startTime: startTime ? new Date(startTime) : new Date()
      });

      return res.status(201).json({ success: true, message: 'Booking created (COD). Pay on arrival.', data: booking });
    } catch (createErr) {
      // Roll back slot decrement on failure
      await parkingSpotModel.updateOne({ _id: spotId }, { $inc: { availableSlots: 1 } });
      throw createErr;
    }
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating booking' });
  }
};

// Admin: Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('parkingSpot', 'name address pricing')
      .populate('user', 'name email phone');

    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching bookings' });
  }
};

// Admin: Update booking status or payment status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const allowedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];
    const allowedPaymentStatus = ['pending', 'paid', 'failed'];

    const update = {};
    if (status) {
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      update.status = status;
    }
    if (paymentStatus) {
      if (!allowedPaymentStatus.includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid payment status' });
      }
      update.paymentStatus = paymentStatus;
    }

    const updated = await Booking.findByIdAndUpdate(id, update, { new: true })
      .populate('parkingSpot', 'name address pricing')
      .populate('user', 'name email phone');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({ success: true, message: 'Booking updated', data: updated });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating booking' });
  }
};

// Admin: Delete booking (cancel) and free the slot
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(id);

    // Free one slot back to the parking spot
    if (booking.parkingSpot) {
      try {
        await parkingSpotModel.updateOne({ _id: booking.parkingSpot }, { $inc: { availableSlots: 1 } });
      } catch (incErr) {
        console.warn('Failed to increment availableSlots after booking deletion:', incErr);
      }
    }

    return res.status(200).json({ success: true, message: 'Booking cancelled and removed' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting booking' });
  }
};

// User: Get bookings for the authenticated user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('parkingSpot', 'name address pricing');

    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching your bookings' });
  }
};

// User: Cancel own booking (set status to cancelled and free a slot if not already cancelled)
export const cancelBookingByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user && booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (booking.status === 'cancelled') {
      return res.status(200).json({ success: true, message: 'Booking already cancelled', data: booking });
    }

    // Update status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    // Free slot
    if (booking.parkingSpot) {
      try {
        await parkingSpotModel.updateOne({ _id: booking.parkingSpot }, { $inc: { availableSlots: 1 } });
      } catch (e) {
        console.warn('Failed to increment availableSlots after user cancellation:', e);
      }
    }

    const populated = await Booking.findById(id)
      .populate('parkingSpot', 'name address pricing');

    return res.status(200).json({ success: true, message: 'Booking cancelled', data: populated });
  } catch (error) {
    console.error('User cancel booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while cancelling booking' });
  }
};
