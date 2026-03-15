import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FileText, Coins, Star } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: FileText,
    title: 'Propose',
    description: 'Organizers submit event proposals with budget breakdowns, milestones, and clear goals. Transparency from day one.',
    color: 'from-[#FF6B4A] to-[#FF8E75]',
  },
  {
    num: '02',
    icon: Coins,
    title: 'Fund',
    description: 'Community members and sponsors back events they believe in. All funds are locked in escrow until milestones are verified.',
    color: 'from-[#1A1A2E] to-[#2A2A4E]',
  },
  {
    num: '03',
    icon: Star,
    title: 'Attend',
    description: 'Verified attendees build on-chain reputation. Every event you attend, fund, or organize adds to your permanent track record.',
    color: 'from-[#FF6B4A] to-[#FF8E75]',
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden" data-testid="how-it-works-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-[#FF6B4A] font-body uppercase tracking-widest mb-3 block">How It Works</span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-[#1A1A2E] mb-4">Three steps to a better event</h2>
          <p className="text-[#52525B] font-body text-base sm:text-lg max-w-2xl mx-auto">
            No more broken promises. No more ghost sponsors. Just clear milestones, locked funds, and real accountability.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting dotted line (desktop) */}
          <div className="hidden lg:block absolute top-20 left-[16.66%] right-[16.66%] dotted-path" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                variants={stepVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="relative text-center lg:text-left"
                data-testid={`step-${i + 1}`}
              >
                {/* Icon circle */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-coral-sm`}
                >
                  <step.icon size={28} className="text-white" />
                </motion.div>

                {/* Step number */}
                <span className="font-heading font-bold text-5xl text-gray-100 absolute -top-4 right-0 lg:right-auto lg:left-16 select-none">{step.num}</span>

                <h3 className="font-heading font-bold text-2xl text-[#1A1A2E] mb-3">{step.title}</h3>
                <p className="text-[#52525B] font-body text-base leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <button
            onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-coral px-10 py-4 text-base"
            data-testid="how-it-works-cta"
          >
            See Events Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}
