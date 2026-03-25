import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onAuthOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in
  const isLoggedIn = !!user;

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const goHome = () => {
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <button onClick={goHome} className="flex items-center gap-2.5 group" data-testid="navbar-logo">
          <div className="w-8 h-8 rounded-xl glass-strong flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">FomoFam</span>
        </button>

        {/* Desktop links - Only visible for logged-in users */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-7">
            <button 
              onClick={() => navigate('/explore')}
              className={`text-sm font-medium transition-colors tracking-wide ${location.pathname === '/explore' ? 'text-white' : 'text-white/50 hover:text-white'}`}
              data-testid="nav-explore"
            >
              Explore
            </button>
            <button 
              onClick={() => navigate('/create')}
              className={`text-sm font-medium transition-colors tracking-wide ${location.pathname === '/create' ? 'text-white' : 'text-white/50 hover:text-white'}`}
              data-testid="nav-create"
            >
              Create
            </button>
            {/* Community - Disabled with Coming Soon badge */}
            <div className="relative">
              <button 
                disabled
                className="text-sm font-medium text-white/25 cursor-not-allowed tracking-wide"
                data-testid="nav-community"
              >
                Community
              </button>
              <span className="absolute -top-2 -right-14 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                COMING SOON
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/40 overflow-hidden transition-all hover:scale-105"
                data-testid="profile-btn"
              >
                <img
                  src={user.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </button>
              <button onClick={logout} className="btn-glass text-sm py-2 px-5" data-testid="logout-btn">Log out</button>
            </div>
          ) : (
            <>
              <button onClick={() => onAuthOpen('login')} className="btn-glass text-sm py-2.5 px-5" data-testid="signin-btn">Sign In</button>
              <button onClick={() => onAuthOpen('register')} className="btn-white text-sm py-2.5 px-5" data-testid="get-started-nav-btn">Get Started</button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 glass rounded-xl" data-testid="mobile-menu-btn">
          {menuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-nav border-t border-white/5 px-4 py-4 space-y-3"
            data-testid="mobile-menu"
          >
            {/* Nav links - Only for logged-in users */}
            {isLoggedIn && (
              <>
                <button 
                  onClick={() => { navigate('/explore'); setMenuOpen(false); }} 
                  className="block w-full text-left py-2 text-white/60 hover:text-white text-sm font-medium"
                >
                  Explore
                </button>
                <button 
                  onClick={() => { navigate('/create'); setMenuOpen(false); }} 
                  className="block w-full text-left py-2 text-white/60 hover:text-white text-sm font-medium"
                >
                  Create
                </button>
                {/* Community - Disabled with Coming Soon badge */}
                <div className="relative inline-block py-2">
                  <span className="text-white/25 text-sm font-medium cursor-not-allowed">Community</span>
                  <span className="ml-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                    COMING SOON
                  </span>
                </div>
              </>
            )}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <button 
                    onClick={() => { navigate('/profile'); setMenuOpen(false); }} 
                    className="flex-1 btn-glass text-sm py-2.5 flex items-center justify-center gap-2" 
                    data-testid="mobile-profile-btn"
                  >
                    <img
                      src={user.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                      alt={user.name}
                      className="w-5 h-5 rounded-full"
                    />
                    Profile
                  </button>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="flex-1 btn-white text-sm py-2.5" data-testid="mobile-logout-btn">Log out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { onAuthOpen('login'); setMenuOpen(false); }} className="flex-1 btn-glass text-sm py-2.5" data-testid="mobile-signin-btn">Sign In</button>
                  <button onClick={() => { onAuthOpen('register'); setMenuOpen(false); }} className="flex-1 btn-white text-sm py-2.5" data-testid="mobile-register-btn">Get Started</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
