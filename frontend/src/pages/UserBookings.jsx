import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '../utils/api';

const StatusBadge = ({ status }) => {
  const map = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  };
  const style = map[status] || map.pending;
  const label = (status || 'pending').replace('_', ' ');

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`}></span>
      {label}
    </span>
  );
};

const PaymentBadge = ({ method, paymentStatus }) => {
  const methodColor = method === 'STRIPE' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';
  const statusColor = paymentStatus === 'paid' ? 'text-green-700' : paymentStatus === 'failed' ? 'text-red-700' : 'text-yellow-700';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${methodColor}`}>
      <span>{method}</span>
      <span className={`${statusColor} font-semibold`}>• {paymentStatus}</span>
    </span>
  );
};

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
      toast.success('Booking cancelled');
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
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(b => {
      const spot = b.parkingSpot?.name?.toLowerCase() || '';
      const city = b.parkingSpot?.address?.city?.toLowerCase() || '';
      const vehicle = b.vehicleNumber?.toLowerCase() || '';
      return spot.includes(q) || city.includes(q) || vehicle.includes(q);
    });
  }, [bookings, search]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    return { total, active, completed };
  }, [bookings]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen relative overflow-hidden">
      {/* Floating animated shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '60%', right: '10%', animationDelay: '1s' }}></div>
        <div className="absolute w-80 h-80 bg-pink-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ bottom: '10%', left: '50%', animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-3 inline-flex items-center space-x-2 bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-xs text-blue-700 font-medium">Manage your bookings</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
              <span className="text-gray-900">Your</span>{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Bookings
              </span>
            </h1>
            <p className="text-base text-gray-600">
              View and manage all your parking reservations
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Bookings */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            {/* Active Bookings */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Active</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.active}</p>
                </div>
              </div>
            </div>

            {/* Completed Bookings */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Refresh */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by spot, city, or vehicle number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Parking Spot</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Start Time</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Duration</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Payment</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600 font-medium">Loading bookings...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No bookings found</h3>
                            <p className="text-gray-600 text-sm">
                              {search ? 'Try adjusting your search criteria' : 'Start booking your first parking spot'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b, idx) => (
                      <tr key={b._id || b.id} className={`border-t hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-4 text-gray-700">
                          <div className="font-semibold text-gray-900">{b.parkingSpot?.name || '—'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{b.parkingSpot?.address?.city || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          <div className="font-medium text-gray-800">
                            {new Date(b.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          <span className="font-semibold text-gray-800">{b.durationHours}h</span>
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          <span className="font-bold text-blue-600">₹{b.amount}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          <PaymentBadge method={b.paymentMethod} paymentStatus={b.paymentStatus} />
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-4 py-4 text-gray-700 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Navigate Button */}
                            <button
                              onClick={() => {
                                toast.info('Navigation feature coming soon!');
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-xs shadow-sm inline-flex items-center gap-1.5"
                              title="Navigate to location"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              Navigate
                            </button>

                            {/* Cancel Button */}
                            {(b.status === 'pending' || b.status === 'confirmed') && (
                              <button
                                onClick={() => handleCancel(b._id || b.id)}
                                className="px-3 py-1.5 bg-white-600 text-red rounded-lg hover:bg-red-700 transition-all duration-200 ease-in-out transform hover:scale-110 font-medium text-xs shadow-sm hover:shadow-lg inline-flex items-center gap-1.5"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookings;