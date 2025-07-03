import React from 'react';
import { useStore } from '../../contexts/StoreContext';
import { Loader2, AlertTriangle } from 'lucide-react';

export const EtsyMetadataPreview = () => {
  const { etsyPreviewData, isFetchingEtsyPreviewData, etsyImportError } = useStore();

  if (isFetchingEtsyPreviewData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Fetching Etsy store information...</p>
      </div>
    );
  }

  if (etsyImportError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="font-semibold">Error Fetching Store Info</p>
        <p className="text-sm text-center">{etsyImportError}</p>
      </div>
    );
  }

  if (!etsyPreviewData) {
    return <div className="text-center text-muted-foreground">No store metadata to display.</div>;
  }

  return (
    <div className="w-full p-4">
      <h3 className="text-xl font-semibold mb-4 text-center">Etsy Store Preview</h3>
      <p><strong>Shop Name:</strong> {etsyPreviewData.shop_name}</p>
      <p><strong>Title:</strong> {etsyPreviewData.title}</p>
      <p><strong>Announcement:</strong> {etsyPreviewData.announcement}</p>
    </div>
  );
};

export const EtsyItemsPreview = () => {
  const { etsyPreviewProducts, isFetchingEtsyPreviewData, etsyImportError } = useStore();

  if (isFetchingEtsyPreviewData) {
    return (
      <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin" /></div>
    );
  }
  
  if (etsyImportError) {
    return <p className="text-destructive text-sm mb-2">{etsyImportError}</p>;
  }

  return (
    <div className="w-full p-4 space-y-6">
      <h3 className="text-lg font-semibold mb-2">Etsy Products</h3>
      <ul>
        {etsyPreviewProducts.items.map(product => (
          <li key={product.listing_id} className="border-b py-2">
            <p><strong>{product.title}</strong></p>
            <p>{product.description}</p>
            <p>Price: {product.price.amount / product.price.divisor} {product.price.currency_code}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
