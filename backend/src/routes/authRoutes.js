import express from "express";
import {
	registerUser,
	loginUser,
	getUserProfile,
	updateUserProfile,
	changePassword,
	getAllUsers,
	verifyGoogleToken
} from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-verify", verifyGoogleToken);

// Protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/change-password", authMiddleware, changePassword);

// Dashboard: Get all users
router.get("/users", authMiddleware, getAllUsers);

export default router;
