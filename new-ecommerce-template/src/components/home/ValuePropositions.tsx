import React from 'react';
import { ShieldCheck, Truck, Leaf, MessageCircle, CreditCard } from 'lucide-react'; // Changed MessageSquareHeart to MessageCircle
import { motion } from 'framer-motion';

interface Proposition {
  icon: React.ElementType;
  title: string;
  description: string;
}

const propositions: Proposition[] = [
  {
    icon: Truck,
    title: 'Free & Fast Shipping',
    description: 'Get your orders delivered quickly and without extra charges.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    description: 'Crafted with eco-friendly materials for a greener planet.',
  },
  {
    icon: ShieldCheck, // Changed from CreditCard to ShieldCheck for Secure Payments
    title: 'Secure Payments',
    description: 'Shop with confidence using our secure payment gateways.',
  },
  {
    icon: MessageCircle, // Changed MessageSquareHeart to MessageCircle
    title: '24/7 Customer Support',
    description: 'Our dedicated team is here to help you around the clock.',
  },
];

const ValuePropositions: React.FC = () => {
  return (
    // Changed background to a gradient: from theme's background to a semi-transparent muted color
    // In light mode, this will be from white (or light page bg) to light gray.
    // In dark mode, this will be from dark page bg to a darker semi-transparent muted color.
    <section 
      id="value-propositions" 
      className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 dark:to-muted/10"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12 md:mb-16 text-foreground">
          Why Shop With Us?
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {propositions.map((prop, index) => (
            <motion.div
              key={prop.title}
              className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <prop.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{prop.title}</h3>
              <p className="text-sm text-muted-foreground">{prop.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositions;
