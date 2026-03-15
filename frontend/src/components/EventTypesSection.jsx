import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Code, Network, Mic, Users, BookOpen, Music, Palette, Activity } from 'lucide-react';

const eventTypes = [
  { label: 'Hackathons', icon: Code, color: 'from-violet-100 to-purple-100', iconColor: 'text-violet-600' },
  { label: 'Networking', icon: Network, color: 'from-blue-100 to-cyan-100', iconColor: 'text-blue-600' },
  { label: 'Conferences', icon: Mic, color: 'from-orange-100 to-red-100', iconColor: 'text-[#FF6B4A]' },
  { label: 'Meetups', icon: Users, color: 'from-green-100 to-teal-100', iconColor: 'text-green-600' },
  { label: 'Workshops', icon: BookOpen, color: 'from-amber-100 to-yellow-100', iconColor: 'text-amber-600' },
  { label: 'Music Events', icon: Music, color: 'from-pink-100 to-rose-100', iconColor: 'text-pink-600' },
  { label: 'Art Shows', icon: Palette, color: 'from-indigo-100 to-blue-100', iconColor: 'text-indigo-600' },
  { label: 'Sports', icon: Activity, color: 'from-lime-100 to-green-100', iconColor: 'text-lime-600' },
];

export default function EventTypesSection() {
  const scrollRef = useRef(null);

  return (
    <section id="event-types" className="py-24 bg-white overflow-hidden" data-testid="event-types-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-sm font-medium text-[#FF6B4A] font-body uppercase tracking-widest mb-3 block">Event Types</span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-[#1A1A2E]">Whatever you're into,<br />we've got an event for it.</h2>
        </motion.div>

        {/* Desktop grid */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4"
          data-testid="event-types-grid"
        >
          {eventTypes.map((type, i) => (
            <motion.div
              key={type.label}
              variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } } }}
              whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.1)', scale: 1.02 }}
              className={`bg-gradient-to-br ${type.color} rounded-3xl p-6 cursor-pointer transition-shadow border border-white/60`}
              data-testid={`event-type-${type.label.toLowerCase().replace(' ', '-')}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                <type.icon size={22} className={type.iconColor} />
              </div>
              <h3 className="font-heading font-bold text-base text-[#1A1A2E]">{type.label}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile horizontal scroll */}
        <div
          ref={scrollRef}
          className="sm:hidden flex gap-4 overflow-x-auto pb-4 scroll-snap-x"
          data-testid="event-types-scroll"
        >
          {eventTypes.map(type => (
            <div
              key={type.label}
              className={`snap-item flex-shrink-0 w-32 bg-gradient-to-br ${type.color} rounded-2xl p-4 border border-white/60`}
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                <type.icon size={18} className={type.iconColor} />
              </div>
              <h3 className="font-heading font-semibold text-sm text-[#1A1A2E]">{type.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
