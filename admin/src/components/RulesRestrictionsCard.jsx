import React from 'react';
import { 
  FileText, 
  Car, 
  Bike, 
  Truck, 
  Zap, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const RulesRestrictionsCard = ({ 
  allowedVehicleTypes = [], 
  setAllowedVehicleTypes,
  specialInstructions = '',
  setSpecialInstructions
}) => {
  
  const vehicleTypes = [
    {
      id: 'cars',
      name: 'Cars',
      icon: Car,
      description: 'Standard passenger cars and sedans'
    },
    {
      id: 'bikes',
      name: 'Bikes',
      icon: Bike,
      description: 'Motorcycles, scooters, and bicycles'
    },
    {
      id: 'trucks',
      name: 'Trucks',
      icon: Truck,
      description: 'Commercial trucks and heavy vehicles'
    },
    {
      id: 'electric_vehicles',
      name: 'Electric Vehicles',
      icon: Zap,
      description: 'Electric cars and hybrid vehicles'
    }
  ];

  const toggleVehicleType = (vehicleTypeId) => {
    setAllowedVehicleTypes(prev => {
      if (prev.includes(vehicleTypeId)) {
        return prev.filter(id => id !== vehicleTypeId);
      } else {
        return [...prev, vehicleTypeId];
      }
    });
  };

  const handleInstructionsChange = (e) => {
    setSpecialInstructions(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="bg-red-100 p-3 rounded-lg mr-4">
          <FileText className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Rules & Restrictions</h2>
          <p className="text-sm text-gray-500 mt-1">Define vehicle restrictions and special instructions for your parking spot.</p>
        </div>
      </div>

      {/* Vehicle Types Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Vehicle Types Allowed</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Select which types of vehicles are allowed to park in your spot.</p>
        
        {/* Vehicle Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicleTypes.map((vehicleType) => {
            const Icon = vehicleType.icon;
            const isSelected = allowedVehicleTypes.includes(vehicleType.id);
            
            return (
              <div
                key={vehicleType.id}
                onClick={() => toggleVehicleType(vehicleType.id)}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm
                  ${isSelected 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 bg-white hover:border-red-300'
                  }
                `}
              >
                {/* Checkbox */}
                <div className={`
                  absolute top-3 right-3 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
                  ${isSelected 
                    ? 'bg-red-500 border-red-500' 
                    : 'border-gray-300 bg-white'
                  }
                `}>
                  {isSelected && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex items-start space-x-3 pr-8">
                  <div className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isSelected 
                      ? 'bg-red-100' 
                      : 'bg-gray-100'
                    }
                  `}>
                    <Icon className={`
                      h-5 w-5 transition-all duration-200
                      ${isSelected 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                      }
                    `} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`
                      font-semibold text-sm mb-1 transition-all duration-200
                      ${isSelected 
                        ? 'text-red-800' 
                        : 'text-gray-800'
                      }
                    `}>
                      {vehicleType.name}
                    </h4>
                    
                    <p className={`
                      text-xs leading-relaxed transition-all duration-200
                      ${isSelected 
                        ? 'text-red-600' 
                        : 'text-gray-500'
                      }
                    `}>
                      {vehicleType.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected count */}
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-red-600">
              {allowedVehicleTypes.length}
            </span>
            {' '}vehicle type{allowedVehicleTypes.length !== 1 ? 's' : ''} allowed
          </p>
        </div>
      </div>

      {/* Special Instructions Section */}
      <div>
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Special Instructions</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Add any specific rules, instructions, or restrictions for parking in your spot.
        </p>
        
        <div className="space-y-2">
          <textarea
            id="specialInstructions"
            value={specialInstructions}
            onChange={handleInstructionsChange}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
            placeholder="e.g., Keep ticket for exit, no car washing allowed, maximum height 2.5m, payment due before leaving..."
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Be specific and clear with your instructions</span>
            <span>{specialInstructions.length}/500</span>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      {(allowedVehicleTypes.length === 0) && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 text-sm">No vehicle types selected</h4>
              <p className="text-amber-700 text-xs mt-1">
                Please select at least one vehicle type to specify what vehicles are allowed to park in your spot.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Example Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Example Instructions:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• "Keep parking ticket visible on dashboard for exit verification"</li>
          <li>• "No car washing or maintenance activities allowed"</li>
          <li>• "Maximum vehicle height: 2.5 meters"</li>
          <li>• "Payment must be completed before leaving the premises"</li>
          <li>• "Reserved spot - violators will be towed at owner's expense"</li>
        </ul>
      </div>
    </div>
  );
};

export default RulesRestrictionsCard;