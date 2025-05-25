import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const StoreHeader = ({ store, isPublishedView = false }) => {
  const { name, theme, logo_url: logoUrl, id: storeId, settings } = store;
  const { cart, removeFromCart, updateQuantity, updateStoreTextContent } =
    useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const defaultLabels = ["Home", "Shop", "Our Story", "Contact"];
  const currentNavLinkLabels = store.content?.navLinkLabels || defaultLabels;

  const navLinks = [
    {
      href: basePath,
      label: currentNavLinkLabels[0] || defaultLabels[0],
      identifier: "content.navLinkLabels.0",
    },
    {
      href: `#products-${storeId}`,
      label: currentNavLinkLabels[1] || defaultLabels[1],
      identifier: "content.navLinkLabels.1",
    },
    {
      href: `#features-${storeId}`, // Assuming features can serve as 'Our Story'
      label: currentNavLinkLabels[2] || defaultLabels[2],
      identifier: "content.navLinkLabels.2",
    },
    {
      href: `#contact-${storeId}`, // Assuming a contact section will be added
      label: currentNavLinkLabels[3] || defaultLabels[3],
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

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300", // Adjusted duration
          isScrolled
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200/70 dark:border-slate-700/70 shadow-sm" // Softer shadow
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3"> {/* Adjusted padding */}
          <div className="flex items-center justify-between">
            <Link to={basePath} className="flex items-center gap-2.5 group"> {/* Adjusted gap */}
              {logoUrl && (
                <motion.div
                  className="relative overflow-hidden rounded-lg" // Softer rounding
                  whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"}}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    className="h-9 w-9 object-contain" // Slightly smaller logo
                  />
                </motion.div>
              )}
              <InlineTextEdit
                initialText={name}
                onSave={updateStoreTextContent}
                identifier="name"
                isPublishedView={isPublishedView}
                as="span"
                className="font-semibold text-lg tracking-normal bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-7"> {/* Adjusted gap */}
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.identifier}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 + 0.2 }} // Adjusted delay
                >
                  <InlineTextEdit
                    initialText={link.label}
                    onSave={updateStoreTextContent}
                    identifier={link.identifier}
                    isPublishedView={isPublishedView}
                    as="a"
                    href={link.href}
                    onClick={(e) => handleNavLinkClick(e, link.href)}
                    className="relative text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200 group"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-full" />
                  </InlineTextEdit>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center gap-2.5"> {/* Adjusted gap */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary-light"
                >
                  <Search className="h-[18px] w-[18px]" /> {/* Slightly smaller icons */}
                </Button>
              </motion.div>

              {(settings?.showThemeToggle ?? true) && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary-light"
                  >
                    {isDarkMode ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
                  </Button>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsCartOpen(true)}
                  className="relative rounded-lg bg-primary hover:bg-primary/90 text-white px-3.5 py-2 text-sm" // Adjusted padding and size
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu (simplified for brevity, can be expanded) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-slate-900 shadow-xl border-l dark:border-slate-700/50"
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-lg">{name}</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg"><X className="h-5 w-5" /></Button>
                </div>
                <nav className="space-y-2">
                  {navLinks.map((link) => (
                    <a key={link.identifier} href={link.href} onClick={(e) => handleNavLinkClick(e, link.href)}
                       className="block py-2 px-3 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary rounded-md transition-colors">
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer (simplified for brevity, can be expanded) */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-xl border-l dark:border-slate-700/50 flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b dark:border-slate-700/50">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-lg"><X className="h-5 w-5" /></Button>
              </div>
              {storeCartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <ShoppingCart className="h-10 w-10 text-slate-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Add items to get started.</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-5">
                    <div className="space-y-4">
                      {storeCartItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <img src={item.image?.src?.tiny || `https://via.placeholder.com/48x48.png?text=${item.name.charAt(0)}`} alt={item.name} className="w-12 h-12 object-cover rounded-md border dark:border-slate-700" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">${item.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6 mt-0.5 text-slate-400 hover:text-red-500" onClick={() => removeFromCart(item.id, storeId)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t dark:border-slate-700/50 p-5 space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-2.5" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoreHeader;
