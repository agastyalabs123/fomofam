import { motion } from 'framer-motion';
import { MapPin, Users, TrendingUp, ArrowDown, Calendar } from 'lucide-react';

const FloatingCard = ({ className, animClass, delay, event }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={`glass-card rounded-2xl p-4 shadow-glass w-56 absolute z-10 ${animClass} ${className}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[#FF6B4A] to-[#FF8E75] flex-shrink-0">
        <img src={event.img} alt={event.title} className="w-full h-full object-cover opacity-90" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-heading font-semibold text-[#1A1A2E] truncate">{event.title}</p>
        <p className="text-xs text-[#52525B] flex items-center gap-1"><MapPin size={9} />{event.city}</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-xs bg-[#FF6B4A]/10 text-[#FF6B4A] px-2 py-0.5 rounded-full font-medium">{event.tag}</span>
      <div className="flex items-center gap-1 text-xs text-[#52525B]"><Users size={10} />{event.attendees}</div>
    </div>
    <div className="mt-2">
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#FF8E75] rounded-full" style={{ width: `${event.funded}%` }} />
      </div>
      <p className="text-xs text-[#52525B] mt-1">{event.funded}% funded</p>
    </div>
  </motion.div>
);

const words = ['The', 'Future', 'of', 'Events', 'is', 'Community-Powered'];

export default function HeroSection({ onAuthOpen }) {
  const cards = [
    { title: 'Seoul Web3 Meetup', city: 'Seoul', tag: 'Web3', attendees: '120', funded: 62, img: 'https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=64&q=80' },
    { title: 'Singapore DeFi Summit', city: 'Singapore', tag: 'DeFi', attendees: '380', funded: 84, img: 'https://images.unsplash.com/photo-1752649938189-05463ebbe6bd?w=64&q=80' },
    { title: 'Lisbon AI Conference', city: 'Lisbon', tag: 'AI', attendees: '210', funded: 73, img: 'https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=64&q=80' },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden mesh-gradient pt-20" data-testid="hero-section">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb-animate absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#FF6B4A]/10 blur-3xl" />
        <div className="orb-animate-slow absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#FF6B4A]/8 blur-3xl" />
        <div className="orb-animate absolute bottom-10 left-1/3 w-72 h-72 rounded-full bg-navy-100/20 blur-3xl" />
      </div>

      {/* Floating event cards */}
      <FloatingCard className="hidden lg:block top-28 right-12" animClass="float-card-a" delay={1.0} event={cards[0]} />
      <FloatingCard className="hidden lg:block top-52 right-72" animClass="float-card-b" delay={1.3} event={cards[1]} />
      <FloatingCard className="hidden xl:block bottom-32 right-16" animClass="float-card-c" delay={1.6} event={cards[2]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse" />
            <span className="text-sm font-medium text-[#FF6B4A] font-body">Discover. Fund. Attend. On-Chain.</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-[#1A1A2E] leading-tight mb-6">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`inline-block mr-3 ${word === 'Community-Powered' ? 'text-[#FF6B4A]' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg sm:text-xl text-[#52525B] font-body leading-relaxed mb-10 max-w-2xl"
          >
            Discover events near you. Fund the ones you believe in. Build your reputation as an attendee, organizer, or sponsor.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex items-center gap-8 mb-10"
          >
            {[['10K+', 'Events Listed'], ['$2M+', 'Funds Secured'], ['50K+', 'Attendees']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-heading font-bold text-2xl text-[#1A1A2E]">{val}</div>
                <div className="text-xs text-[#52525B] font-body">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-coral flex items-center gap-2 text-base px-8 py-4"
              data-testid="explore-events-btn"
            >
              <MapPin size={18} /> Explore Events
            </button>
            <button
              onClick={() => onAuthOpen('register')}
              className="btn-outline flex items-center gap-2 text-base px-8 py-4"
              data-testid="create-event-btn"
            >
              <Calendar size={18} /> Create an Event
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
        data-testid="scroll-indicator"
      >
        <span className="text-xs text-[#A1A1AA] font-body tracking-widest uppercase">Scroll</span>
        <ArrowDown size={20} className="text-[#FF6B4A] scroll-bounce" />
      </motion.div>
    </section>
  );
}
