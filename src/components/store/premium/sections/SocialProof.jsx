import React from 'react';
import { Star, Users, MessageSquare } from 'lucide-react';
import InlineTextEdit from '../../../ui/InlineTextEdit';
import { useStore } from '../../../../contexts/StoreContext';

const SocialProof = ({ store: storeProp, isPublishedView = false }) => { // Renamed store to storeProp
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


  const sectionTitle = content?.socialProofSectionTitle || "Trusted by Thousands";
  const defaultTestimonials = [
    { id: 1, author: 'Jane D.', quote: 'Absolutely love the quality and service!', rating: 5 },
    { id: 2, author: 'John B.', quote: 'My new favorite store. Will be back for more.', rating: 5 },
    { id: 3, author: 'Alice M.', quote: 'Exceptional products and fast shipping.', rating: 4 },
  ];

  // Ensure testimonials have unique identifiers for saving, even if they come from default
  const getTestimonialContent = (index, field, defaultValue) => {
    return content?.socialProofTestimonials?.[index]?.[field] || defaultValue;
  }

  const testimonialsToDisplay = Array(3).fill(null).map((_, i) => ({
    id: defaultTestimonials[i]?.id || i + 1,
    author: getTestimonialContent(i, 'author', defaultTestimonials[i]?.author),
    quote: getTestimonialContent(i, 'quote', defaultTestimonials[i]?.quote),
    rating: getTestimonialContent(i, 'rating', defaultTestimonials[i]?.rating),
    identifierQuote: `content.socialProofTestimonials.${i}.quote`,
    identifierAuthor: `content.socialProofTestimonials.${i}.author`,
  }));

  const ctaText = content?.socialProofCtaText || `Join over <span class="font-bold" style="color: ${primaryColor}">10,000+</span> happy customers!`;


  return (
    <section id={`social-proof-${storeId || 'premium'}`} className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <InlineTextEdit
          initialText={sectionTitle}
          onSave={(newText) => updateStoreTextContent('socialProofSectionTitle', newText)}
          isAdmin={!isPublishedView && viewMode === 'edit'}
          as="h2"
          textClassName="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white premium-font-display"
          inputClassName="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white premium-font-display bg-transparent"
          className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white premium-font-display"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsToDisplay.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <InlineTextEdit
                initialText={testimonial.quote}
                onSave={(newText) => updateStoreTextContent(testimonial.identifierQuote, newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="p"
                textClassName="text-gray-600 dark:text-gray-300 mb-6 italic premium-font-body"
                inputClassName="text-gray-600 dark:text-gray-300 mb-6 italic premium-font-body bg-transparent"
                className="text-gray-600 dark:text-gray-300 mb-6 italic premium-font-body"
                useTextarea={true}
                >
                  "{testimonial.quote}"
              </InlineTextEdit>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                >
                  {(testimonial.author || "A").substring(0, 1)}
                </div>
                <InlineTextEdit
                  initialText={testimonial.author}
                  onSave={(newText) => updateStoreTextContent(testimonial.identifierAuthor, newText)}
                  isAdmin={!isPublishedView && viewMode === 'edit'}
                  as="p"
                  textClassName="font-semibold text-gray-700 dark:text-white premium-font-body"
                  inputClassName="font-semibold text-gray-700 dark:text-white premium-font-body bg-transparent"
                  className="font-semibold text-gray-700 dark:text-white premium-font-body"
                />
              </div>
            </div>
          ))}
        </div>
        {/* The CTA text block has been removed */}
      </div>
    </section>
  );
};

export default SocialProof;
