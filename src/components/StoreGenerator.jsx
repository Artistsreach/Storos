
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input'; // Added Input
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const promptExamples = [
  "Create a luxury jewelry store called 'Elegance' with diamond rings and gold necklaces, featuring a dark, sophisticated theme.",
  "Build a tech gadget store named 'FutureTech' with the latest smartphones and accessories, using a futuristic blue and silver color scheme.",
  "Design an organic food market 'GreenHarvest' with fresh produce and healthy snacks, emphasizing natural textures and earthy tones.",
  "Make a trendy fashion boutique 'Urban Threads' with summer dresses and casual wear, aiming for a bright, minimalist aesthetic."
];

const StoreGenerator = () => {
  const [storeName, setStoreName] = useState(''); // Added storeName state
  const [prompt, setPrompt] = useState('');
  const [selectedExample, setSelectedExample] = useState(null);
  const { generateStore, isGenerating } = useStore();

  const handleExampleClick = (index) => {
    setSelectedExample(index);
    // Extract name from example if possible, or clear name field
    const examplePrompt = promptExamples[index];
    // Basic extraction: "store called 'NAME'" or "store named 'NAME'"
    const nameMatch = examplePrompt.match(/store (?:called|named) '([^']+)'/i);
    if (nameMatch && nameMatch[1]) {
      setStoreName(nameMatch[1]);
      // Set prompt to the rest of the example, or the full example if name extraction is complex
      // For simplicity, we can let user adjust the prompt after selecting an example.
      // Or, remove the name part from the prompt if we are confident.
      // For now, let's set the full prompt and let user refine.
      setPrompt(examplePrompt); 
    } else {
      setStoreName(''); // Clear name if not found in example
      setPrompt(examplePrompt);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim() || !prompt.trim()) return;
    // Pass storeName and prompt to the generateStore function
    // The generateStore function in StoreContext will need to handle these two arguments
    await generateStore(prompt, storeName); 
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Generate Store with AI</CardTitle>
          <CardDescription>
            Enter your store name, then describe its products, style, and any other details. The AI will bring it to life.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Store Name
              </label>
              <Input
                id="storeName"
                type="text"
                placeholder="e.g., BookNook, FutureTech, Elegance"
                className="text-base"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div>
              <label htmlFor="storePrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                AI Prompt (Store Details)
              </label>
              <Textarea
                id="storePrompt"
                placeholder="e.g., 'A vibrant bookstore specializing in fantasy novels and graphic novels. Use a cozy, warm color palette with lots of wood textures. Feature at least 6 book products.'"
                className="min-h-[120px] text-base resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            </div> {/* Closing div for the AI Prompt section */}
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Or try one of these examples for inspiration:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {promptExamples.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={selectedExample === index ? "default" : "outline"}
                    className="h-auto py-2 px-3 justify-start text-left text-sm font-normal"
                    onClick={() => handleExampleClick(index)}
                    disabled={isGenerating}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            disabled={!storeName.trim() || !prompt.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Store...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate AI Store
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default StoreGenerator;
