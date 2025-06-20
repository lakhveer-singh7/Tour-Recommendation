import express from "express";
import { createPlan, getUserPlans, deletePlan, updatePlan } from "../controllers/planController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new day plan
router.post("/", createPlan);

// Get all saved plans of the logged-in user
router.get("/", getUserPlans);

// Delete a specific plan by ID
router.delete("/:id", deletePlan);

// Update a specific plan
router.put("/:id", updatePlan);

export default router;
