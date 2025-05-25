import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import InlineTextEdit from '../../../ui/InlineTextEdit'; // Adjusted path
import { useStore } from '../../../../contexts/StoreContext'; // Adjusted path

const Footer = ({ store, isPublishedView = false }) => { // Added isPublishedView
  const { updateStoreTextContent } = useStore();
  const currentYear = new Date().getFullYear();

  const storeName = store?.name || "Premium Store";
  const storeId = store?.id || "premium-store";
  const footerContent = store?.content?.footer || {};

  const navLinks = footerContent.navLinks || [
    { label: "About Us", href: "#", identifier: "content.footer.navLinks.0.label" },
    { label: "Contact", href: "#", identifier: "content.footer.navLinks.1.label" },
    { label: "FAQ", href: "#", identifier: "content.footer.navLinks.2.label" },
    { label: "Shipping & Returns", href: "#", identifier: "content.footer.navLinks.3.label" },
    { label: "Privacy Policy", href: "#", identifier: "content.footer.navLinks.4.label" },
    { label: "Terms of Service", href: "#", identifier: "content.footer.navLinks.5.label" },
  ];

  const socialLinks = footerContent.socialLinks || [
    { platform: "Facebook", href: "#", icon: Facebook, identifier: "content.footer.socialLinks.0.href" },
    { platform: "Twitter", href: "#", icon: Twitter, identifier: "content.footer.socialLinks.1.href" },
    { platform: "Instagram", href: "#", icon: Instagram, identifier: "content.footer.socialLinks.2.href" },
    { platform: "LinkedIn", href: "#", icon: Linkedin, identifier: "content.footer.socialLinks.3.href" },
  ];
  
  const contactInfo = footerContent.contactInfo || {
    address: "123 Premium Lane, Luxury City, LC 10001",
    phone: "+1 (555) 123-4567",
    email: "support@premiumstore.com",
    addressIdentifier: "content.footer.contactInfo.address",
    phoneIdentifier: "content.footer.contactInfo.phone",
    emailIdentifier: "content.footer.contactInfo.email",
  };

  const copyrightText = footerContent.copyrightText || `© ${currentYear} ${storeName}. All Rights Reserved.`;
  const copyrightIdentifier = "content.footer.copyrightText";

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 pt-16 pb-8 premium-font-body">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Store Info */}
          <div className="space-y-4">
            <InlineTextEdit
              initialText={storeName}
              onSave={(newText) => updateStoreTextContent('name', newText)} // Assuming 'name' is the correct identifier for store name
              identifier="name" 
              isPublishedView={isPublishedView}
              as="h3"
              className="text-2xl font-bold text-white dark:text-gray-100 premium-font-display"
            >
              {storeName}
            </InlineTextEdit>
            <p className="text-sm leading-relaxed">
              <InlineTextEdit
                initialText={footerContent.tagline || "Experience the pinnacle of luxury and style with our exclusive collection."}
                onSave={updateStoreTextContent}
                identifier="content.footer.tagline"
                isPublishedView={isPublishedView}
                as="span"
              />
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <InlineTextEdit
              initialText={footerContent.quickLinksTitle || "Quick Links"}
              onSave={(newText) => updateStoreTextContent('content.footer.quickLinksTitle', newText)}
              identifier="content.footer.quickLinksTitle"
              isPublishedView={isPublishedView}
              as="h4"
              className="text-lg font-semibold text-white dark:text-gray-200 premium-font-display"
            >
              {footerContent.quickLinksTitle || "Quick Links"}
            </InlineTextEdit>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.identifier}>
                  <InlineTextEdit
                    initialText={link.label}
                    onSave={updateStoreTextContent}
                    identifier={link.identifier}
                    isPublishedView={isPublishedView}
                    as="a"
                    href={link.href}
                    className="hover:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300"
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <InlineTextEdit
              initialText={footerContent.contactUsTitle || "Contact Us"}
              onSave={(newText) => updateStoreTextContent('content.footer.contactUsTitle', newText)}
              identifier="content.footer.contactUsTitle"
              isPublishedView={isPublishedView}
              as="h4"
              className="text-lg font-semibold text-white dark:text-gray-200 premium-font-display"
            >
              {footerContent.contactUsTitle || "Contact Us"}
            </InlineTextEdit>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-purple-400 flex-shrink-0" />
                <InlineTextEdit initialText={contactInfo.address} onSave={updateStoreTextContent} identifier={contactInfo.addressIdentifier} isPublishedView={isPublishedView} as="span" />
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-purple-400" />
                <InlineTextEdit initialText={contactInfo.phone} onSave={updateStoreTextContent} identifier={contactInfo.phoneIdentifier} isPublishedView={isPublishedView} as="a" href={`tel:${contactInfo.phone}`} />
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-purple-400" />
                <InlineTextEdit initialText={contactInfo.email} onSave={updateStoreTextContent} identifier={contactInfo.emailIdentifier} isPublishedView={isPublishedView} as="a" href={`mailto:${contactInfo.email}`} />
              </li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div className="space-y-4">
            <InlineTextEdit
              initialText={footerContent.followUsTitle || "Follow Us"}
              onSave={(newText) => updateStoreTextContent('content.footer.followUsTitle', newText)}
              identifier="content.footer.followUsTitle"
              isPublishedView={isPublishedView}
              as="h4"
              className="text-lg font-semibold text-white dark:text-gray-200 premium-font-display"
            >
              {footerContent.followUsTitle || "Follow Us"}
            </InlineTextEdit>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.platform}
                    href={social.href} // This would be editable if we stored the href in DB
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    className="text-gray-400 hover:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300"
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-gray-800 pt-8 text-center">
          <p className="text-sm">
            <InlineTextEdit
              initialText={copyrightText}
              onSave={updateStoreTextContent}
              identifier={copyrightIdentifier}
              isPublishedView={isPublishedView}
              as="span"
            />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
