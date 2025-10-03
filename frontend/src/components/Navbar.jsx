import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SignIn, SignUp } from './';

// Modal component for auth forms
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6 sm:p-8">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                className="bg-gray-100 rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignInClick = () => {
    setShowSignInModal(true);
  };

  const handleSignUpClick = () => {
    setShowSignUpModal(true);
  };

  const handleCloseModals = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
  };

  const handleSwitchToSignUp = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUpModal(false);
    setShowSignInModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <a href='/' className="flex-shrink-0 flex items-center space-x-2 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ParkHub</div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <a
              href="/"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Home
            </a>
            <a
              href="/parking"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Find Parking
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Contact
            </a>
            <div className="flex items-center space-x-3 ml-4">
              {isLoading ? (
                <div className="flex items-center space-x-2 px-4">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-gray-600 text-sm">Loading...</span>
                </div>
              ) : isAuthenticated ? (
                // Authenticated user menu
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md">
                      {getUserInitials()}
                    </div>
                    <span className="hidden lg:block">{user?.name}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <a href="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Profile
                      </a>
                      <a href="/bookings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Your Bookings
                      </a>
                      <a href="/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </a>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Non-authenticated buttons
                <>
                  <button 
                    onClick={handleSignInClick}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleSignUpClick}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 pt-2 pb-4 space-y-1 bg-white/95 backdrop-blur-md shadow-lg">
            <a
              href="/"
              className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
            >
              Home
            </a>
            <a
              href="/parking"
              className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
            >
              Find Parking
            </a>
            <a
              href="/about"
              className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
            >
              About
            </a>
            <a
              href="/contact"
              className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
            >
              Contact
            </a>
            <div className="pt-4 pb-2 border-t border-gray-200 mt-3">
              <div className="space-y-3">
                {isAuthenticated ? (
                  // Authenticated user mobile menu
                  <>
                    <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-base font-semibold shadow-md">
                        {getUserInitials()}
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-semibold text-gray-900">{user?.name}</div>
                        <div className="text-sm text-gray-600">{user?.email}</div>
                      </div>
                    </div>
                    <a href="/profile" className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Your Profile
                    </a>
                    <a href="/bookings" className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Your Bookings
                    </a>
                    <a href="/settings" className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </>
                ) : (
                  // Non-authenticated buttons
                  <div className="space-y-3">
                    <button 
                      onClick={handleSignInClick}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-base font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={handleSignUpClick}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg text-base font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Authentication Modals */}
      <Modal isOpen={showSignInModal} onClose={handleCloseModals}>
        <SignIn 
          onSwitchToSignUp={handleSwitchToSignUp} 
          onClose={handleCloseModals}
        />
      </Modal>
      
      <Modal isOpen={showSignUpModal} onClose={handleCloseModals}>
        <SignUp 
          onSwitchToLogin={handleSwitchToSignIn} 
          onClose={handleCloseModals}
        />
      </Modal>
    </nav>
  );
};

export default Navbar;