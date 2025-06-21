import Place from "../models/Place.js";

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
	try {
		// Try to get places from database, but don't fail if not found
		const placeIds = selectedPlaces.map((p) => p.place);
		const places = await Place.find({
			placeId: { $in: placeIds },
		});

		const unvisited = [...selectedPlaces];
		const sorted = [];

		let current = sourceLocation.location || sourceLocation;

		while (unvisited.length > 0) {
			let nearestIndex = -1;
			let nearestDist = Infinity;

			for (let i = 0; i < unvisited.length; i++) {
				const place = places.find((p) => p.placeId === unvisited[i].place);
				let placeLocation;
				
				// Try to get location from database first, then from selectedPlaces
				if (place && place.location) {
					placeLocation = place.location;
				} else if (unvisited[i].location) {
					placeLocation = unvisited[i].location;
				} else {
					// Skip places without location data
					continue;
				}
				
				const dist = haversine(current, placeLocation);
				if (dist < nearestDist) {
					nearestDist = dist;
					nearestIndex = i;
				}
			}

			if (nearestIndex === -1) {
				// If no valid place found, just add the remaining places in order
				sorted.push(...unvisited);
				break;
			}

			sorted.push(unvisited[nearestIndex]);
			const nextPlace = places.find((p) => p.placeId === unvisited[nearestIndex].place);
			if (nextPlace && nextPlace.location) {
				current = nextPlace.location;
			} else if (unvisited[nearestIndex].location) {
				current = unvisited[nearestIndex].location;
			}
			unvisited.splice(nearestIndex, 1);
		}

		return sorted;
	} catch (error) {
		console.error("TSP sorting error:", error);
		// Return original order if TSP fails
		return selectedPlaces;
	}
};
