import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebaseClient';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Logos and Background Image
const fixedLogoUrl = "https://static.wixstatic.com/media/bd2e29_20f2a8a94b7e492a9d76e0b8b14e623b~mv2.png";
const backgroundImageUrl = "https://static.wixstatic.com/media/bd2e29_c6677c7824044124b64fe765d0e9b88d~mv2.png";

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

      // Check if user profile already exists, if not, create it
      const userDocRef = doc(db, 'profiles', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'store_owner', // Default role
          created_at: new Date(),
        });
      }
      navigate('/'); // Redirect to home or dashboard on success
    } catch (e) {
      console.error('Google Sign-In error:', e.message);
      // Handle specific Google auth errors if needed
      if (e.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In was cancelled. Please try again.');
      } else if (e.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Try signing in with your original method.');
      }
      else {
        setError(`Google Sign-In failed: ${e.message}`);
      }
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
          <img src={fixedLogoUrl} alt="FreshFront Logo" className="h-12 w-auto" />
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
            className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/10 dark:bg-black/30 text-white rounded-md">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 bg-white/90 dark:bg-white/10 text-black dark:text-white py-3 rounded-md font-semibold hover:bg-white dark:hover:bg-white/20 transition-colors border border-white/20"
          >
            <svg className="w-5 h-5" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
              <g fill="none" fill-rule="evenodd">
                <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7777 2.7218v2.2582h2.9082c1.7018-1.5668 2.6836-3.8741 2.6836-6.621Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.4673-.8055 5.9564-2.1818l-2.9082-2.2582c-.8055.5436-1.8368.8618-2.9945.8618-2.3127 0-4.2609-1.5668-4.9582-3.6709H1.0718v2.3318C2.5564 16.1632 5.5218 18 9 18Z" fill="#34A853"/>
                <path d="M4.0418 10.7318c-.1164-.3464-.18-.7173-.18-1.0909 0-.3736.0636-.7445.18-1.0909V6.2182H1.0718C.3859 7.5614 0 9.0182 0 10.6409s.3859 3.0795 1.0718 4.4227l2.97-2.3318Z" fill="#FBBC05"/>
                <path d="M9 3.5818c1.3218 0 2.5077.4559 3.4405 1.3468l2.5818-2.5818C13.4632.9918 11.43 0 9 0 5.5218 0 2.5564 1.8368 1.0718 4.5727l2.97 2.3318C4.7391 4.9855 6.6873 3.5818 9 3.5818Z" fill="#EA4335"/>
              </g>
            </svg>
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>
        </div>

        <p className="text-center text-sm text-white pt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white hover:underline font-medium"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
