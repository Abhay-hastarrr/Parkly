import express from 'express';
import { 
  createParkingSpot, 
  getAllParkingSpots,
  getPublicParkingSpots, 
  getParkingSpotById, 
  updateParkingSpot, 
  deleteParkingSpot 
} from '../controllers/parkingSpotController.js';
import upload from '../middleware/multer.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/parking-spots/public - Get all parking spots (Public)
router.get('/public', getPublicParkingSpots);

// GET /api/parking-spots - Get all parking spots (Admin only)
router.get('/', authenticateAdmin, getAllParkingSpots);

// POST /api/parking-spots - Create new parking spot
router.post('/', authenticateAdmin, upload.single('image'), createParkingSpot);

// GET /api/parking-spots/:id - Get single parking spot
router.get('/:id', authenticateAdmin, getParkingSpotById);

// PUT /api/parking-spots/:id - Update parking spot
router.put('/:id', authenticateAdmin, upload.single('image'), updateParkingSpot);

// DELETE /api/parking-spots/:id - Delete parking spot
router.delete('/:id', authenticateAdmin, deleteParkingSpot);

export default router;
