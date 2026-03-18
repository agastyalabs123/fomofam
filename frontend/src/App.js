import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthCallback from './pages/AuthCallback';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import CreatePage from './pages/CreatePage';
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
import RoleSelectionModal from './components/RoleSelectionModal';
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
  const [showRoleModal, setShowRoleModal] = useState(false);
  const location = useLocation();
  const { user, setUser } = useAuth();

  // Show role selection modal for new users who haven't selected roles
  useEffect(() => {
    if (user && !user.roles_selected && !user.roles?.length) {
      setShowRoleModal(true);
    }
  }, [user]);

  const openAuth = (tab = 'login') => { setAuthTab(tab); setShowAuth(true); };

  const handleRoleComplete = (updatedUser) => {
    setUser(updatedUser);
    setShowRoleModal(false);
  };

  // Handle Google Auth callback — REMINDER: DO NOT HARDCODE THE URL
  if (location.hash?.includes('session_id=')) return <AuthCallback />;

  return (
    <>
      <Routes>
        <Route path="/profile" element={<ProfilePage onAuthOpen={openAuth} />} />
        <Route path="/explore" element={<ExplorePage onAuthOpen={openAuth} />} />
        <Route path="/create" element={<CreatePage onAuthOpen={openAuth} />} />
        <Route path="*" element={<LandingPage onAuthOpen={openAuth} />} />
      </Routes>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
      <RoleSelectionModal 
        isOpen={showRoleModal} 
        onClose={() => setShowRoleModal(false)} 
        onComplete={handleRoleComplete}
        user={user}
      />
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
