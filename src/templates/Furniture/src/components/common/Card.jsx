import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`
        bg-white rounded-xl shadow-lg hover:shadow-xl 
        transition-all duration-300 p-6
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
