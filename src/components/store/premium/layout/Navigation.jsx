import React from 'react';
import { motion } from 'framer-motion';
import InlineTextEdit from '../../../ui/InlineTextEdit'; // Adjusted path
import { useStore } from '../../../../contexts/StoreContext'; // Adjusted path

const Navigation = ({ navLinks, onNavLinkClick }) => {
  const { updateStoreTextContent } = useStore();

  if (!navLinks || navLinks.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-10">
      {navLinks.map((link, index) => (
        <motion.div
          key={link.identifier || link.label} // Use identifier or label as key
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <InlineTextEdit
            initialText={link.label}
            onSave={updateStoreTextContent}
            identifier={link.identifier}
            as="a"
            href={link.href}
            onClick={(e) => onNavLinkClick(e, link.href)}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 relative group premium-font-body"
          >
            {link.label}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:w-full" />
            <motion.div
              className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
              layoutId={`navHover-${link.identifier || index}`} // Make layoutId unique
            />
          </InlineTextEdit>
        </motion.div>
      ))}
    </nav>
  );
};

export default Navigation;
