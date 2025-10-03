import React from 'react';
import { DollarSign } from 'lucide-react';

const PricingCard = ({ 
  hourlyRate, 
  setHourlyRate, 
  dailyRate, 
  setDailyRate, 
  monthlyRate, 
  setMonthlyRate,
  currency,
  setCurrency 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mt-8">
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="bg-green-100 p-3 rounded-lg mr-4">
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pricing Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Set the pricing structure for the parking spot.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>
        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-semibold text-gray-700 mb-2">
            Hourly Rate
          </label>
          <input
            type="number"
            name="hourlyRate"
            id="hourlyRate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="dailyRate" className="block text-sm font-semibold text-gray-700 mb-2">
            Daily Rate
          </label>
          <input
            type="number"
            name="dailyRate"
            id="dailyRate"
            value={dailyRate}
            onChange={(e) => setDailyRate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="monthlyRate" className="block text-sm font-semibold text-gray-700 mb-2">
            Monthly Rate
          </label>
          <input
            type="number"
            name="monthlyRate"
            id="monthlyRate"
            value={monthlyRate}
            onChange={(e) => setMonthlyRate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
      </div>
      
    </div>
  );
};

export default PricingCard;