import express from "express";
import { getDirections } from "../controllers/directionsController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Protected route to get directions
router.get("/directions", authMiddleware, getDirections);

export default router; 