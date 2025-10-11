import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        navigate('/signin');
        return;
      }
      try {
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
    loadProfile();
  }, [isAuthenticated, navigate, updateUser]);

  const onSave = async () => {
    try {
      const data = await authAPI.updateProfile({ name: form.name, phone: form.phone });
      setProfile(data.user);
      updateUser?.(data.user);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const initials = (profile?.name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 text-center shadow-xl border border-slate-200/80">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Your Profile...</p>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 text-center shadow-xl border border-slate-200/80">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Profile Not Found</h3>
          <p className="text-slate-600">We couldn't retrieve your profile data. Please try again later.</p>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/10 border border-slate-200/80 overflow-hidden"
      >
        {/* Profile Header */}
        <div className="p-8 border-b border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{initials}</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-slate-800">{profile.name}</h2>
            <p className="text-slate-500">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-8">
          {/* Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InfoField label="Full Name" value={editing ? null : profile.name} icon="fa-solid fa-user">
              {editing && <InputField name="name" value={form.name} onChange={onChange} />}
            </InfoField>
            <InfoField label="Email Address" value={profile.email} icon="fa-solid fa-envelope" />
            <InfoField label="Phone Number" value={editing ? null : (profile.phone || 'Not provided')} icon="fa-solid fa-phone">
              {editing && <InputField name="phone" value={form.phone} onChange={onChange} placeholder="+1 (555) 123-4567" />}
            </InfoField>
            <InfoField label="Account Role" value={profile.role} icon="fa-solid fa-shield-halved" capitalize />
          </div>

          {/* Account Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatusBadge label="Verification" status={profile.isVerified ? 'Verified' : 'Pending'} type={profile.isVerified ? 'success' : 'warning'} />
            <StatusBadge label="Account Status" status={profile.isActive ? 'Active' : 'Inactive'} type={profile.isActive ? 'info' : 'default'} />
            {profile.lastLogin && <StatusBadge label="Last Login" status={new Date(profile.lastLogin).toLocaleDateString()} type="default" />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 p-6 bg-slate-50/50 border-t border-slate-200/80">
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div key="edit-buttons" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex gap-4">
                <button onClick={() => setEditing(false)} className="px-6 py-3 bg-white backdrop-blur-xl border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                  Cancel
                </button>
                <button onClick={onSave} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                  Save Changes
                </button>
              </motion.div>
            ) : (
              <motion.div key="view-buttons" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <button onClick={() => setEditing(true)} className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-pencil"></i> Edit Profile
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full pt-20 bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blobs - Aligned with homepage style */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-purple-100/40 to-pink-100/40 blur-3xl -top-32 -left-32 animate-pulse" style={{ animationDuration: '5s' }}></div>
      <div className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-cyan-100/40 to-purple-100/40 blur-3xl -bottom-20 right-10 animate-pulse" style={{ animationDuration: '6s' }}></div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-3">
            Your Account
          </h1>
          <p className="text-xl text-slate-500">
            Manage your personal information and account settings.
          </p>
        </motion.div>

        {renderContent()}
      </div>
      {/* Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

// Helper components for a cleaner structure
const InfoField = ({ label, value, icon, capitalize, children }) => (
  <div>
    <label className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
      <i className={`${icon} w-4 text-center text-purple-500`}></i>
      {label}
    </label>
    {value && <p className={`text-lg font-semibold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>}
    {children}
  </div>
);

const InputField = (props) => (
  <input {...props} className="w-full px-4 py-2 bg-slate-100/60 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
);

const StatusBadge = ({ label, status, type }) => {
  const colors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-slate-100 text-slate-800',
  };
  return (
    <div className="bg-white/50 p-4 rounded-xl border border-slate-200/80">
      <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
      <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${colors[type]}`}>
        {status}
      </span>
    </div>
  );
};

export default Profile;