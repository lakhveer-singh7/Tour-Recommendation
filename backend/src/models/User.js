import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
	name: String,
	email: { type: String, unique: true },
	passwordHash: String,
	preferences: [String],
	visitedPlaceIds: [String],
});
export default mongoose.models.User || mongoose.model("User", UserSchema);
