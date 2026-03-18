import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, MapPin, Edit2, Lock, Save, X, ArrowLeft, Trophy, Star, Users, Ticket } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfilePage({ onAuthOpen }) {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userEvents, setUserEvents] = useState({ created: [], attended: [] });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name || '', email: user.email || '' });
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    try {
      const res = await axios.get(`${API}/user/events`, { withCredentials: true });
      setUserEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch user events');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.put(`${API}/user/profile`, editForm, { withCredentials: true });
      setUser(res.data);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setSaveLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`${API}/user/password`, {
        current_password: passwordForm.current,
        new_password: passwordForm.newPass
      }, { withCredentials: true });
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to change password' });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'events', label: 'My Events', icon: Ticket },
    { id: 'settings', label: 'Settings', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar onAuthOpen={onAuthOpen} />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
            data-testid="back-to-home"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Home</span>
          </motion.button>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-6"
            data-testid="profile-header"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <img
                  src={user.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-2 border-white/20"
                  data-testid="profile-avatar"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="font-display font-bold text-2xl text-white mb-1" data-testid="profile-name">
                  {user.name}
                </h1>
                <p className="text-white/50 text-sm mb-3" data-testid="profile-email">{user.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <span className="glass px-3 py-1.5 rounded-full text-xs text-white/70 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="glass px-3 py-1.5 rounded-full text-xs text-white/70 capitalize flex items-center gap-1.5">
                    <User size={12} />
                    {user.role || 'Attendee'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2"
            data-testid="profile-tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'glass text-white/60 hover:text-white hover:bg-white/10'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Message */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl border ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
              data-testid="profile-message"
            >
              {message.text}
            </motion.div>
          )}

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="glass-card p-6" data-testid="profile-info-section">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg text-white">Personal Information</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-glass text-sm py-2 px-4 flex items-center gap-2"
                      data-testid="edit-profile-btn"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/50 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25"
                        required
                        data-testid="edit-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25"
                        required
                        data-testid="edit-email-input"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="btn-white py-3 px-6 text-sm flex items-center gap-2"
                        data-testid="save-profile-btn"
                      >
                        <Save size={14} />
                        {saveLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditing(false); setEditForm({ name: user.name, email: user.email }); }}
                        className="btn-glass py-3 px-6 text-sm flex items-center gap-2"
                        data-testid="cancel-edit-btn"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 glass rounded-xl">
                      <User size={18} className="text-white/40" />
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Full Name</p>
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 glass rounded-xl">
                      <Mail size={18} className="text-white/40" />
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Email Address</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reputation Stats - Coming Soon */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-white">Reputation Stats</h3>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                      COMING SOON
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-50">
                    {[
                      { icon: Trophy, label: 'Rep Score', value: '—' },
                      { icon: Star, label: 'Events Hosted', value: '—' },
                      { icon: Users, label: 'Connections', value: '—' },
                      { icon: Ticket, label: 'Attended', value: '—' },
                    ].map((stat, i) => (
                      <div key={i} className="glass p-4 rounded-xl text-center">
                        <stat.icon size={20} className="mx-auto mb-2 text-white/40" />
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-white/40">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6" data-testid="events-section">
                {/* Created Events */}
                <div className="glass-card p-6">
                  <h2 className="font-display font-semibold text-lg text-white mb-4">Events I Created</h2>
                  {userEvents.created.length > 0 ? (
                    <div className="space-y-3">
                      {userEvents.created.map((event) => (
                        <div key={event.event_id} className="glass p-4 rounded-xl flex items-center gap-4">
                          <img src={event.image_url} alt={event.title} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">{event.title}</h3>
                            <p className="text-sm text-white/50 flex items-center gap-1">
                              <MapPin size={12} /> {event.city}, {event.country}
                            </p>
                            <p className="text-sm text-white/50 flex items-center gap-1">
                              <Calendar size={12} /> {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-xs text-white/40">{event.attendee_count}/{event.capacity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm text-center py-8">No events created yet</p>
                  )}
                </div>

                {/* Attended Events */}
                <div className="glass-card p-6">
                  <h2 className="font-display font-semibold text-lg text-white mb-4">Events I Attended</h2>
                  {userEvents.attended.length > 0 ? (
                    <div className="space-y-3">
                      {userEvents.attended.map((event) => (
                        <div key={event.event_id} className="glass p-4 rounded-xl flex items-center gap-4">
                          <img src={event.image_url} alt={event.title} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">{event.title}</h3>
                            <p className="text-sm text-white/50 flex items-center gap-1">
                              <MapPin size={12} /> {event.city}, {event.country}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm text-center py-8">No events attended yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="glass-card p-6" data-testid="settings-section">
                <h2 className="font-display font-semibold text-lg text-white mb-6">Change Password</h2>
                
                {user.auth_provider === 'google' ? (
                  <div className="glass p-4 rounded-xl text-center">
                    <p className="text-white/50 text-sm">
                      You signed up with Google. Password management is handled by your Google account.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/50 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25"
                        required
                        data-testid="current-password-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPass}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25"
                        required
                        minLength={6}
                        data-testid="new-password-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25"
                        required
                        minLength={6}
                        data-testid="confirm-password-input"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="btn-white py-3 px-6 text-sm flex items-center gap-2 mt-2"
                      data-testid="change-password-btn"
                    >
                      <Lock size={14} />
                      {saveLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
