import { useState, useEffect, useRef } from 'react';
import { parkingAPI } from '../utils/api';

const Parking = () => {
  // Animation refs
  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const mapRef = useRef(null);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [maxDistance, setMaxDistance] = useState(800); // Increased to 800 km to accommodate long distances
  const [parkingType, setParkingType] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [vehicleType, setVehicleType] = useState('all');
  const [city, setCity] = useState('all');
  const [sortBy, setSortBy] = useState('distance');

  // State for data
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [uniqueCities, setUniqueCities] = useState([]);

  // Available filter options from backend model
  const parkingTypes = [
    'Covered Parking',
    'Uncovered Parking', 
    'Valet Parking',
    'Self Parking',
    'Multi-Level Parking',
    'EV Charging Station'
  ];

  const amenityOptions = [
    { value: 'cctv', label: 'CCTV Surveillance' },
    { value: 'security_guard', label: 'Security Guard' },
    { value: 'covered_parking', label: 'Covered Parking' },
    { value: 'ev_charging', label: 'EV Charging' },
    { value: 'valet_service', label: 'Valet Service' },
    { value: 'washroom', label: 'Washroom' },
    { value: 'disabled_friendly', label: 'Disabled Friendly' }
  ];

  const vehicleTypes = [
    { value: 'cars', label: 'Cars' },
    { value: 'bikes', label: 'Bikes' },
    { value: 'trucks', label: 'Trucks' },
    { value: 'electric_vehicles', label: 'Electric Vehicles' }
  ];

  // Fetch parking spots from backend
  const fetchParkingSpots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await parkingAPI.getAllParkingSpots();
      
      if (response.success) {
        let spots = response.data;
        
        // Extract unique cities for filter
        const cities = [...new Set(spots.map(spot => spot.address?.city).filter(Boolean))];
        setUniqueCities(cities);
        
        // Calculate distances if user location is available
        if (userLocation) {
          spots = calculateDistancesForSpots(userLocation, spots);
        }
        
        setParkingSpots(spots);
      }
    } catch (err) {
      console.error('Error fetching parking spots:', err);
      setError('Failed to load parking spots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate distances for all parking spots
  const calculateDistancesForSpots = (location, spots) => {
    return spots.map(spot => {
      const distance = parkingAPI.calculateDistance(
        location.latitude,
        location.longitude,
        spot.location.latitude,
        spot.location.longitude
      );
      return {
        ...spot,
        distance
      };
    });
  };

  // Get user location and calculate distances
  const getUserLocation = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLocationLoading(true);
        setLocationError(null);
      }
      
      const location = await parkingAPI.getCurrentLocation();
      setUserLocation(location);
      setLocationError(null);
      
      // Calculate distances immediately if we have parking spots
      if (location && parkingSpots.length > 0) {
        const spotsWithDistance = calculateDistancesForSpots(location, parkingSpots);
        setParkingSpots(spotsWithDistance);
      }
      
      // Show success message briefly
      if (showLoading) {
        setTimeout(() => setLocationLoading(false), 500);
      }
      
      return location;
    } catch (err) {
      console.warn('Could not get user location:', err.message);
      setLocationError(err.message);
      setLocationLoading(false);
      return null;
    }
  };

  // Animation effect
  useEffect(() => {
    const animateElements = () => {
      if (headerRef.current) {
        headerRef.current.style.opacity = '1';
        headerRef.current.style.transform = 'translateY(0)';
      }
      
      setTimeout(() => {
        if (filtersRef.current) {
          filtersRef.current.style.opacity = '1';
          filtersRef.current.style.transform = 'translateX(0)';
        }
      }, 200);

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.style.opacity = '1';
          mapRef.current.style.transform = 'translateX(0)';
        }
      }, 400);
    };

    animateElements();
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Fetch parking spots first
      await fetchParkingSpots();
      // Then try to get user location (this will automatically calculate distances)
      await getUserLocation(false); // Don't show loading for initial attempt
    };
    
    initializeData();
  }, []);

  // Update distances when user location changes
  useEffect(() => {
    if (userLocation && parkingSpots.length > 0) {
      const spotsWithDistance = calculateDistancesForSpots(userLocation, parkingSpots);
      setParkingSpots(spotsWithDistance);
    }
  }, [userLocation]);

  // Filter parking spots based on current filters
  const filteredSpots = parkingSpots.filter(spot => {
    // Search filter
    const searchText = searchQuery.toLowerCase();
    const matchesSearch = searchText === '' || 
      spot.name.toLowerCase().includes(searchText) ||
      spot.address?.fullAddress?.toLowerCase().includes(searchText) ||
      spot.address?.locality?.toLowerCase().includes(searchText) ||
      spot.address?.city?.toLowerCase().includes(searchText);
    
    // Price filter (checking hourly rate)
    const hourlyRate = spot.pricing?.hourlyRate || 0;
    const matchesPrice = hourlyRate >= priceRange[0] && hourlyRate <= priceRange[1];
    
    // Distance filter (only if distance is available)
    const matchesDistance = !spot.distance || spot.distance <= maxDistance;
    
    // Parking type filter
    const matchesType = parkingType === 'all' || spot.parkingType === parkingType;
    
    // City filter
    const matchesCity = city === 'all' || spot.address?.city === city;
    
    // Vehicle type filter
    const matchesVehicle = vehicleType === 'all' || 
      spot.allowedVehicleTypes?.includes(vehicleType);
    
    // Amenities filter
    const matchesAmenities = selectedAmenities.length === 0 ||
      selectedAmenities.every(amenity => spot.amenities?.includes(amenity));
    
    return matchesSearch && matchesPrice && matchesDistance && 
           matchesType && matchesCity && matchesVehicle && matchesAmenities;
  });

  // Sort filtered spots
  const sortedSpots = [...filteredSpots].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.pricing?.hourlyRate || 0) - (b.pricing?.hourlyRate || 0);
      case 'availability':
        return (b.availableSlots || 0) - (a.availableSlots || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'distance':
      default:
        // If distances are available, sort by distance, otherwise by name
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return a.name.localeCompare(b.name);
    }
  });

  const ParkingSpotCard = ({ spot }) => {
    const hourlyRate = spot.pricing?.hourlyRate || 0;
    const currency = spot.pricing?.currency === 'INR' ? '₹' : '$';
    const formattedAmenities = parkingAPI.formatAmenities(spot.amenities || []);
    const formattedVehicleTypes = parkingAPI.formatVehicleTypes(spot.allowedVehicleTypes || []);
    const formattedParkingType = parkingAPI.formatParkingType(spot.parkingType);
    
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 mb-4">
        {/* Image */}
        {spot.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={spot.imageUrl} 
              alt={spot.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{spot.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{spot.address?.fullAddress}</p>
            <p className="text-xs text-gray-500">{spot.address?.locality}, {spot.address?.city}</p>
            <div className="mt-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {formattedParkingType}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{currency}{hourlyRate}</div>
            <div className="text-xs text-gray-500">per hour</div>
            {spot.pricing?.dailyRate && (
              <div className="text-sm text-gray-600 mt-1">
                {currency}{spot.pricing.dailyRate}/day
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {spot.distance !== undefined ? (
              <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-green-700">
                    {spot.distance} km away
                  </span>
                  <span className="text-xs text-green-600">
                    {Math.round(spot.distance * 12)} min walk
                  </span>
                </div>
                {spot.distance < 1 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    Very Close
                  </span>
                )}
                {spot.distance > 1 && spot.distance <= 2 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Nearby
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="text-xs text-gray-500">Enable location for distance</span>
              </div>
            )}
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-sm text-gray-600">{spot.operatingHours}</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Available:</span>
            <span className={`text-sm font-semibold ${
              (spot.availableSlots || 0) > (spot.totalSlots * 0.5) ? 'text-green-600' : 
              (spot.availableSlots || 0) > (spot.totalSlots * 0.2) ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {spot.availableSlots || 0}/{spot.totalSlots || 0}
            </span>
          </div>
        </div>

        {/* Vehicle Types */}
        {formattedVehicleTypes.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Vehicle Types:</div>
            <div className="flex flex-wrap gap-1">
              {formattedVehicleTypes.map((type, index) => (
                <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {formattedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formattedAmenities.map((amenity, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Special Instructions */}
        {spot.specialInstructions && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs font-medium text-yellow-800 mb-1">Special Instructions:</div>
            <div className="text-xs text-yellow-700">{spot.specialInstructions}</div>
          </div>
        )}

        <div className="flex space-x-3">
          <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            Book Now
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen relative py-6 ">
      {/* Floating animated shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '60%', right: '10%', animationDelay: '1s' }}></div>
        <div className="absolute w-80 h-80 bg-pink-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ bottom: '10%', left: '50%', animationDelay: '2s' }}></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-8 pb-6">
        <div className="container mx-auto px-6">
          <div 
            ref={headerRef}
            className="text-center opacity-0 transition-all duration-1000"
            style={{ transform: 'translateY(30px)' }}
          >
            <div className="mb-4 inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-blue-600 font-medium">Find your perfect parking spot</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              <span className="text-gray-900">Available</span>{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Parking Spots
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover and book parking spaces near you in real-time. Filter by price, distance, and amenities.
            </p>
            
            {/* Location Status in Header */}
            {userLocation && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="text-sm text-green-700 font-medium">Location enabled - distances calculated</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Section - Filters and Parking Cards */}
            <div 
              ref={filtersRef}
              className="lg:w-[45%] opacity-0 transition-all duration-1000"
              style={{ transform: 'translateX(-50px)' }}
            >
              {/* Filters Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
                  </svg>
                  Filters
                </h2>
                
                <div className="space-y-4">
                  {/* Location Status */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Your Location
                      </h3>
                      {!userLocation && !locationLoading && (
                        <button
                          onClick={() => getUserLocation(true)}
                          disabled={locationLoading}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        >
                          Enable Location
                        </button>
                      )}
                    </div>
                    
                    {locationLoading && (
                      <div className="flex items-center text-sm text-blue-600">
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Getting your location...
                      </div>
                    )}
                    
                    {userLocation && !locationLoading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-green-700">
                            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                            Location enabled - showing distances
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                if (parkingSpots.length > 0) {
                                  const spotsWithDistance = calculateDistancesForSpots(userLocation, parkingSpots);
                                  setParkingSpots(spotsWithDistance);
                                }
                              }}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 font-medium"
                            >
                              Refresh Distances
                            </button>
                            <button
                              onClick={() => getUserLocation(true)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Update Location
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Lat: {userLocation.latitude.toFixed(6)}, Lng: {userLocation.longitude.toFixed(6)}
                        </div>
                      </div>
                    )}
                    
                    {locationError && !locationLoading && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-red-600">
                          <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {locationError.includes('denied') ? 'Location access denied' : 'Unable to get location'}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => getUserLocation(true)}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                          >
                            Try Again
                          </button>
                          {locationError.includes('denied') && (
                            <span className="text-xs text-gray-600">
                              Enable location in browser settings
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!userLocation && !locationError && !locationLoading && (
                      <div className="text-sm text-gray-600">
                        Enable location to see distances to parking spots
                      </div>
                    )}
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter location or parking name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range: ₹{priceRange[0]} - ₹{priceRange[1]} per hour
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Distance */}
                  {userLocation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Distance: {maxDistance} km
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="1500"
                        step="1"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  )}

                  {/* City Filter */}
                  {uniqueCities.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Cities</option>
                        {uniqueCities.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Parking Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parking Type</label>
                    <select
                      value={parkingType}
                      onChange={(e) => setParkingType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      {parkingTypes.map((type) => (
                        <option key={type} value={type}>
                          {parkingAPI.formatParkingType(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Vehicles</option>
                      {vehicleTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {amenityOptions.map((amenity) => (
                        <label key={amenity.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAmenities([...selectedAmenities, amenity.value]);
                              } else {
                                setSelectedAmenities(
                                  selectedAmenities.filter(a => a !== amenity.value)
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          <span className="text-sm text-gray-700">{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                    {selectedAmenities.length > 0 && (
                      <button
                        onClick={() => setSelectedAmenities([])}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {userLocation && <option value="distance">Distance</option>}
                      <option value="price">Price</option>
                      <option value="availability">Availability</option>
                      <option value="name">Name</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setPriceRange([0, 100]);
                        setMaxDistance(800);
                        setParkingType('all');
                        setSelectedAmenities([]);
                        setVehicleType('all');
                        setCity('all');
                        setSortBy('distance');
                      }}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-600">
                    {loading ? (
                      'Loading parking spots...'
                    ) : (
                      <>Found <span className="font-semibold text-gray-900">{sortedSpots.length}</span> parking spots</>
                    )}
                  </p>
                  {!loading && !error && (
                    <button
                      onClick={fetchParkingSpots}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Refresh
                    </button>
                  )}
                </div>
                
                {/* Closest Spots Summary */}
                {userLocation && sortedSpots.length > 0 && sortedSpots.some(spot => spot.distance !== undefined) && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        <span className="text-sm font-medium text-blue-800">
                          Closest: {sortedSpots[0]?.name}
                        </span>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {sortedSpots[0]?.distance} km away
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
                      <div className="flex space-x-2 mb-4">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-18"></div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <button
                    onClick={fetchParkingSpots}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Parking Spots Cards */}
              {!loading && !error && (
                <div className="space-y-4">
                  {sortedSpots.map((spot) => (
                    <ParkingSpotCard key={spot._id || spot.id} spot={spot} />
                  ))}
                  {sortedSpots.length === 0 && parkingSpots.length > 0 && (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.073M6.343 6.343A8 8 0 1017.657 17.657M6.343 6.343L17.657 17.657"/>
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No parking spots found</h3>
                      <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                    </div>
                  )}
                  {sortedSpots.length === 0 && parkingSpots.length === 0 && (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No parking spots available</h3>
                      <p className="text-gray-500">Check back later for available parking spots in your area.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Section - Map Placeholder */}
            <div 
              ref={mapRef}
              className="lg:w-[55%] opacity-0 transition-all duration-1000"
              style={{ transform: 'translateX(50px)' }}
            >
              <div className="sticky top-24">
                <div className="bg-gray-100 rounded-2xl shadow-lg border border-gray-200 h-[600px] flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
                    <p className="text-gray-500 mb-4 max-w-sm">
                      Map integration will display parking locations, real-time availability, and navigation routes.
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      <span className="text-sm text-blue-600 font-medium">Coming Soon</span>
                    </div>
                  </div>
                  
                  {/* Map placeholder with parking spot indicators */}
                  <div className="absolute inset-4 pointer-events-none">
                    {/* Mock parking spot markers */}
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-yellow-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Location Button */}
      {!userLocation && !locationLoading && !locationError && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => getUserLocation(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="hidden group-hover:block text-sm font-medium">
              Find nearby parking
            </span>
          </button>
        </div>
      )}

    </div>
  );
};

export default Parking;
