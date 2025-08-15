import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const backgroundImageUrl = "https://static.wixstatic.com/media/bd2e29_c6677c7824044124b64fe765d0e9b88d~mv2.png";
const userProfileImageUrl = "https://inrveiaulksfmzsbyzqj.supabase.co/storage/v1/object/public/images/Profile.JPG"; // Replace with a default user icon

const LoginPage = ({ handleAuthAction, handleGoogleSignIn, error, isLogin, setIsLogin }) => {
  const [isClicked, setIsClicked] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    setIsClicked(true);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat p-4 transition-all duration-500"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          isClicked
            ? 'bg-black/30 backdrop-blur-2xl'
            : 'bg-black/50 backdrop-blur-none'
        }`}
      ></div>
      <div className="absolute top-5 left-5 z-20">
        <img src="https://static.wixstatic.com/media/bd2e29_20f2a8a94b7e492a9d76e0b8b14e623b~mv2.png" alt="Logo" className="w-12 h-12" />
      </div>
      <div className="relative z-10 flex flex-col items-center text-white">
        <div
          className="flex flex-col items-center cursor-pointer transition-all duration-500"
          onClick={handleProfileClick}
          style={{ transform: isClicked ? 'translateY(26px)' : 'translateY(0)' }}
        >
          <img
            src={userProfileImageUrl}
            alt="User Profile"
            className="w-24 h-24 rounded-full border-4 border-white/50 shadow-lg"
          />
          <h1 className="text-2xl font-semibold mt-4">Admin</h1>
        </div>

        <div
          className={`transition-opacity duration-500 ${
            isClicked ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isClicked && (
            <div className="mt-8 space-y-4 w-64">
              <p className="text-sm text-white/80 text-center">{isLogin ? 'Sign in to continue' : 'Create an account'}</p>
              <form
                onSubmit={(e) => {
                e.preventDefault();
                handleAuthAction(isLogin ? 'login' : 'signup', emailRef.current.value, passwordRef.current.value);
              }}
              className="space-y-4"
            >
              <input
                type="email"
                ref={emailRef}
                required
                className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Email"
              />
              <input
                type="password"
                ref={passwordRef}
                required
                className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Password"
              />
              <button
                type="submit"
                className="w-full bg-white/20 text-white py-2 rounded-md font-semibold hover:bg-white/30 transition-colors"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            {error && <p className="text-red-400 text-center mt-4">{error}</p>}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/30 text-white rounded-md">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-white/90 text-black py-2 rounded-md font-semibold hover:bg-white transition-colors"
            >
              <svg className="w-5 h-5" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                <g fill="none" fillRule="evenodd">
                  <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7777 2.7218v2.2582h2.9082c1.7018-1.5668 2.6836-3.8741 2.6836-6.621Z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.4673-.8055 5.9564-2.1818l-2.9082-2.2582c-.8055.5436-1.8368.8618-2.9945.8618-2.3127 0-4.2609-1.5668-4.9582-3.6709H1.0718v2.3318C2.5564 16.1632 5.5218 18 9 18Z" fill="#34A853"/>
                  <path d="M4.0418 10.7318c-.1164-.3464-.18-.7173-.18-1.0909 0-.3736.0636-.7445.18-1.0909V6.2182H1.0718C.3859 7.5614 0 9.0182 0 10.6409s.3859 3.0795 1.0718 4.4227l2.97-2.3318Z" fill="#FBBC05"/>
                  <path d="M9 3.5818c1.3218 0 2.5077.4559 3.4405 1.3468l2.5818-2.5818C13.4632.9918 11.43 0 9 0 5.5218 0 2.5564 1.8368 1.0718 4.5727l2.97 2.3318C4.7391 4.9855 6.6873 3.5818 9 3.5818Z" fill="#EA4335"/>
                </g>
              </svg>
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </button>

            <p className="text-center text-sm text-white/80 pt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white hover:underline font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
