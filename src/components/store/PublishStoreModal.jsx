import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Globe, Link2, ExternalLink } from 'lucide-react';

const PublishStoreModal = ({ open, onOpenChange, store, onConfirmPublish }) => {
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (store?.slug) {
      setSlug(store.slug);
    } else if (store?.name) {
      // Generate a default slug from store name
      setSlug(store.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    } else {
      setSlug('');
    }
  }, [store]);

  const handleSlugChange = (e) => {
    const newSlug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setSlug(newSlug);
    if (newSlug.length < 3 && newSlug.length > 0) {
      setSlugError('Slug must be at least 3 characters long.');
    } else {
      setSlugError('');
    }
  };

  const handleSubmit = () => {
    if (slug.length < 3) {
      setSlugError('Slug must be at least 3 characters long.');
      return;
    }
    if (!slugError) {
      onConfirmPublish(slug);
      onOpenChange(false);
    }
  };
  
  // Placeholder for custom domain connection
  const handleConnectDomain = () => {
    // This would typically navigate to a domain connection page or open another modal/service
    alert("Redirecting to domain connection settings (placeholder).");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold">
            <Globe className="mr-3 h-7 w-7 text-primary" />
            Publish Your Store
          </DialogTitle>
          <DialogDescription className="pt-2">
            Set up your store's address and go live. Your store will be accessible at{' '}
            <code className="bg-muted px-1 py-0.5 rounded">freshfront.co/{slug || '{your-slug}'}</code>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-base font-medium">
              Store Slug
            </Label>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-2 bg-muted border border-input rounded-l-md text-muted-foreground text-sm">
                freshfront.co/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="your-store-name"
                className="rounded-l-none h-10 text-base"
              />
            </div>
            {slugError && <p className="text-sm text-destructive pt-1">{slugError}</p>}
            <p className="text-xs text-muted-foreground pt-1">
              Use lowercase letters, numbers, and hyphens. Min 3 characters.
            </p>
          </div>

          <div className="border-t border-border pt-6 space-y-3">
             <h3 className="text-base font-medium text-foreground flex items-center">
                <Link2 className="mr-2 h-5 w-5 text-primary/80" />
                Custom Domain
            </h3>
            <p className="text-sm text-muted-foreground">
              Want to use your own domain name (e.g., www.yourstore.com)?
            </p>
            <Button variant="outline" onClick={handleConnectDomain} className="w-full justify-start text-left">
              Connect Custom Domain
              <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!!slugError || slug.length < 3}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
          >
            Confirm & Publish Store
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishStoreModal;
