// controllers/placeController.js
import { googleTextSearch, googleNearbySearch, googleDetails } from "../services/searchService.js";
// import Place from "../models/Place.js";

/* 🔍 /search ----------------------------------------------------- */
export const searchPlaces = async (req, res) => {
	const { q, lat, lng, radius, type, limit } = req.query;

	try {
		let results;
		if (lat && lng && radius) {
			results = await googleNearbySearch({
				lat: parseFloat(lat),
				lng: parseFloat(lng),
				radius: parseInt(radius),
				type,
				limit,
			});
		} else if (q) {
			results = await googleTextSearch(q, limit);
		} else {
			return res.status(400).json({ message: "Provide either q OR lat/lng/radius" });
		}
		res.json(results);
	} catch (err) {
		console.error(err.response?.data || err.message);
		res.status(502).json({ message: "Geoapify search failed", error: err.message });
	}
};

/* 🧾 /details/:placeId ------------------------------------------- */
export const getPlaceDetails = async (req, res) => {
	const { placeId } = req.params;
	try {
		let place = await Place.findOne({ placeId });
		if (!place) {
			const details = await googleDetails(placeId);
			place = await Place.create(details);
		}
		res.json(place);
	} catch (err) {
		res.status(502).json({ message: "Failed to fetch place details", error: err.message });
	}
};

/* 💾 /saved ------------------------------------------------------ */
export const getSavedPlaces = async (_req, res) => {
	try {
		const places = await Place.find().sort({ rating: -1 }).limit(20);
		res.json(places);
	} catch (err) {
		res.status(500).json({ message: "Failed to fetch saved places", error: err.message });
	}
};

/* ➕ /save ------------------------------------------------------- */
export const savePlace = async (req, res) => {
	const { placeId, name, location, types, rating, address, photoUrl } = req.body;
	if (!placeId || !name || !location?.lat || !location?.lng) {
		return res.status(400).json({ message: "Missing required fields" });
	}

	try {
		const existing = await Place.findOne({ placeId });
		if (existing) {
			return res.status(409).json({ message: "Place already exists", place: existing });
		}

		const place = await Place.create({
			placeId,
			name,
			location,
			types,
			rating,
			address,
			photoUrl,
		});

		res.status(201).json({ message: "Place saved successfully", place });
	} catch (err) {
		res.status(500).json({ message: "Failed to save place", error: err.message });
	}
};
