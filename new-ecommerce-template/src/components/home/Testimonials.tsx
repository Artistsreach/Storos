import React from 'react';
import { Star, UserCircle } from 'lucide-react'; // UserCircle as a generic avatar
import { motion } from 'framer-motion';
import { Review } from '@/lib/types'; // Assuming Review type is defined
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
  testimonial: Review; // Using Review type for testimonials
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, className }) => {
  return (
    <motion.div
      className={cn(
        "bg-card text-card-foreground p-6 rounded-xl shadow-lg flex flex-col",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        {/* Placeholder for avatar - could use an image if available in Review type */}
        <UserCircle className="h-10 w-10 text-muted-foreground mr-3" />
        <div>
          <p className="font-semibold text-foreground">{testimonial.userName}</p>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
        "{testimonial.comment}"
      </blockquote>
      <p className="text-xs text-muted-foreground/70 mt-4 text-right">
        {new Date(testimonial.createdAt).toLocaleDateString()}
      </p>
    </motion.div>
  );
};

interface TestimonialsProps {
  testimonials: Review[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12 md:mb-16 text-foreground">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
              // Add a slight delay stagger for animation
              // This requires adjusting the transition in TestimonialCard or passing delay as prop
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
