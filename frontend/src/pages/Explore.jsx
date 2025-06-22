import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiMapPin, FiStar, FiFilter, FiCompass, FiLoader, FiClock } from 'react-icons/fi';
import { FaDirections } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import axios from '../api/axios'; // Import custom axios instance
import { getDirections } from '../api/directions'; // Import getDirections
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'; // Import Google Map components

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
  marginBottom: '2rem',
};

// Mapping for filter buttons to Google Place Types
const filterTypeMap = {
  'zoo': ['zoo'],
  'park': ['park'],
  'temple': ['church', 'hindu_temple', 'mosque', 'synagogue', 'place_of_worship'],
  'museum': ['museum'],
  'monument': ['tourist_attraction', 'point_of_interest', 'landmark'],
};

const Explore = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // Keep for potential client-side refinement
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLatLng, setCurrentLatLng] = useState(null);
  const [geolocationError, setGeolocationError] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [showManualLocation, setShowManualLocation] = useState(false);

  const [radius, setRadius] = useState(50000); 

  // Google Maps Load Script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(12); // Adjust zoom level as needed
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !loadError && mapRef.current && currentLatLng) {
      panTo(currentLatLng);
    }
  }, [isLoaded, loadError, currentLatLng, panTo]);

  const fetchUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      
      // Configure geolocation options for maximum accuracy
      const options = {
        enableHighAccuracy: true, // Request the most accurate position
        timeout: 10000,          // Wait up to 10 seconds
        maximumAge: 0            // Don't use cached position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Raw geolocation data:", position);
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log("Setting new location:", newLocation);
          setCurrentLatLng(newLocation);
          setLocationAccuracy(position.coords.accuracy);
          setGeolocationError(null);
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          let errorMessage = "Unable to retrieve your location. Showing attractions around a default city (e.g., Delhi).";
          
          switch(err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions in your browser settings to see nearby attractions.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please check your device's location services.";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage = "An unknown error occurred while getting your location.";
          }
          
          setGeolocationError(errorMessage);
          setError(errorMessage);
          setCurrentLatLng({ lat: 28.6139, lng: 77.2090 }); // Delhi coordinates fallback
          setLoading(false);
        },
        options
      );
      // No watchPosition, so no cleanup needed
      return undefined;
    } else {
      console.warn("Geolocation is not supported by your browser.");
      const errorMessage = "Geolocation is not supported by your browser. Showing attractions around a default city (e.g., Delhi).";
      setGeolocationError(errorMessage);
      setError(errorMessage);
      setCurrentLatLng({ lat: 28.6139, lng: 77.2090 }); // Delhi coordinates fallback
    }
  }, []);

  // Get user's current location on mount
  useEffect(() => {
    const cleanup = fetchUserLocation();
    return () => {
      if (cleanup) cleanup();
    };
  }, [fetchUserLocation]);

  // Fetch nearby places when currentLatLng, radius, or user preferences change
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!currentLatLng) {
        setLoading(true);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userPreferences = user?.preferences || [];
        const response = await axios.get('/api/places/nearby', {
          params: {
            latitude: currentLatLng.lat,
            longitude: currentLatLng.lng,
            radius: radius,
            preferences: JSON.stringify(userPreferences),
          },
        });

        if (response.data.places && response.data.places.length > 0) {
          // For each place, fetch directions to get duration
          const placesWithDirections = await Promise.all(response.data.places.map(async (place) => {
            try {
              const directions = await getDirections(
                currentLatLng.lat,
                currentLatLng.lng,
                place.geometry.lat,
                place.geometry.lng
              );
              return { ...place, duration: directions.duration };
            } catch (dirError) {
              console.error(`Error fetching directions for ${place.name}:`, dirError.message);
              return { ...place, duration: 'N/A' }; // Fallback
            }
          }));
          setDestinations(placesWithDirections);
        } else {
          setError("No places found matching your criteria. Try adjusting preferences or radius.");
          setDestinations([]); // Clear previous destinations if no results
        }
      } catch (err) {
        console.error("Backend API error fetching places:", err.response?.data || err.message);
        setError(`Failed to fetch nearby places. ${err.response?.data?.message || err.message}.`);
        setDestinations([]); // Clear on error
      }
      setLoading(false);
    };

    fetchPlaces();
  }, [currentLatLng, radius, user?.preferences]); // Re-run when location, radius, or user preferences change

  const filteredDestinations = destinations.filter(dest => {
    // Client-side search query filter
    const matchesSearch = searchQuery ? 
      (dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       (dest.vicinity && dest.vicinity.toLowerCase().includes(searchQuery.toLowerCase())))
      : true; 

    // Filter based on activeFilter state and matched Google Place Types
    let matchesFilter = true;
    if (activeFilter !== 'all') {
      const requiredGoogleTypes = filterTypeMap[activeFilter];
      if (requiredGoogleTypes && dest.types) {
        // Check if any of the destination's Google Place types match any of the required Google types for the active filter
        matchesFilter = dest.types.some(placeType => requiredGoogleTypes.includes(placeType));
      } else {
        matchesFilter = false; 
      }
    }

    return matchesSearch && matchesFilter;
  });

  const handleViewOnMap = (destCoords) => {
    if (currentLatLng && destCoords) {
      window.open(
        `https://www.google.com/maps/dir/${currentLatLng.lat},${currentLatLng.lng}/${destCoords.lat},${destCoords.lng}`,
        '_blank'
      );
    } else {
      alert('Cannot open map without location data.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-20">
      {/* Location accuracy info */}
      <div className="mb-4 text-center text-sm text-blue-700 bg-blue-50 p-2 rounded">
        <span>
          Location accuracy may be lower on laptops/desktops. For best results, use a mobile device with GPS or connect your laptop to WiFi.<br/>
          If your location is not accurate, <button onClick={() => setShowManualLocation(v => !v)} className="underline text-blue-800">click here to enter it manually</button>.
        </span>
      </div>
      {showManualLocation && (
        <div className="mb-4 flex flex-col items-center">
          <div className="flex gap-2">
            <input type="number" step="any" placeholder="Latitude" value={manualLocation.lat} onChange={e => setManualLocation({ ...manualLocation, lat: e.target.value })} className="border p-1 rounded" />
            <input type="number" step="any" placeholder="Longitude" value={manualLocation.lng} onChange={e => setManualLocation({ ...manualLocation, lng: e.target.value })} className="border p-1 rounded" />
            <button onClick={() => {
              if (manualLocation.lat && manualLocation.lng) {
                setCurrentLatLng({ lat: parseFloat(manualLocation.lat), lng: parseFloat(manualLocation.lng) });
                setShowManualLocation(false);
              }
            }} className="bg-blue-600 text-white px-3 py-1 rounded">Set Location</button>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Explore Destinations Near You
        </h1>
        {currentLatLng && (
          <div className="flex flex-col items-center justify-center text-blue-600 mb-2">
            <div className="flex items-center">
              <FiCompass className="mr-2" />
              <span>Showing places within {radius/1000}km of your location</span>
            </div>
            <div className="mt-1 text-sm">
              <span className="text-gray-600">Your coordinates: </span>
              <span className="font-mono">
                {currentLatLng ? `${currentLatLng.lat.toFixed(6)}, ${currentLatLng.lng.toFixed(6)}` : 'N/A'}
              </span>
            </div>
            {locationAccuracy && (
              <div className="mt-1 text-sm text-gray-500">
                Location accuracy: ±{locationAccuracy.toFixed(0)} meters
              </div>
            )}
          </div>
        )}
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover breathtaking places, curated tours, and personalized recommendations!
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2-98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
            {geolocationError && geolocationError.includes("Location access denied") && (
              <button
                onClick={fetchUserLocation}
                className="ml-4 px-4 py-2 border border-yellow-400 text-yellow-700 text-sm font-medium rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Retry Location
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search destinations..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">Search Radius:</span>
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
            <option value={20000}>20 km</option>
            <option value={50000}>50 km</option>
            <option value={100000}>100 km</option>
            <option value={200000}>200 km</option>
            <option value={300000}>300 km</option>
          </select>
          <span className="text-sm text-gray-500">
            (Note: Places are sorted by distance)
          </span>
          <span className="text-xs text-red-500 ml-2">
            Google API max search radius is 50km.
          </span>
        </div>
      </div>

      {/* Google Map Section */}
      {isLoaded && !loadError && (currentLatLng) ? (
        <div className="mb-8">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentLatLng}
            zoom={12}
            onLoad={onMapLoad}
          >
            {filteredDestinations.map((dest) => (
              <Marker
                key={dest.place_id}
                position={{ lat: dest.geometry.lat, lng: dest.geometry.lng }}
                title={dest.name}
              />
            ))}
          </GoogleMap>
        </div>
      ) : (isLoaded && loadError) ? (
        <div className="text-center py-12 text-red-500">
          Error loading Google Maps: {loadError.message}
        </div>
      ) : !isLoaded ? (
        <div className="text-center py-12 text-gray-500">
          Loading map...
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full flex items-center ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          <FiFilter className="mr-2" /> All Places
        </button>
        <button
          onClick={() => setActiveFilter('zoo')}
          className={`px-4 py-2 rounded-full flex items-center ${activeFilter === 'zoo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          <FiFilter className="mr-2" /> Zoos
        </button>
        <button
          onClick={() => setActiveFilter('park')}
          className={`px-4 py-2 rounded-full flex items-center ${activeFilter === 'park' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          <FiFilter className="mr-2" /> Parks
        </button>
        <button
          onClick={() => setActiveFilter('temple')}
          className={`px-4 py-2 rounded-full flex items-center ${activeFilter === 'temple' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          <FiFilter className="mr-2" /> Temples
        </button>
        <button
          onClick={() => setActiveFilter('museum')}
          className={`px-4 py-2 rounded-full flex items-center ${activeFilter === 'museum' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          <FiFilter className="mr-2" /> Museums
        </button>
        <button
          onClick={() => setActiveFilter('monument')}
          className={`px-4 py-2 rounded-full flex items-center ${activeFilter === 'monument' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          <FiFilter className="mr-2" /> Monuments
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-600 ml-3">Loading exciting places...</p>
        </div>
      ) : filteredDestinations.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredDestinations.map((dest) => (
            <motion.div
              key={dest.place_id}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
            >
              {dest.photo_url ? (
                <img
                  src={dest.photo_url}
                  alt={dest.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image Available
                </div>
              )}
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {dest.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 flex items-center">
                  <FiMapPin className="mr-2 text-blue-500" />
                  {dest.vicinity || 'Address not available'}
                </p>
                <div className="flex items-center text-gray-700 text-sm mb-2">
                  <FiCompass className="mr-2 text-green-500" />
                  <span>{dest.distance} km away</span>
                </div>
                {dest.duration && dest.duration !== 'N/A' && (
                  <div className="flex items-center text-gray-700 text-sm mb-4">
                    <FiClock className="mr-2 text-purple-500" />
                    <span>{dest.duration} travel time</span>
                  </div>
                )}
                {dest.rating && (
                  <div className="flex items-center text-yellow-500 mb-4">
                    <FiStar className="mr-1" />
                    <span>{dest.rating.toFixed(1)}</span>
                    {dest.user_ratings_total > 0 && (
                      <span className="text-gray-500 ml-1">
                        ({dest.user_ratings_total} reviews)
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {dest.types && dest.types.map((type) => (
                    <span
                      key={type}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize"
                    >
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 pt-0 flex justify-end gap-3">
                <button
                  onClick={() =>
                    handleViewOnMap(dest.geometry)
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaDirections className="mr-2" /> View on Map
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No places found matching your criteria. Try adjusting your radius or checking your preferences.
          </p>
          {geolocationError && geolocationError.includes("Location access denied") && (
            <button
              onClick={fetchUserLocation}
              className="mt-4 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry Location Access
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;