import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Eye, Heart, Star, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/contexts/StoreContext";

const ProductCard = ({
  product = {
    id: "1",
    name: "Premium Product",
    description:
      "A high-quality product with exceptional features and modern design.",
    price: 99.99,
    image: {
      src: {
        medium:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      },
    },
  },
  theme = { primaryColor: "#3B82F6" },
  index = 0,
  storeId = "default",
  isPublishedView = false,
  displayMode = "grid",
}) => {
  const { addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = () => {
    if (addToCart) {
      addToCart({
        ...product,
        storeId,
        quantity: 1,
      });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.1,
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="group relative bg-white/10 dark:bg-black/10 backdrop-blur-md overflow-hidden shadow-glass hover:shadow-float transition-all duration-700 border border-white/20 dark:border-white/10 hover:border-primary/30"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        borderColor: isHovered ? `${theme.primaryColor}50` : undefined,
      }}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/5 to-white/10 dark:from-black/5 dark:to-black/10">
        <motion.img
          src={
            product.image?.src?.medium ||
            `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`
          }
          alt={product.name}
          className="w-full h-full object-cover"
          variants={imageVariants}
          whileHover="hover"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Action buttons overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute top-4 right-4 flex flex-col gap-3"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Button
                variant="outline"
                size="icon"
                className="bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white border-white/30 dark:border-white/20 backdrop-blur-md shadow-glass"
              >
                <Eye className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white border-white/30 dark:border-white/20 backdrop-blur-md shadow-glass"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart
                  className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/20 dark:bg-black/20 text-primary text-xs font-inter tracking-wide backdrop-blur-md border border-white/30 dark:border-white/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ backgroundColor: `${theme.primaryColor}30` }}
        />
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-foreground line-clamp-2 font-inter tracking-tight group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 font-inter leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-inter">
            (4.9)
          </span>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-4">
          <div
            className="text-2xl font-bold font-inter"
            style={{ color: theme.primaryColor }}
          >
            ${product.price?.toFixed(2) || "0.00"}
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-foreground border border-white/20 dark:border-white/10 backdrop-blur-md font-inter tracking-wide shadow-glass hover:shadow-float transition-all duration-300"
              style={{
                borderColor: `${theme.primaryColor}40`,
                color: theme.primaryColor,
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Glassmorphism overlay effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${theme.primaryColor}10, transparent)`,
        }}
      />

      {/* Sharp edge decorative elements */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[20px] border-r-transparent border-t-[20px] border-t-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default ProductCard;
