import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebaseClient';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut
import { doc, getDoc, onSnapshot } from 'firebase/firestore'; // Import onSnapshot for real-time updates

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // Add profile state
  const [loading, setLoading] = useState(true); // Start with loading true - Corrected typo
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let profileUnsubscribe = () => {}; // Placeholder for profile listener unsubscribe

    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Set loading true at the start of auth state change
      setUser(currentUser);
      setSession(currentUser); // In Firebase, the user object often serves as the session

      // Clean up previous profile listener if it exists
      profileUnsubscribe();

      if (currentUser) {
        const profileRef = doc(db, 'profiles', currentUser.uid);
        // Listen for real-time updates to the profile
        profileUnsubscribe = onSnapshot(profileRef, (profileSnap) => {
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            setProfile(profileData);
            setUserRole(profileData?.role || 'store_owner');
            console.log('AuthContext: Profile updated from snapshot:', profileData);
          } else {
            console.warn('AuthContext: No profile found for user:', currentUser.uid);
            setProfile(null);
            setUserRole('store_owner'); // Assume 'store_owner' if no profile exists yet
          }
          setLoading(false); // Set loading false after profile is processed
        }, (error) => {
          console.error('AuthContext: Error listening to profile:', error.message);
          setProfile(null);
          setUserRole(null);
          setLoading(false); // Set loading false on error too
        });
      } else {
        setProfile(null);
        setUserRole(null);
        setLoading(false); // Set loading false if no user
      }
    });

    return () => {
      authUnsubscribe();
      profileUnsubscribe(); // Unsubscribe from profile listener on cleanup
    };
  }, []);

  // isAuthenticated is derived from session and user state
  const isAuthenticated = !!session && !!user;

  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting user, profile, etc. to null
      console.log("User signed out successfully.");
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, handle sign-out errors (e.g., display a toast)
    }
  };

  const value = {
    user,
    session,
    profile, // Add profile to context value
    isAuthenticated,
    userRole,
    loadingRole: loading, // Corresponds to 'loadingRole' in ProtectedRoute
    logout, // Add logout function to context
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
