import React from 'react';
import Header from '../sections/Header';
import Footer from '../sections/Footer';

const Layout = ({ children, storeData }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header storeData={storeData} />
      <main className="flex-1">
        {children}
      </main>
      <Footer storeData={storeData} />
    </div>
  );
};

export default Layout;
