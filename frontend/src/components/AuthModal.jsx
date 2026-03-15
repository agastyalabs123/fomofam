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

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload = tab === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };
      const res = await axios.post(`${API}${endpoint}`, payload, { withCredentials: true });
      setUser(res.data.user);
      onClose();
      setForm({ email: '', password: '', name: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
            data-testid="auth-modal-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            data-testid="auth-modal"
          >
            <div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 overflow-hidden mx-4">
              {/* Header */}
              <div className="relative p-7 pb-0">
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#52525B] hover:bg-gray-200 transition-colors"
                  data-testid="close-auth-modal"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#FF8E75] flex items-center justify-center">
                    <Zap size={15} className="text-white" fill="white" />
                  </div>
                  <span className="font-heading font-bold text-lg text-[#1A1A2E]">FomoFam</span>
                </div>
                <h2 className="font-heading font-bold text-2xl text-[#1A1A2E] mb-1">
                  {tab === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-[#52525B] font-body mb-5">
                  {tab === 'login' ? 'Sign in to access your events and communities.' : 'Join thousands of event lovers on FomoFam.'}
                </p>

                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                  <button
                    onClick={() => { setTab('login'); setError(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'login' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#52525B]'}`}
                    data-testid="auth-tab-login"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setTab('register'); setError(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'register' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#52525B]'}`}
                    data-testid="auth-tab-register"
                  >
                    Get Started
                  </button>
                </div>
              </div>

              <div className="px-7 pb-7">
                {/* Google OAuth */}
                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-[#1A1A2E] hover:bg-gray-50 transition-colors mb-5"
                  data-testid="google-auth-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
                    <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
                    <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
                    <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-[#A1A1AA] font-body">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3" data-testid="auth-form">
                  {tab === 'register' && (
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                      <input
                        name="name"
                        type="text"
                        placeholder="Full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm font-body text-[#1A1A2E] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/10 transition-all"
                        data-testid="register-name-input"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm font-body text-[#1A1A2E] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/10 transition-all"
                      data-testid="auth-email-input"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                    <input
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-2xl text-sm font-body text-[#1A1A2E] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/10 transition-all"
                      data-testid="auth-password-input"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#52525B]" data-testid="toggle-password-btn">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600 font-body" data-testid="auth-error">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-coral py-4 text-sm mt-2 disabled:opacity-70"
                    data-testid="auth-submit-btn"
                  >
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
