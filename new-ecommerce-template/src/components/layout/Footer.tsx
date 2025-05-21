import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Facebook } from 'lucide-react'; // Example social icons

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-screen-2xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand/Logo & About */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold text-foreground">
              ModernStore
            </Link>
            <p className="text-sm text-muted-foreground">
              Elevating your online shopping experience with modern design and cutting-edge technology.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link to="/collections/featured" className="text-muted-foreground hover:text-primary">Featured Collections</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-foreground">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shipping" className="text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/track-order" className="text-muted-foreground hover:text-primary">Track Order</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-foreground">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates and promotions.
            </p>
            {/* Newsletter form placeholder - to be implemented later */}
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button 
                type="submit"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Subscribe
              </button>
            </form>
            <div className="flex space-x-4 pt-2">
              <Link to="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary"><Github size={20} /></Link>
              <Link to="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></Link>
              <Link to="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} ModernStore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
