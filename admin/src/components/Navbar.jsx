import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Add Spot', href: '/addspot' },
    { name: 'Manage Spots', href: '/manage-spots' },
    { name: 'Bookings', href: '/bookings' },
  ];

  const handleLogout = async () => {
    try {
      setDropdownOpen(false); // Close dropdown first
      await logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg sticky top-0 z-[10000]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
            <div className="flex-shrink-0 flex items-center space-x-2 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <a href='/' className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ParkHub</a>
            </div>
        
        {/* Navigation Links - Center (only show if authenticated) */}
        {isAuthenticated() && (
          <>
            <div className="hidden md:flex space-x-6">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-gray-700 ${
                    location.pathname === item.href || location.hash === item.href.replace('#', '')
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Mobile Navigation Links */}
            <div className="md:hidden flex space-x-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={`px-2 py-1 text-xs rounded font-medium transition-all duration-200 hover:bg-gray-700 ${
                    location.pathname === item.href || location.hash === item.href.replace('#', '')
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </>
        )}
        
        {/* Right side - Authentication */}
        <div className="flex items-center space-x-4">
          {isAuthenticated() ? (
            // Authenticated user UI with dropdown
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white font-medium text-sm">Admin</p>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : 'rotate-0'
                }`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Not authenticated - show login button
            <Link
              to="/login"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;