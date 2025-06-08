
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, CreditCard, Lock, ShoppingBag, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { motion } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

// Ensure your Stripe publishable key is in .env.local or configured securely
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); 

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getStoreById } = useStore(); // Removed clearCart as Stripe handles post-payment
  const { toast } = useToast();
  const functions = getFunctions();

  const [productDetails, setProductDetails] = useState(null);
  const [storeName, setStoreName] = useState('Your');
  const [storeId, setStoreId] = useState(null);
  const [store, setStore] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');


  useEffect(() => {
    // Data passed from ProductDetail.jsx after Stripe Product/Price creation
    const { 
      stripePriceId, 
      productName: name, 
      productImage: image, 
      quantity: qty, 
      unitAmount, // Amount in cents
      currency,
      storeId: currentStoreId,
      storeName: currentStoreName,
    } = location.state || {};

    if (stripePriceId && name && image && qty && unitAmount && currency && currentStoreId && currentStoreName) {
      setProductDetails({
        stripePriceId,
        name,
        image,
        quantity: parseInt(qty, 10),
        unitAmount: parseInt(unitAmount, 10), // Ensure it's an integer (cents)
        currency: currency.toLowerCase(),
      });
      setStoreId(currentStoreId);
      setStoreName(currentStoreName);
      const currentStoreData = getStoreById(currentStoreId);
      setStore(currentStoreData);
    } else {
      toast({ title: "Checkout Error", description: "Missing product information for checkout. Redirecting...", variant: "destructive" });
      navigate('/');
    }
  }, [location.state, navigate, toast, getStoreById]);

  const subtotal = productDetails ? (productDetails.unitAmount / 100) * productDetails.quantity : 0;
  // Shipping and taxes can be configured in Stripe Checkout Session or calculated here if needed
  const shipping = subtotal > 0 ? 5.00 : 0; // Example, can be dynamic
  const taxes = subtotal * 0.08; // Example, can be dynamic
  const total = subtotal + shipping + taxes;


  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!productDetails || !customerEmail.trim()) {
      toast({ title: "Missing Information", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    try {
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      const result = await createStripeCheckoutSession({
        priceId: productDetails.stripePriceId,
        quantity: productDetails.quantity,
        customerEmail: customerEmail,
        successUrl: `${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&storeId=${storeId}`,
        cancelUrl: `${window.location.origin}/checkout?storeId=${storeId}&canceled=true`, // Or back to product page
      });

      const { sessionId, error: functionError } = result.data;

      if (functionError) {
        throw new Error(functionError.message || 'Failed to create checkout session.');
      }

      if (!sessionId) {
        throw new Error('Checkout session ID not received.');
      }

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        console.error("Stripe redirect error:", stripeError);
        toast({ title: "Payment Error", description: stripeError.message, variant: "destructive" });
        setIsProcessing(false);
      }
      // If redirectToCheckout is successful, the user is redirected to Stripe.
      // They will be redirected to successUrl or cancelUrl from there.
      // No need to setIsProcessing(false) here if redirect occurs.

    } catch (error) {
      console.error("Error creating Stripe Checkout session:", error);
      toast({ title: "Checkout Failed", description: error.message || "Could not initiate payment.", variant: "destructive" });
      setIsProcessing(false);
    }
  };

  if (!productDetails && !isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900">
        <ShoppingBag className="h-24 w-24 text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">There's nothing to check out yet.</p>
        <Button asChild>
          <Link to={storeId ? `/preview/${storeId}` : '/'}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-slate-800 py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y:20 }}
        animate={{ opacity: 1, y:0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-4xl"
      >
        <Button variant="ghost" onClick={() => navigate(storeId ? `/preview/${storeId}` : '/')} className="mb-6 text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {storeName}
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 h-fit sticky top-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
              <CardDescription>Review your item from {storeName}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {productDetails && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <img 
                      src={productDetails.image?.src?.tiny || productDetails.image?.medium || productDetails.image?.large || `https://via.placeholder.com/40x40.png?text=${productDetails.name?.substring(0,1)}`} 
                      alt={productDetails.name} 
                      className="w-10 h-10 rounded object-cover" 
                    />
                    <div>
                      <p className="font-medium line-clamp-1">{productDetails.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {productDetails.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${((productDetails.unitAmount / 100) * productDetails.quantity).toFixed(2)}</p>
                </div>
              )}
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span>${shipping.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Taxes (est.):</span><span>${taxes.toFixed(2)}</span></div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmitOrder} className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={customerEmail} 
                    onChange={(e) => setCustomerEmail(e.target.value)} 
                    required 
                  />
                </div>
                {/* Stripe Checkout will collect shipping and payment details */}
              </CardContent>
            </Card>
            
            <Button type="submit" size="lg" className="w-full text-lg" disabled={isProcessing || !customerEmail.trim()} style={{backgroundColor: store?.theme?.primaryColor || '#3B82F6'}}>
              {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-5 w-5" />
              )}
              {isProcessing ? 'Processing Payment...' : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
