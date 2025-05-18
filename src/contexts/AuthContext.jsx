import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ email: 'storeowner@example.com' }); // Mock user
  const [session, setSession] = useState({ access_token: 'mock_access_token' }); // Mock session
  const [subscriptionStatus, setSubscriptionStatus] = useState('active'); // Mock subscription status: 'active', 'free', etc.
  const [loading, setLoading] = useState(false); // Or true if you fetch on load

  // Add any auth logic here if needed in the future, e.g., fetching user from Supabase
  // For now, it's using mock data.

  const value = {
    user,
    session,
    subscriptionStatus,
    loading,
    // Add any functions like login, logout, etc. if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
