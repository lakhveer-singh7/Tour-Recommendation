import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/explore', label: 'Explore' },
    { to: '/saved-tours', label: 'Saved Tours' },
    { to: '/recommendation', label: 'Recommendation' },
    { to: '/destinations', label: 'Destinations' },
    { to: '/plan-tour', label: 'Plan Your Tour' },
    { to: '/preference', label: 'Preferences' },
  ];

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <img src="/logo192.png" alt="TourRec Logo" className="h-10 w-10 rounded-full" />
            <span className="text-2xl font-bold text-gray-800">TourRec</span>
          </Link>
          {/* Hamburger for mobile/zoomed */}
          <div className="flex md:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
          {/* Links for desktop */}
          <div className="hidden md:flex space-x-4 items-center">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-gray-700 hover:text-blue-600 font-medium">
                {link.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Sidebar for mobile/zoomed */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex">
            <div className="w-64 bg-white h-full shadow-lg flex flex-col p-6">
              <button
                onClick={() => setSidebarOpen(false)}
                className="self-end mb-4 text-gray-700"
                aria-label="Close menu"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-gray-700 px-3 py-2 rounded hover:bg-blue-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { setSidebarOpen(false); logout(); }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;