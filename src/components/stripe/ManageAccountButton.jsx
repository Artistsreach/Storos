import React, { useState } from 'react';
import { functions } from '../../lib/firebaseClient';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../contexts/AuthContext';
import { ExternalLink } from 'lucide-react';

const ManageAccountButton = () => {
  const { profile } = useAuth(); // Assuming your context provides the user's profile data from Firestore
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Only show the button if the user has a connected and verified Stripe account
  if (!profile?.stripe_account_id || !profile?.stripe_charges_enabled) {
    return null;
  }

  const handleManageAccount = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const createLoginLink = httpsCallable(functions, 'createLoginLink');
      const result = await createLoginLink({ stripeAccountId: profile.stripe_account_id });
      const data = result.data;

      if (data && data.loginLinkUrl) {
        window.location.href = data.loginLinkUrl;
      } else {
        throw new Error('Failed to retrieve the Stripe dashboard link.');
      }
    } catch (err) {
      console.error("Stripe dashboard link error:", err);
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleManageAccount} disabled={isLoading} className="w-full flex items-center">
      <ExternalLink className="mr-2 h-4 w-4" />
      {isLoading ? 'Loading...' : 'Dashboard'}
      {error && <p className="text-xs text-destructive ml-2">{error}</p>}
    </button>
  );
};

export default ManageAccountButton;
