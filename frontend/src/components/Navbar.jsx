import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap md:flex-nowrap justify-between h-16 items-center">
          <div className="flex items-center flex-shrink-0 mr-4">
            {/* TourRec logo redirection */}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="relative flex items-center">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-sm"></div>
                <img
                  src="/logo192.png"
                  alt="TourRec Logo"
                  className="h-10 w-10 md:h-12 md:w-12 relative z-10 rounded-full p-1 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 object-contain"
                  style={{ minWidth: '2.5rem', minHeight: '2.5rem' }}
                />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-gray-800 ml-2 md:ml-3">TourRec</span>
            </Link>
          </div>
          {/* Only show navigation links if not on auth pages */}
          {!isAuthPage && (
            <div className="flex flex-wrap justify-center md:ml-6 md:flex md:space-x-8 w-full md:w-auto">
              {user ? (
                // Links for logged-in users
                <>
                  <Link to="/dashboard" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/explore" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Explore
                  </Link>
                  <Link to="/saved-tours" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Saved Tours
                  </Link>
                  <Link to="/recommendation" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Recommendation
                  </Link>
                  <Link to="/destinations" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Destinations
                  </Link>
                  <Link to="/plan-tour" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Plan Your Tour
                  </Link>
                </>
              ) : (
                // Links for logged-out users
                <Link to="/destinations" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Destinations
                </Link>
              )}
            </div>
          )}
          <div className="flex items-center mt-2 md:mt-0">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/preference" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Preferences
                </Link>
                <button
                  onClick={() => { logout(); window.location.href = '/login'; }}
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