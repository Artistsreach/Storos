import { Button } from "components/ui/button";
import { ArrowRight, Sparkles, Zap, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-20"
        >
          <source src="https://cdn.pixabay.com/video/2022/12/06/142608-776748190_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-blue-600/20 to-purple-600/20"></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      
      <div className="relative max-w-7xl mx-auto text-center z-10">
        {/* Logo with Glassmorphism */}
        <div className="mb-8 flex justify-center">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl">
            <img 
              src="/lovable-uploads/b1476f78-ba6d-46f0-8702-c0fb4a1a6c3a.png" 
              alt="FreshFront Logo" 
              className="h-16 w-auto"
            />
          </div>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
          FreshFront
        </h1>
        
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-6 animate-fade-in delay-100">
          AI-Powered E-Commerce Store Builder
        </h2>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in delay-200">
          Create stunning online stores in seconds with AI. From logo design to product generation, 
          build your complete e-commerce presence with just one prompt.
        </p>
        
        {/* Feature Highlights with Glassmorphism */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in delay-300">
          <div className="flex items-center gap-2 backdrop-blur-md bg-white/20 border border-white/30 px-6 py-3 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="text-gray-700 font-medium">AI Store Creation</span>
          </div>
          <div className="flex items-center gap-2 backdrop-blur-md bg-white/20 border border-white/30 px-6 py-3 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700 font-medium">One-Click Generation</span>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in delay-400">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          >
            Start Building Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-white/30 backdrop-blur-md bg-white/10 hover:bg-white/20 text-gray-700 hover:text-emerald-700 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 group"
          >
            <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            Watch Demo
          </Button>
        </div>
        
        {/* Trust Indicators with Better Visibility */}
        <div className="animate-fade-in delay-500">
          <p className="text-gray-600 mb-6 font-medium">FreshFront integrates with</p>
          <div className="flex justify-center items-center gap-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl py-6 px-8 shadow-xl">
            <img 
              src="/lovable-uploads/e215ed9a-532a-4f35-8716-316c9e8f7189.png" 
              alt="Shopify" 
              className="h-10 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
            />
            <img 
              src="/lovable-uploads/db1ac7fe-3e40-49df-b8e9-3ce44b65bab7.png" 
              alt="BigCommerce" 
              className="h-10 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
            />
            <img 
              src="/lovable-uploads/95c62ac5-e6ba-45e5-b2cb-4d7c7b78c1de.png" 
              alt="Stripe" 
              className="h-10 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
            />
            <img 
              src="/lovable-uploads/0a61661d-4ef4-4854-910a-8bf9c8cd0c3d.png" 
              alt="Stripe" 
              className="h-12 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
