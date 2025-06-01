import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { stripePromise } from '../lib/stripe';
import { Button } from './ui/button';
import { Star } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Import Firebase Functions

// TODO: Ensure this Price ID is correctly configured for your "Pro" plan.
// This might come from an environment variable or a configuration file.
const PRO_PLAN_PRICE_ID = import.meta.env.VITE_STRIPE_PRO_PLAN_PRICE_ID || 'price_1RPDinDktew9heHOLkkL3ZDv'; // Fallback, ensure this is correct

const SubscribeButton = ({ onSubscribed, className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to subscribe.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions(); // Get Firebase Functions instance
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');

      const successUrl = `${window.location.origin}/dashboard?subscription_success=true`;
      const cancelUrl = `${window.location.origin}/pricing`;

      const payload = {
        priceId: PRO_PLAN_PRICE_ID, // Use the configured Price ID
        quantity: 1,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
      };

      console.log("Calling createStripeCheckoutSession with payload:", payload);
      const result = await createStripeCheckoutSession(payload);
      
      const { sessionId, error: functionError } = result.data;

      if (functionError) {
        console.error('Firebase function error:', functionError);
        throw new Error(functionError.message || 'Failed to create subscription session via Firebase function.');
      }

      if (!sessionId) {
        console.error('No sessionId returned from Firebase function');
        throw new Error('Failed to retrieve a session ID from the server.');
      }
      
      console.log("Received sessionId:", sessionId);
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        console.error('Stripe redirect error:', stripeError);
        setError(stripeError.message);
      } else if (onSubscribed) {
        onSubscribed();
      }
    } catch (err) {
      console.error('Subscription error:', err.message, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={handleSubscribe} 
        disabled={loading}
        className={`bg-gradient-to-r from-[#77B8B8] to-[#3B82F6] hover:from-[#6AB0B0] hover:to-[#2F73E0] text-white ${className}`} // Merged className
      >
        {loading ? 'Processing...' : 'Subscribe to Pro'}
      </Button>
      {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '0.8rem' }}>Error: {error}</p>} {/* Smaller error text */}
    </div>
  );
};

export default SubscribeButton;
