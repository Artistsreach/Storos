import React from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-sm w-full text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Create Unlimited Stores</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sign up or log in to create more stores and unlock all features.
        </p>
        <div className="flex flex-col gap-4">
          <Link to="/auth">
            <Button size="lg" className="w-full">Sign Up</Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="lg" className="w-full">Log In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
