import { ArrowRight, Download, Zap } from "lucide-react";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";

const ImportIntegration = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Import Your Existing Store
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Already have a store on Shopify or BigCommerce? Seamlessly migrate your data 
            and get a head start with FreshFront.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src="/lovable-uploads/e215ed9a-532a-4f35-8716-316c9e8f7189.png" 
                    alt="Shopify" 
                    className="h-8"
                  />
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                  <img 
                    src="/lovable-uploads/b1476f78-ba6d-46f0-8702-c0fb4a1a6c3a.png" 
                    alt="FreshFront" 
                    className="h-8"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">From Shopify</h3>
                <p className="text-gray-600 mb-4">Import your store details, products, collections, and customer data with one click.</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Store information & branding
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Product catalog & images
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Collections & categories
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src="/lovable-uploads/db1ac7fe-3e40-49df-b8e9-3ce44b65bab7.png" 
                    alt="BigCommerce" 
                    className="h-8"
                  />
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                  <img 
                    src="/lovable-uploads/b1476f78-ba6d-46f0-8702-c0fb4a1a6c3a.png" 
                    alt="FreshFront" 
                    className="h-8"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">From BigCommerce</h3>
                <p className="text-gray-600 mb-4">Migrate your entire BigCommerce store setup to FreshFront effortlessly.</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Store configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Product variations & options
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Customer reviews & data
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="animate-fade-in delay-300">
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white">
              <CardContent className="p-12 text-center">
                <Download className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h3 className="text-3xl font-bold mb-4">Quick Migration</h3>
                <p className="text-emerald-100 mb-8 text-lg">
                  Don't start from scratch. Import your existing store and enhance it with 
                  FreshFront's AI-powered features.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-100">
                    <Zap className="w-5 h-5" />
                    <span>Automated data transfer</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-100">
                    <Zap className="w-5 h-5" />
                    <span>Preserved SEO rankings</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-100">
                    <Zap className="w-5 h-5" />
                    <span>Zero downtime migration</span>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="mt-8 bg-white text-emerald-600 hover:bg-gray-100"
                >
                  Start Import Process
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImportIntegration;
