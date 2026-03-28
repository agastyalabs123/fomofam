import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TAGS = ['All', 'Hackathons', 'Networking', 'Conferences', 'Meetups', 'Workshops', 'Web3', 'AI', 'Music'];

export default function ExplorePage({ onAuthOpen }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events');
    }
  };

  const filtered = activeTag === 'All' ? events : events.filter(e =>
    e.tags?.some(t => t.toLowerCase().includes(activeTag.toLowerCase())) ||
    e.category?.toLowerCase().includes(activeTag.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar onAuthOpen={onAuthOpen} />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
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
            <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">Explore</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mb-4">
              Discover <span className="text-gradient">Events</span>
            </h1>
            <p className="text-white/45 font-body text-base">Find and join community events around the world.</p>
          </motion.div>

          {/* Filter tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-8"
            data-testid="filter-tags"
          >
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTag === tag
                    ? 'bg-white text-black'
                    : 'glass text-white/60 hover:text-white hover:bg-white/10'
                }`}
                data-testid={`filter-tag-${tag.toLowerCase()}`}
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* Events Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event, idx) => (
              <motion.div
                key={event.event_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5 hover:bg-white/8 transition-all cursor-pointer group"
                data-testid={`event-card-${event.event_id}`}
              >
                {event.image_url && (
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-white/5">
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}
                
                <h3 className="font-display font-bold text-white mb-2 group-hover:text-white/90">
                  {event.title}
                </h3>
                
                <p className="text-white/40 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white/50">
                    <Calendar size={12} />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/50">
                    <MapPin size={12} />
                    <span>{event.city}, {event.country}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-white/40 flex items-center gap-1">
                      <Users size={12} />
                      {event.attendee_count}/{event.capacity}
                    </span>
                    
                    {event.funding_goal > 0 && (
                      <span className="text-white/60 flex items-center gap-1">
                        <TrendingUp size={12} />
                        {Math.round((event.funding_raised / event.funding_goal) * 100)}% funded
                      </span>
                    )}
                  </div>
                </div>
                
                {event.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                    {event.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Compass size={28} className="text-white/40" />
              </div>
              <p className="text-white/50 mb-2">No events found</p>
              <p className="text-white/30 text-sm">Try a different filter or check back later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
