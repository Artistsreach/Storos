import React from 'react';
import { Star, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
// import { Review } from '@/lib/types'; // Assuming Review type is available or adaptable
import { cn } from '@/lib/utils'; // Assuming cn utility is available

// Assuming Review type is similar or can be adapted from store.reviews
// interface Review {
//   id: string;
//   userName: string;
//   rating: number;
//   comment: string;
//   createdAt: string; // Or Date object
//   photoUrl?: string; // Added for sample data
// }

const TestimonialCard = ({ testimonial, className }) => {
  // Adapt testimonial properties
  const userName = testimonial?.userName || testimonial?.user_name || testimonial?.author || "Anonymous";
  const rating = testimonial?.rating || 0;
  const comment = testimonial?.comment || testimonial?.text || "No comment provided.";
  const photoUrl = testimonial?.photoUrl; // Get photoUrl
  const createdAtDate = testimonial?.createdAt || testimonial?.created_at;
  let displayDate = 'Date not available';

  if (createdAtDate) {
    try {
      displayDate = new Date(createdAtDate).toLocaleDateString();
    } catch (e) {
      console.error("Error parsing testimonial date:", e);
    }
  }

  return (
    <motion.div
      className={cn(
        "bg-card text-card-foreground p-6 rounded-md shadow-lg flex flex-col", // Changed rounded-xl to rounded-md
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
          <p className="font-semibold text-foreground">{userName}</p>
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
        "{comment}"
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
  const actualReviews = store?.reviews;
  const testimonialsToDisplay = (!actualReviews || actualReviews.length === 0) ? sampleTestimonials : actualReviews;

  // If even sample data is empty (which it shouldn't be here), then return null.
  if (!testimonialsToDisplay || testimonialsToDisplay.length === 0) {
    return null;
  }

  return (
    <section id={`testimonials-${store?.id || 'store-testimonials'}`} className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12 md:mb-16 text-foreground">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonialsToDisplay.map((testimonial) => (
            <TestimonialCard 
              key={testimonial.id || testimonial.userName + String(testimonial.createdAt)} 
              testimonial={testimonial} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreTestimonials;
