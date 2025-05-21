
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogIn, LogOut, Settings, Sun, Moon, Briefcase, ExternalLink, ChevronDown } from 'lucide-react'; // Adjusted icons
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import SubscribeButton from '@/components/SubscribeButton';

const Header = () => {
  const { isAuthenticated, user, session, subscriptionStatus, loadingProfile, profile } = useAuth(); // Added profile
  const navigate = useNavigate();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const [isStripeActionLoading, setIsStripeActionLoading] = useState(false); // For Connect actions
  const [stripeActionError, setStripeActionError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isSubscribed = subscriptionStatus === 'active';
  const isStripeConnected = profile?.stripe_account_id && profile?.stripe_account_details_submitted;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/auth'); // Redirect to auth page after logout
    }
  };

  const handleManageBilling = async () => {
    if (!session?.access_token) {
      setPortalError('Authentication token not found. Please log in again.');
      // Or redirect to login, or show a toast
      return;
    }
    setIsPortalLoading(true);
      setPortalError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create portal session.');
        }
        window.location.href = data.url; // Redirect to Stripe Customer Portal
      } catch (err) {
        console.error('Portal session error:', err);
        setPortalError(err.message);
      } finally {
        setIsPortalLoading(false);
      }
    };

  const handleCreateStripeConnectAccount = async () => {
    if (!session?.access_token || !user) {
      setStripeActionError("Authentication required.");
      return;
    }
    setIsStripeActionLoading(true);
    setStripeActionError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-connect-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ record: { id: user.id, email: user.email } }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const errorDetail = data.error || (data.data && data.data.error) || "Failed to create Stripe Connect account link.";
        throw new Error(errorDetail);
      }
      if (data.account_link_url) {
        window.location.href = data.account_link_url;
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from Stripe Connect account creation.");
      }
    } catch (err) {
      console.error("Stripe Connect account creation error:", err);
      setStripeActionError(err.message);
    } finally {
      setIsStripeActionLoading(false);
    }
  };

  const handleManageStripeAccount = async () => {
    if (!session?.access_token || !user || !profile?.stripe_account_id) {
      setStripeActionError("Stripe account not connected or user not authenticated.");
      return;
    }
    setIsStripeActionLoading(true);
    setStripeActionError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-login-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`, // Important for user identification if your function uses JWT
          },
          body: JSON.stringify({ user_id: user.id }), // Send user_id as expected by the function
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create Stripe login link.");
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No login link URL returned.");
      }
    } catch (err) {
      console.error("Stripe login link error:", err);
      setStripeActionError(err.message);
    } finally {
      setIsStripeActionLoading(false);
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      {!loadingProfile && !isStripeConnected && (
        <div className="bg-red-600 text-white py-2 px-4 text-center text-sm">
          <button onClick={handleCreateStripeConnectAccount} disabled={isStripeActionLoading} className="hover:underline focus:outline-none">
            {isStripeActionLoading ? 'Processing...' : "Create A Business to Activate Checkout"}
          </button>
          {stripeActionError && <p className="text-xs text-yellow-300 mt-1">{stripeActionError}</p>}
        </div>
      )}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full py-4 px-6 flex justify-between items-center sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b"
      >
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={isDarkMode 
              ? "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images/ffwhite.png" 
              : "https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images/FreshFrontLogo.png"} 
            alt="FreshFront Logo" 
            className="h-[60px] w-auto" // Ensure these images are publicly accessible in your Supabase bucket.
          />
        <span className="font-bold text-xl">FreshFront</span>
      </Link>
      
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <>
            {/* Generic Content Creation link removed, will be added to specific store pages */}
          </>
        )}

        {/* "AI-Powered" button removed */}

        {portalError && <p className="text-xs text-red-500">{portalError}</p> /* Display portal error if any */}

        {isAuthenticated && !loadingProfile && (
          <>
            <SubscribeButton 
              className="px-3 py-1.5 rounded-full text-sm font-medium" 
              showIcon={true} 
            />
            {isSubscribed && (
              <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={isPortalLoading} className="rounded-full px-3 py-1.5 text-sm font-medium ml-2">
                <Settings className="mr-2 h-4 w-4" /> {isPortalLoading ? 'Loading...' : 'Manage Billing'}
              </Button>
            )}

            {/* Stripe Connect Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full px-3 py-1.5 text-sm font-medium ml-2">
                  <Briefcase className="mr-2 h-4 w-4" /> Business <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Stripe Connect</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isStripeConnected ? (
                  <DropdownMenuItem onClick={handleCreateStripeConnectAccount} disabled={isStripeActionLoading}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {isStripeActionLoading ? 'Processing...' : 'Create Business Account'}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleManageStripeAccount} disabled={isStripeActionLoading}>
                    <Settings className="mr-2 h-4 w-4" />
                    {isStripeActionLoading ? 'Processing...' : 'Manage Business Account'}
                  </DropdownMenuItem>
                )}
                {stripeActionError && <DropdownMenuItem disabled><p className="text-xs text-red-500">{stripeActionError}</p></DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        <div className="flex items-center gap-2">
          <Switch
            id="theme-switcher"
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
          {isDarkMode ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
        </div>

        {isAuthenticated ? (
          <>
            {user?.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="User avatar" 
                className="h-6 w-6 rounded-full" 
              />
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </Link>
        )}
      </div>
    </motion.header>
    </>
  );
};

export default Header;
