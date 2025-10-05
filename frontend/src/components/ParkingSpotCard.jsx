import { parkingAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ParkingSpotCard = ({ spot }) => {
  const hourlyRate = spot.pricing?.hourlyRate || 0;
  const currency = spot.pricing?.currency === 'INR' ? '₹' : '$';
  const formattedAmenities = parkingAPI.formatAmenities(spot.amenities || []);
  const formattedVehicleTypes = parkingAPI.formatVehicleTypes(spot.allowedVehicleTypes || []);
  const formattedParkingType = parkingAPI.formatParkingType(spot.parkingType);
  const navigate = useNavigate();
  
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
        <button
          onClick={() => navigate(`/checkout/${spot._id || spot.id}`, { state: { spot } })}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

const ParkingSpotsSection = ({
  loading,
  error,
  sortedSpots,
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

export default ParkingSpotsSection;