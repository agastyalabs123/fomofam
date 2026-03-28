import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, Calendar, MapPin, Plus, X, RefreshCw, Target, Globe, Search, Zap, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_EVENT_SOURCES = [
  { url: 'https://solana.com/events', name: 'Solana Events', isDefault: true },
  { url: 'https://cryptonomads.org/', name: 'Crypto Nomads', isDefault: true },
  { url: 'https://ethglobal.com/events', name: 'ETH Global', isDefault: true },
];

const DEFAULT_OPPORTUNITY_SOURCES = [
  { url: 'https://crypto.jobs/', name: 'Crypto Jobs', isDefault: true },
  { url: 'https://web3.career/', name: 'Web3 Career', isDefault: true },
  { url: 'https://gitcoin.co/grants', name: 'Gitcoin Grants', isDefault: true },
  { url: 'https://devfolio.co/hackathons', name: 'Devfolio Hackathons', isDefault: true },
];

export default function ScoutPage({ onAuthOpen }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');

  // Event Concierge state
  const [eventSources, setEventSources] = useState(DEFAULT_EVENT_SOURCES);
  const [newEventUrl, setNewEventUrl] = useState('');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventSearching, setEventSearching] = useState(false);
  const [eventResults, setEventResults] = useState({});
  const [eventScraping, setEventScraping] = useState(false);
  const [eventError, setEventError] = useState('');

  // Opportunity Hunter state
  const [opportunitySources, setOpportunitySources] = useState(DEFAULT_OPPORTUNITY_SOURCES);
  const [newOpportunityUrl, setNewOpportunityUrl] = useState('');
  const [opportunitySearchQuery, setOpportunitySearchQuery] = useState('');
  const [opportunitySearching, setOpportunitySearching] = useState(false);
  const [opportunityGoal, setOpportunityGoal] = useState('');
  const [opportunityResults, setOpportunityResults] = useState({});
  const [opportunityScraping, setOpportunityScraping] = useState(false);
  const [opportunityError, setOpportunityError] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  useEffect(() => { loadCachedResults(); }, []);

  const loadCachedResults = async () => {
    try {
      const [eventsRes, oppsRes] = await Promise.all([
        axios.get(`${API}/scout/events`),
        axios.get(`${API}/scout/opportunities`),
      ]);
      if (eventsRes.data.results) setEventResults(eventsRes.data.results);
      if (oppsRes.data.results) setOpportunityResults(oppsRes.data.results);
    } catch {
      console.error('Failed to load cached results');
    }
  };

  // --- Shared helpers ---
  const addSource = (sources, setSources, url) => {
    if (!url || sources.find(s => s.url === url)) return;
    try {
      setSources([...sources, { url, name: new URL(url).hostname, isDefault: false }]);
    } catch {}
  };

  const removeSource = (sources, setSources, url) => {
    setSources(sources.filter(s => s.url !== url));
  };

  const searchWeb = async (query, sources, setSources, setSearching, setError) => {
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    try {
      const res = await axios.post(`${API}/scout/search-urls`, { query, count: 5 });
      const newUrls = res.data.urls || [];
      const existingUrls = new Set(sources.map(s => s.url));
      const discovered = newUrls
        .filter(u => !existingUrls.has(u.url))
        .map(u => ({ ...u, isDefault: false, discovered: true }));
      if (discovered.length > 0) {
        setSources(prev => [...prev, ...discovered]);
      } else {
        setError('No new sources found. Try a different search query.');
      }
    } catch {
      setError('Search failed. Try again.');
    } finally {
      setSearching(false);
    }
  };

  const pollForResults = async (type, setResults, setError) => {
    let attempts = 0;
    while (attempts < 90) {
      await new Promise(r => setTimeout(r, 2000));
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
      } catch {}
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
      } catch { return []; }
    }
    return data.events || data.opportunities || data.results || [];
  };

  // --- Event handlers ---
  const handleEventScrape = async () => {
    setEventScraping(true);
    setEventError('');
    try {
      await axios.post(`${API}/scout/events/scrape`, {
        sources: eventSources.map(s => s.url),
      });
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
      await axios.post(`${API}/scout/opportunities/scrape`, {
        sources: opportunitySources.map(s => s.url),
        goal: opportunityGoal,
      });
      await pollForResults('opportunities', setOpportunityResults, setOpportunityError);
    } catch (err) {
      setOpportunityError(err.response?.data?.detail || 'Failed to fetch opportunities');
    } finally {
      setOpportunityScraping(false);
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

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar onAuthOpen={onAuthOpen} />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mb-3">Scout</h1>
            <p className="text-white/45 font-body text-base max-w-lg">
              Scan the Web3 ecosystem to find events and opportunities tailored for you.
            </p>
          </motion.div>

          {/* Tab Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 p-5 rounded-2xl border transition-all flex items-center justify-center gap-3 group ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-500/50 text-white'
                  : 'glass border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
              data-testid="tab-events"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'events' ? 'bg-purple-500' : 'bg-white/10 group-hover:bg-white/20'
              }`}>
                <Calendar size={20} />
              </div>
              <div className="text-left">
                <span className="font-display font-semibold block">Event Concierge</span>
                <span className="text-xs text-white/40">Find upcoming events</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`flex-1 p-5 rounded-2xl border transition-all flex items-center justify-center gap-3 group ${
                activeTab === 'opportunities'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border-emerald-500/50 text-white'
                  : 'glass border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
              data-testid="tab-opportunities"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'opportunities' ? 'bg-emerald-500' : 'bg-white/10 group-hover:bg-white/20'
              }`}>
                <Briefcase size={20} />
              </div>
              <div className="text-left">
                <span className="font-display font-semibold block">Opportunity Hunter</span>
                <span className="text-xs text-white/40">Jobs, grants, hackathons</span>
              </div>
            </button>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {/* ======================== EVENT CONCIERGE ======================== */}
            {activeTab === 'events' && (
              <motion.div key="events" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid lg:grid-cols-2 gap-6">
                {/* Sources Panel */}
                <div className="glass-card p-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Globe size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-white">Scan Sources</h2>
                      <p className="text-white/40 text-xs">Predefined + discovered + custom URLs</p>
                    </div>
                  </div>

                  {/* Source list */}
                  <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
                    {eventSources.map((source) => (
                      <div key={source.url} className="flex items-center gap-3 p-3 glass rounded-xl group">
                        <Zap size={14} className={`flex-shrink-0 ${source.discovered ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {source.name}
                            {source.discovered && <span className="text-cyan-400 text-xs ml-2">discovered</span>}
                          </p>
                          <p className="text-white/30 text-xs truncate">{source.url}</p>
                        </div>
                        {!source.isDefault && (
                          <button onClick={() => removeSource(eventSources, setEventSources, source.url)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all" data-testid={`remove-event-source-${source.name}`}>
                            <X size={14} className="text-white/40" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* DuckDuckGo search to discover sources */}
                  <div className="mb-3">
                    <p className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
                      <Search size={10} />
                      Discover sources from the web
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. upcoming web3 events 2026..."
                        value={eventSearchQuery}
                        onChange={(e) => setEventSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchWeb(eventSearchQuery, eventSources, setEventSources, setEventSearching, setEventError)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-purple-500/50"
                        data-testid="event-search-query-input"
                      />
                      <button
                        onClick={() => searchWeb(eventSearchQuery, eventSources, setEventSources, setEventSearching, setEventError)}
                        disabled={eventSearching || !eventSearchQuery.trim()}
                        className="btn-glass px-3 disabled:opacity-50"
                        data-testid="event-search-btn"
                      >
                        {eventSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Manual URL add */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Add custom URL..."
                      value={newEventUrl}
                      onChange={(e) => setNewEventUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { addSource(eventSources, setEventSources, newEventUrl); setNewEventUrl(''); } }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-purple-500/50"
                      data-testid="add-event-source-input"
                    />
                    <button onClick={() => { addSource(eventSources, setEventSources, newEventUrl); setNewEventUrl(''); }} disabled={!newEventUrl} className="btn-glass px-3 disabled:opacity-50" data-testid="add-event-source-btn">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Action Panel */}
                <div className="glass-card p-6 border border-purple-500/20 flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <motion.div
                      animate={eventScraping ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 0.5, repeat: eventScraping ? Infinity : 0 }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25"
                    >
                      {eventScraping ? <RefreshCw size={32} className="text-white animate-spin" /> : <Search size={32} className="text-white" />}
                    </motion.div>
                    <h3 className="font-display font-bold text-white mb-2">
                      {eventScraping ? 'Scanning Web3...' : 'Ready to Scout'}
                    </h3>
                    <p className="text-white/40 text-sm mb-2 max-w-xs">
                      {eventScraping
                        ? 'AI is crawling event sources. This may take a minute.'
                        : `${eventSources.length} sources configured. Click below to scan all.`}
                    </p>
                  </div>

                  <button
                    onClick={handleEventScrape}
                    disabled={eventScraping}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-sm hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
                    data-testid="fetch-events-btn"
                  >
                    {eventScraping ? 'Scanning...' : `Start Event Scan (${eventSources.length} sources)`}
                  </button>

                  {eventError && <p className="text-red-400 text-xs mt-3 text-center" data-testid="event-error">{eventError}</p>}
                </div>

                {/* Results */}
                {Object.keys(eventResults).length > 0 && (
                  <div className="lg:col-span-2 glass-card p-6 border border-purple-500/20">
                    <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar size={18} className="text-purple-400" />
                      Discovered Events
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(eventResults).map(([source, data]) => {
                        const events = parseResults(data);
                        return events.slice(0, 6).map((event, i) => (
                          <div key={`${source}-${i}`} className="glass p-4 rounded-xl hover:bg-white/5 transition-all" data-testid={`event-result-${source}-${i}`}>
                            <h4 className="font-semibold text-white text-sm mb-1 truncate">
                              {event.event_name || event.name || event.title || 'Event'}
                            </h4>
                            <p className="text-white/40 text-xs mb-2 line-clamp-2">
                              {event.event_description || event.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white/30">
                              {event.start_date && <span className="flex items-center gap-1"><Calendar size={10} />{event.start_date}</span>}
                              {event.event_location && <span className="flex items-center gap-1"><MapPin size={10} />{event.event_location}</span>}
                            </div>
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================== OPPORTUNITY HUNTER ======================== */}
            {activeTab === 'opportunities' && (
              <motion.div key="opportunities" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid lg:grid-cols-2 gap-6">
                {/* Goal & Sources Panel */}
                <div className="glass-card p-6 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Target size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-white">Define Your Goal</h2>
                      <p className="text-white/40 text-xs">What opportunities are you seeking?</p>
                    </div>
                  </div>

                  <textarea
                    placeholder="e.g., Looking for Solidity developer jobs, DeFi grants, or hackathons with prizes over $10k..."
                    value={opportunityGoal}
                    onChange={(e) => setOpportunityGoal(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-emerald-500/50 resize-none mb-4"
                    data-testid="opportunity-goal-input"
                  />

                  <p className="text-white/40 text-xs mb-2">Search Sources:</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
                    {opportunitySources.map((source) => (
                      <div key={source.url} className="flex items-center gap-3 p-2 glass rounded-lg group">
                        <Zap size={12} className={`flex-shrink-0 ${source.discovered ? 'text-cyan-400' : 'text-emerald-400'}`} />
                        <span className="text-white/70 text-xs truncate flex-1">
                          {source.name}
                          {source.discovered && <span className="text-cyan-400 ml-1">discovered</span>}
                        </span>
                        {!source.isDefault && (
                          <button onClick={() => removeSource(opportunitySources, setOpportunitySources, source.url)} className="opacity-0 group-hover:opacity-100" data-testid={`remove-opp-source-${source.name}`}>
                            <X size={12} className="text-white/40" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* DuckDuckGo search to discover sources */}
                  <div className="mb-3">
                    <p className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
                      <Search size={10} />
                      Discover sources from the web
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. web3 developer jobs 2026..."
                        value={opportunitySearchQuery}
                        onChange={(e) => setOpportunitySearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchWeb(opportunitySearchQuery, opportunitySources, setOpportunitySources, setOpportunitySearching, setOpportunityError)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-emerald-500/50"
                        data-testid="opportunity-search-query-input"
                      />
                      <button
                        onClick={() => searchWeb(opportunitySearchQuery, opportunitySources, setOpportunitySources, setOpportunitySearching, setOpportunityError)}
                        disabled={opportunitySearching || !opportunitySearchQuery.trim()}
                        className="btn-glass px-3 disabled:opacity-50"
                        data-testid="opportunity-search-btn"
                      >
                        {opportunitySearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Manual URL add */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Add custom URL..."
                      value={newOpportunityUrl}
                      onChange={(e) => setNewOpportunityUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { addSource(opportunitySources, setOpportunitySources, newOpportunityUrl); setNewOpportunityUrl(''); } }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-emerald-500/50"
                      data-testid="add-opportunity-source-input"
                    />
                    <button onClick={() => { addSource(opportunitySources, setOpportunitySources, newOpportunityUrl); setNewOpportunityUrl(''); }} disabled={!newOpportunityUrl} className="btn-glass px-3 disabled:opacity-50" data-testid="add-opportunity-source-btn">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Action Panel */}
                <div className="glass-card p-6 border border-emerald-500/20 flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <motion.div
                      animate={opportunityScraping ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: opportunityScraping ? Infinity : 0 }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25"
                    >
                      {opportunityScraping ? <RefreshCw size={32} className="text-white animate-spin" /> : <Briefcase size={32} className="text-white" />}
                    </motion.div>
                    <h3 className="font-display font-bold text-white mb-2">
                      {opportunityScraping ? 'Hunting...' : 'Ready to Hunt'}
                    </h3>
                    <p className="text-white/40 text-sm mb-2 max-w-xs">
                      {opportunityScraping
                        ? 'AI is searching for opportunities matching your goal.'
                        : `${opportunitySources.length} sources configured. Enter a goal and scan.`}
                    </p>
                  </div>

                  <button
                    onClick={handleOpportunityScrape}
                    disabled={opportunityScraping || !opportunityGoal.trim()}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25"
                    data-testid="search-opportunities-btn"
                  >
                    {opportunityScraping ? 'Hunting...' : `Start Opportunity Hunt (${opportunitySources.length} sources)`}
                  </button>

                  {opportunityError && <p className="text-red-400 text-xs mt-3 text-center" data-testid="opportunity-error">{opportunityError}</p>}
                </div>

                {/* Results */}
                {Object.keys(opportunityResults).length > 0 && (
                  <div className="lg:col-span-2 glass-card p-6 border border-emerald-500/20">
                    <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                      <Briefcase size={18} className="text-emerald-400" />
                      Found Opportunities
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(opportunityResults).map(([source, data]) => {
                        const opps = parseResults(data);
                        return opps.slice(0, 6).map((opp, i) => (
                          <div key={`${source}-${i}`} className="glass p-4 rounded-xl hover:bg-white/5 transition-all" data-testid={`opp-result-${source}-${i}`}>
                            <h4 className="font-semibold text-white text-sm mb-1 truncate">
                              {opp.title || opp.name || 'Opportunity'}
                            </h4>
                            <p className="text-white/40 text-xs mb-2 line-clamp-2">
                              {opp.description || opp.summary || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              {opp.company && <span className="text-white/30">{opp.company}</span>}
                              {(opp.prize || opp.salary) && <span className="text-emerald-400">{opp.prize || opp.salary}</span>}
                            </div>
                          </div>
                        ));
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
