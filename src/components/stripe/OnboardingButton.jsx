import React, { useState } from 'react';
import { functions } from '../../lib/firebaseClient'; // Your initialized Firebase client
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../contexts/AuthContext'; // Your auth context
import { ExternalLink } from 'lucide-react';

const OnboardingButton = () => {
  const { user } = useAuth(); // Assuming your auth context provides the user object
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateConnectAccount = async () => {
    if (!user) {
      setError("You must be logged in to create a business account.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Get a reference to the cloud function
      const createConnectAccount = httpsCallable(functions, 'createConnectAccount');
      
      // Call the function with the user's email
      const result = await createConnectAccount({ email: user.email });
      const data = result.data;

      // Redirect the user to the Stripe onboarding URL
      if (data && data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl;
      } else {
        throw new Error('Failed to retrieve the Stripe onboarding URL.');
      }
    } catch (err) {
      console.error("Stripe Connect onboarding error:", err);
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
    // No need to set isLoading to false on success, as the page will redirect.
  };

  return (
    <button onClick={handleCreateConnectAccount} disabled={isLoading} className="w-full flex items-center">
      <ExternalLink className="mr-2 h-4 w-4" />
      {isLoading ? 'Processing...' : 'Create Business Account'}
      {error && <p className="text-xs text-destructive ml-2">{error}</p>}
    </button>
  );
};

export default OnboardingButton;
