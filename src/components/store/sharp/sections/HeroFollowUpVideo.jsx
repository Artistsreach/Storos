import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../../contexts/StoreContext'; // Corrected path
import { Button } from '../../../ui/button';
import { Edit2Icon } from 'lucide-react';
import ReplaceVideoModal from '../ReplaceVideoModal';
import { searchPexelsVideos } from '../../../../lib/pexels'; // Added import

const HeroFollowUpVideo = ({ store, isPublishedView = false }) => {
  const { name, content, id: storeId } = store; // Added name
  const { updateStore, viewMode } = useStore();
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [displayVideoUrl, setDisplayVideoUrl] = useState(content?.heroFollowUpVideoUrl || "");
  // This component doesn't seem to use a poster.

  useEffect(() => {
    // Directly use the URL from props, which should be populated during store generation.
    // Fallback to empty string if not provided, leading to "No video set" message.
    setDisplayVideoUrl(content?.heroFollowUpVideoUrl || "");
  }, [content?.heroFollowUpVideoUrl]);

  const handleOpenReplaceModal = () => {
    setIsReplaceModalOpen(true);
  };

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId) {
      try {
        await updateStore(storeId, {
          content: {
            ...content,
            heroFollowUpVideoUrl: newVideoUrl || "", 
          },
        });
        // No need to setDisplayVideoUrl here if we rely on the useEffect above,
        // but setting it directly ensures immediate UI update if prop update is slow.
        setDisplayVideoUrl(newVideoUrl || ""); 
      } catch (error) {
        console.error("Failed to update store with new follow-up video URL:", error);
      }
    }
  };

  // If in published view and there's no video URL from props, render nothing.
  if (!displayVideoUrl && isPublishedView) {
    return null; 
  }

  return (
    <section
      id={`hero-follow-up-video-${storeId}`}
      className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden bg-slate-900"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {displayVideoUrl ? (
          <video
            key={displayVideoUrl} 
            src={displayVideoUrl}
            // poster={videoPosterUrl} // No poster used in this component currently
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            {!isPublishedView && viewMode === 'edit' && (
              <p className="text-slate-500">No video set. Click edit to add one.</p>
            )}
          </div>
        )}
        {/* <div className="absolute inset-0 bg-black/30"></div> */}
      </motion.div>

      {!isPublishedView && viewMode === 'edit' && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-20 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-blue-400 backdrop-blur-sm border-slate-600 rounded-md shadow-md"
          onClick={handleOpenReplaceModal}
          title="Replace Follow-up Video"
        >
          <Edit2Icon className="h-4 w-4" />
        </Button>
      )}

      {!isPublishedView && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={displayVideoUrl} // Use displayVideoUrl
          onVideoReplaced={handleVideoReplaced}
          // You might want a different title for this modal instance
        />
      )}
    </section>
  );
};

export default HeroFollowUpVideo;
