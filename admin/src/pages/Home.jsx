import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, List, Calendar, User } from 'lucide-react';

const Home = () => {
  const { admin } = useAuth();

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gray-800 p-2 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, Admin!
              </h1>
            </div>
          </div>
          <p className="text-gray-700">
            Manage your parking spots, view bookings, and oversee your ParkHub operations from this dashboard.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/addspot" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 border-l-4 border-blue-500 group-hover:border-blue-600">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Add Parking Spot</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Create a new parking spot listing with all details, images, and pricing information.
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                Create New Spot →
              </div>
            </div>
          </Link>

          <Link to="/manage-spots" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 border-l-4 border-green-500 group-hover:border-green-600">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                  <List className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Manage Spots</h2>
              </div>
              <p className="text-gray-600 mb-4">
                View, edit, and manage all your existing parking spots in one centralized location.
              </p>
              <div className="text-green-600 font-medium group-hover:text-green-700 transition-colors">
                View All Spots →
              </div>
            </div>
          </Link>

          <Link to="/bookings" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 border-l-4 border-purple-500 group-hover:border-purple-600">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Bookings</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Track and manage all parking reservations and customer bookings.
              </p>
              <div className="text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
                View Bookings →
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
              <div className="text-gray-300">Total Parking Spots</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">0</div>
              <div className="text-gray-300">Active Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
              <div className="text-gray-300">Revenue This Month</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
