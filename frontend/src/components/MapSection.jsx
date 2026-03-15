import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Users, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const createPulsingIcon = () => L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#FF6B4A;border:3px solid white;
    box-shadow:0 2px 8px rgba(255,107,74,0.5);
    animation:mapPulse 2s infinite;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -14],
});

const TAGS = ['All', 'Hackathons', 'Networking', 'Conferences', 'Meetups', 'Workshops', 'Web3', 'AI', 'Music'];

const fadeUpStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function MapSection() {
  const [events, setEvents] = useState([]);
  const [activeTag, setActiveTag] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    axios.get(`${API}/events`).then(r => {
      setEvents(r.data);
      if (r.data.length) setSelectedEvent(r.data[0]);
    }).catch(() => {});
  }, []);

  const filtered = activeTag === 'All'
    ? events
    : events.filter(e => e.tags?.some(t => t.toLowerCase().includes(activeTag.toLowerCase())) || e.category?.toLowerCase().includes(activeTag.toLowerCase()));

  const mapCenter = [20, 40];

  return (
    <section id="map-section" className="py-24 bg-white overflow-hidden" data-testid="map-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span className="text-sm font-medium text-[#FF6B4A] font-body uppercase tracking-widest mb-3 block">Global Events</span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-[#1A1A2E] mb-4">Find Events Around You</h2>
          <p className="text-[#52525B] font-body text-base sm:text-lg max-w-2xl">
            From Seoul to Lisbon, discover community-powered events backed by real funding and real people.
          </p>
        </motion.div>

        {/* Filter Tags */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-8"
          data-testid="filter-tags"
        >
          {TAGS.map(tag => (
            <motion.button
              key={tag}
              variants={fadeUpItem}
              onClick={() => setActiveTag(tag)}
              className={`tag-pill ${activeTag === tag ? 'active' : ''}`}
              data-testid={`filter-tag-${tag.toLowerCase()}`}
            >
              {tag}
            </motion.button>
          ))}
        </motion.div>

        {/* Map + Events side-by-side */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 rounded-3xl overflow-hidden shadow-glass border border-gray-100"
            style={{ height: '480px' }}
            data-testid="map-container"
          >
            <MapContainer center={mapCenter} zoom={2} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {filtered.map(event => (
                <Marker
                  key={event.event_id}
                  position={[event.lat, event.lng]}
                  icon={createPulsingIcon()}
                  eventHandlers={{ click: () => setSelectedEvent(event) }}
                >
                  <Popup>
                    <div className="p-1 min-w-40">
                      <p className="font-heading font-semibold text-sm text-[#1A1A2E] mb-1">{event.title}</p>
                      <p className="text-xs text-[#52525B]">{event.city}, {event.country}</p>
                      <p className="text-xs text-[#FF6B4A] mt-1 font-medium">{event.category}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </motion.div>

          {/* Event cards list */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-1" data-testid="event-cards-list">
            {filtered.map((event, i) => (
              <motion.div
                key={event.event_id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => setSelectedEvent(event)}
                whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
                className={`cursor-pointer rounded-2xl border p-4 transition-all bg-white ${selectedEvent?.event_id === event.event_id ? 'border-[#FF6B4A] shadow-coral-sm' : 'border-gray-100 shadow-sm'}`}
                data-testid={`event-card-${event.event_id}`}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#FF6B4A]/20 to-[#FF6B4A]/10">
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-sm text-[#1A1A2E] truncate">{event.title}</h3>
                    <p className="text-xs text-[#52525B] flex items-center gap-1 mt-0.5"><Calendar size={10} />{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {event.city}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs flex items-center gap-1 text-[#52525B]"><Users size={10} />{event.attendee_count}/{event.capacity}</span>
                      <span className="text-xs flex items-center gap-1 text-[#FF6B4A] font-medium"><TrendingUp size={10} />{Math.round((event.funding_raised / event.funding_goal) * 100)}% funded</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#FF8E75] rounded-full"
                        style={{ width: `${Math.min(100, Math.round((event.funding_raised / event.funding_goal) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-[#A1A1AA] font-body text-sm">No events found for this filter.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
