import React from 'react';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

const Bookings = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Booking Management</h1>
          <p className="text-gray-600">Track and manage all parking spot reservations and bookings.</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <Calendar className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            The booking management system is under development. You'll be able to view, 
            manage, and track all reservations here.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Customer Bookings</h3>
              <p className="text-sm text-gray-600">View all customer reservations</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Booking Status</h3>
              <p className="text-sm text-gray-600">Track confirmed, pending, and completed bookings</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Real-time Updates</h3>
              <p className="text-sm text-gray-600">Live booking notifications and updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;