/* ─ helpers/photoHelper.js ───────────────────────────────────── */
import axios from "axios";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const UNSPLASH_KEY = process.env.UNSPLASH_KEY;
// console.log(UNSPLASH_KEY);
/**
 * Get image URL from Wikidata entity (P18 → file on Wikimedia Commons)
 */
export const wikidataImage = async (wikidataId) => {
	if (!wikidataId) return null;
	try {
		const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;
		const { data } = await axios.get(url);
		const entity = data.entities[wikidataId];
		const imageName = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
		if (!imageName) return null;

		// Commons image URL
		const commonsFile = encodeURIComponent(imageName.replace(/ /g, "_"));
		return `https://commons.wikimedia.org/wiki/Special:FilePath/${commonsFile}`;
	} catch {
		return null;
	}
};

/**
 * Get first Unsplash photo for a place name
 */
export const unsplashImage = async (query) => {
	if (!UNSPLASH_KEY) return null;
	try {
		const url = `https://api.unsplash.com/search/photos?page=1&per_page=1&query=${encodeURIComponent(
			query
		)}&client_id=${UNSPLASH_KEY}`;
		const { data } = await axios.get(url);
		return data.results?.[0]?.urls?.regular || null;
	} catch {
		return null;
	}
};
