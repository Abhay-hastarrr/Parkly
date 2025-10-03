import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BasicInfoCard from '../components/BasicInfoCard';
import LocationCard from '../components/LocationCard';
import CapabilityCard from '../components/CapabilityCard';
import PricingCard from '../components/PricingCard';
import AmenitiesCard from '../components/AmenitiesCard';
import ImageUploadCard from '../components/ImageUploadCard';
import RulesRestrictionsCard from '../components/RulesRestrictionsCard';

const AddSpot = () => {
  const { getAuthHeader } = useAuth();
  const [name, setName] = useState('');
  const [parkingType, setParkingType] = useState('Covered Parking');
  const [address, setAddress] = useState({
    fullAddress: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [coordinates, setCoordinates] = useState({ lat: 20.5937, lng: 78.9629 }); // Updated to India center

  // ✅ ADD MISSING STATE FOR CAPABILITY CARD
  const [totalSlots, setTotalSlots] = useState('');
  const [availableSlots, setAvailableSlots] = useState('');
  const [operatingHours, setOperatingHours] = useState('');

  // ✅ ADD PRICING STATE
  const [hourlyRate, setHourlyRate] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [currency, setCurrency] = useState('INR');

  // ✅ ADD AMENITIES STATE
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // ✅ ADD IMAGE STATE
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // ✅ ADD RULES & RESTRICTIONS STATE
  const [allowedVehicleTypes, setAllowedVehicleTypes] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if at least one pricing rate is set
    const hasValidPricing = hourlyRate || dailyRate || monthlyRate;
    
    // Check if at least one vehicle type is selected
    if (!name || !totalSlots || !availableSlots || !operatingHours || !hasValidPricing) {
      toast.warn('Please fill in all required fields including at least one pricing rate.');
      return;
    }
    
    if (allowedVehicleTypes.length === 0) {
      toast.warn('Please select at least one vehicle type allowed for parking.');
      return;
    }

    setIsLoading(true);
    setIsImageUploading(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add all form fields
    formData.append('name', name);
    formData.append('parkingType', parkingType);
    formData.append('address', JSON.stringify(address));
    formData.append('location', JSON.stringify({ latitude: coordinates.lat, longitude: coordinates.lng }));
    formData.append('totalSlots', parseInt(totalSlots, 10));
    formData.append('availableSlots', parseInt(availableSlots, 10));
    formData.append('operatingHours', operatingHours);
    formData.append('pricing', JSON.stringify({
      currency,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      dailyRate: dailyRate ? parseFloat(dailyRate) : null,
      monthlyRate: monthlyRate ? parseFloat(monthlyRate) : null,
    }));
    formData.append('amenities', JSON.stringify(selectedAmenities));
    formData.append('allowedVehicleTypes', JSON.stringify(allowedVehicleTypes));
    formData.append('specialInstructions', specialInstructions);
    
    // Add image if selected
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/parking-spots`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
        body: formData, // Remove Content-Type header to let browser set it with boundary
      });

      if (response.ok) {
        toast.success('Parking spot added successfully!');
        // Reset all fields
        setName('');
        setParkingType('Covered Parking');
        setAddress({
          fullAddress: '',
          locality: '',
          landmark: '',
          city: '',
          state: '',
          pincode: '',
        });
        setCoordinates({ lat: 20.5937, lng: 78.9629 });
        setTotalSlots('');
        setAvailableSlots('');
        setOperatingHours('');
        setHourlyRate('');
        setDailyRate('');
        setMonthlyRate('');
        setCurrency('INR');
        setSelectedAmenities([]);
        setSelectedImage(null);
        setImageUrl(null);
        setAllowedVehicleTypes([]);
        setSpecialInstructions('');
      } else {
        toast.error('Failed to add parking spot.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsImageUploading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 flex justify-center">
      {/* Parent Card */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Add New Parking Spot</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info Card */}
          <BasicInfoCard
            name={name}
            setName={setName}
            parkingType={parkingType}
            setParkingType={setParkingType}
          />

          {/* Location Card */}
          <LocationCard
            address={address}
            setAddress={setAddress}
            setCoordinates={setCoordinates}
          />

          {/* ✅ Capability Card - now with proper state */}
          <CapabilityCard
            totalSlots={totalSlots}
            setTotalSlots={setTotalSlots}
            availableSlots={availableSlots}
            setAvailableSlots={setAvailableSlots}
            operatingHours={operatingHours}
            setOperatingHours={setOperatingHours}
          />

          {/* ✅ Pricing Card */}
          <PricingCard
            hourlyRate={hourlyRate}
            setHourlyRate={setHourlyRate}
            dailyRate={dailyRate}
            setDailyRate={setDailyRate}
            monthlyRate={monthlyRate}
            setMonthlyRate={setMonthlyRate}
            currency={currency}
            setCurrency={setCurrency}
          />

          {/* ✅ Amenities Card */}
          <AmenitiesCard
            selectedAmenities={selectedAmenities}
            setSelectedAmenities={setSelectedAmenities}
          />

          {/* ✅ Image Upload Card */}
          <ImageUploadCard
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            isUploading={isImageUploading}
            setIsUploading={setIsImageUploading}
          />

          {/* ✅ Rules & Restrictions Card */}
          <RulesRestrictionsCard
            allowedVehicleTypes={allowedVehicleTypes}
            setAllowedVehicleTypes={setAllowedVehicleTypes}
            specialInstructions={specialInstructions}
            setSpecialInstructions={setSpecialInstructions}
          />

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !name}
              className={`w-full py-4 px-2 rounded-md font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading || !name
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Publish Listing
                </>
              )}
            </button>
          </div>

          {/* Info Footer */}
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 text-center">
              Make sure all information is accurate before submitting
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpot;