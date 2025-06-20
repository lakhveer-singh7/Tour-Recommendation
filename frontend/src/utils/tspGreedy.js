export const haversine = (a, b) => {
	const R = 6371,
		rad = (d) => (d * Math.PI) / 180;
	const dLat = rad(b.lat - a.lat);
	const dLon = rad(b.lng - a.lng);
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const tspGreedy = (arr) => {
	if (arr.length <= 2) return arr;
	const visited = new Set([arr[0].placeId]);
	const route = [arr[0]];
	let cur = arr[0];
	while (route.length < arr.length) {
		let best,
			dist = Infinity;
		for (const n of arr)
			if (!visited.has(n.placeId)) {
				const d = haversine(cur.location, n.location);
				if (d < dist) {
					dist = d;
					best = n;
				}
			}
		route.push(best);
		visited.add(best.placeId);
		cur = best;
	}
	return route;
};
