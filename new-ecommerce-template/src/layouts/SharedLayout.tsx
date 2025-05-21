import React from 'react';
import Header from '../components/layout/Header'; // Changed to relative path
import Footer from '../components/layout/Footer'; // Changed to relative path
import { Toaster } from "../components/ui/toaster"; // Changed to relative path

interface SharedLayoutProps {
  children: React.ReactNode;
  storeName?: string;
  logoUrl?: string;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ children, storeName, logoUrl }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header storeName={storeName} logoUrl={logoUrl} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <Toaster /> {/* Add Toaster here */}
    </div>
  );
};

export default SharedLayout;
