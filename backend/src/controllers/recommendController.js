import { hybridRecommend, hybridRecommendWithLocation } from "../services/cfService.js";
import User from "../models/User.js";

// GET /api/recommend/hybrid
export const getHybridRecommendations = async (req, res) => {
	const limit = parseInt(req.query.limit) || 5;

	try {
		if (!req.user || !req.user.userId) {
			console.error('Authentication error: No user ID found in request token.');
			return res.status(401).json({ message: 'Authentication error: Invalid token.' });
		}

		console.log('Hybrid recommendation request for user:', req.user?.userId);
		const user = await User.findById(req.user.userId);
		if (!user) {
			console.error('User not found:', req.user.userId);
			return res.status(404).json({ message: 'User not found' });
		}
		const recommended = await hybridRecommend(req.user.userId, limit);
		console.log('Recommended places:', recommended);
		res.json({ recommended });
	} catch (err) {
		console.error('Hybrid recommendation failed:', err);
		res.status(500).json({
			message: "Hybrid recommendation failed",
			error: err.message,
			stack: err.stack,
		});
	}
};

// GET /api/recommend/hybrid/location?lat=&lng=&radius=&limit=
export const getHybridLocationRecommendations = async (req, res) => {
	let { lat, lng, radius = 5000, limit = 5 } = req.query;

	try {
		// 🌍 If lat/lng not provided, try to use from user profile
		if (!lat || !lng) {
			const user = await User.findById(req.user.userId);

			if (user?.location?.lat && user?.location?.lng) {
				lat = user.location.lat;
				lng = user.location.lng;
				console.log("📍 Using user's stored location:", lat, lng);
			} else {
				return res.status(400).json({
					message: "lat and lng are required or user must have a saved location",
				});
			}
		}

		const recommended = await hybridRecommendWithLocation({
			userId: req.user.userId,
			lat: parseFloat(lat),
			lng: parseFloat(lng),
			radius: parseInt(radius),
			limit: parseInt(limit),
		});

		res.json({ recommended });
	} catch (err) {
		res.status(500).json({
			message: "Hybrid + location recommendation failed",
			error: err.message,
		});
	}
};
