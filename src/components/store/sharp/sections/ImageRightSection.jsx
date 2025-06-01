import React, { useState } from 'react'; // Added useState
import { motion } from 'framer-motion';
import { Button } from '../../../ui/button'; 
import { ArrowRight, CheckSquare, Edit2Icon, Wand2 as WandIcon } from 'lucide-react'; // Added Edit2Icon, WandIcon
import { useStore } from '../../../../contexts/StoreContext';
import InlineTextEdit from '../../../ui/InlineTextEdit';
import ChangeImageModal from '../../ChangeImageModal'; // Import ChangeImageModal
import EditImageModal from '../../EditImageModal';   // Import EditImageModal

const ImageRightSection = ({ store, isPublishedView = false }) => {
  const { content, theme, id: storeId } = store;
  const { updateStoreTextContent, updateStore, viewMode } = useStore(); // Added updateStore

  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);
  const [isEditImageModalOpen, setIsEditImageModalOpen] = useState(false);

  const sectionTitle = content?.imageRightSectionTitle || "Our Commitment to Quality";
  const sectionSubtitle = content?.imageRightSectionSubtitle || "Discover the difference that dedication and precision engineering make in every product we offer.";
  const sectionText = content?.imageRightSectionText || "We meticulously source the best materials and employ advanced manufacturing techniques to ensure every item meets the highest standards. Our quality control is rigorous, because we know you depend on it.";
  const ctaText = content?.imageRightSectionCtaText || "Explore Our Process";
  const ctaLink = content?.imageRightSectionCtaLink || "#"; // Placeholder link
  const imageUrl = content?.imageRightSectionImageUrl || "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"; 
  
  const primaryColor = theme?.primaryColor || "#2563EB"; // Default blue-600

  const listItems = content?.imageRightSectionListItems || [
    "Premium Grade Materials",
    "State-of-the-Art Manufacturing",
    "Rigorous Quality Assurance",
    "Expert Craftsmanship",
  ];

  return (
    <section id={`image-right-${storeId}`} className="py-16 md:py-24 bg-slate-800/30 text-white overflow-hidden">
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
              <span className="bg-gradient-to-r from-slate-100 via-blue-400 to-sky-400 bg-clip-text text-transparent">
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
                  className="group rounded-md px-8 py-3 text-base font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 font-mono uppercase tracking-wider"
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
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="aspect-square lg:aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/50 relative group" // Merged className attributes
          >
            <img
              src={imageUrl}
              alt={sectionTitle || "Section image"}
              className="w-full h-full object-cover"
            />
            {!isPublishedView && viewMode === 'edit' && (
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-background/70 hover:bg-background/90 text-foreground rounded-md p-2"
                  onClick={() => setIsChangeImageModalOpen(true)}
                  title="Change Section Image"
                >
                  <Edit2Icon className="h-4 w-4 mr-1" /> Change
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-background/70 hover:bg-background/90 text-foreground rounded-md p-2"
                  onClick={() => setIsEditImageModalOpen(true)}
                  title="Edit Section Image with AI"
                >
                  <WandIcon className="h-4 w-4 mr-1" /> Edit AI
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {!isPublishedView && viewMode === 'edit' && (
        <>
          <ChangeImageModal
            isOpen={isChangeImageModalOpen}
            onOpenChange={setIsChangeImageModalOpen}
            currentImageUrl={imageUrl}
            onImageSelected={async (newImageUrl) => {
              await updateStore(storeId, {
                content: {
                  ...content,
                  imageRightSectionImageUrl: newImageUrl,
                },
              });
              setIsChangeImageModalOpen(false);
            }}
            imageSearchContext={`image for "${sectionTitle}" section`}
            modalTitle="Change Section Image"
            storeName={store.name}
          />
          <EditImageModal
            isOpen={isEditImageModalOpen}
            onOpenChange={setIsEditImageModalOpen}
            currentImageUrl={imageUrl}
            onImageEdited={async (newImageUrl) => {
              await updateStore(storeId, {
                content: {
                  ...content,
                  imageRightSectionImageUrl: newImageUrl,
                },
              });
              setIsEditImageModalOpen(false);
            }}
            imageContext={`image for "${sectionTitle}" section`}
            modalTitle="Edit Section Image with AI"
          />
        </>
      )}
    </section>
  );
};

export default ImageRightSection;
