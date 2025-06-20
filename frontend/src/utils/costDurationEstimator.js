export const estimateCostDuration = (types = []) => {
	const t = (types[0] || "other").toLowerCase();

	const lookup = {
		restaurant: { c: [200, 800], d: [60, 90] },
		cafe: { c: [150, 400], d: [40, 60] },
		museum: { c: [50, 200], d: [90, 120] },
		temple: { c: [0, 30], d: [30, 45] },
		church: { c: [0, 30], d: [30, 45] },
		park: { c: [0, 50], d: [45, 60] },
		zoo: { c: [100, 300], d: [90, 120] },
		shopping_mall: { c: [300, 1000], d: [90, 180] },
		tourist_attraction: { c: [100, 500], d: [60, 120] },
		other: { c: [100, 300], d: [60, 90] },
	};

	const entry = lookup[t] || lookup["other"];
	const rnd = ([a, b]) => Math.floor(Math.random() * (b - a + 1) + a);

	return {
		cost: rnd(entry.c),
		duration: rnd(entry.d),
	};
};
