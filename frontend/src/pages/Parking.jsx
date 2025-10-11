import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { parkingAPI } from '../utils/api';
import FilterSection from '../components/FilterSection.jsx';
import MapHolder from '../components/MapHolder.jsx';
import ParkingSpotsSection, { ParkingSpotCard } from '../components/ParkingSpotCard.jsx';

const Parking = () => {
  // Animation refs
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const filterPopupRef = useRef(null);

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'map'

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [maxDistance, setMaxDistance] = useState(800);
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

  // Fetch parking spots from backend
  const fetchParkingSpots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await parkingAPI.getAllParkingSpots();
      
      if (response.success) {
        let spots = response.data;
        
        const cities = [...new Set(spots.map(spot => spot.address?.city).filter(Boolean))];
        setUniqueCities(cities);
        
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

  const calculateDistancesForSpots = (location, spots) => {
    return spots.map(spot => {
      const distance = parkingAPI.calculateDistance(
        location.latitude,
        location.longitude,
        spot.location.latitude,
        spot.location.longitude
      );
      return { ...spot, distance };
    });
  };

  const getUserLocation = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLocationLoading(true);
        setLocationError(null);
      }
      
      const location = await parkingAPI.getCurrentLocation();
      setUserLocation(location);
      setLocationError(null);
      
      if (location && parkingSpots.length > 0) {
        const spotsWithDistance = calculateDistancesForSpots(location, parkingSpots);
        setParkingSpots(spotsWithDistance);
      }
      
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

  useEffect(() => {
    const animateElements = () => {
      if (headerRef.current) {
        headerRef.current.style.opacity = '1';
        headerRef.current.style.transform = 'translateY(0)';
      }
      
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.opacity = '1';
          contentRef.current.style.transform = 'translateY(0)';
        }
      }, 300);
    };

    animateElements();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await fetchParkingSpots();
      await getUserLocation(false);
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (userLocation && parkingSpots.length > 0) {
      const spotsWithDistance = calculateDistancesForSpots(userLocation, parkingSpots);
      setParkingSpots(spotsWithDistance);
    }
  }, [userLocation]);

  const filteredSpots = parkingSpots.filter(spot => {
    const searchText = searchQuery.toLowerCase();
    const matchesSearch = searchText === '' || 
      spot.name.toLowerCase().includes(searchText) ||
      spot.address?.fullAddress?.toLowerCase().includes(searchText) ||
      spot.address?.locality?.toLowerCase().includes(searchText) ||
      spot.address?.city?.toLowerCase().includes(searchText);
    
    const hourlyRate = spot.pricing?.hourlyRate || 0;
    const matchesPrice = hourlyRate >= priceRange[0] && hourlyRate <= priceRange[1];
    const matchesDistance = !spot.distance || spot.distance <= maxDistance;
    const matchesType = parkingType === 'all' || spot.parkingType === parkingType;
    const matchesCity = city === 'all' || spot.address?.city === city;
    const matchesVehicle = vehicleType === 'all' || 
      spot.allowedVehicleTypes?.includes(vehicleType);
    const matchesAmenities = selectedAmenities.length === 0 ||
      selectedAmenities.every(amenity => spot.amenities?.includes(amenity));
    
    return matchesSearch && matchesPrice && matchesDistance && 
           matchesType && matchesCity && matchesVehicle && matchesAmenities;
  });

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
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return a.name.localeCompare(b.name);
    }
  });

  // Filter Modal Component
  const FilterModal = () => {
    if (!showFilters) return null;

    return createPortal(
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
        style={{ zIndex: 99999 }}
        onClick={() => setShowFilters(false)}
      >
        <div 
          ref={filterPopupRef}
          className="bg-white/95 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp"
          style={{ zIndex: 100000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Search Filters
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setPriceRange([0, 100]);
                  setMaxDistance(800);
                  setParkingType('all');
                  setSelectedAmenities([]);
                  setVehicleType('all');
                  setCity('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] premium-scrollbar">
            <FilterSection
              userLocation={userLocation}
              locationLoading={locationLoading}
              locationError={locationError}
              getUserLocation={getUserLocation}
              parkingSpots={parkingSpots}
              setParkingSpots={setParkingSpots}
              calculateDistancesForSpots={calculateDistancesForSpots}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              maxDistance={maxDistance}
              setMaxDistance={setMaxDistance}
              parkingType={parkingType}
              setParkingType={setParkingType}
              selectedAmenities={selectedAmenities}
              setSelectedAmenities={setSelectedAmenities}
              vehicleType={vehicleType}
              setVehicleType={setVehicleType}
              city={city}
              setCity={setCity}
              sortBy={sortBy}
              setSortBy={setSortBy}
              uniqueCities={uniqueCities}
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => setShowFilters(false)}
              className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden pt-5">
      {/* Ethereal Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-purple-100/40 to-pink-100/40 animate-gradient"></div>
        
        <div className="absolute -top-48 -right-48 w-96 h-96">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        </div>
        
        <div className="absolute -bottom-48 -left-48 w-96 h-96">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Compact Header Bar - Seamlessly blended */}
      <div 
        ref={headerRef}
        className="relative z-20 opacity-0 transition-all duration-1000 pt-20"
        style={{ transform: 'translateY(-20px)' }}
      >
        <div className="container mx-auto px-6">
          <div className="bg-transparent backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/40 space-y-4">
            {/* Top Row - Logo & Actions */}
            <div className="flex items-center justify-between gap-4">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    ParkSpot
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">{sortedSpots.length} available</p>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                {/* Location Status */}
                {userLocation ? (
                  <div className="hidden sm:flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/60 px-4 py-2 rounded-xl">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700">Live</span>
                  </div>
                ) : (
                  <button
                    onClick={() => getUserLocation(true)}
                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    <span>Locate</span>
                  </button>
                )}

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 bg-white/80 text-slate-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white transform hover:scale-105 transition-all border border-white/60"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                  </svg>
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>

            {/* Bottom Row - Search, Toggle & Sort */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Bar */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search by location, parking name, or area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 text-sm font-medium border-2 border-slate-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white/80 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center gap-2 bg-white/80 rounded-xl p-1.5">
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    viewMode === 'split' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'text-slate-600 hover:bg-white'
                  }`}
                  title="Split View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'text-slate-600 hover:bg-white'
                  }`}
                  title="List View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    viewMode === 'map' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'text-slate-600 hover:bg-white'
                  }`}
                  title="Map View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white transition-all border border-white/60"
              >
                <option value="distance">📍 Nearest</option>
                <option value="price">💰 Cheapest</option>
                <option value="availability">🅿️ Available</option>
                <option value="name">🔤 Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={contentRef}
        className="relative z-10 container mx-auto px-6 py-6 opacity-0 transition-all duration-1000"
        style={{ transform: 'translateY(20px)' }}
      >
        {/* Split View */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Parking Spots */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-xl p-6 overflow-hidden">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
                Available Spots
              </h2>
              <div className="h-[calc(100%-60px)] overflow-y-auto premium-scrollbar pr-2">
                <ParkingSpotsSection
                  loading={loading}
                  error={error}
                  sortedSpots={sortedSpots}
                  parkingSpots={parkingSpots}
                  fetchParkingSpots={fetchParkingSpots}
                  userLocation={userLocation}
                  selectedSpot={selectedSpot}
                  setSelectedSpot={setSelectedSpot}
                />
              </div>
            </div>

            {/* Map */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-xl overflow-hidden">
              <MapHolder 
                userLocation={userLocation}
                parkingSpots={sortedSpots}
                maxDistance={maxDistance}
                loading={loading}
                selectedSpot={selectedSpot}
                setSelectedSpot={setSelectedSpot}
              />
            </div>
          </div>
        )}

        {/* List View - Grid Layout */}
        {viewMode === 'list' && (
          <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-xl p-8 max-h-[calc(100vh-200px)] overflow-y-auto premium-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                All Parking Spots
              </h2>
              {!loading && !error && (
                <button
                  onClick={fetchParkingSpots}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Refresh
                </button>
              )}
            </div>

            {/* Results Summary */}
            {!loading && !error && sortedSpots.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-700 text-lg mb-4">
                  Found <span className="font-bold text-blue-600">{sortedSpots.length}</span> parking spot{sortedSpots.length !== 1 ? 's' : ''}
                </p>
                
                {userLocation && sortedSpots.some(spot => spot.distance !== undefined) && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 font-medium">Closest parking</span>
                          <p className="text-sm font-bold text-gray-900">{sortedSpots[0]?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-600">Distance</span>
                        <p className="text-sm font-bold text-blue-600">{sortedSpots[0]?.distance} km</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="h-20 bg-gray-200 rounded-xl"></div>
                        <div className="h-20 bg-gray-200 rounded-xl"></div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-white rounded-3xl shadow-lg border border-red-100 p-12 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchParkingSpots}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Grid of Cards */}
            {!loading && !error && sortedSpots.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedSpots.map((spot) => (
                  <ParkingSpotCard key={spot._id || spot.id} spot={spot} />
                ))}
              </div>
            )}

            {/* Empty State - Filtered */}
            {!loading && !error && sortedSpots.length === 0 && parkingSpots.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No parking spots match your filters</h3>
                <p className="text-gray-600">Try adjusting your search criteria to see more results</p>
              </div>
            )}

            {/* Empty State - No Data */}
            {!loading && !error && sortedSpots.length === 0 && parkingSpots.length === 0 && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No parking spots available</h3>
                <p className="text-gray-600">Check back later for available parking spots in your area</p>
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-xl overflow-hidden h-[calc(100vh-200px)]">
            <MapHolder 
              userLocation={userLocation}
              parkingSpots={sortedSpots}
              maxDistance={maxDistance}
              loading={loading}
              selectedSpot={selectedSpot}
              setSelectedSpot={setSelectedSpot}
            />
          </div>
        )}
      </div>

      {/* Filter Popup Modal - Using Portal */}
      <FilterModal />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .premium-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .premium-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .premium-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .premium-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
        }
      `}</style>
    </div>
  );
};

export default Parking;