import { useState } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Send, MessageCircle, Instagram, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LINKS = [['About', '#'], ['For Organizers', '#organizers-section'], ['For Sponsors', '#create-events-section'], ['Community', '#community-section'], ['Blog', '#']];
const SOCIALS = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Send, href: '#', label: 'Telegram' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await axios.post(`${API}/waitlist`, { email });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/6" data-testid="footer">
      {/* Early access CTA */}
      <div className="border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mb-4">
                Get early access<br />to <span className="text-gradient">FomoFam</span>
              </h2>
              <p className="text-white/40 font-body text-base leading-relaxed">Join thousands redefining what community events look like.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              {status === 'success' ? (
                <div className="flex items-center gap-3 glass rounded-2xl p-5 border border-white/10">
                  <CheckCircle size={20} className="text-white/70 flex-shrink-0" />
                  <div>
                    <p className="font-display font-bold text-white">You're on the list!</p>
                    <p className="text-sm text-white/40 font-body">We'll reach out when we launch in your city.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" data-testid="waitlist-form">
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="Enter your email address"
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/25 font-body text-sm focus:outline-none focus:border-white/25 transition-colors"
                    data-testid="waitlist-email-input"
                  />
                  <button type="submit" disabled={status === 'loading'} className="btn-white flex items-center gap-2 px-7 py-4 text-sm whitespace-nowrap disabled:opacity-60" data-testid="waitlist-submit-btn">
                    {status === 'loading' ? 'Joining...' : <><ArrowRight size={15} /> Get Access</>}
                  </button>
                </form>
              )}
              {status === 'error' && <p className="text-red-400 text-xs mt-2 font-body">Something went wrong. Try again.</p>}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 glass-strong rounded-xl flex items-center justify-center border border-white/12">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl text-white">FomoFam</span>
            </div>
            <p className="text-white/35 font-body text-sm leading-relaxed max-w-xs mb-6">
              Discover. Fund. Attend. On-Chain. The future of community-powered events.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 glass rounded-xl border border-white/8 flex items-center justify-center text-white/35 hover:text-white hover:border-white/20 hover:bg-white/8 transition-all"
                  data-testid={`social-${s.label.toLowerCase()}`}>
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-xs text-white/35 uppercase tracking-[0.2em] mb-5">Platform</h4>
            <ul className="space-y-3">
              {LINKS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-sm text-white/35 hover:text-white transition-colors font-body" data-testid={`footer-link-${label.toLowerCase().replace(' ', '-')}`}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-xs text-white/35 uppercase tracking-[0.2em] mb-5">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <li key={item}><a href="#" className="text-sm text-white/35 hover:text-white transition-colors font-body">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-body">© 2026 FomoFam. All rights reserved.</p>
          <p className="text-white/20 text-xs font-body" data-testid="powered-by">
            Powered by <span className="text-white/35">Agastya Labs</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
