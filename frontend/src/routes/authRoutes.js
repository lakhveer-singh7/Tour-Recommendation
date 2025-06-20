import express from "express";
import {
	registerUser,
	loginUser,
	getUserProfile,
	updateUserProfile,
	changePassword,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
