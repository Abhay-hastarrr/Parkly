import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin login
  adminLogin: async (credentials) => {
    try {
      const response = await api.post('/auth/admin/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Generic API functions
export const apiClient = {
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  post: async (url, data, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  put: async (url, data, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Parking Spots API functions
export const parkingAPI = {
  // Get all parking spots (public)
  getAllParkingSpots: async (filters = {}) => {
    try {
      // Create a new axios instance without auth for public endpoints
      const publicApi = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await publicApi.get('/parking-spots/public', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single parking spot
  getParkingSpotById: async (id) => {
    try {
      const response = await api.get(`/parking-spots/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Distance calculation utility
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  },

  // Get user's current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  },

  // Format amenities for display
  formatAmenities: (amenities) => {
    const amenityMap = {
      'cctv': 'CCTV Surveillance',
      'security_guard': 'Security Guard',
      'covered_parking': 'Covered Parking',
      'ev_charging': 'EV Charging',
      'valet_service': 'Valet Service',
      'washroom': 'Washroom',
      'disabled_friendly': 'Disabled Friendly'
    };

    return amenities.map(amenity => amenityMap[amenity] || amenity);
  },

  // Format vehicle types for display
  formatVehicleTypes: (vehicleTypes) => {
    const vehicleMap = {
      'cars': 'Cars',
      'bikes': 'Bikes', 
      'trucks': 'Trucks',
      'electric_vehicles': 'Electric Vehicles'
    };

    return vehicleTypes.map(type => vehicleMap[type] || type);
  },

  // Format parking type for display
  formatParkingType: (parkingType) => {
    const typeMap = {
      'Covered Parking': 'Covered',
      'Uncovered Parking': 'Uncovered',
      'Valet Parking': 'Valet',
      'Self Parking': 'Self Parking',
      'Multi-Level Parking': 'Multi-Level',
      'EV Charging Station': 'EV Charging'
    };

    return typeMap[parkingType] || parkingType;
  }
};

export default api;
