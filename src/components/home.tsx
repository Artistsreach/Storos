import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import HeroSection from "./HeroSection";
import FeaturesGrid from "./FeaturesGrid";
import IntegrationSection from "./IntegrationSection";
import AIAssistantDemo from "./AIAssistantDemo";
import AIProductDiscovery from "./AIProductDiscovery";
import IncreasedSalesPerformance from "./IncreasedSalesPerformance";
import PrintOnDemand from "./PrintOnDemand";
import ProductImageGeneration from "./ProductImageGeneration";
import StoreCreation from "./StoreCreation";
import SeeItInAction from "./SeeItInAction";
import RolesAndBenefits from "./RolesAndBenefits";
import EcosystemChart from "./EcosystemChart";
import AIContentCreationModal from "./AIContentCreationModal";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Edit, Image, Layers, ArrowRight, TrendingUp, X } from "lucide-react";
import HomeAssistantLive from "./home/HomeAssistantLive";

const HomePage = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ title: string; description: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      {/* Hero Section */}
      <div className="pt-20">
        <HeroSection />
      </div>

      {/* Store Creation Section */}
      <StoreCreation
        id="store-creation-video"
        activeVideo={activeVideo}
        setActiveVideo={setActiveVideo}
      />

      {/* See It In Action Section */}
      <SeeItInAction
        id="see-it-in-action-video"
        activeVideo={activeVideo}
        setActiveVideo={setActiveVideo}
      />

      {/* Next-Generation Product Visualization Section */}
      <section id="product-visualization" className="py-20 px-4 md:px-8 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0"
            >
              NEXT-GENERATION VISUALIZATION
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              Product Visualization That Converts
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Give your customers a shopping experience they'll never forget
              with cutting-edge AI technology that makes every product come
              alive.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {[
                {
                  title: "3D Product Viewer",
                  description:
                    "Let customers explore every angle and detail with interactive 3D models that showcase your products like never before.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Virtual Try-On",
                  description:
                    "Enable customers to see how products look on them or in their space before they buy, dramatically reducing returns and increasing confidence.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-pink-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Place in Space",
                  description:
                    "Help customers visualize furniture, decor, and other items in their actual environment.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Smart Variant Comparison",
                  description:
                    "Make product selection effortless with AI-powered side-by-side comparisons that highlight key differences.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  ),
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              onViewportEnter={() => setActiveVideo("product-visualization-video")}
            >
              <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-0">
                  <video
                    id="product-visualization-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//visualize.mp4" type="video/mp4" />
                  </video>
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Customization Tools Section */}
      <section
        id="features"
        className="py-20 px-4 md:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-800/30 dark:to-blue-900/30 relative overflow-hidden"
      >
        {/* Modern background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-sky-400 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-sky-400 to-blue-400 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-blue-300 to-sky-300 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 right-1/4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-sky-300/10 rounded-2xl rotate-45 animate-float" />
          <div
            className="absolute bottom-40 left-1/3 w-16 h-16 bg-gradient-to-br from-sky-400/10 to-blue-300/10 rounded-xl rotate-12 animate-float"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 px-6 py-3 rounded-full mb-6 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
              <Edit className="h-4 w-4 text-blue-600 dark:text-sky-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-sky-300">
                Customization Tools
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-sky-700 dark:from-white dark:via-blue-200 dark:to-sky-200 bg-clip-text text-transparent">
              Edit Everything, Effortlessly
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Watch our powerful tools in action. No complex interfaces, just
              intuitive editing that works.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "In-place Text Editing",
                description:
                  "Edit any text with a simple click - no complex interfaces needed",
                  mediaUrl:
                  "https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/Inlinetextedit.gif?alt=media&token=fcbbe4c8-bea4-463b-8216-4e4ffcc0ce90",
                mediaType: "gif",
                icon: <Edit className="h-6 w-6 text-blue-600" />,
                features: ["Click to edit", "Real-time preview", "Auto-save"],
              },
              {
                title: "AI Content Creation",
                description:
                  "Generate professional content with AI-powered tools",
                mediaUrl:
                  "https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/CopyofUntitled-ezgif.com-video-to-gif-converter%202.gif?alt=media&token=54b577d7-b356-4b1b-9710-bbc5a82952b2",
                mediaType: "gif",
                icon: <Image className="h-6 w-6 text-purple-600" />,
                features: [
                  "AI-generated images",
                  "Smart descriptions",
                  "SEO optimization",
                ],
              },
              {
                title: "Product Visualizer",
                description:
                  "Upload a reference image and see how products look in that space using AI",
                mediaUrl:
                  "https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/visualize.mp4?alt=media&token=6f5fe538-7da3-47e2-804c-a2ccc1212b4b",
                mediaType: "video",
                icon: <Layers className="h-6 w-6 text-green-600" />,
                features: [
                  "360° product views",
                  "AR try-on",
                  "Interactive demos",
                ],
              },
            ].map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full overflow-hidden bg-white/90 dark:bg-gray-800 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 ring-1 ring-black/5 dark:ring-white/10 group">
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50 dark:from-gray-700 dark:to-gray-600">
                    {tool.mediaType === "video" ? (
                      <motion.video
                        id={`tool-video-${index}`}
                        autoPlay
                        loop
                        muted={activeVideo !== `tool-video-${index}`}
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onViewportEnter={() => setActiveVideo(`tool-video-${index}`)}
                      >
                        <source src={tool.mediaUrl} type="video/mp4" />
                      </motion.video>
                    ) : (
                      <img
                        src={tool.mediaUrl}
                        alt={`${tool.title} demonstration`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300">
                      {tool.icon}
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tool.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center text-sm"
                        >
                          <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-sky-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 border-blue-200 dark:border-sky-600"
                      onClick={() => {
                        if (tool.title === "AI Content Creation") {
                          setIsModalOpen(true);
                        } else if (tool.title === "Product Visualization") {
                          document.getElementById("product-visualization")?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    >
                      {tool.title === "AI Content Creation" ? "How It Works" : `Try ${tool.title}`}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Demo */}
      <div id="ai-assistant">
        <AIAssistantDemo />
      </div>

      {/* AI Product Discovery Section */}
      <div id="product-discovery">
        <AIProductDiscovery />
      </div>

      {/* Templates Section */}
      <div id="templates">
        <FeaturesGrid />
      </div>

      {/* Print-on-Demand Section */}
      <PrintOnDemand />

      <ProductImageGeneration />

      {/* Import Your Store Section */}
      <div id="integrations">
        <IntegrationSection />
      </div>

      {/* Everything You Need Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0"
            >
              COMPLETE SOLUTION
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-green-800 to-emerald-700 dark:from-white dark:via-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
              Everything You Need to Build, Manage, and Grow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From AI-powered content creation to effortless store management,
              we've got every aspect of your e-commerce business covered.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* AI-Powered Content Creation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/90 dark:bg-gray-800 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    AI-Powered Content Creation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Generate stunning product images from multiple angles and contexts",
                      "Create professional product videos in seconds",
                      "Edit and enhance images with one-click AI tools",
                      "Design products based on current market trends",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <ArrowRight className="h-3 w-3 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Effortless Store Management */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/90 dark:bg-gray-800 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Edit className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Effortless Store Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Edit your store content directly on the page - no technical skills required",
                      "Integrated Stripe dashboard for orders, customers, and payouts",
                      "Real-time analytics and insights to optimize your business",
                      "Secure, white-label checkout that maintains your brand identity",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <ArrowRight className="h-3 w-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Built for Growth */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/90 dark:bg-gray-800 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Built for Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Import from major platforms: Shopify, BigCommerce, Etsy, WooCommerce",
                      "Template marketplace with proven high-converting designs (coming soon)",
                      "Programmable knowledge base that learns your business",
                      "Live editing with AI assistance that suggests improvements",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <ArrowRight className="h-3 w-3 mr-2 text-purple-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Get Started Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0"
            >
              GET STARTED
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-700 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Launch Your Store in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From setup to sales in minutes. Our streamlined process gets you
              selling faster than any other platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "01",
                title: "Connect with Stripe",
                description:
                  "Set up payments and business operations instantly",
                icon: (
                  <svg
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Describe Your Vision",
                description:
                  "Tell our AI what kind of store you want to create",
                icon: (
                  <svg
                    className="h-8 w-8 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Launch & Sell",
                description:
                  "Your store goes live with smart features that convert visitors into customers",
                icon: (
                  <svg
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="h-full bg-white/90 dark:bg-gray-800 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
                  <CardContent className="p-8 text-center">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-blue-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Business Management & Store Creation Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 relative overflow-hidden business-management-section">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-gradient-to-r from-slate-400 to-blue-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-0"
            >
              BUSINESS MANAGEMENT
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 dark:from-white dark:via-blue-200 dark:to-cyan-200 bg-clip-text text-transparent">
              Build Your E-commerce Empire
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Start your own business, create multiple stores, assign managers,
              and scale your operations with our comprehensive business
              management platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              onViewportEnter={() => setActiveVideo("ecommerce-empire-video")}
            >
              <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-0">
                  <video
                    id="ecommerce-empire-video"
                    autoPlay
                    loop
                    muted={activeVideo !== "ecommerce-empire-video"}
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//391964797603680257.mov" type="video/mp4" />
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
              <div className="flex items-start space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    Multi-Store Creation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create and manage multiple stores from a single dashboard.
                    Scale your business across different niches and markets.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20h2m-2 0h-5m-9 0H3m2 0h5M9 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    Team Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Assign store managers, set permissions, and delegate
                    operations. Build a team that scales with your business.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    Business Analytics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Track performance across all stores, monitor revenue
                    streams, and make data-driven decisions for growth.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment Integration Features */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 dark:border-gray-700/20">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/Stripe%20logo.PNG?alt=media&token=d02bee47-02e7-4845-b2a9-459ab531bcfa"
                  alt="Stripe Logo"
                  className="h-12 w-auto"
                />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                Secure Payment Processing
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Built-in Stripe integration ensures secure transactions across
                all your stores with enterprise-grade security.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border border-purple-100 dark:border-gray-600"
              >
                <div className="bg-blue-100 dark:bg-blue-800/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  PCI Compliant Security
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Enterprise-grade security ensures customer payment data is
                  always protected across all your stores.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-green-100 dark:border-gray-600"
              >
                <div className="bg-green-100 dark:bg-green-800/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Global Payment Methods
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Accept credit cards, digital wallets, and local payment
                  methods to maximize conversion rates.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border border-purple-100 dark:border-gray-600"
              >
                <div className="bg-blue-100 dark:bg-blue-800/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Advanced Analytics
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Track revenue, customer behavior, and business performance
                  across your entire store portfolio.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles and Benefits Section */}
      <RolesAndBenefits />

      {/* Ecosystem Chart Section */}
      <section>
        <div className="max-w-7xl mx-auto py-20 px-4 md:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-sky-700 dark:from-white dark:via-blue-200 dark:to-sky-200 bg-clip-text text-transparent text-center">
              FreshFront's E-commerce Ecosystem
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed text-center mb-12">
              An overview of how creators, managers, and customers interact within the FreshFront platform.
            </p>
          <EcosystemChart setSelectedNode={setSelectedNode} />
        </div>
      </section>

      {/* Sales Performance Section */}
      <IncreasedSalesPerformance />

      {/* Footer */}
      {selectedNode && (
        <Card className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-96 z-50 border-2 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-600 dark:text-blue-400">{selectedNode.title}</CardTitle>
            <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
              <X />
            </button>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{selectedNode.description}</p>
          </CardContent>
        </Card>
      )}

      {isModalOpen && <AIContentCreationModal onClose={() => setIsModalOpen(false)} />}

      {/* Home floating assistant (GeminiDesktopLive-backed) */}
      <HomeAssistantLive />

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-gray-950 text-slate-300 dark:text-gray-400 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/ffwhite.png?alt=media&token=b5dfc968-f771-4589-85f2-3484566bbdb0"
                  alt="FreshFront Logo"
                  className="h-8 w-auto"
                />
                <h3 className="text-white dark:text-gray-100 font-bold text-lg">
                  FreshFront
                </h3>
              </div>
              <p className="text-sm">
                AI-powered e-commerce platform for creating beautiful
                storefronts with minimal effort.
              </p>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-medium mb-4">
                Resources
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://freshfront.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    App
                  </a>
                </li>
                <li>
                  <a
                    href="/documentation"
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/playbook"
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Playbook
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-medium mb-4">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:info@freshfront.co"
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Terms of service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a
                    href="/investorpackage"
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Investors
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 dark:border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>
              &copy; {new Date().getFullYear()} FreshFront. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
