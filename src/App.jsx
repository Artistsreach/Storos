
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom'; // Changed imports
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from './components/ui/toaster';
import ContentCreationPage from './pages/ContentCreationPage'; 
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StorePreview from './pages/StorePreview';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import PricingPage from './pages/PricingPage'; // Added PricingPage import
import OrderConfirmationPage from './pages/OrderConfirmationPage'; 
import { StoreProvider } from './contexts/StoreContext';
import RealtimeChatbot from './components/store/RealtimeChatbot'; // Import the chatbot
import GenerationProgressDisplay from './components/GenerationProgressDisplay'; // Import the progress display
import OnboardingModal from './components/OnboardingModal';
import { useAuth } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import SearchPageChatbot from './components/store/SearchPageChatbot'; // Import SearchPageChatbot
import { useLocation } from 'react-router-dom'; // Import useLocation

const App = () => {
  const { user, profile, loadingRole } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    if (user && !loadingRole && profile && !profile.username) {
      setShowOnboarding(true);
    }
  }, [user, profile, loadingRole]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const location = useLocation();
  const isSearchPage = location.pathname === '/search';

  return (
    <StoreProvider>
      <ScrollToTop />
      {showOnboarding && <OnboardingModal onClose={handleOnboardingComplete} />}
      <GenerationProgressDisplay /> {/* Add the progress display here */}
      <main className="min-h-screen bg-white dark:bg-black">
        <Outlet /> {/* Child routes will render here */}
        <Toaster />
        <RealtimeChatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
        {isSearchPage && !isChatbotOpen && <SearchPageChatbot onOpen={() => setIsChatbotOpen(true)} />}
        <Analytics />
      </main>
    </StoreProvider>
  );
};

export default App;
