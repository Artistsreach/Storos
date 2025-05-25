import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../../../../contexts/StoreContext';
import InlineTextEdit from '../../../ui/InlineTextEdit';
import { Facebook, Twitter, Instagram, Youtube, Shield } from 'lucide-react'; // Added Shield

const Footer = ({ store, isPublishedView = false }) => { // Added isPublishedView
  const { content, name, id: storeId, logo_url: logoUrl } = store;
  const { updateStoreTextContent } = useStore();

  const currentYear = new Date().getFullYear();
  const copyrightText = content?.footerCopyrightText || `© ${currentYear} ${name}. All Rights Reserved.`;
  
  const navLinks = store?.content?.footerLinkLabels || [
    { label: "About Us", href: "#features", identifier: "content.footerLinkLabels.0.label" },
    { label: "Contact", href: "#contact", identifier: "content.footerLinkLabels.1.label" },
    { label: "Privacy Policy", href: "/privacy", identifier: "content.footerLinkLabels.2.label" },
    { label: "Terms of Service", href: "/terms", identifier: "content.footerLinkLabels.3.label" },
  ];

  const socialLinks = store?.content?.socialMediaLinks || [
    { platform: "Facebook", href: "#", icon: Facebook, identifier: "content.socialMediaLinks.0.href" },
    { platform: "Twitter", href: "#", icon: Twitter, identifier: "content.socialMediaLinks.1.href" },
    { platform: "Instagram", href: "#", icon: Instagram, identifier: "content.socialMediaLinks.2.href" },
    { platform: "Youtube", href: "#", icon: Youtube, identifier: "content.socialMediaLinks.3.href" },
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-700/50 text-slate-400 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Brand Info */}
          <div className="md:col-span-3 lg:col-span-1">
            <Link to={`/store/${storeId}`} className="flex items-center gap-2.5 mb-4 group">
              {logoUrl && (
                <img src={logoUrl} alt={`${name} Logo`} className="h-10 w-10 object-contain rounded-md border border-slate-700 group-hover:border-red-500/70 transition-colors" />
              )}
              <span className="font-bold text-xl text-slate-100 group-hover:text-red-400 transition-colors font-mono uppercase tracking-tight">
                {name}
              </span>
            </Link>
            <InlineTextEdit
              initialText={content?.footerTagline || "Your trusted source for premium products."}
              onSave={(newText) => updateStoreTextContent('content.footerTagline', newText)}
              identifier="content.footerTagline"
              isPublishedView={isPublishedView}
              as="p"
              className="text-sm leading-relaxed"
            >
              {content?.footerTagline || "Your trusted source for premium products."}
            </InlineTextEdit>
          </div>

          {/* Quick Links */}
          <div>
            <InlineTextEdit
              initialText={content?.footerQuickLinksTitle || "Quick Links"}
              onSave={(newText) => updateStoreTextContent('content.footerQuickLinksTitle', newText)}
              identifier="content.footerQuickLinksTitle"
              isPublishedView={isPublishedView}
              as="h5"
              className="font-semibold text-slate-200 mb-4 font-mono uppercase tracking-wider text-sm"
            >
              {content?.footerQuickLinksTitle || "Quick Links"}
            </InlineTextEdit>
            <ul className="space-y-2">
              {navLinks.slice(0,4).map((link, index) => ( // Show up to 4 links
                <li key={index}>
                  <InlineTextEdit
                    initialText={link.label}
                    onSave={(newText) => updateStoreTextContent(link.identifier, newText)}
                    identifier={link.identifier}
                    isPublishedView={isPublishedView}
                    as="a"
                    href={link.href.startsWith('/') ? link.href : `#${link.href.replace('#','')}-${storeId}`}
                    className="hover:text-red-400 transition-colors text-xs font-mono"
                  >
                    {link.label}
                  </InlineTextEdit>
                </li>
              ))}
            </ul>
          </div>
          
          {/* More Links (if any) or placeholder */}
           <div>
            <InlineTextEdit
              initialText={content?.footerSupportTitle || "Support"}
              onSave={(newText) => updateStoreTextContent('content.footerSupportTitle', newText)}
              identifier="content.footerSupportTitle"
              isPublishedView={isPublishedView}
              as="h5"
              className="font-semibold text-slate-200 mb-4 font-mono uppercase tracking-wider text-sm"
            >
              {content?.footerSupportTitle || "Support"}
            </InlineTextEdit>
             <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400 transition-colors text-xs font-mono">FAQ</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors text-xs font-mono">Shipping</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors text-xs font-mono">Returns</a></li>
             </ul>
          </div>


          {/* Social Media */}
          <div>
            <InlineTextEdit
              initialText={content?.footerFollowUsTitle || "Follow Us"}
              onSave={(newText) => updateStoreTextContent('content.footerFollowUsTitle', newText)}
              identifier="content.footerFollowUsTitle"
              isPublishedView={isPublishedView}
              as="h5"
              className="font-semibold text-slate-200 mb-4 font-mono uppercase tracking-wider text-sm"
            >
              {content?.footerFollowUsTitle || "Follow Us"}
            </InlineTextEdit>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  aria-label={social.platform}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="border-t border-slate-700/50 pt-8 text-center md:flex md:justify-between md:items-center"
          initial={{ opacity: 0, y:20 }}
          whileInView={{ opacity: 1, y:0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay:0.2 }}
        >
          <InlineTextEdit
            initialText={copyrightText}
            onSave={(newText) => updateStoreTextContent('content.footerCopyrightText', newText)}
            identifier="content.footerCopyrightText"
            isPublishedView={isPublishedView}
            as="p"
            className="text-xs font-mono"
          >
            {copyrightText}
          </InlineTextEdit>
          <div className="flex items-center justify-center md:justify-end mt-4 md:mt-0 text-xs font-mono">
            <Shield className="w-3.5 h-3.5 mr-1.5 text-red-500" />
            <InlineTextEdit
              initialText={content?.footerSecureShoppingText || "Secure Shopping Guarantee"}
              onSave={(newText) => updateStoreTextContent('content.footerSecureShoppingText', newText)}
              identifier="content.footerSecureShoppingText"
              isPublishedView={isPublishedView}
              as="span"
            >
              {content?.footerSecureShoppingText || "Secure Shopping Guarantee"}
            </InlineTextEdit>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
