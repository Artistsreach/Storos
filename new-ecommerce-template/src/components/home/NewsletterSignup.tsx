import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast'; // Assuming useToast is available

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // For user feedback

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Mock API call
    console.log(`Subscribing email: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    setIsLoading(false);
    setEmail(''); // Clear input after submission
    toast({
      title: "Subscribed!",
      description: "Thanks for subscribing to our newsletter.",
    });
  };

  return (
    <section id="newsletter-signup" className="py-16 md:py-24 bg-primary/5 dark:bg-primary/10">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Mail className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter to get the latest updates on new arrivals, special offers, and exclusive content.
          </p>
          <form 
            onSubmit={handleSubmit} 
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex-grow h-12 text-base bg-background dark:bg-card"
              aria-label="Email for newsletter"
            />
            <Button 
              type="submit" 
              size="lg" 
              disabled={isLoading}
              className="h-12 text-base"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground/70 mr-2"></span>
              ) : null}
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
