import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaClock, FaSearch, FaRoute, FaThumbsUp, 
  FaUsers, FaStar, FaHeart, FaShareAlt, FaCalendarAlt,
  FaUmbrellaBeach, FaShoppingBag, FaUtensils, FaMountain
} from 'react-icons/fa';
import { GiModernCity, GiTempleGate, GiIndianPalace, GiMonumentValley, GiIndiaGate } from 'react-icons/gi';
import { MdTerrain, MdDirectionsWalk, MdBeachAccess, MdMuseum, MdNature } from 'react-icons/md';
import { IoMdRestaurant, IoMdTrain } from 'react-icons/io';
import { BiShoppingBag } from 'react-icons/bi';
import { RiAncientGateFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const backgrounds = [
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  'https://images.unsplash.com/photo-1604503030536-8d5e3f5c5a1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
];

const LandingPage = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Rotate backgrounds every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center" style={{ fontFamily: 'Poppins, Inter, Arial, sans-serif' }}>
      {/* Top-right Login/Register Buttons */}
      <div className="fixed top-6 right-8 z-30 flex gap-4">
        <Link to="/login" className="px-6 py-2 bg-white/90 text-blue-700 font-semibold rounded-xl shadow hover:bg-blue-50 border border-blue-200 transition-colors text-base">Login</Link>
        <Link to="/register" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow hover:from-blue-700 hover:to-purple-700 border border-blue-200 transition-colors text-base">Register</Link>
      </div>
      {/* Animated Background */}
      <AnimatePresence initial={false}>
        <motion.img
          key={currentBgIndex}
          src={backgrounds[currentBgIndex]}
          alt="TourRec background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-pink-900/70 z-10"></div>
      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 py-20 w-full">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-60 w-24 h-24"></div>
            <img
              src="/logo192.png"
              alt="TourRec Logo"
              className="h-20 w-20 relative z-10 rounded-full p-2 bg-white shadow-lg object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow mb-2 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Tour<span className="text-blue-300">Rec</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 font-medium max-w-2xl mt-4 mb-6">
            Your smart travel companion for personalized, effortless, and optimized trip planning.
          </p>
        </div>

        {/* What is TourRec Section */}
        <div className="bg-white/90 rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto mb-12 border border-blue-200" style={{backdropFilter: 'blur(2px)'}}>
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-4 tracking-tight">What is TourRec?</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            <span className="font-semibold text-blue-700">TourRec</span> is a modern tour recommendation and planning system. It helps you discover the best places to visit, plan and optimize your route, and save your favorite tours—all tailored to your preferences and location. Say goodbye to travel stress and hello to seamless, personalized adventures.
          </p>
        </div>

        {/* Key Features Section */}
        <div className="w-full max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-tight">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaStar className="text-blue-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">Personalized Recommendations</h3>
              <p className="text-gray-700 text-sm">Get place suggestions based on your interests, preferences, and location.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaRoute className="text-purple-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">Route Optimization</h3>
              <p className="text-gray-700 text-sm">Plan the most efficient route for your trip, saving time and maximizing your experience.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaHeart className="text-pink-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">Save & Manage Tours</h3>
              <p className="text-gray-700 text-sm">Save your planned tours, view details, and manage your travel history easily.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaMapMarkerAlt className="text-green-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">Explore Destinations</h3>
              <p className="text-gray-700 text-sm">Browse and discover top destinations, attractions, and hidden gems across regions.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaUsers className="text-indigo-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">User Profile & Preferences</h3>
              <p className="text-gray-700 text-sm">Set your travel preferences and manage your profile for a tailored experience.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaCalendarAlt className="text-orange-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">Secure Authentication</h3>
              <p className="text-gray-700 text-sm">Register and login securely to access your personalized dashboard and saved tours.</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="w-full max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-tight">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaMapMarkerAlt className="text-blue-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">1. Set Your Preferences</h3>
              <p className="text-gray-700 text-sm">Sign up, set your travel interests, and let TourRec know what you love.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaSearch className="text-purple-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">2. Get Recommendations</h3>
              <p className="text-gray-700 text-sm">Receive personalized place suggestions and optimized trip plans instantly.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
              <FaRoute className="text-green-500 text-4xl mb-3" />
              <h3 className="font-semibold text-lg mb-2">3. Save & Enjoy</h3>
              <p className="text-gray-700 text-sm">Save your tour, view your dashboard, and enjoy a seamless travel experience.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Link
          to="/register"
          className="mt-6 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg text-xl font-bold tracking-wide hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          Get Started
        </Link>

        {/* Developed By Section */}
        <div className="w-full max-w-4xl mx-auto mt-20 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-tight">Developed By</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex items-center gap-6 border border-blue-100">
              <img
                src="/Shiv.jpg"
                alt="Shiv Shakti Kumar"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Shiv Shakti Kumar</h3>
                <p className="text-gray-600 mb-1">23114091</p>
                <p className="text-gray-600">IIT Roorkee Computer Science Student</p>
              </div>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 flex items-center gap-6 border border-blue-100">
              <img
                src="/Lakhveer.jpeg"
                alt="Lakhveer Singh"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Lakhveer Singh</h3>
                <p className="text-gray-600 mb-1">23114053</p>
                <p className="text-gray-600">IIT Roorkee Computer Science Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;