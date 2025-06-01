import { Camera, Video, Share2, Wand2 } from "lucide-react";
import { Card, CardContent } from "components/ui/card";

const ContentCreator = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            AI Content Creator
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate stunning visuals and create compelling social media content 
            that perfectly represents your brand and products.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Image Generation</h3>
              <p className="text-gray-600">Create product images, lifestyle photos, and marketing visuals with AI.</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in delay-100">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Video className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Video Content</h3>
              <p className="text-gray-600">Generate engaging video content for social media and product showcases.</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in delay-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Share2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Media Ads</h3>
              <p className="text-gray-600">Create targeted advertisements optimized for different social platforms.</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white animate-fade-in delay-300">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Wand2 className="w-8 h-8" />
                  <h3 className="text-3xl font-bold">Intuitive Creator Interface</h3>
                </div>
                <p className="text-purple-100 text-lg mb-8">
                  Easy-to-use tools that let you create professional content without design experience. 
                  Perfect for entrepreneurs and small businesses.
                </p>
                <ul className="space-y-3 text-purple-100">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                    Drag-and-drop interface
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                    Brand-consistent styling
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                    One-click publishing
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="h-32 bg-white/20 rounded-lg flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white/60" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-3 bg-white/30 rounded flex-1"></div>
                    <div className="h-3 bg-white/30 rounded w-20"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-purple-400 rounded px-4 flex items-center text-xs font-medium">Generate</div>
                    <div className="h-8 bg-white/20 rounded px-4 flex items-center text-xs">Upload</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContentCreator;
