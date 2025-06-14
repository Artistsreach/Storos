import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import StoreGenerator from '../components/StoreGenerator';
import StoreList from '../components/StoreList';
import ImportWizard from '../components/ImportWizard'; // Changed from ShopifyImportWizard
import ImportSourceSelector from '../components/ImportSourceSelector'; // Added
import StoreWizard from '../components/StoreWizard';
import { Button } from '../components/ui/button';
import { DownloadCloud as ImportIcon, ListChecks as WizardIcon } from 'lucide-react'; // Changed Icon
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import AuthModal from '../components/AuthModal';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

const StoreOwnerDashboard = () => {
  const { isAuthenticated } = useAuth();
  const [isImportSelectorOpen, setIsImportSelectorOpen] = useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [currentImportSourceForWizard, setCurrentImportSourceForWizard] = useState(null);
  const [activeTab, setActiveTab] = useState("ai-prompt");
  const [isShimmering, setIsShimmering] = useState(false);
  const { isAuthModalOpen, closeAuthModal } = useStore();

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
    <div className="min-h-screen flex flex-col bg-[#ededed] dark:bg-[#131314]"> {/* Light mode: #ededed, Dark mode: #131314 */}
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
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-200 dark:from-gray-500 dark:to-gray-300 ${isShimmering ? 'animate-shimmer bg-200%' : 'bg-auto'}`}>
            Start Fresh
          </h1>
          <p className="text-lg font-inter text-muted-foreground max-w-3xl mx-auto">
            You can create a store 3 ways: <br /> Prompt, Steps or Import.
          </p>
        </motion.div>

        {/* Removed the blue "Manage Your Subscription" container */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
            <TabsTrigger value="ai-prompt">
              <span className="hidden sm:inline">AI Prompt</span>
              <span className="sm:hidden">AI Prompt</span>
            </TabsTrigger>
            <TabsTrigger value="wizard">
              <span className="hidden sm:inline">Step-by-Step</span>
              <span className="sm:hidden">Steps</span>
            </TabsTrigger>
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
          <TabsContent value="store-import" className="text-center py-8"> {/* Removed div, added classes here */}
            {/* Outer div removed */}
            <p className="text-slate-500 dark:text-slate-400 mb-4">Import data from Shopify or BigCommerce.</p> {/* Adjusted text color for subtlety */}
            <Button onClick={handleOpenImportSelector} variant="default" size="lg">
                <ImportIcon className="mr-2 h-5 w-5" />
                Select Import Source
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mb-8 flex justify-center md:hidden"> {/* Import button for mobile */}
          <Button onClick={handleOpenImportSelector} variant="outline" size="lg" className="w-full max-w-xs">
            <ImportIcon className="mr-2 h-5 w-5" />
            Import Store Data
          </Button>
        </div>
        
        {isAuthenticated && <StoreList />}
      </motion.div>
      
      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} FreshFront. All rights reserved.</p>
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

      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}
    </div>
  );
};

export default StoreOwnerDashboard;
