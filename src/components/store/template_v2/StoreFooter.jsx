
import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import InlineTextEdit from '@/components/ui/InlineTextEdit';
import { useStore } from '@/contexts/StoreContext';

const StoreFooter = ({ store, isPublishedView = false }) => {
  const { name, theme, id: storeId, content } = store;
  const { updateStore } = useStore();
  const isAdmin = !isPublishedView;
  const currentYear = new Date().getFullYear();

  const socialLinks = content?.socialLinks || [
    { iconName: 'Facebook', href: "#", label: "Facebook" },
    { iconName: 'Instagram', href: "#", label: "Instagram" },
    { iconName: 'Twitter', href: "#", label: "Twitter" },
    { iconName: 'Linkedin', href: "#", label: "LinkedIn" },
  ];

  const IconMap = { Facebook, Instagram, Twitter, Youtube, Linkedin };

  const basePath = `/store/${storeId}`;
  const defaultFooterNavLinks = [
    { href: basePath, label: "Home" },
    { href: `#products-${storeId}`, label: "Products" },
    { href: "#", label: "About Us" },
    { href: "#", label: "Contact" },
    { href: "#", label: "FAQ" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
  ];

  const footerNavLinks = (content?.footerNavLinks && content.footerNavLinks.length === defaultFooterNavLinks.length)
    ? content.footerNavLinks.map((cl, i) => ({ ...defaultFooterNavLinks[i], label: cl.label || defaultFooterNavLinks[i].label, href: cl.href || defaultFooterNavLinks[i].href }))
    : defaultFooterNavLinks;

  const handleSaveText = async (field, value, index = null) => {
    if (storeId) {
      try {
        let newContent = { ...(content || {}) };
        if (field === 'storeNameFooter') {
          await updateStore(storeId, { name: value });
        } else if (field === 'footerDescription') {
          newContent.footerDescription = value;
        } else if (field === 'footerQuickLinksTitle') {
          newContent.footerQuickLinksTitle = value;
        } else if (field === 'footerCustomerServiceTitle') {
          newContent.footerCustomerServiceTitle = value;
        } else if (field === 'footerContactTitle') {
          newContent.footerContactTitle = value;
        } else if (field === 'footerAddress') {
          newContent.footerAddress = value;
        } else if (field === 'footerEmail') {
          newContent.footerEmail = value;
        } else if (field === 'footerPhone') {
          newContent.footerPhone = value;
        } else if (field === 'copyrightText') {
          newContent.copyrightText = value;
        } else if (field === 'footerNavLink' && index !== null) {
          const currentNavs = newContent.footerNavLinks || defaultFooterNavLinks.map(l => ({ label: l.label, href: l.href }));
          const updatedNavs = currentNavs.map((link, i) =>
            i === index ? { ...link, label: value } : link
          );
          newContent.footerNavLinks = updatedNavs;
        }
        
        if (JSON.stringify(newContent) !== JSON.stringify(content)) {
             await updateStore(storeId, { content: newContent });
        }
      } catch (error) {
        console.error(`Failed to update store ${field}:`, error);
      }
    }
  };

  const footerDescription = content?.footerDescription || `Your favorite destination for ${store.type || 'quality products'}. We are committed to bringing you the best.`;
  const quickLinksTitle = content?.footerQuickLinksTitle || "Quick Links";
  const customerServiceTitle = content?.footerCustomerServiceTitle || "Customer Service";
  const contactTitle = content?.footerContactTitle || "Contact Us";
  const address = content?.footerAddress || "123 Store Street, Cityville, ST 12345";
  const emailAddress = content?.footerEmail || `info@${name.toLowerCase().replace(/\s+/g, '')}.com`;
  const phoneNumber = content?.footerPhone || "(123) 456-7890";
  const copyrightText = content?.copyrightText || `© ${currentYear} ${name}. All Rights Reserved. Powered by StoreGen AI.`;

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-muted dark:bg-slate-900 text-muted-foreground pt-12 pb-8"
      id={`contact-${storeId}`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {/* Store Info */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground" style={{color: theme.primaryColor}}>
              <InlineTextEdit initialText={name} onSave={(newText) => handleSaveText('storeNameFooter', newText)} isAdmin={isAdmin} placeholder="Store Name"/>
            </h3>
            <p className="text-sm">
              <InlineTextEdit initialText={footerDescription} onSave={(newText) => handleSaveText('footerDescription', newText)} isAdmin={isAdmin} placeholder="Store description"/>
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map(link => {
                const IconComponent = IconMap[link.iconName] || Facebook;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="p-2 rounded-full bg-background/50 hover:bg-primary/10 transition-colors"
                    style={{"--hover-bg-color": `${theme.primaryColor}1A`, "--hover-text-color": theme.primaryColor}}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              <InlineTextEdit initialText={quickLinksTitle} onSave={(newText) => handleSaveText('footerQuickLinksTitle', newText)} isAdmin={isAdmin} placeholder="Quick Links"/>
            </h4>
            <ul className="space-y-2">
              {footerNavLinks.slice(0,4).map((link, index) => (
                <li key={link.label + index}>
                  <a href={link.href} className="text-sm hover:text-primary transition-colors" style={{"--hover-color": theme.primaryColor}}>
                    <InlineTextEdit initialText={link.label} onSave={(newText) => handleSaveText('footerNavLink', newText, index)} isAdmin={isAdmin} placeholder={`Link ${index + 1}`}/>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              <InlineTextEdit initialText={customerServiceTitle} onSave={(newText) => handleSaveText('footerCustomerServiceTitle', newText)} isAdmin={isAdmin} placeholder="Customer Service"/>
            </h4>
            <ul className="space-y-2">
               {footerNavLinks.slice(4).map((link, index) => (
                <li key={link.label + index + 4}>
                  <a href={link.href} className="text-sm hover:text-primary transition-colors" style={{"--hover-color": theme.primaryColor}}>
                    <InlineTextEdit initialText={link.label} onSave={(newText) => handleSaveText('footerNavLink', newText, index + 4)} isAdmin={isAdmin} placeholder={`Link ${index + 5}`}/>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-foreground mb-3">
              <InlineTextEdit initialText={contactTitle} onSave={(newText) => handleSaveText('footerContactTitle', newText)} isAdmin={isAdmin} placeholder="Contact Us"/>
            </h4>
            <p><InlineTextEdit initialText={address} onSave={(newText) => handleSaveText('footerAddress', newText)} isAdmin={isAdmin} placeholder="Address"/></p>
            <p>Email: <a href={`mailto:${emailAddress}`} className="hover:text-primary" style={{"--hover-color": theme.primaryColor}}>
              <InlineTextEdit initialText={emailAddress} onSave={(newText) => handleSaveText('footerEmail', newText)} isAdmin={isAdmin} placeholder="Email"/>
            </a></p>
            <p>Phone: <a href={`tel:${phoneNumber.replace(/\D/g,'')}`} className="hover:text-primary" style={{"--hover-color": theme.primaryColor}}>
              <InlineTextEdit initialText={phoneNumber} onSave={(newText) => handleSaveText('footerPhone', newText)} isAdmin={isAdmin} placeholder="Phone"/>
            </a></p>
          </div>
        </div>
        
        <div className="border-t pt-6 text-center text-xs">
          <p><InlineTextEdit initialText={copyrightText} onSave={(newText) => handleSaveText('copyrightText', newText)} isAdmin={isAdmin} placeholder="Copyright text"/></p>
        </div>
      </div>
    </motion.footer>
  );
};

export default StoreFooter;
