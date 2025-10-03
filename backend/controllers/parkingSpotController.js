import parkingSpotModel from '../models/ParkingSpot.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Get all parking spots
export const getAllParkingSpots = async (req, res) => {
  try {
    const parkingSpots = await parkingSpotModel.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: parkingSpots.length,
      data: parkingSpots
    });
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching parking spots' 
    });
  }
};

// Get single parking spot by ID
export const getParkingSpotById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const parkingSpot = await parkingSpotModel.findById(id);
    
    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: parkingSpot
    });
  } catch (error) {
    console.error('Error fetching parking spot:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching parking spot' 
    });
  }
};

// Update parking spot
export const updateParkingSpot = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse JSON fields from FormData if they exist
    let updateData = { ...req.body };
    
    if (req.body.address && typeof req.body.address === 'string') {
      updateData.address = JSON.parse(req.body.address);
    }
    if (req.body.location && typeof req.body.location === 'string') {
      updateData.location = JSON.parse(req.body.location);
    }
    if (req.body.pricing && typeof req.body.pricing === 'string') {
      updateData.pricing = JSON.parse(req.body.pricing);
    }
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      updateData.amenities = JSON.parse(req.body.amenities);
    }
    if (req.body.allowedVehicleTypes && typeof req.body.allowedVehicleTypes === 'string') {
      updateData.allowedVehicleTypes = JSON.parse(req.body.allowedVehicleTypes);
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'parking-spots',
          resource_type: 'image'
        });
        updateData.imageUrl = result.secure_url;
        
        // Remove local file after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue without updating image if upload fails
      }
    }
    
    const updatedParkingSpot = await parkingSpotModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedParkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Parking spot updated successfully',
      data: updatedParkingSpot
    });
  } catch (error) {
    console.error('Error updating parking spot:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating parking spot' 
    });
  }
};

// Delete parking spot
export const deleteParkingSpot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedParkingSpot = await parkingSpotModel.findByIdAndDelete(id);
    
    if (!deletedParkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Parking spot deleted successfully',
      data: deletedParkingSpot
    });
  } catch (error) {
    console.error('Error deleting parking spot:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting parking spot' 
    });
  }
};

// Get all parking spots (Public - no authentication required)
export const getPublicParkingSpots = async (req, res) => {
  try {
    const parkingSpots = await parkingSpotModel.find({
      availableSlots: { $gt: 0 } // Only show spots with available slots
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: parkingSpots.length,
      data: parkingSpots
    });
  } catch (error) {
    console.error('Error fetching public parking spots:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching parking spots' 
    });
  }
};

export const createParkingSpot = async (req, res) => {
  try {
    // Parse JSON fields from FormData
    const {
      name,
      parkingType,
      totalSlots,
      availableSlots,
      operatingHours,
      specialInstructions
    } = req.body;
    
    const address = JSON.parse(req.body.address);
    const location = JSON.parse(req.body.location);
    const pricing = JSON.parse(req.body.pricing);
    const amenities = JSON.parse(req.body.amenities);
    const allowedVehicleTypes = JSON.parse(req.body.allowedVehicleTypes);
    
    let imageUrl = null;
    
    // Handle image upload if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'parking-spots',
          resource_type: 'image'
        });
        imageUrl = result.secure_url;
        
        // Remove local file after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue without image if upload fails
      }
    }

    const newParkingSpot = new parkingSpotModel({
      name,
      parkingType,
      address,
      location,
      totalSlots,
      availableSlots,
      operatingHours,
      pricing,
      amenities,
      imageUrl,
      allowedVehicleTypes,
      specialInstructions
    });

    const savedParkingSpot = await newParkingSpot.save();

    res.status(201).json(savedParkingSpot);
  } catch (error) {
    console.error('Error creating parking spot:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
