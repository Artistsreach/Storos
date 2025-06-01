import React, { useState, useEffect, useRef, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Edit2Icon,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
  Award,
  Users,
  CheckCircle,
  ShoppingBag,
  Eye,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
  useMotionValue,
} from "framer-motion";

// import { Canvas, useFrame } from "@react-three/fiber"; // R3F Removed
// import {
//   OrbitControls,
//   Sphere,
//   MeshDistortMaterial,
//   Float,
//   Text3D,
//   Environment,
//   PerspectiveCamera,
//   useTexture,
// } from "@react-three/drei"; // R3F Removed
// import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing"; // R3F Removed
import ReplaceVideoModal from "@/components/store/ReplaceVideoModal";
import { useStore } from "@/contexts/StoreContext";
import InlineTextEdit from "@/components/ui/InlineTextEdit";
import { Badge } from "@/components/ui/badge";
// import StoreCollections from "./StoreCollections"; // Removed unused import

// Three.js Components - R3F REMOVED
// const FloatingGeometry = ({ position, color, scale = 1 }) => {
//   const meshRef = useRef();
//   const time = useMotionValue(0);
//   useFrame((state) => {
//     if (meshRef.current) {
//       time.set(state.clock.elapsedTime);
//       meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
//       meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
//       meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.5;
//     }
//   });
//   return (
//     <Float speed={2} rotationIntensity={1} floatIntensity={2}>
//       <mesh ref={meshRef} position={position} scale={scale}>
//         <icosahedronGeometry args={[1, 0]} />
//         <MeshDistortMaterial
//           color={color}
//           attach="material"
//           distort={0.4}
//           speed={2}
//           roughness={0.1}
//           metalness={0.8}
//         />
//       </mesh>
//     </Float>
//   );
// };

// const ParticleField = ({ count = 100, primaryColor }) => {
//   const points = useRef();
//   const particlesPosition = new Float32Array(count * 3);
//   for (let i = 0; i < count; i++) {
//     particlesPosition[i * 3] = (Math.random() - 0.5) * 20;
//     particlesPosition[i * 3 + 1] = (Math.random() - 0.5) * 20;
//     particlesPosition[i * 3 + 2] = (Math.random() - 0.5) * 20;
//   }
//   useFrame((state) => {
//     if (points.current) {
//       points.current.rotation.x = state.clock.elapsedTime * 0.05;
//       points.current.rotation.y = state.clock.elapsedTime * 0.1;
//     }
//   });
//   return (
//     <points ref={points}>
//       <bufferGeometry>
//         <bufferAttribute
//           attach="attributes-position"
//           count={count}
//           array={particlesPosition}
//           itemSize={3}
//         />
//       </bufferGeometry>
//       <pointsMaterial size={0.05} color={primaryColor} transparent opacity={0.6} />
//     </points>
//   );
// };

// const Scene3D = ({ primaryColor }) => { // R3F REMOVED
//   return (
//     <>
//       <PerspectiveCamera makeDefault position={[0, 0, 10]} />
//       <ambientLight intensity={0.5} />
//       <pointLight position={[10, 10, 10]} intensity={1} />
//       <pointLight position={[-10, -10, -10]} intensity={0.5} color={primaryColor} />
      
//       <FloatingGeometry position={[-3, 2, 0]} color={primaryColor} scale={0.8} />
//       <FloatingGeometry position={[3, -1, -2]} color="#ffffff" scale={0.6} />
//       <FloatingGeometry position={[0, 3, -1]} color={primaryColor} scale={0.4} />
      
//       <ParticleField count={150} primaryColor={primaryColor} />
      
//       <Environment preset="city" />
      
//       <EffectComposer>
//         <Bloom intensity={0.5} luminanceThreshold={0.9} />
//         <ChromaticAberration offset={[0.001, 0.001]} />
//       </EffectComposer>
//     </>
//   );
// };

const StoreHero = ({ store, isPublishedView = false }) => {
  const { updateStore, updateStoreTextContent, viewMode } = useStore();
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const heroRef = useRef(null);

  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]);
  const rotateX = useTransform(scrollY, [0, 500], [0, 10]);

  // Mouse parallax
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });

  // Extract values from store prop
  const storeId = store?.id;
  const title = store?.content?.heroTitle || store?.name || "Modern Excellence";
  const subtitle =
    store?.content?.heroDescription ||
    "Experience the future of premium shopping with our cutting-edge collection. Discover products that blend innovation, style, and uncompromising quality.";
  const videoUrl = store?.hero_video_url;
  const imageUrl =
    store?.heroImage?.src?.large ||
    store?.heroImage?.url ||
    store?.hero_video_poster_url ||
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80";
  const primaryCtaText = "Collections"; // Changed
  const primaryCtaLink = `#products-${store?.id || "featured-products"}`; // Link remains, likely to a product grid or collections section
  const secondaryCtaText = "Story"; // Changed
  const secondaryCtaLink = `#features-${store?.id || "features"}`; // Link remains, likely to an "About Us" or features section
  const primaryColor = store?.theme?.primaryColor || "#6366F1";

  // Premium background images for rotation
  const backgroundImages = [
    imageUrl,
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
  ];

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 20);
        mouseY.set(y * 20);
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Rotate background images every 8 seconds
  useEffect(() => {
    if (!videoUrl) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [videoUrl, backgroundImages.length]);

  const handleScrollTo = (event, targetId) => {
    event.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenReplaceModal = () => {
    setIsReplaceModalOpen(true);
  };

  const handleVideoReplaced = async (newVideoUrl) => {
    if (storeId && newVideoUrl) {
      try {
        await updateStore(storeId, {
          hero_video_url: newVideoUrl,
          hero_video_poster_url: "",
        });
      } catch (error) {
        console.error("Failed to update store with new video URL:", error);
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-20, 20, -20],
      rotate: [0, 10, 0, -10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const statsData = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "99%", label: "Satisfaction Rate", icon: Star },
    { number: "24/7", label: "Support Available", icon: CheckCircle },
    { number: "1M+", label: "Products Sold", icon: Award },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950"
      id="hero"
    >
      {/* Three.js Background - R3F REMOVED */}
      {/*
      <div className="absolute inset-0 opacity-30">
        <Canvas>
          <Suspense fallback={null}>
            <Scene3D primaryColor={primaryColor} />
          </Suspense>
        </Canvas>
      </div>
      */}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ backgroundColor: `${primaryColor}20` }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-accent/10 blur-2xl"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-32 right-20 text-primary/30"
        variants={floatingVariants}
        animate="animate"
        style={{ x: mouseX, y: mouseY }}
      >
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-4 rounded-2xl shadow-glass">
          <Sparkles className="w-10 h-10" />
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-16 text-primary/30"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 2 }}
        style={{ x: mouseX, y: mouseY }}
      >
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-3 rounded-2xl shadow-glass">
          <Star className="w-8 h-8" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/4 text-primary/30"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 4 }}
        style={{ x: mouseX, y: mouseY }}
      >
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-3 rounded-2xl shadow-glass">
          <TrendingUp className="w-8 h-8" />
        </div>
      </motion.div>

      <motion.div
        className="container mx-auto px-6 relative z-10"
        style={{ y, opacity, rotateX }}
      >
        <motion.div
          className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center min-h-[90vh] py-10 md:py-16" // Increased min-height and added some padding
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text Content */}
          <motion.div
            variants={itemVariants}
            className="text-center lg:text-left space-y-10 lg:space-y-12"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-sm font-medium text-primary shadow-glass rounded-full mt-[50px]"
              style={{
                color: primaryColor,
                borderColor: `${primaryColor}30`,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <span className="font-inter tracking-wide">
                Premium Collection 2024
              </span>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
              >
                New
              </Badge>
            </motion.div>

            {/* Main Title */}
            <InlineTextEdit
              initialText={title}
              onSave={(newText) => updateStoreTextContent('content.heroTitle', newText)}
              isAdmin={!isPublishedView}
              as="h1"
              textClassName="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight"
              className="w-full"
            >
              <motion.span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${store?.theme?.darkMode ? '#FFFFFF' : '#111827'} 30%, ${primaryColor} 50%, ${store?.theme?.darkMode ? '#FFFFFF' : '#111827'} 70%)`,
                  backgroundSize: "200% auto",
                }}
                animate={{
                  backgroundPosition: ["200% center", "0% center"],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                {title}
              </motion.span>
            </InlineTextEdit>

            {/* Subtitle */}
            <InlineTextEdit
              initialText={subtitle}
              onSave={(newText) => updateStoreTextContent('content.heroDescription', newText)}
              isAdmin={!isPublishedView}
              useTextarea={true}
              as="p"
              textClassName="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed font-inter"
              className="w-full"
            >
              {subtitle}
            </InlineTextEdit>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8"
              variants={itemVariants}
            >
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="text-center p-4 bg-white/5 dark:bg-black/5 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 1 }}
                  >
                    <div
                      className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 pt-8"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden px-10 py-6 text-lg font-semibold shadow-float hover:shadow-float-lg transition-all duration-500 rounded-full font-inter tracking-wide"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                    color: "white",
                  }}
                >
                  <Link
                    to={primaryCtaLink}
                    onClick={(e) =>
                      handleScrollTo(e, primaryCtaLink.substring(1))
                    }
                  >
                    <motion.span
                      className="relative z-10 flex items-center gap-3"
                      whileHover={{ x: 5 }}
                    >
                      <ShoppingBag className="w-6 h-6" />
                      {primaryCtaText}
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group px-10 py-6 text-lg font-semibold border-2 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300 backdrop-blur-md font-inter tracking-wide rounded-full"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  <Link
                    to={secondaryCtaLink}
                    onClick={(e) =>
                      handleScrollTo(e, secondaryCtaLink.substring(1))
                    }
                  >
                    <motion.span
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Play className="w-5 h-5" />
                      {secondaryCtaText}
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-8"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="w-12 h-12 bg-gradient-to-br from-primary to-secondary border-2 border-background rounded-full flex items-center justify-center text-white font-bold text-sm backdrop-blur-md"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5 + i * 0.1 }}
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                      }}
                    >
                      {String.fromCharCode(65 + i - 1)}
                    </motion.div>
                  ))}
                </div>
                <div className="ml-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-inter">
                    <span
                      className="font-semibold"
                      style={{ color: primaryColor }}
                    >
                      50,000+
                    </span>{" "}
                    satisfied customers
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Content */}
          <motion.div
            variants={itemVariants}
            className="relative aspect-square lg:aspect-[4/3] max-w-3xl mx-auto"
            style={{ scale }}
          >
            {/* Glassmorphism container */}
            <div className="relative w-full h-full overflow-hidden shadow-float-lg backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl">
              {/* Edit button */}
              {!isPublishedView && (videoUrl || imageUrl) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-4 right-4 z-20 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-foreground backdrop-blur-md border border-white/20 dark:border-white/10 shadow-glass rounded-full"
                    onClick={handleOpenReplaceModal}
                    title="Replace Media"
                  >
                    <Edit2Icon className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}

              {/* Video content */}
              {videoUrl ? (
                <div className="relative w-full h-full group">
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    poster={imageUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-3xl"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  />

                  {/* Video controls */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-white backdrop-blur-md border border-white/20 rounded-full"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Video overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-3xl" />

                  {/* Play indicator */}
                  <AnimatePresence>
                    {!isVideoPlaying && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-20 h-20 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 dark:border-white/20 shadow-glass">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Image content with rotation */
                <div className="relative w-full h-full">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={backgroundImages[currentImageIndex]}
                      alt="Hero visual"
                      className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                      loading="eager"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 1.5 }}
                    />
                  </AnimatePresence>

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 rounded-3xl" />
                </div>
              )}

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 blur-2xl rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity }}
                style={{ backgroundColor: `${primaryColor}30` }}
              />
              <motion.div
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary/20 blur-3xl rounded-full"
                animate={{
                  scale: [1.1, 1, 1.1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>

            {/* Floating elements around the image */}
            <motion.div
              className="absolute -top-8 -left-8 w-20 h-20 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-glass"
              animate={{
                y: [-8, 8, -8],
                rotate: [0, 10, 0],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10" style={{ color: primaryColor }} />
            </motion.div>

            <motion.div
              className="absolute -bottom-6 -right-10 w-24 h-24 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-glass"
              animate={{
                y: [8, -8, 8],
                rotate: [0, -10, 0],
              }}
              transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            >
              <Star className="w-12 h-12 text-yellow-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Replace Video Modal */}
      {!isPublishedView && storeId && (
        <ReplaceVideoModal
          open={isReplaceModalOpen}
          onOpenChange={setIsReplaceModalOpen}
          storeId={storeId}
          currentVideoUrl={videoUrl}
          onVideoReplaced={handleVideoReplaced}
        />
      )}

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div
          className="w-6 h-10 border border-white/30 dark:border-white/20 rounded-full flex justify-center backdrop-blur-md"
          style={{ borderColor: `${primaryColor}50` }}
        >
          <motion.div
            className="w-1 h-3 bg-primary mt-2 rounded-full"
            style={{ backgroundColor: primaryColor }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default StoreHero;
