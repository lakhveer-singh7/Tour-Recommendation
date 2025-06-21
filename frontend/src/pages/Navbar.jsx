import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  console.log("Rendering new, enhanced Navbar - v2"); // Diagnostic log
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [navLinksFit, setNavLinksFit] = useState(true);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/explore', label: 'Explore', icon: '🔍' },
    { to: '/saved-tours', label: 'Saved Tours', icon: '❤️' },
    { to: '/recommendation', label: 'Recommendation', icon: '🌟' },
    { to: '/destinations', label: 'Destinations', icon: '🌎' },
    { to: '/plan-tour', label: 'Plan Your Tour', icon: '✏️' },
    { to: '/preference', label: 'Preferences', icon: '⚙️' },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      
      // Check if nav links fit in the available space
      if (window.innerWidth >= 768) {
        const nav = document.querySelector('.desktop-nav');
        if (nav) {
          const navWidth = nav.offsetWidth;
          const availableWidth = window.innerWidth - 300; // 300px for logo and logout button
          const requiredWidth = navLinks.length * 120; // Approx 120px per link
          setNavLinksFit(requiredWidth <= availableWidth);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [navLinks.length]);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-xl fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <img 
              src="/logo192.png" 
              alt="TourRec Logo" 
              className="h-10 w-10 rounded-full border-2 border-white shadow-md" 
            />
            <span className="text-2xl font-bold text-white drop-shadow-md">TourRec</span>
          </Link>

          {/* Hamburger for mobile or when links don't fit */}
          {(isDesktop && !navLinksFit) || !isDesktop ? (
            <div className="flex md:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white focus:outline-none transition-transform hover:scale-110"
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
          ) : null}

          {/* Links for desktop when they fit */}
          {isDesktop && navLinksFit && (
            <div className="desktop-nav flex space-x-1 items-center">
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="px-4 py-2 text-white font-medium rounded-lg transition-all 
                            hover:bg-white hover:bg-opacity-20 hover:shadow-md
                            flex items-center gap-2"
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <button
                onClick={logout}
                className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium
                          hover:bg-gray-100 hover:shadow-md transition-all
                          flex items-center gap-2"
              >
                <span>👋</span>
                Logout
              </button>
            </div>
          )}

          {/* Logout button for desktop when links don't fit */}
          {isDesktop && !navLinksFit && (
            <button
              onClick={logout}
              className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium
                        hover:bg-gray-100 hover:shadow-md transition-all
                        flex items-center gap-2"
            >
              <span>👋</span>
              Logout
            </button>
          )}
        </div>

        {/* Sidebar for mobile or when links don't fit */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex">
            <div className="w-72 bg-gradient-to-b from-blue-600 to-blue-500 h-full shadow-xl flex flex-col">
              <div className="p-6 border-b border-blue-400 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logo192.png" 
                    alt="TourRec Logo" 
                    className="h-10 w-10 rounded-full border-2 border-white shadow-md" 
                  />
                  <span className="text-2xl font-bold text-white drop-shadow-md">TourRec</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 py-4">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block text-white px-6 py-3 mx-2 rounded-lg transition-all
                              hover:bg-white hover:bg-opacity-20 hover:shadow-md
                              flex items-center gap-3"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
              
              <div className="p-4 border-t border-blue-400">
                <button
                  onClick={() => { setSidebarOpen(false); logout(); }}
                  className="w-full px-4 py-3 bg-white text-blue-600 rounded-lg font-medium
                            hover:bg-gray-100 hover:shadow-md transition-all
                            flex items-center justify-center gap-2"
                >
                  <span>👋</span>
                  Logout
                </button>
              </div>
            </div>
            
            {/* Click outside to close */}
            <div 
              className="flex-1" 
              onClick={() => setSidebarOpen(false)} 
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;