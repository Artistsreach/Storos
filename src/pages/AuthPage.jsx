import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebaseClient';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeCredits } from '../lib/credits';
import LoginPage from './MacOS/LoginPage'; // Import the new LoginPage

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleAuthAction = async (actionType, email, password) => {
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      let userCredential;
      if (actionType === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'profiles', userCredential.user.uid), {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          role: 'store_owner',
          created_at: new Date(),
        });
        await initializeCredits(userCredential.user.uid);
      }
      navigate('/');
    } catch (e) {
      console.error('Authentication error (Email/Password):', e.message);
      setError(e.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'profiles', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'store_owner',
          created_at: new Date(),
        });
        await initializeCredits(user.uid);
      }
      navigate('/');
    } catch (e) {
      console.error('Google Sign-In error:', e.message);
      if (e.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In was cancelled. Please try again.');
      } else if (e.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Try signing in with your original method.');
      } else {
        setError(`Google Sign-In failed: ${e.message}`);
      }
    }
  };

  return (
    <LoginPage
      handleAuthAction={handleAuthAction}
      handleGoogleSignIn={handleGoogleSignIn}
      error={error}
      isLogin={isLogin}
      setIsLogin={setIsLogin}
    />
  );
}

export default AuthPage;
