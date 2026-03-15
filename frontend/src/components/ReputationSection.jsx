import { motion } from 'framer-motion';
import { Star, Award, CheckCircle, Zap } from 'lucide-react';

const profiles = [
  {
    role: 'Attendee',
    name: 'Mia Park',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia',
    badge: 'Super Attendee',
    badgeColor: 'from-orange-400 to-red-400',
    stats: [
      { label: 'Events Attended', value: '12' },
      { label: 'Rating', value: '4.8' },
      { label: 'Cities Visited', value: '5' },
    ],
    tags: ['verified', 'top 5%', 'early backer'],
    icon: Star,
    description: '"Shows up, engages genuinely, leaves reviews. The kind of attendee organizers dream of."',
  },
  {
    role: 'Organizer',
    name: 'Jake Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jake',
    badge: 'Trusted Organizer',
    badgeColor: 'from-navy-500 to-navy-700',
    stats: [
      { label: 'Events Hosted', value: '8' },
      { label: 'Milestone Rate', value: '95%' },
      { label: 'Attendees Reached', value: '2.4K' },
    ],
    tags: ['trusted', '100% delivery', 'Web3 specialist'],
    icon: Award,
    description: '"Every event delivered on promises. Funds released on time, every time."',
  },
  {
    role: 'Sponsor',
    name: 'Alchemy DAO',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=alchemy',
    badge: 'Reliable Sponsor',
    badgeColor: 'from-green-400 to-teal-400',
    stats: [
      { label: 'Events Backed', value: '15' },
      { label: 'Payout Rate', value: '100%' },
      { label: 'Total Deployed', value: '$82K' },
    ],
    tags: ['reliable', 'zero disputes', 'global'],
    icon: CheckCircle,
    description: '"Commits when they say they will. Organizers love working with sponsors like this."',
  },
];

export default function ReputationSection() {
  return (
    <section id="reputation-section" className="py-24 bg-[#FAFAFA] overflow-hidden" data-testid="reputation-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-[#FF6B4A] font-body uppercase tracking-widest mb-3 block">Reputation System</span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-[#1A1A2E] mb-4">Your Event Reputation, On-Chain</h2>
          <p className="text-[#52525B] font-body text-base sm:text-lg max-w-2xl mx-auto">
            Every action builds your permanent, verifiable reputation as an attendee, organizer, or sponsor.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.role}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="tilt-card bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer"
              data-testid={`reputation-card-${profile.role.toLowerCase()}`}
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img src={profile.avatar} alt={profile.name} className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm bg-gray-50" />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${profile.badgeColor} flex items-center justify-center shadow-sm`}>
                      <profile.icon size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#52525B] font-body uppercase tracking-wide">{profile.role}</p>
                    <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">{profile.name}</h3>
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-gradient-to-r ${profile.badgeColor} text-white mt-1`}>
                      {profile.badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-b border-gray-100 mx-6 mb-4">
                {profile.stats.map(stat => (
                  <div key={stat.label} className="py-3 px-2 text-center">
                    <p className="font-heading font-bold text-lg text-[#1A1A2E]">{stat.value}</p>
                    <p className="text-xs text-[#A1A1AA] font-body leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {profile.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-50 border border-gray-100 text-[#52525B] px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Zap size={9} className="text-[#FF6B4A]" /> {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[#52525B] font-body italic leading-relaxed">{profile.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
