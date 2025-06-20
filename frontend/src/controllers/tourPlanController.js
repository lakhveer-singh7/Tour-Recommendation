// controllers/tourPlanController.js
import Plan from "../models/Plan.js";
import { googleOptimize, fallbackOptimize } from "../services/routeOptimizerService.js";
import { haversine } from "../utils/tspGreedy.js";

/* ─────────────────────────────────────────────────────────────── */
/* 1. Create an optimised day plan                                 */
/* POST /api/plan/optimize                                         */
/* ─────────────────────────────────────────────────────────────── */
export const generateTourPlan = async (req, res) => {
	try {
		const { origin, destinations } = req.body;
		if (!origin || !Array.isArray(destinations) || destinations.length < 2)
			return res.status(400).json({ message: "Need origin & ≥2 destinations" });

		let plan, travelSec, optimized;
		try {
			({ reordered: plan, travelSec } = await googleOptimize(origin, destinations));
			optimized = true;
		} catch {
			({ reordered: plan, travelSec } = fallbackOptimize(origin, destinations));
			optimized = false;
		}

		// Attach leg times & compute totals
		let totalTravel = 0,
			totalVisit = 0,
			elapsed = 0;
		plan = plan.map((p, i) => {
			const leg = travelSec[i] || 0;
			elapsed += leg;
			totalTravel += leg;
			const arrivalSec = elapsed;
			const staySec = (p.duration || 60) * 60;
			elapsed += staySec;
			totalVisit += staySec;
			return { ...p, legTravelSec: leg, arrivalSec };
		});

		// Persist the plan
		const saved = await Plan.create({
			user: req.user.userId,
			sourceLocation: origin,
			selectedPlaces: plan.map((p) => ({ place: p.placeId, ...p })), // embed snapshot
			totalTime: Math.round((totalTravel + totalVisit) / 60),
			isSorted: optimized,
		});

		res.status(201).json({
			message: "Plan generated & saved",
			planId: saved._id,
			optimized,
			totalTravelMin: Math.round(totalTravel / 60),
			totalVisitMin: Math.round(totalVisit / 60),
			totalDurationMin: saved.totalTime,
			plan,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Plan optimisation failed", error: err.message });
	}
};

/* ─────────────────────────────────────────────────────────────── */
/* 2. Get all plans of logged‑in user                              */
/* GET /api/plan/all                                               */
/* ─────────────────────────────────────────────────────────────── */
export const getUserPlans = async (_req, res) => {
	try {
		const plans = await Plan.find({ user: req.user.userId }).populate("selectedPlaces.place");
		res.json(plans);
	} catch (err) {
		res.status(500).json({ message: "Failed to fetch plans", error: err.message });
	}
};

/* ─────────────────────────────────────────────────────────────── */
/* 3. Delete a plan (by ID)                                        */
/* DELETE /api/plan/:id                                            */
/* ─────────────────────────────────────────────────────────────── */
export const deletePlan = async (req, res) => {
	try {
		const plan = await Plan.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
		if (!plan) return res.status(404).json({ message: "Plan not found or unauthorized" });
		res.json({ message: "Plan deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: "Failed to delete plan", error: err.message });
	}
};

/* ─────────────────────────────────────────────────────────────── */
/* 4. Update an existing plan                                      */
/* PUT /api/plan/:id                                               */
/* ─────────────────────────────────────────────────────────────── */
export const updatePlan = async (req, res) => {
	try {
		const { sourceLocation, selectedPlaces, totalTime, isSorted } = req.body;
		const plan = await Plan.findOne({ _id: req.params.id, user: req.user.userId });
		if (!plan) return res.status(404).json({ message: "Plan not found or unauthorized" });

		plan.sourceLocation = sourceLocation || plan.sourceLocation;
		plan.selectedPlaces = selectedPlaces || plan.selectedPlaces;
		plan.totalTime = totalTime || plan.totalTime;
		plan.isSorted = isSorted ?? plan.isSorted;

		await plan.save();
		res.json({ message: "Plan updated successfully", plan });
	} catch (err) {
		res.status(500).json({ message: "Failed to update plan", error: err.message });
	}
};
