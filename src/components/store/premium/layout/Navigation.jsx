import React from 'react';
import { motion } from 'framer-motion';
import InlineTextEdit from '../../../ui/InlineTextEdit'; // Adjusted path
import { useStore } from '../../../../contexts/StoreContext'; // Adjusted path

const Navigation = ({ navLinks, onNavLinkClick, store: storeProp }) => { // Added storeProp
  const { updateStoreTextContent, store: contextStore } = useStore(); // Get store from context for theme
  const store = contextStore || storeProp; // Prioritize contextStore

  const primaryColor = store?.theme?.primaryColor || "#6366F1"; // Default if no theme

  // Helper function to generate a slightly darker shade
  const getDarkerShade = (color, percent = 20) => {
    if (!color.startsWith("#")) return color;
    let num = parseInt(color.slice(1), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    R = Math.max(0, R); G = Math.max(0, G); B = Math.max(0, B);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };
  const secondaryColor = getDarkerShade(primaryColor, 20);

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
            className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 relative group premium-font-body"
            style={{ '--hover-text-color': primaryColor, '--dark-hover-text-color': secondaryColor }}
            onMouseEnter={(e) => e.currentTarget.style.color = document.documentElement.classList.contains('dark') ? secondaryColor : primaryColor}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            {link.label}
            <span
              className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
              style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            />
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
              style={{ backgroundColor: `${primaryColor}1A` }}
              layoutId={`navHover-${link.identifier || index}`} // Make layoutId unique
            />
          </InlineTextEdit>
        </motion.div>
      ))}
    </nav>
  );
};

export default Navigation;
