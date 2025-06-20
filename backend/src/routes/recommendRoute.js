import express from "express";
import auth from "../middleware/auth.js";
import {
	getHybridRecommendations,
	getHybridLocationRecommendations,
} from "../controllers/recommendController.js";

const router = express.Router();

// Hybrid CF + content-based
router.get("/hybrid", auth, getHybridRecommendations);

// Hybrid + location-aware
router.get("/hybrid/location", auth, getHybridLocationRecommendations);

export default router;
