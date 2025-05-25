import React, { useState } from 'react';
import { Button } from '../../../ui/button'; 
import { Input } from '../../../ui/input'; 
import { Mail } from 'lucide-react';
import InlineTextEdit from '../../../ui/InlineTextEdit';
import { useStore } from '../../../../contexts/StoreContext';

const Newsletter = ({ store, isPublishedView = false }) => { // Added isPublishedView
  const { content, id: storeId } = store;
  const { updateStoreTextContent, viewMode } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const sectionTitle = content?.newsletterSectionTitle || "Stay Ahead of the Curve";
  const sectionSubtitle = content?.newsletterSectionSubtitle || "Subscribe to our newsletter for exclusive updates, early access to new arrivals, and special offers.";
  const inputPlaceholderText = content?.newsletterInputPlaceholder || "Enter your email address"; // Renamed for clarity
  const buttonText = content?.newsletterButtonText || "Subscribe";
  const successMessage = content?.newsletterSuccessMessage || "Thank you for subscribing!";


  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would handle the email submission (e.g., API call)
    console.log(`Email submitted for newsletter: ${email} for store ${store?.id}`);
    setSubscribed(true);
    setEmail('');
    // Optionally, show a toast message from useToast()
  };

  return (
    <section id={`newsletter-${store?.id || 'premium'}`} className="py-12 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-6 text-center">
        <Mail className="h-16 w-16 mx-auto mb-6 opacity-80" />
        <InlineTextEdit
          initialText={sectionTitle}
          onSave={(newText) => updateStoreTextContent('newsletterSectionTitle', newText)}
          isAdmin={!isPublishedView && viewMode === 'edit'}
          as="h2"
          textClassName="text-3xl md:text-4xl font-bold mb-4 premium-font-display"
          inputClassName="text-3xl md:text-4xl font-bold mb-4 premium-font-display bg-transparent"
          className="text-3xl md:text-4xl font-bold mb-4 premium-font-display"
        />
        <InlineTextEdit
          initialText={sectionSubtitle}
          onSave={(newText) => updateStoreTextContent('newsletterSectionSubtitle', newText)}
          isAdmin={!isPublishedView && viewMode === 'edit'}
          as="p"
          textClassName="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90 premium-font-body"
          inputClassName="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90 premium-font-body bg-transparent"
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90 premium-font-body"
          useTextarea={true}
        />

        {subscribed ? (
          <InlineTextEdit
            initialText={successMessage}
            onSave={(newText) => updateStoreTextContent('newsletterSuccessMessage', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName="text-xl font-semibold premium-font-body"
            inputClassName="text-xl font-semibold premium-font-body bg-transparent"
            className="text-xl font-semibold premium-font-body"
          />
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={inputPlaceholderText}
              required
              className="h-12 text-gray-800 placeholder-gray-500 premium-font-body flex-grow"
            />
            <Button
              type="submit"
              className="h-12 bg-premium-gradient text-white hover:opacity-90 font-semibold text-lg premium-font-body shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-8"
            >
              <InlineTextEdit
                initialText={buttonText}
                onSave={(newText) => updateStoreTextContent('newsletterButtonText', newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="span" // Render as span inside button
                textClassName=""
                inputClassName="bg-transparent"
              />
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
