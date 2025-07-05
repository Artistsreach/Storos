import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import ReactMarkdown from 'react-markdown';
import { Button } from '../ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';

const ProductComparison = ({ products, conclusion }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Product Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {products.map((product, index) => {
          const isWishlisted = isInWishlist(product.productId);
          const handleWishlistClick = (e) => {
            e.stopPropagation();
            if (isWishlisted) {
              removeFromWishlist(product.productId);
            } else {
              addToWishlist({ ...product, product_id: product.productId });
            }
          };

          return (
            <div key={index} className="mb-6">
              <div className="flex flex-col items-center mb-2">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <h3 className="text-sm font-semibold mt-2">{product.name}</h3>
                <div className="flex gap-2 mt-2">
                  {product.productUrl && (
                    <Button size="sm" variant="outline" onClick={() => window.open(product.productUrl, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleWishlistClick}>
                    <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                    Add
                  </Button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{product.comparison}</ReactMarkdown>
              </div>
            </div>
          );
        })}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Conclusion</h3>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{conclusion}</ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductComparison;
