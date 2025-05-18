import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Page Imports
import ContentCreationPage from '@/pages/ContentCreationPage';
import StoreOwnerDashboard from '@/pages/StoreOwnerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import StorePreview from '@/pages/StorePreview';
import ProductDetail from '@/pages/ProductDetail';
import CheckoutPage from '@/pages/CheckoutPage';
import AuthPage from '@/pages/AuthPage';
import PricingPage from '@/pages/PricingPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import StoreDashboardPage from '@/pages/StoreDashboardPage'; // Import the new dashboard page

// Helper component to handle initial loading and auth logic for the index route
const IndexPageHandler = () => {
  const { isAuthenticated, userRole, loadingProfile } = useAuth();

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return userRole === 'admin' ? <AdminDashboard /> : <StoreOwnerDashboard />;
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
  
  return !isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />;
};

// Define routes
const routes = [
  {
    element: (
      <AuthProvider>
        <App /> {/* App provides StoreProvider and <Outlet /> for child routes */}
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
        element: <AuthPageWrapper />,
      },
      {
        path: "pricing",
        element: <PricingPage />,
      },
      {
        path: "store/:storeId",
        element: <StorePreview />,
      },
      {
        path: "store/:storeId/product/:productId",
        element: <ProductDetail />,
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
        path: "store/:storeId/content-creation", // Changed path
        element: <ContentCreationPage />, // Will get storeId via useParams
      },
      {
        path: "store/:storeId/dashboard", // New route for the store dashboard
        element: <StoreDashboardPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
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
