import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const sessionId = params.get('session_id');

    if (!sessionId) {
      navigate('/');
      return;
    }

    const exchange = async () => {
      try {
        const res = await axios.post(
          `${API}/auth/google/callback`,
          { session_id: sessionId },
          { withCredentials: true }
        );
        setUser(res.data.user);
        navigate('/', { replace: true });
      } catch {
        navigate('/');
      }
    };
    exchange();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#1A1A2E] font-body">Signing you in...</p>
      </div>
    </div>
  );
}
