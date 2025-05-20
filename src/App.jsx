
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom'; // Changed imports
import { Toaster } from '@/components/ui/toaster';
import ContentCreationPage from '@/pages/ContentCreationPage'; 
import StoreOwnerDashboard from '@/pages/StoreOwnerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import StorePreview from '@/pages/StorePreview';
import ProductDetail from '@/pages/ProductDetail';
import CheckoutPage from '@/pages/CheckoutPage';
import AuthPage from '@/pages/AuthPage';
import PricingPage from '@/pages/PricingPage'; // Added PricingPage import
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'; 
import { StoreProvider } from '@/contexts/StoreContext';
import RealtimeChatbot from '@/components/store/RealtimeChatbot'; // Import the chatbot
// useAuth will be used by specific route elements if needed, not directly for layout rendering here unless for global loading state.
// For this refactor, App becomes a pure layout component. Auth logic moves to route elements.

const App = () => {
  // The loadingProfile check and initial redirects will be handled by route elements or loaders.
  // App component now focuses on being the root layout.
  return (
    <StoreProvider>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900">
        <Outlet /> {/* Child routes will render here */}
        <Toaster />
        <RealtimeChatbot /> {/* Add the chatbot to the global layout */}
      </main>
    </StoreProvider>
  );
};

export default App;
