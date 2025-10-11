import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '../utils/api';
import ParkingTicket from '../components/ParkingTicket';

const StatusBadge = ({ status }) => {
  const map = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', icon: '⏳' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', icon: '✓' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', icon: '✓' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', icon: '✕' },
  };
  const style = map[status] || map.pending;
  const label = (status || 'pending').replace('_', ' ').toUpperCase();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${style.bg} ${style.text}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}></span>
      {label}
    </span>
  );
};

const BookingCard = ({ booking, onViewTicket, onCancel }) => {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  
  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200">
      {/* Status Banner */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        booking.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
        booking.status === 'confirmed' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
        booking.status === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
        'bg-gradient-to-r from-red-500 to-pink-500'
      }`}></div>

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {booking.parkingSpot?.name || 'Unknown Spot'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>{booking.parkingSpot?.address?.city || 'N/A'}</span>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Date & Time */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Start Time</div>
                <div className="text-sm font-bold text-gray-900">
                  {new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-gray-600">
                  {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Duration</div>
                <div className="text-sm font-bold text-gray-900">{booking.durationHours} Hours</div>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Vehicle</div>
                <div className="text-sm font-bold text-gray-900">{booking.vehicleNumber || '—'}</div>
                <div className="text-xs text-gray-600">
                  {booking.vehicleType ? String(booking.vehicleType).replace('_',' ') : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Amount</div>
                <div className="text-sm font-bold text-emerald-600">₹{booking.amount}</div>
                <div className="text-xs text-gray-600 capitalize">{booking.paymentStatus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Badge */}
        <div className="mb-5">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg ${
            booking.paymentMethod === 'STRIPE' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            {booking.paymentMethod}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewTicket(booking)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            View Ticket
          </button>
          {canCancel && (
            <button
              onClick={() => onCancel(booking._id || booking.id)}
              className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-red-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/bookings/user/list');
      setBookings(data?.data || []);
    } catch (err) {
      console.error('User bookings fetch error:', err);
      toast.error(err?.message || 'Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
    toast.success('Bookings refreshed');
  };

  const handleCancel = async (id) => {
    const booking = bookings.find(b => (b._id || b.id) === id);
    if (!booking) return;
    if (booking.status === 'cancelled' || booking.status === 'completed') return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const data = await apiClient.patch(`/bookings/user/${id}/cancel`, {});
      toast.success('Booking cancelled successfully');
      setBookings(prev => prev.map(b => (b._id || b.id) === id ? data.data : b));
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error(err?.message || 'Failed to cancel booking');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = useMemo(() => {
    let result = bookings;
    
    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter(b => b.status === activeFilter);
    }
    
    // Filter by search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(b => {
        const spot = b.parkingSpot?.name?.toLowerCase() || '';
        const city = b.parkingSpot?.address?.city?.toLowerCase() || '';
        const vehicle = b.vehicleNumber?.toLowerCase() || '';
        const vtype = b.vehicleType ? String(b.vehicleType).replace('_',' ').toLowerCase() : '';
        return spot.includes(q) || city.includes(q) || vehicle.includes(q) || vtype.includes(q);
      });
    }
    
    return result;
  }, [bookings, search, activeFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    return { total, active, completed, cancelled };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">Manage all your parking reservations in one place</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600 font-medium">Total Bookings</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">{stats.active}</div>
            <div className="text-sm text-gray-600 font-medium">Active Bookings</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-600 font-medium">Completed</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.cancelled}</div>
            <div className="text-sm text-gray-600 font-medium">Cancelled</div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeFilter === filter
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Search Bar & Refresh */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by spot name, city, vehicle number, or type..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium text-lg">Loading your bookings...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {search ? 'Try adjusting your search criteria' : 'Start booking your first parking spot today'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((booking) => (
              <BookingCard
                key={booking._id || booking.id}
                booking={booking}
                onViewTicket={setActiveBooking}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Parking Ticket Modal */}
      {activeBooking && (
        <ParkingTicket
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
        />
      )}
    </div>
  );
};

export default UserBookings;