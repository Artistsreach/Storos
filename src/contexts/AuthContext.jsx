import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ensure this path is correct

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    setLoading(true); // Start with loading true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        // Placeholder role assignment; adjust if actual role logic is more complex
        setUserRole(currentSession?.user ? 'store_owner' : null);
        setLoading(false); // Auth state resolved, set loading to false
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // isAuthenticated is derived from session and user state
  const isAuthenticated = !!session && !!user;

  const value = {
    user,
    session,
    isAuthenticated,
    userRole,
    loadingRole: loading, // Corresponds to 'loadingRole' in ProtectedRoute
    // Mock subscriptionStatus for now, can be integrated later
    subscriptionStatus: 'active', 
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
