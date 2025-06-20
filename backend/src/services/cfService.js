import Plan from "../models/Plan.js";
import Place from "../models/Place.js";
import User from "../models/User.js";
import similarity from "../utils/similarity.js";
import { seedPlaces } from "./seedHelper.js";
// Haversine distance in km
const haversine = (loc1, loc2) => {
	const R = 6371;
	const toRad = (deg) => (deg * Math.PI) / 180;
	const dLat = toRad(loc2.lat - loc1.lat);
	const dLon = toRad(loc2.lng - loc1.lng);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Helper to expand cinema-related types
const expandPreferenceTypes = (prefs) => {
	const expanded = new Set();
	prefs.forEach((p) => {
		if (p === 'cinema') {
			[
				'movie_theater',
				'theatre',
				'theater',
				'multiplex',
				'cinema',
				'plex',
				'movies',
				'film',
				'screen',
				'show',
				'hall',
			].forEach((t) => expanded.add(t));
		} else if (p === 'temple') {
			[
				'temple', 'hindu_temple', 'church', 'mosque', 'synagogue', 'place_of_worship',
				'mandir', 'gurudwara', 'math', 'ashram', 'spiritual', 'retreat', 'meditation',
			].forEach((t) => expanded.add(t));
		} else {
			expanded.add(p);
		}
	});
	return Array.from(expanded);
};

// Helper to check if place matches preferences by type or name
const matchesPreference = (place, expandedPrefs) => {
	// Check types
	if (place.types && expandedPrefs.some(pref => place.types.includes(pref))) return true;
	// Check name (case-insensitive, subword match)
	const name = (place.name || '').toLowerCase();
	return expandedPrefs.some(pref => name.includes(pref.toLowerCase()));
};

/**
 *  hybridRecommend(userId, limit)
 * Collaborative + Content-Based Recommender (global, not location-aware)
 */
export const hybridRecommend = async (userId, limit = 5) => {
	const user = await User.findById(userId);
	if (!user) throw new Error("User not found");

	// const preferences = user.preferences || {};
	const placeTypesPref = expandPreferenceTypes(user.preferences || []);

	// Build user → place matrix
	const plans = await Plan.find();
	const userVisits = {};
	const allPlaceIds = new Set();
	// console.log(plans);
	plans.forEach((plan) => {
		const uid = plan.user.toString();
		userVisits[uid] ??= new Set();
		plan.selectedPlaces.forEach((entry) => {
			if (entry.place && entry.place.placeId) {
				userVisits[uid].add(entry.place.placeId);
				allPlaceIds.add(entry.place.placeId);
			}
		});
	});

	const allPlaceArr = [...allPlaceIds];
	const currentUserVec = allPlaceArr.map((pid) => (userVisits[userId]?.has(pid) ? 1 : 0));

	const cfScores = new Map();

	Object.entries(userVisits).forEach(([uid, visited]) => {
		if (uid === userId) return;
		const vec = allPlaceArr.map((pid) => (visited.has(pid) ? 1 : 0));
		const sim = similarity.cosine(currentUserVec, vec);
		visited.forEach((pid) => {
			if (!userVisits[userId]?.has(pid)) {
				cfScores.set(pid, (cfScores.get(pid) || 0) + sim);
			}
		});
	});
	// console.log(cfScores);
	const placeDocs = await Place.find();
	const cbScores = new Map();

	for (const place of placeDocs) {
		let score = 0;
		if (placeTypesPref.length && place.types) {
			const match = place.types.filter((t) => placeTypesPref.includes(t));
			score = match.length / placeTypesPref.length;
		}
		cbScores.set(place.placeId, score);
	}
	// console.log(cbScores);
	const finalScores = new Map();
	const weightCF = 0.7;
	const weightCB = 0.3;

	for (const place of placeDocs) {
		const pid = place.placeId;
		const cf = cfScores.get(pid) || 0;
		const cb = cbScores.get(pid) || 0;

		const score = weightCF * cf + weightCB * cb;
		if (score > 0) finalScores.set(pid, { score, place });
	}

	return [...finalScores.values()]
		.map((p) => p.place)
		.filter((place) =>
			placeTypesPref.length === 0 || matchesPreference(place, placeTypesPref)
		)
		.slice(0, limit);
};

/**
 * 📍 hybridRecommendWithLocation({ userId, lat, lng, radius, limit })
 * Hybrid recommender limited to places near lat/lng
 */
export const hybridRecommendWithLocation = async ({
	userId,
	lat,
	lng,
	radius = 5000,
	limit = 5,
}) => {
	console.log(`Starting hybrid recommendation for user ${userId} at [${lat}, ${lng}] with radius ${radius}m`);

	try {
		const user = await User.findById(userId);
		if (!user) throw new Error("User not found");

		const placeTypesPref = expandPreferenceTypes(user.preferences || []);
		console.log("User preferences expanded to:", placeTypesPref);

		/* ---------------- CF PREP ---------------- */
		let cfScores = new Map();
		try {
			const plans = await Plan.find();
			const userVisits = {};
			const allPlaceIds = new Set();

			plans.forEach((plan) => {
				const uid = plan.user.toString();
				userVisits[uid] ??= new Set();
				plan.selectedPlaces.forEach((entry) => {
					if (entry.place?.placeId) {
						userVisits[uid].add(entry.place.placeId);
						allPlaceIds.add(entry.place.placeId);
					}
				});
			});

			if (Object.keys(userVisits).length > 1 && userVisits[userId]) {
				const allPlaceArr = [...allPlaceIds];
				const currentUserVec = allPlaceArr.map((pid) => (userVisits[userId]?.has(pid) ? 1 : 0));

				Object.entries(userVisits).forEach(([uid, visited]) => {
					if (uid === userId) return;
					const vec = allPlaceArr.map((pid) => (visited.has(pid) ? 1 : 0));
					const sim = similarity.cosine(currentUserVec, vec);
					if (sim > 0) {
						visited.forEach((pid) => {
							if (!userVisits[userId]?.has(pid)) {
								cfScores.set(pid, (cfScores.get(pid) || 0) + sim);
							}
						});
					}
				});
				console.log(`CF scores calculated for ${cfScores.size} places.`);
			} else {
				console.log("Not enough data for Collaborative Filtering. Skipping.");
			}
		} catch (cfError) {
			console.error("Error during Collaborative Filtering stage:", cfError);
			// Continue without CF scores if this stage fails
		}

		/* ---------------- CB + LOCATION ---------------- */
		const placeDocs = await Place.find();
		const location = { lat, lng };
		const radiusKm = radius / 1000;

		let nearbyPlaces = placeDocs.filter((p) => {
			if (!p.location?.lat || !p.location?.lng) return false;
			return haversine(location, p.location) <= radiusKm;
		});

		console.log(`Found ${nearbyPlaces.length} places within ${radiusKm}km.`);

		if (nearbyPlaces.length < limit && nearbyPlaces.length < 20) {
			console.log("Not enough nearby places in DB. Auto-seeding from Geoapify...");
			try {
				const seeded = await seedPlaces({ lat, lng, radius, types: placeTypesPref });
				if (seeded.length > 0) {
					console.log(`Seeded ${seeded.length} new places. Re-filtering...`);
					const allPlaces = await Place.find();
					nearbyPlaces = allPlaces.filter(p => haversine(location, p.location) <= radiusKm);
					console.log(`Found ${nearbyPlaces.length} places after seeding.`);
				}
			} catch (seedError) {
				console.error("Error during auto-seeding:", seedError);
			}
		}
		
		const finalScores = new Map();
		const weightCF = cfScores.size > 0 ? 0.5 : 0;
		const weightCB = 1 - weightCF;

		for (const place of nearbyPlaces) {
			const pid = place.placeId;
			const cf = cfScores.get(pid) || 0;
			
			let cb = 0;
			if (placeTypesPref.length && place.types) {
				const matchCount = place.types.filter(t => placeTypesPref.includes(t)).length;
				cb = matchCount / placeTypesPref.length;
			}

			const score = (weightCF * cf) + (weightCB * cb) + (place.rating / 10); // Add rating bonus
			if (score > 0) {
				finalScores.set(pid, { score, place });
			}
		}
		
		let recommended = [...finalScores.values()]
			.sort((a, b) => b.score - a.score)
			.map((p) => p.place)
			.slice(0, limit);

		// Fallback if no recommendations found
		if (recommended.length === 0) {
			console.log("No recommendations from hybrid model. Falling back to top-rated nearby places.");
			recommended = nearbyPlaces
				.filter(p => matchesPreference(p, placeTypesPref))
				.sort((a, b) => (b.rating || 0) - (a.rating || 0))
				.slice(0, limit);
		}
		
		if (recommended.length === 0 && nearbyPlaces.length > 0) {
			console.log("Still no recommendations. Returning top-rated nearby places regardless of preference.");
			recommended = nearbyPlaces
				.sort((a, b) => (b.rating || 0) - (a.rating || 0))
				.slice(0, limit);
		}
		
		console.log(`Returning ${recommended.length} recommended places.`);
		return recommended;

	} catch (error) {
		console.error(`Fatal error in hybridRecommendWithLocation for user ${userId}:`, error);
		// Ultimate fallback: return any nearby places matching preferences
		try {
			const location = { lat, lng };
			const radiusKm = radius / 1000;
			const allPlaces = await Place.find();
			const nearby = allPlaces.filter(p => haversine(location, p.location) <= radiusKm);
			const user = await User.findById(userId);
			const prefs = expandPreferenceTypes(user.preferences || []);
			return nearby
				.filter(p => matchesPreference(p, prefs))
				.sort((a,b) => (b.rating || 0) - (a.rating || 0))
				.slice(0, limit);
		} catch (fallbackError) {
			console.error("Error in ultimate fallback:", fallbackError);
			return []; // Return empty if everything fails
		}
	}
};
