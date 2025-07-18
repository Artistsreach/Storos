import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

// Helper to parse query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const OrderConfirmationPage = () => {
  const query = useQuery();
  const sessionId = query.get('session_id');
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found. Your order might still be processing.');
      setLoading(false);
      return;
    }

    // Client-side retrieval of session is optional and mainly for display.
    // Canonical fulfillment should rely on webhooks.
    // This requires your Stripe Publishable Key to be configured for session retrieval.
    // However, Stripe recommends against fetching session details client-side for sensitive info.
    // A better approach for details would be a backend endpoint that validates and returns them.
    // For now, we'll just show a generic success message.
    

    // For this example, we'll just assume success if sessionId is present
    // and rely on webhooks for actual order processing.
    setLoading(false);

  }, [sessionId]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading order details...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Order Status</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/">Go to Homepage</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Thank You for Your Order!</h1>
      <p>Your payment was successful and your order is being processed.</p>
      <p>Order (Session ID): {sessionId}</p>
      {/* 
        If you fetched checkoutSession details (e.g., from your backend):
        {checkoutSession && (
          <div>
            <p>Amount: {(checkoutSession.amount_total / 100).toFixed(2)} {checkoutSession.currency.toUpperCase()}</p>
            // Display other relevant details
          </div>
        )}
      */}
      <p>You will receive an email confirmation shortly.</p>
      <Link to="/">Continue Shopping</Link>
      {/* Or link to the specific store: <Link to={`/store/${storeIdFromSomewhere}`}>Back to Store</Link> */}
    </div>
  );
};

export default OrderConfirmationPage;
