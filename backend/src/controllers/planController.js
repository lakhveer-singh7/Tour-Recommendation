import Plan from "../models/Plan.js";
import Place from "../models/Place.js";
import axios from "axios";

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
		const existingPlaces = await Place.find({ placeId: { $in: placeIds } });
		if (existingPlaces.length !== placeIds.length) {
			return res.status(404).json({ message: "One or more places not found" });
		}

		// 🧠 TSP sorting if enabled
		let sortedPlaces = selectedPlaces;
		if (isSorted) {
			sortedPlaces = await sortPlacesTSP(sourceLocation, selectedPlaces);
			console.log("✅ Places sorted using TSP");
		}

		// Reverse-geocode state and city from sourceLocation
		let savedLocation = { state: "Unknown", city: "Unknown" };
		try {
			const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
			const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
			const { data } = await axios.get(GEOCODE_URL, {
				params: { latlng: `${sourceLocation.lat},${sourceLocation.lng}`, key: GOOGLE_KEY },
			});
			const comps = data.results?.[0]?.address_components ?? [];
			const stateObj = comps.find((c) => c.types.includes("administrative_area_level_1"));
			const cityObj = comps.find((c) => c.types.includes("locality")) ||
				comps.find((c) => c.types.includes("administrative_area_level_2"));
			savedLocation.state = stateObj?.long_name || "Unknown";
			savedLocation.city = cityObj?.long_name || "Unknown";
		} catch (e) {
			console.error("🗺️ Geocode error (plan save):", e.response?.data?.error_message || e.message);
		}

		// Save all place details as sent from frontend
		const plan = await Plan.create({
			user: req.user.userId,
			sourceLocation,
			selectedPlaces: sortedPlaces, // includes name, address, etc.
			totalTime,
			isSorted: true,
			summary: req.body.summary || '',
			savedLocation,
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
		const plans = await Plan.find({ user: req.user.userId });
		// Patch: Add summary if missing
		const plansWithSummary = plans.map(plan => {
			if (plan.summary && plan.summary.trim()) return plan;
			const places = plan.selectedPlaces || [];
			const summary = places.map((place, idx) => {
				let details = `${idx + 1}. ${place.name || place.placeId || ''}`;
				if (place.address) details += `\n(${place.address})`;
				if (place.arrivalTime) details += `\nArrival: ${place.arrivalTime}`;
				if (place.departureTime) details += `\nDeparture: ${place.departureTime}`;
				if (place.staySec) details += `\nStay Duration: ${Math.round(place.staySec / 60)} minutes`;
				if (place.legTravelSec) details += `\nTravel to next: ${Math.round(place.legTravelSec / 60)} minutes`;
				return details;
			}).join('\n\n');
			return { ...plan.toObject(), summary };
		});
		res.json(plansWithSummary);
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
