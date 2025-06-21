import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import recommendationRoute from "./routes/recommendationRoute.js";
import tourPlanRoute from "./routes/tourPlanRoute.js";
import recommendRoute from "./routes/recommendRoute.js";
import placesRoutes from "./routes/placesRoutes.js";
import planRoutes from "./routes/planRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5002;

// Verify environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) {
	console.error("❌ GOOGLE_MAPS_API_KEY is not set in .env file");
	process.exit(1);
}
console.log("✅ Google Maps API key is configured");

const allowedOrigins = [
	"http://localhost:3000",
	"https://tour-recommendation-frontend.onrender.com", // React default
	"http://localhost:3005", // Your current frontend port
	// Add any other origins you use
];

app.use(express.json());
app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
);

// Serve frontend
app.use(express.static(path.join(__dirname, "..", "..", "frontend", "build")));

app.use("/api/auth", authRouter);
app.use("/api/tour-plan", tourPlanRoute);
app.use("/api/recommend", recommendRoute);
// app.use("/api/recommend", recommendationRoute); // This creates a route conflict and should be mounted elsewhere if needed
app.use("/api/places", placesRoutes);
app.use("/api/plan", planRoutes);

app.get("*", (req, res) => {
	res.sendFile(
		path.resolve(__dirname, "..", "..", "frontend", "build", "index.html")
	);
});

await connectDB();
app.listen(PORT, () => {
	console.log("server started on port :", PORT);
});
