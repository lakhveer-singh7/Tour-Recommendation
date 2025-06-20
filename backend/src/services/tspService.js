import Place from "../models/place.js";

// Haversine formula
const haversine = (a, b) => {
	const R = 6371; // km
	const toRad = (deg) => (deg * Math.PI) / 180;
	const dLat = toRad(b.lat - a.lat);
	const dLon = toRad(b.lng - a.lng);
	const lat1 = toRad(a.lat);
	const lat2 = toRad(b.lat);

	const aComp =
		Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

	return R * 2 * Math.atan2(Math.sqrt(aComp), Math.sqrt(1 - aComp));
};

/**
 * Sort places using Nearest Neighbor TSP
 */
export const sortPlacesTSP = async (sourceLocation, selectedPlaces) => {
	const places = await Place.find({
		placeId: { $in: selectedPlaces.map((p) => p.place) },
	});

	const unvisited = [...selectedPlaces];
	const sorted = [];

	let current = sourceLocation;

	while (unvisited.length > 0) {
		let nearestIndex = 0;
		let nearestDist = Infinity;

		for (let i = 0; i < unvisited.length; i++) {
			const place = places.find((p) => p.placeId === unvisited[i].place);
			if (!place) continue;
			const dist = haversine(current, place.location);
			if (dist < nearestDist) {
				nearestDist = dist;
				nearestIndex = i;
			}
		}

		sorted.push(unvisited[nearestIndex]);
		const nextPlace = places.find((p) => p.placeId === unvisited[nearestIndex].place);
		current = nextPlace.location;
		unvisited.splice(nearestIndex, 1);
	}

	return sorted;
};
