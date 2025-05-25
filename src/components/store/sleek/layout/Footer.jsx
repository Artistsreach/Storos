import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Github, Twitter, Instagram, Facebook, Youtube, Linkedin, Sparkles } from "lucide-react";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { useStore } from "@/contexts/StoreContext";

const Footer = ({ store }) => {
  const { name, theme, logo_url: logoUrl, id: storeId, content } = store;
  const { updateStoreTextContent } = useStore();
  const primaryColor = theme?.primaryColor || "#3B82F6";
  const currentYear = new Date().getFullYear();

  const footerText = content?.footerText || `© ${currentYear} ${name}. All Rights Reserved.`;
  const footerTagline = content?.footerTagline || "Experience Elegance, Redefined.";

  const navLinks = store?.content?.navLinkLabels || [
    "Home",
    "Products",
    "Collections",
    "Features",
    "Contact",
  ];

  const footerLinks = [
    {
      title: "Shop",
      links: [
        { label: navLinks[1] || "Products", href: `#products-${storeId}` },
        { label: navLinks[2] || "Collections", href: `#collections-${storeId}` },
        { label: "New Arrivals", href: `#products-${storeId}?filter=new` },
        { label: "Best Sellers", href: `#products-${storeId}?filter=bestsellers` },
      ],
    },
    {
      title: "About Us",
      links: [
        { label: "Our Story", href: "#" },
        { label: navLinks[3] || "Features", href: `#features-${storeId}` },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: navLinks[4] || "Contact Us", href: `#contact-${storeId}` },
        { label: "FAQs", href: "#" },
        { label: "Shipping & Returns", href: "#" },
        { label: "Track Order", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-6 h-6" />, href: "#", label: "Facebook" },
    { icon: <Instagram className="w-6 h-6" />, href: "#", label: "Instagram" },
    { icon: <Twitter className="w-6 h-6" />, href: "#", label: "Twitter" },
    { icon: <Youtube className="w-6 h-6" />, href: "#", label: "YouTube" },
    { icon: <Linkedin className="w-6 h-6" />, href: "#", label: "LinkedIn" },
  ];

  const handleLinkClick = (e, href) => {
    if (href.startsWith("#") && href.length > 1) {
      e.preventDefault();
      const elementId = href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Allow default behavior for external links or router links
  };


  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-blue-950 text-slate-300 pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        {/* Subtle background pattern or texture if desired */}
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Brand Info */}
          <div className="lg:col-span-2 pr-8">
            <Link to={`/store/${storeId}`} className="flex items-center gap-3 mb-6 group">
              {logoUrl && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2">
                  <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    className="h-10 w-10 object-contain"
                  />
                </div>
              )}
              <span className="font-bold text-2xl tracking-tight text-white group-hover:text-primary transition-colors duration-300 font-inter" style={{ color: primaryColor }}>
                {name}
              </span>
            </Link>
            <InlineTextEdit
              initialText={footerTagline}
              onSave={updateStoreTextContent}
              identifier="content.footerTagline"
              as="p"
              className="text-slate-400 mb-8 font-inter leading-relaxed"
            >
              {footerTagline}
            </InlineTextEdit>
            <div className="flex space-x-5">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-primary transition-colors duration-300"
                  style={{ "--hover-color": primaryColor }}
                  whileHover={{ scale: 1.2, y: -2 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h5 className="font-semibold text-white text-lg mb-6 font-inter tracking-wide">
                {section.title}
              </h5>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-slate-400 hover:text-primary hover:pl-1 transition-all duration-300 font-inter"
                      style={{ "--hover-color": primaryColor }}
                      whileHover={{ x: 2 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="border-t border-slate-700/50 pt-10 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <InlineTextEdit
            initialText={footerText}
            onSave={updateStoreTextContent}
            identifier="content.footerText"
            as="p"
            className="text-sm text-slate-500 font-inter mb-4 sm:mb-0"
          >
            {footerText}
          </InlineTextEdit>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-inter">
            <Sparkles className="w-4 h-4 text-primary/70" style={{color: primaryColor}} />
            <span>
              Powered by{" "}
              <a
                href="https://contextbuilder.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors"
                style={{ color: primaryColor }}
              >
                ContextBuilder.ai
              </a>
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
