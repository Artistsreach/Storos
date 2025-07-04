import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Edit,
  Image,
  Layers,
  LayoutGrid,
  Palette,
  Play,
  Video,
  Sparkles,
} from "lucide-react";

interface TemplateCardProps {
  title: string;
  description: string;
  imageUrl: string;
  features: string[];
  gradient?: string;
}

const TemplateCard = ({
  title,
  description,
  imageUrl,
  features = [],
  gradient = "from-blue-500 to-cyan-500",
}: TemplateCardProps & { gradient?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -8 }}
      className="h-full group"
    >
      <Card className="h-full flex flex-col overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl group-hover:border-gray-300/70 dark:group-hover:border-gray-600/70">
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${title} template preview`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center p-6"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className={`bg-gradient-to-r ${gradient} text-white shadow-xl backdrop-blur-sm rounded-2xl font-semibold px-6 py-2 border-0 hover:shadow-2xl transition-all duration-300`}
              >
                <Play className="h-4 w-4 mr-2" />
                Live Preview
              </Button>
            </motion.div>
          </motion.div>
          <div className="absolute top-4 right-4">
            <div
              className={`bg-gradient-to-r ${gradient} px-4 py-2 rounded-full shadow-lg`}
            >
              <span className="text-xs font-bold text-white">
                {title.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                >
                  <div
                    className={`bg-gradient-to-r ${gradient} p-1.5 rounded-full mr-3 shadow-sm`}
                  >
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-0 pt-6">
            <Button
              variant="outline"
              className={`w-full group-hover:bg-blue-600 hover:bg-blue-600 active:bg-blue-700 group-hover:text-white hover:text-white active:text-white group-hover:border-transparent hover:border-transparent active:border-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:text-white transition-all duration-300 rounded-2xl font-semibold py-3 text-base shadow-md hover:shadow-lg`}
              onClick={() => window.open("https://freshfront.co", "_blank")}
            >
              Explore {title}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
};

const FeatureTab = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const FeaturesGrid = () => {
  const newImageUrls = [
    "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_5952.webp?alt=media&token=e24b221e-241a-4d99-bf34-9b6cb5e2c74a",
    "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_5948.webp?alt=media&token=c8884511-968a-41b6-98b1-4e95dcd529a5",
    "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_5946.webp?alt=media&token=11bfb7ad-49ec-4d1e-ba14-1e9fe4c29356",
    "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Gemini_Generated_Image_krzg3lkrzg3lkrzg.png?alt=media&token=b3515e9f-c79b-4619-a7dc-79560dcaf84d",
    "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_6562.jpeg?alt=media&token=8390a03c-2248-4f62-a517-81aaf09cebe4"
  ];

  const templates = [
    {
      title: "Classic",
      description:
        "Timeless design with clean layouts and intuitive navigation",
      imageUrl: newImageUrls[Math.floor(Math.random() * newImageUrls.length)],
      features: ["Minimalist design", "Fast loading", "Mobile optimized"],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Modern",
      description:
        "Contemporary aesthetics with bold elements and dynamic interactions",
      imageUrl: newImageUrls[Math.floor(Math.random() * newImageUrls.length)],
      features: [
        "Animated transitions",
        "Immersive galleries",
        "Advanced filtering",
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Premium",
      description:
        "Luxury-focused template with sophisticated styling and premium features",
      imageUrl: newImageUrls[Math.floor(Math.random() * newImageUrls.length)],
      features: [
        "High-end aesthetics",
        "VIP customer features",
        "Exclusive content areas",
      ],
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Sharp",
      description:
        "Bold and striking design with high contrast and strong visual hierarchy",
      imageUrl: newImageUrls[Math.floor(Math.random() * newImageUrls.length)],
      features: [
        "High contrast UI",
        "Bold typography",
        "Striking product displays",
      ],
      gradient: "from-red-500 to-rose-500",
    },
    {
      title: "Sleek",
      description:
        "Smooth, minimal interface with subtle animations and elegant typography",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/IMG_5954.webp?alt=media&token=50318e0f-b02a-49d4-89e7-bed587e97f6c",
      features: [
        "Subtle animations",
        "Elegant typography",
        "Whitespace-focused layout",
      ],
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const customizationTools = [
    {
      title: "In-place Text Editing",
      description:
        "Edit any text with a simple click - no complex interfaces needed",
      mediaUrl:
        "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/Video-ezgif.com-video-to-gif-converter.gif?alt=media&token=4e7e59ba-eccc-4842-943c-142e8e54367f",
      mediaType: "gif",
      icon: <Edit className="h-6 w-6 text-blue-600" />,
      features: ["Click to edit", "Real-time preview", "Auto-save"],
    },
    {
      title: "AI Content Creation",
      description: "Generate professional content with AI-powered tools",
      mediaUrl:
        "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/CopyofUntitled-ezgif.com-video-to-gif-converter%202.gif?alt=media&token=72f9989b-4a18-4441-a55d-c758c219494d",
      mediaType: "gif",
      icon: <Image className="h-6 w-6 text-purple-600" />,
      features: [
        "AI-generated images",
        "Smart descriptions",
        "SEO optimization",
      ],
    },
    {
      title: "Product Visualization",
      description: "Showcase products with immersive 3D views and AR features",
      mediaUrl:
        "https://firebasestorage.googleapis.com/v0/b/fresh-dfe30.firebasestorage.app/o/visualize%202.mp4?alt=media&token=334b9b3c-6aef-4972-a245-f6e99a77bb80",
      mediaType: "video",
      icon: <Layers className="h-6 w-6 text-green-600" />,
      features: ["360° product views", "AR try-on", "Interactive demos"],
    },
  ];

  return (
    <>
      <section className="py-24 px-4 md:px-8 bg-gradient-to-br from-gray-50 via-blue-50/40 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800/60 dark:to-blue-900/60 relative overflow-hidden">
        {/* Enhanced Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/30 to-cyan-400/30 dark:from-blue-500/20 dark:to-cyan-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-slate-400/30 to-blue-400/30 dark:from-slate-500/20 dark:to-blue-500/20 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-300/20 to-teal-300/20 dark:from-cyan-500/10 dark:to-teal-500/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 px-6 py-3 rounded-full mb-8 shadow-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                AI-Powered Templates
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 dark:from-white dark:via-blue-200 dark:to-cyan-200 bg-clip-text text-transparent leading-tight">
              Beautiful Templates,
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                Infinite Possibilities
              </span>
            </h2>
            <p className="text-xl max-w-4xl mx-auto leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
              Choose from our professionally designed templates and customize
              every aspect of your store with our intuitive AI-powered tools.
              Each template is crafted for maximum conversion and user
              experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-20">
            {templates.map((template, index) => (
              <TemplateCard
                key={index}
                title={template.title}
                description={template.description}
                imageUrl={template.imageUrl}
                features={template.features}
                gradient={template.gradient}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesGrid;
