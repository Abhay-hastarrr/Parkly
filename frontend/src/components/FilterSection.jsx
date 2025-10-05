import React, { useState } from 'react';

const FilterSection = ({
  // Location props
  userLocation,
  locationLoading,
  locationError,
  getUserLocation,
  parkingSpots,
  setParkingSpots,
  calculateDistancesForSpots,
  
  // Filter state props
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  maxDistance,
  setMaxDistance,
  parkingType,
  setParkingType,
  selectedAmenities,
  setSelectedAmenities,
  vehicleType,
  setVehicleType,
  city,
  setCity,
  sortBy,
  setSortBy,
  uniqueCities
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Available filter options
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

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 100]);
    setMaxDistance(800);
    setParkingType('all');
    setSelectedAmenities([]);
    setVehicleType('all');
    setCity('all');
    setSortBy('distance');
  };

  const activeFiltersCount = [
    searchQuery !== '',
    priceRange[1] !== 100,
    maxDistance !== 800,
    parkingType !== 'all',
    selectedAmenities.length > 0,
    vehicleType !== 'all',
    city !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
            </svg>
            <div>
              <h2 className="text-white font-semibold text-sm">Filters</h2>
              <p className="text-white/80 text-xs">
                {activeFiltersCount} active
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white text-xs font-medium px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      {/* Location Status */}
      <div className={`px-4 py-2.5 border-b text-sm ${
        userLocation ? 'bg-green-50 border-green-100' : 
        locationError ? 'bg-red-50 border-red-100' : 
        'bg-blue-50 border-blue-100'
      }`}>
        {locationLoading ? (
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Getting location...</span>
          </div>
        ) : userLocation ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              <span className="font-medium">Location enabled • {maxDistance}km radius</span>
            </div>
            <button
              onClick={() => getUserLocation(true)}
              className="p-1 hover:bg-green-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        ) : locationError ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="font-medium">Location unavailable</span>
            </div>
            <button
              onClick={() => getUserLocation(true)}
              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <button
            onClick={() => getUserLocation(true)}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Enable location for nearby spots
          </button>
        )}
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search location or parking name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        {/* Quick Controls */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {userLocation && <option value="distance">By Distance</option>}
            <option value="price">By Price</option>
            <option value="availability">By Available</option>
            <option value="name">By Name</option>
          </select>
          
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Vehicles</option>
            {vehicleTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200">
          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-gray-700">Price Range</label>
              <span className="text-sm font-semibold text-blue-600">₹{priceRange[0]} - ₹{priceRange[1]}/hr</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Distance */}
          {userLocation && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-700">Max Distance</label>
                <span className="text-sm font-semibold text-blue-600">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="1500"
                step="10"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Selects Grid */}
          <div className="grid grid-cols-2 gap-2">
            {uniqueCities.length > 1 && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Cities</option>
                  {uniqueCities.map((cityName) => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Parking Type</label>
              <select
                value={parkingType}
                onChange={(e) => setParkingType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {parkingTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Amenities {selectedAmenities.length > 0 && `(${selectedAmenities.length})`}
            </label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.value);
                return (
                  <button
                    key={amenity.value}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAmenities(selectedAmenities.filter(a => a !== amenity.value));
                      } else {
                        setSelectedAmenities([...selectedAmenities, amenity.value]);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amenity.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={clearAllFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;