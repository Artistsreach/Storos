// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { StoreSetupProvider, useStoreSetup } from '@/context/StoreSetupContext';
import NameStep from '@/components/store-builder/steps/NameStep';
import CategoryStep from '@/components/store-builder/steps/CategoryStep';
import LogoStep from '@/components/store-builder/steps/LogoStep';
import ProductsStep from '@/components/store-builder/steps/ProductsStep';
import CollectionsStep from '@/components/store-builder/steps/CollectionsStep';
// import GenerateStoreTemplateStep from '@/components/store-builder/steps/GenerateStoreTemplateStep'; 
import PathChoiceStep from '@/components/store-builder/steps/PathChoiceStep';
import ShopifyConnectStep from '@/components/store-builder/steps/ShopifyConnectStep';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Progress } from '@/components/ui/progress'; // Shadcn Progress
import { ArrowLeft, ArrowRight, Check, Loader2 as LoaderIcon, Wand2, Store as StoreIcon, FileInput } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
// import ColorPaletteStep from '@/components/store-builder/steps/ColorPaletteStep';


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const TotalStepsForManual = 6; // PathChoice, Category, Name, Logo, Products, Collections
const TotalStepsForShopify = 3; // PathChoice, ShopifyConnect, (ColorPalette removed, Finish)

const MainWizardController = () => {
  const { user, loading } = useAuth();
  const { state: storeSetupState, dispatch } = useStoreSetup();
  const [currentVisibleStep, setCurrentVisibleStep] = useState(1); // Manages UI step progression
  const [authAttempted, setAuthAttempted] = useState(false);

  const {
    path,
    category,
    storeName,
    logo,
    products,
    collections,
    // colorPalette, // Removed
    // themePrompt, // Removed
    // generatedThemeHtml // Removed
  } = storeSetupState;

  useEffect(() => {
    if (!loading && !user && !authAttempted) {
      // Optional: redirect to a dedicated login page or show login UI
      // For now, assuming the "Sign in with Google" button is the primary auth mechanism
      console.log("User not authenticated. Showing wizard from step 1 if path not chosen, or PathChoiceStep.");
      if (!path) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: 0 }); // Show PathChoiceStep
        setCurrentVisibleStep(1);
      }
    } else if (user) {
      // User is authenticated, proceed with wizard logic
      if (!path) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
        setCurrentVisibleStep(1);
      } else {
        // If path is set, resume from the actual current step in context
        setCurrentVisibleStep(storeSetupState.currentStep + 1); 
      }
    }
  }, [user, loading, path, dispatch, storeSetupState.currentStep, authAttempted]);


  const handleSignIn = async () => {
    setAuthAttempted(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged in AuthProvider will handle user state update
      // Optionally, force a refresh or wait for user state to propagate if needed
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert(`Login failed: ${error.message}`);
    }
  };


  const totalSteps = path === 'shopify' ? TotalStepsForShopify : TotalStepsForManual;
  const actualCurrentStepForProgress = storeSetupState.currentStep; // Use context's currentStep for progress calculation

  if (loading && !authAttempted) {
    return <FullScreenLoader message="Initializing..." />;
  }
  
  // If not authenticated and path is not chosen, show login option or PathChoiceStep
  if (!user && !path && authAttempted) { 
    // If auth was attempted and failed, or user explicitly logged out, they might land here.
    // Defaulting to PathChoice, but could show a more specific "Login to continue" message
    // or redirect. For now, let PathChoice handle it.
    dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
    // setCurrentVisibleStep will be updated by useEffect
  }
  
  if (!user && path) { // If path is chosen but user logged out / session expired
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <Card className="w-full max-w-md text-center p-8 shadow-2xl">
          <CardHeader>
            <StoreIcon className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Session Expired or Logged Out</CardTitle>
            <CardDescription className="text-muted-foreground text-lg mt-2">
              Please sign in again to continue building your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignIn} size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
              <Sparkles className="mr-2 h-5 w-5" /> Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is logged in OR no path is chosen yet (PathChoiceStep doesn't require login)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4 selection:bg-primary/20 selection:text-primary">
      <Toaster />
      <motion.div
        key={actualCurrentStepForProgress} // Use actualCurrentStepForProgress for animation key
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b">
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold text-primary">ThemeForge AI</h1>
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <CardDescription className="text-muted-foreground mt-1">
              Create your e-commerce store with the power of AI.
            </CardDescription>
            {path && ( // Only show progress if a path is chosen
              <div className="mt-6">
                 <div className="flex justify-between text-sm text-muted-foreground mb-1">
                   <span>Step {currentVisibleStep} of {totalSteps}</span>
                   <span>{Math.round((actualCurrentStepForProgress / (totalSteps -1 )) * 100)}% Complete</span>
                 </div>
                <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                  <motion.div
                    className="h-2.5 rounded-full"
                    style={{ backgroundColor: '#02c75e' }} // Applied user's requested color
                    initial={{ width: "0%" }}
                    animate={{ width: `${(actualCurrentStepForProgress / (totalSteps-1)) * 100}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>
              </div>
            )}
          </CardHeader>

          <StoreBuilderContent currentVisibleStep={currentVisibleStep} setCurrentVisibleStep={setCurrentVisibleStep} totalSteps={totalSteps} />
          
        </Card>
         {!user && path && ( // Show sign-in prompt if a path is chosen but user is not logged in yet
          <Card className="mt-6 shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to save your progress and complete store setup.</p>
              <Button onClick={handleSignIn} className="w-full max-w-xs mx-auto">
                <Sparkles className="mr-2 h-4 w-4" /> Sign In with Google
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};


const StoreBuilderContent: React.FC<{ currentVisibleStep: number, setCurrentVisibleStep: Function, totalSteps: number }> = ({ currentVisibleStep, setCurrentVisibleStep, totalSteps }) => {
  const { state, dispatch } = useStoreSetup();
  const { user } = useAuth(); // Get user for saving data
  const [isSaving, setIsSaving] = useState(false);
  const {
    currentStep,
    path,
    category,
    storeName,
    logo,
    products,
    collections,
    shopifyStoreData,
    // colorPalette // Removed
  } = state;

  const handleNext = () => {
    if (currentStep < totalSteps -1) { // totalSteps is 1-based, currentStep is 0-based
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep + 1 });
      setCurrentVisibleStep(currentVisibleStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep - 1 });
      setCurrentVisibleStep(currentVisibleStep - 1);
    }
  };

  const handleWizardComplete = async () => {
    if (!user) {
      alert("Please sign in to save and complete your store setup.");
      // Potentially trigger sign-in flow here
      return;
    }
    setIsSaving(true);
    console.log("Finalizing store setup. Current state:", state);
    
    const storeDataPayload = {
      userId: user.uid, // Firebase user ID
      path: state.path,
      category: state.category,
      storeName: state.storeName,
      logoDataUri: state.logo?.dataUri || null, // Handle optional logo
      logoMimeType: state.logo?.mimeType || null,
      products: state.products.map(p => ({ name: p.name, price: p.price, description: p.description, imageUrl: p.imageUrl })),
      collections: state.collections.map(c => ({ name: c.name, description: c.description, imageUrl: c.imageUrl, productIds: c.productIds || [] })),
      // colorPalette: state.colorPalette, // Removed
      // themePrompt: state.themePrompt, // Removed
      // No themeHTML to save directly anymore
      createdAt: new Date().toISOString(),
      shopifyStoreData: state.path === 'shopify' ? state.shopifyStoreData : null,
    };

    try {
      const docRef = await addDoc(collection(db, "stores"), storeDataPayload);
      // Update the local state or context if necessary with the new store ID from Firestore
      dispatch({ type: 'SET_STORE_ID', payload: docRef.id }); 
      alert(`Store "${storeName}" (ID: ${docRef.id}) saved successfully! You will be redirected to the dashboard.`);
      // TODO: Navigate to a dashboard page, potentially passing the new store ID
      // navigate(`/dashboard/${docRef.id}`);
      console.log("Store created with ID:", docRef.id);
    } catch (error) {
      console.error("Error saving store data to Firestore:", error);
      alert(`Error saving store: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  let StepComponent;
  // Determine which step component to render based on currentStep and path
  if (currentStep === 0) StepComponent = PathChoiceStep;
  else if (path === 'manual') {
    switch (currentStep) {
      case 1: StepComponent = CategoryStep; break;
      case 2: StepComponent = NameStep; break;
      case 3: StepComponent = LogoStep; break;
      case 4: StepComponent = ProductsStep; break;
      case 5: StepComponent = CollectionsStep; break;
      // case 6: StepComponent = ColorPaletteStep; break; // Removed
      // case 6: StepComponent = GenerateStoreTemplateStep; break; // Removed template step
      default: StepComponent = PathChoiceStep; // Fallback or should be end
    }
  } else if (path === 'shopify') {
     switch (currentStep) {
      case 1: StepComponent = ShopifyConnectStep; break;
      // case 2: StepComponent = ColorPaletteStep; break; // Removed
      // case 2: StepComponent = GenerateStoreTemplateStep; break; // Removed template step
      default: StepComponent = PathChoiceStep; // Fallback or should be end
    }
  } else {
    StepComponent = PathChoiceStep; // Default if path isn't set or recognized
  }


  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      <CardContent className="p-6 md:p-8 min-h-[300px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep} // Key change triggers animation
            initial={{ opacity: 0, x: currentStep > state.prevStep ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: currentStep > state.prevStep ? -50 : 50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </CardContent>
      {path && ( // Only show footer with buttons if a path is chosen
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSaving}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {isLastStep ? (
            <Button onClick={handleWizardComplete} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white">
              {isSaving ? <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Finish & Create Store
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSaving}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </>
  );
};

const FullScreenLoader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-[200]">
    <LoaderIcon className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-lg text-muted-foreground">{message}</p>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <StoreSetupProvider>
        <MainWizardController />
      </StoreSetupProvider>
    </AuthProvider>
  );
};

export default App;
