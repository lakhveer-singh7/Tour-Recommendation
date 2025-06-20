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
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_KEY = process.env.GOOGLE_API_KEY; //  <-- be sure .env has this
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// Google Sign-In: Verify token and login/register user
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID_WEB || process.env.REACT_APP_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/register
 * Body: { name, email, password, preferences?, location? }
 */
export const registerUser = async (req, res) => {
	try {
		const { name, email, password, preferences = [], location: bodyLoc } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ 
				message: "Email already registered. Please use a different email or try logging in." 
			});
		}

		const passwordHash = await bcrypt.hash(password, 10);

		/* 1️⃣  Rough coordinates  */
		let loc = bodyLoc; // { lat, lng, city? }

		if (!loc) {
			const rawIp = req.headers["x-forwarded-for"] || req.ip;
			const ip = rawIp.split(",")[0].trim();
			const geo = geoip.lookup(ip);

			if (geo?.ll) {
				loc = { lat: geo.ll[0], lng: geo.ll[1] };
				console.log("🌐 GeoIP coords:", loc);
			} else {
				loc = { lat: 28.6315, lng: 77.2167 }; // Connaught Place fallback
				console.warn("⚠️ GeoIP failed. Using Delhi default.");
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
				console.error("🗺️ Geocode error:", e.response?.data?.error_message || e.message);
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

		res.status(201).json({ message: "User registered successfully", userId: user._id });
	} catch (err) {
		console.error("Registration error:", err);
		if (err.code === 11000) {
			res.status(400).json({ 
				message: "Email already registered. Please use a different email or try logging in." 
			});
		} else {
			res.status(500).json({ 
				message: "Registration failed", 
				error: err.message 
			});
		}
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
		const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
		if (!isMatch) return res.status(401).json({ message: "Current password is incorrect." });

		user.passwordHash = await bcrypt.hash(newPassword, 10);
		await user.save();

		res.json({ message: "Password updated successfully." });
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err.message });
	}
};

// Add this at the end of the file
export const getAllUsers = async (req, res) => {
	try {
		const users = await User.find({}, '-passwordHash');
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch users', error: err.message });
	}
};

// Google Sign-In: Verify token and login/register user
export const verifyGoogleToken = async (req, res) => {
	try {
		const { credential } = req.body;
		console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
		console.log('Credential received:', typeof credential, credential ? credential.substring(0, 20) + '...' : credential);
		if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

		// Verify Google ID token
		const ticket = await googleClient.verifyIdToken({
			idToken: credential,
			audience: GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		if (!payload?.email) return res.status(400).json({ message: 'Invalid Google token' });

		// Find or create user
		let user = await User.findOne({ email: payload.email });
		let isNewUser = false;
		if (!user) {
			user = await User.create({
				name: payload.name,
				email: payload.email,
				passwordHash: '', // No password for Google users
				preferences: [],
			});
			isNewUser = true;
		}

		// Issue JWT
		const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
		res.json({ user: { id: user._id, name: user.name, email: user.email }, token, isNewUser });
	} catch (err) {
		console.error('Error in verifyGoogleToken:', err, err.stack);
		res.status(500).json({ message: 'Google sign-in failed', error: err.message, stack: err.stack });
	}
};
