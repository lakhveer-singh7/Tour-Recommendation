import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center mt-20">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-24">Name:</span>
            <span className="text-gray-900">{user.name}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-24">Email:</span>
            <span className="text-gray-900">{user.email}</span>
          </div>
          {user.preferences && user.preferences.length > 0 && (
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-24">Preferences:</span>
              <span className="text-gray-900">
                {user.preferences.map((pref, index) => (
                  <span key={pref} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mb-1">
                    {pref}
                  </span>
                ))}
              </span>
            </div>
          )}
          {/* Add more profile details here */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
            <p className="text-gray-600">
              Future functionality: You will be able to edit your profile details and preferences here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 