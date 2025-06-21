import React, { useState, useEffect } from 'react';
import axios from '../api/axios'; // Use your custom axios instance
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHistory, 
  FaHeart, 
  FaMapMarkedAlt, 
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaRegStar,
  FaSearch,
  FaFilter,
  FaEllipsisH
} from 'react-icons/fa';
import { FiActivity } from 'react-icons/fi';
import { RiDashboardFill } from 'react-icons/ri';
import LoadingSpinner from "../components/LoadingSpinner"; // Assuming you have this component
import ErrorMessage from "../components/ErrorMessage"; // Assuming you have this component
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    savedTours: 0,
    completedTours: 0,
    wishlistItems: 0,
    upcomingTours: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendedTours, setRecommendedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      if (!user) { // Only fetch if user is logged in
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null); 

      try {
        // Fetch User Plans (for stats and recent activities)
        const plansResponse = await axios.get('/api/plan');
        const plans = plansResponse.data;
        
        let completedCount = 0;
        let upcomingCount = 0;
        let savedCount = 0; 

        const activities = plans.map(plan => {
          // This mapping is simplified. You might need to adjust based on your `Plan` model's fields
          // to correctly determine `status` and `rating` for recent activities.
          const firstPlace = plan.selectedPlaces[0]?.place; 
          return {
            id: plan._id,
            title: firstPlace?.name || 'Unnamed Plan',
            date: new Date(plan.createdAt).toLocaleDateString(), 
            status: 'upcoming', 
            location: firstPlace?.city || 'N/A',
            rating: null 
          };
        });

        // Simplified stats based on plans:
        setStats({
          savedTours: activities.length,
          completedTours: 0, 
          wishlistItems: 0, 
          upcomingTours: activities.length, 
        });
        setRecentActivities(activities.slice(0, 3)); 

        // Fetch Recommended Tours (Places)
        const recommenderResponse = await axios.get('/api/recommend/hybrid');
        // Transform backend place object to frontend tour structure
        const transformedRecommendations = recommenderResponse.data.recommended.map(place => ({
          id: place.placeId,
          title: place.name,
          location: place.address || place.city || 'N/A',
          price: Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000, 
          duration: `${Math.floor(Math.random() * 5) + 1} days`, 
          rating: place.rating || 4.0, 
          image: place.photoUrl || 'https://via.placeholder.com/300x200?text=No+Image', 
          saved: false 
        }));
        setRecommendedTours(transformedRecommendations);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); 

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUserError(null);
      try {
        const response = await axios.get('/api/auth/users');
        setUsers(response.data);
      } catch (err) {
        setUserError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredTours = recommendedTours.filter(tour =>
    tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSaveTour = (tourId) => {
    setRecommendedTours(tours =>
      tours.map(tour =>
        tour.id === tourId ? { ...tour, saved: !tour.saved } : tour
      )
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400 opacity-70" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 pt-20 font-sans" style={{ fontFamily: 'Poppins, Inter, Arial, sans-serif', backgroundImage: 'url(https://www.transparenttextures.com/patterns/diamond-upholstery.png)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">

        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 drop-shadow mb-2" style={{ fontFamily: 'Poppins, Inter, Arial, sans-serif' }}>
              Welcome back, <span className="underline decoration-wavy decoration-blue-400">{user?.name}</span>!
            </h1>
            <p className="text-lg text-gray-700 mt-2 font-medium">
              Ready to plan your next adventure? Check your stats and profile below!
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Link
              to="/plan-tour"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-lg font-bold tracking-wide"
            >
              + Plan a New Tour
            </Link>
          </div>
        </motion.div>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Saved Tours</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.savedTours}</p>
                </div>
                <FaHeart className="text-blue-500 text-4xl opacity-70" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Upcoming Tours</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingTours}</p>
                </div>
                <FaCalendarAlt className="text-orange-500 text-4xl opacity-70" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Completed Tours</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedTours}</p>
                </div>
                <FaCheckCircle className="text-green-500 text-4xl opacity-70" />
              </div>
            </div>

            {/* Your Profile Card */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span role="img" aria-label="profile">👤</span> Your Profile
              </h2>
              {loadingUsers ? (
                <div>Loading your profile...</div>
              ) : userError ? (
                <div className="text-red-500">{userError}</div>
              ) : (
                users.filter(u => u.email === user?.email).map(user => (
                  <div key={user._id} className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-4 border border-blue-100">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center text-6xl text-blue-700 mb-2 shadow-lg">
                      {user.name ? user.name[0].toUpperCase() : <span role='img' aria-label='profile'>👤</span>}
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, Inter, Arial, sans-serif' }}>{user.name}</h3>
                      <p className="text-lg text-gray-600 mb-1">{user.email}</p>
                      <div className="flex flex-wrap justify-center gap-2 mb-2">
                        {Array.isArray(user.preferences) && user.preferences.length > 0 ? (
                          user.preferences.map((pref, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold border border-blue-200 shadow-sm">
                              {pref}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">No preferences set</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Project Aim Section (moved to bottom) */}
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 mt-16 mb-8 border border-blue-200 flex flex-col items-center text-center" style={{backdropFilter: 'blur(2px)'}}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-4 tracking-tight" style={{ fontFamily: 'Poppins, Inter, Arial, sans-serif' }}>What This Project Aims to Solve</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                <span className="font-semibold text-blue-700">TourRec</span> is designed to make travel planning effortless and personalized. It recommends the best places to visit based on your preferences and location, optimizes your trip route, and helps you save and manage your tour plans. The goal is to save you time, reduce travel stress, and ensure you have the most enjoyable and efficient travel experience possible.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;