
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogIn, LogOut, Settings, Sun, Moon, Briefcase, ExternalLink, ChevronDown, Menu, X, MousePointer2, Coins } from 'lucide-react'; // Added Menu, X
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"; // Import Dropdown components
import { useAuth } from '../contexts/AuthContext';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { functions } from '../lib/firebaseClient'; // Import Firebase functions instance
import { httpsCallable } from 'firebase/functions'; // Import httpsCallable
import OnboardingButton from './stripe/OnboardingButton';
import ManageAccountButton from './stripe/ManageAccountButton';
import CreditCostsModal from './CreditCostsModal';
// import { supabase } from '../lib/supabaseClient'; // Removed Supabase import

const Header = () => {
  const { isAuthenticated, user, logout, session, subscriptionStatus, loadingProfile, profile } = useAuth(); // Changed signOut: firebaseSignOut to logout
  const navigate = useNavigate();
  const [isPortalLoading, setIsPortalLoading] = useState(false); // Uncommented Stripe related state
  const [portalError, setPortalError] = useState(null); // Uncommented Stripe related state
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [credits, setCredits] = useState(0);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const isSubscribed = subscriptionStatus === 'active'; // Restored Stripe related state
  const isStripeConnected = profile?.stripe_account_id && profile?.stripe_account_details_submitted; // Restored Stripe related state


  useEffect(() => {
    if (isAuthenticated && user) {
      const creditsRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(creditsRef, (doc) => {
        if (doc.exists()) {
          setCredits(doc.data().credits);
        } else {
          setCredits(0);
        }
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated, user]);

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
    try {
      await logout(); // Call the logout function from context
      navigate('/auth'); // Redirect to auth page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleManageBilling = async () => {
    if (!user) {
      setPortalError('Authentication required. Please log in again.');
      return;
    }
    setIsPortalLoading(true);
    setPortalError(null);
    try {
      const createPortalSession = httpsCallable(functions, 'stripeCreatePortalSession');
      // const idToken = await user.getIdToken(); // ID token can be implicitly handled by callable functions if rules allow
      const result = await createPortalSession();
      const data = result.data;
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create portal session URL.');
      }
    } catch (err) {
      console.error('Portal session error:', err);
      setPortalError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleCreateStripeConnectAccount = async () => {
    if (!user) {
      setPortalError("Authentication required.");
      return;
    }
    setIsConnectLoading(true);
    try {
      const createConnectAccount = httpsCallable(functions, 'createConnectAccount');
      const result = await createConnectAccount({ email: user.email });
      const data = result.data;

      if (data && data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl;
      } else {
        throw new Error('Failed to retrieve the Stripe onboarding URL.');
      }
    } catch (err) {
      console.error("Stripe Connect onboarding error:", err);
      setPortalError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsConnectLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      setPortalError("Authentication required.");
      return;
    }
    setIsSubscriptionLoading(true);
    try {
      const createSubscriptionCheckout = httpsCallable(functions, 'createSubscriptionCheckout');
      const result = await createSubscriptionCheckout({ priceId: 'price_1RPDinDktew9heHOLkkL3ZDv' });
      const data = result.data;

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to retrieve the Stripe checkout URL.');
      }
    } catch (err) {
      console.error("Stripe subscription error:", err);
      setPortalError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  return (
    <>
      {/* Announcement Bar - Functionality Removed */}
      {!loadingProfile && isAuthenticated && !(profile?.stripe_account_id && profile?.stripe_account_details_submitted) && ( // Added isAuthenticated check for announcement bar
        <div className="bg-foreground text-background py-2 px-4 text-center text-sm dark:bg-blue-700 dark:text-white">
          <button onClick={handleCreateStripeConnectAccount} disabled={isConnectLoading} className="relative hover:underline focus:outline-none">
            {isConnectLoading ? 'Processing...' : 'Create Your Business'}
            <MousePointer2 className="absolute bottom-[-10px] right-[-13px] h-4 w-4 text-white" />
          </button>
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
              ? "https://static.wixstatic.com/media/bd2e29_20f2a8a94b7e492a9d76e0b8b14e623b~mv2.png"
              : "https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png"}
            alt="FreshFront Logo"
            className="h-10 sm:h-[60px] w-auto transition-all"
          />
        <span className="font-bold text-lg sm:text-xl transition-all">FreshFront</span>
      </Link>
      
      {/* Desktop Navigation Items */}
      <nav className="hidden md:flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Create <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/store-generator" className="font-bold">Store</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/template-generator">Template</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/designer">Design</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://www.musicmigo.com" target="_blank" rel="noopener noreferrer">Music</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/podcast">Podcast</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/video">Video</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {!isSubscribed && (
          <Button onClick={handleSubscribe} disabled={isSubscriptionLoading}>
            {isSubscriptionLoading ? 'Processing...' : 'Get Premium'}
          </Button>
        )}
        {isAuthenticated && (
          <button onClick={() => setIsCreditModalOpen(true)} className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-bold">{credits}</span>
          </button>
        )}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                {user?.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="User avatar" 
                    className="h-6 w-6 rounded-full" 
                  />
                )}
                <span className="text-sm text-muted-foreground hidden lg:inline">
                  {user?.email}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isStripeConnected ? (
                <DropdownMenuItem>
                  <OnboardingButton />
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem>
                    <ManageAccountButton />
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Dashboard
                    </a>
                  </DropdownMenuItem>
                </>
              )}
              {isSubscribed && (
                <DropdownMenuItem onClick={handleManageBilling} disabled={isPortalLoading}>
                  <Settings className="mr-2 h-4 w-4" />
                  {isPortalLoading ? 'Loading...' : 'Manage Billing'}
                </DropdownMenuItem>
              )}
              {portalError && <DropdownMenuItem disabled><p className="text-xs text-destructive">{portalError}</p></DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">
                Sign Up
              </Button>
            </Link>
          </>
        )}
        <div className="flex items-center gap-2">
          <Switch
            id="theme-switcher-desktop"
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
          {isDarkMode ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-2">
        {isAuthenticated && (
          <button onClick={() => setIsCreditModalOpen(true)} className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-bold">{credits}</span>
          </button>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
    </motion.header>

    {/* Mobile Menu Overlay */}
    <AnimatePresence>
      <CreditCostsModal 
        isOpen={isCreditModalOpen} 
        onClose={() => setIsCreditModalOpen(false)} 
        onSubscribe={handleSubscribe}
      />
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden fixed inset-x-0 top-[117px] z-40 bg-background/95 backdrop-blur-sm p-6 border-b shadow-lg"
          // Header height on small screens is approx 72px (logo h-10=40px + py-4=32px). 72px + 45px margin = 117px.
        >
          <nav className="flex flex-col gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-3 py-2 text-base">
                  Create <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/store-generator" className="font-bold">Store</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/template-generator">Template</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/designer">Design</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://www.musicmigo.com" target="_blank" rel="noopener noreferrer">Music</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/podcast">Podcast</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/video">Video</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          <div className="flex items-center justify-between px-3 py-2">
              <span className="text-base">Dark Mode</span>
              <Switch
                id="theme-switcher-mobile"
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
            </div>
            {isAuthenticated ? (
              <>
                {user?.photoURL && ( // Use photoURL from Firebase user
                  <div className="flex items-center gap-2 px-3 py-2">
                    <img 
                      src={user.photoURL} 
                      alt="User avatar" 
                      className="h-8 w-8 rounded-full" 
                    />
                     <span className="text-sm text-muted-foreground">{user?.email}</span>
                  </div>
                )}
                {!isStripeConnected ? (
                  <OnboardingButton />
                ) : (
                  <>
                    <ManageAccountButton />
                    <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="outline" className="w-full justify-start px-3 py-2 text-base">
                        <ExternalLink className="mr-2 h-4 w-4" /> Dashboard
                      </Button>
                    </a>
                  </>
                )}
                {isSubscribed && (
                  <Button variant="outline" onClick={handleManageBilling} disabled={isPortalLoading} className="w-full justify-start px-3 py-2 text-base">
                    <Settings className="mr-2 h-4 w-4" /> {isPortalLoading ? 'Loading...' : 'Manage Billing'}
                  </Button>
                )}
                {portalError && <p className="text-xs text-destructive px-3 py-1">{portalError}</p>}
                <Button variant="outline" onClick={handleLogout} className="w-full justify-start px-3 py-2 text-base">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="w-full">
                  <Button variant="ghost" className="w-full justify-start px-3 py-2 text-base">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth" className="w-full">
                  <Button className="w-full justify-start px-3 py-2 text-base">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
             {/* portalError is already handled above for mobile, this one might be redundant or for a different context if it was ever shown outside the dropdowns.
                 However, the previous change already added portalError display to the mobile business buttons section.
                 If this specific one is still needed, it should also be text-destructive.
                 For now, assuming the earlier changes cover mobile error display for portalError.
                 If a distinct portalError display is needed here, it should be:
                 {portalError && <p className="text-xs text-destructive px-3 py-1">{portalError}</p>}
                 Let's remove this specific one as it seems duplicative after the prior refactor.
             */}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Header;
