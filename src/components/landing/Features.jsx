import { Bot, MousePointer, Wand2, Layers, Upload, Palette } from "lucide-react";
import { Card, CardContent } from "components/ui/card";

const Features = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-emerald-600" />,
      title: "AI Prompt Store Creation",
      description: "Create a complete storefront with logo, products, collections, and content in one simple prompt.",
      gradient: "from-emerald-500/10 to-emerald-600/10"
    },
    {
      icon: <Layers className="w-8 h-8 text-blue-600" />,
      title: "Step-by-Step Wizard",
      description: "Guided setup process to specify names, upload logos, add products, and customize your store.",
      gradient: "from-blue-500/10 to-blue-600/10"
    },
    {
      icon: <Upload className="w-8 h-8 text-purple-600" />,
      title: "Import Existing Store",
      description: "Seamlessly import your store data from Shopify or BigCommerce to get started quickly.",
      gradient: "from-purple-500/10 to-purple-600/10"
    },
    {
      icon: <Palette className="w-8 h-8 text-pink-600" />,
      title: "Modular Templates",
      description: "Choose from 5 unique templates that adapt to your brand: Classic, Modern, Premium, Sharp, Sleek.",
      gradient: "from-pink-500/10 to-pink-600/10"
    },
    {
      icon: <MousePointer className="w-8 h-8 text-orange-600" />,
      title: "Easy Editing",
      description: "Edit text in-place, swap images with AI generation, and customize everything with simple clicks.",
      gradient: "from-orange-500/10 to-orange-600/10"
    },
    {
      icon: <Wand2 className="w-8 h-8 text-indigo-600" />,
      title: "Stripe Integration",
      description: "Securely accept payments and manage transactions through integrated Stripe Connect dashboard.",
      gradient: "from-indigo-500/10 to-indigo-600/10"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to help you create, customize, and grow your online store with ease.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
