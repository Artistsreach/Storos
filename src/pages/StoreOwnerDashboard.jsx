import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import StoreGenerator from '@/components/StoreGenerator';
import StoreList from '@/components/StoreList';
import ImportWizard from '@/components/ImportWizard'; // Changed from ShopifyImportWizard
import ImportSourceSelector from '@/components/ImportSourceSelector'; // Added
import StoreWizard from '@/components/StoreWizard';
import SubscribeButton from '@/components/SubscribeButton';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DownloadCloud as ImportIcon, ListChecks as WizardIcon } from 'lucide-react'; // Changed Icon
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StoreOwnerDashboard = () => {
  const [isImportSelectorOpen, setIsImportSelectorOpen] = useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [currentImportSourceForWizard, setCurrentImportSourceForWizard] = useState(null);
  const [activeTab, setActiveTab] = useState("ai-prompt");
  const { user, session, subscriptionStatus, loadingProfile } = useAuth();
  const [isShimmering, setIsShimmering] = useState(false);

  const isSubscribed = subscriptionStatus === 'active';
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);

  const handleManageBilling = async () => {
    if (!session?.access_token) {
      setPortalError('Authentication token not found. Please log in again.');
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
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session.');
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('Portal session error:', err);
      setPortalError(err.message);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleOpenImportSelector = () => {
    setIsImportSelectorOpen(true);
  };

  const handleCloseImportSelector = () => { // Added this handler
    setIsImportSelectorOpen(false);
  };

  const handleSourceSelected = (source) => {
    setCurrentImportSourceForWizard(source);
    setIsImportSelectorOpen(false);
    setIsImportWizardOpen(true);
  };

  const handleCloseImportWizard = () => {
    setIsImportWizardOpen(false);
    setCurrentImportSourceForWizard(null);
    // Optionally reset tab if needed
    // if (activeTab === 'store-import') setActiveTab('ai-prompt');
  };

  useEffect(() => {
    let intervalId;
    let timeoutId;

    const triggerShimmer = () => {
      setIsShimmering(true);
      timeoutId = setTimeout(() => {
        setIsShimmering(false);
      }, 2500); // Duration of the shimmer animation (matches tailwind.config.js)
    };

    intervalId = setInterval(triggerShimmer, 5000); // Trigger every 5 seconds

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 container mx-auto px-4 py-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-500 to-slate-300 dark:from-slate-500 dark:to-gray-500 ${isShimmering ? 'animate-shimmer bg-200%' : 'bg-auto'}`}>
            Create a Fresh Store
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            You can create a store 3 ways: Prompt, Steps or Import.
          </p>
        </motion.div>

        {/* Removed the blue "Manage Your Subscription" container */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
            <TabsTrigger value="ai-prompt">AI Prompt</TabsTrigger>
            <TabsTrigger value="wizard">Step-by-Step Wizard</TabsTrigger>
            <TabsTrigger value="store-import" className="hidden md:inline-flex" onClick={handleOpenImportSelector}>
              Import Store
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ai-prompt">
            <StoreGenerator />
          </TabsContent>
          <TabsContent value="wizard">
            <StoreWizard />
          </TabsContent>
          <TabsContent value="store-import">
             <div className="text-center p-8 border rounded-lg bg-card">
                <p className="text-muted-foreground mb-4">Import data from Shopify or BigCommerce.</p>
                 <Button onClick={handleOpenImportSelector} variant="default" size="lg">
                    <ImportIcon className="mr-2 h-5 w-5" />
                    Select Import Source
                </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mb-8 flex justify-center md:hidden"> {/* Import button for mobile */}
          <Button onClick={handleOpenImportSelector} variant="outline" size="lg" className="w-full max-w-xs">
            <ImportIcon className="mr-2 h-5 w-5" />
            Import Store Data
          </Button>
        </div>
        
        <StoreList />
      </motion.div>
      
      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} StoreGen AI. All rights reserved.</p>
      </footer>

      {isImportSelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ImportSourceSelector 
            onSelectSource={handleSourceSelected} 
            onClose={handleCloseImportSelector} // Passed onClose prop
          />
        </div>
      )}

      {currentImportSourceForWizard && (
        <ImportWizard 
          isOpen={isImportWizardOpen} 
          onClose={handleCloseImportWizard}
          initialImportSource={currentImportSourceForWizard}
        />
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
