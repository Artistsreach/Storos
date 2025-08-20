import React, { createContext, useContext, useState, useMemo } from 'react';

const PageMetaContext = createContext(null);

export const PageMetaProvider = ({ children }) => {
  const [isProfilePage, setIsProfilePage] = useState(false);

  const value = useMemo(() => ({ isProfilePage, setIsProfilePage }), [isProfilePage]);

  return (
    <PageMetaContext.Provider value={value}>
      {children}
    </PageMetaContext.Provider>
  );
};

export const usePageMeta = () => {
  const ctx = useContext(PageMetaContext);
  if (!ctx) {
    throw new Error('usePageMeta must be used within a PageMetaProvider');
  }
  return ctx;
};
