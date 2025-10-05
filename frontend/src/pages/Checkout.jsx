import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { parkingAPI, apiClient } from '../utils/api';

const Checkout = () => {
  const { spotId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const passedSpot = location.state?.spot;
  const [spot, setSpot] = useState(passedSpot || null);
  const [loading, setLoading] = useState(!passedSpot);
  const [submitting, setSubmitting] = useState(false);

  const headerRef = useRef(null);
  const spotCardRef = useRef(null);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    vehicleNumber: '',
    vehicleType: '',
    durationHours: 1,
    paymentMethod: 'COD',
  });

  useEffect(() => {
    const animateElements = () => {
      setTimeout(() => {
        if (headerRef.current) {
          headerRef.current.style.opacity = '1';
          headerRef.current.style.transform = 'translateY(0)';
        }
      }, 100);

      setTimeout(() => {
        if (spotCardRef.current) {
          spotCardRef.current.style.opacity = '1';
          spotCardRef.current.style.transform = 'translateY(0)';
        }
      }, 300);

      setTimeout(() => {
        if (formRef.current) {
          formRef.current.style.opacity = '1';
          formRef.current.style.transform = 'translateY(0)';
        }
      }, 500);
    };

    if (!loading) {
      animateElements();
    }
  }, [loading]);

  // Load spot if not passed via state: fetch public list and find by id
  useEffect(() => {
    const load = async () => {
      if (spot) return;
      try {
        setLoading(true);
        const res = await parkingAPI.getAllParkingSpots();
        const found = (res?.data || []).find((s) => (s._id || s.id) === spotId);
        if (!found) {
          toast.error('Parking spot not found');
          navigate('/parking');
          return;
        }
        setSpot(found);
      } catch (e) {
        console.error('Failed to load spot:', e);
        toast.error('Failed to load spot');
        navigate('/parking');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [spotId]);

  const priceEstimate = useMemo(() => {
    if (!spot) return 0;
    const hr = spot?.pricing?.hourlyRate;
    if (hr != null) return (Number(hr) || 0) * (Number(form.durationHours) || 1);
    return Number(spot?.pricing?.dailyRate || 0);
  }, [spot, form.durationHours]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in first');
      navigate('/signin');
      return;
    }
    if (!spot) return;
    if (!form.customerName || !form.customerPhone || !form.vehicleNumber || !form.vehicleType) {
      toast.warn('Please fill all required fields');
      return;
    }
    if (form.paymentMethod !== 'COD') {
      toast.info('Stripe checkout coming soon');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/bookings/user', {
        spotId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        vehicleNumber: form.vehicleNumber,
        vehicleType: form.vehicleType,
        durationHours: Number(form.durationHours) || 1,
        paymentMethod: 'COD',
      });

      toast.success('Booking created. Pay on arrival (COD).');
      navigate('/parking');
    } catch (err) {
      console.error('Booking error:', err);
      const msg = err?.message || err?.error || 'Failed to create booking';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
          <div className="absolute w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '60%', right: '10%', animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-lg">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        </div>
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">🚗</div>
              <p className="text-gray-600 text-lg">Spot not found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currency = spot?.pricing?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating animated shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '60%', right: '10%', animationDelay: '1s' }}></div>
        <div className="absolute w-80 h-80 bg-pink-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ bottom: '10%', left: '50%', animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div 
            ref={headerRef}
            className="text-center opacity-0 transition-all duration-1000"
            style={{ transform: 'translateY(30px)' }}
          >
            <div className="mb-4 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-100">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-blue-600 font-medium">Secure Checkout</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-3">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Complete Your Booking
              </span>
            </h1>
            <p className="text-gray-600 text-lg">Just a few details and you're all set!</p>
          </div>

          {/* Spot Summary Card */}
          <div 
            ref={spotCardRef}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 opacity-0"
            style={{ transform: 'translateY(30px)' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{spot.name}</h2>
                  <p className="text-sm text-gray-500">Selected Parking Spot</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium text-green-700">{spot.availableSlots} available</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{spot.address?.fullAddress}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{spot.address?.locality}, {spot.address?.city}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-pink-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Total Capacity</p>
                    <p className="font-medium text-gray-900">{spot.totalSlots} slots</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6 hover:shadow-xl transition-all duration-300 opacity-0"
            style={{ transform: 'translateY(30px)' }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                <input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                <input
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="e.g., +919876543210"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Vehicle Number</label>
                <input
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  placeholder="e.g., MH01AB1234"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                >
                  <option value="">Select vehicle type</option>
                  {(spot?.allowedVehicleTypes && spot.allowedVehicleTypes.length > 0
                    ? spot.allowedVehicleTypes
                    : ['cars','bikes','trucks','electric_vehicles']
                  ).map((vt) => (
                    <option key={vt} value={vt}>
                      {vt.replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Duration (hours)</label>
                <input
                  type="number"
                  min="1"
                  name="durationHours"
                  value={form.durationHours}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="pt-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Payment Method</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border-2 border-green-200 bg-green-50 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="COD" 
                    checked={form.paymentMethod === 'COD'} 
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                    <p className="text-sm text-gray-600">Pay when you arrive at the parking spot</p>
                  </div>
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 bg-gray-50 rounded-xl opacity-60 cursor-not-allowed">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="STRIPE" 
                    disabled
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-600">Stripe Payment</span>
                    <p className="text-sm text-gray-500">Coming soon...</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Duration</span>
                <span className="text-gray-900 font-semibold">{form.durationHours} hour{form.durationHours > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-blue-200">
                <span className="text-lg font-semibold text-gray-900">Estimated Amount</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currency}{priceEstimate}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                ← Back
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="group relative px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Confirm Booking
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;