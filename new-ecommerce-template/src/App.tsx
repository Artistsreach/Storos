import React from 'react';
// Removed Router, Routes, Route, Link from 'react-router-dom' as routing will be handled by the parent app.
// ProductCard and Product type might not be needed directly here if HomePage handles its own data via props.
// import ProductCard from './components/products/ProductCard';
// import { Product } from './lib/types';

// Sample data is removed as data will come from props.
import * as ToastPrimitive from "@radix-ui/react-toast"; // Import Radix Toast primitives

import SharedLayout from './layouts/SharedLayout';
import HomePage from './pages/HomePage';
// ProductListingPage import might be removed if App only renders HomePage for now for simplicity.
// import ProductListingPage from './pages/ProductListingPage'; 

// Define props interface
interface AdvancedTemplateProps {
  storeData: any; // Replace 'any' with a more specific type based on your storeData structure
  isPublishedView?: boolean; // Optional, if needed by the template
}

const App: React.FC<AdvancedTemplateProps> = ({ storeData, isPublishedView }) => {
  // The App component, when used as a template, should render its content.
  // For now, it will render HomePage within SharedLayout.
  // Routing aspects (like which page to show based on URL) would typically be handled
  // by the parent application's router context or by passing route information as props.
  // This simplified version always shows HomePage.
  
  // Later, HomePage and other pages will need to be adapted to use storeData.
    // For example, <HomePage products={storeData?.products} settings={storeData?.settings} />
  
  // Prepare heroData from storeData, assuming structure like storeData.settings for hero details
  // or direct properties on storeData if that's how the main app structures it.
  // Fallbacks are to sensible defaults or store name.
  const heroDataForTemplate = {
    title: storeData?.settings?.heroTitle || storeData?.name || "Welcome to Our Store",
    subtitle: storeData?.settings?.heroSubtitle || "Discover amazing products.",
    videoUrl: storeData?.settings?.heroVideoUrl || storeData?.hero_video_url, // Check both possibilities
    imageUrl: storeData?.settings?.heroImageUrl || storeData?.hero_image_url, // Check both possibilities
    primaryColor: storeData?.theme?.primaryColor,
    // CTAs can remain default or be sourced from storeData.settings if available
    // primaryCtaText: storeData?.settings?.heroPrimaryCtaText,
    // primaryCtaLink: storeData?.settings?.heroPrimaryCtaLink,
    // secondaryCtaText: storeData?.settings?.heroSecondaryCtaText,
    // secondaryCtaLink: storeData?.settings?.heroSecondaryCtaLink,
  };

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <SharedLayout storeName={storeData?.name} logoUrl={storeData?.logo_url}>
        {/* 
        For a fully integrated template, you'd ideally not have <Routes> here.
        Instead, StorePreview.jsx would determine which page component from this template
        to render based on the main app's route.
        
        For this step, to resolve the TypeError, we are simplifying:
        - No internal <Router> or <Routes>.
        - Always render HomePage content.
        - HomePage will need to be adapted to use `storeData` prop.
      */}
      <HomePage 
        products={storeData?.products} 
        collections={storeData?.collections} // Pass collections
        heroData={heroDataForTemplate}      // Pass structured hero data
        storeName={storeData?.name} 
      />
      {/* 
        A more robust solution would involve StorePreview.jsx deciding which page to render:
        e.g. if main app route is /products, render <ProductListingPage products={storeData?.products} />
        This current setup will always show the content of HomePage.tsx from the new template.
      */}
      </SharedLayout>
    </ToastPrimitive.Provider>
  );
}

export default App;
