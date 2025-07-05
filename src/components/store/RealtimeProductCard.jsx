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

const RealtimeProductCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.product_id);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.product_id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Card key={product.product_id} className="relative overflow-hidden hover:shadow-xl transition-shadow bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-md">
      <Badge className="absolute top-2 left-2 bg-purple-500 text-white z-10">Google</Badge>
      <Button
        size="icon"
        className="absolute top-2 right-2 bg-transparent hover:bg-transparent text-red-500 z-10"
        onClick={handleWishlistClick}
      >
        <Heart className={isWishlisted ? 'fill-current' : ''} />
      </Button>
      <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={product.product_photos && product.product_photos.length > 0 ? product.product_photos[0] : ''}
          alt={product.product_title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium line-clamp-2 h-12">
          {product.product_title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded-md">{product.offer?.price || 'N/A'}</p>
          {product.product_rating && <StarRating rating={product.product_rating} />}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-black text-white dark:bg-white dark:text-black"
          onClick={() =>
            window.open(
              product.product_page_url,
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

export default RealtimeProductCard;
