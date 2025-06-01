import React from "react";
// import { motion } from "framer-motion";
// Fallback for motion components
const motion = {
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  button: ({ children, ...props }) => <button {...props}>{children}</button>,
  a: ({ children, ...props }) => <a {...props}>{children}</a>,
  li: ({ children, ...props }) => <li {...props}>{children}</li>, // Added li
  // Add other motion elements as needed
};

import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Heart,
  ArrowUp,
  Sparkles,
  Star,
  Shield,
  Truck,
  CreditCard,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";

const Footer = ({ store, isPublishedView = false }) => {
  const { updateStoreTextContent } = useStore();

  // Store data with defaults
  const storeName = store?.name || "Modern Store";
  const primaryColor = store?.theme?.primaryColor || "#6366F1";
  const storeEmail = store?.contact?.email || "hello@modernstore.com";
  const storePhone = store?.contact?.phone || "+1 (555) 123-4567";
  const storeAddress = store?.contact?.address || "123 Modern Street, City, State 12345";

  // Footer sections
  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "#hero" },
        { label: "Products", href: "#products" },
        { label: "Collections", href: "#collections" },
        { label: "About Us", href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { label: "Help Center", href: "#help" },
        { label: "Shipping Info", href: "#shipping" },
        { label: "Returns", href: "#returns" },
        { label: "Size Guide", href: "#size-guide" },
        { label: "Track Order", href: "#track" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" },
        { label: "Careers", href: "#careers" },
        { label: "Press", href: "#press" },
        { label: "Sustainability", href: "#sustainability" },
        { label: "Investors", href: "#investors" },
      ],
    },
  ];

  // Social media links
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook", color: "#1877F2" },
    { icon: Twitter, href: "#", label: "Twitter", color: "#1DA1F2" },
    { icon: Instagram, href: "#", label: "Instagram", color: "#E4405F" },
    { icon: Youtube, href: "#", label: "YouTube", color: "#FF0000" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "#0A66C2" },
  ];

  // Trust badges
  const trustBadges = [
    { icon: Shield, text: "Secure Payments", color: "#10B981" },
    { icon: Truck, text: "Free Shipping", color: "#3B82F6" },
    { icon: CreditCard, text: "Easy Returns", color: "#8B5CF6" },
    { icon: Headphones, text: "24/7 Support", color: "#F59E0B" },
  ];

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle link clicks
  const handleLinkClick = (href) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const socialVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ backgroundColor: `${primaryColor}20` }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Main Footer Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 container mx-auto px-6 py-16"
      >
        {/* Top Section */}
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <InlineTextEdit
                  initialText={storeName}
                  onSave={updateStoreTextContent}
                  identifier="name"
                  as="h3"
                  className="text-2xl font-bold tracking-tight"
                >
                  {storeName}
                </InlineTextEdit>
                <motion.div
                  className="flex items-center gap-1 text-sm text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div
                    className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span>Premium Quality Store</span>
                </motion.div>
              </div>
            </div>

            <InlineTextEdit
              initialText="Discover premium collections crafted with precision and designed for the modern lifestyle. Experience luxury redefined with our curated selection of exceptional products."
              onSave={updateStoreTextContent}
              identifier="content.footerDescription"
              as="p"
              className="text-gray-300 leading-relaxed mb-8 max-w-md"
            >
              Discover premium collections crafted with precision and designed for the modern lifestyle. Experience luxury redefined with our curated selection of exceptional products.
            </InlineTextEdit>

            {/* Contact Info */}
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div
                  className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <span>{storeEmail}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div
                  className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Phone className="w-5 h-5" />
                </div>
                <span>{storePhone}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300"
                whileHover={{ x: 5 }}
              >
                <div
                  className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="max-w-xs">{storeAddress}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="space-y-6"
            >
              <h4 className="text-lg font-semibold text-white tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: linkIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <button
                      onClick={() => handleLinkClick(link.href)}
                      className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 block"
                    >
                      {link.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {trustBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            return (
              <motion.div
                key={badge.text}
                className="flex flex-col items-center text-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg"
                  style={{ backgroundColor: badge.color }}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {badge.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 mb-16 border border-white/10"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10)`,
          }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <motion.div
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              viewport={{ once: true }}
            >
              <Star className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Stay Updated</h3>
              <Star className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and special events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
              <Button
                className="px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                }}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-8 border-t border-white/10">
          {/* Social Links */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4"
          >
            <span className="text-gray-400 font-medium">Follow us:</span>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    variants={socialVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-12"
                    style={{
                      backgroundColor: `${social.color}20`,
                    }}
                    whileHover={{
                      backgroundColor: social.color,
                      scale: 1.1,
                      rotate: 12,
                    }}
                    title={social.label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 text-gray-400 text-sm"
          >
            <span>© 2024 {storeName}. Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </motion.div>
            <span>All rights reserved.</span>
          </motion.div>

          {/* Scroll to Top */}
          <motion.button
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 group"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            style={{
              backgroundColor: `${primaryColor}20`,
            }}
          >
            <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
          </motion.button>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" 
           style={{
             background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
           }}
      />
    </footer>
  );
};

export default Footer;
