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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

    if (form.paymentMethod === 'COD') {
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
      return;
    }

    if (form.paymentMethod === 'STRIPE') {
      try {
        setSubmitting(true);
        const res = await apiClient.post('/payments/stripe/checkout', {
          spotId,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          vehicleNumber: form.vehicleNumber,
          vehicleType: form.vehicleType,
          durationHours: Number(form.durationHours) || 1,
        });
        const url = res?.data?.url || res?.url;
        if (!url) throw new Error('Failed to get checkout URL');
        window.location.href = url;
        return;
      } catch (err) {
        console.error('Stripe Checkout error:', err);
        toast.error(err?.message || 'Unable to start Stripe Checkout');
      } finally {
        setSubmitting(false);
      }
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
        <div 
          className="fixed w-96 h-96 opacity-15 pointer-events-none z-50"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            left: (mousePosition.x - 192) + 'px',
            top: (mousePosition.y - 192) + 'px',
            filter: 'blur(60px)',
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-16 text-center max-w-md w-full">
            <div className="inline-block w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-slate-700 text-xl font-medium">Loading your checkout...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-16 text-center max-w-md w-full">
            <div className="text-7xl mb-6">🚗</div>
            <p className="text-slate-700 text-xl font-medium">Spot not found</p>
            <button 
              onClick={() => navigate('/parking')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Browse Available Spots
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currency = spot?.pricing?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden pt-8 pb-20">
      {/* Dynamic gradient orb that follows mouse */}
      <div 
        className="fixed w-96 h-96 opacity-15 pointer-events-none z-50"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          left: (mousePosition.x - 192) + 'px',
          top: (mousePosition.y - 192) + 'px',
          filter: 'blur(60px)',
          transition: 'all 0.3s ease-out'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div 
            ref={headerRef}
            className="text-center opacity-0 transition-all duration-1000"
            style={{ transform: 'translateY(30px)' }}
          >
            <div className="mb-6 inline-flex items-center space-x-2 bg-white/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-slate-700 font-semibold">Secure Checkout Process</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="text-slate-800">Complete Your</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-2">
                Parking Reservation
              </span>
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              You're just moments away from securing your perfect parking spot
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Spot Details */}
            <div 
              ref={spotCardRef}
              className="lg:col-span-1 space-y-6 opacity-0"
              style={{ transform: 'translateY(30px)' }}
            >
              {/* Spot Summary Card */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800">{spot.name}</h2>
                    <p className="text-sm text-slate-500">Your Selected Spot</p>
                  </div>
                </div>
                
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200 mb-6">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-green-700">{spot.availableSlots} spots available</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">ADDRESS</p>
                      <p className="text-sm text-slate-800 font-semibold mt-0.5">{spot.address?.fullAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl">
                    <svg className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">LOCATION</p>
                      <p className="text-sm text-slate-800 font-semibold mt-0.5">{spot.address?.locality}, {spot.address?.city}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">CAPACITY</p>
                      <p className="text-sm text-slate-800 font-semibold mt-0.5">{spot.totalSlots} total parking slots</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary - Sticky on Desktop */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Duration</span>
                    <span className="text-slate-800 font-semibold">{form.durationHours} hour{form.durationHours > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-lg font-semibold text-slate-800">Total Amount</span>
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      {currency}{priceEstimate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <form 
              ref={formRef}
              onSubmit={handleSubmit} 
              className="lg:col-span-2 space-y-6 opacity-0"
              style={{ transform: 'translateY(30px)' }}
            >
              {/* Personal Details */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Personal Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      name="customerName"
                      value={form.customerName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-slate-800 placeholder-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                    <input
                      name="customerPhone"
                      value={form.customerPhone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-slate-800 placeholder-slate-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Vehicle Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Vehicle Number</label>
                    <input
                      name="vehicleNumber"
                      value={form.vehicleNumber}
                      onChange={handleChange}
                      placeholder="MH 01 AB 1234"
                      className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-slate-800 placeholder-slate-400 uppercase"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Duration (hours)</label>
                    <input
                      type="number"
                      min="1"
                      name="durationHours"
                      value={form.durationHours}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-slate-800"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <label className="block text-sm font-semibold text-slate-700">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={form.vehicleType}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 text-slate-800"
                      required
                    >
                      <option value="">Select your vehicle type</option>
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
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  <label className={`group flex items-center space-x-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${form.paymentMethod === 'COD' ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-500/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={form.paymentMethod === 'COD'} 
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-lg">Cash on Delivery</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">POPULAR</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">Pay with cash when you arrive at the parking spot</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${form.paymentMethod === 'COD' ? 'bg-green-600 shadow-lg shadow-green-500/25' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                      <svg className={`w-6 h-6 transition-all duration-300 ${form.paymentMethod === 'COD' ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </label>

                  <label className={`group flex items-center space-x-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${form.paymentMethod === 'STRIPE' ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg shadow-purple-500/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="STRIPE" 
                      checked={form.paymentMethod === 'STRIPE'}
                      onChange={handleChange}
                      className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-lg">Razorpay</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">SECURE</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">Pay securely online with cards, UPI, or net banking</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${form.paymentMethod === 'STRIPE' ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                      <svg className={`w-6 h-6 transition-all duration-300 ${form.paymentMethod === 'STRIPE' ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="w-full sm:w-auto px-8 py-4 text-slate-700 bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    <span>Go Back</span>
                  </span>
                </button>
                
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className={`group relative w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg overflow-hidden transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    form.paymentMethod === 'COD' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <span>{form.paymentMethod === 'COD' ? 'Confirm Booking' : 'Pay with Razorpay'}</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </span>
                  )}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    form.paymentMethod === 'COD'
                      ? 'bg-gradient-to-r from-green-700 to-emerald-700'
                      : 'bg-gradient-to-r from-purple-700 to-pink-700'
                  }`} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center items-center gap-6 pt-6 pb-2">
                <div className="flex items-center space-x-2 text-slate-600">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <span className="text-sm font-medium">SSL Encrypted</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm font-medium">Instant Confirmation</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;