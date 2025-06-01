// Modern Template Components
export { default as StoreHeader } from './layout/StoreHeader';
export { default as Footer } from './layout/Footer';
export { default as StoreHero } from './sections/StoreHero';
export { default as StoreFeatures } from './sections/StoreFeatures';
export { default as StoreCollections } from './sections/StoreCollections';
export { default as ProductGrid } from './sections/ProductGrid';
export { default as ProductCard } from './product/ProductCard';

// Template configuration
export const modernTemplate = {
  name: 'Modern',
  description: 'A cutting-edge template with Three.js elements, advanced animations, and modern UI/UX',
  features: [
    'Three.js 3D elements and animations',
    'Advanced scroll-triggered animations',
    'Glassmorphism design elements',
    'Interactive particle effects',
    'Enhanced product cards with 3D hover effects',
    'Modern typography and spacing',
    'Responsive design with mobile-first approach',
    'Dark mode support',
    'Parallax scrolling effects',
    'Smooth transitions and micro-interactions'
  ],
  components: {
    header: 'StoreHeader',
    footer: 'Footer',
    hero: 'StoreHero',
    productGrid: 'ProductGrid',
    productCard: 'ProductCard',
    collections: 'StoreCollections'
  },
  theme: {
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    accentColor: '#06B6D4',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    borderRadius: '1.5rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  }
};
