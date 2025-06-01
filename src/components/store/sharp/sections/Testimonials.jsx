import React from 'react';
import { motion } from 'framer-motion';
import { Star, UserCircle, MessageSquare } from 'lucide-react';
import { useStore } from '../../../../contexts/StoreContext';
import InlineTextEdit from '../../../ui/InlineTextEdit';

const defaultTestimonials = [
  {
    quote: "This product is fantastic! It exceeded all my expectations and has become an essential part of my daily routine.",
    author: "Alex Morgan",
    role: "Verified Customer",
    rating: 5,
    avatar: "", // Placeholder for avatar image URL
  },
  {
    quote: "The quality and craftsmanship are truly outstanding. I'm so impressed with the attention to detail.",
    author: "Jamie Lee",
    role: "Happy Shopper",
    rating: 5,
    avatar: "",
  },
  {
    quote: "Customer service was incredibly helpful and responsive. They made sure I found exactly what I needed. Shipping was fast too!",
    author: "Casey Jordan",
    role: "Loyal Customer",
    rating: 4,
    avatar: "",
  },
];

const Testimonials = ({ store, isPublishedView = false }) => {
  const { content, theme, id: storeId } = store;
  const { updateStoreTextContent, viewMode } = useStore();

  const sectionTitle = content?.testimonialsSectionTitle || "What Our Customers Say";
  const badgeText = content?.testimonialsBadgeText || "Customer Feedback";
  const testimonials = content?.testimonials?.length ? content.testimonials.map((t, i) => ({
    ...defaultTestimonials[i % defaultTestimonials.length], // cycle through defaults if not enough
    ...t,
    // Ensure identifiers are always present for saving
    identifierQuote: `testimonials.${i}.quote`,
    identifierAuthor: `testimonials.${i}.author`,
    identifierRole: `testimonials.${i}.role`,
  })) : defaultTestimonials.slice(0,3).map((t, i) => ({
    ...t,
    identifierQuote: `testimonials.${i}.quote`,
    identifierAuthor: `testimonials.${i}.author`,
    identifierRole: `testimonials.${i}.role`,
  }));
  const primaryColor = theme?.primaryColor || "#2563EB"; // Default blue-600

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
  };

  return (
    <section id={`testimonials-${storeId}`} className="py-16 md:py-24 bg-slate-800/50 text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-800/30 rounded-md text-xs font-semibold text-blue-300 mb-4 border border-blue-700/50 font-mono uppercase tracking-widest"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <InlineTextEdit
              initialText={badgeText}
              onSave={(newText) => updateStoreTextContent('testimonialsBadgeText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="span"
              textClassName=""
              inputClassName="bg-transparent"
            />
          </motion.div>
          <InlineTextEdit
            initialText={sectionTitle}
            onSave={(newText) => updateStoreTextContent('testimonialsSectionTitle', newText)}
            isAdmin={!isPublishedView && viewMode === 'edit'}
            as="h2"
            textClassName="text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase"
            inputClassName="text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase bg-transparent"
            className="text-3xl md:text-5xl font-extrabold tracking-tight font-mono uppercase"
          >
            <span className="bg-gradient-to-r from-slate-100 via-blue-400 to-sky-400 bg-clip-text text-transparent">
              {sectionTitle}
            </span>
          </InlineTextEdit>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-slate-900/70 p-6 rounded-lg shadow-xl border border-slate-700/80 flex flex-col"
            >
              <div className="flex items-center mb-4">
                {testimonial.avatar ? (
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4 border-2 border-blue-500/70 object-cover" />
                ) : (
                  <UserCircle className="w-12 h-12 text-slate-500 mr-4" />
                )}
                <div>
                  <InlineTextEdit
                    initialText={testimonial.author}
                    onSave={(newText) => updateStoreTextContent(testimonial.identifierAuthor, newText)}
                    isAdmin={!isPublishedView && viewMode === 'edit'}
                    as="h4"
                    textClassName="font-semibold text-lg text-slate-100 font-mono"
                    inputClassName="font-semibold text-lg text-slate-100 font-mono bg-transparent"
                    className="font-semibold text-lg text-slate-100 font-mono"
                  />
                  <InlineTextEdit
                    initialText={testimonial.role}
                    onSave={(newText) => updateStoreTextContent(testimonial.identifierRole, newText)}
                    isAdmin={!isPublishedView && viewMode === 'edit'}
                    as="p"
                    textClassName="text-xs text-blue-400 font-mono uppercase tracking-wider"
                    inputClassName="text-xs text-blue-400 font-mono uppercase tracking-wider bg-transparent"
                    className="text-xs text-blue-400 font-mono uppercase tracking-wider"
                  />
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}`}
                  />
                ))}
              </div>
              <InlineTextEdit
                initialText={testimonial.quote}
                onSave={(newText) => updateStoreTextContent(testimonial.identifierQuote, newText)}
                isAdmin={!isPublishedView && viewMode === 'edit'}
                as="blockquote"
                textClassName="text-slate-300 italic leading-relaxed flex-grow"
                inputClassName="text-slate-300 italic leading-relaxed flex-grow bg-transparent"
                className="text-slate-300 italic leading-relaxed flex-grow"
                useTextarea={true}
              >
                "{testimonial.quote}"
              </InlineTextEdit>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
