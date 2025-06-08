import React from 'react';
import { motion } from 'framer-motion';
import InlineTextEdit from '../ui/InlineTextEdit.jsx';
import { useStore } from '../../contexts/StoreContext.jsx'; // Assuming this context provides updateStore or similar
import { Sparkles, Leaf, Zap, Heart, Target, Palette } from 'lucide-react'; // Example icons

const StoreWaySection = ({ store, isPublishedView = false }) => {
  const { updateStore } = useStore(); // Or a more specific update function if available
  const storeName = store?.name || "Our Store";
  const storeId = store?.id;
  const isAdmin = !isPublishedView;

  // Default content for "The [StoreName] Way" section
  // Emojis are placeholders and should be dynamically assigned or chosen by the user.
  const defaultWayContent = {
    title: `The ${storeName} Way`,
    subtitle: `Discover the core values that make us unique.`,
    items: [
      {
        emoji: "✨", // Placeholder, ideally an icon component or dynamic emoji
        icon: Sparkles, // Lucide icon as fallback or primary
        title: "Quality First",
        description: "We prioritize premium materials and craftsmanship in every product.",
      },
      {
        emoji: "🌿",
        icon: Leaf,
        title: "Sustainable Practices",
        description: "Committed to eco-friendly sourcing and ethical production.",
      },
      {
        emoji: "⚡️",
        icon: Zap,
        title: "Innovative Design",
        description: "Blending timeless styles with modern, cutting-edge aesthetics.",
      },
      {
        emoji: "💖",
        icon: Heart,
        title: "Customer Love",
        description: "Our customers are at the heart of everything we do.",
      },
    ],
  };

  // Use store.content.storeWay if available, otherwise use default
  const wayContent = store?.content?.storeWay || defaultWayContent;
  
  // If AI provides items (even if fewer than default), use them. Otherwise, use default.
  // This ensures AI-generated emojis are prioritized.
  const itemsToDisplay = (wayContent.items && wayContent.items.length > 0)
    ? wayContent.items
    : defaultWayContent.items;


  const handleSaveText = async (field, value, itemIndex = null) => {
    if (!storeId) return;

    // Ensure we are working with a mutable copy of the items that are actually being displayed.
    // And that the overall structure reflects the current wayContent (title, subtitle)
    // but uses the potentially modified itemsToDisplay for the items part.
    let newStoreWayContent = { 
      title: wayContent.title, 
      subtitle: wayContent.subtitle, 
      items: [...itemsToDisplay].map(item => ({...item})) // Deep copy of items
    };

    if (itemIndex !== null && newStoreWayContent.items[itemIndex]) { // Check if item exists at index
      if (field === 'itemTitle') {
        newStoreWayContent.items[itemIndex].title = value;
      } else if (field === 'itemDescription') {
        newStoreWayContent.items[itemIndex].description = value;
      } else if (field === 'itemEmoji') {
        newStoreWayContent.items[itemIndex].emoji = value;
      }
    } else {
      if (field === 'title') {
        newStoreWayContent.title = value;
      } else if (field === 'subtitle') {
        newStoreWayContent.subtitle = value;
      }
    }

    try {
      await updateStore(storeId, {
        content: {
          ...store.content,
          storeWay: newStoreWayContent,
        },
      });
    } catch (error) {
      console.error(`Failed to update store way content for ${field}:`, error);
    }
  };
  
  const IconComponent = ({ item }) => {
    const Icon = item.icon || Target; // Default to Target if no icon specified
    return <Icon className="w-8 h-8 mb-4 text-[var(--theme-primary)]" />;
  };

  const template = store?.template_version || 'classic';

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className={`inline-flex items-center justify-center bg-[var(--theme-primary-10)] p-3 mb-4 ${template !== 'sleek' ? 'rounded-full' : ''}`}>
             <Palette className="h-8 w-8 text-[var(--theme-primary)]" />
          </div>
          <InlineTextEdit
            initialText={wayContent.title}
            onSave={(newText) => handleSaveText('title', newText)}
            isAdmin={isAdmin}
            placeholder="Section Title"
            as="h2"
            textClassName="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          />
          <InlineTextEdit
            initialText={wayContent.subtitle}
            onSave={(newText) => handleSaveText('subtitle', newText)}
            isAdmin={isAdmin}
            placeholder="Section Subtitle"
            as="p"
            textClassName="text-lg text-muted-foreground max-w-xl mx-auto mt-3"
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {itemsToDisplay.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
              className={`bg-card p-6 shadow-lg text-center border border-border/50 hover:shadow-2xl transition-shadow ${template !== 'sleek' ? 'rounded-xl' : ''}`}
            >
              <div className="flex justify-center items-center mb-4">
                {isAdmin ? (
                  <InlineTextEdit
                    initialText={item.emoji}
                    onSave={(newText) => handleSaveText('itemEmoji', newText, index)}
                    isAdmin={isAdmin}
                    placeholder="✨"
                    textClassName="text-4xl" // Larger emoji
                  />
                ) : (
                  <span className="text-4xl">{item.emoji}</span>
                )}
                 {/* Fallback or primary icon display */}
                {!item.emoji && <IconComponent item={item} />}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                <InlineTextEdit
                  initialText={item.title}
                  onSave={(newText) => handleSaveText('itemTitle', newText, index)}
                  isAdmin={isAdmin}
                  placeholder="Item Title"
                />
              </h3>
              <p className="text-muted-foreground text-sm">
                <InlineTextEdit
                  initialText={item.description}
                  onSave={(newText) => handleSaveText('itemDescription', newText, index)}
                  isAdmin={isAdmin}
                  placeholder="Item Description"
                  useTextarea={true}
                />
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreWaySection;
