import axios from "axios";

const GEO_KEY = process.env.GEOAPIFY_API_KEY;
const BASE = "https://api.geoapify.com/v2/places";

/* ─────────────────────────────────────────────────────────────── */
/* 🔍 1. Text Search: /search?q=temples in goa                     */
/* ─────────────────────────────────────────────────────────────── */
export const googleTextSearch = async (query, limit = 20) => {
	const url = `${BASE}?filter=text:${encodeURIComponent(query)}&limit=${limit}&apiKey=${GEO_KEY}`;
	const { data } = await axios.get(url);
	return formatGeoapifyResults(data.features);
};

/* ─────────────────────────────────────────────────────────────── */
/* 🌍 2. Nearby Search: lat, lng, radius, type                    */
/* ─────────────────────────────────────────────────────────────── */
export const googleNearbySearch = async ({ lat, lng, radius = 5000, type, limit = 20 }) => {
	const categories = type ? mapTypeToCategory(type) : "tourism.sights";
	const url = `${BASE}?categories=${categories}&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=${limit}&apiKey=${GEO_KEY}`;
	const { data } = await axios.get(url);
	return formatGeoapifyResults(data.features);
};

/* ─────────────────────────────────────────────────────────────── */
/* 🧾 3. Place Details: /places/details/:placeId                 */
/* ─────────────────────────────────────────────────────────────── */
export const googleDetails = async (placeId) => {
	const url = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${GEO_KEY}`;
	const { data } = await axios.get(url);

	if (!data?.features?.length) {
		throw new Error("Place not found");
	}

	return formatGeoapifyFeature(data.features[0]);
};

/* ─────────────────────────────────────────────────────────────── */
/* 🔧 Format multiple features                                    */
/* ─────────────────────────────────────────────────────────────── */
const formatGeoapifyResults = (features = []) => features.map(formatGeoapifyFeature);

/* 🔧 Format single feature                                       */
const formatGeoapifyFeature = (f) => {
	const p = f.properties;
	return {
		placeId: p.place_id,
		name: p.name || "Unnamed Place",
		location: {
			lat: f.geometry.coordinates[1],
			lng: f.geometry.coordinates[0],
		},
		types: p.categories || ["unknown"],
		rating: p.rank?.popularity
			? parseFloat((p.rank.popularity / 10).toFixed(1)) // Convert 0–100 to 0–10
			: Math.random() * 2 + 3, // fallback 3–5
		address: p.address_line2 || p.address_line1 || p.city || "Unknown",
		photoUrl: null, // Geoapify free plan doesn't offer photos
	};
};

/* 🔄 Google Type → Geoapify Category                            */
const mapTypeToCategory = (type) => {
	const mapping = {
		restaurant: "catering.restaurant",
		park: "leisure.park",
		museum: "tourism.museum",
		cafe: "catering.cafe",
		shopping_mall: "commercial.shopping_mall",
		tourist_attraction: "tourism.sights",
		zoo: "entertainment.zoo",
	};
	return mapping[type] || "tourism.sights";
};
