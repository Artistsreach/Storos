import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react'; // PlayCircle might be unused if secondary CTA doesn't use it
import { motion } from 'framer-motion';

// Define props interface for HeroSection
interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  videoUrl?: string;
  imageUrl?: string; // Fallback image or poster for video
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  primaryColor?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Elevate Your Everyday", // Default title
  subtitle = "Discover premium collections designed for modern living. Quality craftsmanship, timeless style.", // Default subtitle
  videoUrl,
  imageUrl = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80", // Default image if none provided
  primaryCtaText = "Shop New Arrivals",
  primaryCtaLink = "#featured-products", // Changed to just the hash for same-page scroll
  secondaryCtaText = "Explore Collections",
  secondaryCtaLink = "#featured-collections", // Changed to scroll to featured collections section
  primaryColor,
}) => {

  const handleScrollToFeatured = (event: React.MouseEvent) => {
    // Prevent default if we were using a plain <a> tag, but Link handles hash navigation.
    // The main purpose here is to ensure smooth scrolling.
    // event.preventDefault(); // Not strictly necessary for Link to hash on same page
    const element = document.getElementById('featured-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToCollections = (event: React.MouseEvent) => {
    const element = document.getElementById('featured-collections');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-gray-100 to-stone-200 dark:from-slate-900 dark:via-gray-800 dark:to-stone-900 py-20 md:py-32 lg:py-40 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left space-y-6 lg:space-y-8"
          >
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight"
              style={primaryColor ? { color: primaryColor } : {}}
            >
              {title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Button asChild size="lg" className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
                <Link to={primaryCtaLink} onClick={handleScrollToFeatured}>
                  {primaryCtaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-foreground border-foreground/30 hover:bg-foreground/5">
                <Link to={secondaryCtaLink} onClick={handleScrollToCollections}>
                  {/* <PlayCircle className="mr-2 h-5 w-5" /> */} {/* Icon can be added if desired */}
                  {secondaryCtaText}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Visual Content (Image/Video) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group"
          >
            {videoUrl ? (
              <video
                key={videoUrl} // Add key to re-render video if src changes
                src={videoUrl}
                poster={imageUrl} // Use imageUrl as poster
                autoPlay
                loop
                muted
                playsInline // Important for iOS
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <picture>
                {/* <source srcSet={imageUrlMobile} media="(max-width: 767px)" /> */}
                {/* <source srcSet={imageUrlDesktop} media="(min-width: 768px)" /> */}
                <img
                  src={imageUrl}
                  alt="Hero visual"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  loading="eager"
                />
              </picture>
            )}
            {/* If using video:
            <video
              src={videoUrl}
              poster={heroData.imageUrl} // Use image as poster
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            */}
            {/* Overlay div removed for testing video visibility in light mode */}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div> */}
          </motion.div>
        </div>
      </div>
      {/* Optional: Decorative background elements */}
      {/* <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl opacity-50"></div> */}
      {/* <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl opacity-50"></div> */}
    </section>
  );
};

export default HeroSection;
