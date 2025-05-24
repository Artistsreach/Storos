import React from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  ArrowUp,
} from "lucide-react";
import { Button } from "../ui/button.jsx";
import InlineTextEdit from '@/components/ui/InlineTextEdit'; // Added import
import { useStore } from '@/contexts/StoreContext'; // Added import

const StoreFooter = ({ store, isPublishedView = false }) => {
  const { name, theme, id: storeId, content } = store; // Added content
  const { updateStore } = useStore(); // Added useStore
  const isAdmin = !isPublishedView; // Added isAdmin
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const basePath = `/store/${storeId}`; // Simplified base path
  // Default footer nav links
  const defaultFooterNavLinks = [
    { href: basePath, label: "Home" },
    { href: `#products-${storeId}`, label: "Products" },
    { href: "#", label: "About Us" },
    { href: "#", label: "Contact" },
    { href: "#", label: "FAQ" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Shipping Info" },
    { href: "#", label: "Returns" },
  ];

  // Use navLinks from content if available, otherwise default
  // Ensure content.footerNavLinks is an array and items have label and href
  const footerNavLinks = (content?.footerNavLinks && Array.isArray(content.footerNavLinks) && content.footerNavLinks.length > 0)
    ? content.footerNavLinks.map((cl, i) => ({ 
        href: cl.href || defaultFooterNavLinks[i]?.href || "#", // Fallback href
        label: cl.label || defaultFooterNavLinks[i]?.label || `Link ${i + 1}` // Fallback label
      }))
    : defaultFooterNavLinks;


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveFooterText = async (identifier, value, index = null) => {
    if (storeId) {
      try {
        if (identifier.startsWith('content.footerNavLinks')) {
          const updatedNavLinks = footerNavLinks.map((link, i) => 
            i === index ? { ...link, label: value } : link
          );
          await updateStore(storeId, { content: { ...content, footerNavLinks: updatedNavLinks } });
        } else {
          // For simple fields like content.footerStoreInfo, content.footerQuickLinksTitle etc.
          // The identifier will be like "content.fieldName"
          const keys = identifier.split('.'); // e.g., ['content', 'footerStoreInfo']
          if (keys.length === 2 && keys[0] === 'content') {
            await updateStore(storeId, { content: { ...content, [keys[1]]: value } });
          } else {
            console.warn("Unsupported identifier for footer text save:", identifier);
          }
        }
      } catch (error) {
        console.error(`Failed to update store footer text for ${identifier}:`, error);
      }
    }
  };
  
  const storeInfoText = content?.footerStoreInfo || `Your favorite destination for ${store.type || "quality products"}. We are committed to bringing you the best experience with premium quality and exceptional service.`;
  const quickLinksTitle = content?.footerQuickLinksTitle || "Quick Links";
  const customerServiceTitle = content?.footerCustomerServiceTitle || "Customer Service";
  const contactUsTitle = content?.footerContactUsTitle || "Contact Us";
  const addressText = content?.footerAddress || "123 Store Street, Cityville, ST 12345";
  const phoneNumberText = content?.footerPhoneNumber || "(123) 456-7890";
  const copyrightSuffixText = content?.footerCopyrightSuffix || "All Rights Reserved. Powered by StoreGen AI.";


  return (
    <footer
      className="bg-muted dark:bg-slate-900 text-muted-foreground relative overflow-hidden"
      id={`contact-${storeId}`}
    >
      {/* Main footer content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="pt-16 pb-8"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Store Info */}
            <div className="space-y-4">
              <h3
                className="text-xl font-bold text-foreground font-poppins"
                style={{ color: theme.primaryColor }}
              >
                {name} 
              </h3>
              <div className="text-sm">
                <InlineTextEdit
                  initialText={storeInfoText}
                  onSave={(newText) => handleSaveFooterText('content.footerStoreInfo', newText)}
                  isAdmin={isAdmin}
                  placeholder="Store information paragraph"
                  useTextarea={true}
                  textClassName="text-sm"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="p-2 rounded-full bg-background/50 hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                    style={{
                      "--hover-bg-color": `${theme.primaryColor}1A`,
                      "--hover-text-color": theme.primaryColor,
                    }}
                  >
                    <link.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-foreground mb-4 font-poppins">
                <InlineTextEdit
                  initialText={quickLinksTitle}
                  onSave={(newText) => handleSaveFooterText('content.footerQuickLinksTitle', newText)}
                  isAdmin={isAdmin}
                  placeholder="Quick Links Title"
                  textClassName="font-bold text-foreground"
                />
              </h4>
              <ul className="space-y-2">
                {footerNavLinks.slice(0, 5).map((link, index) => (
                  <li key={link.label + index}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-primary transition-colors hover:translate-x-1 inline-block hover:underline decoration-primary/30 underline-offset-4"
                      style={{ "--hover-color": theme.primaryColor }}
                    >
                      <InlineTextEdit
                        initialText={link.label}
                        onSave={(newText) => handleSaveFooterText('content.footerNavLinks', newText, index)}
                        isAdmin={isAdmin}
                        placeholder={`Link ${index + 1}`}
                        textClassName="text-sm"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-bold text-foreground mb-4 font-poppins">
                <InlineTextEdit
                  initialText={customerServiceTitle}
                  onSave={(newText) => handleSaveFooterText('content.footerCustomerServiceTitle', newText)}
                  isAdmin={isAdmin}
                  placeholder="Customer Service Title"
                  textClassName="font-bold text-foreground"
                />
              </h4>
              <ul className="space-y-2">
                {footerNavLinks.slice(5).map((link, index) => (
                  <li key={link.label + index + 5}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-primary transition-colors hover:translate-x-1 inline-block hover:underline decoration-primary/30 underline-offset-4"
                      style={{ "--hover-color": theme.primaryColor }}
                    >
                       <InlineTextEdit
                        initialText={link.label}
                        onSave={(newText) => handleSaveFooterText('content.footerNavLinks', newText, index + 5)}
                        isAdmin={isAdmin}
                        placeholder={`Link ${index + 6}`}
                        textClassName="text-sm"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <h4 className="font-bold text-foreground mb-4 font-poppins">
                <InlineTextEdit
                  initialText={contactUsTitle}
                  onSave={(newText) => handleSaveFooterText('content.footerContactUsTitle', newText)}
                  isAdmin={isAdmin}
                  placeholder="Contact Us Title"
                  textClassName="font-bold text-foreground"
                />
              </h4>
              <div className="flex items-start space-x-3">
                <MapPin
                  className="h-5 w-5 mt-0.5 flex-shrink-0"
                  style={{ color: theme.primaryColor }}
                />
                <InlineTextEdit
                  initialText={addressText}
                  onSave={(newText) => handleSaveFooterText('content.footerAddress', newText)}
                  isAdmin={isAdmin}
                  placeholder="Store Address"
                  useTextarea={true}
                  textClassName="text-sm"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Mail
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: theme.primaryColor }}
                />
                {/* Email is dynamic based on store name, typically not directly edited here but reflects store name changes */}
                <a
                  href={`mailto:info@${name.toLowerCase().replace(/\s+/g, "")}.com`}
                  className="hover:text-primary hover:underline decoration-primary/30 underline-offset-4"
                  style={{ "--hover-color": theme.primaryColor }}
                >
                  info@{name.toLowerCase().replace(/\s+/g, "")}.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: theme.primaryColor }}
                />
                <InlineTextEdit
                  initialText={phoneNumberText}
                  onSave={(newText) => handleSaveFooterText('content.footerPhoneNumber', newText)}
                  isAdmin={isAdmin}
                  placeholder="Store Phone Number"
                  textClassName="text-sm hover:text-primary hover:underline decoration-primary/30 underline-offset-4"
                  // Note: The <a> tag behavior for hover might need adjustment if InlineTextEdit wraps it differently
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>
              &copy; {currentYear} {name}. {/* Store name is already editable from header */}
              <InlineTextEdit
                initialText={copyrightSuffixText}
                onSave={(newText) => handleSaveFooterText('content.footerCopyrightSuffix', newText)}
                isAdmin={isAdmin}
                placeholder="Copyright suffix"
                textClassName="text-sm"
                as="span" // Render as span to keep it inline
              />
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10 transition-all duration-300"
                onClick={scrollToTop}
                style={{ "--hover-bg-color": `${theme.primaryColor}1A` }}
              >
                <ArrowUp
                  className="h-5 w-5"
                  style={{ color: theme.primaryColor }}
                />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
    </footer>
  );
};

export default StoreFooter;
