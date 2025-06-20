function isRelevantTouristPlace(place) {
	if (!place.rating || !place.user_ratings_total) return false;

	const name = place.name?.toLowerCase() || "";
	const types = place.types || [];

	// Special handling for malls and entertainment complexes
	if (types.includes("shopping_mall") || name.includes("mall") || name.includes("complex")) {
		// Must be a major mall with entertainment
		const mallKeywords = [
			"mall",
			"complex",
			"centre",
			"center",
			"plaza",
			"square",
			"multiplex",
			"cinema",
			"theatre",
			"theater",
			"movies",
			"entertainment",
			"fun",
			"play",
			"game",
			"arcade",
		];

		// Exclude small shops and galleries
		const mallExclusions = [
			"shop",
			"store",
			"gallery",
			"art",
			"craft",
			"handicraft",
			"boutique",
			"showroom",
			"exhibition",
			"studio",
			"workshop",
			"moorti",
			"statue",
			"sculpture",
			"painting",
			"artifacts",
		];

		// Must contain at least one mall/entertainment keyword
		if (!mallKeywords.some((keyword) => name.includes(keyword))) return false;

		// Exclude if name contains any exclusion keywords
		if (mallExclusions.some((keyword) => name.includes(keyword))) return false;

		// Must be a well-rated mall with good number of reviews
		return (
			(place.rating >= 3.8 && place.user_ratings_total >= 100) ||
			(place.rating >= 4.0 && place.user_ratings_total >= 50)
		);
	}

	// Special handling for movie theaters/cinemas
	if (types.includes("movie_theater")) {
		// Exclude photo studios and other non-cinema places
		const cinemaExclusions = [
			"photo",
			"studio",
			"photography",
			"camera",
			"portrait",
			"wedding",
			"event",
			"video",
			"recording",
			"production",
			"advertising",
			"commercial",
			"digital",
			"print",
			"graphics",
		];

		// Must contain cinema-related keywords
		const cinemaKeywords = [
			"cinema",
			"theatre",
			"theater",
			"plex",
			"multiplex",
			"movies",
			"film",
			"screen",
			"show",
			"hall",
		];

		// Exclude if name contains any exclusion keywords
		if (cinemaExclusions.some((keyword) => name.includes(keyword))) return false;

		// Must contain at least one cinema-related keyword
		if (!cinemaKeywords.some((keyword) => name.includes(keyword))) return false;

		// Relaxed criteria for cinemas
		return (
			(place.rating >= 3.5 && place.user_ratings_total >= 20) ||
			(place.rating >= 4.0 && place.user_ratings_total >= 10)
		);
	}

	// Focus on historical, cultural, and entertainment attractions
	const primaryTouristTypes = [
		// Historical & Cultural
		"tourist_attraction",
		"museum",
		"art_gallery",
		"hindu_temple",
		"church",
		"mosque",
		"monument",
		"landmark",
		"historical_landmark",
		"palace",
		"fort",
		"memorial",
		"heritage_site",
		"archaeological_site",

		// Entertainment & Recreation
		"movie_theater", // This is the correct Google Places API type
		"stadium", // Added for larger venues
		"amusement_park", // Added for entertainment
		"zoo", // Added for entertainment

		// Parks & Nature
		"park",
		"national_park",
		"wildlife_sanctuary",
		"natural_feature",
		"mountain",
		"waterfall",
		"cave",
		"beach",
		"lake",
		"river",
		"forest",
		"valley",
		"viewpoint",
		"garden",
		"botanical_garden",
	];

	// Must have at least one primary tourist type
	const hasPrimaryType = types.some((type) => primaryTouristTypes.includes(type));
	if (!hasPrimaryType) return false;

	// Exclude non-tourist keywords
	const excludedKeywords = [
		// Transportation
		"travel",
		"tour",
		"yatra",
		"transport",
		"agency",
		"agent",
		"booking",
		"ticket",
		"car",
		"taxi",
		"bus",
		"auto",
		"rental",
		"cab",
		"vehicle",
		"hire",

		// Business & Services
		"service",
		"office",
		"store",
		"shop",
		"market",
		"mall",
		"complex",
		"company",
		"limited",
		"pvt",
		"ltd",
		"private",
		"public",
		"division",
		"department",
		"center",
		"centre",
		"institute",

		// Industrial & Corporate
		"oil",
		"gas",
		"petroleum",
		"chemical",
		"industrial",
		"factory",
		"plant",
		"manufacturing",
		"production",
		"corporate",
		"business",
		"commercial",
		"research",
		"laboratory",
		"testing",
		"inspection",
		"certification",
		"training",
		"education",
		"school",
		"college",
		"university",

		// Pet & Animal Related
		"pet",
		"fish",
		"aquarium",
		"animal",
		"bird",
		"pet shop",
		"pet store",
		"veterinary",
		"vet",
		"clinic",
		"hospital",
		"care",
		"food",
		"supplies",

		// Other
		"station",
		"airport",
		"railway",
		"bus stand",
		"terminal",
		"parking",
		"rent",
		"sale",
		"property",
		"construction",
	];

	// Additional exclusions for museums
	const museumExclusions = [
		"oil",
		"gas",
		"petroleum",
		"chemical",
		"industrial",
		"factory",
		"plant",
		"manufacturing",
		"production",
		"corporate",
		"business",
		"commercial",
		"research",
		"laboratory",
		"testing",
		"inspection",
		"certification",
		"training",
		"education",
		"school",
		"college",
		"university",
		"science",
		"technology",
		"engineering",
		"medical",
		"health",
		"agriculture",
		"farming",
		"forestry",
		"mining",
		"geology",
		"archives",
		"library",
		"collection",
		"exhibition",
		"showroom",
	];

	// Check for excluded keywords in name
	if (excludedKeywords.some((keyword) => name.includes(keyword))) return false;

	// Special check for museums to ensure they are tourist attractions
	if (types.includes("museum")) {
		// Exclude specialized/industrial museums
		if (museumExclusions.some((keyword) => name.includes(keyword))) return false;

		// Must be a well-known museum with good ratings
		return (
			(place.rating >= 4.2 && place.user_ratings_total >= 100) ||
			(place.rating >= 4.5 && place.user_ratings_total >= 50)
		);
	}

	// Quality checks
	const minRating = 4.0;
	const minReviews = 50;
	const hasGoodRating = place.rating >= minRating;
	const hasEnoughReviews = place.user_ratings_total >= minReviews;
	const isPopular = place.user_ratings_total >= 200;

	// Different criteria for different types
	const isHistorical = types.some((type) =>
		[
			"art_gallery",
			"hindu_temple",
			"church",
			"mosque",
			"monument",
			"landmark",
			"historical_landmark",
			"palace",
			"fort",
			"memorial",
			"heritage_site",
			"archaeological_site",
		].includes(type)
	);

	const isEntertainment = types.some((type) =>
		["movie_theater", "stadium", "amusement_park", "zoo"].includes(type)
	);

	const isPark = types.some((type) =>
		[
			"park",
			"national_park",
			"wildlife_sanctuary",
			"natural_feature",
			"mountain",
			"waterfall",
			"cave",
			"beach",
			"lake",
			"river",
			"forest",
			"valley",
			"viewpoint",
			"garden",
			"botanical_garden",
		].includes(type)
	);

	// Stricter criteria for historical places
	if (isHistorical) {
		return (
			(place.rating >= 4.0 && place.user_ratings_total >= 75) ||
			(place.rating >= 4.3 && place.user_ratings_total >= 40)
		);
	}

	// Relaxed criteria for entertainment venues
	if (isEntertainment) {
		return (
			(place.rating >= 3.5 && place.user_ratings_total >= 20) ||
			(place.rating >= 4.0 && place.user_ratings_total >= 10)
		);
	}

	// Moderate criteria for parks
	if (isPark) {
		return (
			(place.rating >= 4.0 && place.user_ratings_total >= 50) ||
			(place.rating >= 4.2 && place.user_ratings_total >= 30)
		);
	}

	// Default criteria for other tourist attractions
	return (hasGoodRating && hasEnoughReviews) || (place.rating >= 4.2 && isPopular);
}

import axios from "axios";
import Place from "../models/place.js";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyDeL26THVRr605z_TbWT3vhqkj_97AUzTs";

const CANDIDATE_TYPES = [
	"tourist_attraction",
	"museum",
	"park",
	"zoo",
	"art_gallery",
	"amusement_park",
	"aquarium",
	"hindu_temple",
	"church",
	"mosque",
	"movie_theater", // Added movie theater type
];

const EXCLUDE_TYPES = ["lodging", "political", "establishment", "route", "street_address"];
const BAD_NAME_REGEX = /\b(apartment|apartments|house|pg|hostel|home stay|society|flat)\b/i;

// ✅ Define ACCEPTED_TYPES if you're using it in filters
const ACCEPTED_TYPES = CANDIDATE_TYPES;

const nearbySearch = async ({ lat, lng, type, radius = 8000 }) => {
	// console.log(GOOGLE_API_KEY);
	try {
		const location = `${lat},${lng}`;
		console.log("📡 Calling Google API with:", { location, type });

		const res = await axios.get(
			"https://maps.googleapis.com/maps/api/place/nearbysearch/json",
			{
				params: {
					location,
					radius,
					type,
					key: GOOGLE_API_KEY,
				},
			}
		);

		if (res.data.status !== "OK") {
			console.error("Nearby Search failed:", res.data.status);
			return [];
		}

		const filtered = res.data.results.filter((place) =>
			place.types.some((t) => ACCEPTED_TYPES.includes(t))
		);

		console.log(`✅ ${filtered.length} accepted places for type '${type}'`);
		return filtered;
	} catch (err) {
		console.error("Nearby API error:", err.message);
		return [];
	}
};

const fetchDetails = async (placeId) => {
	const { data } = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
		params: {
			place_id: placeId,
			key: GOOGLE_API_KEY,
			fields: "name,geometry,formatted_address,place_id,types,photos,rating,user_ratings_total",
		},
	});
	if (data.status !== "OK") {
		return null;
	}
	return data.result;
};

const photoFromRef = (ref) =>
	ref
		? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${ref}&key=${GOOGLE_API_KEY}`
		: null;

const streetView = (lat, lng) =>
	`https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=${GOOGLE_API_KEY}`;

const randCost = () => Math.floor(Math.random() * 300) + 50;
const randDuration = () => Math.floor(Math.random() * 180) + 30;
import { estimateCostDuration } from "../utils/costDurationEstimator.js";
export const seedPlaces = async ({ lat, lng, city = "", preferences = [] }) => {
	if (!GOOGLE_API_KEY) {
		console.error("❌ GOOGLE_API_KEY missing in .env");
		return;
	}

	console.log(`📍 Seeding around ${city || "coords"}: ${lat},${lng}`);

	// Focus on historical, cultural, and entertainment attractions
	const searchTypes = [
		"shopping_mall", // Added shopping mall type
		"movie_theater",
		"tourist_attraction",
		"amusement_park",
		"stadium",
		"zoo",
		"park",
		"national_park",
		"wildlife_sanctuary",
		"natural_feature",
		"mountain",
		"waterfall",
		"cave",
		"beach",
		"lake",
		"river",
		"forest",
		"valley",
		"viewpoint",
		"garden",
		"botanical_garden",
	];

	const queryTypes = [...preferences.filter((t) => searchTypes.includes(t)), ...searchTypes];

	const rawResults = [];

	// Different radius for different types of places
	const getRadius = (type) => {
		// Entertainment venues stay within 10km for better results
		if (["movie_theater", "stadium", "amusement_park", "zoo"].includes(type)) {
			return 10000; // 10km
		}
		// Historical and cultural places can be further away (30km)
		if (
			[
				"museum",
				"art_gallery",
				"hindu_temple",
				"church",
				"mosque",
				"monument",
				"landmark",
				"historical_landmark",
				"palace",
				"fort",
				"memorial",
				"heritage_site",
				"archaeological_site",
			].includes(type)
		) {
			return 30000; // 30km
		}
		// Natural attractions can also be further away (30km)
		if (
			[
				"national_park",
				"wildlife_sanctuary",
				"natural_feature",
				"mountain",
				"waterfall",
				"cave",
				"beach",
				"lake",
				"river",
				"forest",
			].includes(type)
		) {
			return 30000; // 30km
		}
		// Parks stay within 15km
		return 15000; // 15km
	};

	for (const type of queryTypes) {
		const radius = getRadius(type);
		const chunk = await nearbySearch({ lat, lng, type, radius });
		rawResults.push(...chunk);
		if (rawResults.length > 150) break;
	}

	console.log(`📊 Google returned ${rawResults.length} raw results`);

	const uniqueMap = new Map();
	rawResults.forEach((p) => uniqueMap.set(p.place_id, p));
	const unique = Array.from(uniqueMap.values());

	console.log(`🔁 Unique places after deduplication: ${unique.length}`);

	// Filter for quality tourist places
	const quality = unique.filter((p) => {
		if (!isRelevantTouristPlace(p)) return false;

		const name = p.name?.toLowerCase() || "";
		const types = p.types || [];

		// Additional name-based exclusions
		const nameExclusions = [
			"office",
			"station",
			"railway",
			"bus",
			"taxi",
			"car",
			"rental",
			"travel",
			"tour",
			"yatra",
			"transport",
			"agency",
			"agent",
			"service",
			"store",
			"shop",
			"market",
			"complex",
			"company",
			"limited",
			"pvt",
			"ltd",
			"private",
			"public",
			"pet",
			"fish",
			"aquarium",
			"animal",
			"bird",
			"pet shop",
			"pet store",
			"veterinary",
			"vet",
			"clinic",
			"hospital",
			"care",
			"food",
			"supplies",
			"photo",
			"studio",
			"photography",
			"camera",
			"portrait",
			"wedding",
			"event",
			"video",
			"recording",
			"production",
			"advertising",
			"commercial",
			"digital",
			"print",
			"graphics",
			"art",
			"gallery",
			"craft",
			"handicraft",
			"boutique",
			"showroom",
			"exhibition",
			"studio",
			"workshop",
			"moorti",
			"statue",
			"sculpture",
			"painting",
			"artifacts",
			"affair",
			"bhandar",
		];

		if (nameExclusions.some((word) => name.includes(word))) return false;

		// Exclude non-tourist types
		const nonTouristTypes = [
			"establishment",
			"point_of_interest",
			"political",
			"travel_agency",
			"car_rental",
			"taxi_stand",
			"bus_station",
			"finance",
			"insurance_agency",
			"real_estate_agency",
			"school",
			"university",
			"library",
			"post_office",
			"bank",
			"atm",
			"car_dealer",
			"car_repair",
			"car_wash",
			"gas_station",
			"parking",
			"storage",
			"moving_company",
			"plumber",
			"electrician",
			"locksmith",
			"roofing_contractor",
			"painter",
			"general_contractor",
			"home_goods_store",
			"hardware_store",
			"garden_center",
			"pet_store",
			"book_store",
			"jewelry_store",
			"shoe_store",
			"clothing_store",
			"convenience_store",
			"department_store",
			"electronics_store",
			"furniture_store",
			"grocery_or_supermarket",
			"liquor_store",
		];

		if (types.every((type) => nonTouristTypes.includes(type))) return false;

		return true;
	});

	console.log(`✨ Passed quality filter: ${quality.length}`);

	// Sort by rating and review count
	quality.sort(
		(a, b) =>
			(b.rating ?? 0) * Math.log(b.user_ratings_total ?? 1) -
			(a.rating ?? 0) * Math.log(a.user_ratings_total ?? 1)
	);

	const top = quality.slice(0, 50);
	console.log(`🔎 Final top candidates: ${top.length}`);

	for (const stub of top) {
		const details = await fetchDetails(stub.place_id);
		if (!details) continue;

		let photoUrl = photoFromRef(details.photos?.[0]?.photo_reference);
		if (!photoUrl) {
			photoUrl = streetView(details.geometry.location.lat, details.geometry.location.lng);
		}
		const { cost, duration } = estimateCostDuration(details.types);
		// console.log("cost and duraiton = ", cost, duration);
		const doc = {
			placeId: details.place_id,
			name: details.name,
			types: details.types,
			rating: details.rating ?? 0,
			address: details.formatted_address,
			location: {
				lat: details.geometry.location.lat,
				lng: details.geometry.location.lng,
			},
			photoUrl,
			cost: cost,
			duration: duration,
		};

		try {
			await Place.updateOne({ placeId: doc.placeId }, doc, { upsert: true });
			console.log(`✅ Saved: ${doc.name}`);
		} catch (err) {
			console.error(`❌ DB save error for ${doc.name}:`, err.message);
		}
	}
};
