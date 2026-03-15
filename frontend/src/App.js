import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthCallback from './pages/AuthCallback';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ExploreSection from './components/ExploreSection';
import CreateEventsSection from './components/CreateEventsSection';
import CommunitySection from './components/CommunitySection';
import ForOrganizersSection from './components/ForOrganizersSection';
import ReputationSection from './components/ReputationSection';
import EventTypesSection from './components/EventTypesSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import './App.css';

function LandingPage({ onAuthOpen }) {
  return (
    <>
      <Navbar onAuthOpen={onAuthOpen} />
      <HeroSection onAuthOpen={onAuthOpen} />
      <ExploreSection />
      <CreateEventsSection onAuthOpen={onAuthOpen} />
      <CommunitySection />
      <ForOrganizersSection onAuthOpen={onAuthOpen} />
      <ReputationSection />
      <EventTypesSection />
      <Footer />
    </>
  );
}

function AppRouter() {
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const location = useLocation();

  // Handle Google Auth callback — REMINDER: DO NOT HARDCODE THE URL
  if (location.hash?.includes('session_id=')) return <AuthCallback />;

  const openAuth = (tab = 'login') => { setAuthTab(tab); setShowAuth(true); };

  return (
    <>
      <Routes>
        <Route path="*" element={<LandingPage onAuthOpen={openAuth} />} />
      </Routes>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
