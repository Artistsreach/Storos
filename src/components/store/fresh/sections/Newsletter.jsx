import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";

const StoreNewsletter = ({ store, isPublishedView = false }) => {
  const { theme, content, name: storeName, id: storeId } = store;
  const { toast } = useToast();
  const { updateStoreTextContent, viewMode } = useStore();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heading = content?.newsletterHeading || `Stay Fresh, Stay Updated`;
  const text =
    content?.newsletterText ||
    `Be the first to know about our newest arrivals, exclusive sales, and fresh ideas delivered right to your inbox.`;
  const inputPlaceholderText = content?.newsletterInputPlaceholder || "your.email@example.com"; // Renamed for clarity
  const buttonText = content?.newsletterButtonText || "Subscribe";
  const privacyText = content?.newsletterPrivacyText || "We respect your privacy. Unsubscribe at any time.";
  const successMessage = content?.newsletterSuccessMessage || `You're now on the list for ${storeName}'s freshest updates.`;


  const primaryColor = theme?.primaryColor || "#3B82F6"; // Default fresh blue


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast({
      title: "Subscribed! 🎉",
      description: `You're now on the list for ${storeName}'s freshest updates.`,
    });
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <section id={`newsletter-${storeId}`} className="py-16 md:py-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/90 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-30 dark:opacity-20 blur-3xl animate-pulse-slow" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 sm:p-10 md:p-12 rounded-3xl border border-slate-200/70 dark:border-slate-700/70 shadow-xl"
        >
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}20)`}}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness:150 }}
            >
              <Mail className="w-8 h-8" style={{ color: primaryColor }} />
            </motion.div>

            <InlineTextEdit
              initialText={heading}
              onSave={(newText) => updateStoreTextContent('newsletterHeading', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="h2"
              textClassName="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-slate-800 dark:text-white"
              inputClassName="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-slate-800 dark:text-white bg-transparent"
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-slate-800 dark:text-white"
            />
            <InlineTextEdit
              initialText={text}
              onSave={(newText) => updateStoreTextContent('newsletterText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-slate-600 dark:text-slate-300 mb-8 text-md md:text-lg leading-relaxed max-w-xl mx-auto"
              inputClassName="text-slate-600 dark:text-slate-300 mb-8 text-md md:text-lg leading-relaxed max-w-xl mx-auto bg-transparent"
              className="text-slate-600 dark:text-slate-300 mb-8 text-md md:text-lg leading-relaxed max-w-xl mx-auto"
              useTextarea={true}
            />

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <div className="relative flex-grow">
                <Input
                  type="email"
                  placeholder={inputPlaceholderText}
                  className="h-12 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300/80 dark:border-slate-600/80 rounded-xl focus:ring-primary/30 focus:border-primary/60 transition-all duration-300 pl-5 pr-5 text-slate-700 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 text-sm bg-primary hover:bg-primary/90 text-white border-0 rounded-xl px-6 shadow-md hover:shadow-lg group transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </motion.div>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <InlineTextEdit
                      initialText={buttonText}
                      onSave={(newText) => updateStoreTextContent('newsletterButtonText', newText)}
                      isAdmin={!isPublishedView && viewMode === 'edit'}
                      as="span"
                      textClassName=""
                      inputClassName="bg-transparent"
                    />
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </form>
            <InlineTextEdit
              initialText={privacyText}
              onSave={(newText) => updateStoreTextContent('newsletterPrivacyText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-xs text-slate-500 dark:text-slate-400 mt-4"
              inputClassName="text-xs text-slate-500 dark:text-slate-400 mt-4 bg-transparent"
              className="text-xs text-slate-500 dark:text-slate-400 mt-4"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StoreNewsletter;
