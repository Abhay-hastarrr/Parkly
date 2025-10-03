import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Helper component to programmatically change map view
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const LocationCard = ({ address, setAddress, setCoordinates }) => {
  // Start with a central India location instead of London
  const [position, setPosition] = useState([20.5937, 78.9629]); // Approximate center of India
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setCoordinates({ lat, lng });
        }
      },
    }),
    [setCoordinates]
  );

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Geocode pincode to update map
  useEffect(() => {
    const fetchCoordinates = async () => {
      const { pincode } = address;
      // Validate: must be exactly 6 digits
      if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
        return;
      }

      try {
        const cleanPincode = pincode.trim();
        // Improved query for Indian pincodes
        const query = `${cleanPincode}, India`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
        );
        const data = await response.json();

        if (data.length > 0) {
          const { lat, lon } = data[0];
          const newLat = parseFloat(lat);
          const newLng = parseFloat(lon);
          setPosition([newLat, newLng]);
          setCoordinates({ lat: newLat, lng: newLng });
        } else {
          console.warn('No location found for pincode:', cleanPincode);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    const timer = setTimeout(fetchCoordinates, 1000);
    return () => clearTimeout(timer);
  }, [address.pincode, setCoordinates]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mt-8">
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="bg-purple-100 p-3 rounded-lg mr-4">
          <MapPin className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Location Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Provide the location details of the parking spot.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullAddress" className="block text-sm font-semibold text-gray-700 mb-2">
            Full Address
          </label>
          <input
            type="text"
            name="fullAddress"
            id="fullAddress"
            value={address.fullAddress || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter the full address"
          />
        </div>
        <div>
          <label htmlFor="locality" className="block text-sm font-semibold text-gray-700 mb-2">
            Locality/Neighbourhood
          </label>
          <input
            type="text"
            name="locality"
            id="locality"
            value={address.locality || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter the locality or neighbourhood"
          />
        </div>
        <div>
          <label htmlFor="landmark" className="block text-sm font-semibold text-gray-700 mb-2">
            Landmark
          </label>
          <input
            type="text"
            name="landmark"
            id="landmark"
            value={address.landmark || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter a nearby landmark"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            id="city"
            value={address.city || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter the city"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            name="state"
            id="state"
            value={address.state || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter the state"
          />
        </div>
        <div>
          <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700 mb-2">
            Pincode
          </label>
          <input
            type="text"
            name="pincode"
            id="pincode"
            value={address.pincode || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter the 6-digit pincode"
            maxLength={6}
          />
        </div>
      </div>
      <div className="mt-8 h-64 w-full rounded-lg overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={position} zoom={13} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
          >
            <Popup>Drag the marker to set the exact location.</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationCard;