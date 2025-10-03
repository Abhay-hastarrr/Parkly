import React from 'react';
import { Info, MapPin } from 'lucide-react';

const BasicInfoCard = ({ name, setName, parkingType, setParkingType }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="bg-blue-100 p-3 rounded-lg mr-4">
          <Info className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
          <p className="text-sm text-gray-500 mt-1">Add the basic details of the parking spot.</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Parking Spot Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Downtown Spot A1"
              required
            />
            
          </div>
        </div>

        {/* Parking Type Select */}
        <div>
          <label htmlFor="parkingType" className="block text-sm font-semibold text-gray-700 mb-2">
            Parking Type
          </label>
          <select
            id="parkingType"
            value={parkingType}
            onChange={(e) => setParkingType(e.target.value)}
            placeholder="select parking type"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer"
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
    </div>
  );
};

export default BasicInfoCard;