import express from "express";
import { recommendPlacesForUser } from "../controllers/recommendationController.js";
const r = express.Router();
r.get("/:userId", recommendPlacesForUser);
export default r;
