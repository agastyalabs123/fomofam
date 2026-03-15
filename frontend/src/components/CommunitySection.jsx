import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Plus } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const tagColors = {
  'Web3': 'bg-blue-50 text-blue-600 border-blue-100',
  'Builders': 'bg-orange-50 text-orange-600 border-orange-100',
  'Korea': 'bg-red-50 text-red-500 border-red-100',
  'Ethereum': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'Hackathon': 'bg-purple-50 text-purple-600 border-purple-100',
  'DeFi': 'bg-cyan-50 text-cyan-600 border-cyan-100',
  'AI': 'bg-violet-50 text-violet-600 border-violet-100',
  'Research': 'bg-teal-50 text-teal-600 border-teal-100',
  'Music': 'bg-pink-50 text-pink-600 border-pink-100',
  'Culture': 'bg-rose-50 text-rose-600 border-rose-100',
  'Women': 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
  'Finance': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Asia': 'bg-sky-50 text-sky-600 border-sky-100',
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

export default function CommunitySection() {
  const [communities, setCommunities] = useState([]);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    axios.get(`${API}/communities`).then(r => setCommunities(r.data)).catch(() => {});
  }, []);

  const handleJoin = async (id, i) => {
    setJoining(id);
    try {
      await axios.post(`${API}/communities/${id}/join`, {}, { withCredentials: true });
      setCommunities(prev => prev.map(c => c.community_id === id ? { ...c, member_count: c.member_count + 1 } : c));
    } catch {}
    setTimeout(() => setJoining(null), 800);
  };

  // Gradient backgrounds for cards
  const gradients = [
    'from-orange-50 to-red-50',
    'from-indigo-50 to-purple-50',
    'from-violet-50 to-blue-50',
    'from-pink-50 to-rose-50',
    'from-teal-50 to-cyan-50',
    'from-emerald-50 to-green-50',
  ];

  return (
    <section id="community-section" className="py-24 bg-[#FAFAFA] overflow-hidden" data-testid="community-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-sm font-medium text-[#FF6B4A] font-body uppercase tracking-widest mb-3 block">Communities</span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-[#1A1A2E]">Join Communities,<br />Find Your People</h2>
            </div>
            <p className="text-[#52525B] font-body text-sm max-w-xs">Link your Instagram, Twitter, or Telegram to connect with members.</p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community, i) => (
            <motion.div
              key={community.community_id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-shadow group"
              data-testid={`community-card-${community.community_id}`}
            >
              {/* Card header gradient */}
              <div className={`h-24 bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                <div className="absolute inset-0 opacity-20">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="absolute rounded-full bg-[#FF6B4A]/30" style={{ width: `${40 + j * 20}px`, height: `${40 + j * 20}px`, top: `${10 + j * 15}px`, right: `${20 + j * 10}px` }} />
                  ))}
                </div>
                <div className="absolute bottom-4 left-6">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <Users size={18} className="text-[#FF6B4A]" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-heading font-bold text-lg text-[#1A1A2E] mb-1">{community.name}</h3>
                <p className="text-sm text-[#52525B] font-body mb-4 leading-relaxed line-clamp-2">{community.description}</p>

                <div className="flex items-center gap-4 mb-4 text-xs text-[#52525B] font-body">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users size={12} className="text-[#FF6B4A]" />
                    {community.member_count.toLocaleString()} members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#FF6B4A]" />
                    {community.upcoming_events_count} upcoming
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {community.tags?.map(tag => (
                    <span key={tag} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${tagColors[tag] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleJoin(community.community_id, i)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${joining === community.community_id ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-[#FF6B4A]/8 text-[#FF6B4A] border border-[#FF6B4A]/20 hover:bg-[#FF6B4A] hover:text-white'}`}
                  data-testid={`join-community-${community.community_id}`}
                >
                  {joining === community.community_id ? '✓ Joined!' : <><Plus size={14} /> Join Community</>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
