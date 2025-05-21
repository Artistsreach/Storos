import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming Select components are in this path
import { ListFilter } from 'lucide-react';

export type SortOptionValue = "newest" | "price-asc" | "price-desc" | "rating" | "popularity";

interface SortOption {
  value: SortOptionValue;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Average Rating" },
];

interface ProductSortDropdownProps {
  currentSort: SortOptionValue;
  onSortChange: (value: SortOptionValue) => void;
  className?: string;
}

const ProductSortDropdown: React.FC<ProductSortDropdownProps> = ({
  currentSort,
  onSortChange,
  className,
}) => {
  return (
    <div className={className}>
      <Select value={currentSort} onValueChange={(value) => onSortChange(value as SortOptionValue)}>
        <SelectTrigger className="w-[180px] h-10 text-sm">
          <ListFilter className="mr-2 h-4 w-4 opacity-70" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSortDropdown;
