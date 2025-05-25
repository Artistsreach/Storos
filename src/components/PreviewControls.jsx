
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
import { ArrowLeft, Edit, Download, Copy, Eye, EyeOff, Sparkles, Palette, UploadCloud } from 'lucide-react'; // Added Sparkles, Palette, and UploadCloud
import { useToast } from '@/components/ui/use-toast';
import { useStore } from '@/contexts/StoreContext'; // Import useStore
import PublishStoreModal from '@/components/store/PublishStoreModal'; // Added import
import { useState } from 'react'; // Added import

const PreviewControls = ({ store, onEdit }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { viewMode, setViewMode, updateStoreTemplateVersion, currentStore, updateStore } = useStore(); 
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false); // Added state

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
    let linkToCopy;
    // Use currentStore from context as it's more likely to be up-to-date after a publish action
    if (currentStore && currentStore.status === 'published' && currentStore.slug) {
      linkToCopy = `https://freshfront.co/${currentStore.slug}`;
    } else if (store?.slug && store?.status === 'published') { // Fallback to prop if currentStore isn't updated yet
      linkToCopy = `https://freshfront.co/${store.slug}`;
    }
    else {
      linkToCopy = `${window.location.origin}/store/${store.id}`; 
    }
    navigator.clipboard.writeText(linkToCopy); 
    toast({
      title: 'Link Copied',
      description: `Copied: ${linkToCopy}`,
    });
  };

  const handleToggleViewMode = () => {
    const newMode = viewMode === 'edit' ? 'published' : 'edit';
    setViewMode(newMode);
    toast({
      title: `Switched to ${newMode === 'published' ? 'Consumer View' : 'Admin View'}`,
      description: `Store is now in ${newMode === 'published' ? 'consumer' : 'admin editing'} mode.`,
    });
  };

  const handleTemplateChange = (newTemplateVersion) => {
    if (store && store.id && newTemplateVersion) {
      updateStoreTemplateVersion(store.id, newTemplateVersion);
    }
  };

  const handleEditStoreClick = () => {
    if (viewMode !== 'edit') {
      setViewMode('edit');
    }
    onEdit(); // This opens the EditStoreForm modal
  };

  const openPublishModal = () => {
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async (customSlug) => {
    if (store && store.id) {
      try {
        await updateStore(store.id, { 
          published_at: new Date().toISOString(), 
          status: 'published',
          slug: customSlug 
        });
        toast({
          title: 'Store Published!',
          description: `${store.name} is now live at freshfront.co/${customSlug}`,
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
  
  return (
    <> {/* Added Fragment */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t z-50 py-3"
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          {viewMode === 'edit' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyLink}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              
              <Button asChild variant="outline" size="sm">
                <Link to={`/store/${store.id}/dashboard`}>
                  Dashboard
                </Link>
              </Button>

              <Button asChild size="sm" variant="outline">
                <Link to={`/store/${store.id}/content-creation`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create
                </Link>
              </Button>

              <Select
                value={currentStore?.template_version || 'v1'}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <Palette className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">Classic Template</SelectItem>
                  <SelectItem value="v2">Modern Template</SelectItem>
                  <SelectItem value="premium">Premium Template</SelectItem>
                  <SelectItem value="sharp">Sharp Template</SelectItem>
                  <SelectItem value="fresh">Fresh Template</SelectItem>
                  <SelectItem value="sleek">Sleek Template</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                onClick={handleEditStoreClick} // Updated handler
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Store
              </Button>
            </>
          )}

          <Button 
            size="sm"
            onClick={handleToggleViewMode}
            variant="outline"
            className={viewMode === 'edit' ? "text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" : "text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"}
          >
            {viewMode === 'edit' ? (
              <>
                <Eye className="mr-2 h-4 w-4" /> Customer View
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" /> View as Admin
              </>
            )}
          </Button>

          {viewMode === 'published' && (
            <Button
              size="sm"
              onClick={openPublishModal} // Changed to open modal
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>
    </motion.div>
    <PublishStoreModal
      open={isPublishModalOpen}
      onOpenChange={setIsPublishModalOpen}
      store={store}
      onConfirmPublish={handleConfirmPublish}
    />
    </> // Added Fragment
  );
};

export default PreviewControls;
