import { motion } from 'framer-motion';
import { Star, Award, CheckCircle, Zap } from 'lucide-react';
import { Code, Network, Mic, Users, BookOpen, Music, Palette, Activity } from 'lucide-react';

const PROFILES = [
  {
    role: 'Attendee', name: 'Mia Park',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia',
    badge: 'Super Attendee', icon: Star,
    stats: [['12', 'Events'], ['4.8', 'Rating'], ['5', 'Cities']],
    tags: ['verified', 'top 5%', 'early backer'],
    quote: '"Shows up, engages genuinely, leaves reviews."',
  },
  {
    role: 'Organizer', name: 'Jake Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jake',
    badge: 'Trusted Organizer', icon: Award,
    stats: [['8', 'Hosted'], ['95%', 'Milestone'], ['2.4K', 'Reached']],
    tags: ['trusted', '100% delivery', 'Web3'],
    quote: '"Every event delivered on promises. Every time."',
  },
  {
    role: 'Sponsor', name: 'Alchemy DAO',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=alchemy',
    badge: 'Reliable Sponsor', icon: CheckCircle,
    stats: [['15', 'Backed'], ['100%', 'Payout'], ['$82K', 'Deployed']],
    tags: ['reliable', 'zero disputes', 'global'],
    quote: '"Commits when they say they will."',
  },
];

const EVENT_TYPES = [
  { label: 'Hackathons', icon: Code },
  { label: 'Networking', icon: Network },
  { label: 'Conferences', icon: Mic },
  { label: 'Meetups', icon: Users },
  { label: 'Workshops', icon: BookOpen },
  { label: 'Music', icon: Music },
  { label: 'Art Shows', icon: Palette },
  { label: 'Sports', icon: Activity },
];

export default function ReputationSection() {
  return (
    <>
      {/* Reputation */}
      <section id="reputation-section" className="py-24 bg-[#0A0A0A]" data-testid="reputation-section">
        <div className="section-line mx-8 mb-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">05 — Reputation</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight mb-4">
              Your Event Reputation,<br /><span className="text-gradient">On-Chain</span>
            </h2>
            <p className="text-white/45 font-body text-base max-w-xl mx-auto">Every action builds your permanent, verifiable reputation.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROFILES.map((p, i) => (
              <motion.div
                key={p.role}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="tilt-card glass-card p-7 cursor-default"
                data-testid={`reputation-card-${p.role.toLowerCase()}`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    <img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-2xl bg-white/10" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 glass rounded-full flex items-center justify-center border border-white/15 shadow-white-glow-sm">
                      <p.icon size={13} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/35 font-body uppercase tracking-wider">{p.role}</p>
                    <h3 className="font-display font-bold text-lg text-white">{p.name}</h3>
                    <span className="text-xs glass rounded-full px-2.5 py-0.5 text-white/55 border border-white/10 font-body">{p.badge}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-white/6 border-t border-b border-white/6 py-4 mb-5">
                  {p.stats.map(([val, label]) => (
                    <div key={label} className="text-center px-2">
                      <div className="font-display font-black text-lg text-white">{val}</div>
                      <div className="text-xs text-white/30 font-body">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.tags.map(t => (
                    <span key={t} className="text-xs glass border border-white/8 text-white/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Zap size={8} className="text-white/40" /> {t}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-white/35 font-body italic">{p.quote}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section id="event-types" className="py-24 bg-[#060606]" data-testid="event-types-section">
        <div className="section-line mx-8 mb-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
            <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">06 — Event Types</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
              Whatever you're into,<br /><span className="text-gradient">we've got it.</span>
            </h2>
          </motion.div>

          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden" whileInView="show" viewport={{ once: true }}
            className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="event-types-grid"
          >
            {EVENT_TYPES.map(et => (
              <motion.div
                key={et.label}
                variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } } }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card p-7 cursor-pointer"
                data-testid={`event-type-card-${et.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className="w-11 h-11 glass rounded-2xl flex items-center justify-center border border-white/10 mb-4">
                  <et.icon size={20} className="text-white/65" />
                </div>
                <h3 className="font-display font-bold text-base text-white">{et.label}</h3>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile scroll */}
          <div className="sm:hidden flex gap-4 overflow-x-auto pb-4 scroll-snap-x" data-testid="event-types-scroll">
            {EVENT_TYPES.map(et => (
              <div key={et.label} className="snap-item flex-shrink-0 w-36 glass-card p-5">
                <div className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/8 mb-3">
                  <et.icon size={16} className="text-white/65" />
                </div>
                <h3 className="font-display font-bold text-sm text-white">{et.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
