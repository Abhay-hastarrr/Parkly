import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        // Allow phone numbers with country codes (+ followed by 1-4 digits, then 7-15 more digits)
        return /^\+\d{1,4}\d{7,15}$/.test(v);
      },
      message: 'Phone number must include country code and be valid (e.g., +1234567890)'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: ''
  },
  // Parking related fields
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot'
  }],
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Reset password functionality
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true
});

// Index for faster queries (email index is already defined in schema)
userSchema.index({ phone: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Generate JWT token method (we'll use this in the controller)
userSchema.methods.generateAuthToken = function() {
  // This method can be used if needed, but we'll handle JWT in the controller
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role
  };
};

// Method to get public profile
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isVerified: this.isVerified,
    profileImage: this.profileImage,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for full name (if you want to split name later)
userSchema.virtual('initials').get(function() {
  return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
});

const User = mongoose.model('User', userSchema);

export default User;