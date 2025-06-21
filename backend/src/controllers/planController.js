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

		if (!sourceLocation || !selectedPlaces || typeof totalTime !== 'number') {
			return res.status(400).json({ message: "Missing required fields: sourceLocation, selectedPlaces, and totalTime (must be a number) are required." });
		}

		// Validate sourceLocation has lat and lng
		if (!sourceLocation.lat || !sourceLocation.lng) {
			return res.status(400).json({ message: "sourceLocation must have lat and lng coordinates." });
		}

		// Validate selectedPlaces is an array and has at least one place
		if (!Array.isArray(selectedPlaces) || selectedPlaces.length === 0) {
			return res.status(400).json({ message: "selectedPlaces must be a non-empty array." });
		}

		// Ensure all places exist (but don't fail if they don't - just log)
		const placeIds = selectedPlaces.map((p) => p.place).filter(Boolean);
		if (placeIds.length > 0) {
			const existingPlaces = await Place.find({ placeId: { $in: placeIds } });
			if (existingPlaces.length !== placeIds.length) {
				console.warn("Some places not found in database:", placeIds.filter(id => !existingPlaces.find(p => p.placeId === id)));
			}
		}

		// 🧠 TSP sorting if enabled
		let sortedPlaces = selectedPlaces;
		if (isSorted) {
			try {
				sortedPlaces = await sortPlacesTSP(sourceLocation, selectedPlaces);
				console.log("✅ Places sorted using TSP");
			} catch (tspError) {
				console.error("TSP sorting failed, using original order:", tspError);
				sortedPlaces = selectedPlaces;
			}
		}

		// Reverse-geocode state and city from sourceLocation
		let savedLocation = { state: "Unknown", city: "Unknown" };
		try {
			const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
			if (GOOGLE_KEY) {
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
			}
		} catch (e) {
			console.error("🗺️ Geocode error (plan save):", e.response?.data?.error_message || e.message);
		}

		// Save all place details as sent from frontend
		const plan = await Plan.create({
			user: req.user.userId,
			sourceLocation,
			selectedPlaces: sortedPlaces, // includes name, address, etc.
			totalTime,
			isSorted: isSorted,
			summary: req.body.summary || '',
			savedLocation,
		});

		res.status(201).json({ message: "Plan saved successfully", plan });
	} catch (err) {
		console.error("❌ Failed to save plan:", err.message);
		console.error("❌ Error details:", err);
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

// Delete all plans for the logged-in user
export const deleteAllPlans = async (req, res) => {
	try {
		await Plan.deleteMany({ user: req.user.userId });
		res.json({ message: "All plans deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: "Failed to delete all plans", error: err.message });
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

export const optimizePlan = async (req, res) => {
	const { origin, destinations, optimize } = req.body;

	if (!origin || !destinations || destinations.length === 0) {
		return res.status(400).json({ message: "Origin and destinations are required." });
	}

	try {
		// Data normalization for ORIGIN
		const normalizedOrigin = (origin.location && origin.location.lat) ? origin : { location: { lat: origin.lat, lng: origin.lng } };

		// Data normalization: Ensure all destinations have a `location` property
		const normalizedDestinations = destinations.map(dest => {
			if (dest.location && dest.location.lat && dest.location.lng) {
				return dest;
			}
			// Fallback for different possible location structures
			if (dest.geometry && dest.geometry.lat && dest.geometry.lng) {
				return { ...dest, location: { lat: dest.geometry.lat, lng: dest.geometry.lng } };
			}
			if (dest.lat && dest.lng) {
				return { ...dest, location: { lat: dest.lat, lng: dest.lng } };
			}
			// If location cannot be determined, it will cause an error downstream, which is caught below
			return dest;
		});

		let plan = normalizedDestinations;
		if (optimize) {
			// Check again after normalization
			const invalidDest = normalizedDestinations.find(d => !d.location?.lat || !d.location?.lng);
			if (invalidDest) {
				return res.status(400).json({ message: `Destination "${invalidDest.name || 'unnamed'}" is missing required location data.` });
			}
			plan = await sortPlacesTSP(normalizedOrigin, normalizedDestinations);
		}

		// Placeholder for time details
		const timeDetails = {
			returnTripMin: 120,
			avgStayTimeMin: 60,
			totalDurationMin: 180,
			estimatedStartTime: "09:00 AM",
			estimatedEndTime: "12:00 PM",
		};

		res.json({ plan, timeDetails });
	} catch (err) {
		console.error("❌ Failed to optimize plan:", err.message);
		res.status(500).json({ message: "Server error during plan optimization", error: err.message });
	}
};
