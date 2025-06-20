import axios from "axios";
// import Place from "../models/Place.js";
import { estimateCostDuration } from "../utils/costDurationEstimator.js";

const KEY = process.env.GOOGLE_MAPS_API_KEY;
const DETAILS = "https://maps.googleapis.com/maps/api/place/details/json";
const PHOTO = "https://maps.googleapis.com/maps/api/place/photo";

export const fetchPlace = async (placeId) => {
	try {
		let doc = await Place.findOne({ placeId }).lean();
		if (doc) {
			console.log(`Place ${placeId} found in database`);
			return doc;
		}

		console.log(`Fetching details for place ${placeId}...`);
		const url = `${DETAILS}?place_id=${placeId}&fields=place_id,name,geometry,formatted_address,rating,types,photos&key=${KEY}`;

		const { data } = await axios.get(url);

		if (data.status !== "OK") {
			console.error(`Error fetching place ${placeId}:`, data.status, data.error_message);
			if (data.status === "REQUEST_DENIED") {
				console.error("API Key validation failed. Please check:");
				console.error("1. API key is correctly set in .env");
				console.error("2. Places API is enabled in Google Cloud Console");
				console.error("3. Billing is enabled for the project");
				console.error("4. API key has no restrictions or has correct restrictions");
			}
			throw new Error(data.status);
		}

		const p = data.result;
		const ref = p.photos?.[0]?.photo_reference;
		doc = {
			placeId: p.place_id,
			name: p.name,
			address: p.formatted_address,
			rating: p.rating ?? 4,
			types: p.types,
			location: { lat: p.geometry.location.lat, lng: p.geometry.location.lng },
			photoUrl: ref ? `${PHOTO}?maxwidth=800&photo_reference=${ref}&key=${KEY}` : null,
			...estimateCostDuration(p.types),
		};

		console.log(`Saving place ${placeId} to database...`);
		await Place.create(doc);
		console.log(`Successfully saved place ${placeId}`);
		return doc;
	} catch (err) {
		console.error(`Failed to fetch/save place ${placeId}:`, err.message);
		if (err.response) {
			console.error("API Response:", err.response.data);
		}
		throw err;
	}
};
