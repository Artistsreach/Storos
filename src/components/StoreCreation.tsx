import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight, Bot, List, UploadCloud, Package, Truck, Printer } from "lucide-react";

interface StoreCreationProps {
  id: string;
  activeVideo: string | null;
  setActiveVideo: (id: string | null) => void;
}

const StoreCreation = ({ id, activeVideo, setActiveVideo }: StoreCreationProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      setActiveVideo(id);
    }
  }, [isInView, id, setActiveVideo]);

  const creationModes = [
    {
      title: "AI Prompt",
      description: "Describe your store vision and let AI build it for you.",
      icon: <Bot className="h-8 w-8 text-purple-600" />,
    },
    {
      title: "Step by Step",
      description: "A guided process to build your store piece by piece.",
      icon: <List className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Import",
      description: "Bring your existing store from other platforms.",
      icon: <UploadCloud className="h-8 w-8 text-green-600" />,
    },
    {
      title: "Market Research",
      description: "Leverage AI to perform market research using Google Search and web scraping to identify trends, competition, and target audience.",
      icon: <Bot className="h-8 w-8 text-purple-600" />,
    },
  ];

  const storeTypes = [
    {
      title: "Inventory",
      description: "Manage and sell your own stock of products.",
      icon: <Package className="h-8 w-8 text-orange-600" />,
    },
    {
      title: "Dropshipping",
      description: "Sell products without holding any inventory yourself.",
      icon: <Truck className="h-8 w-8 text-yellow-600" />,
    },
    {
      title: "Print-on-Demand",
      description: "Sell custom-designed products printed on demand.",
      icon: <Printer className="h-8 w-8 text-red-600" />,
    },
  ];

  return (
    <section className="relative w-full bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-900 overflow-hidden">
      {/* Enhanced Background pattern with modern glassmorphism */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-sky-300 dark:from-blue-500 dark:to-sky-400 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gradient-to-r from-sky-300 to-blue-400 dark:from-sky-400 dark:to-blue-600 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-blue-300 to-sky-400 dark:from-blue-600 dark:to-sky-500 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Modern geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-sky-300/20 rounded-3xl rotate-45 animate-float" />
        <div
          className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-sky-400/20 to-blue-300/20 rounded-2xl rotate-12 animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/3 left-10 w-16 h-16 bg-gradient-to-br from-blue-300/30 to-sky-400/30 rounded-xl rotate-45 animate-float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-16 h-16 bg-white/30 dark:bg-white/20 rounded-2xl backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-16 w-12 h-12 bg-white/30 dark:bg-white/20 rounded-full backdrop-blur-sm"
        />
      </div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-0"
          >
            YOUR STORE, YOUR WAY
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-200 bg-clip-text text-transparent">
            Create and Sell How You Want
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Flexible creation modes and store types to match your business needs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-0">
                <video
                  ref={videoRef}
                  id={id}
                  autoPlay
                  loop
                  muted={activeVideo !== id}
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Ff.mp4" type="video/mp4" />
                </video>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Creation Modes</h3>
              {creationModes.map((mode, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group mb-4"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                    {mode.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                      {mode.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {mode.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Store Types</h3>
              {storeTypes.map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group mb-4"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                    {type.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                      {type.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {type.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StoreCreation;
