import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SignUp = ({ onSwitchToLogin, onClose }) => {
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91', // Default to India
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Country codes data
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳', digits: 10 },
    { code: '+1', country: 'United States', flag: '🇺🇸', digits: 10 },
    { code: '+1', country: 'Canada', flag: '🇨🇦', digits: 10, name: 'Canada' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧', digits: 10 },
    { code: '+61', country: 'Australia', flag: '🇦🇺', digits: 9 },
    { code: '+33', country: 'France', flag: '🇫🇷', digits: 10 },
    { code: '+49', country: 'Germany', flag: '🇩🇪', digits: 11 },
    { code: '+81', country: 'Japan', flag: '🇯🇵', digits: 10 },
    { code: '+86', country: 'China', flag: '🇨🇳', digits: 11 },
    { code: '+7', country: 'Russia', flag: '🇷🇺', digits: 10 },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', digits: 11 },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', digits: 9 },
    { code: '+971', country: 'UAE', flag: '🇦🇪', digits: 9 },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', digits: 8 },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', digits: 9 },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', digits: 9 },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩', digits: 10 },
    { code: '+63', country: 'Philippines', flag: '🇵🇭', digits: 10 },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', digits: 9 },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', digits: 10 },
  ];

  // Get current selected country data
  const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || countryCodes[0];

  // Clear errors when component unmounts or when switching forms
  useEffect(() => {
    // Clear errors on mount
    clearError();
    
    return () => {
      clearError();
    };
  }, []); // Remove clearError from dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      const expectedDigits = selectedCountry.digits;
      if (phoneDigits.length !== expectedDigits) {
        errors.phone = `Phone number must be ${expectedDigits} digits for ${selectedCountry.country}`;
      }
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.countryCode + formData.phone.replace(/\D/g, ''), // Include country code
        password: formData.password
      };
      
      await register(userData);
      
      // Close modal/form on successful registration
      if (onClose) {
        onClose();
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration failed:', error);
    }
  };

  const formatPhoneNumber = (value, countryDigits) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Limit to expected digits for the country
    const limitedNumber = phoneNumber.slice(0, countryDigits);
    
    // Format based on country (simple formatting for most countries)
    if (limitedNumber.length === 0) return limitedNumber;
    
    // For most countries, add spaces every 3-4 digits
    if (countryDigits === 10 && formData.countryCode === '+1') {
      // US/Canada format: (XXX) XXX-XXXX
      if (limitedNumber.length <= 3) return limitedNumber;
      if (limitedNumber.length <= 6) {
        return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
      }
      return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
    } else if (countryDigits === 10 && formData.countryCode === '+91') {
      // India format: XXXXX XXXXX
      if (limitedNumber.length <= 5) return limitedNumber;
      return `${limitedNumber.slice(0, 5)} ${limitedNumber.slice(5)}`;
    } else {
      // Generic format with spaces every 3 digits
      return limitedNumber.replace(/(\d{3})(?=\d)/g, '$1 ');
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value, selectedCountry.digits);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
    
    // Clear phone error when user starts typing
    if (formErrors.phone) {
      setFormErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      countryCode: country.code,
      phone: '' // Clear phone when changing country
    }));
    setShowCountryDropdown(false);
    
    // Clear phone error when changing country
    if (formErrors.phone) {
      setFormErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('.country-dropdown')) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join ParkHub and find parking with ease
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your full name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email address"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Phone Field with Country Code */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 flex">
                {/* Country Code Dropdown */}
                <div className="relative country-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className={`relative inline-flex items-center px-3 py-2 border ${
                      formErrors.phone ? 'border-red-300' : 'border-gray-300'
                    } border-r-0 bg-gray-50 text-gray-500 text-sm rounded-l-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <span className="mr-2">{selectedCountry.flag}</span>
                    <span className="mr-1">{selectedCountry.code}</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Country Dropdown Menu */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {countryCodes.map((country, index) => (
                        <button
                          key={`${country.code}-${index}`}
                          type="button"
                          onClick={() => handleCountrySelect(country)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center"
                        >
                          <span className="mr-3">{country.flag}</span>
                          <span className="mr-2 font-mono text-gray-600">{country.code}</span>
                          <span className="flex-1 truncate">{country.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Phone Number Input */}
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`flex-1 appearance-none relative block px-3 py-2 border ${
                    formErrors.phone ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder={`Enter ${selectedCountry.digits} digit number`}
                  maxLength={selectedCountry.digits === 10 ? 15 : selectedCountry.digits + 5} // Account for formatting
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {selectedCountry.country} requires {selectedCountry.digits} digits
              </p>
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.536 15.536m0 0l1.414-1.414M15.536 15.536a3 3 0 01-4.243.007m6.364-4.364a10.05 10.05 0 01-1.563 3.029" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.536 15.536m0 0l1.414-1.414M15.536 15.536a3 3 0 01-4.243.007m6.364-4.364a10.05 10.05 0 01-1.563 3.029" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;