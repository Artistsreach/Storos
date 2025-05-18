import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import OrdersTab from '@/components/dashboard/OrdersTab';
import ProductsTab from '@/components/dashboard/ProductsTab';
import CustomersTab from '@/components/dashboard/CustomersTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import MarketingTab from '@/components/dashboard/MarketingTab';
import ShippingTab from '@/components/dashboard/ShippingTab';
import SettingsTab from '@/components/dashboard/SettingsTab';
import { useStore } from '@/contexts/StoreContext'; // To potentially load store-specific data

const StoreDashboardPage = () => {
  const { storeId } = useParams();
  const location = useLocation();
  const { getStoreById, setCurrentStore, isLoadingStores } = useStore();
  
  // Default to 'orders' tab, or read from URL query param if present
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [store, setStore] = useState(null);

  useEffect(() => {
    if (!isLoadingStores) {
      const currentStoreData = getStoreById(storeId);
      if (currentStoreData) {
        setStore(currentStoreData);
        setCurrentStore(currentStoreData); // Set in context if needed by dashboard tabs
      } else {
        console.error(`Store with ID ${storeId} not found.`);
        // Potentially navigate to an error page or dashboard home
      }
    }
  }, [storeId, getStoreById, setCurrentStore, isLoadingStores]);

  // Update activeTab if URL query param changes
  useEffect(() => {
    const currentQueryTab = queryParams.get('tab');
    if (currentQueryTab && currentQueryTab !== activeTab) {
      setActiveTab(currentQueryTab);
    }
  }, [location.search]);

  const renderTabContent = () => {
    // Pass store prop to tabs if they need store-specific data
    switch (activeTab) {
      case 'orders':
        return <OrdersTab store={store} />;
      case 'products':
        return <ProductsTab store={store} />;
      case 'customers':
        return <CustomersTab store={store} />;
      case 'payments':
        return <PaymentsTab store={store} />;
      case 'analytics':
        return <AnalyticsTab store={store} />;
      case 'marketing':
        return <MarketingTab store={store} />;
      case 'shipping':
        return <ShippingTab store={store} />;
      case 'settings':
        return <SettingsTab store={store} />;
      default:
        return <OrdersTab store={store} />; // Default to orders tab
    }
  };

  if (isLoadingStores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!store && !isLoadingStores) {
     return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Store Not Found</h2>
          <p className="text-muted-foreground">Could not load dashboard for store ID: {storeId}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} storeId={storeId}>
      {renderTabContent()}
    </DashboardLayout>
  );
};

export default StoreDashboardPage;
