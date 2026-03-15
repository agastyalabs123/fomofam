import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, Clock, Shield, FileText, Coins, Star, ChevronRight } from 'lucide-react';

const milestones = [
  { title: 'Venue Booked', completed: true, amount: '$2,000', icon: CheckCircle },
  { title: 'Speakers Confirmed', completed: true, amount: '$3,000', icon: CheckCircle },
  { title: 'Event Day — Funds Released', completed: false, amount: '$3,000', icon: Clock },
];

const sponsors = [
  { name: 'Polygon', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=polygon', amount: '$2K' },
  { name: 'Alchemy', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=alchemy', amount: '$1.5K' },
  { name: 'OpenSea', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=opensea', amount: '$1K' },
];

const steps = [
  { num: '01', icon: FileText, title: 'Propose', desc: 'Submit your event with budget, milestones, and goals. Transparency from day one.' },
  { num: '02', icon: Coins, title: 'Fund', desc: 'Community and sponsors back events. Funds locked in escrow until milestones hit.' },
  { num: '03', icon: Star, title: 'Attend', desc: 'Verified attendees build on-chain reputation. Every event adds to your record.' },
];

export default function CreateEventsSection({ onAuthOpen }) {
  const progressRef = useRef(null);
  const inView = useInView(progressRef, { once: true, margin: '-60px' });

  return (
    <section id="create-events-section" className="py-24 bg-[#060606]" data-testid="create-events-section">
      <div className="section-line mx-8 mb-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">02 — Create</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight mb-4">
            Create & Fund <span className="text-gradient">Events</span>
          </h2>
          <p className="text-white/45 font-body text-base max-w-xl">Milestone-based escrow means sponsors commit, funds stay locked until you deliver.</p>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="glass-card border border-white/10 overflow-hidden max-w-4xl mb-20"
          data-testid="create-event-card"
        >
          {/* Banner */}
          <div className="relative h-52 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=1200&q=80" alt="Event" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-5 left-6">
              <span className="glass text-xs font-medium text-white/70 px-3 py-1.5 rounded-full border border-white/10">Meetup</span>
              <h3 className="font-display font-black text-2xl text-white mt-2 tracking-tight">Seoul Web3 Builder Meetup</h3>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Info + sponsors */}
              <div>
                <div className="flex flex-wrap gap-4 text-xs text-white/40 font-body mb-6">
                  <span>Startup Alliance Seoul</span>
                  <span>120 / 200 attending</span>
                  <span>Mar 15, 2025</span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=jake" alt="Jake" className="w-10 h-10 rounded-xl bg-white/10" />
                  <div>
                    <p className="text-sm font-display font-semibold text-white">Jake Kim</p>
                    <p className="text-xs text-white/35">Organizer · Seoul</p>
                  </div>
                </div>
                <p className="text-xs text-white/35 font-body mb-3 uppercase tracking-wider">Sponsors</p>
                <div className="flex flex-wrap gap-2">
                  {sponsors.map((s, i) => (
                    <motion.div key={s.name} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-white/8" data-testid={`sponsor-${i}`}>
                      <img src={s.avatar} alt={s.name} className="w-5 h-5 rounded-full bg-white/10" />
                      <span className="text-xs font-medium text-white/70">{s.name}</span>
                      <span className="text-xs text-white/35">{s.amount}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Escrow tracker */}
              <div className="glass rounded-2xl p-5 border border-white/8">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={14} className="text-white/60" />
                  <span className="text-sm font-display font-bold text-white">Sponsorship Escrow</span>
                </div>
                <div className="flex justify-between items-baseline mb-3">
                  <span className="font-display font-black text-2xl text-white">$5,000</span>
                  <span className="text-xs text-white/35 font-body">of $8,000 goal</span>
                </div>
                <div ref={progressRef} className="h-2.5 bg-white/8 rounded-full overflow-hidden mb-5">
                  <motion.div
                    className="h-full bg-white/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={inView ? { width: '62%' } : { width: 0 }}
                    transition={{ duration: 1.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>
                <div className="space-y-2.5">
                  {milestones.map((m, i) => (
                    <motion.div key={m.title} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.3 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${m.completed ? 'bg-white/6 border border-white/10' : 'bg-white/3 border border-white/5'}`}
                      data-testid={`milestone-${i}`}>
                      <m.icon size={14} className={m.completed ? 'text-white/80' : 'text-white/25'} />
                      <span className="text-xs font-body text-white/65 flex-1">{m.title}</span>
                      <span className={`text-xs font-medium ${m.completed ? 'text-white/60' : 'text-white/25'}`}>{m.amount}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-white/25 mt-4 font-body">Funds in escrow — released on verified milestones</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/6">
              <button className="btn-white flex items-center gap-2 px-7 py-3.5 text-sm" data-testid="back-event-btn">
                Back This Event <ChevronRight size={15} />
              </button>
              <button className="btn-glass flex items-center gap-2 px-7 py-3.5 text-sm" data-testid="apply-sponsor-btn">
                Apply as Sponsor
              </button>
            </div>
          </div>
        </motion.div>

        {/* 3-Step flow */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {steps.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
              className="glass-card p-7 relative" data-testid={`step-${i + 1}`}>
              <span className="absolute top-5 right-6 font-display font-black text-4xl text-white/[0.04] select-none">{step.num}</span>
              <div className="w-11 h-11 glass rounded-2xl flex items-center justify-center mb-5 border border-white/10">
                <step.icon size={20} className="text-white/70" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/45 font-body leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
          <motion.button
            animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.08)', '0 0 32px 4px rgba(255,255,255,0.14)', '0 0 0 0 rgba(255,255,255,0.08)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            onClick={() => onAuthOpen('register')}
            className="btn-white px-12 py-4 text-sm inline-flex items-center gap-2"
            data-testid="start-organizing-btn"
          >
            Start Organizing <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
