import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from '@/lib/utils';

interface ProductFiltersProps {
  allProducts: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
  className?: string;
}

// Helper to get unique values for a key
const getUniqueValues = (products: Product[], key: keyof Product): string[] => {
  const values = products.map(p => p[key]);
  // Filter out undefined or null, then get unique strings
  return Array.from(new Set(values.filter(v => v != null).map(v => String(v).trim()))).sort();
};


const ProductFilters: React.FC<ProductFiltersProps> = ({
  allProducts,
  onFilterChange,
  className,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // Default full range
  const [minPossiblePrice, setMinPossiblePrice] = useState(0);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);
  
  const availableCategories = useMemo(() => getUniqueValues(allProducts, 'category'), [allProducts]);

  useEffect(() => {
    if (allProducts.length > 0) {
      const prices = allProducts.map(p => p.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinPossiblePrice(min);
      setMaxPossiblePrice(max);
      setPriceRange([min, max]); // Initialize slider to full range of available products
    }
  }, [allProducts]);

  useEffect(() => {
    let filtered = [...allProducts];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Price range filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    onFilterChange(filtered);
  }, [selectedCategories, priceRange, allProducts, onFilterChange]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    if (allProducts.length > 0) { // Reset price to full range of current products
        const prices = allProducts.map(p => p.price);
        setPriceRange([Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]);
    } else { // Fallback if no products
        setPriceRange([0,1000]);
    }
  };
  
  const hasActiveFilters = selectedCategories.length > 0 || 
                           (allProducts.length > 0 && (priceRange[0] > minPossiblePrice || priceRange[1] < maxPossiblePrice));


  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} disabled={!hasActiveFilters}>
          <X className="mr-1.5 h-4 w-4" /> Clear All
        </Button>
      </div>

      {/* Categories Filter */}
      {availableCategories.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2 text-sm">Category</h4>
          <div className="space-y-2">
            {availableCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <label
                  htmlFor={`cat-${category}`}
                  className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      {allProducts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2 text-sm">Price Range</h4>
          <Slider
            min={minPossiblePrice}
            max={maxPossiblePrice}
            step={1} // Or a more appropriate step like 5 or 10
            value={priceRange}
            onValueChange={handlePriceChange}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(priceRange[0])}</span>
            <span>{formatCurrency(priceRange[1])}</span>
          </div>
        </div>
      )}
      
      {/* Placeholder for Color Filter */}
      {/* <div className="mb-6">
        <h4 className="font-medium mb-2 text-sm">Color</h4>
        <p className="text-xs text-muted-foreground">Color swatches placeholder</p>
      </div> */}

      {/* Placeholder for Rating Filter */}
      {/* <div className="mb-6">
        <h4 className="font-medium mb-2 text-sm">Rating</h4>
        <p className="text-xs text-muted-foreground">Star rating filter placeholder</p>
      </div> */}
      
      {/* Display active filters (simple version) */}
      {selectedCategories.length > 0 && (
        <div className="mt-6 pt-4 border-t">
        <h4 className="font-medium mb-2 text-sm">Active Filters:</h4>
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(cat => (
            <span key={`active-cat-${cat}`} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full flex items-center">
              {cat}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1.5 p-0" onClick={() => handleCategoryChange(cat)}>
                <X size={12} />
              </Button>
            </span>
          ))}
          { (priceRange[0] > minPossiblePrice || priceRange[1] < maxPossiblePrice) &&
            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full flex items-center">
              Price: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1.5 p-0" onClick={() => setPriceRange([minPossiblePrice, maxPossiblePrice])}>
                <X size={12} />
              </Button>
            </span>
          }
        </div>
      </div>
    )}
    </div>
  );
};

export default ProductFilters;
