import mongoose from "mongoose";

const parkingSpotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Parking spot name is required"],
      trim: true,
    },
    parkingType: {
      type: String,
      required: [true, "Parking type is required"],
      enum: ["Covered Parking", "Uncovered Parking", "Valet Parking", "Self Parking", "Multi-Level Parking", "EV Charging Station"],
      default: "Covered Parking"
    },
    address: {
      fullAddress: { type: String, required: [true, "Full address is required"] },
      locality: { type: String, required: [true, "Locality is required"] },
      landmark: { type: String, required: [true, "Landmark is required"] },
      city: { type: String, required: [true, "City is required"] },
      state: { type: String, required: [true, "State is required"] },
      pincode: { type: String, required: [true, "Pincode is required"] },
    },
    location: {
      latitude: { type: Number, required: [true, "Latitude is required"] },
      longitude: { type: Number, required: [true, "Longitude is required"] },
    },
    totalSlots: {
      type: Number,
      required: [true, "Total slots is required"],
    },
    availableSlots: {
      type: Number,
      required: [true, "Available slots is required"],
    },
    operatingHours: {
      type: String,
      required: [true, "Operating hours are required"],
    },
    pricing: {
      currency: {
        type: String,
        default: "INR"
      },
      hourlyRate: {
        type: Number,
        min: [0, "Hourly rate cannot be negative"]
      },
      dailyRate: {
        type: Number,
        min: [0, "Daily rate cannot be negative"]
      },
      monthlyRate: {
        type: Number,
        min: [0, "Monthly rate cannot be negative"]
      }
    },
    amenities: {
      type: [String],
      enum: ["cctv", "security_guard", "covered_parking", "ev_charging", "valet_service", "washroom", "disabled_friendly"],
      default: []
    },
    imageUrl: {
      type: String,
      default: null
    },
    allowedVehicleTypes: {
      type: [String],
      enum: ["cars", "bikes", "trucks", "electric_vehicles"],
      default: []
    },
    specialInstructions: {
      type: String,
      maxlength: [500, "Special instructions cannot exceed 500 characters"],
      default: ""
    },
  },
  { timestamps: true }
);

const parkingSpotModel = mongoose.model("parkingSpot", parkingSpotSchema);
export default parkingSpotModel;

