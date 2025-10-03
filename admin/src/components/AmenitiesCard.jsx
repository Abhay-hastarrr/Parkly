import React from 'react';
import { 
  Shield, 
  Camera, 
  Car, 
  Zap, 
  Users, 
  Bath, 
  Accessibility,
  CheckCircle2
} from 'lucide-react';

const AmenitiesCard = ({ 
  selectedAmenities = [], 
  setSelectedAmenities 
}) => {
  
  const amenities = [
    {
      id: 'cctv',
      name: 'CCTV Surveillance',
      icon: Camera,
      description: '24/7 security camera monitoring'
    },
    {
      id: 'security_guard',
      name: 'Security Guard',
      icon: Shield,
      description: 'On-site security personnel'
    },
    {
      id: 'covered_parking',
      name: 'Covered Parking',
      icon: Car,
      description: 'Protected from weather conditions'
    },
    {
      id: 'ev_charging',
      name: 'EV Charging Station',
      icon: Zap,
      description: 'Electric vehicle charging points'
    },
    {
      id: 'valet_service',
      name: 'Valet Service',
      icon: Users,
      description: 'Professional valet parking assistance'
    },
    {
      id: 'washroom',
      name: 'Washroom Access',
      icon: Bath,
      description: 'Clean restroom facilities available'
    },
    {
      id: 'disabled_friendly',
      name: 'Disabled-friendly',
      icon: Accessibility,
      description: 'Wheelchair accessible with special provisions'
    }
  ];

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenityId)) {
        return prev.filter(id => id !== amenityId);
      } else {
        return [...prev, amenityId];
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="bg-green-100 p-3 rounded-lg mr-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Amenities & Facilities</h2>
          <p className="text-sm text-gray-500 mt-1">Select the available amenities and facilities for this parking spot.</p>
        </div>
      </div>

      {/* Amenities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selectedAmenities.includes(amenity.id);
          
          return (
            <div
              key={amenity.id}
              onClick={() => toggleAmenity(amenity.id)}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                ${isSelected 
                  ? 'border-green-500 bg-green-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-green-300'
                }
              `}
            >
              {/* Selection indicator */}
              <div className={`
                absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all duration-200
                ${isSelected 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300'
                }
              `}>
                {isSelected && (
                  <CheckCircle2 className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                )}
              </div>

              {/* Icon and content */}
              <div className="flex flex-col items-start">
                <div className={`
                  p-2 rounded-lg mb-3 transition-all duration-200
                  ${isSelected 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                  }
                `}>
                  <Icon className={`
                    h-5 w-5 transition-all duration-200
                    ${isSelected 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                    }
                  `} />
                </div>
                
                <h3 className={`
                  font-semibold text-sm mb-1 transition-all duration-200
                  ${isSelected 
                    ? 'text-green-800' 
                    : 'text-gray-800'
                  }
                `}>
                  {amenity.name}
                </h3>
                
                <p className={`
                  text-xs leading-relaxed transition-all duration-200
                  ${isSelected 
                    ? 'text-green-600' 
                    : 'text-gray-500'
                  }
                `}>
                  {amenity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected count */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-green-600">
            {selectedAmenities.length}
          </span> 
          {' '}amenities selected
        </p>
      </div>
    </div>
  );
};

export default AmenitiesCard;