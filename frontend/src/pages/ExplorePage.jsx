import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Compass, Sparkles, Bot, RefreshCw, Calendar, MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SOURCE_COLORS = {
  solana: 'from-purple-500 to-purple-600',
  cryptonomads: 'from-orange-500 to-orange-600', 
  ethglobal: 'from-blue-500 to-blue-600'
};

const SOURCE_NAMES = {
  solana: 'Solana Events',
  cryptonomads: 'Crypto Nomads',
  ethglobal: 'ETH Global'
};

export default function ExplorePage({ onAuthOpen }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState({ solana: [], cryptonomads: [], ethglobal: [], last_updated: null });
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState('');
  const [expandedSource, setExpandedSource] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Load cached events on mount
    fetchCachedEvents();
  }, []);

  const fetchCachedEvents = async () => {
    try {
      const res = await axios.get(`${API}/ai-concierge/events`);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch cached events');
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    setError('');
    try {
      const res = await axios.post(`${API}/ai-concierge/scrape`, {}, { withCredentials: true });
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch events. Please try again.');
    } finally {
      setScraping(false);
    }
  };

  const toggleSource = (source) => {
    setExpandedSource(expandedSource === source ? null : source);
  };

  const parseEvents = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    if (data.events) return data.events;
    return [];
  };

  const hasEvents = events.solana?.length > 0 || events.cryptonomads?.length > 0 || events.ethglobal?.length > 0;

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
            <p className="text-white/45 font-body text-base">Find upcoming Web3 events from around the world.</p>
          </motion.div>

          {/* AI Concierge Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 sm:p-8 mb-8"
            data-testid="ai-concierge-section"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-white">AI Concierge</h2>
                  <p className="text-white/40 text-sm">Fetches upcoming events from top Web3 sources</p>
                </div>
              </div>
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="btn-white py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-50"
                data-testid="fetch-events-btn"
              >
                <RefreshCw size={16} className={scraping ? 'animate-spin' : ''} />
                {scraping ? 'Fetching...' : 'Fetch Events'}
              </button>
            </div>

            {/* Last Updated */}
            {events.last_updated && (
              <p className="text-white/30 text-xs mb-4">
                Last updated: {new Date(events.last_updated).toLocaleString()}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm mb-4"
              >
                {error}
              </motion.div>
            )}

            {/* Scraping in Progress */}
            {scraping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <RefreshCw size={28} className="text-white/60 animate-spin" />
                </div>
                <p className="text-white/50 mb-2">AI Concierge is fetching events...</p>
                <p className="text-white/30 text-sm">This may take a minute</p>
              </motion.div>
            )}

            {/* No Events Yet */}
            {!scraping && !hasEvents && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Compass size={28} className="text-white/40" />
                </div>
                <p className="text-white/50 mb-2">No events loaded yet</p>
                <p className="text-white/30 text-sm">Click "Fetch Events" to discover upcoming Web3 events</p>
              </div>
            )}

            {/* Event Sources */}
            {!scraping && hasEvents && (
              <div className="space-y-4">
                {['solana', 'cryptonomads', 'ethglobal'].map((source) => {
                  const sourceEvents = parseEvents(events[source]);
                  const isExpanded = expandedSource === source;
                  
                  return (
                    <div key={source} className="glass rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleSource(source)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        data-testid={`source-${source}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${SOURCE_COLORS[source]} flex items-center justify-center`}>
                            <Sparkles size={18} className="text-white" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-display font-semibold text-white">{SOURCE_NAMES[source]}</h3>
                            <p className="text-white/40 text-xs">{sourceEvents.length} events found</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={20} className="text-white/40" /> : <ChevronDown size={20} className="text-white/40" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && sourceEvents.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5"
                          >
                            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                              {sourceEvents.map((event, idx) => (
                                <div
                                  key={idx}
                                  className="glass p-4 rounded-xl"
                                  data-testid={`event-card-${source}-${idx}`}
                                >
                                  <h4 className="font-display font-semibold text-white mb-2">
                                    {event.event_name || event.name || event.title || 'Unnamed Event'}
                                  </h4>
                                  {(event.event_description || event.description) && (
                                    <p className="text-white/50 text-sm mb-3 line-clamp-2">
                                      {event.event_description || event.description}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-3 text-xs">
                                    {(event.start_date || event.date) && (
                                      <span className="text-white/40 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {event.start_date || event.date}
                                        {event.end_date && ` - ${event.end_date}`}
                                      </span>
                                    )}
                                    {(event.event_location || event.location) && (
                                      <span className="text-white/40 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {event.event_location || event.location}
                                      </span>
                                    )}
                                    {event.url && (
                                      <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 flex items-center gap-1 hover:text-blue-300"
                                      >
                                        <ExternalLink size={12} />
                                        View
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Sources Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-4 rounded-xl"
          >
            <p className="text-white/30 text-xs text-center">
              Events are scraped from Solana.com, CryptoNomads.org, and EthGlobal.com using AI
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
