import React from 'react';
import { 
  MapPin, 
  DollarSign, 
  Car, 
  Shield, 
  Star,
  Navigation,
  Building,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';

const FilterSection = ({
  // Location props
  userLocation,
  locationLoading,
  locationError,
  getUserLocation,
  
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
    { value: 'cctv', label: 'CCTV', icon: '📹' },
    { value: 'security_guard', label: 'Security', icon: '👮' },
    { value: 'covered_parking', label: 'Covered', icon: '🏠' },
    { value: 'ev_charging', label: 'EV Charging', icon: '⚡' },
    { value: 'valet_service', label: 'Valet', icon: '🎩' },
    { value: 'washroom', label: 'Washroom', icon: '🚻' },
    { value: 'disabled_friendly', label: 'Accessible', icon: '♿' }
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
    <div className="space-y-6">
      
      {/* Location Status Card */}
      <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
        userLocation 
          ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200' 
          : locationError
          ? 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border-2 border-red-200'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200'
      }`}>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/40 rounded-full blur-2xl" />

        <div className="relative">
          {locationLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
              </div>
              <div>
                <p className="font-bold text-purple-900">Detecting Location...</p>
                <p className="text-sm text-purple-700">This will only take a moment</p>
              </div>
            </div>
          ) : userLocation ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Navigation className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-emerald-900 flex items-center gap-2">
                    Location Active
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </p>
                  <p className="text-sm text-emerald-700">Showing spots within {maxDistance}km</p>
                </div>
              </div>
              <button 
                onClick={() => getUserLocation(true)}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 hover:rotate-180 duration-300"
              >
                <Navigation className="w-5 h-5 text-emerald-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-red-900">Location Disabled</p>
                  <p className="text-sm text-red-700">Enable to find nearby spots</p>
                </div>
              </div>
              <button 
                onClick={() => getUserLocation(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm hover:scale-105"
              >
                Enable
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-white" />
            </div>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3.5 text-sm font-medium border-2 border-slate-200 rounded-xl bg-white hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem'
            }}
          >
            {userLocation && <option value="distance">📍 Nearest First</option>}
            <option value="price">💰 Cheapest First</option>
            <option value="availability">🅿️ Most Available</option>
            <option value="name">🔤 Name (A-Z)</option>
          </select>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-white" />
            </div>
            Vehicle Type
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full px-4 py-3.5 text-sm font-medium border-2 border-slate-200 rounded-xl bg-white hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem'
            }}
          >
            <option value="all">🚙 All Vehicles</option>
            {vehicleTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Parking Type */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Building className="w-3.5 h-3.5 text-white" />
            </div>
            Parking Type
          </label>
          <select
            value={parkingType}
            onChange={(e) => setParkingType(e.target.value)}
            className="w-full px-4 py-3.5 text-sm font-medium border-2 border-slate-200 rounded-xl bg-white hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem'
            }}
          >
            <option value="all">🅿️ All Types</option>
            {parkingTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* City */}
        {uniqueCities.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3.5 text-sm font-medium border-2 border-slate-200 rounded-xl bg-white hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="all">🌍 All Cities</option>
              {uniqueCities.map((c) => (
                <option key={c} value={c}>📍 {c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Price Range Slider */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-white" />
            </div>
            Price Range (per hour)
          </label>
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg">
              ₹{priceRange[0]}
            </span>
            <span className="text-slate-400 font-bold">-</span>
            <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg">
              ₹{priceRange[1]}
            </span>
          </div>
        </div>
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min="0"
            max="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 rounded-full appearance-none cursor-pointer premium-slider"
            style={{
              background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(219 39 119) ${priceRange[1]}%, rgb(226 232 240) ${priceRange[1]}%, rgb(226 232 240) 100%)`
            }}
          />
          <div className="flex justify-between mt-3 text-xs text-slate-500 font-semibold">
            <span>₹0</span>
            <span>₹25</span>
            <span>₹50</span>
            <span>₹75</span>
            <span>₹100+</span>
          </div>
        </div>
      </div>

      {/* Distance Slider */}
      {userLocation && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Navigation className="w-3.5 h-3.5 text-white" />
              </div>
              Maximum Distance
            </label>
            <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
              {maxDistance} km
            </span>
          </div>
          <div className="relative pt-2 pb-1">
            <input
              type="range"
              min="1"
              max="1500"
              step="10"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer distance-slider"
              style={{
                background: `linear-gradient(to right, rgb(37 99 235) 0%, rgb(79 70 229) ${(maxDistance / 1500) * 100}%, rgb(226 232 240) ${(maxDistance / 1500) * 100}%, rgb(226 232 240) 100%)`
              }}
            />
            <div className="flex justify-between mt-3 text-xs text-slate-500 font-semibold">
              <span>1km</span>
              <span>375km</span>
              <span>750km</span>
              <span>1125km</span>
              <span>1500km</span>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            Amenities & Features
          </label>
          {selectedAmenities.length > 0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-md">
              {selectedAmenities.length} selected
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {amenityOptions.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity.value);
            return (
              <button
                key={amenity.value}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedAmenities(selectedAmenities.filter(a => a !== amenity.value));
                  } else {
                    setSelectedAmenities([...selectedAmenities, amenity.value]);
                  }
                }}
                className={`relative px-4 py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="relative flex flex-col items-center gap-2">
                  <span className="text-2xl">{amenity.icon}</span>
                  <span className="text-xs text-center leading-tight">{amenity.label}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="pt-4 border-t-2 border-slate-200">
        <button
          type="button"
          onClick={clearAllFilters}
          disabled={activeFiltersCount === 0}
          className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
            activeFiltersCount > 0
              ? 'bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-slate-500/30 hover:shadow-xl hover:scale-[1.02]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Clear All Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .premium-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(147 51 234), rgb(219 39 119));
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.4), 0 0 0 4px rgba(147, 51, 234, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 16px rgba(147, 51, 234, 0.6), 0 0 0 6px rgba(147, 51, 234, 0.15);
        }
        
        .premium-slider::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }
        
        .premium-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(147 51 234), rgb(219 39 119));
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.4), 0 0 0 4px rgba(147, 51, 234, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .premium-slider::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 16px rgba(147, 51, 234, 0.6), 0 0 0 6px rgba(147, 51, 234, 0.15);
        }

        .distance-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(37 99 235), rgb(79 70 229));
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4), 0 0 0 4px rgba(37, 99, 235, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .distance-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.6), 0 0 0 6px rgba(37, 99, 235, 0.15);
        }
        
        .distance-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(37 99 235), rgb(79 70 229));
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4), 0 0 0 4px rgba(37, 99, 235, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .distance-slider::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.6), 0 0 0 6px rgba(37, 99, 235, 0.15);
        }
      `}</style>
    </div>
  );
};

export default FilterSection;