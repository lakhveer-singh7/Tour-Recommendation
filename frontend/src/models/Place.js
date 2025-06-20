import mongoose from "mongoose";

const PlaceSchema = new mongoose.Schema({
	placeId: { type: String, unique: true },
	name: String,
	types: [String],
	rating: Number,
	address: String,
	location: { lat: Number, lng: Number },
	photoUrl: String,
	cost: Number,
	duration: Number,
});

// ✅ Fix for OverwriteModelError
export default mongoose.models.Place || mongoose.model("Place", PlaceSchema);
