import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Tag, Image, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = ['Meetup', 'Conference', 'Hackathon', 'Workshop', 'Festival', 'Networking', 'Concert', 'Exhibition'];

export default function CreatePage({ onAuthOpen }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    city: '',
    country: '',
    lat: '',
    lng: '',
    capacity: '',
    category: '',
    tags: '',
    funding_goal: '',
    image_url: ''
  });

  // Redirect if not Google user
  if (!loading && (!user || user.auth_provider !== 'google')) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...form,
        lat: parseFloat(form.lat) || 0,
        lng: parseFloat(form.lng) || 0,
        capacity: parseInt(form.capacity) || 100,
        funding_goal: parseFloat(form.funding_goal) || 0,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      await axios.post(`${API}/events`, payload, { withCredentials: true });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.auth_provider !== 'google') return null;

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 font-body text-sm focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all";

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar onAuthOpen={onAuthOpen} />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
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

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            className="mb-10"
          >
            <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">Create Event</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mb-4">
              Launch Your <span className="text-gradient">Event</span>
            </h1>
            <p className="text-white/45 font-body text-base">Create a community-powered event with milestone-based funding.</p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Event Created!</h2>
              <p className="text-white/50 mb-6">Your event has been successfully created.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/explore')} className="btn-white py-3 px-6 text-sm">
                  View Events
                </button>
                <button onClick={() => { setSuccess(false); setForm({ title: '', description: '', date: '', venue: '', city: '', country: '', lat: '', lng: '', capacity: '', category: '', tags: '', funding_goal: '', image_url: '' }); setStep(1); }} className="btn-glass py-3 px-6 text-sm">
                  Create Another
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 sm:p-8"
            >
              {/* Step indicators */}
              <div className="flex gap-2 mb-8">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`flex-1 h-1 rounded-full ${step >= s ? 'bg-white' : 'bg-white/10'}`} />
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h3 className="font-display font-semibold text-lg text-white mb-4">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm text-white/50 mb-2 flex items-center gap-2">
                        <FileText size={14} /> Event Title
                      </label>
                      <input
                        name="title"
                        type="text"
                        placeholder="e.g., Seoul Web3 Builder Meetup"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        data-testid="create-title-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/50 mb-2">Description</label>
                      <textarea
                        name="description"
                        placeholder="What's your event about?"
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className={inputClass}
                        data-testid="create-description-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/50 mb-2 flex items-center gap-2">
                        <Tag size={14} /> Category
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        data-testid="create-category-select"
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-white/50 mb-2">Tags (comma separated)</label>
                      <input
                        name="tags"
                        type="text"
                        placeholder="e.g., Web3, Networking, DeFi"
                        value={form.tags}
                        onChange={handleChange}
                        className={inputClass}
                        data-testid="create-tags-input"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!form.title || !form.description || !form.category}
                      className="w-full btn-white py-4 text-sm mt-4 disabled:opacity-50"
                      data-testid="next-step-btn"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Step 2: Location & Date */}
                {step === 2 && (
                  <div className="space-y-5">
                    <h3 className="font-display font-semibold text-lg text-white mb-4">Location & Date</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/50 mb-2 flex items-center gap-2">
                          <Calendar size={14} /> Date
                        </label>
                        <input
                          name="date"
                          type="datetime-local"
                          value={form.date}
                          onChange={handleChange}
                          required
                          className={inputClass}
                          data-testid="create-date-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/50 mb-2 flex items-center gap-2">
                          <Users size={14} /> Capacity
                        </label>
                        <input
                          name="capacity"
                          type="number"
                          placeholder="100"
                          value={form.capacity}
                          onChange={handleChange}
                          required
                          min={1}
                          className={inputClass}
                          data-testid="create-capacity-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/50 mb-2 flex items-center gap-2">
                        <MapPin size={14} /> Venue
                      </label>
                      <input
                        name="venue"
                        type="text"
                        placeholder="e.g., Startup Alliance Seoul"
                        value={form.venue}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        data-testid="create-venue-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/50 mb-2">City</label>
                        <input
                          name="city"
                          type="text"
                          placeholder="Seoul"
                          value={form.city}
                          onChange={handleChange}
                          required
                          className={inputClass}
                          data-testid="create-city-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/50 mb-2">Country</label>
                        <input
                          name="country"
                          type="text"
                          placeholder="South Korea"
                          value={form.country}
                          onChange={handleChange}
                          required
                          className={inputClass}
                          data-testid="create-country-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/50 mb-2">Latitude</label>
                        <input
                          name="lat"
                          type="number"
                          step="any"
                          placeholder="37.5665"
                          value={form.lat}
                          onChange={handleChange}
                          className={inputClass}
                          data-testid="create-lat-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/50 mb-2">Longitude</label>
                        <input
                          name="lng"
                          type="number"
                          step="any"
                          placeholder="126.9780"
                          value={form.lng}
                          onChange={handleChange}
                          className={inputClass}
                          data-testid="create-lng-input"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 btn-glass py-4 text-sm"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!form.date || !form.venue || !form.city || !form.country}
                        className="flex-1 btn-white py-4 text-sm disabled:opacity-50"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Funding & Image */}
                {step === 3 && (
                  <div className="space-y-5">
                    <h3 className="font-display font-semibold text-lg text-white mb-4">Funding & Media</h3>
                    
                    <div>
                      <label className="block text-sm text-white/50 mb-2 flex items-center gap-2">
                        <DollarSign size={14} /> Funding Goal (USD)
                      </label>
                      <input
                        name="funding_goal"
                        type="number"
                        placeholder="5000"
                        value={form.funding_goal}
                        onChange={handleChange}
                        min={0}
                        className={inputClass}
                        data-testid="create-funding-input"
                      />
                      <p className="text-xs text-white/30 mt-1">Leave at 0 for events without crowdfunding</p>
                    </div>

                    <div>
                      <label className="block text-sm text-white/50 mb-2 flex items-center gap-2">
                        <Image size={14} /> Cover Image URL
                      </label>
                      <input
                        name="image_url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={form.image_url}
                        onChange={handleChange}
                        className={inputClass}
                        data-testid="create-image-input"
                      />
                    </div>

                    {form.image_url && (
                      <div className="mt-4">
                        <p className="text-xs text-white/40 mb-2">Preview:</p>
                        <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover rounded-xl opacity-70" />
                      </div>
                    )}

                    {error && (
                      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 btn-glass py-4 text-sm"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 btn-white py-4 text-sm disabled:opacity-50"
                        data-testid="create-submit-btn"
                      >
                        {submitting ? 'Creating...' : 'Create Event'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
