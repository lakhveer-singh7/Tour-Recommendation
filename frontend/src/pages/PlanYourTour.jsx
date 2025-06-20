import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlanYourTour = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* First Section - Temples and Museums */}
      <div className="relative h-[600px] w-full overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1508672019048-805c876b67e2"
          alt="Zoo and Museums"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-8">
          <h2 className="text-4xl font-bold mb-4">Discover India's Rich Heritage</h2>
          <p className="text-xl mb-8 text-center max-w-2xl">
            Explore ancient temples, magnificent museums, and cultural landmarks that tell the story of India's glorious past
          </p>
          <button
            onClick={() => navigate('/recommendation')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Get Personalized Recommendations
          </button>
        </div>
      </div>

      {/* Second Section - Famous Attractions */}
      <div className="relative h-[600px] w-full overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da" 
          alt="Famous Attractions"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-8">
          <h2 className="text-4xl font-bold mb-4">India's Iconic Destinations</h2>
          <p className="text-xl mb-8 text-center max-w-2xl">
            Visit the Red Fort, explore India's most famous zoo, and experience the spiritual grandeur of our most revered temples
          </p>
          <button
            onClick={() => navigate('/destinations')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Explore Destinations
          </button>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-4">Red Fort</h3>
            <p className="text-gray-600">
              A UNESCO World Heritage Site, the Red Fort stands as a symbol of India's rich history and architectural brilliance.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-4">National Zoological Park</h3>
            <p className="text-gray-600">
              India's most famous zoo, home to diverse wildlife and conservation efforts in the heart of Delhi.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-4">Golden Temple</h3>
            <p className="text-gray-600">
              The holiest shrine of Sikhism, known for its stunning architecture and spiritual significance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanYourTour; 