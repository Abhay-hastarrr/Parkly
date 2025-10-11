import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedLogo from './AnimatedLogo';
import TypingText from './TypingText';
import { User, Calendar, LogOut, Sparkles, Home, Car } from 'lucide-react';
import Dock from './Dock';

const Navbar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignInClick = () => {
    navigate('/signin');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Define Dock items based on auth state
  const dockItems = isAuthenticated
    ? [
        {
          icon: <Home size={24} />,
          label: 'Home',
          onClick: () => navigate('/'),
        },
        {
          icon: (
            <div className="relative group">
              <Car size={24} />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
            </div>
          ),
          label: 'Parking Spots',
          onClick: () => navigate('/parking'),
        },
        {
          icon: <Calendar size={24} />,
          label: 'Your Bookings',
          onClick: () => navigate('/bookings'),
        },
        {
          icon: <User size={24} />,
          label: 'Profile',
          onClick: () => navigate('/profile'),
        },
      ]
    : [
        {
          icon: <Home size={24} />,
          label: 'Home',
          onClick: () => navigate('/'),
        },
        {
          icon: (
            <div className="relative group">
              <Car size={24} />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
            </div>
          ),
          label: 'Parking Spots',
          onClick: () => navigate('/parking'),
        },
      ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50' 
        : 'bg-white/70 backdrop-blur-md'
    }`}>
      {/* Animated gradient border */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-pink-500 transition-opacity duration-500 ${
        isScrolled ? 'opacity-100' : 'opacity-50'
      }`}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group cursor-pointer lg:w-1/3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-12 h-12 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <AnimatedLogo />
              </div>
            </div>
            <div className="group-hover:scale-105 transition-transform duration-100">
              <TypingText />
            </div>
          </a>

          {/* DOCK NAVIGATION - Center Section */}
          <div className="hidden md:flex items-center justify-center lg:w-1/3">
            <Dock
              items={dockItems}
              className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-lg"
              spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
              magnification={64}
              distance={120}
              panelHeight={48}
              dockHeight={80}
              baseItemSize={40}
            />
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center justify-end space-x-3 lg:w-1/3">
            {isLoading ? (
              <div className="flex items-center space-x-2 px-4">
                <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                <span className="text-slate-600 text-sm">Loading...</span>
              </div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {getUserInitials()}
                    </div>
                  </div>
                  <span className="hidden lg:block text-slate-700 font-medium">{user?.name}</span>
                  <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 border border-slate-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-purple-50 to-pink-50">
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-600 truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-150 group">
                        <User className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        Your Profile
                      </Link>
                      <Link to="/bookings" className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-150 group">
                        <Calendar className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        Your Bookings
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-150 group"
                      >
                        <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleSignInClick}
                  className="relative px-6 py-2.5 text-slate-700 font-semibold rounded-xl hover:text-purple-600 transition-colors duration-200 group overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-slate-100 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                </button>

                <button 
                  onClick={handleSignUpClick}
                  className="relative px-6 py-2.5 font-semibold text-white rounded-xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 group-hover:scale-110 transition-transform duration-300"
                       style={{ backgroundSize: '200% 200%', animation: 'gradient 3s ease infinite' }}></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path
                  fillRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-6 space-y-2">
            <Link
              to="/"
              className="block px-4 py-3 text-slate-700 font-medium hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200"
            >
              Home
            </Link>
            <Link
              to="/parking"
              className="block px-4 py-3 text-slate-700 font-medium hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200"
            >
              Parking spots
            </Link>

            {isAuthenticated ? (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center px-4 py-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur opacity-50"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-base font-bold shadow-lg">
                      {getUserInitials()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-bold text-slate-900">{user?.name}</div>
                    <div className="text-sm text-slate-600">{user?.email}</div>
                  </div>
                </div>

                <Link to="/profile" className="flex items-center px-4 py-3 text-slate-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200">
                  <User className="w-5 h-5 mr-3" />
                  Your Profile
                </Link>
                <Link to="/bookings" className="flex items-center px-4 py-3 text-slate-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200">
                  <Calendar className="w-5 h-5 mr-3" />
                  Your Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <button
                  onClick={handleSignInClick}
                  className="w-full px-6 py-3 text-slate-700 font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignUpClick}
                  className="w-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  style={{ backgroundSize: '200% 200%', animation: 'gradient 3s ease infinite' }}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;