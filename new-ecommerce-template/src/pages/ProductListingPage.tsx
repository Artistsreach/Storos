import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProductCard from '@/components/products/ProductCard';
import { Product, Collection } from '@/lib/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollectionHero from '@/components/plp/CollectionHero';
import ProductSortDropdown, { SortOptionValue } from '@/components/plp/ProductSortDropdown';
import Pagination from '@/components/common/Pagination';
import ProductFilters from '@/components/plp/ProductFilters';

// Sample data - will be replaced by mock API / React Query later
const allSampleProducts: Product[] = [
  {
    id: '1', handle: 'sleek-modern-chair', name: 'Sleek Modern Chair', category: 'Living Room', price: 199.99, originalPrice: 249.99,
    images: [{ src: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60', alt: 'Modern Chair Front', isPrimary: true }, { src: 'https://images.unsplash.com/photo-1580480055273-228ff53825b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60', alt: 'Modern Chair Side' }],
    rating: 4.5, reviewCount: 120, isNew: true, tags: ['modern', 'furniture'], shortDescription: 'A very comfortable and stylish modern chair.'
  },
  {
    id: '2', handle: 'minimalist-desk-lamp', name: 'Minimalist Desk Lamp', category: 'Lighting', price: 79.00,
    images: [{ src: 'https://images.unsplash.com/photo-1543198126-a81e40d43b53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFtcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=300&q=60', alt: 'Desk Lamp', isPrimary: true }],
    rating: 4.8, reviewCount: 88, isNew: false, tags: ['minimalist', 'office'], shortDescription: 'Sleek lamp for your workspace.'
  },
  {
    id: '3', handle: 'cozy-knit-throw-blanket', name: 'Cozy Knit Throw Blanket', category: 'Home Decor', price: 59.50, originalPrice: 70.00,
    images: [{ src: 'https://images.unsplash.com/photo-1576402000019-ff3909c25597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmxhbmtldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=300&q=60', alt: 'Cozy Knit Blanket', isPrimary: true }],
    rating: 4.2, reviewCount: 65, tags: ['cozy', 'home'], shortDescription: 'Warm and inviting knit throw.'
  },
  {
    id: '4', handle: 'artisanal-coffee-beans', name: 'Artisanal Coffee Beans', category: 'Pantry', price: 22.00,
    images: [{ src: 'https://images.unsplash.com/photo-1559056199-641a0ac7055e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29mZmVlJTIwYmVhbnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60', alt: 'Coffee Beans', isPrimary: true }],
    rating: 4.9, reviewCount: 210, isNew: true, tags: ['coffee', 'gourmet'], shortDescription: 'Premium quality coffee beans.'
  },
  // Add more products for pagination and filtering demonstration
  {
    id: '5', handle: 'wireless-noise-cancelling-headphones', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 299.00,
    images: [{ src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=300&q=60', alt: 'Headphones', isPrimary: true }],
    rating: 4.7, reviewCount: 150, isNew: true, tags: ['audio', 'tech', 'wireless'], shortDescription: 'Immersive sound experience.'
  },
  {
    id: '6', handle: 'smart-water-bottle', name: 'Smart Water Bottle', category: 'Gadgets', price: 49.99,
    images: [{ src: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8d2F0ZXIlMjBib3R0bGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=300&q=60', alt: 'Smart water bottle', isPrimary: true }],
    rating: 4.3, reviewCount: 75, tags: ['health', 'tech', 'smart device'], shortDescription: 'Stay hydrated intelligently.'
  },
];

const sampleCollection: Collection = {
    id: 'all-products',
    handle: 'all',
    title: 'All Products',
    description: 'Browse through our entire selection of curated goods.',
};

const ProductListingPage: React.FC = () => {
  const { collectionHandle } = useParams<{ collectionHandle?: string }>();
  const location = useLocation(); 

  const [baseProductsForCurrentView, setBaseProductsForCurrentView] = useState<Product[]>(allSampleProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allSampleProducts);
  const [sortedAndPaginatedProducts, setSortedAndPaginatedProducts] = useState<Product[]>([]);

  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOptionValue>("popularity");
  const productsPerPage = 8;

  useEffect(() => {
    let productsForView = allSampleProducts;
    if (collectionHandle && collectionHandle !== 'all') {
      productsForView = allSampleProducts.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === collectionHandle);
      setCurrentCollection({ 
          id: collectionHandle,
          handle: collectionHandle,
          title: collectionHandle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Discover our amazing ${collectionHandle.replace(/-/g, ' ')} products.`
      });
    } else {
      setCurrentCollection(sampleCollection); 
    }
    setBaseProductsForCurrentView(productsForView);
    setFilteredProducts(productsForView); // Initialize filteredProducts based on collection
    setCurrentPage(1); 
  }, [collectionHandle]);

  // Effect for sorting and pagination, depends on filteredProducts
  useEffect(() => {
    let productsToProcess = [...filteredProducts]; 

    switch (sortOption) {
      case "newest":
        productsToProcess.sort((a, b) => (b.isNew === a.isNew)? 0 : b.isNew? 1 : -1);
        break;
      case "price-asc":
        productsToProcess.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        productsToProcess.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        productsToProcess.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popularity": 
        productsToProcess.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        break;
    }
    
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    setSortedAndPaginatedProducts(productsToProcess.slice(indexOfFirstProduct, indexOfLastProduct));
    
  }, [filteredProducts, sortOption, currentPage, productsPerPage]);
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const breadcrumbItems = [
    { label: "Home", link: "/" },
    currentCollection?.handle === 'all' || location.pathname === '/products'
        ? { label: "Products", link: "/products"}
        : { label: "Collections", link: "/collections" }, 
    ...(currentCollection && currentCollection.handle !== 'all' && location.pathname !== '/products'
        ? [{ label: currentCollection.title, link: `/collections/${currentCollection.handle}` }]
        : [])
  ];

  return (
    <div className="space-y-8 md:space-y-12">
      <Breadcrumbs items={breadcrumbItems} className="container mx-auto px-4 pt-4 md:pt-6" />
      {currentCollection && <CollectionHero collection={currentCollection} />}

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 xl:w-1/5 space-y-6">
          <ProductFilters 
            allProducts={baseProductsForCurrentView} 
            onFilterChange={(newlyFilteredProducts) => {
              setFilteredProducts(newlyFilteredProducts);
              setCurrentPage(1); 
            }} 
          />
        </aside>

        <main className="lg:w-3/4 xl:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">
              {currentCollection?.title || "Products"}
            </h1>
            <ProductSortDropdown currentSort={sortOption} onSortChange={setSortOption} />
          </div>
          
          {sortedAndPaginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
              {sortedAndPaginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">No products found matching your criteria.</p>
          )}

          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </main>
      </div>
    </div>
  );
};

export default ProductListingPage;
