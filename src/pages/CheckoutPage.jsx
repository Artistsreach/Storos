import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import Header from '../components/Header';
import { functions } from '../lib/firebaseClient';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const { cart, currentStore } = useStore();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePurchase = async () => {
    if (!user) {
      setError("You must be logged in to purchase.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // For simplicity, we'll process the first item in the cart.
      // A real implementation would handle multiple items.
      const item = cart[0];
      if (!item) {
        throw new Error("Your cart is empty.");
      }

      const createProductCheckoutSession = httpsCallable(functions, 'createProductCheckoutSession');
      const result = await createProductCheckoutSession({
        productName: item.name,
        productDescription: item.description,
        productImage: item.imageUrl,
        amount: item.price * 100, // amount in cents
        currency: 'usd',
        storeOwnerId: currentStore.merchantId,
      });

      const data = result.data;
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session.');
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Order Summary</h2>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <p>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <p>Total</p>
              <p>${calculateTotal().toFixed(2)}</p>
            </div>
          </div>
          <div>
            <button 
              onClick={handlePurchase} 
              disabled={isLoading || cart.length === 0}
              className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-400"
            >
              {isLoading ? 'Processing...' : 'Purchase'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
