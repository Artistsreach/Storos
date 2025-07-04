import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Search,
  Star,
  ShoppingCart,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface AliExpressProduct {
  item_id: string;
  title: string;
  image: string;
  price: {
    app: {
      formatted_price: string;
    };
  };
  evaluation: {
    rating: number;
  };
  trade: {
    sold_count: number;
  };
  store: {
    name: string;
  };
  shipping: {
    is_free_shipping: boolean;
  };
}

interface AliExpressSearchProps {
  className?: string;
}

const AliExpressSearch: React.FC<AliExpressSearchProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [products, setProducts] = useState<AliExpressProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://aliexpress-datahub.p.rapidapi.com/item_search_3?q=${encodeURIComponent(searchQuery)}&page=1&sort=default`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key":
              "270de00b86msh428afc76ee3eb99p10aef1jsnce9aa1302e03",
            "x-rapidapi-host": "aliexpress-datahub.p.rapidapi.com",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.result && data.result.items) {
        setProducts(data.result.items);
      } else {
        setProducts([]);
        setError("No products found");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchProducts();
    }
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return <div className="flex">{stars}</div>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Product Search
        </h2>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={searchProducts}
            disabled={isLoading || !searchQuery.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Searching products...
          </p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card
              key={product.item_id}
              className="overflow-hidden hover:shadow-xl transition-shadow bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-md"
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium line-clamp-2 h-12">
                    {product.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {renderStars(product.evaluation?.rating || 0)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.evaluation?.rating?.toFixed(1) || "N/A"})
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {product.trade?.sold_count || 0} sold
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {product.price?.app?.formatted_price || "Price unavailable"}
                  </div>
                  {product.shipping?.is_free_shipping && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                    >
                      Free Shipping
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500 truncate">
                  {product.store?.name || "Unknown store"}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                  onClick={() =>
                    window.open(
                      `https://www.aliexpress.com/item/${product.item_id}.html`,
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Product
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AliExpressSearch;
