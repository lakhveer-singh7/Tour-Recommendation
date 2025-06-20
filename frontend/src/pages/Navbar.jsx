import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* TourRec logo redirection */}
            <Link to={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">TourRec</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {/* Dashboard link for logged-in users */}
              {user && (
                <Link to="/dashboard" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              )}
              <Link to="/explore" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Explore
              </Link>
              <Link to="/tours" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Tours
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/preference" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Preferences
                </Link>
                <button
                  onClick={logout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;