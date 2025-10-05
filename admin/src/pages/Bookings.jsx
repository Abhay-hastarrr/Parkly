import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, Trash2, RefreshCw, Search, CheckCircle, XCircle, CreditCard, Clock, Car } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const label = (status || 'pending').replace('_', ' ');
  return <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || colors.pending}`}>{label}</span>;
};

const PaymentBadge = ({ method, status }) => {
  const map = {
    COD: { icon: <CashIcon />, color: 'bg-gray-100 text-gray-800' },
    STRIPE: { icon: <CreditCard className="h-3 w-3" />, color: 'bg-purple-100 text-purple-800' },
  };
  const item = map[method] || map.COD;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${item.color}`}>
      {item.icon}
      <span>{method}</span>
      <span className={`ml-1 ${status === 'paid' ? 'text-green-700' : status === 'failed' ? 'text-red-700' : 'text-yellow-700'}`}>• {status}</span>
    </span>
  );
};

const CashIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2 3a3 3 0 106 0 3 3 0 00-6 0z"/></svg>
);

const Bookings = () => {
  const { getAuthHeader } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || 'Failed to fetch bookings');
        return;
      }
      setBookings(data?.data || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      toast.error('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm('Cancel and delete this booking? This will free a slot.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || 'Failed to delete booking');
        return;
      }
      toast.success('Booking cancelled');
      setBookings(prev => prev.filter(b => (b._id || b.id) !== id));
    } catch (err) {
      console.error('Delete booking error:', err);
      toast.error('Error deleting booking');
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
      const name = b.customerName?.toLowerCase() || '';
      const phone = b.customerPhone?.toLowerCase() || '';
      const vehicle = b.vehicleNumber?.toLowerCase() || '';
      const vtype = b.vehicleType ? String(b.vehicleType).replace('_',' ').toLowerCase() : '';
      return spot.includes(q) || name.includes(q) || phone.includes(q) || vehicle.includes(q) || vtype.includes(q);
    });
  }, [bookings, search]);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
            <p className="text-gray-600">View and manage all bookings. Cancel to free a slot.</p>
          </div>
          <button onClick={refresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Calendar className="h-6 w-6 text-blue-600" />} label="Total" value={bookings.length} />
          <StatCard icon={<Clock className="h-6 w-6 text-yellow-600" />} label="Pending" value={bookings.filter(b => b.status === 'pending').length} />
          <StatCard icon={<CheckCircle className="h-6 w-6 text-green-600" />} label="Completed" value={bookings.filter(b => b.status === 'completed').length} />
          <StatCard icon={<XCircle className="h-6 w-6 text-red-600" />} label="Cancelled" value={bookings.filter(b => b.status === 'cancelled').length} />
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
placeholder="Search by customer, phone, vehicle, vehicle type, or spot name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <Th>Spot</Th>
                <Th>Customer</Th>
                <Th>Vehicle</Th>
                <Th>Start</Th>
                <Th>Hours</Th>
                <Th>Amount</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-6 text-center text-gray-500">Loading bookings...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="p-6 text-center text-gray-500">No bookings found</td></tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b._id || b.id} className="border-t">
                    <Td>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-800">{b.parkingSpot?.name || '—'}</div>
                          <div className="text-xs text-gray-500">{b.parkingSpot?.address?.city}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="font-medium text-gray-800">{b.customerName}</div>
                      <div className="text-xs text-gray-500">{b.customerPhone}</div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span>{b.vehicleNumber}</span>
                        {b.vehicleType && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {String(b.vehicleType).replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>{new Date(b.startTime).toLocaleString()}</Td>
                    <Td>{b.durationHours}h</Td>
                    <Td>₹{b.amount}</Td>
                    <Td><PaymentBadge method={b.paymentMethod} status={b.paymentStatus} /></Td>
                    <Td><StatusBadge status={b.status} /></Td>
                    <Td className="text-right">
                      <button
                        onClick={() => handleDelete(b._id || b.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center gap-1"
                        title="Cancel booking"
                      >
                        <Trash2 className="h-4 w-4" /> Cancel
                      </button>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Th = ({ children, className = '' }) => (
  <th className={`text-left px-4 py-3 font-semibold ${className}`}>{children}</th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-gray-700 align-top ${className}`}>{children}</td>
);

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-3">
    <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
    </div>
  </div>
);

export default Bookings;
