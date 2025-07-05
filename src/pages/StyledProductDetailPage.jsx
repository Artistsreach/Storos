import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { useSwipeable } from 'react-swipeable';

const StyledProductDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, product, index } = location.state || {};
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateAnalysis = async () => {
    if (product && !product.description) {
      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const model = "gemini-2.0-flash-lite";
        const prompt = `Provide a detailed analysis of the following product: ${JSON.stringify(product)}`;
        
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction: "You are a helpful product analyst. Provide a detailed and insightful analysis of the product data provided.",
          },
        });

        setAnalysis(response.text);
      } catch (error) {
        console.error("Error generating product analysis:", error);
        setAnalysis("Sorry, I was unable to analyze this product.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    generateAnalysis();
  }, [product]);

  const handleSwipe = (direction) => {
    const newIndex = direction === 'left' ? index + 1 : index - 1;
    if (newIndex >= 0 && newIndex < products.length) {
      navigate('/product-detail', { state: { products, product: products[newIndex], index: newIndex }, replace: true });
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Product not found. <Link to="/search" className="text-blue-400 hover:underline">Return to search</Link></p>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return <span className="text-gray-400">No rating available</span>;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-6 h-6 ${i < Math.round(numRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
        />
      );
    }
    return stars;
  };

  const imageUrl = product.product_photo || product.image || (product.item && product.item.image) || (product.product_photos && product.product_photos[0]);
  const title = product.product_title || product.title || product.name;
  const rating = product.product_rating || product.rating;
  const numRatings = product.product_num_ratings || product.reviews;
  const price = product.product_price || product.price;
  const url = product.product_url || product.url;
  const description = product.product_description || product.description;

  return (
    <div {...handlers} className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <Button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-black/75 text-white dark:text-white"
        size="icon"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      {/* Background Image with Blur and Gradient */}
      {imageUrl && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        >
          <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-xl"></div>
          <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen p-8">
        {imageUrl && (
            <div className="w-full md:w-1/3 flex justify-center">
            <img
                src={imageUrl}
                alt={title}
                className="rounded-lg shadow-2xl max-w-sm w-full object-contain"
            />
            </div>
        )}
        <div className="w-full md:w-2/3 md:pl-12 mt-8 md:mt-0 text-center md:text-left">
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className={`font-bold mb-4 inline-block ${
              title.length > 50 ? 'text-3xl marquee' : 'text-4xl md:text-5xl'
            }`}>{title}</h1>
          </div>
          
          {rating && (
            <div className="flex items-center justify-center md:justify-start mb-4">
              {renderStars(rating)}
              <span className="ml-3 text-xl">{rating} ({numRatings} reviews)</span>
            </div>
          )}

          <p className="text-lg text-gray-300 mb-6">{product.sales_volume || 'Bestseller'}</p>
          
          {price && <p className="text-2xl font-semibold mb-6">{price}</p>}

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-8">
            {url && (
                <Button asChild size="lg" className="bg-white hover:bg-gray-200 text-black">
                <a href={url} target="_blank" rel="noopener noreferrer">
                    View Product
                </a>
                </Button>
            )}
          </div>

          <div className="prose prose-invert text-gray-300 text-left">
            {description ? <p>{description}</p> : (
              isLoading ? <p>Analyzing product...</p> : (
                <>
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                  {!analysis && (
                    <Button onClick={generateAnalysis} className="mt-4">
                      Analyze Product
                    </Button>
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyledProductDetailPage;
