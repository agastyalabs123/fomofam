import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Users, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const createPin = () => L.divIcon({
  className: '',
  html: `<div class="map-pin" style="width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,0.9);border:2px solid rgba(255,255,255,0.4);box-shadow:0 0 10px rgba(255,255,255,0.5);"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6], popupAnchor: [0, -10],
});

const TAGS = ['All', 'Hackathons', 'Networking', 'Conferences', 'Meetups', 'Workshops', 'Web3', 'AI', 'Music'];

export default function ExploreSection() {
  const [events, setEvents] = useState([]);
  const [activeTag, setActiveTag] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API}/events`).then(r => { setEvents(r.data); if (r.data.length) setSelected(r.data[0]); }).catch(() => {});
  }, []);

  const filtered = activeTag === 'All' ? events : events.filter(e =>
    e.tags?.some(t => t.toLowerCase().includes(activeTag.toLowerCase()) || activeTag.toLowerCase().includes(t.toLowerCase())) ||
    e.category?.toLowerCase().includes(activeTag.toLowerCase()) || activeTag.toLowerCase().includes(e.category?.toLowerCase() || '')
  );

  return (
    <section id="explore-section" className="py-24 bg-[#0A0A0A]" data-testid="explore-section">
      <div className="section-line mx-8 mb-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10">
          <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">01 — Explore</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight mb-4">
            Find Events <span className="text-gradient">Around You</span>
          </h2>
          <p className="text-white/45 font-body text-base max-w-xl">From Seoul to Lisbon — community-powered events backed by real funding.</p>
        </motion.div>

        {/* Filter tags */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden" whileInView="show" viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-8" data-testid="filter-tags"
        >
          {TAGS.map(tag => (
            <motion.button
              key={tag}
              variants={{ hidden: { opacity: 0, x: -15 }, show: { opacity: 1, x: 0, transition: { duration: 0.4 } } }}
              onClick={() => setActiveTag(tag)}
              className={`tag-pill ${activeTag === tag ? 'active' : ''}`}
              data-testid={`filter-tag-${tag.toLowerCase()}`}
            >{tag}</motion.button>
          ))}
        </motion.div>

        {/* Map + Events grid */}
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="lg:col-span-3 overflow-hidden rounded-3xl border border-white/8 shadow-glass"
            style={{ height: '460px' }} data-testid="map-container"
          >
            <MapContainer center={[20, 40]} zoom={2} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>'
              />
              {filtered.map(ev => (
                <Marker key={ev.event_id} position={[ev.lat, ev.lng]} icon={createPin()} eventHandlers={{ click: () => setSelected(ev) }}>
                  <Popup>
                    <p className="font-display font-semibold text-sm">{ev.title}</p>
                    <p className="text-xs text-white/60 mt-0.5">{ev.city}, {ev.country}</p>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </motion.div>

          {/* Event cards */}
          <div className="lg:col-span-2 flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-0.5" data-testid="event-cards-list">
            {filtered.map((ev, i) => (
              <motion.div
                key={ev.event_id}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                onClick={() => setSelected(ev)}
                className={`glass-card cursor-pointer p-4 ${selected?.event_id === ev.event_id ? 'border-white/25 bg-white/8' : ''}`}
                data-testid={`event-card-${ev.event_id}`}
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                    <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover opacity-60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-sm text-white truncate">{ev.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1"><Calendar size={9} />{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {ev.city}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-white/40 flex items-center gap-1"><Users size={9} />{ev.attendee_count}/{ev.capacity}</span>
                      <span className="text-xs text-white/60 flex items-center gap-1"><TrendingUp size={9} />{Math.round((ev.funding_raised / ev.funding_goal) * 100)}%</span>
                    </div>
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white/50 rounded-full" style={{ width: `${Math.min(100, Math.round((ev.funding_raised / ev.funding_goal) * 100))}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && <div className="text-center py-10 text-white/25 text-sm font-body">No events for this filter.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
