import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const FollowListModal = ({ isOpen, onClose, type, users }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold capitalize">{type}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {users.length > 0 ? (
              users.map(user => (
                <div key={user.id} className="flex items-center space-x-4">
                  <img src={user.profilePhoto || 'https://via.placeholder.com/150'} alt={user.username} className="w-12 h-12 rounded-full" />
                  <div>
                    <Link to={`/${user.username}`} onClick={onClose} className="font-bold hover:underline">
                      {user.username}
                    </Link>
                    <p className="text-sm text-gray-500">{user.bio}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No users to display.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FollowListModal;
