import { MessageCircle, Search, ShoppingBag, Settings } from "lucide-react";
import { Card, CardContent } from "components/ui/card";

const AIAssistant = () => {
  const features = [
    {
      icon: <MessageCircle className="w-6 h-6 text-emerald-600" />,
      title: "Store Information",
      description: "Answer questions about policies, shipping, and store details"
    },
    {
      icon: <Search className="w-6 h-6 text-blue-600" />,
      title: "Product Search",
      description: "Help customers find products with interactive cards"
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-purple-600" />,
      title: "Checkout Assistance",
      description: "Guide customers through the purchase process"
    },
    {
      icon: <Settings className="w-6 h-6 text-orange-600" />,
      title: "Custom Instructions",
      description: "Program with your specific business requirements"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              AI Store Assistant
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Every store comes with a tailored AI assistant that provides personalized customer 
              support, product recommendations, and seamless shopping assistance.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative animate-fade-in delay-300">
            <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Store Assistant</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full ml-auto"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-100 rounded-lg p-3 ml-8">
                      <p className="text-sm text-gray-700">Hi! I'm here to help you find the perfect product. What are you looking for today?</p>
                    </div>
                    
                    <div className="bg-emerald-500 text-white rounded-lg p-3 mr-8">
                      <p className="text-sm">I need a laptop for graphic design work</p>
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-3 ml-8">
                      <p className="text-sm text-gray-700">Great! I found some perfect options for graphic design. Here are our top recommendations...</p>
                      <div className="mt-3 bg-white rounded-md p-2 border">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-3 h-3 bg-gray-300 rounded"></div>
                          <span>MacBook Pro 16" - Perfect for design work</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
