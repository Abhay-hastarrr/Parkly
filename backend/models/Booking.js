import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    parkingSpot: { type: mongoose.Schema.Types.ObjectId, ref: 'parkingSpot', required: true },

    customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
    customerPhone: { type: String, required: [true, 'Customer phone is required'], trim: true },
    vehicleNumber: { type: String, required: [true, 'Vehicle number is required'], trim: true },

    startTime: { type: Date, default: () => new Date(), required: true },
    durationHours: { type: Number, default: 1, min: [1, 'Minimum duration is 1 hour'], required: true },

    amount: { type: Number, required: [true, 'Amount is required'], min: [0, 'Amount cannot be negative'] },

    paymentMethod: { type: String, enum: ['COD', 'STRIPE'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },

    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },

    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
