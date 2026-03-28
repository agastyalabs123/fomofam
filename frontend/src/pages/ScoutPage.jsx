import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, Calendar, MapPin, ExternalLink, ChevronDown, ChevronUp, Plus, X, RefreshCw, Target, Globe, Search, Zap, Cpu, Radio } from 'lucide-react';
import * as THREE from 'three';
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

// 3D AI Bot Component
function AIBot({ isActive, mode }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create AI Bot head (sphere with details)
    const headGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: mode === 'events' ? 0x8b5cf6 : 0x10b981,
      emissive: mode === 'events' ? 0x4c1d95 : 0x064e3b,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);

    // Eye visor
    const visorGeometry = new THREE.BoxGeometry(1.8, 0.4, 0.3);
    const visorMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, 0.1, 1);
    head.add(visor);

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0, 1.4, 0);
    head.add(antenna);

    // Antenna tip (glowing)
    const tipGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const tipMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1,
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.set(0, 1.7, 0);
    head.add(tip);

    // Orbiting rings
    const ringGeometry = new THREE.TorusGeometry(1.8, 0.03, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.6,
    });
    
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const blueLight = new THREE.PointLight(0x00ffff, 0.5, 100);
    blueLight.position.set(-5, -5, 5);
    scene.add(blueLight);

    // Animation
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Head floating animation
      head.position.y = Math.sin(time * 2) * 0.1;
      head.rotation.y = Math.sin(time) * 0.2;

      // Ring rotation
      ring1.rotation.z = time;
      ring2.rotation.z = -time * 0.7;

      // Particles floating
      particles.rotation.y = time * 0.1;

      // Antenna tip pulsing
      tip.scale.setScalar(1 + Math.sin(time * 5) * 0.2);

      // Visor pulsing when active
      if (isActive) {
        visor.material.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();
    sceneRef.current = { scene, renderer };

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isActive, mode]);

  return <div ref={containerRef} className="w-[300px] h-[300px]" />;
}

export default function ScoutPage({ onAuthOpen }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  
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
      try {
        setEventSources([...eventSources, { url: newEventUrl, name: new URL(newEventUrl).hostname }]);
        setNewEventUrl('');
      } catch {}
    }
  };

  const removeEventSource = (url) => {
    setEventSources(eventSources.filter(s => s.url !== url));
  };

  const addOpportunitySource = () => {
    if (newOpportunityUrl && !opportunitySources.find(s => s.url === newOpportunityUrl)) {
      try {
        setOpportunitySources([...opportunitySources, { url: newOpportunityUrl, name: new URL(newOpportunityUrl).hostname }]);
        setNewOpportunityUrl('');
      } catch {}
    }
  };

  const removeOpportunitySource = (url) => {
    setOpportunitySources(opportunitySources.filter(s => s.url !== url));
  };

  const handleEventScrape = async () => {
    setEventScraping(true);
    setEventError('');
    try {
      await axios.post(`${API}/scout/events/scrape`, {
        sources: eventSources.map(s => s.url),
        include_random: true
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
        include_random: true
      });
      await pollForResults('opportunities', setOpportunityResults, setOpportunityError);
    } catch (err) {
      setOpportunityError(err.response?.data?.detail || 'Failed to fetch opportunities');
    } finally {
      setOpportunityScraping(false);
    }
  };

  const pollForResults = async (type, setResults, setError) => {
    let attempts = 0;
    const maxAttempts = 90;
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isActive = eventScraping || opportunityScraping;

  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-hidden">
      <Navbar onAuthOpen={onAuthOpen} />
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-cyan-900/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Scanning lines effect */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{
                top: `${i * 5}%`,
                animation: `scanline 3s linear infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative pt-24 pb-16 px-4">
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

          {/* Hero Section with 3D Bot */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col lg:flex-row items-center gap-8 mb-12"
          >
            {/* 3D AI Bot */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl rounded-full" />
              <AIBot isActive={isActive} mode={activeTab} />
              
              {/* Status indicator */}
              <motion.div
                animate={{ 
                  scale: isActive ? [1, 1.2, 1] : 1,
                  opacity: isActive ? [0.5, 1, 0.5] : 0.7
                }}
                transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 glass px-4 py-2 rounded-full"
              >
                <Radio size={14} className={`${isActive ? 'text-green-400' : 'text-white/40'}`} />
                <span className="text-xs font-medium text-white/70">
                  {isActive ? 'Scanning...' : 'Ready'}
                </span>
              </motion.div>
            </div>

            {/* Header Text */}
            <div className="text-center lg:text-left flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center lg:justify-start gap-3 mb-4"
              >
                <Cpu className="text-cyan-400" size={24} />
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-[0.3em]">AI Scout</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight mb-4"
              >
                Your Web3
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
                  Intelligence Agent
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/45 font-body text-lg max-w-md"
              >
                I scan the entire Web3 ecosystem to find events and opportunities tailored for you.
              </motion.p>
            </div>
          </motion.div>

          {/* Tab Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 mb-8"
          >
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

          {/* Content Panels */}
          <AnimatePresence mode="wait">
            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Sources Panel */}
                <div className="glass-card p-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Globe size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-white">Scan Sources</h2>
                      <p className="text-white/40 text-xs">Configure where to search</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                    {eventSources.map((source, idx) => (
                      <div key={source.url} className="flex items-center gap-3 p-3 glass rounded-xl group">
                        <Zap size={14} className="text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{source.name}</p>
                          <p className="text-white/30 text-xs truncate">{source.url}</p>
                        </div>
                        {!DEFAULT_EVENT_SOURCES.find(s => s.url === source.url) && (
                          <button onClick={() => removeEventSource(source.url)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all">
                            <X size={14} className="text-white/40" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      placeholder="Add custom URL..."
                      value={newEventUrl}
                      onChange={(e) => setNewEventUrl(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-purple-500/50"
                      data-testid="add-event-source-input"
                    />
                    <button onClick={addEventSource} disabled={!newEventUrl} className="btn-glass px-3 disabled:opacity-50">
                      <Plus size={18} />
                    </button>
                  </div>

                  <p className="text-white/30 text-xs flex items-center gap-1">
                    <Zap size={10} className="text-purple-400" />
                    AI auto-discovers additional sources
                  </p>
                </div>

                {/* Action Panel */}
                <div className="glass-card p-6 border border-purple-500/20 flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <motion.div
                      animate={eventScraping ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 0.5, repeat: eventScraping ? Infinity : 0 }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25"
                    >
                      {eventScraping ? (
                        <RefreshCw size={32} className="text-white animate-spin" />
                      ) : (
                        <Search size={32} className="text-white" />
                      )}
                    </motion.div>
                    
                    <h3 className="font-display font-bold text-white mb-2">
                      {eventScraping ? 'Scanning Web3...' : 'Ready to Scout'}
                    </h3>
                    <p className="text-white/40 text-sm mb-6 max-w-xs">
                      {eventScraping 
                        ? 'AI is crawling event sources. This may take a minute.'
                        : 'Click below to search all configured sources for events.'}
                    </p>
                  </div>

                  <button
                    onClick={handleEventScrape}
                    disabled={eventScraping}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-sm hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
                    data-testid="fetch-events-btn"
                  >
                    {eventScraping ? 'Scanning...' : 'Start Event Scan'}
                  </button>

                  {eventError && (
                    <p className="text-red-400 text-xs mt-3 text-center">{eventError}</p>
                  )}
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
                          <div key={`${source}-${i}`} className="glass p-4 rounded-xl hover:bg-white/5 transition-all">
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

            {activeTab === 'opportunities' && (
              <motion.div
                key="opportunities"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid lg:grid-cols-2 gap-6"
              >
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
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {opportunitySources.map((source) => (
                      <div key={source.url} className="flex items-center gap-3 p-2 glass rounded-lg group">
                        <Zap size={12} className="text-emerald-400 flex-shrink-0" />
                        <span className="text-white/70 text-xs truncate flex-1">{source.name}</span>
                        {!DEFAULT_OPPORTUNITY_SOURCES.find(s => s.url === source.url) && (
                          <button onClick={() => removeOpportunitySource(source.url)} className="opacity-0 group-hover:opacity-100">
                            <X size={12} className="text-white/40" />
                          </button>
                        )}
                      </div>
                    ))}
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
                      {opportunityScraping ? (
                        <RefreshCw size={32} className="text-white animate-spin" />
                      ) : (
                        <Briefcase size={32} className="text-white" />
                      )}
                    </motion.div>
                    
                    <h3 className="font-display font-bold text-white mb-2">
                      {opportunityScraping ? 'Hunting...' : 'Ready to Hunt'}
                    </h3>
                    <p className="text-white/40 text-sm mb-6 max-w-xs">
                      {opportunityScraping 
                        ? 'AI is searching for opportunities matching your goal.'
                        : 'Enter your goal and click below to find opportunities.'}
                    </p>
                  </div>

                  <button
                    onClick={handleOpportunityScrape}
                    disabled={opportunityScraping || !opportunityGoal.trim()}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25"
                    data-testid="search-opportunities-btn"
                  >
                    {opportunityScraping ? 'Hunting...' : 'Start Opportunity Hunt'}
                  </button>

                  {opportunityError && (
                    <p className="text-red-400 text-xs mt-3 text-center">{opportunityError}</p>
                  )}
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
                          <div key={`${source}-${i}`} className="glass p-4 rounded-xl hover:bg-white/5 transition-all">
                            <h4 className="font-semibold text-white text-sm mb-1 truncate">
                              {opp.title || opp.name || 'Opportunity'}
                            </h4>
                            <p className="text-white/40 text-xs mb-2 line-clamp-2">
                              {opp.description || opp.summary || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              {opp.company && <span className="text-white/30">{opp.company}</span>}
                              {(opp.prize || opp.salary) && <span className="text-emerald-400">💰 {opp.prize || opp.salary}</span>}
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

      {/* CSS for animations */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
