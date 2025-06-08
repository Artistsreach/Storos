import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
// Fallback for motion components - use regular divs or elements
const motion = {
  header: ({ children, ...props }) => <header {...props}>{children}</header>,
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  button: ({ children, ...props }) => <button {...props}>{children}</button>,
  img: (props) => <img {...props} />,
  span: ({ children, ...props }) => <span {...props}>{children}</span>,
};
const AnimatePresence = ({ children }) => <>{children}</>;
// Mock useScroll and useTransform to return minimal functional mocks
const useScroll = () => {
  // Minimal mock for scrollY, returning a simple object with a get method
  // In a real scenario, you might want this to reflect actual scroll, but for disabling, 0 is fine.
  const scrollY = { get: () => 0, set: () => {} }; // Simplified mock
  return { scrollY };
};
const useTransform = (value, inputRange, outputRange) => {
  // Minimal mock for useTransform, returning an object with a get method that returns the initial output value
  const output = { get: () => outputRange[0], set: () => {} }; // Simplified mock
  return output;
};

import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Heart,
  Globe,
  ChevronDown,
  Sparkles,
  Zap,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import CartModal from "./CartModal";

const StoreHeader = ({ store, isPublishedView = false }) => {
  const { cart, updateStoreTextContent } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll(); // Will use the mocked version

  // Header background opacity based on scroll
  const headerOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]); // Will use the mocked version
  const headerBlur = useTransform(scrollY, [0, 100], [8, 20]); // Will use the mocked version

  // Store data with defaults
  const storeName = store?.name || "Modern Store";
  const storeId = store?.id || "modern-store";
  const primaryColor = store?.theme?.primaryColor || "#6366F1";
  // Use logoUrlLight and logoUrlDark from the store object
  const logoUrlLight = store?.logo_url_light || null; // For dark backgrounds
  const logoUrlDark = store?.logo_url_dark || null;   // For light backgrounds
  const [isDarkMode, setIsDarkMode] = useState(false); // Local state for theme

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Cart count
  const cartCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Navigation items
  const navItems = [
    { label: "Home", href: "#hero", icon: Sparkles },
    { label: "Products", href: "#products", icon: Star },
    { label: "Collections", href: "#collections", icon: Zap },
    { label: "About", href: "#about", icon: Globe },
  ];

  // Handle scroll effect & initial dark mode detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // Dark mode detection (similar to generic StoreHeader)
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      // This component does not seem to control the global dark class, so we won't add/remove it here.
    } else {
      setIsDarkMode(false);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle smooth scroll to sections
  const handleScrollTo = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMenuOpen(false);
  };

  // Animation variants
  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  const searchVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: "auto",
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <>
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "py-2 shadow-2xl border-b border-white/10"
            : "py-4 shadow-lg"
        } modern-header`}
        style={{
          backgroundColor: isDarkMode ? `rgba(17, 24, 39, ${headerOpacity.get()})` : `rgba(255, 255, 255, ${headerOpacity.get()})`,
          backdropFilter: `blur(${headerBlur.get()}px)`,
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/store/${storeId}`} className="flex items-center gap-3">
                {(isDarkMode ? logoUrlLight : logoUrlDark) ? (
                  <motion.img
                    src={isDarkMode ? logoUrlLight : logoUrlDark}
                    alt={storeName}
                    className="h-10 w-auto object-contain"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (logoUrlLight || logoUrlDark) ? ( // Fallback if one is missing
                  <motion.img
                    src={logoUrlLight || logoUrlDark}
                    alt={storeName}
                    className="h-10 w-auto object-contain"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : ( // Placeholder if no logos are set
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                    }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                )}
                <div className="flex flex-col">
                  <InlineTextEdit
                    initialText={storeName}
                    onSave={updateStoreTextContent}
                    identifier="name"
                    as="h1"
                    className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
                  >
                    {storeName}
                  </InlineTextEdit>
                  <motion.div
                    className="flex items-center gap-1 text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div
                      className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="font-medium">Premium Store</span>
                  </motion.div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    onClick={() => handleScrollTo(item.href)}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 relative overflow-hidden"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${primaryColor}20, ${primaryColor}10)`,
                      }}
                    />
                    <IconComponent className="w-4 h-4 relative z-10" />
                    <span className="font-medium relative z-10 tracking-wide">
                      {item.label}
                    </span>
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </motion.button>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      variants={searchVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="mr-2"
                    >
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-64"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Wishlist */}
              <motion.button
                className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass relative"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="w-5 h-5" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  0
                </motion.div>
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass"
                whileHover={{ scale: 1.1, rotate: isDarkMode ? 360 : -360 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isDarkMode ? (
                    <motion.div
                      key="moon"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Cart */}
              <motion.button
                onClick={() => setIsCartOpen(true)}
                className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                  >
                    {cartCount}
                  </motion.div>
                )}
              </motion.button>

              {/* User Account */}
              <motion.button
                className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <User className="w-5 h-5" />
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-20 left-6 right-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-6"
            >
              <nav className="space-y-4">
                {navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      variants={itemVariants}
                      onClick={() => handleScrollTo(item.href)}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-all duration-300 group"
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-lg tracking-wide">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Mobile Search */}
              <motion.div
                variants={itemVariants}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content overlap */}
      <div className="h-20" />

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default StoreHeader;
