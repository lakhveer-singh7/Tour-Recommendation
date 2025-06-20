import axios from "axios";
import { tspGreedy, haversine } from "../utils/tspGreedy.js";
const KEY = process.env.GOOGLE_MAPS_API_KEY;
const DIR = "https://maps.googleapis.com/maps/api/directions/json";

export const googleOptimize = async (origin, places, dest = origin) => {
	const w = places.map((p) => `${p.location.lat},${p.location.lng}`).join("|");
	const url = `${DIR}?origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&waypoints=optimize:true|${w}&key=${KEY}`;
	const { data } = await axios.get(url);
	if (data.status !== "OK") throw new Error(data.status);

	const order = data.routes[0].waypoint_order;
	const legs = data.routes[0].legs;
	const reordered = order.map((i) => places[i]);
	const travelSec = legs.slice(0, reordered.length).map((l) => l.duration.value);
	return { reordered, travelSec };
};

export const fallbackOptimize = (origin, places) => {
	const sorted = tspGreedy([origin, ...places]).slice(1);
	const travelSec = [];
	let prev = origin;
	for (const p of sorted) {
		const km = haversine(prev.location, p.location);
		travelSec.push(Math.round((km / 40) * 3600 * 1.1));
		prev = p;
	}
	return { reordered: sorted, travelSec };
};

// Calculate travel time for a fixed order (non-optimized)
export const travelTimeForOrder = (origin, places) => {
	const travelSec = [];
	let prev = origin.location || origin; // Handle both {location: {lat, lng}} and {lat, lng} formats
	for (const p of places) {
		const km = haversine(prev, p.location);
		travelSec.push(Math.round((km / 40) * 3600 * 1.1));
		prev = p.location;
	}
	return { reordered: places, travelSec };
};
