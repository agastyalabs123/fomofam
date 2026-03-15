import { motion } from 'framer-motion';
import { Ghost, Filter, Frown, Lock, Star, TrendingUp, ChevronRight } from 'lucide-react';

const painPoints = [
  {
    problem: 'Sponsors Ghost?',
    solution: 'Escrow-locked sponsorship.',
    detail: 'No commitment, no spot. Every sponsor pledge is locked in escrow until milestones are hit.',
    icon: Ghost,
    solutionIcon: Lock,
    color: 'from-orange-50 to-red-50',
    iconColor: 'text-[#FF6B4A]',
  },
  {
    problem: 'Low-Quality Attendees?',
    solution: 'Reputation scoring filters out noise.',
    detail: 'Our on-chain reputation system ensures only genuinely interested attendees register — no email farmers.',
    icon: Frown,
    solutionIcon: Star,
    color: 'from-navy-50 to-blue-50',
    iconColor: 'text-[#1A1A2E]',
  },
  {
    problem: 'Not Enough Funding?',
    solution: 'Community crowdfunding validates demand.',
    detail: "Prove demand before you spend. If funding goals aren't met, organizers get full control to refund or reschedule.",
    icon: Filter,
    solutionIcon: TrendingUp,
    color: 'from-orange-50 to-amber-50',
    iconColor: 'text-[#FF6B4A]',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

export default function ForOrganizersSection({ onAuthOpen }) {
  return (
    <section id="organizers-section" className="py-24 bg-white overflow-hidden" data-testid="organizers-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-[#FF6B4A] font-body uppercase tracking-widest mb-3 block">For Organizers</span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-[#1A1A2E] mb-4">
            Built for Organizers Who Are<br />
            <span className="text-[#FF6B4A]">Tired of Broken Promises</span>
          </h2>
          <p className="text-[#52525B] font-body text-base sm:text-lg max-w-2xl mx-auto">
            We rebuilt the event stack from the ground up with accountability at its core.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.problem}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -6, boxShadow: '0 24px 64px rgba(0,0,0,0.1)' }}
              className="rounded-3xl border border-gray-100 shadow-sm bg-white overflow-hidden transition-shadow"
              data-testid={`pain-point-${i}`}
            >
              {/* Top gradient */}
              <div className={`h-20 bg-gradient-to-br ${point.color} flex items-center px-6`}>
                <point.icon size={28} className={point.iconColor} />
                <div className="ml-3">
                  <p className="font-heading font-bold text-base text-[#1A1A2E] line-through opacity-60">{point.problem}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B4A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <point.solutionIcon size={16} className="text-[#FF6B4A]" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">{point.solution}</h3>
                </div>
                <p className="text-sm text-[#52525B] font-body leading-relaxed">{point.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA with pulse animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <motion.button
            animate={{ boxShadow: ['0 4px 20px rgba(255,107,74,0.25)', '0 8px 40px rgba(255,107,74,0.45)', '0 4px 20px rgba(255,107,74,0.25)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => onAuthOpen('register')}
            className="btn-coral flex items-center gap-2 px-10 py-4 text-base mx-auto"
            data-testid="start-organizing-btn"
          >
            Start Organizing <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
