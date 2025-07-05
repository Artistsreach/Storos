import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Star, ExternalLink, Heart } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useWishlist } from '../../contexts/WishlistContext';

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating);
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

const AliExpressProductCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.item.itemId);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.item.itemId);
    } else {
      addToWishlist({ ...product, product_id: product.item.itemId });
    }
  };

  return (
    <Card key={product.item.itemId} className="relative overflow-hidden border border-border/70 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/10 bg-card/70 backdrop-blur-sm">
      <Badge className="absolute top-2 left-2 bg-orange-500 text-white z-10">AliExpress</Badge>
      <Button
        size="icon"
        className="absolute top-2 right-2 bg-transparent hover:bg-transparent text-red-500 z-10"
        onClick={handleWishlistClick}
      >
        <Heart className={isWishlisted ? 'fill-current' : ''} />
      </Button>
      <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={product.item.image}
          alt={product.item.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium line-clamp-2 h-12">
          {product.item.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded-md">${product.item.sku.def.promotionPrice}</p>
          {product.item.averageStarRate && <StarRating rating={product.item.averageStarRate} />}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-black text-white dark:bg-white dark:text-black"
          onClick={() =>
            window.open(
              `https:${product.item.itemUrl}`,
              "_blank",
            )
          }
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Product
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AliExpressProductCard;
