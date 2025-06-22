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
    <>
      {/* Sidebar for all screen sizes */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col p-6 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block`}>
        <div className="flex items-center mb-8">
          <img src="/logo192.png" alt="TourRec Logo" className="h-10 w-10 rounded-full mr-2" />
          <span className="text-2xl font-bold text-gray-800">TourRec</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded hover:bg-blue-100"
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
        >
          Logout
        </button>
      </div>
      {/* Hamburger for mobile only */}
      <button
        className="fixed top-4 left-4 z-60 md:hidden bg-white p-2 rounded shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg className="h-8 w-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          )}
        </svg>
      </button>
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
};

export default Navbar;