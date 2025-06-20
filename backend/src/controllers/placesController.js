import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Debug logging
console.log('Environment variables loaded');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Helper to calculate distance between two lat/lng points in kilometers (Haversine formula)
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Helper to map user preferences to Google Place Types
const mapPreferencesToGooglePlaceTypes = (preferences) => {
    const typeMap = {
        'museum': ['museum'],
        'park': ['park'],
        'temple': ['church', 'hindu_temple', 'mosque', 'synagogue', 'place_of_worship'],
        'monument': ['tourist_attraction', 'point_of_interest', 'landmark'],
        'shopping': ['shopping_mall', 'store', 'supermarket', 'department_store'],
        'food': ['restaurant', 'cafe', 'bakery', 'food', 'meal_takeaway'],
        'hotel': ['lodging'], // For hotels
        'cinema': ['movie_theater'], // For cinema halls
        'nightlife': ['night_club', 'bar'],
        'art': ['art_gallery'],
        'zoo': ['zoo'],
        'amusement_park': ['amusement_park'],
        'aquarium': ['aquarium'],
        'stadium': ['stadium'],
        'university': ['university'],
        'library': ['library'],
        'spa': ['spa'],
    };

    const types = new Set();
    preferences.forEach(pref => {
        if (typeMap[pref]) {
            typeMap[pref].forEach(type => types.add(type));
        }
    });

    // If no specific preferences are selected, or to always include general tourist places,
    // add a baseline set of general tourist types.
    if (types.size === 0) {
        types.add('tourist_attraction');
        types.add('point_of_interest');
        types.add('lodging');
        types.add('restaurant');
        types.add('shopping_mall');
        types.add('movie_theater');
        types.add('park');
        types.add('museum');
        types.add('art_gallery');
        types.add('zoo');
    }

    return Array.from(types);
};

export const getNearbyPlaces = async (req, res) => {
    const { latitude, longitude, radius, preferences, minUserRatings } = req.query;

    console.log(`Backend: getNearbyPlaces received - Latitude: ${latitude}, Longitude: ${longitude}, Radius: ${radius}, Preferences: ${preferences}, Min User Ratings: ${minUserRatings}`);

    if (!latitude || !longitude || !radius) {
        return res.status(400).json({ message: 'Latitude, longitude, and radius are required.' });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    console.log(`Backend: Parsed User Location - Lat: ${userLat}, Lng: ${userLng}`);

    if (!GOOGLE_PLACES_API_KEY) {
        console.error('Google Places API Key is not set in environment variables.');
        return res.status(500).json({ message: 'Server configuration error: Google API Key missing.' });
    }

    const location = `${userLat},${userLng}`;

    // Always query for a broad set of tourist-related places from Google Places API
    const broadTouristTypes = [
        'tourist_attraction',
        'point_of_interest',
        'lodging',
        'restaurant',
        'cafe',
        'bakery',
        'shopping_mall',
        'store',
        'movie_theater',
        'park',
        'museum',
        'art_gallery',
        'zoo',
        'amusement_park',
        'aquarium',
        'stadium',
        'university',
        'library',
        'spa',
        'church',
        'hindu_temple',
        'mosque',
        'synagogue',
        'place_of_worship',
        'bar',
        'night_club',
    ];

    // Convert radius from kilometers to meters for Google Places API
    const requestedRadiusInMeters = parseInt(radius);
    // Google Places API (Nearby Search) has a maximum radius of 50,000 meters (50km)
    // We will cap the radius sent to Google, but filter results by the requested radius later.
    const googleApiSearchRadius = Math.min(requestedRadiusInMeters, 50000);

    console.log(`Backend: Requested Radius: ${requestedRadiusInMeters / 1000}km. Google API Search Radius (capped): ${googleApiSearchRadius / 1000}km.`);
    console.log(`Backend: Calling Google Places API with - Location: ${location}, Effective Search Radius: ${googleApiSearchRadius}m, Broad Types: ${broadTouristTypes.join('|')}`);

    let parsedPreferences = [];
    try {
        parsedPreferences = preferences ? JSON.parse(preferences) : [];
    } catch (e) {
        console.error("Error parsing preferences from frontend:", e);
    }
    const preferredGoogleTypes = mapPreferencesToGooglePlaceTypes(parsedPreferences);
    console.log("Backend: User's preferred Google types:", preferredGoogleTypes);

    let allPlaces = [];
    let nextPageToken = null;
    let fetchedPages = 0;
    const MAX_PAGES = 3; // Google Places API Nearby Search allows up to 3 pages (60 results total)

    // Function to fetch a page of results
    const fetchPage = async (page_token = null) => {
        const params = {
            location: location,
            radius: googleApiSearchRadius,
            type: broadTouristTypes.join('|'),
            key: GOOGLE_PLACES_API_KEY,
        };
        if (page_token) {
            params.pagetoken = page_token;
        }

        // Log the full request URL (with masked key for security)
        const requestUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${new URLSearchParams(params).toString()}`;
        console.log('Full request URL:', requestUrl.replace(GOOGLE_PLACES_API_KEY, 'API_KEY'));

        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
                { params }
            );

            console.log(`Backend: Google Places API raw response status (page ${fetchedPages + 1}):`, response.data.status);
            if (response.data.error_message) {
                console.error(`Backend: Google Places API error message (page ${fetchedPages + 1}):`, response.data.error_message);
            }
            if (response.data.status === 'REQUEST_DENIED') {
                console.error('API Key validation failed. Please check your Google API configuration.');
            }
            console.log(`Backend: Raw Google Places API results (page ${fetchedPages + 1}):`, JSON.stringify(response.data.results, null, 2));

            return { 
                results: response.data.results || [],
                next_page_token: response.data.next_page_token || null
            };
        } catch (error) {
            console.error('API Request Error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
            throw error;
        }
    };

    try {
        // Fetch up to MAX_PAGES
        for (let i = 0; i < MAX_PAGES; i++) {
            let page = await fetchPage(nextPageToken);
            allPlaces = allPlaces.concat(page.results);
            nextPageToken = page.next_page_token;
            fetchedPages++;
            if (!nextPageToken) break; // No more pages
            if (i < MAX_PAGES - 1) {
                // Google recommends a short delay before using next_page_token for subsequent requests
                await new Promise(resolve => setTimeout(resolve, 2000)); 
            }
        }

        console.log("Backend: Total raw Google Places API results fetched across all pages:", allPlaces.length);

        // Determine the minimum user ratings for filtering, defaulting to 500 if not provided
        const minRatingsThreshold = parseInt(minUserRatings) || 500; 
        console.log(`Backend: Applying min user ratings filter: ${minRatingsThreshold}`);

        const places = allPlaces.map(place => {
            const placeLat = place.geometry.location.lat;
            const placeLng = place.geometry.location.lng;
            const distance = getDistanceFromLatLonInKm(userLat, userLng, placeLat, placeLng);

            console.log(`Backend: Place: ${place.name}, Distance: ${distance.toFixed(2)}km, User Ratings: ${place.user_ratings_total || 0}, Requested Radius: ${requestedRadiusInMeters / 1000}km`);

            // Filter for minimum visits here (using the dynamic minRatingsThreshold)
            if (place.user_ratings_total < minRatingsThreshold) { 
                console.log(`Backend: Excluding ${place.name} (user ratings ${place.user_ratings_total || 0} < required ${minRatingsThreshold})`);
                return null; // Exclude places with less than the required total ratings
            }

            // Only include places within the requested radius (in km)
            if (distance > requestedRadiusInMeters / 1000) {
                console.log(`Backend: Excluding ${place.name} (distance ${distance.toFixed(2)}km > requested radius ${requestedRadiusInMeters / 1000}km)`);
                return null; // Exclude places beyond the user's requested radius
            }

            // Determine if the place matches any of the user's preferred types
            const isPreferred = place.types.some(placeType => preferredGoogleTypes.includes(placeType));

            return {
                place_id: place.place_id,
                name: place.name,
                vicinity: place.vicinity,
                rating: place.rating || null,
                user_ratings_total: place.user_ratings_total || 0,
                photo_url: place.photos && place.photos.length > 0 
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                    : null,
                geometry: place.geometry.location, 
                types: place.types || [],
                distance: parseFloat(distance.toFixed(2)), // Distance in km
                isPreferred: isPreferred,
            };
        }).filter(place => place !== null); // Remove null entries (filtered out places)

        // Sort places by user_ratings_total in descending order (most visited first)
        places.sort((a, b) => b.user_ratings_total - a.user_ratings_total);

        res.json({ places });

    } catch (error) {
        console.error('Error fetching nearby places from Google Places API:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch nearby places.', error: error.message });
    }
}; 