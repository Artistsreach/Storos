import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import ShopifyConnectForm from '../components/ShopifyConnectForm'; // Step 1 for Shopify
import BigCommerceConnectForm from '../components/BigCommerceConnectForm'; // Added
import StoreWizard from '../components/StoreWizard'; // Import StoreWizard
import { 
    ShopifyMetadataPreview, 
    ShopifyItemsPreview, 
} from './wizard/ShopifyWizardSteps'; // Step 2, 3 for Shopify
import {
    BigCommerceMetadataPreview,
    BigCommerceItemsPreview,
    // BigCommerceConfirmImport // This step might be skipped
} from './wizard/BigCommerceWizardSteps'; // Added
import { generateStoreUrl } from '../lib/utils.js'; // Added

const ImportWizard = ({ isOpen, onClose, initialImportSource = 'shopify' }) => {
  const navigate = useNavigate(); // Added
  const [currentImportSource, setCurrentImportSource] = useState(initialImportSource);
  const { 
    shopifyWizardStep, setShopifyWizardStep, resetShopifyWizardState, 
    shopifyPreviewMetadata, shopifyPreviewProducts, shopifyPreviewCollections, 
    isFetchingShopifyPreviewData, shopifyImportError, 
    fetchShopifyWizardProducts, fetchShopifyWizardCollections, finalizeShopifyImportFromWizard: finalizeShopifyImport, // Renamed for clarity
    shopifyWizardShouldShowGenerator, setShopifyWizardShouldShowGenerator, // Get these directly from useStore()
    
    bigCommerceWizardStep, setBigCommerceWizardStep, resetBigCommerceWizardState,
    bigCommercePreviewSettings, bigCommercePreviewProducts,
    isFetchingBigCommercePreviewData, bigCommerceImportError,
    fetchBigCommerceWizardProducts: fetchBCWizardProducts, // Renamed
    finalizeBigCommerceImportFromWizard: finalizeBCImport, // Renamed
    
    isGenerating, // Global generating state
    generateStoreFromWizard // For the embedded StoreWizard to call
  } = useStore();

  // Configuration object to map currentImportSource to context values
  const sourceConfig = {
    shopify: {
      wizardStep: shopifyWizardStep,
      setWizardStep: setShopifyWizardStep,
      resetWizardState: resetShopifyWizardState,
      previewMetadata: shopifyPreviewMetadata,
      previewProducts: shopifyPreviewProducts, // This is { edges: [], pageInfo: ... }
      previewCollections: shopifyPreviewCollections,
      isFetchingPreviewData: isFetchingShopifyPreviewData,
      importError: shopifyImportError,
      fetchWizardProducts: fetchShopifyWizardProducts,
      fetchWizardCollections: fetchShopifyWizardCollections, // Added
      finalizeImportFromWizard: finalizeShopifyImport, // Use renamed version
      ConnectFormComponent: ShopifyConnectForm,
      MetadataPreviewComponent: ShopifyMetadataPreview,
      ItemsPreviewComponent: ShopifyItemsPreview,
      wizardShouldShowGenerator: shopifyWizardShouldShowGenerator, // Pass through from context
      setWizardShouldShowGenerator: setShopifyWizardShouldShowGenerator, // Pass through from context
      totalSteps: 5, 
    },
    bigcommerce: {
      wizardStep: bigCommerceWizardStep,
      setWizardStep: setBigCommerceWizardStep,
      resetWizardState: resetBigCommerceWizardState,
      previewMetadata: bigCommercePreviewSettings, 
      previewProducts: bigCommercePreviewProducts, 
      isFetchingPreviewData: isFetchingBigCommercePreviewData,
      importError: bigCommerceImportError,
      fetchWizardProducts: fetchBCWizardProducts, 
      finalizeImportFromWizard: finalizeBCImport,
      ConnectFormComponent: BigCommerceConnectForm,
      MetadataPreviewComponent: BigCommerceMetadataPreview,
      ItemsPreviewComponent: BigCommerceItemsPreview,
      totalSteps: 4, // Connect, Settings Preview, Products Preview, (Implicit)Finalize
    },
  };

  const activeConfig = sourceConfig[currentImportSource];
  // Destructure directly from activeConfig, wizardShouldShowGenerator is now part of shopify config
  const { 
    wizardStep: currentWizardStep, // Use a different name to avoid conflict with context's shopifyWizardStep if needed
    setWizardStep: setCurrentWizardStep, 
    resetWizardState: currentResetWizardState, 
    previewMetadata: currentPreviewMetadata, 
    previewProducts: currentPreviewProducts, 
    previewCollections: currentPreviewCollections,
    isFetchingPreviewData: currentIsFetchingPreviewData, 
    importError: currentImportError,
    fetchWizardProducts: currentFetchWizardProducts, 
    fetchWizardCollections: currentFetchWizardCollections, 
    finalizeImportFromWizard: currentFinalizeImportFromWizard,
    ConnectFormComponent: CurrentConnectFormComponent, 
    MetadataPreviewComponent: CurrentMetadataPreviewComponent, 
    ItemsPreviewComponent: CurrentItemsPreviewComponent,
    totalSteps: currentTotalSteps,
    wizardShouldShowGenerator: currentWizardShouldShowGenerator, // Specific to Shopify config
    setWizardShouldShowGenerator: currentSetWizardShouldShowGenerator // Specific to Shopify config
  } = activeConfig;
  
  // isGenerating and generateStoreFromWizard are already destructured from useStore()

  useEffect(() => {
    setCurrentImportSource(initialImportSource);
    // Reset the other source's wizard when switching
    if (initialImportSource === 'shopify' && sourceConfig.bigcommerce.resetWizardState) sourceConfig.bigcommerce.resetWizardState();
    if (initialImportSource === 'bigcommerce' && sourceConfig.shopify.resetWizardState) sourceConfig.shopify.resetWizardState();
  }, [initialImportSource, sourceConfig.bigcommerce, sourceConfig.shopify]);

  useEffect(() => {
    if (isOpen && currentWizardStep === 0) {
      setCurrentWizardStep(1);
    }
    if (!isOpen && currentWizardStep !== 0) {
      currentResetWizardState();
    }
  }, [isOpen, currentWizardStep, setCurrentWizardStep, currentResetWizardState]);

  if (!isOpen || currentWizardStep === 0) {
    return null;
  }

  const handleNext = async () => {
    if (currentWizardStep < currentTotalSteps) {
      if (currentImportSource === 'shopify') {
        if (currentWizardStep === 2) { // From Meta Preview to Items Preview
          if (!currentPreviewProducts || currentPreviewProducts.edges.length === 0) {
            await currentFetchWizardProducts(10); // Shopify products
          }
          if (!currentPreviewCollections || currentPreviewCollections.edges.length === 0) {
            await currentFetchWizardCollections(10); // Shopify collections
          }
          setCurrentWizardStep(3);
        } else if (currentWizardStep === 3) { // From Items Preview to Configure & Generate step
          await currentFinalizeImportFromWizard(); // This will set shopifyWizardStep to 4 in context
        }
      } else if (currentImportSource === 'bigcommerce') {
        if (currentWizardStep === 1) { 
           // Logic for BigCommerce step 1 to 2
        } else if (currentWizardStep === 2) { 
          if (!currentPreviewProducts || currentPreviewProducts.items.length === 0) {
            await currentFetchWizardProducts(10); 
          }
          setCurrentWizardStep(3);
        } else if (currentWizardStep === 3) { 
          await handleFinish(); // BigCommerce finalize
        }
      }
    }
  };

  const handleBack = () => {
    if (currentWizardStep > 1) {
      setCurrentWizardStep(currentWizardStep - 1);
    }
  };

  const handleCancel = () => {
    currentResetWizardState();
    if (currentSetWizardShouldShowGenerator) currentSetWizardShouldShowGenerator(false); // Reset specific Shopify flag
    if (onClose) onClose();
  };

  const handleFinish = async () => { // Primarily for BigCommerce direct finalization
    const success = await currentFinalizeImportFromWizard(); 
    if (success) {
      if (onClose) onClose();
    }
  };
  
  const renderStepContent = () => {
    switch (currentWizardStep) {
      case 1: // Connect Step
        return (
          <CurrentConnectFormComponent
            open={currentWizardStep === 1} // Prop for the form component itself
            onOpenChange={(isOpenState) => { 
              if (!isOpenState) handleCancel();
            }}
            onSuccessfulConnect={(credentials) => {
              if (currentImportSource === 'shopify') {
                 // startShopifyImportWizard is already available from useStore()
                 startShopifyImportWizard(credentials.domain, credentials.token);
              }
              // BigCommerce logic would go here if CurrentConnectFormComponent was for BC
            }}
          />
        );
      case 2: // Metadata Preview Step
        return <CurrentMetadataPreviewComponent />;
      case 3: // Items Preview Step
        return <CurrentItemsPreviewComponent />;
      case 4: // Configure & Generate Store Step (embedding StoreWizard)
        if (currentImportSource === 'shopify' && currentWizardShouldShowGenerator) {
          return <StoreWizard isEmbedded={true} onGenerationComplete={(newStore) => {
            if (newStore && (newStore.urlSlug || newStore.name)) {
              const storeUrlPath = `/${newStore.urlSlug || generateStoreUrl(newStore.name)}`;
              navigate(storeUrlPath);
            }
            if (onClose) onClose();
            if (currentSetWizardShouldShowGenerator) currentSetWizardShouldShowGenerator(false);
          }} />;
        }
        return <div>Loading generator...</div>; 
      default: 
        if (currentWizardStep === currentTotalSteps && isGenerating) { 
          return <div className="flex flex-col items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin mb-4" /> <p>Processing...</p></div>;
        }
        return <div>Invalid Wizard Step or processing... ({currentWizardStep})</div>;
    }
  };

  if (currentWizardStep === 1 && currentImportSource === 'shopify') {
    return renderStepContent(); 
  }

  const cardTitleText = currentImportSource === 'shopify' ? 'Import from Shopify' : 
                       currentImportSource === 'bigcommerce' ? 'Import from BigCommerce' : 
                       'Import Store Data';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {currentWizardStep === 1 && currentImportSource === 'bigcommerce' 
              ? 'Connect to BigCommerce' 
              : cardTitleText}
          </CardTitle>
          <CardDescription>
            {currentWizardStep === 1 && currentImportSource === 'bigcommerce'
              ? 'Enter your store domain and API token.'
              : currentWizardStep === 4 && currentImportSource === 'shopify'
              ? 'Configure and generate your new store.'
              : `Step ${currentWizardStep} of ${currentTotalSteps -1 }`} 
          </CardDescription>
          <div className="w-full bg-muted rounded-full h-2.5 mt-2">
            <motion.div
              className="bg-primary h-2.5 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentWizardStep / currentTotalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </CardHeader>
        <CardContent className="min-h-[250px] max-h-[60vh] overflow-y-auto flex items-center justify-center">
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
            {currentWizardStep > 1 && currentWizardStep !== 4 && ( 
            <Button variant="outline" onClick={handleCancel} disabled={isGenerating || currentIsFetchingPreviewData}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}
          {currentWizardStep === 4 && currentImportSource === 'shopify' && ( 
             <Button variant="outline" onClick={handleCancel} disabled={isGenerating || currentIsFetchingPreviewData}>
               <XCircle className="mr-2 h-4 w-4" /> Cancel Import
             </Button>
          )}
          <div>
            {currentWizardStep > 1 && currentWizardStep < (currentTotalSteps -1) && ( 
                 <Button variant="outline" onClick={handleBack} disabled={isGenerating || currentIsFetchingPreviewData} className="mr-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                 </Button>
            )}
            {currentWizardStep === 1 && currentImportSource === 'bigcommerce' && (
                <Button onClick={handleNext} disabled={isGenerating || currentIsFetchingPreviewData}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
            {currentWizardStep === 2 && ( 
              <Button onClick={handleNext} disabled={isGenerating || currentIsFetchingPreviewData}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {currentWizardStep === 3 && ( 
              <Button onClick={handleNext} disabled={isGenerating || currentIsFetchingPreviewData}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                Configure Store
              </Button>
            )}
            
            {currentWizardStep === currentTotalSteps && isGenerating && ( 
              <Button disabled={true}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ImportWizard;
