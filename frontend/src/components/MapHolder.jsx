import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced custom icons with purple/pink theme
const createIcon = (color, type = 'parking') => {
  const svgIcon = type === 'user'
    ? `<svg viewBox="0 0 32 32" width="32" height="32">
         <defs>
           <filter id="glow-${color}" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
             <feOffset dx="0" dy="2" result="offsetblur"/>
             <feComponentTransfer>
               <feFuncA type="linear" slope="0.4"/>
             </feComponentTransfer>
             <feMerge>
               <feMergeNode/>
               <feMergeNode in="SourceGraphic"/>
             </feMerge>
           </filter>
           <linearGradient id="grad-user-${color}" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
             <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
           </linearGradient>
         </defs>
         <circle cx="16" cy="16" r="13" fill="url(#grad-user-${color})" opacity="0.2"/>
         <circle cx="16" cy="16" r="11" fill="url(#grad-user-${color})" stroke="white" stroke-width="4" filter="url(#glow-${color})"/>
         <circle cx="16" cy="16" r="6" fill="white"/>
         <circle cx="16" cy="16" r="3" fill="#9333ea" opacity="0.8"/>
       </svg>`
    : `<svg viewBox="0 0 32 40" width="32" height="40">
         <defs>
           <linearGradient id="grad-${color}" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
             <stop offset="100%" style="stop-color:${color};stop-opacity:0.85" />
           </linearGradient>
           <filter id="shadow-${color}" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
             <feOffset dx="0" dy="3" result="offsetblur"/>
             <feComponentTransfer>
               <feFuncA type="linear" slope="0.4"/>
             </feComponentTransfer>
             <feMerge>
               <feMergeNode/>
               <feMergeNode in="SourceGraphic"/>
             </feMerge>
           </filter>
         </defs>
         <path d="M16 2C11.03 2 7 6.03 7 11c0 7 9 19 9 19s9-12 9-19c0-4.97-4.03-9-9-9z" 
               fill="url(#grad-${color})" stroke="white" stroke-width="2.5" filter="url(#shadow-${color})"/>
         <circle cx="16" cy="11" r="5" fill="white" opacity="0.95"/>
         <text x="16" y="14.5" font-family="Arial, sans-serif" font-size="9" font-weight="bold" 
               fill="${color}" text-anchor="middle">P</text>
       </svg>`;
  return new L.DivIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [32, type === 'user' ? 32 : 40],
    iconAnchor: type === 'user' ? [16, 16] : [16, 40],
    popupAnchor: [0, type === 'user' ? -16 : -40],
  });
};

const userIcon = createIcon('#9333ea', 'user');

const parkingIcons = {
  high: createIcon('#10b981'),
  medium: createIcon('#f59e0b'),
  low: createIcon('#ef4444'),
  full: createIcon('#64748b'),
};

const MapController = ({ userLocation, parkingSpots, maxDistance }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation || parkingSpots.length > 0) {
      const bounds = L.latLngBounds();
      let hasPoints = false;
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
        hasPoints = true;
      }
      if (parkingSpots.length > 0) {
        parkingSpots.forEach(spot => {
          if (spot.location?.latitude && spot.location?.longitude) {
            bounds.extend([spot.location.latitude, spot.location.longitude]);
            hasPoints = true;
          }
        });
      }
      if (hasPoints) {
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
      }
    }
  }, [map, userLocation, parkingSpots, maxDistance]);
  return null;
};

const RangeCircle = ({ userLocation, maxDistance }) => {
  if (!userLocation) return null;
  return (
    <Circle
      center={[userLocation.latitude, userLocation.longitude]}
      radius={maxDistance}
      pathOptions={{
        fillColor: '#9333ea',
        fillOpacity: 0.08,
        color: '#9333ea',
        weight: 2,
        opacity: 0.4,
        dashArray: '8, 8',
      }}
    />
  );
};

const AdvancedRouting = ({ userLocation, destination, onRouteFound, onError }) => {
  const map = useMap();
  const routeLineRef = useRef(null);
  const hasCalledCallbackRef = useRef(false);
  const abortControllerRef = useRef(null);
  const routeKeyRef = useRef('');

  useEffect(() => {
    if (!userLocation || !destination || !map) return;

    const routeKey = `${userLocation.latitude.toFixed(6)}-${userLocation.longitude.toFixed(6)}-${destination.latitude.toFixed(6)}-${destination.longitude.toFixed(6)}`;
    if (routeKeyRef.current === routeKey) return;
    routeKeyRef.current = routeKey;

    hasCalledCallbackRef.current = false;

    const getRoute = async () => {
      try {
        abortControllerRef.current = new AbortController();
        const timeoutId = setTimeout(() => {
          abortControllerRef.current.abort();
        }, 20000);

        const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
        const requestBody = {
          coordinates: [
            [userLocation.longitude, userLocation.latitude],
            [destination.longitude, destination.latitude]
          ],
          instructions: true,
          units: 'm'
        };

        const apiKey = import.meta.env.VITE_ORS_API_KEY;
        if (!apiKey) {
          clearTimeout(timeoutId);
          if (!hasCalledCallbackRef.current && onError) {
            hasCalledCallbackRef.current = true;
            onError(new Error('No API key'));
          }
          return;
        }

        const headers = {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json',
          'Authorization': apiKey
        };

        const response = await fetch(url, {
          method: 'POST',
          signal: abortControllerRef.current.signal,
          headers,
          body: JSON.stringify(requestBody)
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`ORS API error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.features?.[0]) {
          throw new Error('No route found');
        }

        const route = data.features[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const properties = route.properties;

        if (routeLineRef.current) {
          map.removeLayer(routeLineRef.current);
        }

        const routeLine = L.polyline(coordinates, {
          color: '#9333ea',
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        routeLineRef.current = routeLine;
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50], maxZoom: 16 });

        const steps = (properties.segments || []).flatMap(seg => seg.steps || []);
        if (!hasCalledCallbackRef.current && onRouteFound) {
          hasCalledCallbackRef.current = true;
          onRouteFound({
            distance: properties.summary?.distance || 0,
            time: properties.summary?.duration || 0,
            instructions: steps
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        if (!hasCalledCallbackRef.current && onError) {
          hasCalledCallbackRef.current = true;
          onError(error);
        }
      }
    };

    getRoute();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (routeLineRef.current && map) {
        try {
          map.removeLayer(routeLineRef.current);
        } catch (e) {
          console.warn('MapHolder: Failed to remove route line layer', e);
        }
      }
    };
  }, [userLocation.latitude, userLocation.longitude, destination.latitude, destination.longitude, userLocation, destination, map, onRouteFound, onError]);

  return null;
};

const MapHolder = ({ 
  userLocation, 
  parkingSpots = [], 
  maxDistance = 1000, 
  loading = false 
}) => {
  const [routeDestination, setRouteDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRouting, setShowRouting] = useState(false);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [tileIndex, setTileIndex] = useState(0);
  const mapRef = useRef();
  const navigate = useNavigate();
  const defaultCenter = [28.6139, 77.2090];
  const mapCenter = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : (parkingSpots.length > 0 && parkingSpots[0].location 
      ? [parkingSpots[0].location.latitude, parkingSpots[0].location.longitude]
      : defaultCenter);

  const tileProviders = useMemo(() => ([
    {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
    }
  ]), []);
  const currentTile = tileProviders[tileIndex % tileProviders.length];

  const getAvailabilityStatus = (spot) => {
    const availableSlots = spot.availableSlots || 0;
    const totalSlots = spot.totalSlots || 1;
    const percentage = (availableSlots / totalSlots) * 100;
    if (availableSlots === 0) return 'full';
    if (percentage > 50) return 'high';
    if (percentage > 20) return 'medium';
    return 'low';
  };

  const formatPrice = (spot) => {
    const hourlyRate = spot.pricing?.hourlyRate;
    if (!hourlyRate) return 'Price not available';
    return `₹${hourlyRate}/hr`;
  };

  const handleSpotSelect = (spot) => {
    navigate(`/checkout/${spot._id}`);
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch (e) {
          console.warn('MapHolder: Failed to clear geolocation watch', e);
        }
      }
    };
  }, [watchId]);

  const handleNavigateToSpot = (spot) => {
    if (!userLocation) {
      toast.error('Location is required for navigation. Please enable location services.');
      return;
    }
    if (!spot.location?.latitude || !spot.location?.longitude) {
      toast.error('This parking spot is missing valid coordinates for navigation.');
      return;
    }
    const destination = {
      latitude: spot.location.latitude,
      longitude: spot.location.longitude,
      name: spot.name
    };
    const useBuiltInNavigation = window.confirm(
      `Navigate to ${spot.name}?\nClick OK to use built-in map navigation\nClick Cancel to open in your default maps app`
    );
    if (useBuiltInNavigation) {
      const popups = document.querySelectorAll('.leaflet-popup-close-button');
      popups.forEach(popup => popup.click());
      setRouteDestination(destination);
      setShowRouting(true);
      setRoutingLoading(true);
      startLiveTracking();
    } else {
      const mapsUrl = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${destination.latitude},${destination.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleRouteFound = useCallback((route) => {
    setRouteInfo(route);
    setRoutingLoading(false);
    setErrorMessage(null);
  }, []);

  const handleRoutingError = useCallback((error) => {
    setRoutingLoading(false);
    let msg = 'Unable to calculate route. Please try again.';
    if (error?.message?.includes('No API key')) {
      msg = 'Routing is unavailable: missing API key.';
    } else if (error?.message?.includes('No route found')) {
      msg = 'No route could be found between your location and this spot.';
    } else if (error?.message?.includes('ORS API error')) {
      const status = error.message.split(':')[1]?.trim();
      msg = `Routing service error${status ? ` (${status})` : ''}.`;
    } else if (error?.name === 'TypeError') {
      msg = 'Network error while contacting routing service.';
    }
    setErrorMessage(msg);
    toast.error(msg);
  }, []);

  const startLiveTracking = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    };
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLiveLocation(newLocation);
      },
      (error) => {
        let msg = 'Location error.';
        if (error?.code === 1) {
          msg = 'Location permission denied. Please enable it in your browser settings.';
        } else if (error?.code === 2) {
          msg = 'Location unavailable. Please try again.';
        } else if (error?.code === 3) {
          msg = 'Location request timed out. Please retry.';
        }
        setErrorMessage(msg);
        toast.error(msg);
      },
      options
    );
    setWatchId(id);
  };

  const stopLiveTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setLiveLocation(null);
  };

  const handleCloseRouting = () => {
    setShowRouting(false);
    setRouteDestination(null);
    setRouteInfo(null);
    setRoutingLoading(false);
    setErrorMessage(null);
    stopLiveTracking();
  };

  const formatRouteTime = (seconds) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatRouteDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-24"
      >
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl shadow-xl shadow-purple-500/10 border border-purple-200/50 h-[720px] flex flex-col items-center justify-center backdrop-blur-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6 w-48 h-48">
              <DotLottieReact
                src="/maploader.lottie"
                loop
                autoplay
              />
            </div>
            <h3 className="text-slate-800 font-bold text-xl mb-2">Loading Map</h3>
            <p className="text-slate-600 text-sm">Finding parking spots near you...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-24"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/10 border border-purple-200/50 h-[720px] overflow-hidden relative">
        <div className="relative p-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 border-b-2 border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 backdrop-blur-sm"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              {showRouting && routeDestination ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl shadow-lg"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                      </svg>
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white drop-shadow-md">
                        Directions to {routeDestination.name}
                      </h3>
                      {routingLoading ? (
                        <p className="text-sm text-white/90 flex items-center mt-1">
                          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Calculating optimal route...
                        </p>
                      ) : routeInfo && (
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center text-white/95 text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm font-medium">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {formatRouteDistance(routeInfo.distance)}
                          </span>
                          <span className="flex items-center text-white/95 text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm font-medium">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatRouteTime(routeInfo.time)}
                          </span>
                        </div>
                      )}
                      {errorMessage && (
                        <div className="mt-2 bg-red-50/95 text-red-700 border border-red-200 rounded-lg px-3 py-2 flex items-center justify-between">
                          <span className="text-xs font-semibold">{errorMessage}</span>
                          {routeDestination && (liveLocation || userLocation) && (
                            <button
                              onClick={() => {
                                const origin = `${(liveLocation || userLocation).latitude},${(liveLocation || userLocation).longitude}`;
                                const dest = `${routeDestination.latitude},${routeDestination.longitude}`;
                                const url = `https://www.google.com/maps/dir/${origin}/${dest}`;
                                window.open(url, '_blank');
                              }}
                              className="ml-3 text-xs font-bold text-red-700 underline hover:text-red-800"
                            >
                              Open in Google Maps
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white drop-shadow-md">
                      Available Parking Spots
                    </h3>
                    <p className="text-sm text-white/90 font-medium">
                      {parkingSpots.length} locations found
                      {userLocation && ` within ${(maxDistance/1000).toFixed(1)}km radius`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {showRouting ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseRouting}
                  className="flex items-center space-x-2 bg-white text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Close</span>
                </motion.button>
              ) : (
                <div className="hidden md:flex items-center space-x-3 bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm ring-2 ring-white/50"></div>
                    <span className="text-white text-xs font-semibold">Available</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm ring-2 ring-white/50"></div>
                    <span className="text-white text-xs font-semibold">Limited</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm ring-2 ring-white/50"></div>
                    <span className="text-white text-xs font-semibold">Full</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-[calc(100%-90px)] relative">
          {parkingSpots.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/20">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Parking Spots Found</h3>
              <p className="text-slate-600 text-center max-w-md px-6 leading-relaxed">
                We couldn't find any parking locations in this area. Try adjusting your search filters or explore a different location.
              </p>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={userLocation ? 14 : 12}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              className="z-0"
            >
              <TileLayer
                attribution={currentTile.attribution}
                url={currentTile.url}
                eventHandlers={{
                  tileerror: () => {
                    toast.error('Map tiles failed to load. Switching to a backup map provider...');
                    setTileIndex((i) => i + 1);
                  }
                }}
              />
              <MapController 
                userLocation={userLocation} 
                parkingSpots={parkingSpots}
                maxDistance={maxDistance}
              />
              {(liveLocation || userLocation) && (
                <>
                  <Marker
                    position={[
                      (liveLocation || userLocation).latitude, 
                      (liveLocation || userLocation).longitude
                    ]}
                    icon={userIcon}
                  >
                    <Popup>
                      <div className="text-center p-3">
                        <div className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 text-base flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {liveLocation ? 'Live Location' : 'Your Location'}
                        </div>
                        <p className="text-sm text-slate-700 mb-1">
                          {liveLocation ? 'Updating in real-time' : 'Current position'}
                        </p>
                        {liveLocation && liveLocation.accuracy && (
                          <p className="text-xs text-slate-500 bg-purple-100 px-2 py-1 rounded-full inline-block">
                            Accuracy: ±{Math.round(liveLocation.accuracy)}m
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                  <RangeCircle 
                    userLocation={liveLocation || userLocation} 
                    maxDistance={maxDistance} 
                  />
                </>
              )}
              {showRouting && routeDestination && (liveLocation || userLocation) && (
                <AdvancedRouting
                  userLocation={liveLocation || userLocation}
                  destination={routeDestination}
                  onRouteFound={handleRouteFound}
                  onError={handleRoutingError}
                />
              )}
              {parkingSpots.map((spot) => {
                if (!spot.location?.latitude || !spot.location?.longitude) return null;
                const availabilityStatus = getAvailabilityStatus(spot);
                const icon = parkingIcons[availabilityStatus];
                return (
                  <Marker
                    key={spot._id}
                    position={[spot.location.latitude, spot.location.longitude]}
                    icon={icon}
                  >
                    <Popup className="custom-popup" maxWidth={340}>
                      <div className="p-1">
                        {spot.imageUrl && (
                          <div className="relative mb-3 rounded-xl overflow-hidden shadow-md">
                            <img 
                              src={spot.imageUrl} 
                              alt={spot.name}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                              {formatPrice(spot)}
                            </div>
                          </div>
                        )}
                        <h4 className="font-bold text-xl mb-3 text-slate-900 leading-tight">
                          {spot.name}
                        </h4>
                        <div className="space-y-2.5 mb-4">
                          <div className="flex items-center space-x-2 text-slate-700">
                            <div className="bg-purple-100 p-1.5 rounded-lg">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium">
                              {spot.address?.locality}, {spot.address?.city}
                            </span>
                          </div>
                          {!spot.imageUrl && (
                            <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200/50">
                              <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-lg">
                                  {formatPrice(spot)}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-slate-700 font-semibold">
                                {spot.availableSlots}/{spot.totalSlots} available
                              </span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                              availabilityStatus === 'high' ? 'bg-emerald-100 text-emerald-700' :
                              availabilityStatus === 'medium' ? 'bg-amber-100 text-amber-700' :
                              availabilityStatus === 'low' ? 'bg-red-100 text-red-700' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {availabilityStatus === 'full' ? 'FULL' : 
                               availabilityStatus === 'low' ? 'LIMITED' :
                               availabilityStatus === 'medium' ? 'MODERATE' : 'AVAILABLE'}
                            </div>
                          </div>
                          {spot.distance && (
                            <div className="flex items-center space-x-2 text-slate-700">
                              <div className="bg-purple-100 p-1.5 rounded-lg">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium">
                                {(spot.distance / 1000).toFixed(1)} km away from you
                              </span>
                            </div>
                          )}
                          <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-200/50">
                            <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                            </svg>
                            {spot.parkingType}
                          </div>
                          {spot.amenities && spot.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {spot.amenities.slice(0, 4).map((amenity, index) => (
                                <span 
                                  key={index}
                                  className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold border border-slate-200"
                                >
                                  {amenity.replace('_', ' ')}
                                </span>
                              ))}
                              {spot.amenities.length > 4 && (
                                <span className="text-xs text-slate-500 font-bold px-2 py-1">
                                  +{spot.amenities.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 pt-2">
                          {userLocation && (
                            <button
                              onClick={() => handleNavigateToSpot(spot)}
                              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-3 py-3 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all text-sm font-bold flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 transform"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                              </svg>
                              Navigate
                            </button>
                          )}
                          <button
                            onClick={() => handleSpotSelect(spot)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 transform"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-purple-200/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                {liveLocation ? (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 rounded-xl border border-purple-200">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-purple-400 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-purple-700 font-bold">Live Tracking</span>
                    <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                      ±{Math.round(liveLocation.accuracy)}m
                    </span>
                  </div>
                ) : userLocation ? (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 rounded-xl border border-emerald-200">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                    <span className="text-emerald-700 font-bold">Location Active</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                    <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-600 font-semibold">Location Off</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-slate-500 font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>OpenStreetMap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MapHolder;