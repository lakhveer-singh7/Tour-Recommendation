// routes/placeRoutes.js
import express from "express";
import {
	searchPlaces,
	getPlaceDetails,
	getSavedPlaces,
	savePlace,
} from "../controllers/placeController.js";

const router = express.Router();

router.get("/search", searchPlaces); // text or nearby
router.get("/nearby", searchPlaces); // alias (optional)
router.get("/details/:placeId", getPlaceDetails);
router.get("/saved", getSavedPlaces);
router.post("/save", savePlace);

export default router;
