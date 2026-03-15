import { lazy, Suspense } from 'react';import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowDown } from 'lucide-react';

const Globe3D = lazy(() => import('./Globe3D'));

const words = ['The', 'Future', 'of', 'Events', 'is', 'Community-Powered'];

const FloatingCard = ({ className, animClass, data }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: data.delay, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={`glass-card absolute z-20 w-52 p-4 ${animClass} ${className}`}
  >
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
        <img src={data.img} alt={data.title} className="w-full h-full object-cover opacity-70" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-display font-semibold text-white truncate">{data.title}</p>
        <p className="text-xs text-white/45 flex items-center gap-1 mt-0.5"><MapPin size={9} />{data.city}</p>
      </div>
    </div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs glass rounded-full px-2.5 py-0.5 text-white/70 border border-white/10">{data.tag}</span>
      <span className="text-xs text-white/40">{data.attendees} going</span>
    </div>
    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-white/60 rounded-full" style={{ width: `${data.funded}%` }} />
    </div>
    <p className="text-xs text-white/35 mt-1">{data.funded}% funded</p>
  </motion.div>
);

const CARDS = [
  { title: 'Seoul Web3 Meetup', city: 'Seoul', tag: 'Web3', attendees: '120', funded: 62, delay: 1.0, img: 'https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=64&q=80' },
  { title: 'Singapore DeFi Summit', city: 'Singapore', tag: 'DeFi', attendees: '380', funded: 84, delay: 1.3, img: 'https://images.unsplash.com/photo-1752649938189-05463ebbe6bd?w=64&q=80' },
  { title: 'Lisbon AI Conf.', city: 'Lisbon', tag: 'AI', attendees: '210', funded: 73, delay: 1.6, img: 'https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=64&q=80' },
];

export default function HeroSection({ onAuthOpen }) {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0A] pt-20" data-testid="hero-section">
      {/* Globe glow background */}
      <div className="globe-glow absolute inset-0 z-0" />

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb absolute top-20 right-1/4 w-96 h-96 rounded-full bg-white/[0.025] blur-3xl" />
        <div className="orb-slow absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-white/[0.018] blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-[80vh]">

          {/* Left: Text content */}
          <div className="relative z-10 py-16 lg:py-0">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-white/10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-medium text-white/65 tracking-widest uppercase">Discover. Fund. Attend. On-Chain.</span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display font-black text-[clamp(3rem,7vw,6rem)] leading-[0.9] text-white tracking-[-0.04em] mb-7">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.2 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`inline-block mr-4 ${(word === 'Community-Powered') ? 'text-gradient' : ''}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="text-base sm:text-lg text-white/50 font-body leading-relaxed mb-10 max-w-lg"
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
              {[['10K+', 'Events'], ['$2M+', 'Secured'], ['50K+', 'Attendees']].map(([val, label]) => (
                <div key={label}>
                  <div className="font-display font-black text-2xl text-white tracking-tight">{val}</div>
                  <div className="text-xs text-white/35 font-body mt-0.5">{label}</div>
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
                onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-white flex items-center gap-2 text-sm px-8 py-4"
                data-testid="explore-events-btn"
              >
                <MapPin size={16} /> Explore Events
              </button>
              <button
                onClick={() => onAuthOpen('register')}
                className="btn-glass flex items-center gap-2 text-sm px-8 py-4"
                data-testid="create-event-btn"
              >
                <Calendar size={16} /> Create an Event
              </button>
            </motion.div>
          </div>

          {/* Right: 3D Globe */}
          <div className="relative h-[400px] lg:h-[600px]">
            {/* Floating event cards over globe */}
            <FloatingCard className="hidden lg:block top-12 -left-6" animClass="float-a" data={CARDS[0]} />
            <FloatingCard className="hidden xl:block bottom-16 -left-8" animClass="float-c" data={CARDS[1]} />
            <FloatingCard className="hidden lg:block top-1/2 right-0 -translate-y-1/2" animClass="float-b" data={CARDS[2]} />

            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
              <Globe3D className="w-full h-full" />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
        onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
        data-testid="scroll-indicator"
      >
        <span className="text-xs text-white/25 tracking-[0.25em] uppercase font-body">Scroll</span>
        <ArrowDown size={18} className="text-white/40 bounce" />
      </motion.div>
    </section>
  );
}
