export const buildRecommendations = (currentId, users) => {
	const me = users.find((u) => u._id.equals(currentId));
	if (!me) return new Map();
	const my = new Set(me.visitedPlaceIds);
	const scores = new Map();
	for (const u of users) {
		if (u._id.equals(currentId)) continue;
		const their = new Set(u.visitedPlaceIds);
		const inter = [...my].filter((x) => their.has(x)).length;
		const union = new Set([...my, ...their]).size;
		const sim = union ? inter / union : 0;
		if (!sim) continue;
		their.forEach((pid) => {
			if (!my.has(pid)) scores.set(pid, (scores.get(pid) || 0) + sim);
		});
	}
	return scores;
};
