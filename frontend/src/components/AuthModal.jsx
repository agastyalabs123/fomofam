import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();

  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload = tab === 'login' ? { email: form.email, password: form.password } : { email: form.email, password: form.password, name: form.name };
      const res = await axios.post(`${API}${endpoint}`, payload, { withCredentials: true });
      setUser(res.data.user);
      onClose();
      setForm({ email: '', password: '', name: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false); }
  };

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/25 font-body text-sm focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose} data-testid="auth-modal-backdrop" />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            data-testid="auth-modal"
          >
            <div className="glass-strong rounded-3xl border border-white/12 overflow-hidden shadow-glass-lg w-full max-w-md pointer-events-auto">
              <div className="p-7 pb-0 relative">
                <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 glass rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/8 hover:border-white/20 transition-all" data-testid="close-auth-modal">
                  <X size={14} />
                </button>
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="w-8 h-8 glass rounded-xl flex items-center justify-center border border-white/12">
                    <Zap size={14} className="text-white" fill="white" />
                  </div>
                  <span className="font-display font-bold text-base text-white">FomoFam</span>
                </div>
                <h2 className="font-display font-black text-2xl text-white tracking-tight mb-1">
                  {tab === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-white/35 font-body mb-6">
                  {tab === 'login' ? 'Sign in to your events and communities.' : 'Join thousands of event lovers.'}
                </p>
                {/* Tabs */}
                <div className="flex glass rounded-2xl p-1 mb-7 border border-white/8">
                  {['login', 'register'].map(t => (
                    <button key={t} onClick={() => { setTab(t); setError(''); }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${tab === t ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'}`}
                      data-testid={`auth-tab-${t}`}>{t === 'login' ? 'Sign In' : 'Get Started'}</button>
                  ))}
                </div>
              </div>

              <div className="px-7 pb-7">
                {/* Google */}
                <button onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3.5 glass border border-white/10 rounded-2xl text-sm font-display font-semibold text-white/70 hover:text-white hover:border-white/20 hover:bg-white/8 transition-all mb-5"
                  data-testid="google-auth-btn">
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                    <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
                    <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
                    <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
                    <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414-0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-xs text-white/25 font-body">or</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3" data-testid="auth-form">
                  {tab === 'register' && (
                    <div className="relative">
                      <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                      <input name="name" type="text" placeholder="Full name" value={form.name} onChange={handleChange} required className={`${inputClass} pl-10`} data-testid="register-name-input" />
                    </div>
                  )}
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required className={`${inputClass} pl-10`} data-testid="auth-email-input" />
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input name="password" type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} className={`${inputClass} pl-10 pr-11`} data-testid="auth-password-input" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50" data-testid="toggle-password-btn">
                      {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>

                  {error && (
                    <div className="glass border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-body" data-testid="auth-error">{error}</div>
                  )}

                  <button type="submit" disabled={loading} className="w-full btn-white py-4 text-sm mt-1 disabled:opacity-60" data-testid="auth-submit-btn">
                    {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
