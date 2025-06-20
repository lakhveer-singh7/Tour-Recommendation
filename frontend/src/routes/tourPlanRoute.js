import {
	generateTourPlan,
	getUserPlans,
	deletePlan,
	updatePlan,
} from "../controllers/tourPlanController.js";
import express from "express";
const router = express.Router();

router.post("/optimize", generateTourPlan); // create & save
router.get("/all", getUserPlans); // list
router.delete("/:id", deletePlan); // delete
router.put("/:id", updatePlan); // update

export default router;
