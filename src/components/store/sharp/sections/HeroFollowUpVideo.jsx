import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../../contexts/StoreContext'; // Corrected path

const HeroFollowUpVideo = ({ store }) => {
  const { content, id: storeId } = store;

  const videoUrl = content?.heroFollowUpVideoUrl || "https://videos.pexels.com/video-files/3209828/3209828-hd_1280_720_25fps.mp4";
  // It might be good to have a poster for this video too, if desired.
  // const videoPosterUrl = content?.heroFollowUpVideoPosterUrl || "default_poster_for_follow_up.jpg";

  if (!videoUrl) {
    return null; // Don't render if no video URL is provided (or remove this if a placeholder is always desired)
  }

  return (
    <section 
      id={`hero-follow-up-video-${storeId}`} 
      className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden bg-slate-900"
      // This section is designed to be visually distinct and lead into the next.
      // The "anchoring" will be more about its position and the flow than direct visual connection unless specific styling is added.
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <video
          src={videoUrl}
          // poster={videoPosterUrl} // Add if you have a poster
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Optional overlay to darken video for text legibility if text were to be added on top */}
        {/* <div className="absolute inset-0 bg-black/30"></div> */}
      </motion.div>
      {/* This section is primarily visual. Text or CTAs could be added if needed. */}
      {/* For "anchoring", ensure the StoreFeatures section below has a clear visual start. */}
    </section>
  );
};

export default HeroFollowUpVideo;
