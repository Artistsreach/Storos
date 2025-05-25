import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Mail, Send } from 'lucide-react';
import { useStore } from '../../../../contexts/StoreContext';
import InlineTextEdit from '../../../ui/InlineTextEdit';

const Newsletter = ({ store, isPublishedView = false }) => {
  const { content, theme, id: storeId } = store;
  const { updateStoreTextContent, viewMode } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const sectionTitle = content?.newsletterSectionTitle || "Stay Updated";
  const sectionSubtitle = content?.newsletterSectionSubtitle || "Subscribe to our newsletter for the latest product releases, updates, and exclusive offers.";
  const inputPlaceholderText = content?.newsletterInputPlaceholder || "Enter your email address"; // Renamed for clarity
  const buttonText = content?.newsletterButtonText || "Subscribe";
  const successMessage = content?.newsletterSuccessMessage || "Thanks for subscribing!";


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Newsletter signup: ${email} for store ${storeId}`);
    setSubscribed(true);
    setEmail('');
    // In a real app, integrate with an email marketing service
  };

  return (
    <section id={`newsletter-${storeId}`} className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Mail className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <InlineTextEdit
            initialText={sectionTitle}
            onSave={(newText) => updateStoreTextContent('newsletterSectionTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-3xl md:text-4xl font-extrabold mb-3 font-mono uppercase tracking-tight"
            inputClassName="text-3xl md:text-4xl font-extrabold mb-3 font-mono uppercase tracking-tight bg-transparent"
            className="text-3xl md:text-4xl font-extrabold mb-3 font-mono uppercase tracking-tight"
          />
          <InlineTextEdit
            initialText={sectionSubtitle}
            onSave={(newText) => updateStoreTextContent('newsletterSectionSubtitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName="text-md md:text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed"
            inputClassName="text-md md:text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed bg-transparent"
            className="text-md md:text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed"
            useTextarea={true}
          />
        </motion.div>

        {subscribed ? (
          <InlineTextEdit
            initialText={successMessage}
            onSave={(newText) => updateStoreTextContent('newsletterSuccessMessage', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="p"
            textClassName="text-lg font-semibold text-green-400 font-mono"
            inputClassName="text-lg font-semibold text-green-400 font-mono bg-transparent"
            className="text-lg font-semibold text-green-400 font-mono"
          />
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={inputPlaceholderText}
              required
              className="h-12 flex-grow bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 focus:border-red-500/70 rounded-md font-mono text-sm px-4"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white border-0 rounded-md px-6 font-mono uppercase tracking-wider text-sm shadow-md hover:shadow-lg"
            >
              <Send className="w-4 h-4 mr-2" />
              <InlineTextEdit
                initialText={buttonText}
                onSave={(newText) => updateStoreTextContent('newsletterButtonText', newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="span"
                textClassName=""
                inputClassName="bg-transparent"
              />
            </Button>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
