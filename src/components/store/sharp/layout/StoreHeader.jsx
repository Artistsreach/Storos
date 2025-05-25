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
  Shield,
  Target,
  Crosshair,
} from "lucide-react";
import { Button } from "../../../ui/button"; // Corrected path
import { Switch } from "../../../ui/switch"; // Corrected path
import { useStore } from "../../../../contexts/StoreContext"; // Corrected path
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../../../ui/badge"; // Corrected path
import InlineTextEdit from "../../../ui/InlineTextEdit"; // Corrected path
import { ScrollArea } from "../../../ui/scroll-area"; // Corrected path
import { Separator } from "../../../ui/separator"; // Corrected path
import { cn } from "../../../../lib/utils"; // Corrected path

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
  const wishlistCount = 0; // Placeholder

  // Scroll animation for header
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);
  const headerBgOpacity = useTransform(scrollY, [0, 50], [0.8, 0.95]); // For bg opacity
  const headerBlur = useTransform(scrollY, [0, 50], [0, 10]); // Reduced blur

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 30); // Sticky sooner
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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
  const navLinkLabels = store?.content?.navLinkLabels || [
    "Home",
    "Products",
    "About",
    "Contact",
  ];

  const navLinks = [
    {
      href: basePath,
      label: navLinkLabels[0],
      identifier: "content.navLinkLabels.0",
    },
    {
      href: `#products-${storeId}`,
      label: navLinkLabels[1],
      identifier: "content.navLinkLabels.1",
    },
    {
      href: `#features-${storeId}`,
      label: navLinkLabels[2],
      identifier: "content.navLinkLabels.2",
    },
    {
      href: `#contact-${storeId}`, // Assuming a contact section might exist
      label: navLinkLabels[3],
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
        navigate(basePath); // Fallback to base path if element not found
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
     setIsSearchOpen(false); // Close search on submit
  };

  const handleSearchResultClick = (productId) => {
    setIsSearchOpen(false);
    setSearchTerm("");
    navigate(`${basePath}/product/${productId}`); // Navigate to product page
  };


  return (
    <>
      <motion.header
        style={{
          opacity: headerOpacity,
          // @ts-ignore
          "--header-bg-opacity": headerBgOpacity,
          backdropFilter: `blur(${headerBlur}px)`,
        }}
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300 border-b",
          isHeaderSticky
            ? "bg-slate-900/[var(--header-bg-opacity)] dark:bg-slate-950/[var(--header-bg-opacity)] shadow-md border-slate-700/60 py-3"
            : "bg-slate-900/80 dark:bg-slate-950/80 border-slate-700/40 py-4",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link to={basePath} className="flex items-center gap-2.5 group">
            {logoUrl && (
              <motion.img
                src={logoUrl}
                alt={`${name} logo`}
                className="h-10 w-10 object-contain rounded-md border-2 border-slate-700 group-hover:border-red-500 transition-colors"
                whileHover={{ scale: 1.05, rotate: -5 }}
              />
            )}
            <InlineTextEdit
              initialText={name}
              onSave={updateStoreTextContent}
              identifier="name"
              as="span"
              className="font-bold text-lg tracking-tighter text-slate-100 group-hover:text-red-400 transition-colors duration-300 font-mono uppercase"
            >
              {name}
            </InlineTextEdit>
            {/* The tagline was removed as per the general text update, if you want a generic one, it can be added here */}
            {/* <motion.div className="flex items-center gap-1 mt-0.5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Shield className="w-3 h-3 text-red-500" />
              <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Your Store Tagline</span>
            </motion.div> */}
          </Link>

          <nav className="hidden lg:flex items-center gap-x-6">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.identifier}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.2 }}
                className="relative group"
              >
                <InlineTextEdit
                  initialText={link.label}
                  onSave={updateStoreTextContent}
                  identifier={link.identifier}
                  as="a"
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className="text-xs font-semibold text-slate-300 hover:text-red-400 transition-colors duration-300 relative font-mono uppercase tracking-wider"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full" />
                </InlineTextEdit>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-400 hover:bg-slate-800/70 rounded-md border border-transparent hover:border-red-600/50"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            {(settings?.showThemeToggle ?? true) && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-yellow-400 hover:bg-slate-800/70 rounded-md border border-transparent hover:border-yellow-600/50"
                  onClick={toggleTheme}
                >
                  {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="relative flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white border-0 rounded-md px-3 sm:px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 font-mono text-xs sm:text-sm uppercase tracking-wide"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 sm:h-5 sm:w-5 bg-yellow-400 text-slate-900 text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
                <span className="hidden sm:inline">Cart</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-400 hover:bg-slate-800/70 rounded-md border border-transparent hover:border-red-600/50"
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md p-4 flex flex-col items-center justify-center"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-red-500" />
                  <h2 className="text-lg sm:text-xl font-bold text-white font-mono uppercase">Search Arsenal</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="rounded-md text-slate-400 hover:text-red-400">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleSearchSubmit} className="p-4 sm:p-6">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" />
                  <input
                    ref={searchInputRef} type="text" placeholder="Enter gear name or keyword..."
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 text-sm sm:text-base border-2 border-slate-700 rounded-md focus:outline-none focus:border-red-500 bg-slate-800 transition-colors text-white placeholder-slate-500 font-mono"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
              {searchTerm.trim() !== "" && (
                <ScrollArea className="max-h-[50vh] px-4 sm:px-6 pb-4 sm:pb-6">
                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((product) => (
                        <motion.div
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-700/70 rounded-md cursor-pointer transition-colors border border-slate-700 hover:border-red-600/50"
                          onClick={() => handleSearchResultClick(product.id)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <img src={product.image?.src?.tiny || `https://via.placeholder.com/40x40.png?text=${product.name.charAt(0)}`} alt={product.name} className="w-10 h-10 object-cover rounded-sm border border-slate-600" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white font-mono line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-slate-400 font-mono line-clamp-1">${product.price?.toFixed(2)}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-500" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-8 font-mono text-sm">No gear found matching "{searchTerm}".</p>
                  )}
                </ScrollArea>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed inset-0 z-[90] bg-slate-900 lg:hidden flex flex-col"
          >
            <div className="p-4 sm:p-6 flex justify-between items-center border-b border-slate-700">
              <Link to={basePath} className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                {logoUrl && <img src={logoUrl} alt={`${name} logo`} className="h-8 w-8 object-contain rounded-sm border border-slate-600" />}
                <span className="font-bold text-md text-white font-mono uppercase">{name}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-md text-slate-400 hover:text-red-400">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <nav className="flex flex-col gap-y-3">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.label} href={link.href} onClick={(e) => handleNavLinkClick(e, link.href)}
                    className="block py-3 px-3 text-md font-medium text-slate-200 hover:text-red-400 hover:bg-slate-800/70 rounded-md transition-colors font-mono uppercase tracking-wider"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              {(settings?.showThemeToggle ?? true) && (
                <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between">
                   <span className="text-sm text-slate-400 font-mono">Theme</span>
                  <Switch id={`mobile-theme-switcher-${storeId}`} checked={isDarkMode} onCheckedChange={toggleTheme} aria-label="Toggle theme" />
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed z-[100] inset-y-0 right-0 h-full w-full max-w-sm bg-slate-900 shadow-2xl flex flex-col border-l border-slate-700"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
                <h2 className="text-lg font-bold text-white font-mono uppercase">Mission Loadout</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-md text-slate-400 hover:text-red-400">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {storeCartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <ShoppingCart className="h-12 w-12 text-slate-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-1 font-mono">Cart Empty</h3>
                  <p className="text-slate-400 text-sm font-mono">No gear selected.</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4 sm:p-6">
                    <div className="space-y-4">
                      {storeCartItems.map((item) => (
                        <motion.div key={item.id} className="flex items-start gap-3 pb-4 border-b border-slate-700/50 last:border-0 last:pb-0"
                          initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                        >
                          <img src={item.image?.src?.tiny || `https://via.placeholder.com/64x64.png?text=${item.name.charAt(0)}`} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-slate-700" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white font-mono line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-slate-400 font-mono">${item.price.toFixed(2)} x {item.quantity}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Button variant="outline" size="icon" className="h-6 w-6 rounded-sm border-slate-600 text-slate-300 hover:text-red-400 hover:border-red-500" onClick={() => updateQuantity(item.id, storeId, item.quantity - 1)}><span className="text-sm">-</span></Button>
                              <span className="text-xs w-5 text-center font-medium text-white font-mono">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-6 w-6 rounded-sm border-slate-600 text-slate-300 hover:text-red-400 hover:border-red-500" onClick={() => updateQuantity(item.id, storeId, item.quantity + 1)}><span className="text-sm">+</span></Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                            <Button variant="ghost" size="icon" className="h-7 w-7 mt-1 text-slate-500 hover:text-red-500" onClick={() => removeFromCart(item.id, storeId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t border-slate-700 p-4 sm:p-6 space-y-4">
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="text-white font-semibold">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white border-0 rounded-md py-3 text-base font-medium font-mono uppercase tracking-wider" onClick={handleCheckout}>
                      Proceed to Debrief (Checkout)
                    </Button>
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
