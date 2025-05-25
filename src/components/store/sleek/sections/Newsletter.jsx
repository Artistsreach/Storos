import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send } from "lucide-react";

const Newsletter = ({ store }) => {
  const { theme, id: storeId } = store;
  const primaryColor = theme?.primaryColor || "#3B82F6";
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic email validation
    if (email && email.includes("@")) {
      console.log("Newsletter subscription:", email);
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 3000); // Reset after 3 seconds
    } else {
      alert("Please enter a valid email address.");
    }
  };

  return (
    <section
      id={`newsletter-${storeId}`}
      className="py-24 bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-primary/10 dark:via-gray-900 dark:to-secondary/10"
      style={{
        "--tw-gradient-from": `${primaryColor}0D`,
        "--tw-gradient-to": `${theme?.secondaryColor || "#6D28D9"}0D`,
      }}
    >
      <div className="container mx-auto px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center bg-white/70 dark:bg-black/70 backdrop-blur-2xl p-10 md:p-16 shadow-float-lg border border-white/50 dark:border-white/20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-block p-5 bg-primary/10 border border-primary/20 mb-8"
            style={{
              backgroundColor: `${primaryColor}1A`,
              borderColor: `${primaryColor}33`,
            }}
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mail className="w-12 h-12" style={{ color: primaryColor }} />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-inter tracking-tight text-foreground">
            Stay Updated with Us
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 font-inter">
            Subscribe to our newsletter for the latest collections, exclusive
            offers, and style inspiration.
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-lg font-medium font-inter p-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700"
              style={{ color: primaryColor }}
            >
              Thank you for subscribing!
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <div className="relative flex-grow">
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5"
                  style={{ color: `${primaryColor}80` }}
                />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 text-lg border-white/30 dark:border-white/20 focus:border-primary/60 bg-white/50 dark:bg-black/50 backdrop-blur-md transition-all duration-300 text-foreground placeholder-muted-foreground font-inter"
                  style={{
                    borderColor: `${primaryColor}4D`,
                    "--focus-border-color": primaryColor,
                  }}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="group relative overflow-hidden px-8 py-3 text-lg font-semibold shadow-glass hover:shadow-float transition-all duration-500 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50 backdrop-blur-md font-inter tracking-wide"
                style={{
                  backgroundColor: primaryColor,
                  borderColor: `${primaryColor}80`,
                  color: theme?.primaryForegroundColor || "#FFFFFF",
                }}
              >
                <motion.span
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ x: 2 }}
                >
                  Subscribe
                  <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.span>
              </Button>
            </form>
          )}
          <p className="text-xs text-muted-foreground/80 mt-6 font-inter">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
