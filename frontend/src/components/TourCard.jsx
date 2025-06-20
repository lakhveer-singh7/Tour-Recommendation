import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaClock, FaRupeeSign } from 'react-icons/fa';

const TourCard = ({ tour }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="relative h-48">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-medium">
          <FaStar className="inline text-yellow-400 mr-1" />
          {tour.rating}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900">{tour.name}</h3>
        <p className="text-gray-600 mt-1">{tour.location}</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2" />
            <span>{tour.duration}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaClock className="mr-2" />
            <span>{tour.bestTimeToVisit}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaRupeeSign className="mr-2" />
            <span>₹{tour.price}</span>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-gray-900">Highlights:</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {tour.highlights.map((highlight, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default TourCard; 