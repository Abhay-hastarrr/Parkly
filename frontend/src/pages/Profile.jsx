import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/signin');
          return;
        }
        const data = await authAPI.getProfile();
        setProfile(data?.user || null);
        if (data?.user) {
          updateUser?.(data.user);
          setForm({ name: data.user.name || '', phone: data.user.phone || '' });
        }
      } catch (err) {
        console.error('Profile load error:', err);
        toast.error(err?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
          <div className="absolute w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '60%', right: '10%', animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen relative overflow-hidden">
        <div className="relative z-10 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No profile data</h3>
              <p className="text-gray-600 text-sm">Unable to load your profile information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = (profile.name || '').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    try {
      const payload = { name: form.name, phone: form.phone };
      const data = await authAPI.updateProfile(payload);
      setProfile(data.user);
      updateUser?.(data.user);
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      const msg = err?.message || (err?.errors && err.errors[0]) || 'Failed to update profile';
      toast.error(msg);
    }
  };

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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-3 inline-flex items-center space-x-2 bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-xs text-blue-700 font-medium">Your Account</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
              <span className="text-gray-900">My</span>{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="text-base text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Profile Header with Avatar */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white text-4xl font-bold shadow-lg mb-4">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {initials || 'U'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
              <p className="text-blue-100 text-sm">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Profile Details */}
            <div className="p-6 space-y-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-xs text-gray-600 font-medium mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Full Name
                    </div>
                    {editing ? (
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    ) : (
                      <div className="text-gray-900 font-semibold">{profile.name}</div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-xs text-gray-600 font-medium mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Address
                    </div>
                    <div className="text-gray-900 font-semibold">{profile.email}</div>
                  </div>

                  {/* Phone Field */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-xs text-gray-600 font-medium mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Phone Number
                    </div>
                    {editing ? (
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="e.g., +919876543210"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    ) : (
                      <div className="text-gray-900 font-semibold">{profile.phone || '—'}</div>
                    )}
                  </div>

                  {/* Role Field */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                    <div className="text-xs text-gray-600 font-medium mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Account Role
                    </div>
                    <div className="text-gray-900 font-semibold capitalize">{profile.role}</div>
                  </div>
                </div>
              </div>

              {/* Account Status Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Account Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Verification Status */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                    <div className="text-xs text-gray-600 font-medium mb-2">Verification</div>
                    <div className="flex items-center gap-2">
                      {profile.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-xs text-gray-600 font-medium mb-2">Status</div>
                    <div className="flex items-center gap-2">
                      {profile.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last Login */}
                  {profile.lastLogin && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                      <div className="text-xs text-gray-600 font-medium mb-2">Last Login</div>
                      <div className="text-gray-900 font-semibold text-sm">
                        {new Date(profile.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(profile.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                {editing ? (
                  <>
                    <button 
                      onClick={() => setEditing(false)} 
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={onSave} 
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-medium transition-all shadow-md"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setEditing(true)} 
                    className="px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:shadow-lg font-medium transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;