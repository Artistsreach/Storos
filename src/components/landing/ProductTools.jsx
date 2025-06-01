import { Eye, Video, Box } from "lucide-react";
import { Card, CardContent } from "components/ui/card";

const ProductTools = () => {
  const tools = [
    {
      icon: <Eye className="w-10 h-10 text-emerald-600" />,
      title: "Product Visualizer",
      description: "Allow customers to visualize your products in their own space or on themselves with AI technology.",
      features: ["User Friendly", "Instant Preview", "Mobile Optimized"]
    },
    {
      icon: <Video className="w-10 h-10 text-blue-600" />,
      title: "Product Video Generator",
      description: "Transform static product images into engaging videos that showcase your products dynamically.",
      features: ["AI Video Creation", "Multiple Styles", "Auto-Generated"]
    },
    {
      icon: <Box className="w-10 h-10 text-purple-600" />,
      title: "3D Visualization",
      description: "Create interactive 3D models from product images that customers can rotate and explore.",
      features: ["360° Rotation", "Zoom Controls", "Interactive Models"]
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Advanced Product Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Give your customers an immersive shopping experience with cutting-edge visualization tools.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {tool.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                  {tool.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {tool.description}
                </p>
                <div className="space-y-2">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductTools;
