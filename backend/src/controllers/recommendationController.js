import User from "../models/User.js";
import Place from "../models/Place.js";
import { buildRecommendations } from "../utils/collaborativeFilter.js";
import { fetchPlace } from "../services/googlePlaceService.js";

export const recommendPlacesForUser = async (req, res) => {
	try {
		const id = req.params.userId;
		const limit = parseInt(req.query.limit) || 15;
		const city = (req.query.city || "").toLowerCase();

		const me = await User.findById(id).lean();
		if (!me) return res.status(404).json({ message: "User not found" });

		// If user has no preferences, set some defaults
		if (!me.preferences || me.preferences.length === 0) {
			me.preferences = ["tourist_attraction", "museum", "park"];
			await User.findByIdAndUpdate(id, { preferences: me.preferences });
		}

		const users = await User.find({}, { visitedPlaceIds: 1 }).lean();
		const cfPossible = users.length > 1 && me.visitedPlaceIds?.length > 0;
		let rec = [];

		if (cfPossible) {
			const scores = buildRecommendations(id, users);
			const topIds = [...scores.entries()]
				.sort((a, b) => b[1] - a[1])
				.slice(0, 100)
				.map(([p]) => p);
			const docs = await Promise.all(topIds.map((pid) => fetchPlace(pid).catch(() => null)));
			rec = docs
				.filter(Boolean)
				.filter((p) => !city || p.address.toLowerCase().includes(city))
				.map((p) => ({ ...p, relevanceScore: +scores.get(p.placeId).toFixed(3) }));
		}

		if (!rec.length) {
			// Try to find places based on user preferences
			rec = await Place.find({
				types: { $in: me.preferences },
				...(city && { address: { $regex: city, $options: "i" } }),
			})
				.sort({ rating: -1 })
				.limit(limit)
				.lean();

			// If still no results, get top-rated places regardless of preferences
			if (!rec.length) {
				rec = await Place.find(city ? { address: { $regex: city, $options: "i" } } : {})
					.sort({ rating: -1 })
					.limit(limit)
					.lean();
			}

			return res.json({ fallback: true, data: rec });
		}

		rec.sort((a, b) => b.relevanceScore - a.relevanceScore);
		res.json({ fallback: false, data: rec.slice(0, limit) });
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: "Failed", error: e.message });
	}
};
