import React from 'react';
import { Star, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import InlineTextEdit from '@/components/ui/InlineTextEdit';
import { useStore } from '@/contexts/StoreContext';

const TestimonialCard = ({ testimonial, className, isAdmin, onSave, index }) => {
  const userName = testimonial?.userName || testimonial?.user_name || testimonial?.author || "Anonymous";
  const rating = testimonial?.rating || 0;
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

  const handleSaveCardText = (field, value) => {
    if (onSave) {
      onSave(index, field, value);
    }
  };

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
          <p className="font-semibold text-foreground">
            <InlineTextEdit
              initialText={userName}
              onSave={(newText) => handleSaveCardText('userName', newText)}
              isAdmin={isAdmin}
              placeholder="User Name"
            />
          </p>
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
      <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
        "
        <InlineTextEdit
          initialText={comment}
          onSave={(newText) => handleSaveCardText('comment', newText)}
          isAdmin={isAdmin}
          placeholder="Testimonial comment"
        />
        "
      </blockquote>
      <p className="text-xs text-muted-foreground/70 mt-4 text-right">
        {displayDate}
      </p>
    </motion.div>
  );
};

const sampleTestimonials = [
  {
    id: 'sample1',
    userName: 'Alex P.',
    rating: 5,
    comment: "Absolutely love this product! The quality is outstanding and it exceeded my expectations. Highly recommend to everyone.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: 'sample2',
    userName: 'Jamie L.',
    rating: 4,
    comment: "Great value for the price. It works as described and looks fantastic. Shipping was also quite fast.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: 'sample3',
    userName: 'Casey B.',
    rating: 5,
    comment: "Customer service was excellent when I had a question. The product itself is top-notch. Will definitely shop here again!",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

const StoreTestimonials = ({ store, isPublishedView = false }) => {
  const { updateStore } = useStore();
  const { content, id: storeId, reviews } = store;
  const isAdmin = !isPublishedView;

  const actualReviews = reviews;
  const testimonialsToDisplay = (!actualReviews || actualReviews.length === 0) ? sampleTestimonials : actualReviews;

  if (!testimonialsToDisplay || testimonialsToDisplay.length === 0) {
    return null;
  }

  const handleSaveText = async (field, value, index = null) => {
    if (storeId) {
      try {
        if (field === 'testimonialsSectionTitle') {
          await updateStore(storeId, { content: { ...content, testimonialsSectionTitle: value } });
        } else if (index !== null && (field === 'userName' || field === 'comment')) {
          // Only update actual reviews, not sample data
          if (actualReviews && actualReviews.length > 0) {
            const updatedReviews = actualReviews.map((review, i) => {
              if (i === index) {
                // Adapt field names if necessary for your review structure
                const keyToUpdate = field === 'userName' ? (review.hasOwnProperty('userName') ? 'userName' : 'user_name') : (review.hasOwnProperty('comment') ? 'comment' : 'text');
                return { ...review, [keyToUpdate]: value };
              }
              return review;
            });
            await updateStore(storeId, { reviews: updatedReviews });
          } else {
            console.warn("Attempted to edit sample testimonial. This action is not saved.");
          }
        }
      } catch (error) {
        console.error(`Failed to update store ${field}:`, error);
      }
    }
  };
  
  const sectionTitle = content?.testimonialsSectionTitle || "What Our Customers Say";

  return (
    <section id={`testimonials-${storeId || 'store-testimonials'}`} className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12 md:mb-16 text-foreground">
          <InlineTextEdit
            initialText={sectionTitle}
            onSave={(newText) => handleSaveText('testimonialsSectionTitle', newText)}
            isAdmin={isAdmin}
            placeholder="Testimonials Section Title"
          />
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonialsToDisplay.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id || testimonial.userName + String(testimonial.createdAt) + index}
              testimonial={testimonial}
              isAdmin={isAdmin}
              onSave={handleSaveText}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreTestimonials;
