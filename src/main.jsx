import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import App from './App';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Page Imports
import ContentCreationPage from './pages/ContentCreationPage';
import AdminDashboard from './pages/AdminDashboard';
import StorePreview from './pages/StorePreview';
import ProductDetail from './pages/ProductDetail';
import PreorderProductDetail from './pages/PreorderProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import PricingPage from './pages/PricingPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import StoreDashboardPage from './pages/StoreDashboardPage'; // Import the new dashboard page
import DesignerPage from './pages/DesignerPage';
import MusicPage from './pages/MusicPage';
import PodcastPage from './pages/PodcastPage';
import VideoCreationPage from './pages/VideoCreationPage';
import OnboardingReturnPage from './app/onboarding-return/page';
import PageGenerator from './pages/PageGenerator';
import SavedPages from './pages/SavedPages';
import PublicPage from './pages/PublicPage';
import InfoPage from './pages/InfoPage';
import UserProfilePage from './pages/UserProfilePage';
import SocialFeedPage from './pages/SocialFeedPage';
import PostPage from './pages/PostPage';
import SlugPage from './pages/SlugPage';
import GeminiLive from './pages/GeminiLive';
import SearchPage from './pages/SearchPage';
import StyledProductDetailPage from './pages/StyledProductDetailPage';
import PlayPage from './app/play/page';
import FrontStPage from './pages/FrontStPage';
import HomePage from './pages/HomePage';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';

// The index route is now the public-facing store owner dashboard.
const IndexPageHandler = () => {
  const { isAuthenticated, loadingProfile } = useAuth();

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return !isAuthenticated ? <AuthPage /> : <Navigate to="/home" replace />;
};

// Helper component to handle auth logic for the AuthPage route
const AuthPageWrapper = () => {
  const { isAuthenticated, loadingProfile } = useAuth();

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }
  
  return !isAuthenticated ? <AuthPage /> : <Navigate to="/home" replace />;
};

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Define routes
const routes = [
  {
    element: (
      <AuthProvider>
        <WishlistProvider>
          <ThemeProvider>
            <Elements stripe={stripePromise}>
              <App /> {/* App provides StoreProvider and <Outlet /> for child routes */}
            </Elements>
          </ThemeProvider>
        </WishlistProvider>
      </AuthProvider>
    ),
    // ErrorElement can be added here for root-level errors
    children: [
      {
        index: true,
        element: <IndexPageHandler />,
      },
      {
        path: "auth",
        element: <AuthPage />,
      },
      {
        path: "pricing",
        element: <PricingPage />,
      },
      {
        path: "designer",
        element: <DesignerPage />,
      },
      {
        path: "music",
        element: <MusicPage />,
      },
      {
        path: "podcast",
        element: <PodcastPage />,
      },
      {
        path: "video",
        element: <VideoCreationPage />,
      },
      {
        path: "page-generator",
        element: <PageGenerator />,
      },
      {
        path: "saved-pages",
        element: <SavedPages />,
      },
      {
        path: "page/:slug",
        element: <PublicPage />,
      },
      {
        path: "info",
        element: <InfoPage />,
      },
      {
        path: "onboarding-return",
        element: <OnboardingReturnPage />,
      },
      {
        path: ":storeName/product/:productId",
        element: <ProductDetail />,
      },
      {
        path: ":storeName/fund/product/:productId",
        element: <PreorderProductDetail />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "order-confirmation",
        element: <OrderConfirmationPage />,
      },
      {
        path: ":storeName/content-creation", // Changed path
        element: <ContentCreationPage />, // Will get storeName via useParams
      },
      {
        path: ":storeName/dashboard", // New route for the store dashboard
        element: <StoreDashboardPage />,
      },
      {
        path: "feed",
        element: <SocialFeedPage />,
      },
      {
        path: "post/:postId",
        element: <PostPage />,
      },
      {
        path: "/gemini-live",
        element: <GeminiLive />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/product-detail",
        element: <StyledProductDetailPage />,
      },
      {
        path: "/play",
        element: <PlayPage />,
      },
      {
        path: "/frontst",
        element: <FrontStPage />,
      },
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/store",
        element: <StoreOwnerDashboard />,
      },
      {
        path: "/gen",
        element: <StoreOwnerDashboard />,
      },
      {
        path: "/:slug",
        element: <SlugPage />,
      },
      {
        path: "*",
        element: <Navigate to="/home" replace />,
      },
    ],
  },
];

// Create router with future flags
const enableStartTransition = true;
const enableRelativeSplatPath = true;
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: enableStartTransition,
    v7_relativeSplatPath: enableRelativeSplatPath,
  },
});

const rootElement = document.getElementById('root');
// Ensure root is created only once, store it on the element to survive HMR
if (!rootElement._reactRoot) {
  rootElement._reactRoot = ReactDOM.createRoot(rootElement);
}
const root = rootElement._reactRoot;

try {
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application initialization failed:", error);
  let message = "Application failed to load. Please check the console for details.";
  if (error.message.includes("VITE_") && error.message.includes("is not set")) {
    message = `Configuration Error: ${error.message}. Please ensure all required environment variables are correctly set in your .env file and the application is rebuilt if necessary.`;
  }
  // Fallback rendering for critical errors
  root.render(
    <React.StrictMode>
      <div style={{ padding: '20px', textAlign: 'center', color: 'red', fontFamily: 'sans-serif' }}>
        <h1>Application Load Error</h1>
        <p>{message}</p>
        <p>Please check your <code>.env</code> file and ensure all necessary environment variables are configured.</p>
      </div>
    </React.StrictMode>
  );
}
