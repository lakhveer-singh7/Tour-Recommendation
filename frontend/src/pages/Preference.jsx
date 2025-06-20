import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from "../context/AuthContext";
import { getRecommendations } from "../api/planner";
import MapView from '../components/MapView';
import Itinerary from '../components/Itinerary';
import PreferenceForm from './PreferenceForm';
import LoadingOverlay from "../components/LoadingOverlay";
import ErrorModal from "../components/ErrorModal";
import { useNavigate } from 'react-router-dom';
import { optimizeTourRoute } from '../api/planner'; // Make sure this exists
import { saveUserPreferences } from '../api/userProfile';

const Preference = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [places, setPlaces] = useState([]);
  const [preferences, setPreferences] = useState({
    time: 4,
    budget: 1000,
    pace: 'medium',
    interests: [],
    transport: 'driving'
  });
  const [error, setError] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setCurrentLocation({
            lat: 28.6139, // Default to Delhi
            lng: 77.2090
          });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (user && user.preferences) {
      setPreferences(prev => ({
        ...prev,
        interests: user.preferences
      }));
    }
  }, [user]);

  // Mutation for optimizing route
  const { mutate: optimizeRoute, isLoading } = useMutation({
    mutationFn: optimizeTourRoute,
    onSuccess: (data) => {
      setOptimizedRoute(data.route);
      setPlaces(data.places);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to optimize route');
    }
  });

  const handlePreferenceChange = (name, value) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setPreferences(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: newInterests };
    });
  };

  const handleSavePreferences = async () => {
    try {
      await saveUserPreferences(user.id, preferences.interests);
      // Update user context
      updateUser({ ...user, preferences: preferences.interests });
      alert('Preferences saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
    }
  };

  const handleResetPreferences = () => {
    setPreferences(prev => ({
      ...prev,
      interests: []
    }));
  };

  const handleSubmit = useCallback(() => {
    if (!currentLocation) {
      setError('Please enable location services');
      return;
    }

    optimizeRoute({
      userId: user?.id,
      location: currentLocation,
      preferences
    });
  }, [currentLocation, preferences, user, optimizeRoute]);

  const savePlan = () => {
    // Implement save logic
    console.log('Saving plan:', optimizedRoute);
    navigate('/dashboard/saved');
  };

  if (!user) {
    navigate('/login', { state: { from: '/planner' } });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-0 sm:px-4 flex items-start justify-center w-full">
      {isLoading && <LoadingOverlay />}
      {error && (
        <ErrorModal 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="w-full px-0 sm:px-8 py-8 flex flex-col items-center">
        <div className="w-full">
          <PreferenceForm 
            preferences={preferences}
            onChange={handlePreferenceChange}
            onInterestToggle={handleInterestToggle}
            onSubmit={handleSavePreferences}
            onReset={handleResetPreferences}
            disabled={isLoading}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
};

export default Preference;