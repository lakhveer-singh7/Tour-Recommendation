import Plan from "../models/plan.js";
import Place from "../models/place.js";
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
	const user = await User.findById(userId);
	if (!user) throw new Error("User not found");

	const placeTypesPref = expandPreferenceTypes(user.preferences || []);

	/* ---------------- CF PREP ---------------- */
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

	/* ---------------- CB + LOCATION ---------------- */
	const placeDocs = await Place.find();
	const cbScores = new Map();
	const location = { lat, lng };

	// Convert radius from meters to kilometers
	const radiusKm = radius / 1000;

	let nearbyPlaces = placeDocs.filter((p) => {
		if (!p.location || !p.placeId) {
			console.error('Skipping place with missing location or placeId:', p);
			return false;
		}
		return haversine(location, p.location) <= radiusKm;
	});

	console.log('Nearby places count:', nearbyPlaces.length, 'for radius', radiusKm, 'km');

	// If no places found, try to seed new places
	if (nearbyPlaces.length === 0) {
		console.log("🌍 Auto‑seeding new city from Geoapify…");
		// Check for Google API key
		if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY === "no") {
			throw new Error("Google Maps API key is missing. Cannot seed new places.");
		}
		try {
			const seeded = await seedPlaces({
				lat,
				lng,
				city: user.location?.city || "Unknown",
				preferences: user.preferences || [],
			});
			if (Array.isArray(seeded) && seeded.length > 0) {
				nearbyPlaces = seeded;
			} else {
				throw new Error("No places found via seeding. Please try a different location or check your API key.");
			}
		} catch (error) {
			throw new Error(`Auto-seed failed: ${error.message}`);
		}
	}

	for (const place of nearbyPlaces) {
		if (!place.placeId || !place.types) {
			console.error('Skipping place in scoring with missing placeId or types:', place);
			continue;
		}
		let score = 0;
		const match = place.types.filter((t) => placeTypesPref.includes(t));
		score = match.length / placeTypesPref.length;
		cbScores.set(place.placeId, score);
	}

	/* ---------------- Combine scores ---------------- */
	const finalScores = new Map();
	const hasHistory = !!userVisits[userId]?.size;
	const weightCF = hasHistory ? 0.7 : 0; // cold‑start: ignore CF
	const weightCB = hasHistory ? 0.3 : 1; // rely fully on CB if no history

	for (const place of nearbyPlaces) {
		if (!place.placeId) continue;
		const pid = place.placeId;
		const cf = cfScores.get(pid) || 0;
		const cb = cbScores.get(pid) || 0;
		const score = weightCF * cf + weightCB * cb;
		if (score > 0) finalScores.set(pid, { score, place });
	}

	let ranked =
		finalScores.size > 0
			? [...finalScores.values()].sort((a, b) => b.score - a.score)
			: nearbyPlaces
					.map((p) => ({ place: p, rating: p.rating || 0 }))
					.sort((a, b) => b.rating - a.rating);

	let filteredRanked =
		ranked
			.map((x) => x.place)
			.filter((place) => place && place.placeId && place.types && (placeTypesPref.length === 0 || matchesPreference(place, placeTypesPref)));

	if (filteredRanked.length === 0) {
		throw new Error("No recommended places found for this area. Try expanding your search radius or check your preferences/API key.");
	}

	return filteredRanked.slice(0, limit);
};
