import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2 } from 'lucide-react'; // For loading spinner

const StripeConnectReturnPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [statusMessage, setStatusMessage] = useState('Processing your Stripe account connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) {
      // Wait for auth context to finish loading
      return;
    }

    if (!isAuthenticated || !user) {
      // Should not happen if route is protected, but good to check
      setError('User not authenticated. Please log in.');
      navigate('/auth'); // Redirect to login if not authenticated
      return;
    }

    const checkAccountStatus = async () => {
      try {
        const firebaseFunctions = getFunctions();
        const checkStripeStatus = httpsCallable(firebaseFunctions, 'checkStripeAccountStatusAndUpdateProfile');
        
        console.log('Calling checkStripeAccountStatusAndUpdateProfile...');
        const result = await checkStripeStatus();
        const data = result.data;

        if (data.success) {
          console.log('Stripe account status updated:', data);
          setStatusMessage('Stripe account connection successful! Redirecting to dashboard...');
          // The AuthContext should pick up profile changes automatically due to the onSnapshot listener.
          // Give a brief moment for UI to potentially update if needed, then redirect.
          setTimeout(() => {
            navigate('/dashboard'); 
          }, 2000);
        } else {
          throw new Error(data.error?.message || 'Failed to update Stripe account status.');
        }
      } catch (err) {
        console.error('Error checking Stripe account status:', err);
        setError(err.message || 'An unexpected error occurred while finalizing your Stripe connection.');
        setStatusMessage('Error finalizing Stripe connection.');
      }
    };

    checkAccountStatus();

  }, [user, isAuthenticated, navigate, loading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold text-destructive mb-4">Connection Error</h1>
            <p className="mb-2">{statusMessage}</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Finalizing Stripe Connection</h1>
            <p className="text-muted-foreground">{statusMessage}</p>
          </>
        )}
      </div>
    </div>
  );
};

// Basic Button component if not already globally available or imported from ui
// If you have a Button component in e.g. '@/components/ui/button', import that instead.
const Button = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors ${className}`}
  >
    {children}
  </button>
);


export default StripeConnectReturnPage;
