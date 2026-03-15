import { useState } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Send, MessageCircle, Instagram, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const links = [
  { label: 'About', href: '#' },
  { label: 'For Organizers', href: '#organizers-section' },
  { label: 'For Sponsors', href: '#event-detail' },
  { label: 'Community', href: '#community-section' },
  { label: 'Blog', href: '#' },
];

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500/20 hover:text-sky-400' },
  { icon: Send, href: '#', label: 'Telegram', color: 'hover:bg-blue-500/20 hover:text-blue-400' },
  { icon: MessageCircle, href: '#', label: 'Discord', color: 'hover:bg-indigo-500/20 hover:text-indigo-400' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-500/20 hover:text-pink-400' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

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
    <footer className="bg-[#1A1A2E] text-white overflow-hidden" data-testid="footer">
      {/* Top CTA band */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
                Get early access to <span className="text-[#FF6B4A]">FomoFam</span>
              </h2>
              <p className="text-white/60 font-body text-base leading-relaxed">
                Join thousands of event organizers, sponsors, and attendees who are redefining what community events look like.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {status === 'success' ? (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
                  <CheckCircle size={22} className="text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-heading font-semibold text-green-400">You're on the list!</p>
                    <p className="text-sm text-white/60 font-body">We'll reach out when we launch in your city.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" data-testid="waitlist-form">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/40 font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                    data-testid="waitlist-email-input"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-coral flex items-center gap-2 px-7 py-4 text-sm whitespace-nowrap disabled:opacity-70"
                    data-testid="waitlist-submit-btn"
                  >
                    {status === 'loading' ? 'Joining...' : <><ArrowRight size={16} /> Get Access</>}
                  </button>
                </form>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-xs mt-2 font-body">Something went wrong. Try again.</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#FF8E75] flex items-center justify-center shadow-coral-sm">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">FomoFam</span>
            </div>
            <p className="text-white/50 font-body text-sm leading-relaxed max-w-xs mb-6">
              Discover. Fund. Attend. On-Chain. The future of community-powered events.
            </p>
            <div className="flex gap-3">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className={`w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/50 transition-all duration-200 ${s.color}`}
                  data-testid={`social-${s.label.toLowerCase()}`}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white/80 uppercase tracking-widest mb-5">Platform</h4>
            <ul className="space-y-3">
              {links.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#FF6B4A] transition-colors font-body"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + powered by */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white/80 uppercase tracking-widest mb-5">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/50 hover:text-white/80 transition-colors font-body">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs font-body">© 2025 FomoFam. All rights reserved.</p>
          <p className="text-white/30 text-xs font-body" data-testid="powered-by">Powered by <span className="text-white/50">Agastya Labs</span></p>
        </div>
      </div>
    </footer>
  );
}
