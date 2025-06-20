import Plan from "../models/Plan.js";
import Place from "../models/Place.js";

// Create a new day plan
// export const createPlan = async (req, res) => {
// 	const { sourceLocation, selectedPlaces, totalTime, isSorted } = req.body;

// 	try {
// 		const plan = new Plan({
// 			user: req.user.userId,
// 			sourceLocation,
// 			selectedPlaces,
// 			totalTime,
// 			isSorted: isSorted || false,
// 		});

// 		await plan.save();
// 		res.status(201).json({ message: "Plan created successfully", plan });
// 	} catch (err) {
// 		res.status(500).json({ message: "Failed to create plan", error: err.message });
// 	}
// };

import { sortPlacesTSP } from "../services/tspService.js";

export const createPlan = async (req, res) => {
	try {
		const { sourceLocation, selectedPlaces, totalTime, isSorted = false } = req.body;

		if (!sourceLocation || !selectedPlaces || !totalTime) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		// Ensure all places exist
		const placeIds = selectedPlaces.map((p) => p.place);
		const existingPlaces = await Place.find({ _id: { $in: placeIds } });
		if (existingPlaces.length !== placeIds.length) {
			return res.status(404).json({ message: "One or more places not found" });
		}

		// 🧠 TSP sorting if enabled
		let sortedPlaces = selectedPlaces;
		if (isSorted) {
			sortedPlaces = await sortPlacesTSP(sourceLocation, selectedPlaces);
			console.log("✅ Places sorted using TSP");
		}

		const plan = await Plan.create({
			user: req.user.userId,
			sourceLocation,
			selectedPlaces: sortedPlaces,
			totalTime,
			isSorted: true,
		});

		res.status(201).json({ message: "Plan saved successfully", plan });
	} catch (err) {
		console.error("❌ Failed to save plan:", err.message);
		res.status(500).json({ message: "Server error", error: err.message });
	}
};

// Get all plans of the logged-in user
export const getUserPlans = async (req, res) => {
	try {
		const plans = await Plan.find({ user: req.user.userId }).populate("selectedPlaces.place");
		res.json(plans);
	} catch (err) {
		res.status(500).json({ message: "Failed to fetch plans", error: err.message });
	}
};

// Delete a specific plan by its ID
export const deletePlan = async (req, res) => {
	const { id } = req.params;

	try {
		const plan = await Plan.findOneAndDelete({ _id: id, user: req.user.userId });
		if (!plan) {
			return res.status(404).json({ message: "Plan not found or unauthorized" });
		}
		res.json({ message: "Plan deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: "Failed to delete plan", error: err.message });
	}
};

// Update an existing plan
export const updatePlan = async (req, res) => {
	const { id } = req.params;
	const { sourceLocation, selectedPlaces, totalTime, isSorted } = req.body;

	try {
		const plan = await Plan.findOne({ _id: id, user: req.user.userId });
		if (!plan) {
			return res.status(404).json({ message: "Plan not found or unauthorized" });
		}

		// Update the fields
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
