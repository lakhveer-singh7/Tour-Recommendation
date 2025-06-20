// models/Plan.js
import mongoose from "mongoose";
const PlanSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		sourceLocation: { lat: Number, lng: Number },
		selectedPlaces: [
			{
				place: { type: String, ref: "Place" }, // placeId ref
				cost: Number,
				duration: Number,
				legTravelSec: Number,
				arrivalSec: Number,
			},
		],
		totalTime: Number, // minutes
		isSorted: Boolean,
		summary: String,
		savedLocation: {
			state: String,
			city: String
		},
	},
	{ timestamps: true }
);
export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
