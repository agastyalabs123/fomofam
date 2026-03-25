import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Users, DollarSign, Link2, FileText, ChevronDown, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const REGIONS = [
  'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Middle East', 'Online / Virtual'
];

export default function CreatePage({ onAuthOpen }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: '',
    funding_goal: '',
    region: '',
    luma_link: '',
    attendee_limit: ''
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.description || !form.event_type || !form.region) {
      setError('Please fill in all required fields');
      return;
    }

    if ((form.event_type === 'crowdfunded' || form.event_type === 'sponsored') && !form.funding_goal) {
      setError('Please enter a funding goal');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        funding_goal: parseFloat(form.funding_goal) || 0,
        region: form.region,
        luma_link: form.luma_link || null,
        attendee_limit: parseInt(form.attendee_limit) || null,
        date: selectedDate ? selectedDate.toISOString() : null
      };

      await axios.post(`${API}/events/create`, payload, { withCredentials: true });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      event_type: '',
      funding_goal: '',
      region: '',
      luma_link: '',
      attendee_limit: ''
    });
    setSelectedDate(null);
    setSuccess(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const showFundingField = form.event_type === 'crowdfunded' || form.event_type === 'sponsored';

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
            <p className="text-white/45 font-body text-base">Create a community-powered event. Fill in the details below.</p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center"
              data-testid="create-success"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Sparkles size={28} className="text-green-400" />
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Event Created!</h2>
              <p className="text-white/50 mb-6">Your event has been submitted successfully.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/')} className="btn-white py-3 px-6 text-sm">
                  Back to Home
                </button>
                <button onClick={resetForm} className="btn-glass py-3 px-6 text-sm">
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name */}
                <div>
                  <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                    <FileText size={14} /> Event Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g., Seoul Web3 Builder Meetup"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/25 transition-all"
                    data-testid="create-title-input"
                  />
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Event Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="What's your event about? What can attendees expect?"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/25 transition-all resize-none"
                    data-testid="create-description-input"
                  />
                </div>

                {/* Event Type Dropdown */}
                <div>
                  <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                    <ChevronDown size={14} /> Event Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="event_type"
                    value={form.event_type}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/25 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                    data-testid="create-event-type-select"
                  >
                    <option value="" className="bg-[#1a1a1a]">Select event type</option>
                    <option value="normal" className="bg-[#1a1a1a]">Open Event - Free registration, anyone can join</option>
                    <option value="crowdfunded" className="bg-[#1a1a1a]">Crowdfunded - Community-funded with milestone goals</option>
                    <option value="sponsored" className="bg-[#1a1a1a]">Sponsored - Looking for sponsors to fund</option>
                  </select>
                </div>

                {/* Funding Goal - Conditional */}
                {showFundingField && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                      <DollarSign size={14} /> 
                      {form.event_type === 'crowdfunded' ? 'Crowdfunding Goal' : 'Sponsorship Amount Needed'} 
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input
                        name="funding_goal"
                        type="number"
                        placeholder="5000"
                        value={form.funding_goal}
                        onChange={handleChange}
                        min={0}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/25 transition-all"
                        data-testid="create-funding-input"
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-1">
                      {form.event_type === 'crowdfunded' 
                        ? 'Amount you want to raise from the community' 
                        : 'Amount you\'re seeking from sponsors'}
                    </p>
                  </motion.div>
                )}

                {/* Region */}
                <div>
                  <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                    <MapPin size={14} /> Region <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/25 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                    data-testid="create-region-select"
                  >
                    <option value="" className="bg-[#1a1a1a]">Select region</option>
                    {REGIONS.map(region => (
                      <option key={region} value={region} className="bg-[#1a1a1a]">{region}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                    <CalendarIcon size={14} /> Event Date <span className="text-white/30">(optional)</span>
                  </label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-left text-sm focus:outline-none focus:border-white/25 transition-all flex items-center justify-between"
                        data-testid="create-date-input"
                      >
                        <span className={selectedDate ? 'text-white' : 'text-white/25'}>
                          {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                        </span>
                        <CalendarIcon size={16} className="text-white/40" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/10" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setCalendarOpen(false);
                        }}
                        initialFocus
                        className="bg-[#1a1a1a] text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Luma Link */}
                <div>
                  <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                    <Link2 size={14} /> Luma Link <span className="text-white/30">(optional)</span>
                  </label>
                  <input
                    name="luma_link"
                    type="url"
                    placeholder="https://lu.ma/your-event"
                    value={form.luma_link}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/25 transition-all"
                    data-testid="create-luma-input"
                  />
                  <p className="text-xs text-white/30 mt-1">Already have a Luma event? Add the link here</p>
                </div>

                {/* Attendee Limit */}
                <div>
                  <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                    <Users size={14} /> Attendee Limit <span className="text-white/30">(optional)</span>
                  </label>
                  <input
                    name="attendee_limit"
                    type="number"
                    placeholder="100"
                    value={form.attendee_limit}
                    onChange={handleChange}
                    min={1}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/25 transition-all"
                    data-testid="create-limit-input"
                  />
                  <p className="text-xs text-white/30 mt-1">Leave empty for unlimited attendees</p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
                    data-testid="create-error"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-white py-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="create-submit-btn"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Creating Event...
                    </span>
                  ) : (
                    'Create Event'
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
