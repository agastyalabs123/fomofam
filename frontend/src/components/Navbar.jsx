import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onAuthOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-card shadow-glass py-3' : 'bg-transparent py-5'
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 group" data-testid="navbar-logo">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#FF8E75] flex items-center justify-center shadow-coral-sm group-hover:scale-110 transition-transform">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="font-heading font-bold text-lg text-[#1A1A2E] tracking-tight">FomoFam</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[['map-section','Discover'],['how-it-works','How it Works'],['community-section','Community'],['organizers-section','For Organizers']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-sm font-medium text-[#52525B] hover:text-[#FF6B4A] transition-colors" data-testid={`nav-${id}`}>
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#52525B] font-medium">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={logout} className="btn-outline text-sm py-2 px-5" data-testid="logout-btn">Log out</button>
            </div>
          ) : (
            <>
              <button onClick={() => onAuthOpen('login')} className="btn-outline text-sm py-2 px-5" data-testid="signin-btn">Sign In</button>
              <button onClick={() => onAuthOpen('register')} className="btn-coral text-sm py-2 px-5" data-testid="get-started-nav-btn">Get Started</button>
            </>
          )}
        </div>

        {/* Mobile menu btn */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100" data-testid="mobile-menu-btn">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-white/20 px-4 py-4 space-y-3"
            data-testid="mobile-menu"
          >
            {[['map-section','Discover'],['how-it-works','How it Works'],['community-section','Community']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left py-2 text-[#52525B] hover:text-[#FF6B4A] font-medium">{label}</button>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { onAuthOpen('login'); setMenuOpen(false); }} className="flex-1 btn-outline text-sm py-2" data-testid="mobile-signin-btn">Sign In</button>
              <button onClick={() => { onAuthOpen('register'); setMenuOpen(false); }} className="flex-1 btn-coral text-sm py-2" data-testid="mobile-register-btn">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
