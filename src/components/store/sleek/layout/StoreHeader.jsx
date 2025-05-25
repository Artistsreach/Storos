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
  Bell,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/contexts/StoreContext";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const StoreHeader = ({ store, isPublishedView = false }) => {
  const { name, theme, logo_url: logoUrl, id: storeId, settings } = store;
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateStoreTextContent,
    viewMode,
  } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
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
  const headerOpacity = useTransform(scrollY, [0, 50], [0.95, 0.98]);
  const headerBlur = useTransform(scrollY, [0, 50], [8, 24]);
  const headerScale = useTransform(scrollY, [0, 50], [1, 0.98]);

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
    "Collections",
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
      href: `#collections-${storeId}`,
      label: navLinkLabels[2] || "Collections",
      identifier: "content.navLinkLabels.2",
    },
    {
      href: `#features-${storeId}`,
      label: navLinkLabels[3] || "Features",
      identifier: "content.navLinkLabels.3",
    },
    {
      href: `#contact-${storeId}`,
      label: navLinkLabels[4] || "Contact",
      identifier: "content.navLinkLabels.4",
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
          scale: headerScale,
        }}
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-700 border-b-0.5",
          isHeaderSticky
            ? "bg-white/10 dark:bg-black/10 backdrop-blur-3xl shadow-glass border-white/20 dark:border-white/10 py-2"
            : "bg-white/5 dark:bg-black/5 backdrop-blur-lg border-white/10 dark:border-white/5 py-4",
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to={basePath} className="flex items-center gap-3 group">
            {logoUrl && (
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, rotateY: 15 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-2">
                  <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    className="h-10 w-10 object-contain relative z-10"
                  />
                </div>
              </motion.div>
            )}
            <div className="flex flex-col">
              <InlineTextEdit
                initialText={name}
                onSave={updateStoreTextContent}
                identifier="name"
                as="span"
                className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 font-inter"
                style={{ color: theme.primaryColor }}
              >
                {name}
              </InlineTextEdit>
              <motion.div
                className="flex items-center gap-1 mt-0.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-3 h-3 text-primary/60" />
                <span className="text-xs font-medium text-muted-foreground font-inter tracking-wide">
                  Premium Collection
                </span>
              </motion.div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-x-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.identifier}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <InlineTextEdit
                  initialText={link.label}
                  onSave={updateStoreTextContent}
                  identifier={link.identifier}
                  as="a"
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative font-inter tracking-wide"
                  style={{ "--hover-color": theme.primaryColor }}
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                    style={{ backgroundColor: theme.primaryColor }}
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </InlineTextEdit>
              </motion.div>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Search button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-white/10 dark:hover:bg-black/10 backdrop-blur-md transition-all duration-300 border border-white/10 dark:border-white/5"
                onClick={() => setIsSearchOpen(true)}
                style={{ "--hover-color": theme.primaryColor }}
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Wishlist button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex text-muted-foreground hover:text-primary hover:bg-white/10 dark:hover:bg-black/10 backdrop-blur-md transition-all duration-300 relative border border-white/10 dark:border-white/5"
                style={{ "--hover-color": theme.primaryColor }}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-primary to-secondary text-white text-xs flex items-center justify-center font-bold backdrop-blur-md"
                    style={{
                      backgroundColor:
                        theme.secondaryColor || theme.primaryColor,
                    }}
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
                  className="hidden sm:flex text-muted-foreground hover:text-primary hover:bg-white/10 dark:hover:bg-black/10 backdrop-blur-md transition-all duration-300 border border-white/10 dark:border-white/5"
                  onClick={toggleTheme}
                  style={{ "--hover-color": theme.primaryColor }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDarkMode ? 180 : 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
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
                className="relative flex items-center gap-2 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-foreground border border-white/20 dark:border-white/10 backdrop-blur-md px-6 py-2 shadow-glass hover:shadow-glass-inset transition-all duration-300 font-inter font-medium tracking-wide"
                onClick={() => setIsCartOpen(true)}
                style={{
                  borderColor: `${theme.primaryColor}40`,
                  color: theme.primaryColor,
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-primary to-secondary text-white text-xs flex items-center justify-center font-bold backdrop-blur-md"
                    style={{
                      backgroundColor:
                        theme.secondaryColor || theme.primaryColor,
                    }}
                  >
                    {cartItemCount}
                  </motion.div>
                )}
                <span className="ml-1 hidden sm:inline">Cart</span>
              </Button>
            </motion.div>

            {/* Mobile menu button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-muted-foreground hover:text-primary hover:bg-white/10 dark:hover:bg-black/10 backdrop-blur-md transition-all duration-300 border border-white/10 dark:border-white/5"
                onClick={() => setIsMobileMenuOpen(true)}
                style={{ "--hover-color": theme.primaryColor }}
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
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xl p-4 flex flex-col"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="container mx-auto pt-20 max-w-4xl"
            >
              <div className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl shadow-glass border border-white/20 dark:border-white/10 overflow-hidden">
                <div className="flex justify-between items-center p-8 border-b border-white/10 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground font-inter tracking-tight">
                      Search Products
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(false)}
                    className="hover:bg-white/10 dark:hover:bg-black/10 text-muted-foreground hover:text-primary backdrop-blur-md"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <form onSubmit={handleSearchSubmit} className="p-8">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for products..."
                      className="w-full pl-16 pr-6 py-4 text-lg border border-white/20 dark:border-white/10 focus:outline-none focus:border-primary/50 bg-white/5 dark:bg-black/5 backdrop-blur-md transition-all duration-300 text-foreground font-inter"
                      style={{
                        borderColor: `${theme.primaryColor}30`,
                      }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>

                {searchTerm.trim() !== "" && (
                  <div className="px-8 pb-8 max-h-96 overflow-auto">
                    <h3 className="text-sm font-medium text-muted-foreground mb-6 font-inter tracking-wide">
                      {searchResults.length > 0
                        ? `Found ${searchResults.length} results for "${searchTerm}"`
                        : `No products found for "${searchTerm}"`}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {searchResults.map((product) => (
                        <motion.div
                          key={product.id}
                          className="bg-white/5 dark:bg-black/5 backdrop-blur-md overflow-hidden hover:shadow-glass transition-all duration-300 cursor-pointer group border border-white/10 dark:border-white/5 hover:border-primary/30"
                          whileHover={{ y: -5, scale: 1.02 }}
                          onClick={() => handleSearchResultClick(product.id)}
                        >
                          <div className="aspect-square bg-white/5 dark:bg-black/5 relative overflow-hidden">
                            {product.image?.src?.medium ? (
                              <img
                                src={product.image.src.medium}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5 dark:bg-black/5 text-muted-foreground text-4xl font-bold font-inter">
                                {product.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold line-clamp-1 text-foreground font-inter">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {product.description}
                            </p>
                            <p
                              className="font-bold mt-2 text-lg font-inter"
                              style={{ color: theme.primaryColor }}
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
            className="fixed inset-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-3xl lg:hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <Link
                  to={basePath}
                  className="flex items-center gap-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {logoUrl && (
                    <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-2">
                      <img
                        src={logoUrl}
                        alt={`${name} logo`}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                  )}
                  <span
                    className="font-bold text-xl text-foreground font-inter tracking-tight"
                    style={{ color: theme.primaryColor }}
                  >
                    {name}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-primary backdrop-blur-md"
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
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors font-inter tracking-wide"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ "--hover-color": theme.primaryColor }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              {/* Theme toggle for mobile */}
              {(settings?.showThemeToggle ?? true) && (
                <div className="flex items-center gap-3 mt-8 pt-8 border-t border-white/10 dark:border-white/5">
                  <Switch
                    id={`mobile-store-theme-switcher-${storeId}`}
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                    aria-label="Toggle dark mode"
                  />
                  <span className="text-sm text-muted-foreground font-inter">
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
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xl"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed z-50 inset-y-0 right-0 h-full w-full max-w-md bg-white/10 dark:bg-black/10 backdrop-blur-3xl shadow-float-lg flex flex-col border-l border-white/20 dark:border-white/10"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-white/5">
                <h2 className="text-xl font-bold text-foreground font-inter tracking-tight">
                  Shopping Cart
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(false)}
                  className="text-muted-foreground hover:text-primary backdrop-blur-md"
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
                    <div className="w-24 h-24 bg-white/10 dark:bg-black/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 dark:border-white/10">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground font-inter">
                    Your cart is empty
                  </h3>
                  <p className="text-muted-foreground mb-8 font-inter">
                    Discover amazing products to add to your collection.
                  </p>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-foreground border border-white/20 dark:border-white/10 backdrop-blur-md px-8 py-3 text-lg font-medium font-inter tracking-wide"
                    style={{
                      borderColor: `${theme.primaryColor}40`,
                      color: theme.primaryColor,
                    }}
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
                          className="flex items-start gap-4 pb-4 border-b border-white/10 dark:border-white/5 last:border-0"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="relative w-20 h-20 bg-white/5 dark:bg-black/5 backdrop-blur-md overflow-hidden border border-white/10 dark:border-white/5">
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
                            <h3 className="font-semibold line-clamp-1 text-foreground font-inter">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 font-inter">
                              ${item.price.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-white/20 dark:border-white/10 text-muted-foreground hover:text-primary hover:border-primary/50 backdrop-blur-md"
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
                              <span className="text-sm w-6 text-center font-medium text-foreground font-inter">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-white/20 dark:border-white/10 text-muted-foreground hover:text-primary hover:border-primary/50 backdrop-blur-md"
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
                            <p className="font-semibold text-foreground font-inter">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 backdrop-blur-md"
                              onClick={() => removeFromCart(item.id, storeId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t border-white/10 dark:border-white/5 p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-inter">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-inter">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-foreground">
                          Calculated at checkout
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t border-white/10 dark:border-white/5 font-inter">
                        <span className="text-foreground">Total</span>
                        <span
                          className="font-bold"
                          style={{ color: theme.primaryColor }}
                        >
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-foreground border border-white/20 dark:border-white/10 backdrop-blur-md py-4 text-lg font-medium font-inter tracking-wide shadow-glass hover:shadow-glass-inset transition-all duration-300"
                      onClick={handleCheckout}
                      style={{
                        borderColor: `${theme.primaryColor}40`,
                        color: theme.primaryColor,
                      }}
                    >
                      Proceed to Checkout
                    </Button>
                    <p className="text-xs text-center text-muted-foreground font-inter">
                      Secure checkout with SSL encryption.
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

export default StoreHeader;
