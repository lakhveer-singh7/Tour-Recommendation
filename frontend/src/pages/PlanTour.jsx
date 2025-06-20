import React from 'react';

const PlanTour = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
          Plan Your Tour
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-700 text-lg text-center">
            This is where you will plan your personalized tours.
            Stay tuned for features like selecting destinations, setting dates, and more!
          </p>
          {/* Future tour planning components will go here */}
        </div>
      </div>
    </div>
  );
};

export default PlanTour; 