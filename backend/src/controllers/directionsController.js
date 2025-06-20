import axios from 'axios';

const GOOGLE_DIRECTIONS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // Using the same API key as Places API

export const getDirections = async (req, res) => {
    const { originLat, originLng, destinationLat, destinationLng } = req.query;

    if (!originLat || !originLng || !destinationLat || !destinationLng) {
        return res.status(400).json({ message: 'Origin and destination coordinates are required.' });
    }

    console.log(`Backend: getDirections received - Origin: ${originLat},${originLng}, Destination: ${destinationLat},${destinationLng}`);

    if (!GOOGLE_DIRECTIONS_API_KEY) {
        console.error('Google Directions API Key is not set in environment variables.');
        return res.status(500).json({ message: 'Server configuration error: Google API Key missing.' });
    }

    const origin = `${originLat},${originLng}`;
    const destination = `${destinationLat},${destinationLng}`;

    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/directions/json`,
            {
                params: {
                    origin: origin,
                    destination: destination,
                    key: GOOGLE_DIRECTIONS_API_KEY,
                    mode: 'driving', // You can change this to walking, bicycling, transit
                },
            }
        );

        console.log("Backend: Google Directions API raw response status:", response.data.status);
        if (response.data.error_message) {
            console.error("Backend: Google Directions API error message:", response.data.error_message);
        }

        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0].legs[0];
            res.json({
                distance: route.distance.text,
                duration: route.duration.text,
                steps: route.steps,
                overview_polyline: response.data.routes[0].overview_polyline.points, // Encoded polyline
            });
        } else {
            res.status(404).json({ message: 'No routes found.' });
        }

    } catch (error) {
        console.error('Error fetching directions from Google Directions API:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch directions.', error: error.message });
    }
}; 