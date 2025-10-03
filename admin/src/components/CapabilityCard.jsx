import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const CapabilityCard = ({ totalSlots, setTotalSlots, availableSlots, setAvailableSlots, operatingHours, setOperatingHours }) => {

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mt-8">
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="bg-yellow-100 p-3 rounded-lg mr-4">
          <SlidersHorizontal className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Capability and Availability</h2>
          <p className="text-sm text-gray-500 mt-1">Specify the parking spot's capacity and operating hours.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="totalSlots" className="block text-sm font-semibold text-gray-700 mb-2">
            Total Slots
          </label>
          <input
            type="number"
            name="totalSlots"
            id="totalSlots"
            value={totalSlots}
            onChange={(e) => setTotalSlots(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter the total number of slots"
          />
        </div>
        <div>
          <label htmlFor="availableSlots" className="block text-sm font-semibold text-gray-700 mb-2">
            Available Slots
          </label>
          <input
            type="number"
            name="availableSlots"
            id="availableSlots"
            value={availableSlots}
            onChange={(e) => setAvailableSlots(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter the number of available slots"
          />
        </div>
        <div>
          <label htmlFor="operatingHours" className="block text-sm font-semibold text-gray-700 mb-2">
            Operating Hours
          </label>
          <input
            type="text"
            name="operatingHours"
            id="operatingHours"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="e.g., 9:00 AM - 10:00 PM"
          />
        </div>
      </div>
    </div>
  );
};

export default CapabilityCard;
