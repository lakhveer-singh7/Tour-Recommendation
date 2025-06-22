import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiMap, FiHeart, FiStar, FiGlobe, FiEdit, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/explore', label: 'Explore', icon: <FiMap /> },
  { to: '/saved-tours', label: 'Saved Tours', icon: <FiHeart /> },
  { to: '/recommendation', label: 'Recommendation', icon: <FiStar /> },
  { to: '/destinations', label: 'Destinations', icon: <FiGlobe /> },
  { to: '/plan-tour', label: 'Plan Your Tour', icon: <FiEdit /> },
  { to: '/preference', label: 'Preferences', icon: <FiSettings /> },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on navigation (mobile only)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-700 to-blue-900 shadow-2xl z-50 flex flex-col p-6 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block md:w-64`}
        style={{ minWidth: '16rem' }}
      >
        {/* Logo */}
        <div className="flex items-center mb-10">
          <img src="/logo192.png" alt="TourRec Logo" className="h-12 w-12 rounded-full mr-3 shadow-lg border-2 border-white" />
          <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow">TourRec</span>
        </div>
        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors
                ${location.pathname === link.to ? 'bg-blue-500 text-white shadow' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`}
            >
              <span className="text-2xl">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Logout Button */}
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="mt-10 flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-lg font-semibold shadow transition-colors w-full"
        >
          <FiLogOut className="text-2xl" /> Logout
        </button>
      </aside>

      {/* FAB for mobile sidebar toggle */}
      <button
        className={`fixed bottom-6 right-6 z-60 md:hidden bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'scale-90' : 'scale-100'}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        {sidebarOpen ? <FiX className="h-8 w-8" /> : <FiMenu className="h-8 w-8" />}
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content shift for desktop */}
      <style>{`
        @media (min-width: 768px) {
          body { padding-left: 16rem !important; }
        }
      `}</style>

      {/* DEBUG: Minimal always-visible FAB for mobile */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          background: 'red',
          color: 'white',
          padding: 10,
          borderRadius: 50,
          display: 'block',
        }}
        className="md:hidden"
      >
        TEST FAB
      </div>
    </>
  );
};

export default Navbar;