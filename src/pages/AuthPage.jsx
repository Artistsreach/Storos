import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebaseClient';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Logos and Background Image
const logoForLightMode = "https://firebasestorage.googleapis.com/v0/b/themeforge-hui99.firebasestorage.app/o/ffwhite.png?alt=media&token=a2ebe18b-109c-4c55-b9e1-ec226a788632"; // White logo for dark backgrounds
const logoForDarkMode = "https://firebasestorage.googleapis.com/v0/b/themeforge-hui99.firebasestorage.app/o/Ffblack%20(1).png?alt=media&token=cd13601d-6e44-41b9-9e25-35b6f510f99a"; // Black logo for light backgrounds
const backgroundImageUrl = "https://firebasestorage.googleapis.com/v0/b/themeforge-hui99.firebasestorage.app/o/Freshbg.png?alt=media&token=49d21eaa-1fd6-42d7-ae66-43067fb1f536";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
    // No need for a listener on prefers-color-scheme change for this page,
    // as it's typically viewed once. Theme toggle is in Header.
  }, []);

  const handleAuthAction = async (actionType) => {
    setError('');
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

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
        // Create a user profile in Firestore upon signup
        await setDoc(doc(db, 'profiles', userCredential.user.uid), {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          role: 'store_owner', // Default role
          created_at: new Date(),
        });
      }
      navigate('/'); // Redirect to home or dashboard on success
    } catch (e) {
      console.error('Authentication error:', e.message);
      setError(e.message);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div
        className="w-full max-w-md p-8 md:p-10 space-y-6
                   bg-white/10 dark:bg-black/30 backdrop-blur-lg
                   shadow-2xl rounded-xl border border-white/20 dark:border-black/20"
      >
        <div className="flex justify-center mb-6">
          <img src={isDarkMode ? logoForLightMode : logoForDarkMode} alt="FreshFront Logo" className="h-12 w-auto" />
        </div>

        <h2 className="text-center text-3xl font-extrabold text-white mb-6">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(isLogin ? 'login' : 'signup'); }} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              ref={emailRef}
              required
              className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              ref={passwordRef}
              required
              className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-white pt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
