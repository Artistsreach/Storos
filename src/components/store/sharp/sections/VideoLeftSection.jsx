import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion } from 'framer-motion';
import { Button } from '../../../ui/button'; // Corrected path
import { PlayCircle, Check, ArrowRight, Edit2Icon } from 'lucide-react'; // Added ArrowRight & Edit2Icon
import { useStore } from '../../../../contexts/StoreContext';
import InlineTextEdit from '../../../ui/InlineTextEdit';
import ReplaceVideoModal from '../ReplaceVideoModal';
import { searchPexelsVideos } from '../../../../lib/pexels'; // Added import

const VideoLeftSection = ({ store, isPublishedView = false }) => {
  const { name, content, theme, id: storeId } = store; // Added name
  const { updateStoreTextContent, updateStore, viewMode } = useStore();
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [displayVideoUrl, setDisplayVideoUrl] = useState(content?.videoLeftSectionVideoUrl || "");
  const [displayVideoPosterUrl, setDisplayVideoPosterUrl] = useState(content?.videoLeftSectionVideoPosterUrl || "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1");

  const sectionTitle = content?.videoLeftSectionTitle || "Experience Our Craft";
  const sectionSubtitle = content?.videoLeftSectionSubtitle || "See the dedication and precision that goes into every product we create.";
  const sectionText = content?.videoLeftSectionText || "Our commitment to excellence is evident in our process. Watch to learn more about our values and the journey of our products from concept to your hands.";
  const ctaText = content?.videoLeftSectionCtaText || "View Our Catalog";
  const ctaLink = content?.videoLeftSectionCtaLink || `#products-${storeId}`; 
  
  const fallbackPexelsVideoUrl = "https://videos.pexels.com/video-files/3190334/3190334-hd_1280_720_30fps.mp4"; // Different fallback
  const fallbackPosterUrl = "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"; // Different fallback poster

  const primaryColor = theme?.primaryColor || "#2563EB"; // Default blue-600

  useEffect(() => {
    setDisplayVideoUrl(content?.videoLeftSectionVideoUrl || "");
    setDisplayVideoPosterUrl(content?.videoLeftSectionVideoPosterUrl || fallbackPosterUrl);
  }, [content?.videoLeftSectionVideoUrl, content?.videoLeftSectionVideoPosterUrl]);

  useEffect(() => {
    const fetchRelevantVideo = async () => {
      if (!content?.videoLeftSectionVideoUrl) {
        const query = name || sectionTitle || sectionSubtitle || "craftsmanship";
        try {
          const result = await searchPexelsVideos(query, 1);
          if (result.videos && result.videos.length > 0 && result.videos[0].videoUrl) {
            setDisplayVideoUrl(result.videos[0].videoUrl);
            if (result.videos[0].imageUrl) {
              setDisplayVideoPosterUrl(result.videos[0].imageUrl);
            } else {
              setDisplayVideoPosterUrl(fallbackPosterUrl); // Use fallback if Pexels video has no poster
            }
          } else {
            setDisplayVideoUrl(""); // No relevant video found, show placeholder
            setDisplayVideoPosterUrl(fallbackPosterUrl);
          }
        } catch (error) {
          console.error("Error fetching Pexels video for sharp video left section:", error);
          setDisplayVideoUrl(""); // Show placeholder on error
          setDisplayVideoPosterUrl(fallbackPosterUrl);
        }
      }
    };
    fetchRelevantVideo();
  }, [content?.videoLeftSectionVideoUrl, name, sectionTitle, sectionSubtitle]);

  const handleOpenReplaceModal = () => {
    setIsReplaceModalOpen(true);
  };

  const handleVideoReplaced = async (newVideoUrl) => {
    let newPosterUrl = fallbackPosterUrl;
    if (newVideoUrl) {
        try {
            const videoId = newVideoUrl.match(/pexels\.com\/video-files\/(\d+)\//i);
            if (videoId && videoId[1]) {
                 const pexelsResult = await searchPexelsVideos(videoId[1], 1);
                 if (pexelsResult.videos && pexelsResult.videos.length > 0 && pexelsResult.videos[0].imageUrl) {
                    newPosterUrl = pexelsResult.videos[0].imageUrl;
                 }
            } else {
              newPosterUrl = ""; // Clear poster if not a Pexels video or no specific poster found
            }
        } catch (e) {
            console.warn("Could not fetch Pexels poster for new video", e);
            newPosterUrl = "";
        }
    }

    if (storeId) {
      try {
        await updateStore(storeId, {
          content: {
            ...content,
            videoLeftSectionVideoUrl: newVideoUrl || "",
            videoLeftSectionVideoPosterUrl: newPosterUrl, 
          },
        });
        setDisplayVideoUrl(newVideoUrl || "");
        setDisplayVideoPosterUrl(newPosterUrl);
        if (!newVideoUrl) { // If video is removed, ensure placeholder is shown
            setDisplayVideoUrl("");
            setDisplayVideoPosterUrl(fallbackPosterUrl);
        }
      } catch (error) {
        console.error("Failed to update store with new video section video URL:", error);
      }
    }
  };

  const listItems = content?.videoLeftSectionListItems || [
    "Detail-Oriented Design",
    "Expert Assembly Process",
    "Rigorous Testing Protocols",
    "Sustainable Sourcing",
  ];

  return (
    <section id={`video-left-${storeId}`} className="py-16 md:py-24 bg-slate-900 text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="relative aspect-video lg:aspect-[16/10] rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/50"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {displayVideoUrl ? (
              <video
                key={displayVideoUrl}
                src={displayVideoUrl}
                poster={displayVideoPosterUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                {!isPublishedView && viewMode === 'edit' ? (
                  <p className="text-slate-500">No video set. Click edit to add one.</p>
                ) : (
                  <PlayCircle className="w-16 h-16 text-slate-600" />
                )}
              </div>
            )}
            {!isPublishedView && viewMode === 'edit' && (
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3 z-20 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-blue-400 backdrop-blur-sm border-slate-600 rounded-md shadow-md"
                onClick={handleOpenReplaceModal}
                title="Replace Section Video"
              >
                <Edit2Icon className="h-4 w-4" />
              </Button>
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
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tighter font-mono uppercase" 
            >
               <span className="bg-gradient-to-r from-slate-100 via-blue-400 to-sky-400 bg-clip-text text-transparent">
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
              className="text-xl md:text-2xl text-slate-200 mb-6 leading-relaxed font-sans" 
              useTextarea={true}
            />
            <InlineTextEdit
              initialText={sectionText}
              onSave={(newText) => updateStoreTextContent('videoLeftSectionText', newText)}
              isAdmin={!isPublishedView && viewMode === 'edit'}
              as="p"
              textClassName="text-slate-300 mb-8 leading-relaxed text-md font-sans"
              inputClassName="text-slate-300 mb-8 leading-relaxed text-md font-sans bg-transparent"
              className="text-slate-300 mb-8 leading-relaxed text-md font-sans" 
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
                  className="group rounded-md px-8 py-3 text-base font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 font-mono uppercase tracking-wider"
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
      {!isPublishedView && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={displayVideoUrl}
          onVideoReplaced={handleVideoReplaced}
          // Consider a more specific title for this modal instance if needed
        />
      )}
    </section>
  );
};

export default VideoLeftSection;
