import {
	generateTourPlan,
	getUserPlans,
	deletePlan,
	updatePlan,
	deleteAllUserPlans
} from "../controllers/tourPlanController.js";
import express from "express";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

router.post("/optimize", authMiddleware, generateTourPlan); // create & save
router.get("/all", authMiddleware, getUserPlans); // list
router.delete("/all", authMiddleware, deleteAllUserPlans);
router.delete("/:id", deletePlan); // delete
router.put("/:id", updatePlan); // update

export default router;
