import React from 'react';
import ProductCard from '../components/products/ProductCard'; // Changed to relative
import { Product, Collection, Review } from '../lib/types'; // Changed to relative
import HeroSection from '../components/home/HeroSection'; // Changed to relative
import FeaturedCollections from '../components/home/FeaturedCollections'; // Changed to relative
import ValuePropositions from '../components/home/ValuePropositions'; // Changed to relative
import Testimonials from '../components/home/Testimonials'; // Changed to relative
import NewsletterSignup from '../components/home/NewsletterSignup'; // Changed to relative

// Sample data - this will be replaced by props or a new context
const sampleProductsFallback: Product[] = [
  {
    id: '1',
    handle: 'sleek-modern-chair',
    name: 'Sleek Modern Chair',
    category: 'Living Room',
    price: 199.99,
    originalPrice: 249.99,
    images: [
      { src: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60', alt: 'Modern Chair Front', isPrimary: true },
      { src: 'https://images.unsplash.com/photo-1580480055273-228ff53825b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60', alt: 'Modern Chair Side' },
    ],
    rating: 4.5,
    reviewCount: 120,
    isNew: true,
    tags: ['modern', 'furniture'],
    shortDescription: 'A very comfortable and stylish modern chair for your living space.'
  },
  {
    id: '2',
    handle: 'minimalist-desk-lamp',
    name: 'Minimalist Desk Lamp',
    category: 'Lighting',
    price: 79.00,
    images: [
      { src: 'https://images.unsplash.com/photo-1543198126-a81e40d43b53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFtcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=300&q=60', alt: 'Desk Lamp', isPrimary: true },
    ],
    rating: 4.8,
    reviewCount: 88,
    isNew: false,
    tags: ['minimalist', 'office'],
    shortDescription: 'Brighten up your workspace with this sleek minimalist desk lamp.'
  },
  // Add 2 more sample products for a total of 4 for the grid
  {
    id: '3',
    handle: 'cozy-knit-throw-blanket',
    name: 'Cozy Knit Throw Blanket',
    category: 'Home Decor',
    price: 59.50,
    originalPrice: 70.00,
    images: [
      { src: 'https://images.unsplash.com/photo-1576402000019-ff3909c25597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmxhbmtldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=300&q=60', alt: 'Cozy Knit Blanket', isPrimary: true },
    ],
    rating: 4.2,
    reviewCount: 65,
    isNew: false,
    tags: ['cozy', 'home', 'decor'],
    shortDescription: 'A warm and inviting knit throw, perfect for chilly evenings.'
  },
  {
    id: '4',
    handle: 'artisanal-coffee-beans',
    name: 'Artisanal Coffee Beans',
    category: 'Pantry',
    price: 22.00,
    images: [
      { src: 'https://images.unsplash.com/photo-1559056199-641a0ac7055e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29mZmVlJTIwYmVhbnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60', alt: 'Coffee Beans', isPrimary: true },
    ],
    rating: 4.9,
    reviewCount: 210,
    isNew: true,
    tags: ['coffee', 'gourmet', 'beverage'],
    shortDescription: 'Premium quality, ethically sourced artisanal coffee beans.'
  }
];

// Sample collections and reviews can remain as fallbacks or be removed if data comes from props
const sampleCollectionsFallback: Collection[] = [
  {
    id: 'coll1',
    handle: 'summer-vibes',
    title: 'Summer Vibes',
    description: 'Bright and breezy styles for the sunny season.',
    image: { src: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHN1bW1lciUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60', alt: 'Summer fashion collection' },
    productCount: 25,
  },
  {
    id: 'coll2',
    handle: 'work-from-home-essentials',
    title: 'Work From Home Essentials',
    description: 'Comfortable and stylish gear for your home office.',
    image: { src: 'https://images.unsplash.com/photo-1586782248779-544a15515689?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG9tZSUyMG9mZmljZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60', alt: 'Work from home setup' },
    productCount: 18,
  },
  {
    id: 'coll3',
    handle: 'outdoor-adventures',
    title: 'Outdoor Adventures',
    description: 'Gear up for your next exploration in the great outdoors.',
    image: { src: 'https://images.unsplash.com/photo-1500530855697-b586789ba3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b3V0ZG9vcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60', alt: 'Outdoor adventure scene' },
    productCount: 32,
  },
];

const sampleReviewsFallback: Review[] = [
  {
    id: 'review1',
    productId: '1', // Relates to a sample product if needed, or can be generic
    userId: 'user123',
    userName: 'Sarah L.',
    rating: 5,
    comment: "Absolutely love the quality and design! My new favorite chair. Delivery was super fast too.",
    createdAt: '2024-04-15T10:30:00Z',
  },
  {
    id: 'review2',
    productId: '2',
    userId: 'user456',
    userName: 'Mike P.',
    rating: 4,
    comment: "Great lamp, very stylish and provides excellent light for my desk. A bit smaller than I expected but still great.",
    createdAt: '2024-04-18T14:00:00Z',
  },
  {
    id: 'review3',
    productId: '3',
    userId: 'user789',
    userName: 'Jessica B.',
    rating: 5,
    comment: "This blanket is so cozy and soft! Perfect for movie nights. The color is beautiful too.",
    createdAt: '2024-04-20T09:15:00Z',
  },
];

interface HomePageProps {
  products?: Product[];
  collections?: Collection[];
  reviews?: Review[];
  storeName?: string;
  heroData?: { // Added heroData to props
    title?: string;
    subtitle?: string;
    videoUrl?: string;
    imageUrl?: string;
    // Potentially CTA texts/links if they are dynamic
  };
}

const HomePage: React.FC<HomePageProps> = ({ 
  products, 
  collections, 
  reviews, 
  storeName,
  heroData // Destructure heroData
}) => {
  const displayProducts = products && products.length > 0 ? products : sampleProductsFallback;
  const displayCollections = collections && collections.length > 0 ? collections : sampleCollectionsFallback;
  const displayReviews = reviews && reviews.length > 0 ? reviews : sampleReviewsFallback;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Pass destructured heroData props to HeroSection */}
      <HeroSection {...heroData} /> 
      
      {/* Added pt-6 for padding above the title */}
      <section id="featured-products" className="container mx-auto px-4 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10 md:mb-12">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {displayProducts.slice(0, 4).map((product) => ( // Display up to 4 featured products
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <FeaturedCollections collections={displayCollections} />

      <ValuePropositions />

      <Testimonials testimonials={displayReviews} />

      <NewsletterSignup />
    </div>
  );
};

export default HomePage;
