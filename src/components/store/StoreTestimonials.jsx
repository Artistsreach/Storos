import React from 'react';
import { Star, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext'; // Import useStore
import InlineTextEdit from '@/components/ui/InlineTextEdit'; // Import InlineTextEdit

const TestimonialCard = ({ testimonial, className, index }) => { // Added index for identifier
  const { updateStoreTextContent } = useStore();

  const userName = testimonial?.userName || testimonial?.user_name || testimonial?.author || "Anonymous";
  const rating = testimonial?.rating || 0; // Rating editing is not covered by InlineTextEdit
  const comment = testimonial?.comment || testimonial?.text || "No comment provided.";
  const photoUrl = testimonial?.photoUrl;
  const createdAtDate = testimonial?.createdAt || testimonial?.created_at;
  let displayDate = 'Date not available';

  if (createdAtDate) {
    try {
      displayDate = new Date(createdAtDate).toLocaleDateString();
    } catch (e) {
      console.error("Error parsing testimonial date:", e);
    }
  }

  // Note: Editing for userName and date is more complex if these are tied to actual user data or timestamps.
  // For now, only making the comment editable. User name might be editable if it's just a display name.
  // Rating and photoUrl would need different UI controls.

  return (
    <motion.div
      className={cn(
        "bg-card text-card-foreground p-6 rounded-md shadow-lg flex flex-col",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        {photoUrl ? (
          <img src={photoUrl} alt={userName} className="h-10 w-10 rounded-full mr-3 object-cover" />
        ) : (
          <UserCircle className="h-10 w-10 text-muted-foreground mr-3" />
        )}
        <div>
          <InlineTextEdit
            initialText={userName}
            onSave={updateStoreTextContent}
            identifier={`reviews.${index}.userName`} // Assuming reviews are stored in store.reviews
            as="p"
            className="font-semibold text-foreground"
          >
            {userName}
          </InlineTextEdit>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <InlineTextEdit
        initialText={comment}
        onSave={updateStoreTextContent}
        identifier={`reviews.${index}.comment`}
        as="blockquote"
        className="text-sm text-muted-foreground italic leading-relaxed flex-grow" // Added flex-grow
      >
        "{comment}"
      </InlineTextEdit>
      <p className="text-xs text-muted-foreground/70 mt-4 text-right">
        {displayDate} 
      </p>
    </motion.div>
  );
};

// Sample testimonials are used if store.reviews is empty. These won't be editable via context.
const sampleTestimonials = [
  {
    id: 'sample1', // Sample data won't be editable through context
    userName: 'Alex P.',
    rating: 5,
    comment: "Absolutely love this product! The quality is outstanding and it exceeded my expectations. Highly recommend to everyone.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: 'sample2',
    userName: 'Jamie L.',
    rating: 4,
    comment: "Great value for the price. It works as described and looks fantastic. Shipping was also quite fast.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: 'sample3',
    userName: 'Casey B.',
    rating: 5,
    comment: "Customer service was excellent when I had a question. The product itself is top-notch. Will definitely shop here again!",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

const StoreTestimonials = ({ store, isPublishedView = false }) => {
  const { updateStoreTextContent } = useStore();
  const actualReviews = store?.reviews; // Assuming reviews are stored in store.reviews
  const testimonialsToDisplay = (!actualReviews || actualReviews.length === 0) ? sampleTestimonials : actualReviews;
  
  const sectionTitle = store?.content?.testimonialsSectionTitle || "What Our Customers Say";

  if (!testimonialsToDisplay || testimonialsToDisplay.length === 0) {
    return null;
  }

  return (
    <section id={`testimonials-${store?.id || 'store-testimonials'}`} className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <InlineTextEdit
          initialText={sectionTitle}
          onSave={updateStoreTextContent}
          identifier="content.testimonialsSectionTitle"
          as="h2"
          className="text-3xl font-bold tracking-tight text-center mb-12 md:mb-16 text-foreground"
        >
          {sectionTitle}
        </InlineTextEdit>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonialsToDisplay.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id || testimonial.userName + String(testimonial.createdAt)} 
              testimonial={testimonial}
              index={index} // Pass index for identifier
              // Only make editable if it's not sample data
              // This logic might be better inside TestimonialCard if it needs access to viewMode
              // For now, assuming updateStoreTextContent handles non-existent paths gracefully or StoreContext handles it.
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreTestimonials;
