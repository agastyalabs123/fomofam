import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Lock, Clock } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COMMUNITY_GRADIENTS = [
  'from-white/5 to-white/[0.02]',
  'from-white/4 to-white/[0.02]',
  'from-white/5 to-white/[0.02]',
  'from-white/4 to-white/[0.02]',
  'from-white/5 to-white/[0.02]',
  'from-white/4 to-white/[0.02]',
];

export default function CommunitySection() {
  const [communities, setCommunities] = useState([]);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    axios.get(`${API}/communities`).then(r => setCommunities(r.data)).catch(() => {});
  }, []);

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await axios.post(`${API}/waitlist`, { email });
      setJoined(true);
      setEmail('');
    } catch { setJoined(true); }
  };

  return (
    <section id="community-section" className="py-24 bg-[#0A0A0A]" data-testid="community-section">
      <div className="section-line mx-8 mb-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
          <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">03 — Community</span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                Join Communities,<br /><span className="text-gradient">Find Your People</span>
              </h2>
            </div>
            {/* Coming Soon badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 glass-strong rounded-2xl px-6 py-4 border border-white/12 text-center"
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-white/50" />
                <span className="text-xs text-white/50 font-body uppercase tracking-widest">Launching</span>
              </div>
              <p className="font-display font-black text-xl text-white">Q2 2026</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Community cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {communities.map((c, i) => (
            <motion.div
              key={c.community_id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b ${COMMUNITY_GRADIENTS[i % 6]} p-6`}
              data-testid={`community-card-${c.community_id}`}
            >
              {/* Coming Soon overlay */}
              <div className="coming-soon-overlay absolute inset-0 flex items-center justify-center z-10 rounded-2xl">
                <motion.div
                  whileHover={{ rotate: -3, scale: 1.05 }}
                  className="glass-strong rounded-2xl px-5 py-2.5 border border-white/15 rotate-[-5deg]"
                  data-testid={`coming-soon-${c.community_id}`}
                >
                  <div className="flex items-center gap-2">
                    <Lock size={13} className="text-white/70" />
                    <span className="font-display font-bold text-sm text-white tracking-wide">Coming Soon</span>
                  </div>
                </motion.div>
              </div>

              {/* Card content (dimmed) */}
              <div className="opacity-35">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Users size={18} className="text-white/70" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">{c.name}</h3>
                    <p className="text-xs text-white/40 font-body">{c.member_count.toLocaleString()} members</p>
                  </div>
                </div>
                <p className="text-sm text-white/40 font-body mb-4 line-clamp-2">{c.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {c.tags?.map(tag => (
                    <span key={tag} className="text-xs glass rounded-full px-2.5 py-1 border border-white/8 text-white/40">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Waitlist CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="glass-card border border-white/10 p-8 text-center max-w-lg mx-auto">
          <p className="text-xs text-white/35 uppercase tracking-widest font-body mb-3">Link Instagram, Twitter, or Telegram</p>
          <h3 className="font-display font-bold text-2xl text-white mb-2">Be first when Communities launch</h3>
          <p className="text-sm text-white/40 font-body mb-6">Join the waitlist and we'll notify you when your communities are live.</p>
          {joined ? (
            <div className="glass rounded-2xl px-6 py-4 border border-white/12 text-white/70 font-body text-sm">You're on the list!</div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex gap-3" data-testid="community-waitlist-form">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/25 text-sm font-body focus:outline-none focus:border-white/25 transition-colors"
                data-testid="community-waitlist-email" />
              <button type="submit" className="btn-white px-5 py-3 text-sm" data-testid="community-waitlist-submit">Join</button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
