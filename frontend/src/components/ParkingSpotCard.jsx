import { parkingAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import React from 'react';

// ✅ NEW MODERN PARKING SPOT CARD (fully integrated)
const ParkingSpotCard = ({ spot }) => {
  const navigate = useNavigate();

  const hourlyRate = spot.pricing?.hourlyRate || 0;
  const currency = spot.pricing?.currency === 'INR' ? '₹' : '$';
  const formattedAmenities = parkingAPI.formatAmenities(spot.amenities || []);
  const formattedVehicleTypes = parkingAPI.formatVehicleTypes(spot.allowedVehicleTypes || []);
  const formattedParkingType = parkingAPI.formatParkingType(spot.parkingType);

  const availabilityPercentage = spot.totalSlots > 0 
    ? (spot.availableSlots / spot.totalSlots) * 100 
    : 0;

  const getAvailabilityColor = () => {
    if (availabilityPercentage > 50) return 'text-emerald-600 bg-emerald-50';
    if (availabilityPercentage > 20) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  

  const handleBookClick = () => {
    navigate(`/checkout/${spot._id || spot.id}`, { state: { spot } });
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Image Section with Overlay */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        {spot.imageUrl ? (
          <>
            <img 
              src={spot.imageUrl} 
              alt={spot.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-lg">
              {formattedParkingType}
            </span>
            
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-xl">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currency}{hourlyRate}
            </div>
            <div className="text-xs text-gray-600 font-medium text-center">per hour</div>
            {spot.pricing?.dailyRate && (
              <div className="text-xs text-gray-600 mt-1">
                {currency}{spot.pricing.dailyRate}/day
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {spot.name}
          </h3>
          <div className="flex items-start gap-2 text-gray-600">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div className="text-sm">
              <p className="font-medium">{spot.address?.fullAddress}</p>
              <p className="text-gray-500">{spot.address?.locality}, {spot.address?.city}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Distance */}
          {spot.distance !== undefined && (
            <div className="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Distance</div>
                <div className="text-sm font-bold text-gray-900">{spot.distance} km</div>
                <div className="text-xs text-blue-600">
                  {Math.round(spot.distance * 12)} min walk
                </div>
              </div>
            </div>
          )}

          {/* Operating Hours */}
          <div className="flex items-center gap-2 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-600 font-medium">Hours</div>
              <div className="text-sm font-bold text-gray-900">{spot.operatingHours}</div>
            </div>
          </div>

          {/* Availability */}
          <div className="col-span-2 flex items-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3">
            <div className={`w-10 h-10 ${getAvailabilityColor().split(' ')[1]} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-5 h-5 ${getAvailabilityColor().split(' ')[0]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600 font-medium">Availability</span>
                <span className={`text-sm font-bold ${getAvailabilityColor().split(' ')[0]}`}>
                  {spot.availableSlots || 0}/{spot.totalSlots || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    availabilityPercentage > 50 ? 'bg-emerald-500' : 
                    availabilityPercentage > 20 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${availabilityPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Types */}
        {formattedVehicleTypes.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
              Vehicle Types
            </div>
            <div className="flex flex-wrap gap-2">
              {formattedVehicleTypes.map((type, index) => (
                <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-lg shadow-sm">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {formattedAmenities.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              Amenities
            </div>
            <div className="flex flex-wrap gap-2">
              {formattedAmenities.slice(0, 4).map((amenity, index) => (
                <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
                  {amenity}
                </span>
              ))}
              {formattedAmenities.length > 4 && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  +{formattedAmenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {spot.specialInstructions && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <div className="text-xs font-semibold text-amber-900 mb-1">Important Note</div>
                <div className="text-xs text-amber-800 leading-relaxed">{spot.specialInstructions}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBookClick}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            Book Now
          </button>
        </div>

        {/* Daily Rate Footer */}
        {spot.pricing?.dailyRate && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            <span className="text-sm">
              Full day: <span className="font-bold text-gray-900">{currency}{spot.pricing.dailyRate}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ PRESERVED PARKING SPOTS SECTION (unchanged logic, just uses new card)
const ParkingSpotsSection = ({
  loading,
  error,
  sortedSpots = [],
  parkingSpots,
  fetchParkingSpots,
  userLocation
}) => {
  return (
    <div>
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
  );
};


export { ParkingSpotCard, ParkingSpotsSection };
export default ParkingSpotsSection;