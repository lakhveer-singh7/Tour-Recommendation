import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [navLinksFit, setNavLinksFit] = useState(true);
  const navRef = useRef(null);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/explore', label: 'Explore', icon: '🔍' },
    { to: '/saved-tours', label: 'Saved Tours', icon: '❤️' },
    { to: '/recommendation', label: 'Recommendation', icon: '🌟' },
    { to: '/destinations', label: 'Destinations', icon: '🌎' },
    { to: '/plan-tour', label: 'Plan Tour', icon: '✏️' },
    { to: '/preference', label: 'Preferences', icon: '⚙️' },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      
      if (window.innerWidth >= 768) {
        const nav = navRef.current;
        if (nav) {
          const availableWidth = window.innerWidth - 300;
          const requiredWidth = navLinks.length * 120;
          setNavLinksFit(requiredWidth <= availableWidth);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [navLinks.length]);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg fixed w-full z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <img 
              src="/logo192.png" 
              alt="TourRec Logo" 
              className="h-12 w-12 rounded-full border-2 border-white shadow-lg transition-all hover:rotate-12" 
            />
            <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                TourRec
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2" ref={navRef}>
            {isDesktop && navLinksFit && (
              <>
                {navLinks.map(link => (
                  <Link 
                    key={link.to} 
                    to={link.to}
                    className={`px-5 py-3 text-white font-semibold rounded-xl transition-all 
                              flex items-center gap-2 group relative
                              ${location.pathname === link.to ? 
                                'bg-white/20 shadow-inner' : 
                                'hover:bg-white/10 hover:shadow-md'}`}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {link.icon}
                    </span>
                    <span className="whitespace-nowrap">
                      {link.label}
                    </span>
                    <span className={`absolute bottom-0 left-1/2 w-0 h-1 bg-white rounded-full 
                                    transition-all duration-300 group-hover:w-4/5 -translate-x-1/2
                                    ${location.pathname === link.to ? 'w-4/5' : ''}`} />
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="ml-4 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold
                            hover:bg-gray-100 hover:shadow-lg active:scale-95 transition-all
                            flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="text-xl">👋</span>
                  Sign Out
                </button>
              </>
            )}

            {isDesktop && !navLinksFit && (
              <>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-3 text-white focus:outline-none transition-all hover:scale-110"
                  aria-label="Open menu"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </button>
                <button
                  onClick={logout}
                  className="ml-4 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold
                            hover:bg-gray-100 hover:shadow-lg active:scale-95 transition-all
                            flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="text-xl">👋</span>
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 text-white focus:outline-none transition-all hover:scale-110"
              aria-label="Open menu"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar Content */}
          <div className={`absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-indigo-700 to-blue-600 shadow-2xl
                          transform transition-transform duration-300 ease-in-out
                          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-6 border-b border-blue-400/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img 
                    src="/logo192.png" 
                    alt="TourRec Logo" 
                    className="h-12 w-12 rounded-full border-2 border-white shadow-lg" 
                  />
                  <span className="text-2xl font-bold text-white drop-shadow-md">TourRec</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-white hover:text-blue-200 transition-colors rounded-full hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-6 py-4 mx-3 rounded-xl transition-all
                              flex items-center gap-4
                              ${location.pathname === link.to ? 
                                'bg-white/20 shadow-inner' : 
                                'hover:bg-white/10 hover:shadow-md'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-2xl">{link.icon}</span>
                    <span className="font-semibold text-white">{link.label}</span>
                  </Link>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-blue-400/50">
                <button
                  onClick={() => { setSidebarOpen(false); logout(); }}
                  className="w-full px-6 py-4 bg-white text-blue-600 rounded-xl font-bold
                            hover:bg-gray-100 hover:shadow-lg active:scale-95 transition-all
                            flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">👋</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;