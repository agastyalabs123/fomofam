import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bot, Briefcase, Calendar, MapPin, ExternalLink, ChevronDown, ChevronUp, Plus, X, RefreshCw, Target, Sparkles, Globe, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_EVENT_SOURCES = [
  { url: 'https://solana.com/events', name: 'Solana Events' },
  { url: 'https://cryptonomads.org/', name: 'Crypto Nomads' },
  { url: 'https://ethglobal.com/events', name: 'ETH Global' },
];

const DEFAULT_OPPORTUNITY_SOURCES = [
  { url: 'https://crypto.jobs/', name: 'Crypto Jobs' },
  { url: 'https://web3.career/', name: 'Web3 Career' },
  { url: 'https://gitcoin.co/grants', name: 'Gitcoin Grants' },
  { url: 'https://devfolio.co/hackathons', name: 'Devfolio Hackathons' },
];

const SOURCE_COLORS = {
  0: 'from-purple-500 to-purple-600',
  1: 'from-orange-500 to-orange-600',
  2: 'from-blue-500 to-blue-600',
  3: 'from-green-500 to-green-600',
  4: 'from-pink-500 to-pink-600',
  5: 'from-cyan-500 to-cyan-600',
};

export default function ScoutPage({ onAuthOpen }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'opportunities'
  
  // Event Concierge state
  const [eventSources, setEventSources] = useState(DEFAULT_EVENT_SOURCES);
  const [newEventUrl, setNewEventUrl] = useState('');
  const [eventResults, setEventResults] = useState({});
  const [eventScraping, setEventScraping] = useState(false);
  const [eventError, setEventError] = useState('');
  const [expandedEventSource, setExpandedEventSource] = useState(null);
  
  // Web3 Opportunity Hunter state
  const [opportunitySources, setOpportunitySources] = useState(DEFAULT_OPPORTUNITY_SOURCES);
  const [newOpportunityUrl, setNewOpportunityUrl] = useState('');
  const [opportunityGoal, setOpportunityGoal] = useState('');
  const [opportunityResults, setOpportunityResults] = useState({});
  const [opportunityScraping, setOpportunityScraping] = useState(false);
  const [opportunityError, setOpportunityError] = useState('');
  const [expandedOpportunitySource, setExpandedOpportunitySource] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Load cached results on mount
    loadCachedResults();
  }, []);

  const loadCachedResults = async () => {
    try {
      const [eventsRes, oppsRes] = await Promise.all([
        axios.get(`${API}/scout/events`),
        axios.get(`${API}/scout/opportunities`)
      ]);
      if (eventsRes.data.results) setEventResults(eventsRes.data.results);
      if (oppsRes.data.results) setOpportunityResults(oppsRes.data.results);
    } catch (err) {
      console.error('Failed to load cached results');
    }
  };

  const addEventSource = () => {
    if (newEventUrl && !eventSources.find(s => s.url === newEventUrl)) {
      setEventSources([...eventSources, { url: newEventUrl, name: new URL(newEventUrl).hostname }]);
      setNewEventUrl('');
    }
  };

  const removeEventSource = (url) => {
    setEventSources(eventSources.filter(s => s.url !== url));
  };

  const addOpportunitySource = () => {
    if (newOpportunityUrl && !opportunitySources.find(s => s.url === newOpportunityUrl)) {
      setOpportunitySources([...opportunitySources, { url: newOpportunityUrl, name: new URL(newOpportunityUrl).hostname }]);
      setNewOpportunityUrl('');
    }
  };

  const removeOpportunitySource = (url) => {
    setOpportunitySources(opportunitySources.filter(s => s.url !== url));
  };

  const handleEventScrape = async () => {
    setEventScraping(true);
    setEventError('');
    try {
      const res = await axios.post(`${API}/scout/events/scrape`, {
        sources: eventSources.map(s => s.url),
        include_random: true
      });
      
      // Poll for results
      await pollForResults('events', setEventResults, setEventError);
    } catch (err) {
      setEventError(err.response?.data?.detail || 'Failed to fetch events');
    } finally {
      setEventScraping(false);
    }
  };

  const handleOpportunityScrape = async () => {
    if (!opportunityGoal.trim()) {
      setOpportunityError('Please enter a goal to search for');
      return;
    }
    
    setOpportunityScraping(true);
    setOpportunityError('');
    try {
      const res = await axios.post(`${API}/scout/opportunities/scrape`, {
        sources: opportunitySources.map(s => s.url),
        goal: opportunityGoal,
        include_random: true
      });
      
      // Poll for results
      await pollForResults('opportunities', setOpportunityResults, setOpportunityError);
    } catch (err) {
      setOpportunityError(err.response?.data?.detail || 'Failed to fetch opportunities');
    } finally {
      setOpportunityScraping(false);
    }
  };

  const pollForResults = async (type, setResults, setError) => {
    let attempts = 0;
    const maxAttempts = 90; // 3 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const statusRes = await axios.get(`${API}/scout/${type}/status`);
        
        if (statusRes.data.status === 'complete') {
          const resultsRes = await axios.get(`${API}/scout/${type}`);
          if (resultsRes.data.results) setResults(resultsRes.data.results);
          return;
        } else if (statusRes.data.status === 'error') {
          setError('Scraping failed: ' + (statusRes.data.error || 'Unknown error'));
          return;
        }
      } catch (err) {
        // Continue polling
      }
      
      attempts++;
    }
    
    setError('Search is taking too long. Please check back later.');
  };

  const parseResults = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : (parsed.events || parsed.opportunities || parsed.results || []);
      } catch {
        return [];
      }
    }
    return data.events || data.opportunities || data.results || [];
  };

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
            <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">Scout</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mb-4">
              AI-Powered <span className="text-gradient">Discovery</span>
            </h1>
            <p className="text-white/45 font-body text-base">Find events and opportunities across the Web3 ecosystem.</p>
          </motion.div>

          {/* Tab Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-8"
          >
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${
                activeTab === 'events'
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'glass border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
              data-testid="tab-events"
            >
              <Calendar size={20} />
              <span className="font-display font-semibold">Event Concierge</span>
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${
                activeTab === 'opportunities'
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'glass border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
              data-testid="tab-opportunities"
            >
              <Briefcase size={20} />
              <span className="font-display font-semibold">Web3 Opportunity Hunter</span>
            </button>
          </motion.div>

          {/* Event Concierge Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Event Sources */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-white">Event Sources</h2>
                      <p className="text-white/40 text-xs">Add custom websites or use defaults</p>
                    </div>
                  </div>

                  {/* Source List */}
                  <div className="space-y-2 mb-4">
                    {eventSources.map((source, idx) => (
                      <div key={source.url} className="flex items-center gap-3 p-3 glass rounded-xl">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${SOURCE_COLORS[idx % 6]} flex items-center justify-center flex-shrink-0`}>
                          <Globe size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{source.name}</p>
                          <p className="text-white/30 text-xs truncate">{source.url}</p>
                        </div>
                        {!DEFAULT_EVENT_SOURCES.find(s => s.url === source.url) && (
                          <button
                            onClick={() => removeEventSource(source.url)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Source */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/events"
                      value={newEventUrl}
                      onChange={(e) => setNewEventUrl(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25"
                      data-testid="add-event-source-input"
                    />
                    <button
                      onClick={addEventSource}
                      disabled={!newEventUrl}
                      className="btn-glass px-4 py-3 text-sm disabled:opacity-50"
                      data-testid="add-event-source-btn"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <p className="text-white/30 text-xs mt-3 flex items-center gap-1">
                    <Sparkles size={12} />
                    AI will also discover random event websites automatically
                  </p>
                </div>

                {/* Fetch Events Button */}
                <button
                  onClick={handleEventScrape}
                  disabled={eventScraping}
                  className="w-full btn-white py-4 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  data-testid="fetch-events-btn"
                >
                  <RefreshCw size={18} className={eventScraping ? 'animate-spin' : ''} />
                  {eventScraping ? 'Searching for Events...' : 'Search Events'}
                </button>

                {/* Error */}
                {eventError && (
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    {eventError}
                  </div>
                )}

                {/* Results */}
                {Object.keys(eventResults).length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-display font-semibold text-white mb-4">Found Events</h3>
                    <div className="space-y-3">
                      {Object.entries(eventResults).map(([source, data], idx) => {
                        const events = parseResults(data);
                        const isExpanded = expandedEventSource === source;
                        
                        return (
                          <div key={source} className="glass rounded-2xl overflow-hidden">
                            <button
                              onClick={() => setExpandedEventSource(isExpanded ? null : source)}
                              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${SOURCE_COLORS[idx % 6]} flex items-center justify-center`}>
                                  <Calendar size={14} className="text-white" />
                                </div>
                                <div className="text-left">
                                  <p className="text-white text-sm font-medium">{source}</p>
                                  <p className="text-white/40 text-xs">{events.length} events found</p>
                                </div>
                              </div>
                              {isExpanded ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
                            </button>
                            
                            <AnimatePresence>
                              {isExpanded && events.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-white/5"
                                >
                                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                                    {events.slice(0, 20).map((event, i) => (
                                      <div key={i} className="glass p-4 rounded-xl">
                                        <h4 className="font-semibold text-white text-sm mb-1">
                                          {event.event_name || event.name || event.title || 'Unnamed Event'}
                                        </h4>
                                        {(event.event_description || event.description) && (
                                          <p className="text-white/50 text-xs mb-2 line-clamp-2">
                                            {event.event_description || event.description}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-2 text-xs">
                                          {(event.start_date || event.date) && (
                                            <span className="text-white/40 flex items-center gap-1">
                                              <Calendar size={10} />
                                              {event.start_date || event.date}
                                            </span>
                                          )}
                                          {(event.event_location || event.location) && (
                                            <span className="text-white/40 flex items-center gap-1">
                                              <MapPin size={10} />
                                              {event.event_location || event.location}
                                            </span>
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
                  </div>
                )}
              </motion.div>
            )}

            {/* Web3 Opportunity Hunter Tab */}
            {activeTab === 'opportunities' && (
              <motion.div
                key="opportunities"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Goal Input */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Target size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-white">What are you looking for?</h2>
                      <p className="text-white/40 text-xs">Describe your goal and we'll find opportunities</p>
                    </div>
                  </div>

                  <textarea
                    placeholder="e.g., Looking for Solidity developer jobs, DeFi grants, or upcoming hackathons with prizes over $10k..."
                    value={opportunityGoal}
                    onChange={(e) => setOpportunityGoal(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25 resize-none mb-4"
                    data-testid="opportunity-goal-input"
                  />

                  {/* Opportunity Sources */}
                  <p className="text-white/50 text-xs font-medium mb-2">Search Sources:</p>
                  <div className="space-y-2 mb-4">
                    {opportunitySources.map((source, idx) => (
                      <div key={source.url} className="flex items-center gap-3 p-3 glass rounded-xl">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${SOURCE_COLORS[idx % 6]} flex items-center justify-center flex-shrink-0`}>
                          <Briefcase size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{source.name}</p>
                          <p className="text-white/30 text-xs truncate">{source.url}</p>
                        </div>
                        {!DEFAULT_OPPORTUNITY_SOURCES.find(s => s.url === source.url) && (
                          <button
                            onClick={() => removeOpportunitySource(source.url)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Source */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/jobs"
                      value={newOpportunityUrl}
                      onChange={(e) => setNewOpportunityUrl(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25"
                      data-testid="add-opportunity-source-input"
                    />
                    <button
                      onClick={addOpportunitySource}
                      disabled={!newOpportunityUrl}
                      className="btn-glass px-4 py-3 text-sm disabled:opacity-50"
                      data-testid="add-opportunity-source-btn"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <p className="text-white/30 text-xs mt-3 flex items-center gap-1">
                    <Sparkles size={12} />
                    AI will also discover random opportunity websites automatically
                  </p>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleOpportunityScrape}
                  disabled={opportunityScraping || !opportunityGoal.trim()}
                  className="w-full btn-white py-4 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  data-testid="search-opportunities-btn"
                >
                  <Search size={18} className={opportunityScraping ? 'animate-pulse' : ''} />
                  {opportunityScraping ? 'Hunting Opportunities...' : 'Hunt Opportunities'}
                </button>

                {/* Error */}
                {opportunityError && (
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    {opportunityError}
                  </div>
                )}

                {/* Results */}
                {Object.keys(opportunityResults).length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-display font-semibold text-white mb-4">Found Opportunities</h3>
                    <div className="space-y-3">
                      {Object.entries(opportunityResults).map(([source, data], idx) => {
                        const opportunities = parseResults(data);
                        const isExpanded = expandedOpportunitySource === source;
                        
                        return (
                          <div key={source} className="glass rounded-2xl overflow-hidden">
                            <button
                              onClick={() => setExpandedOpportunitySource(isExpanded ? null : source)}
                              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${SOURCE_COLORS[idx % 6]} flex items-center justify-center`}>
                                  <Briefcase size={14} className="text-white" />
                                </div>
                                <div className="text-left">
                                  <p className="text-white text-sm font-medium">{source}</p>
                                  <p className="text-white/40 text-xs">{opportunities.length} opportunities found</p>
                                </div>
                              </div>
                              {isExpanded ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
                            </button>
                            
                            <AnimatePresence>
                              {isExpanded && opportunities.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-white/5"
                                >
                                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                                    {opportunities.slice(0, 20).map((opp, i) => (
                                      <div key={i} className="glass p-4 rounded-xl">
                                        <h4 className="font-semibold text-white text-sm mb-1">
                                          {opp.title || opp.name || opp.opportunity_name || 'Unnamed Opportunity'}
                                        </h4>
                                        {(opp.description || opp.summary) && (
                                          <p className="text-white/50 text-xs mb-2 line-clamp-2">
                                            {opp.description || opp.summary}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-2 text-xs">
                                          {opp.company && (
                                            <span className="text-white/40 flex items-center gap-1">
                                              <Briefcase size={10} />
                                              {opp.company}
                                            </span>
                                          )}
                                          {opp.location && (
                                            <span className="text-white/40 flex items-center gap-1">
                                              <MapPin size={10} />
                                              {opp.location}
                                            </span>
                                          )}
                                          {(opp.prize || opp.salary || opp.amount) && (
                                            <span className="text-green-400 flex items-center gap-1">
                                              💰 {opp.prize || opp.salary || opp.amount}
                                            </span>
                                          )}
                                          {opp.url && (
                                            <a
                                              href={opp.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            >
                                              <ExternalLink size={10} />
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
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
