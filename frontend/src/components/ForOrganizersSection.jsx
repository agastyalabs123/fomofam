import { motion } from 'framer-motion';
import { Ghost, Filter, TrendingUp, Lock, Star, Frown, ChevronRight } from 'lucide-react';

const PAIN_POINTS = [
  {
    problem: 'Sponsors Ghost?',
    solution: 'Escrow-locked sponsorship.',
    detail: 'No commitment, no spot. Every sponsor pledge is locked in escrow until milestones are verified.',
    problemIcon: Ghost, solutionIcon: Lock,
  },
  {
    problem: 'Low-Quality Attendees?',
    solution: 'Reputation scoring filters out noise.',
    detail: 'On-chain reputation ensures only genuinely interested attendees register — no email farmers.',
    problemIcon: Frown, solutionIcon: Star,
  },
  {
    problem: 'Not Enough Funding?',
    solution: 'Community crowdfunding validates demand.',
    detail: "Prove demand before you spend. If goals aren't met, organizers get full control to refund or reschedule.",
    problemIcon: Filter, solutionIcon: TrendingUp,
  },
];

export default function ForOrganizersSection({ onAuthOpen }) {
  return (
    <section id="organizers-section" className="py-24 bg-[#060606]" data-testid="organizers-section">
      <div className="section-line mx-8 mb-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <span className="text-xs font-medium text-white/35 uppercase tracking-[0.2em] font-body block mb-3">04 — Organizers</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight mb-4">
            Built for Organizers<br /><span className="text-gradient">Tired of Broken Promises</span>
          </h2>
          <p className="text-white/45 font-body text-base max-w-xl">We rebuilt the event stack from the ground up with accountability at its core.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {PAIN_POINTS.map((p, i) => (
            <motion.div
              key={p.problem}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="glass-card group p-8 relative overflow-hidden"
              data-testid={`pain-point-${i}`}
            >
              {/* Background large icon */}
              <p.problemIcon size={80} className="absolute -bottom-4 -right-4 text-white/[0.025] group-hover:text-white/[0.04] transition-colors" />

              {/* Problem (strikethrough) */}
              <div className="flex items-center gap-2 mb-5">
                <p.problemIcon size={18} className="text-white/30" />
                <span className="font-body text-sm text-white/30 line-through">{p.problem}</span>
              </div>

              {/* Solution */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0 mt-0.5">
                  <p.solutionIcon size={16} className="text-white/70" />
                </div>
                <h3 className="font-display font-bold text-lg text-white leading-tight">{p.solution}</h3>
              </div>
              <p className="text-sm text-white/40 font-body leading-relaxed">{p.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
          <motion.button
            animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.06)', '0 0 28px 2px rgba(255,255,255,0.12)', '0 0 0 0 rgba(255,255,255,0.06)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            onClick={() => onAuthOpen('register')}
            className="btn-white inline-flex items-center gap-2 px-10 py-4 text-sm"
            data-testid="organizer-cta-btn"
          >
            Start Organizing <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
