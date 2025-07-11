import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { Play, X } from "lucide-react";

interface SeeItInActionProps {
  id: string;
  activeVideo: string | null;
  setActiveVideo: (id: string | null) => void;
}

const SeeItInAction = ({ id, activeVideo, setActiveVideo }: SeeItInActionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      setActiveVideo(id);
    }
  }, [isInView, id, setActiveVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeVideo === id) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [activeVideo, id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(() => setIsPlaying(false));
      } else {
        video.pause();
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      setIsPlaying(!video.paused);
      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }
  }, []);

  return (
    <section className="py-20 px-4 md:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create stores on your tablet or phone
          </p>
        </motion.div>
        
        <div ref={videoWrapperRef}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true, amount: 0.2, margin: "-200px 0px 0px 0px" }}
              className={cn(
                "relative group transition-all duration-500"
              )}
            >
              <Card className="overflow-hidden border-none shadow-none bg-white/90 dark:bg-gray-800/90 rounded-[18px]">
                <CardContent className="p-0 relative">
                  <video
                    ref={videoRef}
                    id={id}
                    loop
                    autoPlay
                    playsInline
                    muted={activeVideo !== id}
                    className="w-full h-full object-cover rounded-[18px]"
                  >
                    <source
                      src="https://firebasestorage.googleapis.com/v0/b/freshfront-89dc9.firebasestorage.app/o/Video.mp4?alt=media&token=a46fdc7b-a0af-4d00-a1b2-7a40c6d4e405"
                      type="video/mp4"
                    />
                  </video>
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={togglePlay} className="bg-white/30 backdrop-blur-sm rounded-full p-4 text-black">
                        <Play className="h-8 w-8" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SeeItInAction;
