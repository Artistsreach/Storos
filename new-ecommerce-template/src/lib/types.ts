export interface ProductImage {
  src: string;
  alt: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  handle: string; // for URL slug
  name: string;
  category: string;
  price: number;
  originalPrice?: number; // For sale indication
  images: ProductImage[];
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  tags?: string[];
  shortDescription?: string;
  availableColors?: string[]; // hex codes or names
}

// Adding other common types that will be needed, as per prompt
export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: ProductImage;
  productCount?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: { 
    // Example: could be more complex
    color?: string;
    size?: string;
  };
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  // other user details
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customerDetails: any; // Replace with specific customer details interface
  shippingAddress: any; // Replace with specific address interface
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}
