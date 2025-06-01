
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'; // Import Select components
import { ArrowLeft, Edit, Download, Copy, Eye, EyeOff, Sparkles, Palette, UploadCloud, Check, Settings } from 'lucide-react'; // Added Settings, Sparkles, Palette, UploadCloud, Check
import { useToast } from '@/components/ui/use-toast';
import { useStore } from '@/contexts/StoreContext'; // Import useStore

// Added currentTemplate, onTemplateChange, availableTemplates props
const PreviewControls = ({ store, onEdit, currentTemplate, onTemplateChange, availableTemplates = [] }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Removed updateStoreTemplateVersion from here as it will be handled by onTemplateChange for preview
  // Persisting will be handled by EditStoreForm or a dedicated save button.
  const { viewMode, setViewMode, currentStore, updateStore, updateStoreTemplateVersion } = useStore(); 
  
  const handleExport = () => {
    // In a real implementation, this would generate and download the store code
    toast({
      title: 'Export Started',
      description: 'Your store code is being prepared for download.',
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Your store code has been downloaded successfully.',
      });
    }, 2000);
  };
  
  const handleCopyLink = () => {
    // Ensure store and store.name are available
    if (store && store.name) {
      navigator.clipboard.writeText(`${window.location.origin}/${store.name}`); 
      toast({
        title: 'Link Copied',
        description: 'Store link has been copied to clipboard.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Could not copy link: Store name not available.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleViewMode = () => {
    const newMode = viewMode === 'edit' ? 'published' : 'edit';
    setViewMode(newMode);
    toast({
      title: `Switched to ${newMode === 'published' ? 'Consumer View' : 'Admin View'}`,
      description: `Store is now in ${newMode === 'published' ? 'consumer' : 'admin editing'} mode.`,
    });
  };

  // This function now directly calls the onTemplateChange prop passed from StorePreview
  // to update the previewTemplateVersion state there.
  const handlePreviewTemplateChange = (newTemplateVersion) => {
    if (onTemplateChange) {
      onTemplateChange(newTemplateVersion);
      // Optionally, provide feedback that the preview has changed
      // toast({ title: "Preview Updated", description: `Switched preview to ${newTemplateVersion} template.` });
    }
  };
  
  // This function is for actually SAVING the template choice to the backend.
  // It should be called when the user explicitly wants to save.
  // For now, we can add a button for this, or integrate it into EditStoreForm's save.
  const handlePersistTemplateChange = async (newTemplateVersion) => {
    // Map 'classic' to 'v1' for saving if 'v1' is the backend value for the classic template.
    // 'modern' should be saved as 'modern'.
    let versionToSave = newTemplateVersion;
    if (newTemplateVersion === 'classic') {
      versionToSave = 'v1'; // Assuming 'v1' is the backend identifier for "classic"
    }
    // No change needed for 'modern' if it's saved as 'modern'

    if (store && store.id && versionToSave && versionToSave !== store.template_version) {
      try {
        await updateStoreTemplateVersion(store.id, versionToSave);
        toast({
          title: 'Template Saved',
          description: `Store template successfully changed to ${newTemplateVersion}.`, // Show user-facing name
          className: 'bg-green-500 text-white',
        });
      } catch (error) {
        console.error("Failed to save template:", error);
        toast({
          title: 'Save Failed',
          description: 'Could not save the template change. Please try again.',
          variant: 'destructive',
        });
      }
    } else if (versionToSave === store.template_version) {
        toast({
          title: 'No Change',
          description: `Store is already using the ${newTemplateVersion} template.`, // Show user-facing name
        });
    }
  };


  const handleEditStoreClick = () => {
    if (viewMode !== 'edit') {
      setViewMode('edit');
    }
    onEdit(); // This opens the EditStoreForm modal
  };

  const handlePublish = async () => {
    if (store && store.id) {
      try {
        // Assuming updateStore can set a 'published_at' timestamp or a 'status: "published"' field
        // Adjust the payload as per your actual store data structure for publishing
        await updateStore(store.id, { published_at: new Date().toISOString(), status: 'published' });
        toast({
          title: 'Store Published!',
          description: `${store.name} is now live.`,
          className: 'bg-green-500 text-white',
        });
      } catch (error) {
        console.error("Failed to publish store:", error);
        toast({
          title: 'Publish Failed',
          description: 'Could not publish the store. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };
  
  if (viewMode === 'published') {
    return (
      <button
        onClick={() => setViewMode('edit')}
        className="fixed bottom-4 left-4 p-2 z-50 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Open Admin Controls"
        aria-label="Open Admin Controls"
      >
        <Settings className="h-6 w-6 text-gray-500 opacity-50 hover:opacity-75 dark:text-gray-400" />
      </button>
    );
  }

  // viewMode === 'edit' (full controls)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t z-50 py-3"
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Button 
          variant="outline" 
          size="icon" // Changed to icon
          onClick={() => navigate('/')}
          title="Back" // Added title for accessibility
        >
          <ArrowLeft className="h-4 w-4" /> {/* Removed margin */}
        </Button>
        
        <div className="flex items-center gap-2">
          {/* Controls previously shown only in edit mode are now always available when this bar is shown */}
          <Button 
            variant="outline" 
            size="icon" // Changed to icon
            onClick={handleCopyLink}
            title="Copy Link" // Added title for accessibility
          >
            <Copy className="h-4 w-4" /> {/* Removed margin */}
          </Button>
          
          <Button asChild variant="outline" size="sm" disabled={!store || !store.name}>
            <Link to={store && store.name ? `/${store.name}/dashboard` : '#'}>
              Dashboard
            </Link>
          </Button>

          <Button asChild size="sm" variant="outline" disabled={!currentStore || !currentStore.name}>
            <Link 
              to={currentStore && currentStore.name ? `/${currentStore.name}/content-creation` : '#'}
              state={{ storeData: currentStore }} // Pass currentStore in state
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create
            </Link>
          </Button>
          
          <div className="flex items-center gap-1">
            <Select
              value={currentTemplate || ''}
              onValueChange={handlePreviewTemplateChange}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <Palette className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Switch Template" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template.charAt(0).toUpperCase() + template.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentTemplate && currentTemplate !== store?.template_version && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                onClick={() => handlePersistTemplateChange(currentTemplate)}
                title={`Save ${currentTemplate.charAt(0).toUpperCase() + currentTemplate.slice(1)} Template`}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleEditStoreClick}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button 
            size="sm"
            onClick={handleToggleViewMode} // This will switch to 'published' mode
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <Eye className="mr-2 h-4 w-4" /> Customer
          </Button>

          {/* Publish button is now part of the admin controls bar */}
          <Button
            size="sm"
            onClick={handlePublish}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PreviewControls;
