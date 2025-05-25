import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/button'; // Corrected path
import { ArrowRight, CheckSquare } from 'lucide-react';
import { useStore } from '../../../../contexts/StoreContext';
import InlineTextEdit from '../../../ui/InlineTextEdit';

const ImageRightSection = ({ store, isPublishedView = false }) => {
  const { content, theme, id: storeId } = store;
  const { updateStoreTextContent, viewMode } = useStore();

  const sectionTitle = content?.imageRightSectionTitle || "Our Commitment to Quality";
  const sectionSubtitle = content?.imageRightSectionSubtitle || "Discover the difference that dedication and precision engineering make in every product we offer.";
  const sectionText = content?.imageRightSectionText || "We meticulously source the best materials and employ advanced manufacturing techniques to ensure every item meets the highest standards. Our quality control is rigorous, because we know you depend on it.";
  const ctaText = content?.imageRightSectionCtaText || "Explore Our Process";
  const ctaLink = content?.imageRightSectionCtaLink || "#"; // Placeholder link
  const imageUrl = content?.imageRightSectionImageUrl || "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"; // Default Pexels image (team working)
  
  const primaryColor = theme?.primaryColor || "#DC2626"; // Default red-600

  const listItems = content?.imageRightSectionListItems || [
    "Premium Grade Materials",
    "State-of-the-Art Manufacturing",
    "Rigorous Quality Assurance",
    "Expert Craftsmanship",
  ];

  return (
    <section id={`image-right-${storeId}`} className="py-16 md:py-24 bg-slate-800/30 text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <InlineTextEdit
              initialText={sectionTitle}
              onSave={(newText) => updateStoreTextContent('imageRightSectionTitle', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="h2"
              textClassName="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tighter font-mono uppercase"
              inputClassName="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tighter font-mono uppercase bg-transparent"
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tighter font-mono uppercase" // Updated sizes
            >
              <span className="bg-gradient-to-r from-slate-100 via-red-400 to-orange-400 bg-clip-text text-transparent">
                {sectionTitle}
              </span>
            </InlineTextEdit>
            <InlineTextEdit
              initialText={sectionSubtitle}
              onSave={(newText) => updateStoreTextContent('imageRightSectionSubtitle', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-xl md:text-2xl text-slate-200 mb-6 leading-relaxed font-sans"
              inputClassName="text-xl md:text-2xl text-slate-200 mb-6 leading-relaxed font-sans bg-transparent"
              className="text-xl md:text-2xl text-slate-200 mb-6 leading-relaxed font-sans" // Changed font, increased size
              useTextarea={true}
            />
            <InlineTextEdit
              initialText={sectionText}
              onSave={(newText) => updateStoreTextContent('imageRightSectionText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-slate-300 mb-8 leading-relaxed text-md font-sans"
              inputClassName="text-slate-300 mb-8 leading-relaxed text-md font-sans bg-transparent"
              className="text-slate-300 mb-8 leading-relaxed text-md font-sans" // Changed font
              useTextarea={true}
            />
            <ul className="space-y-3 mb-8">
              {listItems.map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-3 text-slate-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CheckSquare className="w-5 h-5 flex-shrink-0" style={{color: primaryColor}} />
                  <InlineTextEdit
                    initialText={item}
                    onSave={(newText) => updateStoreTextContent(`imageRightSectionListItems.${index}`, newText)}
                    isAdmin={!isPublishedView && viewMode === 'edit'}
                    as="span"
                    textClassName="font-mono"
                    inputClassName="font-mono bg-transparent"
                  />
                </motion.li>
              ))}
            </ul>
            {ctaText && ctaLink && (
              <motion.div
                initial={{ opacity:0, y: 20 }}
                whileInView={{ opacity:1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration:0.5, delay:0.4 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="group rounded-md px-8 py-3 text-base font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white border-0 font-mono uppercase tracking-wider"
                >
                  <a href={ctaLink}>
                    <InlineTextEdit
                      initialText={ctaText}
                      onSave={(newText) => updateStoreTextContent('imageRightSectionCtaText', newText)}
                      isAdmin={!isPublishedView && viewMode === 'edit'}
                      as="span"
                      textClassName=""
                      inputClassName="bg-transparent"
                    />
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </motion.div>
            )}
          </motion.div>
          <motion.div
            className="aspect-square lg:aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/50"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <img
              src={imageUrl}
              alt={sectionTitle || "Section image"}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ImageRightSection;
