import React from 'react';
import { motion } from 'framer-motion';

const Notifications = ({ notifications, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg dark:text-white">Notifications</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          &times;
        </button>
      </div>
      <div>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className="border-b border-gray-200 dark:border-gray-700 py-2">
              <p className="text-sm dark:text-gray-300">{notification.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(notification.timestamp.seconds * 1000).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No new notifications.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
