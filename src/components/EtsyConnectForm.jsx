import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useStore } from '../contexts/StoreContext';
import { Loader2 } from 'lucide-react';

const EtsyConnectForm = ({ open, onOpenChange, onSuccessfulConnect }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const {
    startEtsyImportWizard,
    isFetchingEtsyPreviewData: isLoading,
    etsyImportError,
  } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey || !apiSecret) {
      alert('Please enter both Etsy API Key and Secret.');
      return;
    }
    // The startEtsyImportWizard function will need to be updated to accept the API key and secret
    if (onSuccessfulConnect) onSuccessfulConnect({apiKey, apiSecret});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] sm:rounded-xl">
        <DialogHeader>
          <DialogTitle>Connect to Etsy</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Enter your Etsy API Key and Secret to begin importing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {etsyImportError && (
            <div className="col-span-4 p-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded">
              {etsyImportError}
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Etsy API Key"
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiSecret" className="text-right">
              API Secret
            </Label>
            <Input
              id="apiSecret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Etsy API Secret"
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !apiKey || !apiSecret}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect & Fetch Info'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EtsyConnectForm;
