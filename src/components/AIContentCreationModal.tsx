import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";

interface AIContentCreationModalProps {
  onClose: () => void;
}

const AIContentCreationModal: React.FC<AIContentCreationModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md h-[90vh] max-h-[800px] flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold">AI Content Creation</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <img
              src="https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Image%20Generation.png"
              alt="AI Generated Content"
              className="w-full h-auto"
            />
            <div className="p-4 sm:p-8 flex justify-center items-center">
              <div className="relative w-[300px] h-[650px] bg-black border-4 border-gray-800 rounded-[40px] shadow-2xl overflow-hidden">
                <video
                  src="https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//My%20project%20(6).mp4"
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-end">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <img src="https://uwbrgokfgelgxeonoqah.supabase.co/storage/v1/object/public/images//ffwhite.png" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
                        <p className="font-bold text-sm">@freshfront</p>
                        <button className="border border-white rounded-md px-2 py-0.5 text-xs">Follow</button>
                      </div>
                      <p className="text-sm">
                        Creating a stunning online store in seconds with AI! ✨ #AI #Ecommerce #WebDesign
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <button>
                        <Heart className="h-7 w-7" />
                        <span className="text-xs">12.3k</span>
                      </button>
                      <button>
                        <MessageCircle className="h-7 w-7" />
                        <span className="text-xs">1,204</span>
                      </button>
                      <button>
                        <Send className="h-7 w-7" />
                        <span className="text-xs">832</span>
                      </button>
                      <button>
                        <MoreHorizontal className="h-7 w-7" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIContentCreationModal;
