import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Megaphone, HandCoins, Check, Sparkles } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ROLES = [
  {
    id: 'attendee',
    label: 'Attendee',
    description: 'Discover and attend amazing events',
    icon: Users,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'organizer',
    label: 'Organizer',
    description: 'Create and manage community events',
    icon: Megaphone,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'sponsor',
    label: 'Sponsor',
    description: 'Support events and grow your brand',
    icon: HandCoins,
    color: 'from-amber-500 to-amber-600'
  }
];

export default function RoleSelectionModal({ isOpen, onClose, onComplete, user }) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (selectedRoles.length === 0) return;
    
    setSaving(true);
    try {
      const res = await axios.put(`${API}/user/roles`, { roles: selectedRoles }, { withCredentials: true });
      onComplete(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to save roles:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={onClose}
            data-testid="role-modal-backdrop"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            data-testid="role-modal"
          >
            <div className="glass-strong rounded-3xl border border-white/12 overflow-hidden shadow-glass-lg w-full max-w-lg pointer-events-auto">
              <div className="p-7 relative">
                <button 
                  onClick={onClose} 
                  className="absolute top-5 right-5 w-8 h-8 glass rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/8 hover:border-white/20 transition-all" 
                  data-testid="close-role-modal"
                >
                  <X size={14} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/12">
                    <Sparkles size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-white">Welcome, {user?.name?.split(' ')[0]}!</h2>
                  </div>
                </div>
                
                <p className="text-white/50 text-sm mb-6 mt-3">
                  What brings you to FomoFam? Select all that apply.
                </p>

                {/* Role Options */}
                <div className="space-y-3 mb-6">
                  {ROLES.map((role) => {
                    const isSelected = selectedRoles.includes(role.id);
                    const Icon = role.icon;
                    
                    return (
                      <motion.button
                        key={role.id}
                        onClick={() => toggleRole(role.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 ${
                          isSelected 
                            ? 'bg-white/10 border-white/25' 
                            : 'glass border-white/8 hover:border-white/15'
                        }`}
                        data-testid={`role-option-${role.id}`}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={22} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-semibold text-white text-sm">{role.label}</h3>
                          <p className="text-white/40 text-xs mt-0.5">{role.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-white border-white' 
                            : 'border-white/20'
                        }`}>
                          {isSelected && <Check size={14} className="text-black" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Selected count */}
                <p className="text-white/30 text-xs text-center mb-4">
                  {selectedRoles.length === 0 
                    ? 'Select at least one role to continue' 
                    : `${selectedRoles.length} role${selectedRoles.length > 1 ? 's' : ''} selected`}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 btn-glass py-3.5 text-sm"
                    data-testid="skip-roles-btn"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={selectedRoles.length === 0 || saving}
                    className="flex-1 btn-white py-3.5 text-sm disabled:opacity-50"
                    data-testid="save-roles-btn"
                  >
                    {saving ? 'Saving...' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
