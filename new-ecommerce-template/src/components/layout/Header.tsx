import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button'; // Changed to relative path
import { useUiStore } from '../../store/uiStore'; // Changed to relative path

interface HeaderProps {
  storeName?: string;
  logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ storeName, logoUrl }) => {
  const { darkMode, toggleDarkMode } = useUiStore();

  const handleScrollToSection = (sectionId: string) => (event: React.MouseEvent) => {
    // event.preventDefault(); // Not strictly needed for Link to hash on same page
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    // Applied a more consistent semi-transparent background and a slightly stronger blur
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/75 backdrop-blur-md">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Logo/Store Name - Links to site root */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName || 'Store Logo'} className="h-8 max-h-full w-auto" /> // Ensure logo respects header height
          ) : (
            <span className="font-bold sm:inline-block text-xl">
              {storeName || 'ModernStore'}
            </span>
          )}
        </Link>
        
        {/* Navigation Links - Centered */}
        {/* Using flex-1 on nav and then an empty spacer div to truly center the nav items if actions on right are few */}
        {/* Or, if nav should just fill space before actions: */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium"> {/* Centering nav links */}
          <Link 
            to="#featured-products" 
            className="text-foreground/60 transition-colors hover:text-foreground/80"
            onClick={handleScrollToSection('featured-products')}
          >
            Products
          </Link>
          <Link 
            to="#featured-collections" 
            className="text-foreground/60 transition-colors hover:text-foreground/80"
            onClick={handleScrollToSection('featured-collections')}
          >
            Collections
          </Link>
          {/* Add more navigation links as needed, e.g., for #testimonials or #value-propositions */}
        </nav>

        {/* Action Icons - Right Aligned */}
        <div className="flex items-center gap-2"> {/* Using gap-2 for consistent spacing */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Link to="/cart" aria-label="Open cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {/* Add badge for cart item count later */}
            </Button>
          </Link>
          <Link to="/account" aria-label="My account">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
