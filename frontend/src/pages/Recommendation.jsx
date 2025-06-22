import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSortAmountDownAlt, FaMapMarkerAlt, FaClock, FaInfoCircle, FaTimesCircle, FaRoute } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios'; // Import custom axios instance

const API_URL = 'http://localhost:5002/api';

const Recommendation = () => {
  const { user } = useAuth();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [sortedPlaces, setSortedPlaces] = useState([]);
  const [isSorted, setIsSorted] = useState(false);
  const [loadingSort, setLoadingSort] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [places, setPlaces] = useState([]);
  const [tripPlanned, setTripPlanned] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(50000); // 50km default
  const [infoMessage, setInfoMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Background images
  const banners = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ba6f60060?q=80&w=2070&auto=format&fit=crop',
  ];

  // Get user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLoadingPlaces(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          setError('Unable to retrieve your location. Showing recommendations for default city.');
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Delhi fallback
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Showing recommendations for default city.');
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Fetch recommended places from backend when location or preferences change
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userLocation) return;
      try {
        setLoadingPlaces(true);
        setError(null);
        
        const response = await axios.get('/api/recommend/hybrid/location', {
          params: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 50000,
            limit: 30
          }
        });
        
        setPlaces(response.data.recommended || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.response?.data?.message || 'Failed to fetch recommendations.');
      } finally {
        setLoadingPlaces(false);
      }
    };
    fetchRecommendations();
  }, [userLocation]);

  // Auto-cycle banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const togglePlaceSelection = (place) => {
    setSelectedPlaces((prev) => 
      prev.some(p => p.placeId === place.placeId)
        ? prev.filter(p => p.placeId !== place.placeId)
        : [...prev, place]
    );
    setIsSorted(false);
    setSortedPlaces([]);
    setTripPlanned(false);
  };

  const planTrip = async (shouldSort = false) => {
    if (selectedPlaces.length < 2) return;
    // Check all selected places have a location
    const missingLocation = selectedPlaces.find(
      (p) => !p.location || typeof p.location.lat !== 'number' || typeof p.location.lng !== 'number'
    );
    if (missingLocation) {
      setError(`Selected place "${missingLocation.name}" is missing location data. Please select places with valid locations.`);
      return;
    }
    setLoadingSort(true);
    setError(null);
    setInfoMessage("");
    try {
      const response = await axios.post('/api/tour-plan/optimize', {
        origin: userLocation,
        destinations: selectedPlaces,
        optimize: shouldSort
      });
      
      const result = response.data;
      setSortedPlaces(result.plan || []);
      setIsSorted(shouldSort);
      setTripPlanned(true);
      
      // Show info message with time details
      if (shouldSort) {
        setInfoMessage(
          `Optimized Route:\n` +
          (result.plan.map((p, i) => `${i + 1}. ${p.name}`).join("\n")) +
          `\n\nTime Details:` +
          `\n- Return Trip Time: ${result.timeDetails.returnTripMin} minutes` +
          `\n- Average Stay Time: ${result.timeDetails.avgStayTimeMin} minutes per place` +
          `\n- Total Duration: ${result.timeDetails.totalDurationMin} minutes` +
          `\n\nEstimated Schedule:` +
          `\n- Start Time: ${result.timeDetails.estimatedStartTime}` +
          `\n- End Time: ${result.timeDetails.estimatedEndTime}`
        );
      } else {
        setInfoMessage(
          `Trip Plan:\n` +
          (result.plan.map((p, i) => `${i + 1}. ${p.name}`).join("\n")) +
          `\n\nTime Details:` +
          `\n- Return Trip Time: ${result.timeDetails.returnTripMin} minutes` +
          `\n- Average Stay Time: ${result.timeDetails.avgStayTimeMin} minutes per place` +
          `\n- Total Duration: ${result.timeDetails.totalDurationMin} minutes` +
          `\n\nEstimated Schedule:` +
          `\n- Start Time: ${result.timeDetails.estimatedStartTime}` +
          `\n- End Time: ${result.timeDetails.estimatedEndTime}`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to plan trip');
    } finally {
      setLoadingSort(false);
    }
  };

  const saveTour = async () => {
    setSaveSuccess(false);
    setSaveError(null);
    try {
      // Calculate totalTime in minutes
      const totalTime = sortedPlaces.reduce((sum, p) => sum + (p.staySec ? p.staySec / 60 : 0), 0);
      // Create a text summary of the trip plan (as shown in Your Trip Plan)
      const tripSummary = sortedPlaces.map((place, idx) => {
        let details = `${idx + 1}. ${place.name || place.placeId || ''}`;
        if (place.address) details += `\n(${place.address})`;
        if (place.arrivalTime) details += `\nArrival: ${place.arrivalTime}`;
        if (place.departureTime) details += `\nDeparture: ${place.departureTime}`;
        if (place.staySec) details += `\nStay Duration: ${Math.round(place.staySec / 60)} minutes`;
        if (place.legTravelSec) details += `\nTravel to next: ${Math.round(place.legTravelSec / 60)} minutes`;
        return details;
      }).join('\n\n');

      const selectedPlacesPayload = sortedPlaces.map(p => {
        const original = places.find(orig => orig.placeId === p.placeId) || {};
        return {
          place: p.placeId,
          name: original.name || p.name || p.placeId,
          address: original.address || p.address || '',
          cost: p.cost || 0,
          duration: p.duration || Math.round((p.staySec || 0) / 60),
          legTravelSec: p.legTravelSec || 0,
          arrivalSec: p.arrivalSec || 0
        };
      });
      await axios.post('/api/plan', {
        sourceLocation: userLocation,
        selectedPlaces: selectedPlacesPayload,
        totalTime,
        isSorted: isSorted,
        summary: tripSummary
      });

      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save tour');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 pt-20">
      {/* Banner Section */}
      <section className="relative h-64 md:h-96 w-full overflow-hidden shadow-lg">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentBannerIndex}
            src={banners[currentBannerIndex]}
            alt="Travel banner"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg">
            Your Personalized Journey Awaits
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {infoMessage && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 whitespace-pre-line" role="alert">
            <p>{infoMessage}</p>
          </div>
        )}

        {/* Places Selection Section */}
        <section className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Select Places for Your Recommendation
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Choose a few destinations you are interested in.
          </p>

          {loadingPlaces ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="animate-spin text-4xl text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {places.map((place) => (
                  <motion.div
                    key={place.placeId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`relative bg-gray-50 border rounded-lg overflow-hidden shadow-sm cursor-pointer
                      ${selectedPlaces.some(p => p.placeId === place.placeId)
                        ? 'border-blue-600 ring-2 ring-blue-500' 
                        : 'border-gray-200 hover:border-blue-300'}
                    `}
                    onClick={() => togglePlaceSelection(place)}
                  >
                    <img 
                      src={place.photoUrl || place.photo_url || 'https://via.placeholder.com/300x200?text=Place+Image'}
                      alt={place.name} 
                      className="w-full h-32 object-cover" 
                      onError={e => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Place+Image';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaMapMarkerAlt className="mr-1" /> {place.address || place.city}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <FaClock className="mr-1" /> {place.duration ? `${place.duration} min` : 'Not specified'}
                      </p>
                      {selectedPlaces.some(p => p.placeId === place.placeId) && (
                        <div className="absolute top-2 right-2 text-blue-600">
                          <FaTimesCircle className="text-xl" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  onClick={() => planTrip(false)}
                  disabled={selectedPlaces.length < 2 || loadingSort}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              <FaRoute className="mr-2" /> Plan Trip
                </button>
                <button
                  onClick={() => planTrip(true)}
                  disabled={selectedPlaces.length < 2 || loadingSort}
              className="px-6 py-3 rounded-full bg-gray-200 text-gray-800 font-semibold shadow-md hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
            >
              <FaSortAmountDownAlt className="mr-2" /> Optimize Route
                </button>
              </div>

          {loadingSort && (
            <div className="flex justify-center items-center mt-6">
              <FiLoader className="animate-spin text-2xl text-blue-600" />
              <span className="ml-2 text-blue-600">Planning your trip...</span>
            </div>
          )}

          {tripPlanned && (sortedPlaces?.length > 0) && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold mb-4 text-center">Your Trip Plan</h3>
              <div className="bg-blue-50 rounded-lg p-6">
                <ol className="list-decimal list-inside mb-6">
                  {sortedPlaces?.map((place, idx) => (
                    <li key={place.placeId} className="mb-4">
                      <div className="font-semibold">{idx + 1}. {place.name}</div>
                      {place.address && <div className="ml-6 text-gray-600">({place.address})</div>}
                      <div className="ml-6 text-sm text-gray-500">
                        <div>Arrival: {place.arrivalTime}</div>
                        <div>Departure: {place.departureTime}</div>
                        <div>Stay Duration: {Math.round(place.staySec / 60)} minutes</div>
                        {idx < sortedPlaces.length - 1 && (
                          <div>Travel to next: {Math.round(place.legTravelSec / 60)} minutes</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {infoMessage && (
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <h4 className="font-semibold mb-2">Time Summary</h4>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">{infoMessage}</pre>
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={saveTour}
                  className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition-colors duration-300"
                >
                  Save Tour
                </button>
              </div>
              {saveSuccess && <div className="text-green-600 text-center mt-2">Tour saved successfully!</div>}
              {saveError && <div className="text-red-600 text-center mt-2">{saveError}</div>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Recommendation;