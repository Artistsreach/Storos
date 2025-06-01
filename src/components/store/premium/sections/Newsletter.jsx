import React, { useState } from 'react';
import { Button } from '../../../ui/button'; 
import { Input } from '../../../ui/input'; 
import { Mail } from 'lucide-react';
import InlineTextEdit from '../../../ui/InlineTextEdit';
import { useStore } from '../../../../contexts/StoreContext';

const Newsletter = ({ store: storeProp, isPublishedView = false }) => { // Renamed store to storeProp
  const { updateStoreTextContent, viewMode, store: contextStore } = useStore(); // Get store from context for theme
  const store = contextStore || storeProp; // Prioritize contextStore
  const { content, id: storeId } = store;
  
  const primaryColor = store?.theme?.primaryColor || "#6366F1"; // Default if no theme

  // Helper function to generate a slightly darker shade
  const getDarkerShade = (color, percent = 20) => {
    if (!color.startsWith("#")) return color;
    let num = parseInt(color.slice(1), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    R = Math.max(0, R); G = Math.max(0, G); B = Math.max(0, B);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };
  const secondaryColor = getDarkerShade(primaryColor, 20);

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
    <section
      id={`newsletter-${store?.id || 'premium'}`}
      className="py-12 md:py-20 text-white"
      style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
    >
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
              className="h-12 text-white hover:opacity-90 font-semibold text-lg premium-font-body shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-8"
              style={{ background: `linear-gradient(to right, ${getDarkerShade(primaryColor, -10)}, ${getDarkerShade(secondaryColor, -10)})` }} // Slightly lighter for button
              onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${getDarkerShade(primaryColor, -15)}, ${getDarkerShade(secondaryColor, -15)})`}
              onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${getDarkerShade(primaryColor, -10)}, ${getDarkerShade(secondaryColor, -10)})`}
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
