import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react'; // Icon for separator

interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1.5 text-gray-400 dark:text-gray-600" />
            )}
            {item.link && index < items.length - 1 ? (
              <Link
                to={item.link}
                className="hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className={index === items.length - 1 ? "font-medium text-foreground" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
