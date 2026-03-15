import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, Clock, Users, MapPin, Shield, ChevronRight } from 'lucide-react';

const milestones = [
  { title: 'Venue Booked', completed: true, amount: '$2,000', icon: CheckCircle },
  { title: 'Speakers Confirmed', completed: true, amount: '$3,000', icon: CheckCircle },
  { title: 'Event Day — Funds Released', completed: false, amount: '$3,000', icon: Clock },
];

const sponsors = [
  { name: 'Polygon', amount: '$2,000', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=polygon' },
  { name: 'Alchemy', amount: '$1,500', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=alchemy' },
  { name: 'OpenSea', amount: '$1,000', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=opensea' },
  { name: '+3 more', amount: '', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=more' },
];

export default function EventDetailSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const progress = 62; // 5000/8000

  return (
    <section id="event-detail" className="py-24 bg-[#FAFAFA] overflow-hidden" data-testid="event-detail-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <span className="text-sm font-medium text-[#FF6B4A] font-body uppercase tracking-widest mb-3 block">Spotlight Event</span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-[#1A1A2E]">See How Funding Works</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-glass border border-gray-100 overflow-hidden max-w-5xl mx-auto"
          data-testid="event-detail-card"
        >
          {/* Event image banner */}
          <div className="relative h-64 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=1200&q=80"
              alt="Seoul Web3 Builder Meetup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-[#FF6B4A] text-white text-xs font-medium px-3 py-1.5 rounded-full">Meetup</span>
              <h3 className="font-heading font-bold text-2xl text-white mt-2">Seoul Web3 Builder Meetup</h3>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Event info */}
              <div>
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-[#52525B] font-body">
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#FF6B4A]" /> Startup Alliance Seoul</span>
                  <span className="flex items-center gap-1.5"><Users size={14} className="text-[#FF6B4A]" /> 120 / 200 attending</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#FF6B4A]" /> Mar 15, 2025</span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=jake" alt="Jake Kim" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">Jake Kim</p>
                    <p className="text-xs text-[#52525B]">Organizer · Seoul</p>
                  </div>
                </div>

                {/* Sponsors */}
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E] mb-3 font-body">Sponsors</p>
                  <div className="flex flex-wrap gap-2">
                    {sponsors.map((s, i) => (
                      <motion.div
                        key={s.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                        data-testid={`sponsor-${i}`}
                      >
                        <img src={s.avatar} alt={s.name} className="w-6 h-6 rounded-full" />
                        <span className="text-xs font-medium text-[#1A1A2E]">{s.name}</span>
                        {s.amount && <span className="text-xs text-[#FF6B4A]">{s.amount}</span>}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Funding escrow */}
              <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-[#FF6B4A]" />
                  <span className="text-sm font-semibold text-[#1A1A2E] font-heading">Sponsorship Escrow</span>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-heading font-bold text-2xl text-[#1A1A2E]">$5,000</span>
                  <span className="text-sm text-[#52525B] font-body">of $8,000 goal</span>
                </div>

                {/* Progress bar */}
                <div ref={ref} className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#FF8E75] rounded-full"
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${progress}%` } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>

                {/* Milestones */}
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <motion.div
                      key={m.title}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${m.completed ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'}`}
                      data-testid={`milestone-${i}`}
                    >
                      <m.icon size={16} className={m.completed ? 'text-green-500' : 'text-[#A1A1AA]'} />
                      <span className="text-sm font-medium text-[#1A1A2E] flex-1 font-body">{m.title}</span>
                      <span className={`text-xs font-medium ${m.completed ? 'text-green-600' : 'text-[#A1A1AA]'}`}>{m.amount}</span>
                    </motion.div>
                  ))}
                </div>

                <p className="text-xs text-[#A1A1AA] mt-4 flex items-center gap-1 font-body">
                  <Shield size={11} /> Funds secured in escrow — released on milestones
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-100">
              <button className="btn-coral flex items-center gap-2 px-7 py-3.5 text-sm" data-testid="back-event-btn">
                Back This Event <ChevronRight size={16} />
              </button>
              <button className="btn-outline flex items-center gap-2 px-7 py-3.5 text-sm" data-testid="apply-sponsor-btn">
                Apply as Sponsor <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
