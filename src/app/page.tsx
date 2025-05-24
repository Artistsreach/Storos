// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense, lazy, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Assuming useAuth is correctly exported from AuthContext
import { StoreSetupProvider, useStoreSetup } from '@/context/StoreSetupContext';
import NameStep from '@/components/store-builder/steps/NameStep';
import CategoryStep from '@/components/store-builder/steps/CategoryStep';
import LogoStep from '@/components/store-builder/steps/LogoStep';
import ProductsStep from '@/components/store-builder/steps/ProductsStep';
import CollectionsStep from '@/components/store-builder/steps/CollectionsStep';
import ThemeStep from '@/components/store-builder/steps/ThemeStep'; 
import PathChoiceStep from '@/components/store-builder/steps/PathChoiceStep';
import ShopifyConnectStep from '@/components/store-builder/steps/ShopifyConnectStep';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Progress } from '@/components/ui/progress'; 
import { ArrowLeft, ArrowRight, Check, Store as StoreIcon, FileInput } from 'lucide-react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp, Firestore } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Loader2 as LoaderIcon } from 'lucide-react'; // Ensure LoaderIcon is imported


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Handle initialization error, perhaps show a message to the user
}


const TotalStepsForManual = 6; // PathChoice, Category, Name, Logo, Products, Collections (ThemeStep removed from count)
const TotalStepsForShopify = 3; // PathChoice, ShopifyConnect, (ColorPalette and ThemeStep removed from count)

const MainWizardController = () => {
  const { user, loading } = useAuth() || { user: null, loading: true };
  const { state: storeSetupState, dispatch } = useStoreSetup();
  const [currentVisibleStep, setCurrentVisibleStep] = useState(1);
  const [authAttempted, setAuthAttempted] = useState(false);

  const {
    path,
    storeName,
    // colorPalette, // Removed
    // themePrompt, // Removed
    // generatedThemeHtml // Removed
  } = storeSetupState;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("User not authenticated. Current path:", path);
        if (!path) { // If no path chosen, start at PathChoiceStep
          dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
          setCurrentVisibleStep(1);
        } else {
          // If a path is chosen but user is not logged in, they might need to log in
          // to proceed further, but the step itself might not require auth yet.
          // Let the step component handle auth requirements.
          // Ensure currentVisibleStep reflects the actual currentStep
          setCurrentVisibleStep(storeSetupState.currentStep + 1);
        }
      } else { // User is authenticated
        console.log("User authenticated. Current path:", path);
        if (!path) { // If auth but no path, go to PathChoiceStep
          dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
          setCurrentVisibleStep(1);
        } else { // Auth and path set, resume from context's current step
          setCurrentVisibleStep(storeSetupState.currentStep + 1);
        }
      }
    }
  }, [user, loading, path, dispatch, storeSetupState.currentStep]);


  const handleSignIn = async () => {
    setAuthAttempted(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };
  
  const handleDemoLogin = async () => {
    setAuthAttempted(true);
    try {
      await signInWithEmailAndPassword(auth, "demo@example.com", "password");
      // toast({ title: "Demo Login Successful" });
    } catch (error) {
      console.error("Error with demo login:", error);
      // toast({ title: "Demo Login Failed", description: error.message, variant: "destructive" });
    }
  };


  const totalSteps = path === 'shopify' ? TotalStepsForShopify : TotalStepsForManual;
  // Use context's currentStep for progress calculation.
  // totalSteps is 1-based (e.g., 3 or 6), currentStep is 0-based.
  // So, progress calculation should be (currentStep / (totalSteps - 1))
  const actualCurrentStepForProgress = storeSetupState.currentStep; 

  if (loading && !authAttempted && !user) { // Show loader if AuthContext is loading and no user yet
    return <FullScreenLoader message="Initializing..." />;
  }
  
  // If no user and no path chosen yet (PathChoiceStep doesn't strictly require login to view)
  if (!user && !path) {
     if (storeSetupState.currentStep !== 0) { // Ensure we are on PathChoice if no path
        dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
     }
     // setCurrentVisibleStep will be set by useEffect or remain 1 for PathChoice
  }


  // If user is logged in OR no path is chosen yet (PathChoiceStep doesn't require login)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4 selection:bg-primary/20 selection:text-primary">
      <Toaster />
      <motion.div
        key={actualCurrentStepForProgress} 
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
            {path && ( 
              <div className="mt-6">
                 <div className="flex justify-between text-sm text-muted-foreground mb-1">
                   <span>Step {currentVisibleStep} of {totalSteps}</span>
                   <span>{Math.round((actualCurrentStepForProgress / (totalSteps -1 )) * 100)}% Complete</span>
                 </div>
                <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                  <motion.div
                    className="h-2.5 rounded-full"
                    style={{ backgroundColor: '#02c75e' }} 
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
         {!user && ( 
          <Card className="mt-6 shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to save your progress and complete store setup.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleSignIn} className="flex-1">
                    <Sparkles className="mr-2 h-4 w-4" /> Sign In with Google
                </Button>
                <Button onClick={handleDemoLogin} variant="outline" className="flex-1">
                     Log In as Demo User
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};


const StoreBuilderContent: React.FC<{ currentVisibleStep: number, setCurrentVisibleStep: Function, totalSteps: number }> = ({ currentVisibleStep, setCurrentVisibleStep, totalSteps }) => {
  const { state, dispatch } = useStoreSetup();
  const { user } = useAuth() || { user: null }; // Ensure useAuth has a fallback if context is not yet ready
  const [isSaving, setIsSaving] = useState(false);
  const {
    currentStep, // This is the 0-indexed step from context
    path,
    shopifyStoreUrl,
    // colorPalette, // Removed
    // themePrompt, // Removed
  } = state;

  const handleNext = () => {
    // totalSteps is 1-based, currentStep (from context) is 0-based.
    // We should advance currentStep in context, and currentVisibleStep will follow via useEffect in MainWizardController.
    if (state.currentStep < totalSteps - 1) { 
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
      // setCurrentVisibleStep will be updated by MainWizardController's useEffect
    }
  };

  const handleBack = () => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
       // setCurrentVisibleStep will be updated by MainWizardController's useEffect
    }
  };

  const handleWizardComplete = async () => {
    if (!user) {
      // toast({ title: "Please Sign In", description: "You need to be signed in to create a store.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    console.log("Finalizing store setup. Current state:", state);
    
    const storeDataPayload = {
      userId: user.uid,
      path: state.path,
      category: state.category,
      storeName: state.storeName,
      logoDataUri: state.logo?.dataUri || null,
      logoMimeType: state.logo?.mimeType || null,
      products: state.products.map(p => ({ 
        name: p.name, 
        price: p.price, 
        description: p.description, 
        imageUrl: p.imageUrl,
        id: p.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Ensure ID
      })),
      collections: state.collections.map(c => ({ 
        name: c.name, 
        description: c.description, 
        imageUrl: c.imageUrl, 
        id: c.id || `coll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Ensure ID
        productIds: c.productIds || [] 
      })),
      // colorPalette: state.colorPalette, // Removed
      // themePrompt: state.themePrompt, // Removed
      createdAt: Timestamp.now(), // Firestore Timestamp
      shopifyStoreUrl: state.path === 'shopify' ? state.shopifyStoreUrl : null,
      // themeHtml: state.generatedThemeHtml || '', // Removed from direct save here
    };

    try {
      const docRef = await addDoc(collection(db, "stores"), storeDataPayload);
      dispatch({ type: 'SET_STORE_ID', payload: docRef.id }); 
      // toast({ title: "Store Created!", description: `Store "${state.storeName}" (ID: ${docRef.id}) saved. Redirecting...` });
      // TODO: Navigate to the new dashboard: /dashboard/[storeId]
      // For now, let's log and alert. Navigation should be added here.
      console.log(`Store created with ID: ${docRef.id}. Implement navigation to /dashboard/${docRef.id}`);
      alert(`Store "${state.storeName}" created! ID: ${docRef.id}. Implement navigation to dashboard.`);
      // Example navigation (if using Next.js router, otherwise use useNavigate from react-router-dom)
      // router.push(`/dashboard/${docRef.id}`); 
    } catch (error) {
      console.error("Error saving store data to Firestore:", error);
      // toast({ title: "Save Error", description: `Error saving store: ${error.message}`, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  let StepComponent;
  if (state.currentStep === 0) StepComponent = PathChoiceStep;
  else if (path === 'manual') {
    switch (state.currentStep) {
      case 1: StepComponent = CategoryStep; break;
      case 2: StepComponent = NameStep; break;
      case 3: StepComponent = LogoStep; break;
      case 4: StepComponent = ProductsStep; break;
      case 5: StepComponent = CollectionsStep; break;
      // Removed ColorPaletteStep and ThemeStep from manual flow
      default: StepComponent = PathChoiceStep;
    }
  } else if (path === 'shopify') {
     switch (state.currentStep) {
      case 1: StepComponent = ShopifyConnectStep; break;
      // Removed ColorPaletteStep and ThemeStep from shopify flow
      default: StepComponent = PathChoiceStep; 
    }
  } else {
    StepComponent = PathChoiceStep; 
  }

  // isLastStep determination needs to be based on state.currentStep and totalSteps
  const isLastStep = state.currentStep === totalSteps - 1;

  return (
    <>
      <CardContent className="p-6 md:p-8 min-h-[300px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep} 
            initial={{ opacity: 0, x: state.currentStep > state.prevStep ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: state.currentStep > state.prevStep ? -50 : 50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </CardContent>
      {path && ( 
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} disabled={state.currentStep === 0 || isSaving}>
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

const FullScreenLoader: FC<{ message?: string }> = ({ message = "Loading..." }) => (
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
