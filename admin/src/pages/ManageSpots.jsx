import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  MapPin, 
  Car, 
  Clock, 
  DollarSign, 
  Edit3, 
  Trash2, 
  Search, 
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Calendar,
  Users,
  Zap,
  Shield,
  Camera,
  Bath,
  Accessibility,
  Image as ImageIcon,
  X
} from 'lucide-react';

const ManageSpots = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const { getAuthHeader } = useAuth();

  // Fetch all parking spots
  const fetchSpots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/parking-spots`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSpots(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch parking spots');
      }
    } catch (error) {
      toast.error('Error fetching parking spots');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete parking spot
  const handleDelete = async (spotId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/parking-spots/${spotId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Parking spot deleted successfully!');
        setSpots(spots.filter(spot => spot._id !== spotId));
        setDeleteModalOpen(false);
        setSelectedSpot(null);
      } else {
        toast.error(data.message || 'Failed to delete parking spot');
      }
    } catch (error) {
      toast.error('Error deleting parking spot');
      console.error('Delete error:', error);
    }
  };

  // Filter spots based on search and filter criteria
  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.address.locality.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || spot.parkingType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'cctv': Camera,
      'security_guard': Shield,
      'covered_parking': Car,
      'ev_charging': Zap,
      'valet_service': Users,
      'washroom': Bath,
      'disabled_friendly': Accessibility,
    };
    return iconMap[amenity] || Car;
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading parking spots...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manage Parking Spots</h1>
              <p className="text-gray-600 mt-1">View, edit, and manage all your parking spots</p>
            </div>
            <button
              onClick={fetchSpots}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Spots</p>
                  <p className="text-2xl font-bold text-gray-800">{spots.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {spots.reduce((sum, spot) => sum + spot.availableSlots, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Covered</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {spots.filter(spot => spot.parkingType === 'Covered Parking').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">EV Charging</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {spots.filter(spot => spot.amenities?.includes('ev_charging')).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, city, or locality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="Covered Parking">Covered Parking</option>
                  <option value="Uncovered Parking">Uncovered Parking</option>
                  <option value="Valet Parking">Valet Parking</option>
                  <option value="Self Parking">Self Parking</option>
                  <option value="Multi-Level Parking">Multi-Level Parking</option>
                  <option value="EV Charging Station">EV Charging Station</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Spots Grid/List */}
        {filteredSpots.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {spots.length === 0 ? 'No Parking Spots Found' : 'No Results Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {spots.length === 0 
                ? 'Start by adding your first parking spot.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSpots.map((spot) => (
              <div key={spot._id} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow duration-200">
                {/* Image */}
                <div className="relative h-48 bg-gray-200 rounded-t-xl overflow-hidden">
                  {spot.imageUrl ? (
                    <img 
                      src={spot.imageUrl} 
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSpot(spot);
                        setViewModalOpen(true);
                      }}
                      className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpot(spot);
                        setEditModalOpen(true);
                      }}
                      className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      title="Edit Spot"
                    >
                      <Edit3 className="h-4 w-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpot(spot);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      title="Delete Spot"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                  
                  {/* Type Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {spot.parkingType}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{spot.name}</h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{spot.address.locality}, {spot.address.city}</span>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">Available</p>
                      <p className="text-lg font-semibold text-green-600">
                        {spot.availableSlots}/{spot.totalSlots}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">Hourly Rate</p>
                      <p className="text-lg font-semibold text-blue-600">
                        ₹{spot.pricing?.hourlyRate || 0}
                      </p>
                    </div>
                  </div>
                  
                  {/* Amenities */}
                  {spot.amenities && spot.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {spot.amenities.slice(0, 4).map((amenity, index) => {
                        const IconComponent = getAmenityIcon(amenity);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-center w-6 h-6 bg-green-100 rounded text-green-600"
                            title={amenity.replace('_', ' ')}
                          >
                            <IconComponent className="h-3 w-3" />
                          </div>
                        );
                      })}
                      {spot.amenities.length > 4 && (
                        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-gray-600 text-xs">
                          +{spot.amenities.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Operating Hours */}
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{spot.operatingHours}</span>
                  </div>
                  
                  {/* Created Date */}
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Added {new Date(spot.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-24">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Delete Parking Spot</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to permanently delete <strong>"{selectedSpot.name}"</strong>? 
              This will remove all associated data including bookings and cannot be recovered.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedSpot(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedSpot._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && selectedSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-24">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedSpot.name}</h3>
                <p className="text-sm text-gray-600">Parking Spot Details</p>
              </div>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedSpot(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image and Basic Info */}
                <div>
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                    {selectedSpot.imageUrl ? (
                      <img 
                        src={selectedSpot.imageUrl} 
                        alt={selectedSpot.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Location</h4>
                      <p className="text-gray-600 text-sm">
                        {selectedSpot.address.fullAddress}<br/>
                        {selectedSpot.address.locality}, {selectedSpot.address.city}<br/>
                        {selectedSpot.address.state} - {selectedSpot.address.pincode}
                      </p>
                      {selectedSpot.address.landmark && (
                        <p className="text-gray-500 text-xs mt-1">
                          Near: {selectedSpot.address.landmark}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Parking Type</h4>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {selectedSpot.parkingType}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="space-y-6">
                  {/* Capacity & Availability */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Capacity & Availability</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Total Slots</p>
                        <p className="text-xl font-bold text-blue-600">{selectedSpot.totalSlots}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Available</p>
                        <p className="text-xl font-bold text-green-600">{selectedSpot.availableSlots}</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Occupied</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {selectedSpot.totalSlots - selectedSpot.availableSlots}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Pricing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedSpot.pricing?.hourlyRate && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Hourly</p>
                          <p className="text-lg font-semibold text-gray-800">
                            ₹{selectedSpot.pricing.hourlyRate}
                          </p>
                        </div>
                      )}
                      {selectedSpot.pricing?.dailyRate && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Daily</p>
                          <p className="text-lg font-semibold text-gray-800">
                            ₹{selectedSpot.pricing.dailyRate}
                          </p>
                        </div>
                      )}
                      {selectedSpot.pricing?.monthlyRate && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Monthly</p>
                          <p className="text-lg font-semibold text-gray-800">
                            ₹{selectedSpot.pricing.monthlyRate}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Operating Hours */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Operating Hours</h4>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{selectedSpot.operatingHours}</span>
                    </div>
                  </div>
                  
                  {/* Amenities */}
                  {selectedSpot.amenities && selectedSpot.amenities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Amenities & Facilities</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSpot.amenities.map((amenity, index) => {
                          const IconComponent = getAmenityIcon(amenity);
                          return (
                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                              <IconComponent className="h-4 w-4 text-green-600" />
                              <span>{amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Vehicle Types */}
                  {selectedSpot.allowedVehicleTypes && selectedSpot.allowedVehicleTypes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Allowed Vehicle Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSpot.allowedVehicleTypes.map((type, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Special Instructions */}
                  {selectedSpot.specialInstructions && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Special Instructions</h4>
                      <p className="text-gray-600 text-sm bg-yellow-50 p-3 rounded-lg">
                        {selectedSpot.specialInstructions}
                      </p>
                    </div>
                  )}
                  
                  {/* Creation Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Created: {new Date(selectedSpot.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedSpot.updatedAt !== selectedSpot.createdAt && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Updated: {new Date(selectedSpot.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
{/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setEditModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Spot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editModalOpen && selectedSpot && (
        <QuickEditModal
          spot={selectedSpot}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedSpot(null);
          }}
          onUpdate={(updatedSpot) => {
            setSpots(spots.map(spot => 
              spot._id === updatedSpot._id ? updatedSpot : spot
            ));
            setEditModalOpen(false);
            setSelectedSpot(null);
          }}
          getAuthHeader={getAuthHeader}
        />
      )}

    </div>
  );
};

// Quick Edit Modal Component
const QuickEditModal = ({ spot, isOpen, onClose, onUpdate, getAuthHeader }) => {
  const [formData, setFormData] = useState({
    name: spot.name || '',
    parkingType: spot.parkingType || 'Covered Parking',
    totalSlots: spot.totalSlots ?? 0,
    availableSlots: spot.availableSlots ?? 0,
    operatingHours: spot.operatingHours || '',
    pricing: {
      currency: spot.pricing?.currency || 'INR',
      hourlyRate: spot.pricing?.hourlyRate ?? '',
      dailyRate: spot.pricing?.dailyRate ?? '',
      monthlyRate: spot.pricing?.monthlyRate ?? '',
    },
    address: {
      fullAddress: spot.address?.fullAddress || '',
      locality: spot.address?.locality || '',
      landmark: spot.address?.landmark || '',
      city: spot.address?.city || '',
      state: spot.address?.state || '',
      pincode: spot.address?.pincode || '',
    },
    location: {
      latitude: spot.location?.latitude ?? '',
      longitude: spot.location?.longitude ?? '',
    },
    amenities: spot.amenities || [],
    allowedVehicleTypes: spot.allowedVehicleTypes || [],
    specialInstructions: spot.specialInstructions || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure availableSlots does not exceed totalSlots
      const total = parseInt(formData.totalSlots);
      const available = Math.min(parseInt(formData.availableSlots), total);

      const updateData = {
        name: formData.name,
        parkingType: formData.parkingType,
        totalSlots: isNaN(total) ? 0 : total,
        availableSlots: isNaN(available) ? 0 : available,
        operatingHours: formData.operatingHours,
        pricing: {
          currency: formData.pricing.currency || 'INR',
          hourlyRate: formData.pricing.hourlyRate === '' ? null : parseFloat(formData.pricing.hourlyRate),
          dailyRate: formData.pricing.dailyRate === '' ? null : parseFloat(formData.pricing.dailyRate),
          monthlyRate: formData.pricing.monthlyRate === '' ? null : parseFloat(formData.pricing.monthlyRate),
        },
        address: { ...formData.address },
        location: {
          latitude: formData.location.latitude === '' ? formData.location.latitude : parseFloat(formData.location.latitude),
          longitude: formData.location.longitude === '' ? formData.location.longitude : parseFloat(formData.location.longitude),
        },
        amenities: formData.amenities,
        allowedVehicleTypes: formData.allowedVehicleTypes,
        specialInstructions: formData.specialInstructions,
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/parking-spots/${spot._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Parking spot updated successfully!');
        onUpdate(data.data);
      } else {
        toast.error(data.message || 'Failed to update parking spot');
      }
    } catch (error) {
      toast.error('Error updating parking spot');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Basic text inputs (name, parkingType, operatingHours, specialInstructions)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Numeric inputs (totalSlots, availableSlots)
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const num = value === '' ? '' : Math.max(0, Number(value));
    setFormData(prev => ({
      ...prev,
      [name]: num
    }));
  };

  // Nested updates
  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [name]: value
      }
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const exists = prev[field].includes(item);
      return {
        ...prev,
        [field]: exists ? prev[field].filter(i => i !== item) : [...prev[field], item]
      };
    });
  };

  const toggleAmenity = (item) => toggleArrayItem('amenities', item);
  const toggleVehicleType = (item) => toggleArrayItem('allowedVehicleTypes', item);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-24">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[calc(100vh-140px)] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Quick Edit</h3>
            <p className="text-sm text-gray-600">{spot.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parking Type</label>
                <select
                  name="parkingType"
                  value={formData.parkingType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option>Covered Parking</option>
                  <option>Uncovered Parking</option>
                  <option>Valet Parking</option>
                  <option>Self Parking</option>
                  <option>Multi-Level Parking</option>
                  <option>EV Charging Station</option>
                </select>
              </div>
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Slots</label>
                <input
                  type="number"
                  name="totalSlots"
                  value={formData.totalSlots}
                  onChange={handleNumberChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots (out of {formData.totalSlots})</label>
                <input
                  type="number"
                  name="availableSlots"
                  value={formData.availableSlots}
                  onChange={handleNumberChange}
                  min="0"
                  max={formData.totalSlots}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
              <input
                type="text"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleInputChange}
                placeholder="e.g., 9:00 AM - 10:00 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Pricing */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Pricing</label>
                <select
                  name="currency"
                  value={formData.pricing.currency}
                  onChange={handlePricingChange}
                  className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.pricing.hourlyRate}
                  onChange={handlePricingChange}
                  placeholder="Hourly"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="dailyRate"
                  value={formData.pricing.dailyRate}
                  onChange={handlePricingChange}
                  placeholder="Daily"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="monthlyRate"
                  value={formData.pricing.monthlyRate}
                  onChange={handlePricingChange}
                  placeholder="Monthly"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                <input
                  type="text"
                  name="fullAddress"
                  value={formData.address.fullAddress}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
                <input
                  type="text"
                  name="locality"
                  value={formData.address.locality}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.address.landmark}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.address.pincode}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.location.latitude}
                  onChange={handleLocationChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.location.longitude}
                  onChange={handleLocationChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-3">
                {['cctv','security_guard','covered_parking','ev_charging','valet_service','washroom','disabled_friendly'].map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    <span>{amenity.replace('_',' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allowed Vehicle Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Vehicle Types</label>
              <div className="flex flex-wrap gap-3">
                {['cars','bikes','trucks','electric_vehicles'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.allowedVehicleTypes.includes(type)}
                      onChange={() => toggleVehicleType(type)}
                    />
                    <span>{type.replace('_',' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
              <span>{loading ? 'Updating...' : 'Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageSpots;
