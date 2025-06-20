import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

/// controllers/authController.js
import axios from "axios";
import geoip from "geoip-lite";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import { seedPlaces } from "../services/seedHelper.js";

const GOOGLE_KEY = process.env.GOOGLE_API_KEY; //  <-- be sure .env has this
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

/**
 * POST /api/auth/register
 * Body: { name, email, password, preferences?, location? }
 */
export const registerUser = async (req, res) => {
	try {
		const { name, email, password, preferences = [], location: bodyLoc } = req.body;
		const passwordHash = await bcrypt.hash(password, 10);

		/* 1️⃣  Rough coordinates  */
		let loc = bodyLoc; // { lat, lng, city? }

		if (!loc) {
			const rawIp = req.headers["x-forwarded-for"] || req.ip;
			const ip = rawIp.split(",")[0].trim();
			const geo = geoip.lookup(ip);

			if (geo?.ll) {
				loc = { lat: geo.ll[0], lng: geo.ll[1] };
				console.log("🌐 GeoIP coords:", loc);
			} else {
				loc = { lat: 28.6315, lng: 77.2167 }; // Connaught Place fallback
				console.warn("⚠️ GeoIP failed. Using Delhi default.");
			}
		}

		/* 2️⃣  Reverse‑geocode city name */
		if (!loc.city) {
			try {
				const { data } = await axios.get(GEOCODE_URL, {
					params: { latlng: `${loc.lat},${loc.lng}`, key: GOOGLE_KEY },
				});

				const comps = data.results?.[0]?.address_components ?? [];
				const cityObj =
					comps.find((c) => c.types.includes("locality")) ||
					comps.find((c) => c.types.includes("administrative_area_level_2")) ||
					comps.find((c) => c.types.includes("administrative_area_level_1"));

				loc.city = cityObj?.long_name || "Unknown";
			} catch (e) {
				console.error("🗺️ Geocode error:", e.response?.data?.error_message || e.message);
				loc.city = "Unknown";
			}
		}

		/* 3️⃣  Save user */
		const user = await User.create({
			name,
			email,
			passwordHash,
			preferences,
			location: loc,
		});
		console.log(loc);
		/* 4️⃣  Seed POIs (non‑blocking) */
		seedPlaces({
			lat: loc.lat,
			lng: loc.lng,
			city: loc.city || "Unknown",
			preferences,
		}).catch((err) => console.error("Seed error:", err.message));

		res.status(201).json({ message: "User registered", userId: user._id });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Registration failed", error: err.message });
	}
};

// Login
export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found." });

		const isMatch = await bcrypt.compare(password, user.passwordHash);
		if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

		const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
			expiresIn: "7d",
		});

		res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err.message });
	}
};

// Get user profile
export const getUserProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select("-password");
		if (!user) return res.status(404).json({ message: "User not found." });
		res.json(user);
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err.message });
	}
};

// Update user profile
export const updateUserProfile = async (req, res) => {
	const { name, preferences } = req.body;

	try {
		const user = await User.findByIdAndUpdate(
			req.user.userId,
			{ name, preferences },
			{ new: true }
		).select("-password");

		res.json(user);
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err.message });
	}
};

// Change password
export const changePassword = async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	try {
		const user = await User.findById(req.user.userId);
		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) return res.status(401).json({ message: "Current password is incorrect." });

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		res.json({ message: "Password updated successfully." });
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err.message });
	}
};
