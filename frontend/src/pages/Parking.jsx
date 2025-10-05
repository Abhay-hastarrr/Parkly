import { useState, useEffect, useRef } from 'react';
import { parkingAPI } from '../utils/api';
import FilterSection from '../components/FilterSection.jsx';
import ParkingSpotsSection from '../components/ParkingSpotCard.jsx';
import MapHolder from '../components/MapHolder.jsx';

const Parking = () => {
  // Animation refs
  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const mapRef = useRef(null);

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
      await fetchParkingSpots();
      await getUserLocation(false);
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
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="bg-white min-h-screen relative py-6">
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

              <ParkingSpotsSection
                loading={loading}
                error={error}
                sortedSpots={sortedSpots}
                parkingSpots={parkingSpots}
                fetchParkingSpots={fetchParkingSpots}
                userLocation={userLocation}
              />
            </div>

            {/* Right Section - Map */}
            <div 
              ref={mapRef}
              className="lg:w-[55%] opacity-0 transition-all duration-1000"
              style={{ transform: 'translateX(50px)' }}
            >
              <MapHolder />
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