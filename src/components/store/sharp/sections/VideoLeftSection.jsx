import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/button'; // Corrected path
import { PlayCircle, Check, ArrowRight } from 'lucide-react'; // Added ArrowRight
import { useStore } from '../../../../contexts/StoreContext';
import InlineTextEdit from '../../../ui/InlineTextEdit';

const VideoLeftSection = ({ store, isPublishedView = false }) => {
  const { content, theme, id: storeId } = store;
  const { updateStoreTextContent, viewMode } = useStore();

  const sectionTitle = content?.videoLeftSectionTitle || "Experience Our Craft";
  const sectionSubtitle = content?.videoLeftSectionSubtitle || "See the dedication and precision that goes into every product we create.";
  const sectionText = content?.videoLeftSectionText || "Our commitment to excellence is evident in our process. Watch to learn more about our values and the journey of our products from concept to your hands.";
  const ctaText = content?.videoLeftSectionCtaText || "View Our Catalog";
  const ctaLink = content?.videoLeftSectionCtaLink || `#products-${storeId}`; 
  const videoUrl = content?.videoLeftSectionVideoUrl || "https://videos.pexels.com/video-files/3209828/3209828-hd_1280_720_25fps.mp4"; // Default Pexels video (e.g., workshop/crafting)
  const videoPosterUrl = content?.videoLeftSectionVideoPosterUrl || "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"; // Default poster

  const primaryColor = theme?.primaryColor || "#DC2626"; // Default red-600

  const listItems = content?.videoLeftSectionListItems || [
    "Detail-Oriented Design",
    "Expert Assembly Process",
    "Rigorous Testing Protocols",
    "Sustainable Sourcing",
  ];

  return (
    <section id={`video-left-${storeId}`} className="py-16 md:py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="aspect-video lg:aspect-[16/10] rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/50"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {videoUrl ? (
              <video
                src={videoUrl}
                poster={videoPosterUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-slate-600" />
              </div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <InlineTextEdit
              initialText={sectionTitle}
              onSave={(newText) => updateStoreTextContent('videoLeftSectionTitle', newText)}
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
              onSave={(newText) => updateStoreTextContent('videoLeftSectionSubtitle', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-xl md:text-2xl text-slate-200 mb-6 leading-relaxed font-sans"
              inputClassName="text-xl md:text-2xl text-slate-200 mb-6 leading-relaxed font-sans bg-transparent"
              className="text-xl md:text-2xl text-slate-200 mb-6 leading-relaxed font-sans" // Changed font, increased size
              useTextarea={true}
            />
            <InlineTextEdit
              initialText={sectionText}
              onSave={(newText) => updateStoreTextContent('videoLeftSectionText', newText)}
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
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Check className="w-5 h-5 flex-shrink-0" style={{color: primaryColor}} />
                  <InlineTextEdit
                    initialText={item}
                    onSave={(newText) => updateStoreTextContent(`videoLeftSectionListItems.${index}`, newText)}
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
                      onSave={(newText) => updateStoreTextContent('videoLeftSectionCtaText', newText)}
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
        </div>
      </div>
    </section>
  );
};

export default VideoLeftSection;
