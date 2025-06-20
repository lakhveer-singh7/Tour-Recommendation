// controllers/tourPlanController.js
import Plan from "../models/Plan.js";
import { googleOptimize, fallbackOptimize, travelTimeForOrder } from "../services/routeOptimizerService.js";
import { haversine } from "../utils/tspGreedy.js";

/* ─────────────────────────────────────────────────────────────── */
/* 1. Create an optimised day plan                                 */
/* POST /api/plan/optimize                                         */
/* ─────────────────────────────────────────────────────────────── */
export const generateTourPlan = async (req, res) => {
	try {
		const { origin, destinations, optimize } = req.body;
		if (!origin || !Array.isArray(destinations) || destinations.length < 2)
			return res.status(400).json({ message: "Need origin & ≥2 destinations" });

		// Validate all destinations have a valid location
		const missingLoc = destinations.find(
			(p) => !p.location || typeof p.location.lat !== 'number' || typeof p.location.lng !== 'number'
		);
		if (missingLoc) {
			return res.status(400).json({ message: `Selected place \"${missingLoc.name || missingLoc.placeId || 'Unknown'}\" is missing location data. Please select places with valid locations.` });
		}

		let plan, travelSec, optimized;
		if (optimize === true) {
			try {
				({ reordered: plan, travelSec } = await googleOptimize(origin, destinations));
				optimized = true;
			} catch {
				({ reordered: plan, travelSec } = fallbackOptimize(origin, destinations));
				optimized = true;
			}
		} else {
			({ reordered: plan, travelSec } = travelTimeForOrder(origin, destinations));
			optimized = false;
		}

		if (!plan || plan.length === 0) {
			return res.status(200).json({
				message: "No valid plan generated.",
				plan: [],
				timeDetails: {
					totalTravelMin: 0,
					totalVisitMin: 0,
					returnTripMin: 0,
					totalDurationMin: 0,
					avgStayTimeMin: 0,
					estimatedStartTime: new Date().toLocaleTimeString(),
					estimatedEndTime: new Date().toLocaleTimeString()
				}
			});
		}

		// Attach leg times & compute totals
		let totalTravel = 0,
			totalVisit = 0,
			elapsed = 0;
		// Calculate average stay time (ensure valid numbers)
		const avgStayTime = Math.round(
			plan.reduce((sum, p) => sum + (typeof p.duration === 'number' && !isNaN(p.duration) ? p.duration : 60), 0) / plan.length
		);

		// Calculate detailed time information
		const timeDetails = plan.map((p, i) => {
			const leg = travelSec[i] || 0;
			elapsed += leg;
			totalTravel += leg;
			const arrivalSec = elapsed;
			const stayMin = (typeof p.duration === 'number' && !isNaN(p.duration)) ? p.duration : 60;
			const staySec = stayMin * 60;
			elapsed += staySec;
			totalVisit += staySec;
			return {
				...p,
				legTravelSec: leg,
				arrivalSec,
				staySec,
				arrivalTime: new Date(Date.now() + arrivalSec * 1000).toLocaleTimeString(),
				departureTime: new Date(Date.now() + (arrivalSec + staySec) * 1000).toLocaleTimeString()
			};
		});

		// Calculate return trip time (handle missing locations)
		let returnTripTime = 0;
		if (plan[plan.length - 1]?.location && origin?.location) {
			returnTripTime = Math.round(haversine(plan[plan.length - 1].location, origin.location) / 40 * 3600 * 1.1);
		}
		const totalTimeWithReturn = totalTravel + totalVisit + returnTripTime;

		res.status(200).json({
			message: "Plan generated",
			optimized,
			timeDetails: {
				totalTravelMin: Math.round(totalTravel / 60),
				totalVisitMin: Math.round(totalVisit / 60),
				returnTripMin: Math.round(returnTripTime / 60),
				totalDurationMin: Math.round(totalTimeWithReturn / 60),
				avgStayTimeMin: avgStayTime,
				estimatedStartTime: new Date().toLocaleTimeString(),
				estimatedEndTime: new Date(Date.now() + totalTimeWithReturn * 1000).toLocaleTimeString()
			},
			plan: timeDetails,
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
export const getUserPlans = async (req, res) => {
	try {
		console.log("Fetching plans for user:", req.user);
		const plans = await Plan.find({ user: req.user.userId });
		res.json(plans);
	} catch (err) {
		console.error("Failed to fetch plans:", err);
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

export const deleteAllUserPlans = async (req, res) => {
	try {
		await Plan.deleteMany({ user: req.user.userId });
		res.json({ message: 'All plans deleted for user' });
	} catch (err) {
		res.status(500).json({ message: 'Failed to delete all plans', error: err.message });
	}
};
