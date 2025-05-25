import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import InlineTextEdit from '@/components/ui/InlineTextEdit';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, ShieldCheck } from 'lucide-react';

const Footer = ({ store, isPublishedView = false }) => { // Added isPublishedView
  const { content, name, id: storeId, logo_url: logoUrl, theme } = store;
  const { updateStoreTextContent } = useStore();

  const currentYear = new Date().getFullYear();
  const copyrightText = content?.footerCopyrightText || `© ${currentYear} ${name}. All Rights Reserved.`;
  
  const defaultNavLinks = [
    { label: "Shop All", href: `#products-${storeId}`, identifier: "content.footerLinkLabels.0" },
    { label: "Our Story", href: `#features-${storeId}`, identifier: "content.footerLinkLabels.1" },
    { label: "FAQs", href: "/faq", identifier: "content.footerLinkLabels.2" },
    { label: "Contact Us", href: "#contact", identifier: "content.footerLinkLabels.3" },
  ];
  
  const navLinks = store?.content?.footerLinkLabels?.map((link, index) => ({
    ...link,
    identifier: `content.footerLinkLabels.${index}.label` // Ensure identifier is correct
  })) || defaultNavLinks;


  const socialLinks = store?.content?.socialMediaLinks || [
    { platform: "Facebook", href: "#", icon: Facebook, identifier: "content.socialMediaLinks.0" },
    { platform: "Twitter", href: "#", icon: Twitter, identifier: "content.socialMediaLinks.1" },
    { platform: "Instagram", href: "#", icon: Instagram, identifier: "content.socialMediaLinks.2" },
  ];
  
  const primaryColor = theme?.primaryColor || "#3B82F6";

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to={`/store/${storeId}`} className="flex items-center gap-3 mb-4 group">
              {logoUrl && (
                <img src={logoUrl} alt={`${name} Logo`} className="h-10 w-10 object-contain rounded-lg" />
              )}
              <span className="font-semibold text-xl text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                {name}
              </span>
            </Link>
            <InlineTextEdit
              initialText={content?.footerTagline || "Fresh designs, delivered daily to inspire your world."}
              onSave={(newText) => updateStoreTextContent('content.footerTagline', newText)}
              identifier="content.footerTagline"
              isPublishedView={isPublishedView}
              as="p"
              className="text-sm leading-relaxed max-w-sm"
            >
              {content?.footerTagline || "Fresh designs, delivered daily to inspire your world."}
            </InlineTextEdit>
          </div>

          {/* Quick Links */}
          <div>
            <InlineTextEdit
              initialText={content?.footerNavigateTitle || "Navigate"}
              onSave={(newText) => updateStoreTextContent('content.footerNavigateTitle', newText)}
              identifier="content.footerNavigateTitle"
              isPublishedView={isPublishedView}
              as="h5"
              className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm uppercase tracking-wider"
            >
              {content?.footerNavigateTitle || "Navigate"}
            </InlineTextEdit>
            <ul className="space-y-2.5">
              {navLinks.slice(0,4).map((link, index) => (
                <li key={index}>
                  <InlineTextEdit
                    initialText={link.label}
                    onSave={(newText) => updateStoreTextContent(link.identifier, newText)}
                    identifier={link.identifier}
                    isPublishedView={isPublishedView}
                    as="a"
                    href={link.href.startsWith('/') ? link.href : `#${link.href.replace('#','')}`}
                    className="hover:text-primary dark:hover:text-primary-light transition-colors text-sm"
                  >
                    {link.label}
                  </InlineTextEdit>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social Media */}
          <div>
            <InlineTextEdit
              initialText={content?.footerConnectTitle || "Connect"}
              onSave={(newText) => updateStoreTextContent('content.footerConnectTitle', newText)}
              identifier="content.footerConnectTitle"
              isPublishedView={isPublishedView}
              as="h5"
              className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm uppercase tracking-wider"
            >
              {content?.footerConnectTitle || "Connect"}
            </InlineTextEdit>
            <div className="flex space-x-3.5">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                  aria-label={social.platform}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <InlineTextEdit
              initialText={content?.footerFollowUsText || "Follow us for updates & inspiration!"}
              onSave={(newText) => updateStoreTextContent('content.footerFollowUsText', newText)}
              identifier="content.footerFollowUsText"
              isPublishedView={isPublishedView}
              as="p"
              className="text-xs mt-4"
            >
              {content?.footerFollowUsText || "Follow us for updates & inspiration!"}
            </InlineTextEdit>
          </div>
        </motion.div>

        <motion.div 
          className="border-t border-slate-200/80 dark:border-slate-700/60 pt-8 text-center sm:flex sm:justify-between sm:items-center"
          initial={{ opacity: 0, y:15 }}
          whileInView={{ opacity: 1, y:0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay:0.3 }}
        >
          <InlineTextEdit
            initialText={copyrightText}
            onSave={(newText) => updateStoreTextContent('content.footerCopyrightText', newText)}
            identifier="content.footerCopyrightText"
            isPublishedView={isPublishedView}
            as="p"
            className="text-xs"
          >
            {copyrightText}
          </InlineTextEdit>
          <div className="flex items-center justify-center sm:justify-end mt-3 sm:mt-0 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" style={{color: primaryColor}} />
            <InlineTextEdit
              initialText={content?.footerSecureShoppingText || "Secure Shopping Experience"}
              onSave={(newText) => updateStoreTextContent('content.footerSecureShoppingText', newText)}
              identifier="content.footerSecureShoppingText"
              isPublishedView={isPublishedView}
              as="span"
            >
              {content?.footerSecureShoppingText || "Secure Shopping Experience"}
            </InlineTextEdit>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
