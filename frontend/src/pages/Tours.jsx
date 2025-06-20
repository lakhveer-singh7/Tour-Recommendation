import React, { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiStar, FiHeart, FiTrash2, FiEye } from 'react-icons/fi';
import axios from '../api/axios'; // Import custom axios instance

const SavedTours = () => {
  const [savedTours, setSavedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTour, setExpandedTour] = useState(null);

  const fetchSavedTours = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/plan');
      setSavedTours(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch saved tours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedTours();
  }, []);

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    try {
      await axios.delete(`/api/plan/${planId}`);
      fetchSavedTours(); // Refresh list after delete
    } catch (err) {
      alert('Error deleting tour: ' + (err.response?.data?.message || err.message));
    }
  };

  // Helper to get city or state from savedLocation
  const getLocationLabel = (plan) => {
    if (plan.savedLocation && plan.savedLocation.state && plan.savedLocation.state !== 'Unknown') {
      return plan.savedLocation.state;
    }
    // fallback to city if state is not available
    if (plan.savedLocation && plan.savedLocation.city && plan.savedLocation.city !== 'Unknown') {
      return plan.savedLocation.city;
    }
    // fallback to old logic
    const first = plan.selectedPlaces?.[0];
    if (first && first.address) {
      const parts = first.address.split(',');
      return parts.length > 1 ? parts[parts.length - 2].trim() : parts[0];
    }
    // If nothing is available, return a generic label
    return 'Saved Tour';
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 opacity-95"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center mix-blend-overlay"></div>
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Saved Tours</h1>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
            View your saved tours and plans here.
          </p>
          <p className="text-lg text-indigo-100 mt-2">You have {savedTours.length} saved tour{savedTours.length === 1 ? '' : 's'}.</p>
          {savedTours.length > 0 && (
            <button
              onClick={async () => {
                if (!window.confirm('Are you sure you want to delete ALL your saved tours?')) return;
                try {
                  await axios.delete('/api/plan');
                  fetchSavedTours();
                } catch (err) {
                  alert('Error deleting all tours: ' + (err.response?.data?.message || err.message));
                }
              }}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
            >
              Delete All Saved Tours
            </button>
          )}
        </div>
        {loading && <div className="text-center text-white text-xl">Loading saved tours...</div>}
        {error && <div className="text-center text-red-400 text-xl">{error}</div>}
        {!loading && !error && (
          <>
            {savedTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {savedTours.map(plan => (
                  <div key={plan._id} className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{getLocationLabel(plan)}</h2>
                          <p className="text-gray-600 text-sm">{plan.selectedPlaces?.length || 0} places</p>
                          <p className="text-gray-500 text-xs">Saved: {new Date(plan.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setExpandedTour(expandedTour === plan._id ? null : plan._id)} className="text-blue-600 hover:text-blue-800" title="See Details">
                            <FiEye />
                          </button>
                          <button onClick={() => handleDelete(plan._id)} className="text-red-500 hover:text-red-700" title="Delete Tour">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      {expandedTour === plan._id && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-semibold mb-2">Tour Details</h3>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">{plan.summary || 'No details available.'}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white/80 rounded-xl shadow-lg mb-12">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No saved tours</h3>
                <p className="text-gray-500 mb-4">Plan and save a tour to see it here!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedTours;