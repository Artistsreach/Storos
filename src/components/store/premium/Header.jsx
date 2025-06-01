import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Trash2,
  Sun,
  Moon,
  Heart,
  User,
  ChevronDown,
  Bell,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import { useStore } from "../../../contexts/StoreContext"; // Adjusted path
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../../ui/badge"; // Adjusted path
import InlineTextEdit from "../../ui/InlineTextEdit";
import { ScrollArea } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";
import { cn } from "../../../lib/utils";

const Header = ({ store, isPublishedView = false }) => {
  const { 
    name, 
    theme: storeTheme, 
    logo_url_light: logoUrlLight, // For dark backgrounds
    logo_url_dark: logoUrlDark,   // For light backgrounds
    id: storeId, 
    settings 
  } = store;
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateStoreTextContent,
    viewMode,
    store: contextStore, // Get store from context for theme
  } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const theme = contextStore?.theme || storeTheme; // Prioritize contextStore theme
  const primaryColor = theme?.primaryColor || "#6366F1";

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const storeCartItems = cart.filter((item) => item.storeId === storeId);
  const cartItemCount = storeCartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const cartTotal = storeCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const wishlistCount = 0;

  // Scroll animation for header
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 50], [0, 20]);

  // Handle scroll events to make header sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() && store.products) {
      const results = store.products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, store.products]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const basePath = `/store/${storeId}`;

  // Use navLinkLabels from store.content if available, otherwise default
  const navLinkLabels = store?.content?.navLinkLabels || [
    "Home",
    "Products",
    "Features",
    "Contact",
  ];

  const navLinks = [
    {
      href: basePath,
      label: navLinkLabels[0] || "Home",
      identifier: "content.navLinkLabels.0",
    },
    {
      href: `#products-${storeId}`,
      label: navLinkLabels[1] || "Products",
      identifier: "content.navLinkLabels.1",
    },
    {
      href: `#features-${storeId}`,
      label: navLinkLabels[2] || "Features",
      identifier: "content.navLinkLabels.2",
    },
    {
      href: `#contact-${storeId}`,
      label: navLinkLabels[3] || "Contact",
      identifier: "content.navLinkLabels.3",
    },
  ];

  const handleNavLinkClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (href.startsWith("/store/")) {
      navigate(href);
    } else {
      const elementId = href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(basePath);
      }
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout", {
      state: { cart: storeCartItems, storeName: name, storeId: storeId },
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const productsSection = document.getElementById(`products-${storeId}`);
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearchResultClick = (productId) => {
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  return (
    <>
      <motion.header
        style={{
          opacity: headerOpacity,
          backdropFilter: `blur(${headerBlur}px)`,
        }}
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500 premium-header",
          isHeaderSticky
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-b border-gray-200/20 dark:border-gray-700/20 py-3"
            : "bg-transparent py-6",
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to={basePath} className="flex items-center gap-3 group">
            {(isDarkMode ? logoUrlLight : logoUrlDark) ? (
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div
                  className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                />
                <img
                  src={isDarkMode ? logoUrlLight : logoUrlDark}
                  alt={`${name} logo`}
                  className="h-12 w-12 object-contain relative z-10 rounded-full"
                />
              </motion.div>
            ) : (logoUrlLight || logoUrlDark) ? ( // Fallback
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                 <img
                  src={logoUrlLight || logoUrlDark}
                  alt={`${name} logo (fallback)`}
                  className="h-12 w-12 object-contain relative z-10 rounded-full"
                />
              </motion.div>
            ) : null}
            <InlineTextEdit
              initialText={name}
              onSave={updateStoreTextContent}
              identifier="name"
              as="span"
              className="font-bold text-2xl tracking-tight bg-clip-text text-transparent premium-font-display transition-all duration-300"
              style={{
                backgroundImage: `linear-gradient(to right, ${document.documentElement.classList.contains('dark') ? '#FFFFFF' : '#1F2937'}, ${document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#4B5563'})`,
                '--group-hover-image': `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundImage = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundImage = `linear-gradient(to right, ${document.documentElement.classList.contains('dark') ? '#FFFFFF' : '#1F2937'}, ${document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#4B5563'})`}
            >
              {name}
            </InlineTextEdit>
          </Link>

          <nav className="hidden lg:flex items-center gap-x-10">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.identifier}
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
                  onClick={(e) => handleNavLinkClick(e, link.href)}
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
                    layoutId={`navHover-${link.identifier}`}
                  />
                </InlineTextEdit>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Search button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400 transition-all duration-300 rounded-full"
                style={{ '--hover-text-color': primaryColor, '--dark-hover-text-color': secondaryColor, '--hover-bg-color': `${primaryColor}1A` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = document.documentElement.classList.contains('dark') ? secondaryColor : primaryColor;
                  e.currentTarget.style.backgroundColor = `${primaryColor}1A`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Wishlist button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex text-gray-600 dark:text-gray-400 transition-all duration-300 relative rounded-full"
                style={{ '--hover-text-color': secondaryColor, '--dark-hover-text-color': primaryColor, '--hover-bg-color': `${secondaryColor}1A` }} // Using secondary for pink-like
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = document.documentElement.classList.contains('dark') ? primaryColor : secondaryColor;
                  e.currentTarget.style.backgroundColor = `${secondaryColor}1A`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold" // Keep this as is for high visibility
                  >
                    {wishlistCount}
                  </motion.div>
                )}
              </Button>
            </motion.div>

            {/* Theme toggle */}
            {(settings?.showThemeToggle ?? true) && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-300 rounded-full"
                  onClick={toggleTheme}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDarkMode ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDarkMode ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            )}

            {/* Cart button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="relative flex items-center gap-2 text-white border-0 rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                onMouseEnter={(e) => {
                  const hoverPrimary = getDarkerShade(primaryColor, -15); // Explicitly lighten for hover
                  const hoverSecondary = getDarkerShade(secondaryColor, -15); // Explicitly lighten for hover
                  e.currentTarget.style.background = `linear-gradient(to right, ${hoverPrimary}, ${hoverSecondary})`;
                }}
                onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`}
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg" // Keep this as is for high visibility
                  >
                    {cartItemCount}
                  </motion.div>
                )}
                <span className="ml-1 hidden sm:inline font-medium premium-font-body">
                  Cart
                </span>
              </Button>
            </motion.div>

            {/* Mobile menu button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-600 dark:text-gray-400 transition-all duration-300 rounded-full"
                style={{ '--hover-text-color': primaryColor, '--dark-hover-text-color': secondaryColor, '--hover-bg-color': `${primaryColor}1A` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = document.documentElement.classList.contains('dark') ? secondaryColor : primaryColor;
                  e.currentTarget.style.backgroundColor = `${primaryColor}1A`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md p-4 flex flex-col"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="container mx-auto pt-20 max-w-4xl"
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-8 border-b border-gray-200 dark:border-gray-700">
                  <h2
                    className="text-2xl font-bold premium-font-display bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    Search Products
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(false)}
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <form onSubmit={handleSearchSubmit} className="p-8">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for products..."
                      className="w-full pl-16 pr-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none bg-gray-50 dark:bg-gray-800 transition-all duration-300 premium-font-body"
                      style={{ '--focus-border-color': primaryColor }}
                      onFocus={(e) => e.target.style.borderColor = primaryColor}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>

                {searchTerm.trim() !== "" && (
                  <div className="px-8 pb-8 max-h-96 overflow-auto">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 premium-font-body">
                      {searchResults.length > 0
                        ? `Found ${searchResults.length} results for "${searchTerm}"`
                        : `No results found for "${searchTerm}"`}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {searchResults.map((product) => (
                        <motion.div
                          key={product.id}
                          className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                          whileHover={{ y: -5 }}
                          onClick={() => handleSearchResultClick(product.id)}
                        >
                          <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                            {product.image?.src?.medium ? (
                              <img
                                src={product.image.src.medium}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-4xl font-bold premium-font-display"
                                style={{ background: `linear-gradient(to bottom right, ${primaryColor}1A, ${secondaryColor}1A)`, color: primaryColor }}
                              >
                                {product.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold line-clamp-1 premium-font-body text-gray-900 dark:text-white">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 premium-font-body">
                              {product.description}
                            </p>
                            <p
                              className="font-bold mt-2 text-lg bg-clip-text text-transparent premium-font-body"
                              style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                            >
                              ${product.price?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 lg:hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <Link
                  to={basePath}
                  className="flex items-center gap-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {(isDarkMode ? logoUrlLight : logoUrlDark) ? (
                    <img
                      src={isDarkMode ? logoUrlLight : logoUrlDark}
                      alt={`${name} logo`}
                      className="h-10 w-10 object-contain rounded-full"
                    />
                  ) : (logoUrlLight || logoUrlDark) ? (
                     <img
                      src={logoUrlLight || logoUrlDark}
                      alt={`${name} logo (fallback)`}
                      className="h-10 w-10 object-contain rounded-full"
                    />
                  ) : null}
                  <span
                    className="font-bold text-xl premium-font-display bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    {name}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <nav className="flex flex-col gap-y-6">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavLinkClick(e, link.href)}
                    className="text-lg font-medium text-gray-900 dark:text-white transition-colors premium-font-body"
                    style={{ '--hover-text-color': primaryColor, '--dark-hover-text-color': secondaryColor }}
                    onMouseEnter={(e) => e.currentTarget.style.color = document.documentElement.classList.contains('dark') ? secondaryColor : primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              {/* Theme toggle for mobile */}
              {(settings?.showThemeToggle ?? true) && (
                <div className="flex items-center gap-3 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <Switch
                    id={`mobile-store-theme-switcher-${storeId}`}
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                    aria-label="Toggle dark mode"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 premium-font-body">
                    {isDarkMode ? "Dark Mode" : "Light Mode"}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed z-50 inset-y-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2
                  className="text-xl font-bold premium-font-display bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                >
                  Your Cart
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {storeCartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="mb-6"
                  >
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                      style={{ background: `linear-gradient(to bottom right, ${primaryColor}1A, ${secondaryColor}1A)` }}
                    >
                      <ShoppingCart className="h-12 w-12" style={{ color: primaryColor }} />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 premium-font-display text-gray-900 dark:text-white">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 premium-font-body">
                    Looks like you haven't added anything yet.
                  </p>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    className="text-white border-0 rounded-full px-8 py-3 text-lg font-medium premium-font-body"
                    style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${getDarkerShade(primaryColor, -10)}, ${getDarkerShade(secondaryColor, -10)})`}
                    onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                      {storeCartItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                            <img
                              src={
                                item.image?.src?.tiny ||
                                item.image?.src?.medium ||
                                `https://via.placeholder.com/80x80.png?text=${item.name.substring(0, 1)}`
                              }
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold line-clamp-1 premium-font-body text-gray-900 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 premium-font-body">
                              ${item.price.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-gray-300 dark:border-gray-600"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    storeId,
                                    item.quantity - 1,
                                  )
                                }
                              >
                                <span className="text-lg leading-none">-</span>
                              </Button>
                              <span className="text-sm w-6 text-center font-medium premium-font-body">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-gray-300 dark:border-gray-600"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    storeId,
                                    item.quantity + 1,
                                  )
                                }
                              >
                                <span className="text-lg leading-none">+</span>
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold premium-font-body text-gray-900 dark:text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 mt-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                              onClick={() => removeFromCart(item.id, storeId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm premium-font-body">
                        <span className="text-gray-600 dark:text-gray-400">
                          Subtotal
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm premium-font-body">
                        <span className="text-gray-600 dark:text-gray-400">
                          Shipping
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          Calculated at checkout
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 dark:border-gray-700 premium-font-body">
                        <span className="text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span
                          className="bg-clip-text text-transparent"
                          style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                        >
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full text-white border-0 rounded-full py-4 text-lg font-medium premium-font-body shadow-lg hover:shadow-xl transition-all duration-300"
                      style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                      onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${getDarkerShade(primaryColor, -10)}, ${getDarkerShade(secondaryColor, -10)})`}
                      onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`}
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 premium-font-body">
                      Shipping and taxes calculated at checkout.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header; // Renamed component
