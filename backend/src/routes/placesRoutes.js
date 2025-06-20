import express from 'express';
import { getNearbyPlaces } from '../controllers/placesController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Route to get nearby places based on user location and preferences
// Protected by authMiddleware to ensure only logged-in users can access
router.get('/nearby', authMiddleware, getNearbyPlaces);

export default router; 